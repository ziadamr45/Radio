'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { getStationImageFromData } from '@/lib/station-image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Radio,
  Clock,
  Sparkles,
  Heart,
  TrendingUp,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  Play,
  Headphones,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeOfDay, RadioStation, ContentFilter } from '@/types/radio';

// Fallback image
const FALLBACK_IMAGE = '/images/default-station.png';

// Time of day icons and labels
const TIME_OF_DAY_CONFIG: Record<TimeOfDay, { icon: typeof Sun; labelAr: string; labelEn: string; color: string }> = {
  morning: { icon: Sunrise, labelAr: 'الصباح', labelEn: 'Morning', color: 'text-yellow-500' },
  afternoon: { icon: Sun, labelAr: 'الظهيرة', labelEn: 'Afternoon', color: 'text-orange-500' },
  evening: { icon: Sunset, labelAr: 'المساء', labelEn: 'Evening', color: 'text-purple-500' },
  night: { icon: Moon, labelAr: 'الليل', labelEn: 'Night', color: 'text-indigo-500' },
  late_night: { icon: Moon, labelAr: 'وقت متأخر', labelEn: 'Late Night', color: 'text-slate-500' },
};

// Category icons and labels
const CATEGORY_CONFIG: Record<ContentFilter, { labelAr: string; labelEn: string; emoji: string }> = {
  all: { labelAr: 'الكل', labelEn: 'All', emoji: '📻' },
  quran: { labelAr: 'قرآن', labelEn: 'Quran', emoji: '📖' },
  islamic: { labelAr: 'إسلامي', labelEn: 'Islamic', emoji: '🕌' },
  music: { labelAr: 'موسيقى', labelEn: 'Music', emoji: '🎵' },
  news: { labelAr: 'أخبار', labelEn: 'News', emoji: '📰' },
};

