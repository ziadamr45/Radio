'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useQuranStore } from '@/stores/quran-store';
import { useUserData } from '@/components/providers/UserDataProvider';
import { logger } from '@/lib/performance';
import { translations } from '@/lib/translations';
import { getStationImage, isValidUrl, getRandomDefaultImage } from '@/lib/station-image';
import { generateShareContent } from '@/lib/share-utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Clock,
  Loader2,
  Radio,
  Wifi,
  WifiOff,
  AlertTriangle,
  RotateCcw,
  SkipBack,
  RefreshCw,
  ChevronUp,
  X,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAudioStreamUrl } from '@/lib/audio-url';
import type { NetworkQuality } from '@/types/radio';

// Network quality indicator colors
const QUALITY_COLORS: Record<NetworkQuality, string> = {
  excellent: 'text-green-500',
  good: 'text-emerald-500',
  fair: 'text-yellow-500',
  poor: 'text-orange-500',
  offline: 'text-red-500',
};

const QUALITY_LABELS: Record<NetworkQuality, { ar: string; en: string }> = {
  excellent: { ar: 'ممتاز', en: 'Excellent' },
  good: { ar: 'جيد', en: 'Good' },
  fair: { ar: 'متوسط', en: 'Fair' },
  poor: { ar: 'ضعيف', en: 'Poor' },
  offline: { ar: 'بدون إنترنت', en: 'Offline' },
};

// Fallback image
const FALLBACK_IMAGE = '/images/default-station.png';

