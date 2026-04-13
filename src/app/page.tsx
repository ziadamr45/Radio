'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef, Fragment, Suspense } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useQuranStore } from '@/stores/quran-store';
import { translations } from '@/lib/translations';
import { getTimeOfDay, getTimeBasedRecommendation, getGreetingText } from '@/lib/time-utils';
import { debounce } from '@/lib/performance';
import { normalizeSearch, matchesSearch } from '@/lib/search-normalize';
import { Header } from '@/components/radio/Header';
import { StationCard } from '@/components/radio/StationCard';
import { CountrySelector } from '@/components/radio/CountrySelector';
import { MoodSelector } from '@/components/radio/MoodSelector';
import { ContentFilter } from '@/components/radio/ContentFilter';
import { SleepTimerSheet } from '@/components/radio/SleepTimer';
// SleepTimerManager moved to layout.tsx for global persistence
import dynamic from 'next/dynamic';
// Dynamic imports for heavy components - reduces initial bundle size significantly
const AIAssistant = dynamic(() => import('@/components/radio/AIAssistant').then(m => ({ default: m.AIAssistant })), { ssr: false });
const AnimatedBackground = dynamic(() => import('@/components/radio/AnimatedBackground').then(m => ({ default: m.AnimatedBackground })), { ssr: false });
const SplashScreen = dynamic(() => import('@/components/radio/SplashScreen').then(m => ({ default: m.SplashScreen })), { ssr: false });
const QuranSection = dynamic(() => import('@/components/quran/QuranSection').then(m => ({ default: m.QuranSection })), { ssr: false });
const SmartRecommendations = dynamic(() => import('@/components/recommendations/SmartRecommendations').then(m => ({ default: m.SmartRecommendations })), { ssr: false });
const SettingsPanel = dynamic(() => import('@/components/radio/SettingsPanel').then(m => ({ default: m.SettingsPanel })), { ssr: false });
// QuranMiniPlayer & EnhancedMiniPlayer moved to layout.tsx for global persistence
import { OfflineHandler } from '@/components/offline/OfflineHandler';
import { NamePrompt } from '@/components/notifications/NamePrompt';
import { StationDetailSheet } from '@/components/radio/StationDetailSheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Search,
  RefreshCw,
  Radio,
  TrendingUp,
  Star,
  Clock,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  BookOpen,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RadioStation, NetworkQuality } from '@/types/radio';
import { SEOContent } from '@/components/seo/SEOContent';
import { VoiceButton } from '@/components/VoiceButton';


// Network quality indicator
const QUALITY_COLORS: Record<NetworkQuality, string> = {
  excellent: 'bg-green-500',
  good: 'bg-emerald-500',
  fair: 'bg-yellow-500',
  poor: 'bg-orange-500',
  offline: 'bg-red-500',
};

