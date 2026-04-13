'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useUserData } from '@/components/providers/UserDataProvider';
import { getAudioStreamUrl, needsProxy } from '@/lib/audio-url';
import type { 
  RadioStation, 
  NetworkStatus, 
  BufferState, 
  ReplayBufferState, 
  PlaybackError,
  NetworkQuality 
} from '@/types/radio';

// ==================== CONFIGURATION ====================
const BUFFER_CONFIG = {
  // Pre-buffer settings - increased for smoother playback
  MIN_BUFFER_SECONDS: 10,
  MAX_BUFFER_SECONDS: 30,
  TARGET_BUFFER_SECONDS: 20,
  
  // Replay buffer settings
  REPLAY_MAX_DURATION: 180, // 3 minutes
  REPLAY_CHUNK_SIZE: 1, // seconds per chunk
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY_BASE: 1000, // ms
  
  // Quality thresholds
  QUALITY_THRESHOLDS: {
    excellent: { minDownlink: 10, maxRtt: 100 },
    good: { minDownlink: 5, maxRtt: 200 },
    fair: { minDownlink: 2, maxRtt: 400 },
    poor: { minDownlink: 0.5, maxRtt: 800 },
  },
  
  // Bitrate recommendations based on network
  BITRATE_BY_QUALITY: {
    excellent: [320, 256, 192, 128],
    good: [192, 128, 96],
    fair: [128, 96, 64],
    poor: [64, 48, 32],
    offline: [],
  },
};

// User-friendly error messages
const ERROR_MESSAGES = {
  network: {
    en: 'Network connection lost. Trying to reconnect...',
    ar: 'انقطع الاتصال. جاري إعادة المحاولة...',
  },
  stream: {
    en: 'Station is temporarily unavailable',
    ar: 'المحطة غير متاحة حالياً',
  },
  codec: {
    en: 'This audio format is not supported',
    ar: 'هذا الصيغة الصوتية غير مدعومة',
  },
  unknown: {
    en: 'An error occurred. Please try again',
    ar: 'حدث خطأ. يرجى المحاولة مرة أخرى',
  },
};

export interface EnhancedAudioState {
  // Core state
  isPlaying: boolean;
  isLoading: boolean;
  isBuffering: boolean;
  
  // Network state
  networkStatus: NetworkStatus;
  isOnline: boolean;
  connectionQuality: NetworkQuality;
  
  // Buffer state
  bufferState: BufferState | null;
  replayState: ReplayBufferState | null;
  
  // Error state
  error: PlaybackError | null;
  retryCount: number;
  
  // Replay features
  canReplay: boolean;
  replayPosition: number;
  maxReplaySeconds: number;
  
  // Quality
  currentBitrate: number;
  recommendedBitrate: number;
}

