'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useUserData } from '@/components/providers/UserDataProvider';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Play,
  Pause,
  Heart,
  Share2,
  Globe,
  Signal,
  Headphones,
  ThumbsUp,
  Loader2,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RadioStation } from '@/types/radio';
import { getStationImage as getStationImageUtil, getRandomDefaultImage } from '@/lib/station-image';
import { generateShareContent } from '@/lib/share-utils';
import { toast } from 'sonner';

interface StationDetailSheetProps {
  station: RadioStation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Inner component that remounts when station changes (resets all state)
function StationDetailContent({
  station,
  onOpenChange,
}: {
  station: RadioStation;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    currentStation,
    isPlaying,
    setIsPlaying,
    setCurrentStation,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    language,
    isLoading,
  } = useRadioStore();

  const { saveFavorite, saveHistory } = useUserData();
  const isArabic = language === 'ar';
  const isCurrentStation = currentStation?.stationuuid === station.stationuuid;
  const isFav = isFavorite(station.stationuuid);
  const isThisLoading = isLoading && isCurrentStation;

  const [relatedStations, setRelatedStations] = useState<RadioStation[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(!!station.countrycode);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [imageErrorCount, setImageErrorCount] = useState(0);

  // Compute station image directly from station prop
  const stationImage = useMemo(() => {
    if (imageErrorCount > 0) return getRandomDefaultImage(station.stationuuid, station.name, station.tags);
    return getStationImageUtil(station);
  }, [station, imageErrorCount]);

  // Fetch related stations on mount (component remounts when station changes via key)
  useEffect(() => {
    if (!station.countrycode) return;

    let cancelled = false;
    const controller = new AbortController();

    fetch(`/api/station/related?country=${station.countrycode}&tags=${encodeURIComponent(station.tags || '')}&exclude=${station.stationuuid}&limit=6`, {
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        if (!cancelled && data.success && data.data) {
          setRelatedStations(data.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          setRelatedLoading(false);
        }
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [station]);

  const handleImageError = useCallback(() => {
    setImageErrorCount(prev => prev + 1);
  }, []);

  const handlePlay = useCallback(() => {
    if (isCurrentStation) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
      saveHistory(station);
    }
  }, [station, isCurrentStation, isPlaying, setIsPlaying, setCurrentStation, saveHistory]);

  const toggleFavorite = useCallback(async () => {
    if (isFav) {
      removeFromFavorites(station.stationuuid);
      await saveFavorite(station, false);
    } else {
      addToFavorites(station);
      await saveFavorite(station, true);
    }
  }, [isFav, station, removeFromFavorites, addToFavorites, saveFavorite]);

  const shareStation = useCallback(async () => {
    const shareContent = generateShareContent(station, language, isFav);

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareContent.title,
          text: shareContent.text,
          url: shareContent.url,
        });
        setShareSuccess(true);
        toast.success(isArabic ? 'تم مشاركة المحطة!' : 'Station shared!');
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share error:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareContent.url);
        setShareSuccess(true);
        toast.success(isArabic ? 'تم نسخ رابط المحطة!' : 'Station link copied!');
        setTimeout(() => setShareSuccess(false), 2000);
      } catch (err) {
        console.error('Clipboard error:', err);
        toast.error(isArabic ? 'فشل نسخ الرابط' : 'Failed to copy link');
      }
    }
  }, [station, language, isFav, isArabic]);

  const tags = station.tags ? station.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <>
      <div className="overflow-y-auto h-full px-4 pb-8" dir={isArabic ? 'rtl' : 'ltr'}>
        {/* Station Image */}
        <div className="relative w-full aspect-[2.5/1] rounded-xl overflow-hidden bg-muted mb-3">
          <img
            src={stationImage}
            alt={station.name}
            className="w-full h-full object-contain"
            onError={handleImageError}
          />

          {/* Now Playing indicator */}
          {isCurrentStation && isPlaying && (
            <div className="absolute top-3 end-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {isArabic ? 'يعمل الآن' : 'Now Playing'}
            </div>
          )}
        </div>

        {/* Station Name (separate below image) */}
        <div className="mb-4">
          <h2 className="text-xl font-bold truncate">{station.name}</h2>
          {station.country && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
              <Globe className="h-3.5 w-3.5" />
              {station.country}
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {station.country && (
            <div className="bg-muted/50 rounded-lg p-2.5 text-center">
              <Globe className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">{isArabic ? 'الدولة' : 'Country'}</p>
              <p className="text-xs font-medium truncate">{station.country}</p>
            </div>
          )}
          {station.bitrate > 0 && (
            <div className="bg-muted/50 rounded-lg p-2.5 text-center">
              <Signal className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">{isArabic ? 'الجودة' : 'Quality'}</p>
              <p className="text-xs font-medium">{station.bitrate} kbps</p>
            </div>
          )}
          {station.codec && (
            <div className="bg-muted/50 rounded-lg p-2.5 text-center">
              <Headphones className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">{isArabic ? 'الترميز' : 'Codec'}</p>
              <p className="text-xs font-medium">{station.codec.toUpperCase()}</p>
            </div>
          )}
          {station.votes > 0 && (
            <div className="bg-muted/50 rounded-lg p-2.5 text-center">
              <ThumbsUp className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-xs text-muted-foreground">{isArabic ? 'التقييم' : 'Rating'}</p>
              <p className="text-xs font-medium">{station.votes}</p>
            </div>
          )}
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 8).map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            onClick={handlePlay}
            size="lg"
            className={cn(
              "flex-1 gap-2",
              isCurrentStation && isPlaying && "bg-green-500 hover:bg-green-600"
            )}
            aria-label={isCurrentStation && isPlaying 
              ? (isArabic ? `إيقاف ${station.name} مؤقتاً` : `Pause ${station.name}`) 
              : (isArabic ? `تشغيل ${station.name}` : `Play ${station.name}`)}
          >
            {isThisLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{isArabic ? 'جاري التشغيل...' : 'Loading...'}</span>
              </>
            ) : isCurrentStation && isPlaying ? (
              <>
                <Pause className="h-5 w-5" />
                <span>{isArabic ? 'إيقاف مؤقت' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>{isArabic ? 'شغّل الآن' : 'Play Now'}</span>
              </>
            )}
          </Button>

