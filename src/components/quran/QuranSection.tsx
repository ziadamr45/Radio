'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuranStore } from '@/stores/quran-store';
import { useRadioStore } from '@/stores/radio-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Play,
  Heart,
  RotateCcw,
  ChevronLeft,
  BookOpen,
  User,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { matchesSearch } from '@/lib/search-normalize';
import { SleepTimerSheet } from '@/components/radio/SleepTimer';
import { VoiceButton } from '@/components/VoiceButton';

// Quran surah images - 10 beautiful religious images without text
const QURAN_SURAH_IMAGES = [
  '/images/quran-surahs/surah-1.png',
  '/images/quran-surahs/surah-2.png',
  '/images/quran-surahs/surah-3.png',
  '/images/quran-surahs/surah-4.png',
  '/images/quran-surahs/surah-5.png',
  '/images/quran-surahs/surah-6.png',
  '/images/quran-surahs/surah-7.png',
  '/images/quran-surahs/surah-8.png',
  '/images/quran-surahs/surah-9.png',
  '/images/quran-surahs/surah-10.png',
];

// Get a consistent image for a surah based on its number
export const getSurahImage = (surahNumber: number): string => {
  return QURAN_SURAH_IMAGES[(surahNumber - 1) % QURAN_SURAH_IMAGES.length];
};

// Get a consistent image for a reciter based on their ID
const getReciterImage = (reciterId: string): string => {
  const hash = reciterId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return QURAN_SURAH_IMAGES[hash % QURAN_SURAH_IMAGES.length];
};

