'use client';

import { useRadioStore } from '@/stores/radio-store';
import { useQuranStore } from '@/stores/quran-store';
import { translations } from '@/lib/translations';
import { Sheet, SheetContent, SheetTitle, SheetClose, SheetHeader, SheetDescription } from '@/components/ui/sheet';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Play, 
  X, 
  Radio, 
  BookOpen, 
  User,
  Trash2,
  Music
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStationImageFromData } from '@/lib/station-image';

interface FavoritesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FavoritesModal({ open, onOpenChange }: FavoritesModalProps) {
  const { 
    language, 
    favorites, 
    removeFromFavorites, 
    setCurrentStation, 
    setIsPlaying 
  } = useRadioStore();
  
  const {
    reciters,
    surahs,
    favoriteReciters,
    favoriteSurahs,
    toggleFavoriteReciter,
    toggleFavoriteSurah,
    playAudio
  } = useQuranStore();
  
  const t = translations[language];
  const isArabic = language === 'ar';
  
  // Play radio station
  const handlePlayStation = (station: typeof favorites[0]) => {
    setCurrentStation(station);
    setIsPlaying(true);
    onOpenChange(false);
  };
  
  // Play Quran surah with first reciter
  const handlePlaySurah = (surahNumber: number) => {
    const surah = surahs.find(s => s.number === surahNumber);
    const reciter = reciters.find(r => favoriteReciters.includes(r.id)) || reciters[0];
    if (surah && reciter) {
      playAudio(reciter, surah);
      onOpenChange(false);
    }
  };
  
  // Get favorite surahs data
  const favoriteSurahData = surahs.filter(s => favoriteSurahs.includes(s.number));
  const favoriteReciterData = reciters.filter(r => favoriteReciters.includes(r.id));
  
  // Total favorites count
  const totalFavorites = favorites.length + favoriteReciters.length + favoriteSurahs.length;
  
  // Labels
  const labels = {
    radio: isArabic ? 'المحطات' : 'Stations',
    quran: isArabic ? 'القرآن' : 'Quran',
    reciters: isArabic ? 'القراء' : 'Reciters',
    surahs: isArabic ? 'السور' : 'Surahs',
    empty: isArabic ? 'لا توجد مفضلات' : 'No favorites',
    emptyDesc: isArabic ? 'أضف عناصر للمفضلة بالضغط على أيقونة القلب' : 'Add items to favorites by tapping the heart icon',
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85dvh] inset-x-0 bottom-0 flex flex-col p-0 rounded-t-3xl [&>button]:hidden border-t bg-background"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <SheetHeader className="flex items-center justify-between p-4 border-b bg-card shrink-0 rounded-t-3xl">
          <SheetClose className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors" aria-label={isArabic ? 'إغلاق' : 'Close'}>
            <X className="h-5 w-5" />
          </SheetClose>
          
          <SheetTitle className="flex items-center gap-3">
            <VisuallyHidden>
              <SheetDescription>{isArabic ? 'قائمة المحطات والقرآن المفضلة' : 'Your favorite stations and Quran'}</SheetDescription>
            </VisuallyHidden>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white fill-white" />
            </div>
            <div className="text-center">
              <span className="text-lg font-bold">{t.favorites}</span>
              <p className="text-xs text-muted-foreground font-normal">
                {totalFavorites} {isArabic ? 'عنصر' : 'items'}
              </p>
            </div>
          </SheetTitle>
          
          <div className="w-10" />
        </SheetHeader>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {totalFavorites === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{labels.empty}</h3>
              <p className="text-muted-foreground text-sm">{labels.emptyDesc}</p>
            </div>
          ) : (
            <Tabs defaultValue="radio" className="h-full flex flex-col">
              <div className="px-4 pt-4 border-b">
                <TabsList className="w-full flex justify-start gap-2 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="radio" 
                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Radio className="h-4 w-4" />
                    {labels.radio}
                    {favorites.length > 0 && (
                      <Badge variant="secondary" className="ms-1 h-5 px-1.5">
                        {favorites.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="quran"
                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <BookOpen className="h-4 w-4" />
                    {labels.quran}
                    {(favoriteReciters.length + favoriteSurahs.length) > 0 && (
                      <Badge variant="secondary" className="ms-1 h-5 px-1.5">
                        {favoriteReciters.length + favoriteSurahs.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              {/* Radio Favorites */}
              <TabsContent value="radio" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-2">
                    {favorites.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Radio className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>{isArabic ? 'لا توجد محطات في المفضلة' : 'No station favorites'}</p>
                      </div>
                    ) : (
                      favorites.map((station) => (
                        <Card 
                          key={station.stationuuid} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handlePlayStation(station)}
                        >
                          <CardContent className="flex items-center gap-3 p-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={getStationImageFromData(station.stationuuid, station.name, station.favicon, station.tags)}
                                alt={station.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{station.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {station.country || station.countrycode}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromFavorites(station.stationuuid);
                                }}
                                className="h-9 w-9 text-red-500 hover:text-red-600 min-w-[44px] min-h-[44px]"
                                aria-label={isArabic ? `إزالة ${station.name} من المفضلة` : `Remove ${station.name} from favorites`}
                              >
                                <Heart className="h-4 w-4 fill-current" />
                              </Button>
                              <Play className="h-5 w-5 text-primary" />
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              {/* Quran Favorites */}
              <TabsContent value="quran" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Reciters */}
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {labels.reciters}
                      </h3>
                      {favoriteReciterData.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {isArabic ? 'لا يوجد قراء مفضلين' : 'No favorite reciters'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {favoriteReciterData.map((reciter) => (
                            <Card key={reciter.id} className="hover:bg-muted/50 transition-colors">
                              <CardContent className="flex items-center gap-3 p-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                                  {reciter.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{reciter.name}</p>
                                  <p className="text-xs text-muted-foreground">{reciter.style}</p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleFavoriteReciter(reciter.id)}
                                  className="h-10 w-10 text-red-500 hover:text-red-600"
                                  aria-label={isArabic ? `إزالة ${reciter.name} من المفضلة` : `Remove ${reciter.name} from favorites`}
                                >
                                  <Heart className="h-4 w-4 fill-current" />
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Surahs */}
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {labels.surahs}
                      </h3>
                      {favoriteSurahData.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          {isArabic ? 'لا توجد سور مفضلة' : 'No favorite surahs'}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {favoriteSurahData.map((surah) => (
                            <Card 
                              key={surah.number} 
                              className="cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() => handlePlaySurah(surah.number)}
                            >
                              <CardContent className="flex items-center gap-3 p-3">
                                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-600">
                                  {surah.number}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">{surah.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {surah.nameEn} • {surah.ayahs} {isArabic ? 'آية' : 'ayahs'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleFavoriteSurah(surah.number);
                                    }}
                                    className="h-10 w-10 text-red-500 hover:text-red-600"
                                    aria-label={isArabic ? `إزالة ${surah.name} من المفضلة` : `Remove ${surah.name} from favorites`}
                                  >
                                    <Heart className="h-4 w-4 fill-current" />
                                  </Button>
                                  <Play className="h-5 w-5 text-primary" />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
