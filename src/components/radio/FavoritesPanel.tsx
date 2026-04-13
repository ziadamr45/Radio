'use client';

import { useRadioStore } from '@/stores/radio-store';
import { translations } from '@/lib/translations';
import { StationCard } from './StationCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Heart, Trash2 } from 'lucide-react';
import type { RadioStation } from '@/types/radio';

export function FavoritesPanel() {
  const {
    language,
    favorites,
    removeFromFavorites,
    setCurrentStation,
    setIsPlaying,
  } = useRadioStore();
  
  const t = translations[language];
  
  const handlePlay = (station: RadioStation) => {
    setCurrentStation(station);
    setIsPlaying(true);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={language === 'ar' ? 'المفضلة' : 'Favorites'}>
          <Heart className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            {t.favorites}
            {favorites.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({favorites.length})
              </span>
            )}
          </SheetTitle>
          <SheetDescription className="sr-only">
            {language === 'ar' ? 'قائمة المحطات المفضلة' : 'Your favorite stations list'}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="mt-4 h-[calc(100%-60px)]">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Heart className="h-12 w-12 mb-4 opacity-50" />
              <p>{language === 'ar' ? 'لا توجد محطات مفضلة' : 'No favorite stations'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((station) => (
                <div key={station.stationuuid} className="relative group">
                  <StationCard station={station} onPlay={handlePlay} compact />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 end-2 h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromFavorites(station.stationuuid)}
                    aria-label={language === 'ar' ? `إزالة ${station.name} من المفضلة` : `Remove ${station.name} from favorites`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