export function SmartRecommendations() {
  const {
    language,
    history,
    favorites,
    userPreferences,
    currentStation,
    setCurrentStation,
    setIsPlaying,
    generateTimeBasedRecommendations,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
  } = useRadioStore();
  
  const isArabic = language === 'ar';
  
  // Generate recommendations on mount and when preferences change
  useEffect(() => {
    generateTimeBasedRecommendations();
  }, [generateTimeBasedRecommendations, userPreferences.sessionsCount]);
  
  // Get stations for "Continue Listening" section
  const recentlyPlayed = useMemo(() => {
    return history.slice(0, 5).filter(s => s.stationuuid !== currentStation?.stationuuid);
  }, [history, currentStation]);
  
  // State for API-fetched similar stations (NEW stations the user hasn't heard)
  const [apiSimilarStations, setApiSimilarStations] = useState<RadioStation[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
  const fetchedForRef = useRef<string | null>(null);
  
  // Fetch NEW similar stations from API based on last listened station
  const fetchSimilarStations = useCallback(async (force = false) => {
    if (history.length === 0) return;
    
    const lastStation = history[0];
    
    // Don't re-fetch if we already fetched for this exact station (unless forced)
    if (!force && fetchedForRef.current === lastStation.stationuuid) return;
    
    fetchedForRef.current = lastStation.stationuuid;
    setIsLoadingSimilar(true);
    
    try {
      // Build the tags parameter from the last station's tags
      const stationTags = lastStation.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      // Pick the most relevant tags (first 3)
      const relevantTags = stationTags.slice(0, 3).join(',');
      
      // Get UUIDs of stations the user already listened to
      const historyUuids = new Set(history.map(s => s.stationuuid));
      
      const params = new URLSearchParams();
      if (lastStation.countrycode) params.set('country', lastStation.countrycode);
      if (relevantTags) params.set('tags', relevantTags);
      params.set('exclude', lastStation.stationuuid);
      params.set('limit', '10');
      
      const response = await fetch(`/api/station/related?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      const result = await response.json();
      const fetchedStations: RadioStation[] = result.data || [];
      
      // Filter out stations the user already listened to and keep only working ones
      const newStations = fetchedStations
        .filter((s: RadioStation) => 
          !historyUuids.has(s.stationuuid) && 
          s.lastcheckok === 1
        )
        .slice(0, 5);
      
      setApiSimilarStations(newStations);
    } catch (error) {
      console.error('[SmartRecommendations] Failed to fetch similar stations:', error);
      setApiSimilarStations([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  }, [history]);
  
  // Fetch similar stations when history changes (new station played)
  useEffect(() => {
    if (history.length > 0) {
      fetchSimilarStations();
    }
  }, [history.length, history[0]?.stationuuid, fetchSimilarStations]);
  
  // Get top categories
  const topCategories = useMemo(() => {
    return userPreferences.favoriteCategories.slice(0, 3);
  }, [userPreferences.favoriteCategories]);

  const handlePlayStation = (station: RadioStation) => {
    setCurrentStation(station);
    setIsPlaying(true);
  };
  
  const handleToggleFavorite = (station: RadioStation) => {
    if (isFavorite(station.stationuuid)) {
      removeFromFavorites(station.stationuuid);
    } else {
      addToFavorites(station);
    }
  };
  
  if (history.length === 0 && favorites.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Your Listening Stats */}
      {userPreferences.sessionsCount > 0 && (
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-[#2D8B8B]/5 to-[#2D8B8B]/10">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-[#2D8B8B]">
              <TrendingUp className="h-5 w-5" />
              {isArabic ? 'إحصائيات الاستماع' : 'Listening Stats'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-black/20 rounded-xl p-3 text-center border border-[#2D8B8B]/10">
                <Headphones className="h-5 w-5 text-[#2D8B8B] mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{userPreferences.sessionsCount}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'جلسة استماع' : 'Sessions'}</p>
              </div>
              <div className="bg-white dark:bg-black/20 rounded-xl p-3 text-center border border-[#2D8B8B]/10">
                <Clock className="h-5 w-5 text-[#2D8B8B] mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{Math.floor(userPreferences.totalListeningTime / 60)}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'دقيقة استماع' : 'Minutes'}</p>
              </div>
              <div className="bg-white dark:bg-black/20 rounded-xl p-3 text-center border border-[#2D8B8B]/10">
                <Heart className="h-5 w-5 text-[#2D8B8B] mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{favorites.length}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'محطة مفضلة' : 'Favorites'}</p>
              </div>
              <div className="bg-white dark:bg-black/20 rounded-xl p-3 text-center border border-[#2D8B8B]/10">
                <Sunrise className="h-5 w-5 text-[#2D8B8B] mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{Math.floor(userPreferences.averageSessionDuration / 60)}</p>
                <p className="text-xs text-muted-foreground">{isArabic ? 'دقيقة متوسط' : 'Avg Min'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Listening */}
      {recentlyPlayed.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            {isArabic ? 'استمر في الاستماع' : 'Continue Listening'}
          </h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-4">
              {recentlyPlayed.map((station) => {
                const stationImage = getStationImageFromData(station.stationuuid, station.name, station.favicon);
                return (
                  <Card 
                    key={station.stationuuid}
                    className="flex-shrink-0 w-[180px] cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePlayStation(station)}
                  >
                    <CardContent className="p-3">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden mb-2 mx-auto">
                        <img 
                          src={stationImage}
                          alt={station.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <p className="font-medium text-sm truncate text-center">{station.name}</p>
                      <p className="text-xs text-muted-foreground truncate text-center">{station.country}</p>
                      <div className="flex justify-center mt-2 gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(station);
                          }}
                        >
                          <Heart className={cn(
                            "h-3.5 w-3.5",
                            isFavorite(station.stationuuid) && "fill-red-500 text-red-500"
                          )} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      
      {/* Your Favorites */}
      {favorites.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {isArabic ? 'المفضلة لديك' : 'Your Favorites'}
          </h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-4">
              {favorites.slice(0, 10).map((station) => {
                const stationImage = getStationImageFromData(station.stationuuid, station.name, station.favicon);
                return (
                  <Card 
                    key={station.stationuuid}
                    className="flex-shrink-0 w-[180px] cursor-pointer hover:shadow-md transition-shadow border-red-500/20"
                    onClick={() => handlePlayStation(station)}
                  >
                    <CardContent className="p-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden mb-2 mx-auto ring-2 ring-red-500/30">
                        <img 
                          src={stationImage}
                          alt={station.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                          }}
                        />
                      </div>
                      <p className="font-medium text-sm truncate text-center">{station.name}</p>
                      <p className="text-xs text-muted-foreground truncate text-center">{station.country}</p>
                      <div className="flex justify-center mt-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7">
                          <Play className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
      
      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            {isArabic ? 'الفئات المفضلة' : 'Your Top Categories'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {topCategories.map((cat) => {
              const config = CATEGORY_CONFIG[cat.category];
              return (
                <Badge 
                  key={cat.category} 
                  variant="secondary"
                  className="py-2 px-3 text-sm gap-2"
                >
                  <span>{config.emoji}</span>
                  <span>{isArabic ? config.labelAr : config.labelEn}</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-xs">
                    {Math.floor(cat.listenTime / 60)}{isArabic ? ' د' : 'm'}
                  </span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Because you listened to - NEW stations from API */}
      {history.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            {isArabic ? 'لأنك استمعت إلى' : 'Because you listened to'}
            {history[0] && (
              <span className="text-muted-foreground font-normal">
                "{history[0].name}"
              </span>
            )}
            {!isLoadingSimilar && apiSimilarStations.length > 0 && (
              <button
                onClick={() => fetchSimilarStations(true)}
                className="mr-auto p-1 rounded-full hover:bg-muted transition-colors"
                title={isArabic ? 'تحديث' : 'Refresh'}
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-4">
              {isLoadingSimilar ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={`skeleton-${i}`} className="flex-shrink-0 w-[180px]">
                    <CardContent className="p-3">
                      <Skeleton className="w-16 h-16 rounded-lg mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto mb-1" />
                      <Skeleton className="h-3 w-16 mx-auto" />
                    </CardContent>
                  </Card>
                ))
              ) : apiSimilarStations.length > 0 ? (
                apiSimilarStations.map((station) => {
                  const stationImage = getStationImageFromData(station.stationuuid, station.name, station.favicon);
                  return (
                    <Card 
                      key={station.stationuuid}
                      className="flex-shrink-0 w-[180px] cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handlePlayStation(station)}
                    >
                      <CardContent className="p-3">
                        <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden mb-2 mx-auto">
                          <img 
                            src={stationImage}
                            alt={station.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                            }}
                          />
                        </div>
                        <p className="font-medium text-sm truncate text-center">{station.name}</p>
                        <p className="text-xs text-muted-foreground truncate text-center">{station.country}</p>
                        <div className="flex justify-center mt-2 gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(station);
                            }}
                          >
                            <Heart className={cn(
                              "h-3.5 w-3.5",
                              isFavorite(station.stationuuid) && "fill-red-500 text-red-500"
                            )} />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7">
                            <Play className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                // No similar stations found from API - show message
                <div className="flex items-center justify-center py-6 w-full text-muted-foreground text-sm">
                  {isArabic ? 'لا توجد محطات مشابهة جديدة حالياً' : 'No new similar stations found'}
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