          <Button
            variant={isFav ? "default" : "outline"}
            size="lg"
            onClick={toggleFavorite}
            className="gap-2 min-w-[44px]"
            aria-label={isFav ? (isArabic ? `إزالة ${station.name} من المفضلة` : `Remove ${station.name} from favorites`) : (isArabic ? `أضف ${station.name} للمفضلة` : `Add ${station.name} to favorites`)}
          >
            <Heart className={cn("h-5 w-5", isFav && "fill-current")} />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={shareStation}
            className="gap-2 min-w-[44px]"
            aria-label={isArabic ? `مشاركة ${station.name}` : `Share ${station.name}`}
          >
            {shareSuccess ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
          </Button>
        </div>

        <Separator className="my-4" />

        {/* About Section */}
        <div className="mb-4">
          <h3 className="font-bold text-base mb-2">
            {isArabic ? `عن إذاعة ${station.name}` : `About ${station.name}`}
          </h3>
          <p className="text-sm text-muted-foreground leading-7">
            {isArabic ? (
              <>
                <strong>{station.name}</strong> إذاعة من <strong>{station.country || station.countrycode || 'العالم'}</strong>.
                استمع إلى <strong>{station.name}</strong> بث مباشر بجودة عالية عبر موقع اسمع راديو.
                {station.bitrate > 0 && ` البث بجودة ${station.bitrate} كيلوبت في الثانية`}
                {station.codec && ` بتقنية ${station.codec.toUpperCase()}`}.
                {tags.length > 0 && ` تغطي المحطة مجالات ${tags.slice(0, 5).join('، ')}.`}
              </>
            ) : (
              <>
                <strong>{station.name}</strong> is a radio station from <strong>{station.country || station.countrycode}</strong>.
                Listen live in high quality on Esmaa Radio.
                {station.bitrate > 0 && ` Streaming at ${station.bitrate} kbps`}
                {station.codec && ` using ${station.codec.toUpperCase()} codec`}.
              </>
            )}
          </p>
        </div>

        <Separator className="my-4" />

        {/* Related Stations */}
        <div>
          <h3 className="font-bold text-base mb-3 flex items-center gap-2">
            {isArabic
              ? `محطات مشابهة من ${station.country || station.countrycode}`
              : `Similar Stations from ${station.country || station.countrycode}`}
          </h3>

          {relatedLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : relatedStations.length > 0 ? (
            <div className="space-y-2">
              {relatedStations.map((relStation) => (
                <RelatedStationItem
                  key={relStation.stationuuid}
                  station={relStation}
                  onSelect={(s) => {
                    // Don't close the sheet — just swap the station in-place.
                    // The key={station.stationuuid} on StationDetailContent forces remount.
                    window.dispatchEvent(new CustomEvent('open-station-detail', { detail: s }));
                  }}
                  language={language}
                  currentStation={currentStation}
                  isPlaying={isPlaying}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isArabic ? 'لم يتم العثور على محطات مشابهة' : 'No similar stations found'}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export function StationDetailSheet({ station, open, onOpenChange }: StationDetailSheetProps) {
  if (!station) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] sm:h-[80vh] rounded-t-2xl overflow-hidden p-0">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        <SheetHeader className="sr-only">
          <SheetTitle>{station.name}</SheetTitle>
        </SheetHeader>

        {/* Key on station UUID forces remount when station changes, resetting all state */}
        <StationDetailContent
          key={station.stationuuid}
          station={station}
          onOpenChange={onOpenChange}
        />
      </SheetContent>
    </Sheet>
  );
}

// Related station item component
function RelatedStationItem({
  station,
  onSelect,
  language,
  currentStation,
  isPlaying,
}: {
  station: RadioStation;
  onSelect: (station: RadioStation) => void;
  language: string;
  currentStation: RadioStation | null;
  isPlaying: boolean;
}) {
  const isArabic = language === 'ar';
  const isCurrentStation = currentStation?.stationuuid === station.stationuuid;
  const img = getStationImageUtil(station);

  return (
    <button
      onClick={() => onSelect(station)}
      className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-start"
    >
      <div className="w-11 h-11 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative">
        <img
          src={img}
          alt={station.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/icons/icon-72x72.png';
          }}
        />
        {isCurrentStation && isPlaying && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{station.name}</p>
        <p className="text-xs text-muted-foreground truncate">{station.country || station.countrycode}</p>
        <div className="flex gap-1 mt-0.5">
          {station.bitrate > 0 && (
            <span className="text-[9px] text-muted-foreground">{station.bitrate}kbps</span>
          )}
          {station.tags && station.tags.split(',').slice(0, 2).map((tag, i) => (
            <span key={i} className="text-[9px] text-muted-foreground">{tag.trim()}</span>
          ))}
        </div>
      </div>
    </button>
  );
}