export function EnhancedMiniPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const reconnectAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const userPausedRef = useRef(false); // Track if user explicitly paused
  const wasPlayingBeforeHiddenRef = useRef(false); // Track if was playing before screen lock
  
  const {
    currentStation,
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    isLoading,
    setIsLoading,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    sleepTimerActive,
    sleepTimerEnd,
    clearSleepTimer,
    language,
    networkStatus,
    updateNetworkStatus,
    setCurrentStation,
    endListeningSession,
  } = useRadioStore();
  
  const {
    currentAudio: quranAudio,
    isPlaying: isQuranPlaying,
    setIsPlaying: setQuranPlaying,
    setCurrentAudio: setQuranAudio,
    setCurrentTime: setQuranTime,
    setDuration: setQuranDuration,
  } = useQuranStore();
  
  const { saveFavorite } = useUserData();

  // Send session data to server (fire-and-forget)
  const sendSessionToServer = useCallback(async (type: 'start' | 'end', stationId?: string, duration?: number) => {
    try {
      const deviceId = localStorage.getItem('deviceId');
      if (!deviceId) return;
      const body: Record<string, unknown> = { deviceId, type: type === 'start' ? 'session_start' : 'session_end' };
      if (type === 'start' && currentStation) {
        body.data = { stationId: currentStation.stationuuid, stationName: currentStation.name, category: useRadioStore.getState().contentFilter };
      } else if (type === 'end' && stationId && duration) {
        body.data = { stationId, duration, skipped: false };
      }
      await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    } catch (e) {
      // Silent fail - don't block player for analytics
    }
  }, [currentStation]);
  
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const t = translations[language];
  const isArabic = language === 'ar';
  
  const isFav = currentStation ? isFavorite(currentStation.stationuuid) : false;
  const isOnline = networkStatus.isOnline;
  const quality = networkStatus.quality;
  
  // Get station image using the unified function
  const stationImage = getStationImage(currentStation);
  
  // Save session before tab/page closes - handled by SleepTimerManager (deduplicated)

  // Network status check
  useEffect(() => {
    updateNetworkStatus();
    
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateNetworkStatus]);
  
  // Stop Quran when radio plays
  useEffect(() => {
    if (isPlaying && currentStation && quranAudio) {
      logger.log('[Player] Stopping Quran - Radio is playing');
      // Dispatch event to stop Quran audio immediately
      window.dispatchEvent(new CustomEvent('stopQuranAudio'));
      // Reset Quran state completely
      setQuranPlaying(false);
      setQuranAudio(null);
      setQuranTime(0);
      setQuranDuration(0);
    }
  }, [isPlaying, currentStation, quranAudio, setQuranPlaying, setQuranAudio, setQuranTime, setQuranDuration]);
  
  // Listen for stop event from Quran - stop radio audio element
  useEffect(() => {
    const handleStopRadio = () => {
      if (audioRef.current) {
        logger.log('[Player] Stopping Radio - Quran is playing');
        audioRef.current.pause();
      }
      setIsPlaying(false);
    };
    
    window.addEventListener('stopRadioAudio', handleStopRadio);
    return () => window.removeEventListener('stopRadioAudio', handleStopRadio);
  }, [setIsPlaying]);

  // Listen for pause/play events from StationCard
  useEffect(() => {
    const handlePauseFromCard = () => {
      if (audioRef.current) {
        logger.log('[Player] Pausing from station card');
        audioRef.current.pause();
      }
      // End session and record listening time
      const state = useRadioStore.getState();
      if (state.currentSession) {
        const sessionDuration = Math.max(1, Math.floor((Date.now() - state.currentSession.startTime) / 1000));
        endListeningSession(false);
        if (sessionDuration > 0 && currentStation) {
          sendSessionToServer('end', currentStation.stationuuid, sessionDuration);
        }
      }
      setIsPlaying(false);
    };

    const handlePlayFromCard = () => {
      if (audioRef.current && !isOnline) return;
      setIsLoading(true);
      audioRef.current?.play()
        .then(() => {
          setIsPlaying(true);
          // Start a new session
          const state = useRadioStore.getState();
          if (currentStation) {
            state.startListeningSession(currentStation, state.contentFilter);
            sendSessionToServer('start');
          }
        })
        .catch((err) => {
          console.error('[Player] Play from card error:', err);
          setIsPlaying(false);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    window.addEventListener('pauseRadioFromCard', handlePauseFromCard);
    window.addEventListener('playRadioFromCard', handlePlayFromCard);
    return () => {
      window.removeEventListener('pauseRadioFromCard', handlePauseFromCard);
      window.removeEventListener('playRadioFromCard', handlePlayFromCard);
    };
  }, [isOnline, currentStation, endListeningSession, sendSessionToServer, setIsPlaying, setIsLoading]);
  
  // Auto-reconnect function
  const reconnect = useCallback(() => {
    if (!audioRef.current || !currentStation || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      logger.log('[Player] Max reconnect attempts reached');
      return;
    }
    
    reconnectAttemptsRef.current++;
    logger.log(`[Player] Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
    
    const audio = audioRef.current;
    const audioUrl = getAudioStreamUrl(currentStation);
    if (!audioUrl) return;
    
    // Force reload with cache bypass
    const separator = audioUrl.includes('?') ? '&' : '?';
    audio.src = `${audioUrl}${separator}t=${Date.now()}`;
    audio.load();
    audio.play().catch(err => console.error('[Player] Reconnect error:', err));
  }, [currentStation]);
  
  // Handle audio playback
  useEffect(() => {
    if (!audioRef.current || !currentStation || !isOnline) return;
    
    const audio = audioRef.current;
    const audioUrl = getAudioStreamUrl(currentStation);
    
    if (!audioUrl) return;
    
    // Reset reconnect attempts on new station
    reconnectAttemptsRef.current = 0;
    
    // Determine if this is a new station or the same one
    const prevStationId = audio.getAttribute('data-station');
    const stationChanged = prevStationId !== currentStation.stationuuid;
    
    // Cleanup flag to cancel pending operations on re-run
    let cancelled = false;
    
    logger.log('[Player]', stationChanged ? 'Loading new station:' : 'Play/Pause toggle:', currentStation.name, '| isPlaying:', isPlaying);
    
    if (stationChanged) {
      // Full reload for new station
      audio.pause();
      audio.removeAttribute('data-station');
      
      // STOP old audio completely before loading new one
      audio.src = '';
      audio.removeAttribute('src');
      audio.load();
      
      // Small delay to ensure old audio is stopped
      setTimeout(() => {
        if (cancelled) return;
        
        // Load new audio
        audio.removeAttribute('crossorigin');
        audio.setAttribute('data-station', currentStation.stationuuid);
        audio.src = audioUrl;
        audio.volume = volume;
        audio.preload = 'auto';
        audio.load();
        
        if (isPlaying) {
          audio.play().then(() => {
            if (!cancelled) setIsLoading(false);
          }).catch((err) => {
            logger.warn('[Player] Autoplay blocked or playback error:', err.message);
            if (!cancelled) {
              setIsPlaying(false);
              setIsLoading(false);
            }
          });
        }
      }, 100);
    } else {
      // Same station - handle play/pause toggle
      if (isPlaying) {
        if (audio.paused) {
          setIsLoading(true);
          audio.play().then(() => {
            if (!cancelled) setIsLoading(false);
          }).catch((err) => {
            logger.warn('[Player] Play error:', err.message);
            if (!cancelled) {
              setIsPlaying(false);
              setIsLoading(false);
            }
          });
        }
      } else {
        audio.pause();
      }
    }
    
    return () => { cancelled = true; };
  }, [currentStation?.stationuuid, isPlaying, isOnline, volume]);
  
  // Handle volume changes separately
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // ==================== Wake Lock API ====================
  // Prevents the browser from suspending the page when the screen is locked
  const acquireWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      if (!wakeLockRef.current || wakeLockRef.current.released) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        logger.log('[Player] Wake Lock acquired');
      }
    } catch (err) {
      // Wake lock might fail in some browsers/environments - silently ignore
      logger.log('[Player] Wake Lock not available:', (err as Error).message);
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      logger.log('[Player] Wake Lock released');
    }
  }, []);

  // ==================== Media Session API ====================
  // This tells the OS that there's an active media session, which:
  // 1. Shows media controls in the lock screen / notification area
  // 2. Prevents the browser from killing audio when the screen is locked
  // 3. Allows control from Bluetooth/headphones
  useEffect(() => {
    if (!currentStation || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const station = currentStation;
    const artworkUrl = getStationImage(station);
    // Ensure absolute URL for media session (notifications need full URLs)
    const absoluteArtworkUrl = artworkUrl.startsWith('http')
      ? artworkUrl
      : `${window.location.origin}${artworkUrl}`;
    const stationName = station.name;
    const stationCountry = station.country || station.countrycode || '';

    navigator.mediaSession.metadata = new MediaMetadata({
      title: stationName,
      artist: stationCountry,
      album: isArabic ? 'اسمع راديو' : 'Esmaa Radio',
      artwork: [
        { src: absoluteArtworkUrl, sizes: '512x512', type: 'image/png' },
      ],
    });

    // Action handlers - control from lock screen, notification, Bluetooth
    const handleMediaPlay = () => {
      userPausedRef.current = false;
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(true);
      acquireWakeLock();
    };

    const handleMediaPause = () => {
      userPausedRef.current = true;
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      releaseWakeLock();
    };

    const handleMediaNextTrack = () => {
      // No next track for live radio - just a no-op
    };

    const handleMediaPrevTrack = () => {
      // No previous track for live radio - just a no-op
    };

    navigator.mediaSession.setActionHandler('play', handleMediaPlay);
    navigator.mediaSession.setActionHandler('pause', handleMediaPause);
    navigator.mediaSession.setActionHandler('nexttrack', handleMediaNextTrack);
    navigator.mediaSession.setActionHandler('previoustrack', handleMediaPrevTrack);

    return () => {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
    };
  }, [currentStation?.stationuuid, isArabic, setIsPlaying, acquireWakeLock, releaseWakeLock]);

  // Acquire/release wake lock based on playback state
  useEffect(() => {
    if (isPlaying) {
      acquireWakeLock();
    } else if (userPausedRef.current) {
      releaseWakeLock();
    }
  }, [isPlaying, acquireWakeLock, releaseWakeLock]);

  // Re-acquire wake lock when page becomes visible again
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Re-acquire wake lock if we're playing
        const state = useRadioStore.getState();
        if (state.isPlaying) {
          acquireWakeLock();
        }

        // Auto-resume: if audio was playing before hidden and browser paused it
        if (wasPlayingBeforeHiddenRef.current && audioRef.current) {
          const audio = audioRef.current;
          if (audio.paused && !userPausedRef.current) {
            logger.log('[Player] Screen unlocked - auto-resuming playback...');
            audio.play().catch((err) => {
              logger.warn('[Player] Auto-resume failed:', err.message);
            });
          }
        }
        wasPlayingBeforeHiddenRef.current = false;
      } else if (document.visibilityState === 'hidden') {
        // Remember if we were playing before going to background
        const state = useRadioStore.getState();
        wasPlayingBeforeHiddenRef.current = state.isPlaying;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [acquireWakeLock]);

  // Release wake lock on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  // ==================== Handle Pause Intelligently ====================
  // Only update store when user explicitly pauses, not when browser pauses in background
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentStation) return;

    const handlePause = () => {
      // Don't set isPlaying to false if the browser paused due to backgrounding
      // The visibility change handler will auto-resume
      if (!userPausedRef.current && wasPlayingBeforeHiddenRef.current) {
        logger.log('[Player] Browser paused audio (background), will auto-resume...');
        return;
      }
      setIsPlaying(false);
      releaseWakeLock();
    };

    const handlePlay = () => {
      setIsPlaying(true);
      acquireWakeLock();
    };

    audio.addEventListener('pause', handlePause);
    audio.addEventListener('play', handlePlay);

    return () => {
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('play', handlePlay);
    };
  }, [currentStation?.stationuuid, setIsPlaying, acquireWakeLock, releaseWakeLock]);

  // Sleep timer countdown - display only (SleepTimerManager handles the actual timer logic)
  useEffect(() => {
    if (sleepTimerActive && sleepTimerEnd) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, sleepTimerEnd - Date.now());
        setSleepTimerRemaining(Math.ceil(remaining / 1000 / 60));
      }, 10000); // Update display every 10 seconds instead of every second
      
      return () => clearInterval(interval);
    }
  }, [sleepTimerActive, sleepTimerEnd]);
  
  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentStation || !isOnline) return;
    
    if (isPlaying) {
      userPausedRef.current = true; // Mark as user-initiated pause
      audioRef.current?.pause();
      setIsPlaying(false);
      releaseWakeLock();
      // End session when pausing - records listening time locally + server
      const state = useRadioStore.getState();
      const sessionDuration = state.currentSession ? Math.max(1, Math.floor((Date.now() - state.currentSession.startTime) / 1000)) : 0;
      endListeningSession(false);
      if (sessionDuration > 0) {
        sendSessionToServer('end', currentStation.stationuuid, sessionDuration);
      }
    } else {
      userPausedRef.current = false; // Mark as user-initiated play
      setIsLoading(true);
      audioRef.current?.play()
        .then(() => {
          setIsPlaying(true);
          acquireWakeLock();
          // Start a new session when resuming
          useRadioStore.getState().startListeningSession(currentStation, useRadioStore.getState().contentFilter);
          sendSessionToServer('start');
        })
        .catch((err) => {
          console.error('Play error:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [currentStation, isPlaying, isOnline, setIsPlaying, setIsLoading, endListeningSession, sendSessionToServer]);
  
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };
  
  const toggleFavorite = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentStation) return;
    
    if (isFav) {
      removeFromFavorites(currentStation.stationuuid);
      await saveFavorite(currentStation, false);
    } else {
      addToFavorites(currentStation);
      await saveFavorite(currentStation, true);
    }
  };
  
  const shareStation = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentStation) return;
    
    // Check if station is in favorites (for personalization)
    const isPersonal = isFav;
    
    // Generate dynamic share content with deep link
    const shareContent = generateShareContent(currentStation, isArabic ? 'ar' : 'en', isPersonal);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareContent.title,
          text: shareContent.text,
          url: shareContent.url,
        });
        toast.success(isArabic ? 'تم مشاركة المحطة!' : 'Station shared!');
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    } else {
      // Fallback: copy deep link to clipboard
      try {
        await navigator.clipboard.writeText(shareContent.url);
        toast.success(isArabic ? 'تم نسخ رابط المحطة!' : 'Station link copied!');
      } catch (err) {
        console.error('Clipboard error:', err);
        toast.error(isArabic ? 'فشل نسخ الرابط' : 'Failed to copy link');
      }
    }
  };
  
  const retryPlayback = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentStation || !audioRef.current) return;

    const audio = audioRef.current;
    const audioUrl = getAudioStreamUrl(currentStation);
    if (!audioUrl) return;

    // Force reload
    audio.src = '';
    audio.src = audioUrl;
    audio.load();
    audio.play().catch(() => {});
  };
  
  const closePlayer = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    // End session before clearing station
    endListeningSession(false);
    setIsPlaying(false);
    setCurrentStation(null);
    setIsExpanded(false);
  };
  
  const formatSleepTimer = (minutes: number) => {
    if (minutes <= 0) return '';
    if (minutes < 60) return `${minutes} ${t.minutes}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (currentStation) {
      target.src = getRandomDefaultImage(currentStation.stationuuid, currentStation.name, currentStation.tags);
    } else {
      target.src = FALLBACK_IMAGE;
    }
  };
  
  // IMPORTANT: Always render the <audio> element, even when no station is selected.
  // This prevents the audio element from being destroyed when currentStation is null,
  // which would kill any ongoing audio stream and lose wake lock / media session state.
  if (!currentStation) {
    return (
      <audio
        ref={audioRef}
        preload="none"
      />
    );
  }
  
  return (
    <>
      <audio
        ref={audioRef}
        onCanPlay={() => {
          setIsLoading(false);
          // Reset reconnect attempts on successful load
          reconnectAttemptsRef.current = 0;
          logger.log('[Player] Audio ready to play');
        }}
        onPlaying={() => {
          setIsLoading(false);
          logger.log('[Player] Audio playing successfully');
        }}
        onStalled={() => {
          logger.log('[Player] Audio stalled - auto-recovering...');
        }}
        onWaiting={() => {
          setIsLoading(true);
          logger.log('[Player] Audio waiting for data...');
        }}
        onEnded={() => {
          logger.log('[Player] Stream ended - reconnecting...');
          reconnect();
        }}
        onError={(e) => {
          const audio = e.currentTarget;
          const error = audio?.error;
          const errorCode = error?.code || 0;
          
          console.error('[Player] Audio error:', errorCode, error?.message);
          setIsLoading(false);
          
          // Retry on any error
          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            logger.log('[Player] Retrying in 2 seconds...');
            setTimeout(reconnect, 2000);
          }
        }}
        preload="auto"
      />
      
      {/* Mini Player Bar */}
      <div 
        role="region"
        aria-label="Now Playing"
        className={cn(
          "fixed bottom-0 start-0 end-0 z-50 bg-background/95 backdrop-blur-lg border-t shadow-2xl transition-all duration-300",
          isExpanded && "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        {/* Network Status Bar */}
        {!isOnline && (
          <div role="alert" className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm">
            <WifiOff className="h-4 w-4 text-red-500" />
            <span className="text-red-600 dark:text-red-400">
              {isArabic ? 'لا يوجد اتصال بالإنترنت' : 'No internet connection'}
            </span>
          </div>
        )}
        
        {/* Weak Connection Warning */}
        {isOnline && quality === 'poor' && (
          <div role="alert" className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-orange-600 dark:text-orange-400">
              {isArabic ? 'اتصال ضعيف' : 'Weak connection'}
            </span>
          </div>
        )}
        
        {isLoading && (
          <Progress value={50} className="h-1 rounded-none animate-pulse" />
        )}
        
        <div 
          className="container mx-auto px-4 cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={isArabic ? 'توسيع المشغل' : 'Expand player'}
          onClick={() => setIsExpanded(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsExpanded(true); } }}
        >
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Station Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-md relative">
                <img
                  src={stationImage}
                  alt={currentStation.name}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                {isPlaying && !isLoading && (
                  <div className="absolute top-1 end-1 w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{currentStation.name}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground truncate">
                    {currentStation.country || currentStation.countrycode}
                  </span>
                  
                  {currentStation.bitrate > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {currentStation.bitrate}kbps
                    </Badge>
                  )}
                  
                  <div className={cn("flex items-center gap-1", QUALITY_COLORS[quality])}>
                    <Wifi className="h-3 w-3" />
                    <span className="text-xs">
                      {QUALITY_LABELS[quality][isArabic ? 'ar' : 'en']}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {sleepTimerActive && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                <Clock className="h-3.5 w-3.5" />
                <span>{formatSleepTimer(sleepTimerRemaining)}</span>
              </div>
            )}
            
            {/* Mini Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                aria-label={isArabic ? 'توسيع المشغل' : 'Expand player'}
              >
                <ChevronUp className="h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                className="rounded-full w-12 h-12 shadow-lg"
                onClick={togglePlay}
                disabled={isLoading || !currentStation || !isOnline}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ms-[-2px]" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                onClick={closePlayer}
                aria-label={isArabic ? 'إغلاق المشغل' : 'Close player'}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expanded Player Sheet */}
      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0">
          <VisuallyHidden>
            <SheetTitle>
              {isArabic ? 'المشغل الكامل' : 'Full Player'}
            </SheetTitle>
            <SheetDescription>
              {isArabic ? 'التحكم في تشغيل المحطة' : 'Control station playback'}
            </SheetDescription>
          </VisuallyHidden>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="rounded-full"
              >
                <ChevronUp className="h-5 w-5 rotate-180" />
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {isArabic ? 'قيد التشغيل الآن' : 'Now Playing'}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={closePlayer}
                className="rounded-full text-muted-foreground hover:text-destructive"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-auto">
              {/* Station Image */}
              <div className="relative mb-8">
                <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl bg-muted">
                  <img
                    src={stationImage}
                    alt={currentStation.name}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
                
                {isPlaying && !isLoading && (
                  <div className="absolute -bottom-2 start-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    {isArabic ? 'مباشر' : 'LIVE'}
                  </div>
                )}
              </div>
              
              {/* Station Info */}
              <div className="text-center mb-6 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 truncate">{currentStation.name}</h2>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-muted-foreground">
                    {currentStation.country || currentStation.countrycode}
                  </span>
                  {currentStation.bitrate > 0 && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{currentStation.bitrate} kbps</span>
                    </>
                  )}
                  {currentStation.codec && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground uppercase">{currentStation.codec}</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Network Quality */}
              <div 
                role="status"
                aria-live="polite"
                className={cn(
                  "flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-muted",
                  QUALITY_COLORS[quality]
                )}
              >
                <Wifi className="h-4 w-4" aria-hidden="true" />
                <span className="text-sm font-medium">
                  {QUALITY_LABELS[quality][isArabic ? 'ar' : 'en']}
                </span>
              </div>
              
              {/* Sleep Timer */}
              {sleepTimerActive && (
                <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-muted text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>
                    {isArabic ? 'سيتوقف بعد' : 'Stops in'} {formatSleepTimer(sleepTimerRemaining)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="p-6 border-t bg-muted/30">
              {/* Volume Slider */}
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setVolume(volume > 0 ? 0 : 1.0)}
                  className="h-10 w-10"
                  aria-label={volume === 0 ? (isArabic ? 'إلغاء كتم الصوت' : 'Unmute') : (isArabic ? 'كتم الصوت' : 'Mute')}
                >
                  {volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="flex-1"
                  aria-label={isArabic ? 'مستوى الصوت' : 'Volume level'}
                />
                <span className="text-sm text-muted-foreground w-10 text-end">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              
              {/* Main Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleFavorite}
                  className={cn("h-12 w-12 rounded-full", isFav && "text-red-500")}
                  aria-label={isFav ? (isArabic ? 'إزالة من المفضلة' : 'Remove from favorites') : (isArabic ? 'أضف للمفضلة' : 'Add to favorites')}
                >
                  <Heart className={cn("h-6 w-6", isFav && "fill-current")} />
                </Button>
                
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 shadow-lg"
                  onClick={togglePlay}
                  disabled={isLoading || !currentStation || !isOnline}
                >
                  {isLoading ? (
                    <Loader2 className="h-7 w-7 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-7 w-7" />
                  ) : (
                    <Play className="h-7 w-7 ms-[-2px]" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={shareStation}
                  className="h-12 w-12 rounded-full"
                  aria-label={isArabic ? 'مشاركة المحطة' : 'Share station'}
                >
                  <Share2 className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
