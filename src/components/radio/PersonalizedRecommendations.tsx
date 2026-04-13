'use client';

import { useRadioStore } from '@/stores/radio-store';
import { StationCard } from './StationCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  Clock, 
  TrendingUp, 
  Heart, 
  History,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import type { RadioStation } from '@/types/radio';
import { useCallback, useState } from 'react';

// Individual scrollable section
interface ScrollableSectionProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  stations: RadioStation[];
  language: 'ar' | 'en';
  isLoading?: boolean;
  onPlay: (station: RadioStation) => void;
}

function ScrollableSection({ 
  title, 
  subtitle, 
  icon: Icon, 
  stations, 
  language,
  isLoading = false,
  onPlay,
}: ScrollableSectionProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft);
  };
  
  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(`section-${title.replace(/\s/g, '-')}`);
    if (!container) return;
    
    const scrollAmount = 320;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };
  
  if (stations.length === 0 && !isLoading) return null;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        {stations.length > 3 && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => scroll('left')}
              aria-label={language === 'ar' ? 'تمرير لليسار' : 'Scroll left'}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => scroll('right')}
              aria-label={language === 'ar' ? 'تمرير لليمين' : 'Scroll right'}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => (
            <Card key={i} className="min-w-[300px] max-w-[300px] flex-shrink-0">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stations.length > 0 ? (
        <div 
          id={`section-${title.replace(/\s/g, '-')}`}
          className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onScroll={handleScroll}
        >
          {stations.map(station => (
            <div key={station.stationuuid} className="min-w-[300px] max-w-[300px] flex-shrink-0">
              <StationCard station={station} onPlay={onPlay} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface PersonalizedRecommendationsProps {
  stations: RadioStation[];
  trendingStations: RadioStation[];
  onPlay: (station: RadioStation) => void;
  isLoading?: boolean;
}

export function PersonalizedRecommendations({ 
  stations, 
  trendingStations, 
  onPlay,
  isLoading = false 
}: PersonalizedRecommendationsProps) {
  const {
    language,
    userPreferences,
    favorites,
    history,
    getTimeOfDay,
    getPreferredStationsForTime,
  } = useRadioStore();
  
  const timeOfDay = getTimeOfDay();
  
  // Time-based greeting
  const getTimeGreeting = () => {
    if (language === 'ar') {
      switch (timeOfDay) {
        case 'morning': return 'صباح الخير ☀️';
        case 'afternoon': return 'مساء الخير 🌤️';
        case 'evening': return 'مساء النور 🌆';
        case 'night': return 'مساء متأخر 🌙';
        case 'late_night': return 'وقت متأخر من الليل 🌜';
        default: return 'أهلاً بك';
      }
    } else {
      switch (timeOfDay) {
        case 'morning': return 'Good Morning ☀️';
        case 'afternoon': return 'Good Afternoon 🌤️';
        case 'evening': return 'Good Evening 🌆';
        case 'night': return 'Good Night 🌙';
        case 'late_night': return 'Late Night 🌜';
        default: return 'Welcome';
      }
    }
  };
  
  // Get stations based on time preference
  const getTimeBasedStations = useCallback(() => {
    const preferredIds = getPreferredStationsForTime();
    if (preferredIds.length === 0) return [];
    
    return history.filter(s => preferredIds.includes(s.stationuuid)).slice(0, 5);
  }, [getPreferredStationsForTime, history]);
  
  // Get stations similar to favorites
  const getSimilarToPlayed = useCallback(() => {
    if (history.length === 0) return [];
    
    const lastPlayed = history[0];
    const lastTags = lastPlayed.tags.toLowerCase().split(',');
    
    return stations.filter(s => {
      if (s.stationuuid === lastPlayed.stationuuid) return false;
      const stationTags = s.tags.toLowerCase().split(',');
      return stationTags.some(tag => lastTags.includes(tag));
    }).slice(0, 5);
  }, [history, stations]);
  
  // Get category recommendations
  const getCategoryRecommendations = useCallback(() => {
    const { favoriteCategories } = userPreferences;
    if (favoriteCategories.length === 0) return [];
    
    const topCategory = favoriteCategories[0]?.category;
    if (!topCategory || topCategory === 'all') return [];
    
    const categoryKeywords: Record<string, string[]> = {
      quran: ['quran', 'قرآن', 'koran'],
      islamic: ['islam', 'islamic', 'إسلام', 'nasheed'],
      music: ['music', 'موسيقى', 'songs', 'أغاني'],
      news: ['news', 'أخبار', 'news talk'],
    };
    
    const keywords = categoryKeywords[topCategory] || [];
    
    return stations.filter(s => {
      const tags = s.tags.toLowerCase();
      const name = s.name.toLowerCase();
      return keywords.some(kw => tags.includes(kw) || name.includes(kw));
    }).slice(0, 5);
  }, [userPreferences, stations]);
  
  const timeBasedStations = getTimeBasedStations();
  const similarStations = getSimilarToPlayed();
  const categoryRecommendations = getCategoryRecommendations();
  
  const hasAnyRecommendations = 
    timeBasedStations.length > 0 || 
    similarStations.length > 0 || 
    categoryRecommendations.length > 0 ||
    favorites.length > 0 ||
    history.length > 0;
  
  if (!hasAnyRecommendations && !isLoading) {
    return null;
  }
  
  return (
    <div className="space-y-8">
      {/* Time-based Greeting */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {getTimeGreeting()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'إليك بعض الاقتراحات المخصصة لك'
              : 'Here are some personalized recommendations for you'}
          </p>
        </CardContent>
      </Card>
      
      {/* Continue Listening - Based on time habits */}
      {timeBasedStations.length > 0 && (
        <ScrollableSection
          title={language === 'ar' ? 'استمر في الاستماع' : 'Continue Listening'}
          subtitle={language === 'ar' 
            ? 'بناءً على عاداتك في هذا الوقت' 
            : 'Based on your habits at this time'}
          icon={Clock}
          stations={timeBasedStations}
          language={language}
          onPlay={onPlay}
        />
      )}
      
      {/* Because You Listened */}
      {similarStations.length > 0 && (
        <ScrollableSection
          title={language === 'ar' ? 'لأنك استمعت إلى...' : 'Because You Listened To...'}
          subtitle={history[0]?.name}
          icon={Sparkles}
          stations={similarStations}
          language={language}
          onPlay={onPlay}
        />
      )}
      
      {/* Category Recommendations */}
      {categoryRecommendations.length > 0 && (
        <ScrollableSection
          title={language === 'ar' ? 'موصى لك' : 'Recommended For You'}
          subtitle={userPreferences.favoriteCategories[0] ? 
            (language === 'ar' 
              ? `لأنك تحب ${userPreferences.favoriteCategories[0].category === 'quran' ? 'القرآن' : 
                  userPreferences.favoriteCategories[0].category === 'islamic' ? 'المحتوى الإسلامي' :
                  userPreferences.favoriteCategories[0].category === 'music' ? 'الموسيقى' : 'الأخبار'}`
              : `Because you like ${userPreferences.favoriteCategories[0].category}`) 
            : undefined}
          icon={TrendingUp}
          stations={categoryRecommendations}
          language={language}
          onPlay={onPlay}
        />
      )}
      
      {/* Your Favorites */}
      {favorites.length > 0 && (
        <ScrollableSection
          title={language === 'ar' ? 'مفضلتك' : 'Your Favorites'}
          icon={Heart}
          stations={favorites.slice(0, 5)}
          language={language}
          onPlay={onPlay}
        />
      )}
      
      {/* Recently Played */}
      {history.length > 0 && (
        <ScrollableSection
          title={language === 'ar' ? 'استمعت مؤخراً' : 'Recently Played'}
          icon={History}
          stations={history.slice(0, 5)}
          language={language}
          onPlay={onPlay}
        />
      )}
    </div>
  );
}
