'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useQuranStore } from '@/stores/quran-store';
import { useRadioStore } from '@/stores/radio-store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Loader2,
  ChevronUp,
  BookOpen,
  Clock,
  Download,
  Repeat,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSurahImage } from './QuranSection';

export function QuranMiniPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const userPausedRef = useRef(false);
  
  const {
    currentAudio,
    isPlaying,
    setIsPlaying,
    isLoading,
    setIsLoading,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume: quranVolume,
    setVolume: setQuranVolume,
    selectedReciter,
    selectedSurah,
    playNext,
    playPrevious,
    saveProgress,
    setCurrentAudio,
  } = useQuranStore();
  
  const {
    language,
    volume: radioVolume,
    setVolume: setRadioVolume,
    setIsPlaying: setRadioPlaying,
    setCurrentStation: setRadioStation,
    sleepTimerActive,
    sleepTimerEnd,
    clearSleepTimer,
  } = useRadioStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const isArabic = language === 'ar';
  
  // ==================== Wake Lock API ====================
  const acquireWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      if (!wakeLockRef.current || wakeLockRef.current.released) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      // Silent fail
    }
  }, []);
  
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  }, []);
  
  // Close player completely
  const handleClose = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    releaseWakeLock();
    setIsPlaying(false);
    setCurrentAudio(null);
    setCurrentTime(0);
    setDuration(0);
    setIsExpanded(false);
  }, [setIsPlaying, setCurrentAudio, setCurrentTime, setDuration, releaseWakeLock]);
  
  // Use radio volume for Quran (unified volume control)
  const volume = radioVolume;
  const setVolume = setRadioVolume;
  
  // Stop radio when Quran plays - dispatch event to stop radio audio element
  useEffect(() => {
    if (isPlaying && currentAudio) {
      setRadioPlaying(false);
      // Dispatch event to stop radio audio element immediately
      window.dispatchEvent(new CustomEvent('stopRadioAudio'));
    }
  }, [isPlaying, currentAudio, setRadioPlaying]);
  
  // Listen for stop event from radio
  useEffect(() => {
    const handleStopQuran = () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    };
    
    window.addEventListener('stopQuranAudio', handleStopQuran);
    return () => window.removeEventListener('stopQuranAudio', handleStopQuran);
  }, [setIsPlaying]);
  
  // Audio events - DO NOT set isPlaying here to avoid feedback loops
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    
    const handleWaiting = () => {
      setIsLoading(true);
    };
    
    const handleCanPlay = () => {
      setIsLoading(false);
      // Auto-resume if user intended to play but audio was buffering/stalled
      if (useQuranStore.getState().isPlaying && audio.paused) {
        audio.play().catch(() => {});
      }
    };
    
    const handleEnded = () => {
      if (isRepeat && selectedReciter && selectedSurah) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    };
    
    const handleError = () => {
      setIsLoading(false);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isRepeat, selectedReciter, selectedSurah, playNext, setCurrentTime, setDuration, setIsLoading]);
  
  // Handle audio URL change - ONLY load, don't play (play/pause effect handles it)
  useEffect(() => {
    if (audioRef.current && currentAudio) {
      audioRef.current.src = currentAudio.audioUrl;
      audioRef.current.load();
    }
  }, [currentAudio?.audioUrl]);
  
  // Handle play/pause - single source of truth (idempotent)
  useEffect(() => {
    if (!audioRef.current || !currentAudio) return;
    const audio = audioRef.current;
    
    if (isPlaying) {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
      acquireWakeLock();
    } else {
      if (!audio.paused) {
        audio.pause();
      }
      releaseWakeLock();
    }
  }, [isPlaying, currentAudio, acquireWakeLock, releaseWakeLock]);
  
  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  // ==================== Media Session API ====================
  useEffect(() => {
    if (!currentAudio || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    const surahImg = getSurahImage(currentAudio.surahNumber);
    // Ensure absolute URL for media session (notifications need full URLs)
    const absoluteSurahImg = surahImg.startsWith('http')
      ? surahImg
      : `${window.location.origin}${surahImg}`;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentAudio.surahName,
      artist: currentAudio.reciterName,
      album: isArabic ? 'القرآن الكريم' : 'Holy Quran',
      artwork: [
        { src: absoluteSurahImg, sizes: '512x512', type: 'image/png' },
      ],
    });

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
      playNext();
    };

    const handleMediaPrevTrack = () => {
      playPrevious();
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
  }, [currentAudio?.audioUrl, isArabic, setIsPlaying, playNext, playPrevious, acquireWakeLock, releaseWakeLock]);
  
  // Handle page visibility - resume audio if user intended to play
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        acquireWakeLock();
        // If user intended to play but browser paused it (background/download), resume
        if (audioRef.current) {
          const state = useQuranStore.getState();
          if (state.isPlaying && audioRef.current.paused) {
            audioRef.current.play().catch(() => {});
          }
        }
      } else if (document.visibilityState === 'hidden') {
        releaseWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [acquireWakeLock, releaseWakeLock]);

  // Release wake lock on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);
  
  // Sleep timer - display only (SleepTimerManager handles the actual timer logic)
  // Removed duplicate timer logic - SleepTimerManager already stops Quran on timer expiry
  
  // Save progress periodically
  useEffect(() => {
    if (!currentAudio || !isPlaying) return;
    
    const interval = setInterval(() => {
      if (audioRef.current && selectedReciter) {
        saveProgress(selectedReciter.id, currentAudio.surahNumber, audioRef.current.currentTime);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [currentAudio, isPlaying, selectedReciter, saveProgress]);
  
  // Format time
  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle seek
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  // Handle download
  const handleDownload = () => {
    if (currentAudio?.audioUrl) {
      const link = document.createElement('a');
      link.href = currentAudio.audioUrl;
      link.download = `${currentAudio.surahName} - ${currentAudio.reciterName}.mp3`;
      link.click();
    }
  };
  
  // IMPORTANT: Always render the <audio> element to prevent destruction
  if (!currentAudio) {
    return (
      <audio
        ref={audioRef}
        preload="none"
      />
    );
  }
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  return (
    <>
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        preload="metadata" 
      />
      
      {/* Mini Player Bar */}
      <div 
        role="region"
        aria-label={isArabic ? 'مشغل القرآن الآن' : 'Quran Now Playing'}
        className={cn(
          "fixed bottom-0 start-0 end-0 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 backdrop-blur-lg shadow-2xl transition-all duration-300",
          isExpanded && "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        {/* Progress bar at top */}
        <div 
          className="h-1 bg-white/20"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={isArabic ? 'تقدم التشغيل' : 'Playback progress'}
        >
          <div 
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div 
          className="px-4 py-3 flex items-center gap-3 cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={isArabic ? 'توسيع مشغل القرآن' : 'Expand Quran player'}
          onClick={() => setIsExpanded(true)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsExpanded(true); } }}
        >
          {/* Surah Image */}
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
            <img
              src={getSurahImage(currentAudio.surahNumber)}
              alt={currentAudio.surahName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate">
              {currentAudio.surahName}
            </p>
            <p className="text-sm text-white/80 truncate">
              {currentAudio.reciterName}
            </p>
          </div>
          
          {/* Time */}
          <div className="text-xs text-white/90 hidden sm:block">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/20"
              onClick={() => playPrevious()}
              disabled={!selectedReciter}
              aria-label={isArabic ? 'السورة السابقة' : 'Previous surah'}
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-white hover:bg-white/20"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? (isArabic ? 'إيقاف مؤقت' : 'Pause') : (isArabic ? 'تشغيل' : 'Play')}
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-white hover:bg-white/20"
              onClick={() => playNext()}
              disabled={!selectedReciter}
              aria-label={isArabic ? 'السورة التالية' : 'Next surah'}
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 text-white/90 hover:text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); handleClose(); }}
            aria-label={isArabic ? 'إغلاق مشغل القرآن' : 'Close Quran player'}
          >
            <X className="h-5 w-5" />
          </Button>
          
          {/* Expand icon */}
          <ChevronUp className="h-5 w-5 text-white/60" />
        </div>
      </div>
      
      {/* Expanded Player Sheet */}
      <Sheet open={isExpanded} onOpenChange={setIsExpanded}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] rounded-t-3xl bg-gradient-to-b from-emerald-600 to-teal-700 border-0 p-0"
        >
          <VisuallyHidden>
            <SheetTitle>{isArabic ? 'مشغل القرآن' : 'Quran Player'}</SheetTitle>
          </VisuallyHidden>
          
          <div className="h-full flex flex-col text-white">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setIsExpanded(false)}
                aria-label={isArabic ? 'تصغير المشغل' : 'Minimize player'}
              >
                <ChevronUp className="h-6 w-6 rotate-180" />
              </Button>
              
              <p className="text-sm font-medium text-white/80">
                {isArabic ? 'القرآن الكريم' : 'Quran'}
              </p>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={handleDownload}
                aria-label={isArabic ? 'تحميل' : 'Download'}
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8">
              {/* Surah Image */}
              <div className="w-48 h-48 rounded-3xl overflow-hidden mb-8 shadow-xl">
                <img
                  src={getSurahImage(currentAudio.surahNumber)}
                  alt={currentAudio.surahName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              
              {/* Surah Info */}
              <h2 className="text-2xl font-bold text-center mb-2">
                {currentAudio.surahName}
              </h2>
              <p className="text-lg text-white/80 mb-1">
                {currentAudio.reciterName}
              </p>
              {selectedSurah && (
                <p className="text-sm text-white/60">
                  {isArabic ? `${selectedSurah.ayahs} آية` : `${selectedSurah.ayahs} verses`}
                  {' • '}
                  {selectedSurah.type === 'meccan' 
                    ? (isArabic ? 'مكية' : 'Meccan')
                    : (isArabic ? 'مدنية' : 'Medinan')
                  }
                </p>
              )}
            </div>
            
            {/* Progress */}
            <div className="px-8 mb-4">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="w-full"
                thumbClassName="bg-white"
                trackClassName="bg-white/30"
                rangeClassName="bg-white"
              />
              <div className="flex justify-between text-sm text-white/60 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 text-white hover:bg-white/20"
                onClick={() => playPrevious()}
              aria-label={isArabic ? 'السورة السابقة' : 'Previous surah'}
              >
                <SkipBack className="h-7 w-7" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-20 w-20 text-white bg-white/20 hover:bg-white/30 rounded-full"
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? (isArabic ? 'إيقاف مؤقت' : 'Pause') : (isArabic ? 'تشغيل' : 'Play')}
              >
                {isLoading ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-10 w-10" />
                ) : (
                  <Play className="h-10 w-10" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 text-white hover:bg-white/20"
                onClick={() => playNext()}
                aria-label={isArabic ? 'السورة التالية' : 'Next surah'}
              >
                <SkipForward className="h-7 w-7" />
              </Button>
            </div>
            
            {/* Bottom Actions */}
            <div className="flex items-center justify-center gap-6 pb-8 px-8">
              {/* Volume */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                  aria-label={isArabic ? 'الصوت' : 'Volume'}
                >
                  {volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={(v) => setVolume(v[0] / 100)}
                  className="w-24"
                  thumbClassName="bg-white"
                  trackClassName="bg-white/30"
                  rangeClassName="bg-white"
                />
              </div>
              
              {/* Repeat */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "text-white hover:bg-white/20",
                  isRepeat && "bg-white/30"
                )}
                onClick={() => setIsRepeat(!isRepeat)}
                aria-label={isArabic ? 'إعادة التشغيل' : 'Repeat'}
              >
                <Repeat className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
