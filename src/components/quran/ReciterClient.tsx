'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuranStore, type Reciter, type Surah } from '@/stores/quran-store';
import { 
  Play, Pause, Download, Heart, Share2, ChevronLeft, ChevronRight, BookOpen, User, 
  Globe, Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ReciterData } from '@/lib/reciters-dataset';
import type { SurahData } from '@/lib/surahs-dataset';
import { getSurahImage } from '@/lib/station-image';

interface ReciterClientProps {
  reciter: ReciterData;
  surahs: SurahData[];
}

// Related Reciters Section
function RelatedRecitersSection({ currentReciterId }: { currentReciterId: string }) {
  const [relatedReciters, setRelatedReciters] = useState<ReciterData[]>([]);
  
  useEffect(() => {
    // Fetch related reciters
    fetch(`/api/quran?action=reciters`)
      .then(res => res.json())
      .then(data => {
        if (data.reciters) {
          const filtered = data.reciters
            .filter((r: ReciterData) => r.id !== currentReciterId)
            .slice(0, 6);
          setRelatedReciters(filtered);
        }
      })
      .catch(() => {});
  }, [currentReciterId]);

  if (relatedReciters.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <User className="h-5 w-5 text-primary" />
        قراء آخرون
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {relatedReciters.map((reciter) => (
          <Link key={reciter.id} href={`/reciter/${reciter.slug}`}>
            <Card className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20 cursor-pointer h-full">
              <CardContent className="p-3 text-center">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-2 flex items-center justify-center">
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {reciter.nameAr}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {reciter.country}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function ReciterClient({ reciter, surahs }: ReciterClientProps) {
  const { 
    currentAudio, 
    isPlaying, 
    playAudio, 
    pauseAudio, 
    resumeAudio,
    selectedReciter,
    selectedSurah 
  } = useQuranStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Remove splash screen on mount (for deep links to reciter pages)
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

  // Filter surahs based on search
  const filteredSurahs = surahs.filter(surah => 
    surah.nameAr.includes(searchQuery) || 
    surah.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert SurahData to Surah for the store
  const toSurah = (surah: SurahData): Surah => ({
    number: surah.number,
    name: surah.nameAr,
    nameEn: surah.englishName,
    ayahs: surah.numberOfAyahs,
    type: surah.revelationType === 'Meccan' ? 'meccan' : 'medinan',
  });

  // Convert ReciterData to Reciter for the store
  const toReciter = (r: ReciterData): Reciter => ({
    id: r.id,
    identifier: r.id, // Using id as identifier
    name: r.nameAr,
    nameEn: r.name,
    style: '',
  });

  // Play surah
  const handlePlaySurah = (surah: SurahData) => {
    const storeReciter = toReciter(reciter);
    const storeSurah = toSurah(surah);
    
    // Check if this is currently playing
    if (currentAudio?.surahNumber === surah.number && selectedReciter?.id === reciter.id) {
      if (isPlaying) {
        pauseAudio();
      } else {
        resumeAudio();
      }
    } else {
      playAudio(storeReciter, storeSurah);
    }
  };

  // Check if surah is playing
  const isSurahPlaying = (surahNumber: number) => {
    return currentAudio?.surahNumber === surahNumber && 
           selectedReciter?.id === reciter.id && 
           isPlaying;
  };

  // Get audio URL for download
  const getDownloadUrl = (surah: SurahData) => {
    return `${reciter.audioBaseUrl}/${String(surah.number).padStart(3, '0')}.mp3`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
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
            <li className="text-foreground font-medium truncate">{reciter.nameAr}</li>
          </ol>
        </nav>

        {/* Header */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-12 w-12 text-primary" />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{reciter.nameAr}</h1>
                <p className="text-muted-foreground mb-3">{reciter.name}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="gap-1">
                    <Globe className="h-3 w-3" />
                    {reciter.country}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <BookOpen className="h-3 w-3" />
                    114 سورة
                  </Badge>
                  {reciter.isPopular && (
                    <Badge className="gap-1 bg-primary">
                      <Headphones className="h-3 w-3" />
                      شائع
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground leading-7">
                  {reciter.bioAr}
                </p>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="icon">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Player */}
        {currentAudio && selectedReciter?.id === reciter.id && (
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
                  <img 
                    src={getSurahImage(currentAudio.surahNumber)} 
                    alt={currentAudio.surahName}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{currentAudio.surahName}</h3>
                  <p className="text-sm text-muted-foreground">{currentAudio.reciterName}</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-12 h-12 rounded-full"
                  onClick={() => isPlaying ? pauseAudio() : resumeAudio()}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 ms-0.5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="ابحث عن سورة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Surahs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSurahs.map((surah) => {
            const isThisPlaying = isSurahPlaying(surah.number);
            
            return (
              <Card 
                key={surah.number}
                className={cn(
                  "group hover:shadow-lg transition-all duration-200 cursor-pointer h-full",
                  isThisPlaying && "border-primary bg-primary/5"
                )}
                onClick={() => handlePlaySurah(surah)}
              >
                <CardContent className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative bg-gradient-to-br from-emerald-400/20 to-teal-500/20">
                    <img 
                      src={getSurahImage(surah.number)} 
                      alt={surah.nameAr}
                      className="w-full h-full object-contain"
                    />
                    {isThisPlaying && (
                      <div className="absolute inset-0 bg-primary/50 flex items-center justify-center">
                        <Pause className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-6">{surah.number}</span>
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {surah.nameAr}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {surah.englishName} • {surah.numberOfAyahs} آية
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <a 
                      href={getDownloadUrl(surah)} 
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {isThisPlaying ? (
                        <Pause className="h-3.5 w-3.5" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Related Reciters */}
        <RelatedRecitersSection currentReciterId={reciter.id} />

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/?tab=quran" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              العودة إلى القرآن الكريم
            </Link>
            <p className="text-xs text-muted-foreground text-center">
              اسمع راديو - تلاوات القرآن الكريم بجودة عالية | {reciter.nameAr}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