export function QuranSection() {
  const {
    reciters,
    surahs,
    selectedReciter,
    selectedSurah,
    currentAudio,
    isPlaying,
    lastProgress,
    searchQuery,
    setReciters,
    setSurahs,
    setSelectedReciter,
    setSelectedSurah,
    setIsPlaying,
    toggleFavoriteReciter,
    toggleFavoriteSurah,
    isFavoriteReciter,
    isFavoriteSurah,
    playAudio,
    setSearchQuery,
  } = useQuranStore();

  const { language } = useRadioStore();
  
  const [view, setView] = useState<'reciters' | 'surahs'>('reciters');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to top when switching views
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [view]);
  
  // Filter reciters with useMemo
  const filteredReciters = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return reciters;
    return reciters.filter(
      (r) =>
        matchesSearch(r.name, searchQuery) ||
        matchesSearch(r.nameEn, searchQuery)
    );
  }, [searchQuery, reciters]);
  
  // Filter surahs with useMemo
  const filteredSurahs = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return surahs;
    return surahs.filter(
      (s) =>
        matchesSearch(s.name, searchQuery) ||
        matchesSearch(s.nameEn, searchQuery) ||
        s.number.toString() === searchQuery.trim()
    );
  }, [searchQuery, surahs]);
  
  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recitersRes, surahsRes] = await Promise.all([
          fetch('/api/quran?action=reciters'),
          fetch('/api/quran?action=surahs'),
        ]);
        
        const recitersData = await recitersRes.json();
        const surahsData = await surahsRes.json();
        
        if (recitersData.success) {
          setReciters(recitersData.data);
        }
        if (surahsData.success) {
          setSurahs(surahsData.data);
        }
      } catch (error) {
        console.error('Error fetching Quran data:', error);
      }
    };
    
    fetchData();
  }, [setReciters, setSurahs]);
  
  // Continue from last position
  const continueListening = () => {
    if (!lastProgress || !reciters.length || !surahs.length) return;
    
    const reciter = reciters.find(r => r.id === lastProgress.reciterId);
    const surah = surahs.find(s => s.number === lastProgress.surahNumber);
    
    if (reciter && surah) {
      playAudio(reciter, surah);
    }
  };
  
  const t = {
    reciters: language === 'ar' ? 'القراء' : 'Reciters',
    surahs: language === 'ar' ? 'السور' : 'Surahs',
    search: language === 'ar' ? 'بحث...' : 'Search...',
    selectReciter: language === 'ar' ? 'اختر القارئ' : 'Select Reciter',
    continueListening: language === 'ar' ? 'متابعة الاستماع' : 'Continue Listening',
    lastPlayed: language === 'ar' ? 'آخر استماع' : 'Last Played',
    favorites: language === 'ar' ? 'المفضلة' : 'Favorites',
    ayahs: language === 'ar' ? 'آية' : 'Ayahs',
    meccan: language === 'ar' ? 'مكية' : 'Meccan',
    medinan: language === 'ar' ? 'مدنية' : 'Medinan',
    change: language === 'ar' ? 'تغيير' : 'Change',
    noReciter: language === 'ar' ? 'اختر قارئ أولاً' : 'Select a reciter first',
  };

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Header with Sleep Timer */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-12 pe-14 h-12 text-base rounded-xl w-full"
          />
          <div className="absolute end-1 top-1/2 -translate-y-1/2">
            <VoiceButton
              onResult={(text) => setSearchQuery(text)}
              lang={language === 'ar' ? 'ar-SA' : 'en-US'}
              className="h-10 w-10"
            />
          </div>
        </div>
        <div className="ms-2">
          <SleepTimerSheet />
        </div>
      </div>
      
      {/* Last Played Section - Always at top */}
      {lastProgress && (
        <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-muted-foreground">{t.lastPlayed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden">
                  <img 
                    src={getReciterImage(lastProgress.reciterId || '1')} 
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/default-station.png';
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold">
                    {surahs.find(s => s.number === lastProgress.surahNumber)?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {reciters.find(r => r.id === lastProgress.reciterId)?.name}
                  </p>
                </div>
              </div>
              <Button onClick={continueListening} size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                {t.continueListening}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* View Tabs */}
      <div className="flex gap-2">
        <Button
          variant={view === 'reciters' ? 'default' : 'outline'}
          onClick={() => setView('reciters')}
          className="flex-1 gap-2"
        >
          <User className="h-4 w-4" />
          {t.reciters}
        </Button>
        <Button
          variant={view === 'surahs' ? 'default' : 'outline'}
          onClick={() => setView('surahs')}
          className="flex-1 gap-2"
        >
          <BookOpen className="h-4 w-4" />
          {t.surahs}
        </Button>
      </div>
      
      {/* Reciters View */}
      {view === 'reciters' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredReciters.map((reciter) => (
            <Card
              key={reciter.id}
              role="button"
              tabIndex={0}
              className={cn(
                "cursor-pointer transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
                selectedReciter?.id === reciter.id && "ring-2 ring-primary"
              )}
              aria-label={language === 'ar' ? `اختر القارئ ${reciter.name}` : `Select reciter ${reciter.nameEn}`}
              onClick={() => {
                setSelectedReciter(reciter);
                setView('surahs');
              }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedReciter(reciter); setView('surahs'); } }}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {/* Reciter Image */}
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <img 
                      src={getReciterImage(reciter.id)}
                      alt={reciter.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <span className="hidden text-white font-bold text-lg">{reciter.name.charAt(0)}</span>
                  </div>
                  {/* Reciter Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{reciter.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{reciter.nameEn}</p>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {reciter.style}
                    </Badge>
                  </div>
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavoriteReciter(reciter.id);
                    }}
                    className="flex-shrink-0 h-10 w-10"
                    aria-label={isFavoriteReciter(reciter.id) ? (language === 'ar' ? 'إزالة القارئ من المفضلة' : 'Remove reciter from favorites') : (language === 'ar' ? 'إضافة القارئ للمفضلة' : 'Add reciter to favorites')}
                  >
                    <Heart
                      className={cn(
                        "h-5 w-5",
                        isFavoriteReciter(reciter.id) && "fill-red-500 text-red-500"
                      )}
                    />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Surahs View */}
      {view === 'surahs' && (
        <div className="space-y-3">
          {/* Selected Reciter Banner */}
          {selectedReciter ? (
            <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500">
                      <img 
                        src={getReciterImage(selectedReciter.id)}
                        alt={selectedReciter.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.selectReciter}</p>
                      <p className="font-semibold text-sm">{selectedReciter.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setView('reciters')}
                    className="gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {t.change}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-amber-500/10 border-amber-500/20">
              <CardContent className="p-4 text-center">
                <p className="text-amber-600">{t.noReciter}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setView('reciters')}
                >
                  {t.reciters}
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Surahs List */}
          {selectedReciter && (
            <div className="space-y-1">
              {filteredSurahs.map((surah) => (
                <Card
                  key={surah.number}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "cursor-pointer transition-all hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 outline-none",
                    selectedSurah?.number === surah.number && "ring-2 ring-primary"
                  )}
                  aria-label={language === 'ar' ? `تشغيل ${surah.name}` : `Play ${surah.nameEn}`}
                  onClick={() => {
                    if (selectedReciter) {
                      playAudio(selectedReciter, surah);
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (selectedReciter) playAudio(selectedReciter, surah); } }}
                >
                  <CardContent className="p-2">
                    <div className="flex items-center gap-3">
                      {/* Surah Number */}
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-600 text-sm flex-shrink-0" aria-hidden="true">
                        {surah.number}
                      </div>
                      {/* Surah Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">{surah.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {surah.nameEn} • {surah.ayahs} {t.ayahs}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Badge variant="outline" className="text-[10px] px-1.5">
                              {surah.type === 'meccan' ? t.meccan : t.medinan}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteSurah(surah.number);
                              }}
                              aria-label={isFavoriteSurah(surah.number) ? (language === 'ar' ? 'إزالة السورة من المفضلة' : 'Remove surah from favorites') : (language === 'ar' ? 'إضافة السورة للمفضلة' : 'Add surah to favorites')}
                            >
                              <Heart
                                className={cn(
                                  "h-4 w-4",
                                  isFavoriteSurah(surah.number) && "fill-red-500 text-red-500"
                                )}
                              />
                            </Button>
                            <Play className="h-4 w-4 text-primary" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