export function useEnhancedAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const replayBufferRef = useRef<ArrayBuffer[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const networkCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Server-synced session tracking
  const { startSession: startServerSession, endSession: endServerSession } = useUserData();
  
  const {
    currentStation,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    isLoading,
    setIsLoading,
    language,
    networkStatus,
    setNetworkStatus,
    updateNetworkStatus,
    setBufferState,
    setReplayState,
    setPlaybackError,
    retryCount,
    incrementRetryCount,
    resetRetryCount,
    replayBufferEnabled,
    replayBufferMaxDuration,
    addToHistory,
    startListeningSession,
    endListeningSession,
  } = useRadioStore();
  
  // Local state
  const [isBuffering, setIsBuffering] = useState(false);
  const [replayPosition, setReplayPosition] = useState(0);
  const [currentBitrate, setCurrentBitrate] = useState(128);
  
  // ==================== NETWORK MONITORING ====================
  
  const checkNetworkQuality = useCallback((): NetworkQuality => {
    if (typeof navigator === 'undefined') return 'good';
    
    const isOnline = navigator.onLine;
    if (!isOnline) return 'offline';
    
    const connection = (navigator as Navigator & { 
      connection?: { 
        effectiveType?: string; 
        downlink?: number; 
        rtt?: number;
        saveData?: boolean;
      } 
    }).connection;
    
    if (!connection) return 'good';
    
    const { effectiveType, downlink = 10, rtt = 50, saveData } = connection;
    
    if (saveData) return 'poor';
    
    if (effectiveType === '4g') {
      if (downlink >= 10 && rtt <= 100) return 'excellent';
      if (downlink >= 5) return 'good';
      return 'fair';
    }
    
    if (effectiveType === '3g') {
      if (downlink >= 2) return 'fair';
      return 'poor';
    }
    
    if (effectiveType === '2g' || effectiveType === 'slow-2g') {
      return 'poor';
    }
    
    return 'good';
  }, []);
  
  const updateNetworkStatusHandler = useCallback(() => {
    const quality = checkNetworkQuality();
    const isOnline = navigator.onLine;
    
    const connection = (navigator as Navigator & { 
      connection?: { 
        effectiveType?: string; 
        downlink?: number; 
        rtt?: number;
        type?: string;
      } 
    }).connection;
    
    setNetworkStatus({
      isOnline,
      quality,
      connectionType: (connection?.type as NetworkStatus['connectionType']) || 'unknown',
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 50,
    });
  }, [checkNetworkQuality, setNetworkStatus]);
  
  // ==================== STREAM QUALITY ADAPTATION ====================
  
  const getRecommendedBitrate = useCallback((quality: NetworkQuality): number => {
    const bitrates = BUFFER_CONFIG.BITRATE_BY_QUALITY[quality];
    return bitrates.length > 0 ? bitrates[0] : 128;
  }, []);
  
  const findBestStream = useCallback((station: RadioStation, quality: NetworkQuality): string | null => {
    // Return the URL directly - proxy is handled in playStation
    return station.url_resolved || station.url || null;
  }, []);
  
  // ==================== BUFFERING SYSTEM ====================
  
  const handleBuffering = useCallback(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    const buffered = audio.buffered;
    
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const bufferedSeconds = bufferedEnd - audio.currentTime;
      
      setBufferState({
        isBuffering: bufferedSeconds < BUFFER_CONFIG.MIN_BUFFER_SECONDS,
        bufferProgress: Math.min(100, (bufferedSeconds / BUFFER_CONFIG.TARGET_BUFFER_SECONDS) * 100),
        bufferedSeconds,
        targetBufferSeconds: BUFFER_CONFIG.TARGET_BUFFER_SECONDS,
        replayBufferDuration: replayBufferRef.current.length * BUFFER_CONFIG.REPLAY_CHUNK_SIZE,
      });
      
      setIsBuffering(bufferedSeconds < BUFFER_CONFIG.MIN_BUFFER_SECONDS);
    }
  }, [setBufferState]);
  
  // ==================== REPLAY BUFFER SYSTEM ====================
  
  const storeReplayChunk = useCallback((chunk: ArrayBuffer) => {
    if (!replayBufferEnabled) return;
    
    const maxChunks = Math.floor(replayBufferMaxDuration / BUFFER_CONFIG.REPLAY_CHUNK_SIZE);
    
    replayBufferRef.current.push(chunk);
    
    // Remove old chunks if exceeding max duration
    while (replayBufferRef.current.length > maxChunks) {
      replayBufferRef.current.shift();
    }
  }, [replayBufferEnabled, replayBufferMaxDuration]);
  
  const startReplay = useCallback((secondsFromLive: number) => {
    if (!replayBufferEnabled || replayBufferRef.current.length === 0) return;
    
    const maxSeconds = replayBufferRef.current.length * BUFFER_CONFIG.REPLAY_CHUNK_SIZE;
    const position = Math.min(secondsFromLive, maxSeconds);
    
    setReplayPosition(position);
    
    setReplayState({
      isReplaying: true,
      replayPosition: position,
      maxReplaySeconds: maxSeconds,
    });
  }, [replayBufferEnabled, setReplayState]);
  
  const stopReplay = useCallback(() => {
    setReplayState(null);
    setReplayPosition(0);
  }, [setReplayState]);
  
  // ==================== ERROR HANDLING & RECONNECT ====================
  
  const handleError = useCallback((error: Event) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const errorCode = audio.error?.code;
    let errorType: PlaybackError['type'] = 'unknown';
    
    if (errorCode === MediaError.MEDIA_ERR_NETWORK) {
      errorType = 'network';
    } else if (errorCode === MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
      errorType = 'codec';
    } else if (errorCode === MediaError.MEDIA_ERR_DECODE) {
      errorType = 'stream';
    }
    
    const playbackError: PlaybackError = {
      type: errorType,
      message: ERROR_MESSAGES[errorType].en,
      messageAr: ERROR_MESSAGES[errorType].ar,
      retryable: errorType === 'network' && retryCount < BUFFER_CONFIG.MAX_RETRIES,
      retryCount,
      maxRetries: BUFFER_CONFIG.MAX_RETRIES,
    };
    
    setPlaybackError(playbackError);
    
    // Auto-retry for network errors
    if (errorType === 'network' && retryCount < BUFFER_CONFIG.MAX_RETRIES) {
      const delay = BUFFER_CONFIG.RETRY_DELAY_BASE * Math.pow(2, retryCount);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        incrementRetryCount();
        // Attempt reconnect
        if (currentStation) {
          playStation(currentStation);
        }
      }, delay);
    }
    
    setIsPlaying(false);
    setIsLoading(false);
  }, [retryCount, currentStation, setPlaybackError, incrementRetryCount, setIsPlaying, setIsLoading]);
  
  // ==================== PLAYBACK CONTROLS ====================
  
  const playStation = useCallback((station: RadioStation) => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    // Get the correct URL (with proxy for HTTP streams)
    const streamUrl = getAudioStreamUrl(station);
    
    // Validate stream URL
    if (!streamUrl) {
      console.error('[Player] No valid stream URL for:', station.name);
      setPlaybackError({ type: 'format', message: 'Invalid stream URL', recoverable: false });
      return;
    }
    
    // Check if URL changed (prevent unnecessary reload)
    const currentSrc = audio.currentSrc || audio.src;
    const urlChanged = !currentSrc || !currentSrc.includes(streamUrl.split('?')[0]);
    
    console.log('[Player] Playing:', station.name, '| Proxied:', streamUrl.startsWith('/api/stream'));
    
    // Set current bitrate
    setCurrentBitrate(station.bitrate);
    
    // Reset error state
    setPlaybackError(null);
    setIsLoading(true);
    setIsBuffering(true);
    
    // Start session tracking (local + server)
    startListeningSession(station, useRadioStore.getState().contentFilter);
    startServerSession(station);
    
    // Only reload if URL changed
    if (urlChanged) {
      // Remove crossOrigin for HTTP streams (breaks playback)
      audio.removeAttribute('crossOrigin');
      audio.src = streamUrl;
      audio.volume = volume;
      audio.preload = 'none'; // Don't preload - better for live streams
    }
    
    audio.play()
      .then(() => {
        setIsPlaying(true);
        setIsLoading(false);
        resetRetryCount();
      })
      .catch((err) => {
        console.error('[Player] Playback error:', err);
        handleError(new Event('error'));
      });
  }, [volume, setPlaybackError, setIsPlaying, setIsLoading, startListeningSession, startServerSession, resetRetryCount, handleError]);
  
  const pause = useCallback(() => {
    if (!audioRef.current) return;
    
    // Calculate session duration before ending
    const session = useRadioStore.getState().currentSession;
    if (session && currentStation) {
      const duration = Math.max(1, Math.floor((Date.now() - session.startTime) / 1000));
      endServerSession(currentStation.stationuuid, duration, false);
    }
    
    audioRef.current.pause();
    setIsPlaying(false);
    
    // End session (local)
    endListeningSession(false);
  }, [setIsPlaying, endListeningSession, endServerSession, currentStation]);
  
  const resume = useCallback(() => {
    if (!audioRef.current || !currentStation) return;
    
    audioRef.current.play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(console.error);
  }, [currentStation, setIsPlaying]);
  
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      if (currentStation) {
        playStation(currentStation);
      }
    }
  }, [isPlaying, currentStation, pause, playStation]);
  
  // ==================== AUDIO EVENT HANDLERS ====================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Create audio element with optimized settings for streaming
    const audio = new Audio();
    // لا تضع crossOrigin هنا - بيكسر محطات HTTP
    // Optimized settings for live streaming - prevent ICY metadata glitches
    audio.preload = 'none';
    audio.defaultPlaybackRate = 1.0;
    audio.playbackRate = 1.0;
    audio.autoplay = false;
    audioRef.current = audio;
    
    // Event handlers
    const handleCanPlay = () => {
      setIsLoading(false);
      setIsBuffering(false);
    };
    
    const handleWaiting = () => {
      // Only show buffering if waiting more than 500ms
      setTimeout(() => {
        if (audio.readyState < 3) {
          setIsBuffering(true);
        }
      }, 500);
    };
    
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsLoading(false);
    };
    
    const handleProgress = () => {
      handleBuffering();
    };
    
    const handleTimeUpdate = () => {
      // Store replay data if enabled
      // This is simplified - in production, you'd use MediaRecorder or Web Audio API
    };
    
    const handleEnded = () => {
      // For live streams, try to reconnect with limit
      if (currentStation && retryCount < BUFFER_CONFIG.MAX_RETRIES) {
        console.log(`[AudioPlayer] Stream ended, reconnecting... (attempt ${retryCount + 1}/${BUFFER_CONFIG.MAX_RETRIES})`);
        incrementRetryCount();
        const delay = BUFFER_CONFIG.RETRY_DELAY_BASE * Math.pow(2, retryCount);
        reconnectTimeoutRef.current = setTimeout(() => {
          playStation(currentStation);
        }, delay);
      } else {
        console.log('[AudioPlayer] Stream ended, max retries reached or no station');
        setIsPlaying(false);
        resetRetryCount();
      }
    };
    
    const handleStalled = () => {
      console.log('[AudioPlayer] Stream stalled, waiting...');
      // Don't set buffering for live streams - it causes UI flicker
      // Just let it recover naturally
    };
    
    // Add event listeners
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('progress', handleProgress);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('stalled', handleStalled);
    audio.addEventListener('error', handleError);
    
    // Cleanup
    // حفظ الجلسة عند إغلاق الصفحة
    const handleBeforeUnload = () => {
      const session = useRadioStore.getState().currentSession;
      const station = useRadioStore.getState().currentStation;
      if (session && station) {
        const duration = Math.max(1, Math.floor((Date.now() - session.startTime) / 1000));
        try {
          const deviceId = localStorage.getItem('deviceId');
          if (deviceId) {
            const payload = JSON.stringify({
              deviceId,
              type: 'session_end',
              data: { stationId: station.stationuuid, duration, skipped: false },
            });
            navigator.sendBeacon('/api/user', new Blob([payload], { type: 'application/json' }));
          }
        } catch {}
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('progress', handleProgress);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('stalled', handleStalled);
      audio.removeEventListener('error', handleError);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      audio.pause();
      audio.src = '';
    };
  }, [handleBuffering, handleError, setIsPlaying, currentStation, playStation]);
  
  // ==================== NETWORK MONITORING ====================
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Initial check
    updateNetworkStatusHandler();
    
    // Listen for network changes
    window.addEventListener('online', updateNetworkStatusHandler);
    window.addEventListener('offline', updateNetworkStatusHandler);
    
    // Periodic checks
    networkCheckIntervalRef.current = setInterval(updateNetworkStatusHandler, 5000);
    
    // Listen for connection changes if available
    const connection = (navigator as Navigator & { 
      connection?: { addEventListener?: (type: string, handler: () => void) => void } 
    }).connection;
    
    if (connection?.addEventListener) {
      connection.addEventListener('change', updateNetworkStatusHandler);
    }
    
    return () => {
      window.removeEventListener('online', updateNetworkStatusHandler);
      window.removeEventListener('offline', updateNetworkStatusHandler);
      if (networkCheckIntervalRef.current) {
        clearInterval(networkCheckIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [updateNetworkStatusHandler]);
  
  // ==================== VOLUME SYNC ====================
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // ==================== STATION CHANGE ====================
  
  useEffect(() => {
    if (currentStation && isPlaying) {
      playStation(currentStation);
    }
  }, [currentStation?.stationuuid]); // Only trigger on station change, not isPlaying
  
  // ==================== COMPUTED STATE ====================
  
  const state: EnhancedAudioState = useMemo(() => ({
    isPlaying,
    isLoading,
    isBuffering,
    networkStatus,
    isOnline: networkStatus.isOnline,
    connectionQuality: networkStatus.quality,
    bufferState: useRadioStore.getState().bufferState,
    replayState: useRadioStore.getState().replayState,
    error: useRadioStore.getState().playbackError,
    retryCount,
    canReplay: replayBufferEnabled && replayBufferRef.current.length > 0,
    replayPosition,
    maxReplaySeconds: replayBufferMaxDuration,
    currentBitrate,
    recommendedBitrate: getRecommendedBitrate(networkStatus.quality),
  }), [
    isPlaying, 
    isLoading, 
    isBuffering, 
    networkStatus, 
    retryCount, 
    replayBufferEnabled,
    replayPosition,
    replayBufferMaxDuration,
    currentBitrate,
    getRecommendedBitrate
  ]);
  
  return {
    state,
    audioRef,
    playStation,
    pause,
    resume,
    togglePlay,
    setVolume,
    startReplay,
    stopReplay,
    updateNetworkStatus: updateNetworkStatusHandler,
  };
}
