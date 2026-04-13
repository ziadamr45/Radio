'use client';

import { memo, useCallback, useState } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useUserData } from '@/components/providers/UserDataProvider';
import { translations } from '@/lib/translations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Heart,
  Share2,
  Globe,
  Signal,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RadioStation } from '@/types/radio';
import { toast } from 'sonner';

// Module-level pure function - no need for useCallback
function qualityColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-500/10';
  if (score >= 60) return 'text-yellow-600 bg-yellow-500/10';
  if (score >= 40) return 'text-orange-600 bg-orange-500/10';
  return 'text-red-600 bg-red-500/10';
}

import { getStationImage as getStationImageUtil, getRandomDefaultImage } from '@/lib/station-image';
import { generateShareContent } from '@/lib/share-utils';

interface StationCardProps {
  station: RadioStation;
  onPlay?: (station: RadioStation) => void;
  onStationClick?: (station: RadioStation) => void;
  compact?: boolean;
  disabled?: boolean;
}

// Memoized Station Card for better performance
// Use Zustand selectors to minimize re-renders - only subscribe to specific state slices
export const StationCard = memo(function StationCard({ station, onPlay, onStationClick, compact = false, disabled = false }: StationCardProps) {
  const currentStation = useRadioStore(s => s.currentStation);
  const isPlaying = useRadioStore(s => s.isPlaying);
  const setIsPlaying = useRadioStore(s => s.setIsPlaying);
  const setCurrentStation = useRadioStore(s => s.setCurrentStation);
  const addToFavorites = useRadioStore(s => s.addToFavorites);
  const removeFromFavorites = useRadioStore(s => s.removeFromFavorites);
  const isFavorite = useRadioStore(s => s.isFavorite);
  const language = useRadioStore(s => s.language);
  const isLoading = useRadioStore(s => s.isLoading);
  
  const { saveFavorite, saveHistory } = useUserData();
  
  const t = translations[language];
  const isCurrentStation = currentStation?.stationuuid === station.stationuuid;
  const isFav = isFavorite(station.stationuuid);
  const isThisLoading = isLoading && isCurrentStation;
  
  // Get station image or default
  const stationImage = getStationImageUtil(station);
  
  const handlePlay = useCallback(() => {
    if (disabled) return;
    if (isCurrentStation) {
      // Toggle play/pause for current station - do NOT call onPlay
      // because parent handlers always set isPlaying=true which would override the toggle
      setIsPlaying(!isPlaying);
      // Dispatch event so EnhancedMiniPlayer properly pauses audio + ends session
      if (isPlaying) {
        window.dispatchEvent(new CustomEvent('pauseRadioFromCard'));
      } else {
        window.dispatchEvent(new CustomEvent('playRadioFromCard'));
      }
    } else {
      // New station - start playing
      setCurrentStation(station);
      setIsPlaying(true);
      // Save to history in database
      saveHistory(station);
      onPlay?.(station);
    }
  }, [disabled, isCurrentStation, isPlaying, setIsPlaying, setCurrentStation, station, saveHistory, onPlay]);
  
  const toggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      removeFromFavorites(station.stationuuid);
      await saveFavorite(station, false);
    } else {
      addToFavorites(station);
      await saveFavorite(station, true);
    }
  }, [isFav, station, removeFromFavorites, addToFavorites, saveFavorite]);
  
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    // Fallback to a random default image
    target.src = getRandomDefaultImage(station.stationuuid, station.name, station.tags);
  }, [station.stationuuid, station.name, station.tags]);
  
  const [shareSuccess, setShareSuccess] = useState(false);

  const shareStation = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if station is in favorites (for personalization)
    const isPersonal = isFav;
    
    // Generate dynamic share content with deep link
    const shareContent = generateShareContent(station, language, isPersonal);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareContent.title,
          text: shareContent.text,
          url: shareContent.url,
        });
        setShareSuccess(true);
        toast.success(language === 'ar' ? 'تم مشاركة المحطة!' : 'Station shared!');
        setTimeout(() => setShareSuccess(false), 2000);
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
        setShareSuccess(true);
        toast.success(language === 'ar' ? 'تم نسخ رابط المحطة!' : 'Station link copied!');
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        console.error('Clipboard error:', err);
        toast.error(language === 'ar' ? 'فشل نسخ الرابط' : 'Failed to copy link');
      }
    }
  }, [station, language, isFav]);
  

  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onStationClick?.(station);
    }
  }, [onStationClick, station]);

  const handleCompactKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePlay();
    }
  }, [handlePlay]);

  if (compact) {
    return (
      <Card
        role="button"
        tabIndex={0}
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
          isCurrentStation && "ring-2 ring-primary bg-primary/5"
        )}
        onClick={handlePlay}
        onKeyDown={handleCompactKeyDown}
        aria-label={language === 'ar' ? `تشغيل ${station.name}` : `Play ${station.name}`}
      >
        <CardContent className="flex items-center gap-3 p-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={stationImage}
              alt={station.name}
              className="w-full h-full object-cover"
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">{station.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {station.country || station.countrycode}
            </p>
          </div>
          
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleFavorite}
            className={cn("h-10 w-10", isFav && "text-red-500")}
            aria-label={isFav ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'أضف للمفضلة' : 'Add to favorites')}
          >
            <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card
      role="article"
      tabIndex={0}
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-xl overflow-hidden active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
        isCurrentStation && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={() => onStationClick?.(station)}
      onKeyDown={handleKeyDown}
      aria-label={station.name}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Favicon */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shadow-sm">
              <img
                src={stationImage}
                alt={station.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            
            {/* Quality badge */}
            {'qualityScore' in station && (
              <div className={cn(
                "absolute -bottom-1 -end-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                qualityColor((station as RadioStation & { qualityScore: number }).qualityScore)
              )}>
                {Math.round((station as RadioStation & { qualityScore: number }).qualityScore)}%
              </div>
            )}
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors leading-tight">
              {station.name}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Globe className="h-3.5 w-3.5" />
              <span className="truncate">
                {station.country || station.countrycode}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              {station.bitrate > 0 && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 h-5">
                  <Signal className="h-3 w-3 me-1" />
                  {station.bitrate}kbps
                </Badge>
              )}
              
              {station.votes > 0 && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5">
                  👍 {station.votes}
                </Badge>
              )}
              
              {station.codec && (
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 h-5 uppercase">
                  {station.codec}
                </Badge>
              )}
            </div>
            
            {/* Tags */}
            {station.tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {station.tags.split(',').slice(0, 3).map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between border-t px-4 py-3 bg-muted/30">
          <Button
            size="sm"
            onClick={(e) => { e.stopPropagation(); handlePlay(); }}
            className="gap-2 h-9 px-4"
            disabled={disabled}
          >
            {isThisLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.loading}</span>
              </>
            ) : isCurrentStation && isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>{t.pause}</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>{t.play}</span>
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleFavorite}
              className={cn("h-11 w-11", isFav && "text-red-500")}
              aria-label={isFav ? (language === 'ar' ? 'إزالة من المفضلة' : 'Remove from favorites') : (language === 'ar' ? 'أضف للمفضلة' : 'Add to favorites')}
            >
              <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
            </Button>
            
            <Button
              size="icon"
              variant="ghost"
              onClick={shareStation}
              className={cn("h-11 w-11", shareSuccess && "text-green-500")}
              aria-label={language === 'ar' ? 'مشاركة المحطة' : 'Share station'}
            >
              {shareSuccess ? (
                <Check className="h-4 w-4" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
