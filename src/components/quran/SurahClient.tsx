'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuranStore, type Reciter, type Surah } from '@/stores/quran-store';
import { 
  Play, Pause, Download, Share2, BookOpen, User, Clock, 
  Globe, ChevronRight, Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { SurahData } from '@/lib/surahs-dataset';
import type { ReciterData } from '@/lib/reciters-dataset';
import { getSurahImage } from '@/lib/station-image';

interface SurahClientProps {
  surah: SurahData;
  reciters: ReciterData[];
}

export default function SurahClient({ surah, reciters }: SurahClientProps) {
  const { 
    currentAudio, 
    isPlaying, 
    playAudio, 
    pauseAudio, 
    resumeAudio,
    selectedReciter
  } = useQuranStore();
  
  const [currentReciterId, setCurrentReciterId] = useState<string | null>(null);

  // Remove splash screen on mount (for deep links to surah pages)
  useEffect(() => {
    const removeSplash = () => {
      const splash = document.getElementById('initial-splash');
      if (splash) {
        splash.style.transition = 'opacity 0.3s ease-out';
        splash.style.opacity = '0';
        setTimeout(() => {
          const s = document.getElementById('initial-splash');
          if (s) s.remove();
        }, 300);
      }
    };

    const timer = setTimeout(removeSplash, 500);
    return () => clearTimeout(timer);
  }, []);

  // Convert SurahData to Surah for the store
  const toSurah = (s: SurahData): Surah => ({
    number: s.number,
    name: s.nameAr,
    nameEn: s.englishName,
    ayahs: s.numberOfAyahs,
    type: s.revelationType === 'Meccan' ? 'meccan' : 'medinan',
  });

  // Convert ReciterData to Reciter for the store
  const toReciter = (r: ReciterData): Reciter => ({
    id: r.id,
    identifier: r.id, // Using id as identifier
    name: r.nameAr,
    nameEn: r.name,
    style: '',
  });

  // Get audio URL
  const getAudioUrl = (reciter: ReciterData) => {
    return `${reciter.audioBaseUrl}/${String(surah.number).padStart(3, '0')}.mp3`;
  };

  // Play surah with specific reciter
  const handlePlayWithReciter = (reciter: ReciterData) => {
    const storeReciter = toReciter(reciter);
    const storeSurah = toSurah(surah);
    
    // Check if this is currently playing
    if (currentReciterId === reciter.id && currentAudio?.surahNumber === surah.number && isPlaying) {
      pauseAudio();
    } else {
      playAudio(storeReciter, storeSurah);
      setCurrentReciterId(reciter.id);
    }
  };

  // Check if reciter is playing
  const isReciterPlaying = (reciterId: string) => {
    return currentReciterId === reciterId && 
           currentAudio?.surahNumber === surah.number && 
           isPlaying;
  };

  // Share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `سورة ${surah.nameAr}`,
          text: `استمع إلى سورة ${surah.nameAr} بجودة عالية`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            </li>
            <li className="text-muted-foreground/50">/</li>
            <li>
              <Link href="/?tab=quran" className="hover:text-primary transition-colors">القرآن الكريم</Link>
            </li>
            <li className="text-muted-foreground/50">/</li>
            <li className="text-foreground font-medium truncate">{surah.nameAr}</li>
          </ol>
        </nav>

        {/* Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="relative aspect-[2.5/1] bg-gradient-to-br from-primary/20 to-primary/5">
            <img
              src={getSurahImage(surah.number)}
              alt={surah.nameAr}
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent" />
            <div className="absolute bottom-0 start-0 end-0 p-6">
              <div className="flex items-end justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {surah.number}
                    </Badge>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{surah.nameAr}</h1>
                  <p className="text-muted-foreground">{surah.englishName} • {surah.name}</p>
                </div>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="outline" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {surah.numberOfAyahs} آية
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                الجزء {surah.juz.join(' - ')}
              </Badge>
            </div>
            
            <p className="text-muted-foreground leading-7">
              {surah.descriptionAr}
            </p>
          </CardContent>
        </Card>

        {/* Current Player */}
        {currentAudio?.surahNumber === surah.number && isPlaying && currentReciterId && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
                  <img 
                    src={getSurahImage(surah.number)} 
                    alt={surah.nameAr}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                    <Pause className="h-5 w-5 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{surah.nameAr}</p>
                  <p className="text-sm text-muted-foreground">{currentAudio.reciterName}</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-12 h-12 rounded-full"
                  onClick={() => {
                    if (currentReciterId) {
                      const reciter = reciters.find(r => r.id === currentReciterId);
                      if (reciter) handlePlayWithReciter(reciter);
                    }
                  }}
                >
                  <Pause className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reciters List */}
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Headphones className="h-5 w-5 text-primary" />
            استمع بأصوات القراء
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {reciters.map((reciter) => {
              const isThisPlaying = isReciterPlaying(reciter.id);
              
              return (
                <Card 
                  key={reciter.id}
                  className={cn(
                    "group hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
                    isThisPlaying && "border-primary bg-primary/5"
                  )}
                  onClick={() => handlePlayWithReciter(reciter)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {reciter.nameAr}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {reciter.country}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <a 
                        href={getAudioUrl(reciter)} 
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                      <Button 
                        variant={isThisPlaying ? "default" : "secondary"}
                        size="icon" 
                        className="h-9 w-9"
                      >
                        {isThisPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 ms-0.5" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* View All Reciters Link */}
          <div className="mt-4 text-center">
            <Link href={`/?tab=quran`}>
              <Button variant="outline" className="gap-2">
                عرض جميع القراء
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Related Surahs */}
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            سور أخرى
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              surah.number > 1 ? surah.number - 1 : 2, 
              surah.number < 114 ? surah.number + 1 : 113,
            ].filter((v, i, a) => a.indexOf(v) === i && v !== surah.number).map((num) => (
              <Link key={num} href={`/surah/${num}`}>
                <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20 cursor-pointer h-full">
                  <CardContent className="p-3 text-center">
                    <div className="w-12 h-12 rounded-lg bg-muted mx-auto mb-2 flex items-center justify-center">
                      <span className="text-lg font-bold text-muted-foreground">{num}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">سورة {num}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/?tab=quran" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              العودة إلى القرآن الكريم
            </Link>
            <p className="text-xs text-muted-foreground text-center">
              اسمع راديو - تلاوات القرآن الكريم بجودة عالية | سورة {surah.nameAr}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