export default function Home() {
  const {
    language,
    selectedCountry,
    contentFilter,
    selectedMood,
    islamicMode,
    history,
    isPlaying,
    setIsPlaying,
    currentStation,
    setCurrentStation,
    networkStatus,
    updateNetworkStatus,
    generateTimeBasedRecommendations,
    settingsOpen,
    setSettingsOpen,
  } = useRadioStore();
  
  const {
    currentAudio: quranAudio,
    isPlaying: quranIsPlaying,
    setIsPlaying: setQuranIsPlaying,
  } = useQuranStore();
  
  const t = translations[language];
  
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [trendingStations, setTrendingStations] = useState<RadioStation[]>([]);
  const [topVotedStations, setTopVotedStations] = useState<RadioStation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreStations, setHasMoreStations] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Scroll to top when switching tabs
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [showStationDetail, setShowStationDetail] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 200;
  
  // Debounced search - only update after 300ms of no typing
  const debouncedSetSearch = useMemo(
    () => debounce(((value: unknown) => setDebouncedSearchQuery(value as string)), 300),
    []
  );
  
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    debouncedSetSearch(value);
  }, [debouncedSetSearch]);
  
  const isOnline = networkStatus.isOnline;
  const quality = networkStatus.quality;
  
  // Initialize on mount only
  useEffect(() => {
    setMounted(true);
    // تأكد إن الـ settings مغلقة عند أول تحميل فقط
    setSettingsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Stop radio when Quran plays
  useEffect(() => {
    if (quranIsPlaying && quranAudio) {
      setIsPlaying(false);
    }
  }, [quranIsPlaying, quranAudio, setIsPlaying]);

  // Listen for navigation to Quran tab from AI Assistant
  useEffect(() => {
    const handleNavigateToQuran = () => {
      handleTabChange('quran');
    };
    
    window.addEventListener('navigateToQuran', handleNavigateToQuran);
    return () => window.removeEventListener('navigateToQuran', handleNavigateToQuran);
  }, []);
  
  // Initialize network monitoring - stable effect
  useEffect(() => {
    if (!mounted) return;
    
    updateNetworkStatus();
    generateTimeBasedRecommendations();
    
    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check network periodically
    const interval = setInterval(updateNetworkStatus, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [mounted]); // Removed function dependencies
  
  // Apply client-side filters to station list
  const applyFilters = useCallback((stationList: RadioStation[]): RadioStation[] => {
    let filtered = stationList;
    
    // Apply content filter
    if (contentFilter !== 'all') {
      const filterTags: Record<string, string[]> = {
        quran: ['quran', 'قرآن', 'koran', 'quran kareem'],
        islamic: ['islam', 'islamic', 'إسلام', 'muslim', 'nasheed', 'أناشيد'],
        music: ['music', 'موسيقى', 'pop', 'arabic music', 'songs', 'أغاني'],
        news: ['news', 'أخبار', 'akhbar', 'news talk'],
      };
      
      const tags = filterTags[contentFilter] || [];
      filtered = filtered.filter((station: RadioStation) => {
        const stationTags = station.tags.toLowerCase();
        const stationName = station.name.toLowerCase();
        return tags.some((tag) =>
          stationTags.includes(tag) || stationName.includes(tag)
        );
      });
    }
    
    // Apply Islamic mode filter
    if (islamicMode) {
      filtered = filtered.filter((station: RadioStation) => {
        const tags = station.tags.toLowerCase();
        const name = station.name.toLowerCase();
        const islamicKeywords = ['quran', 'islam', 'إسلام', 'قرآن', 'nasheed', 'أناشيد'];
        return islamicKeywords.some((keyword) =>
          tags.includes(keyword) || name.includes(keyword)
        );
      });
    }
    
    // Apply mood filter
    if (selectedMood) {
      const moodKeywords: Record<string, string[]> = {
        calm: ['calm', 'relax', 'هادئ', 'relaxing', 'peaceful', 'sleep', 'نوم'],
        focus: ['focus', 'study', 'تركيز', 'concentration', 'work', 'reading'],
        energetic: ['energetic', 'workout', 'نشيط', 'dance', 'party', 'upbeat'],
        spiritual: ['quran', 'islamic', 'روحاني', 'spiritual', 'nasheed', 'أناشيد'],
      };
      
      const keywords = moodKeywords[selectedMood] || [];
      filtered = filtered.filter((station: RadioStation) => {
        const tags = station.tags.toLowerCase();
        const name = station.name.toLowerCase();
        return keywords.some((keyword) =>
          tags.includes(keyword) || name.includes(keyword)
        );
      });
    }
    
    return filtered;
  }, [contentFilter, islamicMode, selectedMood]);

  // Fetch stations (initial load)
  const fetchStations = useCallback(async () => {
    if (!isOnline) return;
    
    setIsLoading(true);
    setCurrentOffset(0);
    try {
      let url = `/api/radio?action=stations&country=${selectedCountry}&limit=${PAGE_SIZE}&offset=0`;
      
      if (debouncedSearchQuery) {
        // Normalize search: fix common Arabic typos (ة↔ه, أ→ا, extra spaces, etc.)
        const normalizedQuery = normalizeSearch(debouncedSearchQuery);
        url += `&search=${encodeURIComponent(normalizedQuery)}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        const filteredStations = applyFilters(data.data);
        setStations(filteredStations);
        setHasMoreStations(!!data.hasMore && !debouncedSearchQuery);
        setCurrentOffset(PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCountry, debouncedSearchQuery, applyFilters, isOnline]);

  // Load more stations (pagination)
  const loadMoreStations = useCallback(async () => {
    if (!isOnline || isLoadingMore || !hasMoreStations) return;
    
    setIsLoadingMore(true);
    try {
      const url = `/api/radio?action=stations&country=${selectedCountry}&limit=${PAGE_SIZE}&offset=${currentOffset}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        const newFiltered = applyFilters(data.data);
        setStations((prev) => [...prev, ...newFiltered]);
        setHasMoreStations(!!data.hasMore);
        setCurrentOffset((prev) => prev + PAGE_SIZE);
      }
    } catch (error) {
      console.error('Error loading more stations:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [selectedCountry, currentOffset, isLoadingMore, hasMoreStations, applyFilters, isOnline]);

  // Infinite scroll observer
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreStations && !isLoadingMore) {
          loadMoreStations();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMoreStations, isLoadingMore, loadMoreStations]);
  
  // Fetch trending stations
  const fetchTrending = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const response = await fetch(`/api/radio?action=trending&country=${selectedCountry}&limit=30`);
      const data = await response.json();
      
      if (data.success) {
        setTrendingStations(data.data);
      }
    } catch (error) {
      console.error('Error fetching trending:', error);
    }
  }, [selectedCountry, isOnline]);
  
  // Fetch top voted stations
  const fetchTopVoted = useCallback(async () => {
    if (!isOnline) return;
    
    try {
      const response = await fetch(`/api/radio?action=topvoted&country=${selectedCountry}&limit=30`);
      const data = await response.json();
      
      if (data.success) {
        setTopVotedStations(data.data);
      }
    } catch (error) {
      console.error('Error fetching top voted:', error);
    }
  }, [selectedCountry, isOnline]);
  
  useEffect(() => {
    fetchStations();
    fetchTrending();
    fetchTopVoted();
  }, [fetchStations, fetchTrending, fetchTopVoted]);
  
  // Listen for open-station-detail custom event (from StationDetailSheet related stations)
  useEffect(() => {
    const handleOpenStationDetail = (e: Event) => {
      const station = (e as CustomEvent).detail as RadioStation;
      if (station) {
        setSelectedStation(station);
        setShowStationDetail(true);
      }
    };
    window.addEventListener('open-station-detail', handleOpenStationDetail);
    return () => window.removeEventListener('open-station-detail', handleOpenStationDetail);
  }, []);

  const handleStationClick = useCallback((station: RadioStation) => {
    setSelectedStation(station);
    setShowStationDetail(true);
  }, []);

  const handlePlay = useCallback((station: RadioStation) => {
    if (!isOnline) return;
    
    // Stop Quran if playing - pause the audio element directly
    setQuranIsPlaying(false);
    // Dispatch custom event to stop Quran audio
    window.dispatchEvent(new CustomEvent('stopQuranAudio'));
    
    setCurrentStation(station);
    setIsPlaying(true);
  }, [isOnline, setQuranIsPlaying, setCurrentStation, setIsPlaying]);
  
  // Calculate time-based recommendation on client side only to avoid hydration mismatch
  const timeRecommendation = useMemo(() => {
    if (!mounted) {
      // Return default to avoid hydration mismatch
      return {
        title: language === 'ar' ? 'اقتراحات' : 'Recommendations',
        subtitle: language === 'ar' ? 'اختر محطتك المفضلة' : 'Choose your favorite station',
        emoji: '📻',
      };
    }
    
    return getTimeBasedRecommendation(getTimeOfDay(), language);
  }, [mounted, language]);
  
  // Count active filters
  const activeFiltersCount = [
    contentFilter !== 'all' ? 1 : 0,
    selectedMood ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Filter function for stations - unified with applyFilters above (deduplicated)
  const applyFiltersToStations = applyFilters;

  // Apply filters to trending and top voted
  const filteredTrending = useMemo(() => applyFiltersToStations(trendingStations), [trendingStations, applyFiltersToStations]);
  const filteredTopVoted = useMemo(() => applyFiltersToStations(topVotedStations), [topVotedStations, applyFiltersToStations]);
  
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen onLoadingComplete={() => setShowSplash(false)} />
      )}
      
      {/* Animated Background */}
      <Suspense fallback={null}>
        <AnimatedBackground />
      </Suspense>
      
      {/* Sleep Timer Manager moved to layout.tsx for global persistence */}
      
      {/* Name Prompt - Shows periodically until user enters their name */}
      <NamePrompt />
      
      {/* Main Content - Hidden during splash */}
      <div className={cn("flex flex-col flex-1", showSplash && "opacity-0 pointer-events-none")}>
      {/* Settings Panel - Using Sheet for better UX */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side={language === 'ar' ? 'left' : 'right'} className="w-full sm:max-w-md overflow-y-auto p-0 [&>button]:hidden">
          <SettingsPanel onBack={() => setSettingsOpen(false)} />
        </SheetContent>
      </Sheet>
      
      {/* Station Detail Sheet */}
      <StationDetailSheet
        station={selectedStation}
        open={showStationDetail}
        onOpenChange={setShowStationDetail}
      />
      
      {/* Main Content */}
      <div>
          {/* Offline Handler - Shows banner at top when offline */}
          <OfflineHandler />
          
          {/* Header */}
          <Header />
      
      {/* Weak Connection Warning - Only show when online but connection is poor */}
      {isOnline && quality === 'poor' && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <Wifi className="h-4 w-4 text-orange-500" />
          <span className="text-orange-600 dark:text-orange-400">
            {language === 'ar' ? 'اتصال ضعيف' : 'Weak connection'}
          </span>
          <div className={cn("w-2 h-2 rounded-full", QUALITY_COLORS[quality])} />
        </div>
      )}
      
      {/* Main Content */}
      <main id="main-content" className="flex-1 container mx-auto px-4 py-6 pb-28 relative z-10">
        {/* Greeting Section - Show prominently */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {mounted ? getGreetingText(getTimeOfDay(), language) : (language === 'ar' ? 'مرحباً' : 'Hello')}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'اختر ما تريد الاستماع إليه' : 'Choose what you want to listen to'}
          </p>
        </div>

        {/* Tabs - Under the greeting */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-6">
          <TabsList className={cn(
            "w-full flex overflow-x-auto gap-1 h-12 px-1 scrollbar-hide",
            language === 'ar' ? 'justify-end flex-row-reverse' : 'justify-start'
          )}>
            {/* Tabs ordered RTL for Arabic, LTR for English */}
            {language === 'ar' ? (
              // Arabic: reverse order (RTL)
              <>
                <TabsTrigger value="recent" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.recentStations}</span>
                </TabsTrigger>
                <TabsTrigger value="top" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <Star className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.topRated}</span>
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.trendingStations}</span>
                </TabsTrigger>
                <TabsTrigger value="quran" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.quran}</span>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <Radio className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.stations}</span>
                </TabsTrigger>
              </>
            ) : (
              // English: normal order (LTR)
              <>
                <TabsTrigger value="all" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <Radio className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.stations}</span>
                </TabsTrigger>
                <TabsTrigger value="quran" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <BookOpen className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.quran}</span>
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.trendingStations}</span>
                </TabsTrigger>
                <TabsTrigger value="top" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <Star className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.topRated}</span>
                </TabsTrigger>
                <TabsTrigger value="recent" className="flex flex-col gap-0.5 h-full py-1 px-3 min-w-[60px]">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span className="text-[10px] leading-tight">{t.recentStations}</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>
          
          {/* Quran Section */}
          <TabsContent value="quran" className="mt-6">
            <Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" /></div>}>
              <QuranSection />
            </Suspense>
          </TabsContent>
          
          {/* All Stations */}
          <TabsContent value="all" className="mt-6">
            {/* Smart Recommendations - Only show if user has history */}
            {history.length > 0 && (
              <div className="mb-6">
                <SmartRecommendations />
              </div>
            )}
            
            {/* Search and Filters */}
            <div className="space-y-5 mb-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="ps-12 pe-14 h-12 text-base rounded-xl"
                  disabled={!isOnline}
                />
                <div className="absolute end-1 top-1/2 -translate-y-1/2">
                  <VoiceButton
                    onResult={(text) => handleSearchChange(text)}
                    lang={language === 'ar' ? 'ar-SA' : 'en-US'}
                    className="h-10 w-10"
                    disabled={!isOnline}
                  />
                </div>
              </div>

              {/* Country and Actions Row */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CountrySelector />

                <div className="flex items-center gap-2">
                  {/* Network Quality Indicator */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-xs">
                    <div className={cn("w-2 h-2 rounded-full", QUALITY_COLORS[quality])} />
                    <span>
                      {quality === 'excellent' && (language === 'ar' ? 'ممتاز' : 'Excellent')}
                      {quality === 'good' && (language === 'ar' ? 'جيد' : 'Good')}
                      {quality === 'fair' && (language === 'ar' ? 'متوسط' : 'Fair')}
                      {quality === 'poor' && (language === 'ar' ? 'ضعيف' : 'Poor')}
                      {quality === 'offline' && (language === 'ar' ? 'بدون نت' : 'Offline')}
                    </span>
                  </div>

                  <SleepTimerSheet />

                  <Button
                    variant={showFilters ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2 h-10 px-4"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">{language === 'ar' ? 'تصفية' : 'Filter'}</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ms-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {activeFiltersCount}
                      </Badge>
                    )}
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchStations()}
                    disabled={isLoading || !isOnline}
                    className="h-10 w-10"
                    aria-label={language === 'ar' ? 'تحديث المحطات' : 'Refresh stations'}
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <Card className="overflow-hidden border-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <CardContent className="p-5 space-y-6">
                    <ContentFilter />
                    <div className="border-t pt-6">
                      <MoodSelector />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Time-based Recommendations */}
            <Card className="mb-6 bg-gradient-to-br from-primary/5 to-primary/10 border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <span className="text-3xl">{timeRecommendation.emoji}</span>
                  <div>
                    <span>{timeRecommendation.title}</span>
                    <p className="text-sm font-normal text-muted-foreground mt-1">
                      {timeRecommendation.subtitle}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* Google AdSense - اعلان مربع */}
            <div className="mb-6 flex justify-center">
              <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-8502551436802377"
                data-ad-slot="7141508514"
                data-ad-format="auto"
                data-full-width-responsive="true"
              />
              <script dangerouslySetInnerHTML={{
                __html: `(adsbygoogle = window.adsbygoogle || []).push({});`
              }} />
            </div>

            {/* Google AdSense - Autorelaxed */}
            <div className="mb-6 flex justify-center">
              <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-format="autorelaxed"
                data-ad-client="ca-pub-8502551436802377"
                data-ad-slot="9842228438"
              />
              <script dangerouslySetInnerHTML={{
                __html: `(adsbygoogle = window.adsbygoogle || []).push({});`
              }} />
            </div>

            {/* Stations Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="w-16 h-16 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !isOnline ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <WifiOff className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-lg font-medium text-red-600 dark:text-red-400">
                  {language === 'ar' ? 'لا يوجد اتصال بالإنترنت' : 'No Internet Connection'}
                </p>
                <p className="text-sm mt-2 max-w-md mx-auto">
                  {language === 'ar'
                    ? 'تحتاج اتصال بالإنترنت لتحميل المحطات وتشغيلها'
                    : 'Internet connection required to load and play stations'}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() => fetchStations()}
                >
                  <RefreshCw className="h-4 w-4" />
                  {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                </Button>
              </div>
            ) : stations.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Radio className="h-10 w-10 opacity-50" />
                </div>
                <p className="text-lg font-medium">{t.noStationsFound}</p>
                <p className="text-sm mt-2">
                  {language === 'ar'
                    ? 'جرب تغيير الدولة أو البحث بكلمات مختلفة'
                    : 'Try changing the country or search with different keywords'}
                </p>
              </div>
            ) : (
              <Fragment>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* First 6 stations */}
                {stations.slice(0, 6).map((station) => (
                  <StationCard
                    key={station.stationuuid}
                    station={station}
                    onPlay={handlePlay}
                    onStationClick={handleStationClick}
                  />
                ))}
                
                {/* Google AdSense - In-Article Ad between stations */}
                <div className="col-span-full my-4">
                  <ins className="adsbygoogle"
                    style={{ display: 'block', textAlign: 'center' }}
                    data-ad-layout="in-article"
                    data-ad-format="fluid"
                    data-ad-client="ca-pub-8502551436802377"
                    data-ad-slot="2888335097"
                  />
                  <script dangerouslySetInnerHTML={{
                    __html: `(adsbygoogle = window.adsbygoogle || []).push({});`
                  }} />
                </div>
                
                {/* Rest of stations */}
                {stations.slice(6).map((station) => (
                  <StationCard
                    key={station.stationuuid}
                    station={station}
                    onPlay={handlePlay}
                    onStationClick={handleStationClick}
                  />
                ))}
              </div>
              
              {/* Infinite scroll trigger + loading indicator */}
              {hasMoreStations && (
                <div ref={loadMoreRef} className="flex flex-col items-center justify-center py-8 gap-3">
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      <span className="text-sm">
                        {language === 'ar' ? 'جاري تحميل المزيد...' : 'Loading more stations...'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              </Fragment>
            )}
          </TabsContent>

          {/* Trending */}
          <TabsContent value="trending" className="mt-6">
            {!isOnline ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <WifiOff className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-lg font-medium text-red-600 dark:text-red-400">
                  {language === 'ar' ? 'لا يوجد اتصال بالإنترنت' : 'No Internet Connection'}
                </p>
                <p className="text-sm mt-2">
                  {language === 'ar' ? 'المحطات الرواج تحتاج اتصال' : 'Trending stations require connection'}
                </p>
              </div>
            ) : filteredTrending.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-10 w-10 opacity-50" />
                </div>
                <p>{language === 'ar' ? 'لا توجد محطات رواجاً' : 'No trending stations'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* First 6 trending stations */}
                {filteredTrending.slice(0, 6).map((station, index) => (
                  <div key={station.stationuuid} className="relative">
                    <Badge className="absolute -top-2 -start-2 z-10 rounded-full h-7 w-7 p-0 flex items-center justify-center" variant="default">
                      {index + 1}
                    </Badge>
                    <StationCard
                      station={station}
                      onPlay={handlePlay}
                    onStationClick={handleStationClick}
                    />
                  </div>
                ))}
                
                {/* Google AdSense - Fluid Ad */}
                <div className="col-span-full my-4">
                  <ins className="adsbygoogle"
                    style={{ display: 'block' }}
                    data-ad-format="fluid"
                    data-ad-layout-key="-6t+ed+2i-1n-4w"
                    data-ad-client="ca-pub-8502551436802377"
                    data-ad-slot="1418408543"
                  />
                  <script dangerouslySetInnerHTML={{
                    __html: `(adsbygoogle = window.adsbygoogle || []).push({});`
                  }} />
                </div>
                
                {/* Rest of trending stations */}
                {filteredTrending.slice(6).map((station, index) => (
                  <div key={station.stationuuid} className="relative">
                    <Badge className="absolute -top-2 -start-2 z-10 rounded-full h-7 w-7 p-0 flex items-center justify-center" variant="default">
                      {index + 7}
                    </Badge>
                    <StationCard
                      station={station}
                      onPlay={handlePlay}
                    onStationClick={handleStationClick}
                    />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Top Rated */}
          <TabsContent value="top" className="mt-6">
            {!isOnline ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <WifiOff className="h-10 w-10 text-red-500" />
                </div>
                <p className="text-lg font-medium text-red-600 dark:text-red-400">
                  {language === 'ar' ? 'لا يوجد اتصال بالإنترنت' : 'No Internet Connection'}
                </p>
                <p className="text-sm mt-2">
                  {language === 'ar' ? 'المحطات المميزة تحتاج اتصال' : 'Top stations require connection'}
                </p>
              </div>
            ) : filteredTopVoted.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Star className="h-10 w-10 opacity-50" />
                </div>
                <p>{language === 'ar' ? 'لا توجد محطات مميزة' : 'No top rated stations'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopVoted.map((station) => (
                  <StationCard
                    key={station.stationuuid}
                    station={station}
                    onPlay={handlePlay}
                    onStationClick={handleStationClick}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Recent */}
          <TabsContent value="recent" className="mt-6">
            {history.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 opacity-50" />
                </div>
                <p>{language === 'ar' ? 'لم تستمع لأي محطة بعد' : 'No stations played yet'}</p>
                <Button
                  variant="outline"
                  onClick={() => handleTabChange('all')}
                  className="mt-4"
                >
                  {language === 'ar' ? 'اكتشف المحطات' : 'Discover Stations'}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((station) => (
                  <StationCard
                    key={station.stationuuid}
                    station={station}
                    onPlay={handlePlay}
                    onStationClick={handleStationClick}
                    disabled={!isOnline}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      </div>
      
      {/* Mini Players moved to layout.tsx for global persistence */}
      
      {/* AI Assistant */}
      <Suspense fallback={null}>
        <AIAssistant />
      </Suspense>
      
      {/* SEO Content Section */}
      <div className="container mx-auto px-4 relative z-10">
        <SEOContent />
      </div>
      
      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 mt-4 relative z-10 border-t border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-3">
          <a href="/privacy" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded outline-none">
            {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </a>
          <span>|</span>
          <a href="/terms" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded outline-none">
            {language === 'ar' ? 'شروط الاستخدام' : 'Terms of Service'}
          </a>
          <span>|</span>
          <a href="/about" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded outline-none">
            {language === 'ar' ? 'من نحن' : 'About Us'}
          </a>
          <span>|</span>
          <a href="/contact" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded outline-none">
            {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </a>
        </div>
        <div className="text-center text-xs text-muted-foreground">
          <p>
            {language === 'ar'
              ? <>&copy; {new Date().getFullYear()} اسمع راديو - جميع الحقوق محفوظة | بث مباشر لمحطات الراديو من حول العالم والقرآن الكريم | <a href="https://ziadamrme.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[#2D8B8B] hover:underline">Ziad Amr</a></>
              : <>&copy; {new Date().getFullYear()} Esmaa Radio - All Rights Reserved | Live streaming of radio stations from around the world and Quran | <a href="https://ziadamrme.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[#2D8B8B] hover:underline">Ziad Amr</a></>}
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
}
