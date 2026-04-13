'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useRadioStore } from '@/stores/radio-store';
import { translations } from '@/lib/translations';
import { Loader2, Radio, Play, AlertCircle, ChevronLeft, ChevronRight, Home, Headphones, Globe, HeadphonesIcon, Clock, ThumbsUp, Share2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { RadioStation } from '@/types/radio';
import { getStationImage as getStationImageUtil, getRandomDefaultImage } from '@/lib/station-image';
import type { StationData } from '@/lib/stations-dataset';

// Wrapper component with Suspense for useSearchParams
function StationClientWithSuspense(props: StationClientProps) {
  return (
    <Suspense fallback={<StationLoading />}>
      <StationClientInner {...props} />
    </Suspense>
  );
}

interface RelatedStation {
  stationuuid: string;
  name: string;
  country: string;
  countrycode: string;
  tags: string;
  favicon: string;
  url_resolved: string;
  codec: string;
  bitrate: number;
  votes: number;
}

interface StationClientProps {
  staticStation?: StationData | null;
  staticRelatedStations?: RelatedStation[];
}

// Loading component
function StationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">جاري تحميل المحطة...</p>
      </div>
    </div>
  );
}

// Breadcrumb navigation with Schema.org markup
function BreadcrumbNav({ stationName, country, countryCode }: { stationName: string; country: string; countryCode: string }) {
  const { language } = useRadioStore();

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap" itemScope itemType="https://schema.org/BreadcrumbList">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <a href="/" itemProp="item" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="h-3.5 w-3.5" />
            <span itemProp="name">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </a>
          <meta itemProp="position" content="1" />
        </li>
        <li className="text-muted-foreground/50">/</li>
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <a href="/" itemProp="item" className="hover:text-primary transition-colors">
            <span itemProp="name">{language === 'ar' ? 'محطات الراديو' : 'Radio Stations'}</span>
          </a>
          <meta itemProp="position" content="2" />
        </li>
        {country && (
          <>
            <li className="text-muted-foreground/50">/</li>
            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
              <a href={`/?country=${countryCode}`} itemProp="item" className="hover:text-primary transition-colors">
                <span itemProp="name">{country}</span>
              </a>
              <meta itemProp="position" content="3" />
            </li>
          </>
        )}
        <li className="text-muted-foreground/50">/</li>
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <span itemProp="name" className="text-foreground font-medium truncate max-w-[200px] inline-block">{stationName}</span>
          <meta itemProp="position" content={country ? "4" : "3"} />
        </li>
      </ol>
    </nav>
  );
}

// Related Stations Section - uses button click + window.location for reliable navigation
function RelatedStationsSection({ stations, language, country }: { stations: RelatedStation[]; language: string; country: string }) {
  if (stations.length === 0) return null;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, stationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Use window.location.assign for full page load to avoid SSR issues on Vercel
    window.location.assign(`/station/${stationId}`);
  };

  return (
    <section className="mt-8" aria-labelledby="related-stations-heading">
      <h2 id="related-stations-heading" className="text-xl font-bold mb-4 flex items-center gap-2">
        <Radio className="h-5 w-5 text-primary" />
        {language === 'ar' ? `محطات مشابهة من ${country}` : `Similar Stations from ${country}`}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {stations.map((relStation) => (
          <Card
            key={relStation.stationuuid}
            className="group hover:shadow-lg transition-all duration-200 hover:border-primary/20 cursor-pointer h-full"
            onClick={(e) => handleClick(e, relStation.stationuuid)}
          >
            <CardContent className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={
                    relStation.favicon && relStation.favicon !== '' && !relStation.favicon.includes('placeholder') && relStation.favicon.startsWith('http')
                      ? relStation.favicon
                      : `/icons/icon-72x72.png`
                  }
                  alt={relStation.name}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/icons/icon-72x72.png';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{relStation.name}</p>
                <p className="text-xs text-muted-foreground truncate">{relStation.country || relStation.countrycode}</p>
                <div className="flex gap-1 mt-1">
                  {relStation.bitrate > 0 && (
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">{relStation.bitrate}kbps</Badge>
                  )}
                  {relStation.tags && relStation.tags.split(',').slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-normal">{tag.trim()}</Badge>
                  ))}
                </div>
              </div>
              <ChevronLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

// Generate unique Arabic content for station
function generateStationContent(station: RadioStation, language: string) {
  const country = station.country || station.countrycode || 'العالم';
  const tags = station.tags ? station.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  const isQuran = tags.some(t => ['quran', 'قرآن', 'قران', 'koran', 'quran kareem'].includes(t.toLowerCase()));
  const isIslamic = tags.some(t => ['islam', 'islamic', 'إسلام', 'nasheed', 'أناشيد'].includes(t.toLowerCase()));
  const isNews = tags.some(t => ['news', 'أخبار', 'akhbar'].includes(t.toLowerCase()));
  
  let categoryText = 'ترفيهية';
  let categoryDesc = '';
  
  if (isQuran) {
    categoryText = 'قرآن كريم';
    categoryDesc = 'تلاوات قرآنية عذبة من كتاب الله';
  } else if (isIslamic) {
    categoryText = 'إسلامية';
    categoryDesc = 'برامج دينية وأناشيد إسلامية';
  } else if (isNews) {
    categoryText = 'إخبارية';
    categoryDesc = 'أخبار محلية وعالمية';
  }
  
  return {
    categoryText,
    categoryDesc,
    tags,
    country
  };
}

// SEO Content for station page
function StationSEOContent({ station, language }: { station: RadioStation; language: string }) {
  const content = generateStationContent(station, language);

  return (
    <section className="mt-8 space-y-6" aria-label="معلومات عن المحطة">
      {/* Main Description */}
      <div className="bg-muted/30 rounded-xl p-6">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          {language === 'ar' ? `عن إذاعة ${station.name}` : `About ${station.name}`}
        </h2>
        <p className="text-muted-foreground leading-7 text-sm">
          {language === 'ar' ? (
            <>
              <strong>{station.name}</strong> إذاعة {content.categoryText} من <strong>{content.country}</strong>، 
              {content.categoryDesc && ` ${content.categoryDesc}. `}
              استمع إلى <strong>{station.name}</strong> بث مباشر بجودة عالية عبر موقع اسمع راديو.
              {station.bitrate > 0 && ` البث بجودة ${station.bitrate} كيلوبت في الثانية`}
              {station.codec && ` بتقنية ${station.codec.toUpperCase()}`}.
              {content.tags.length > 0 && ` تغطي المحطة مجالات ${content.tags.slice(0, 5).join('، ')}.`}
            </>
          ) : (
            <>
              <strong>{station.name}</strong> is a radio station from <strong>{content.country}</strong>.
              Listen to <strong>{station.name}</strong> live streaming in high quality on Esmaa Radio.
              {station.bitrate > 0 && ` Streaming at ${station.bitrate} kbps`}
              {station.codec && ` using ${station.codec.toUpperCase()} codec`}.
            </>
          )}
        </p>
      </div>

      {/* Station Info Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-3 text-center">
          <Globe className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'الدولة' : 'Country'}</p>
          <p className="font-medium text-sm truncate">{station.country || station.countrycode || '-'}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <HeadphonesIcon className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'الجودة' : 'Quality'}</p>
          <p className="font-medium text-sm">{station.bitrate > 0 ? `${station.bitrate} kbps` : '-'}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <ThumbsUp className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'التقييم' : 'Rating'}</p>
          <p className="font-medium text-sm">{station.votes > 0 ? `${station.votes}` : '-'}</p>
        </div>
        <div className="bg-card border rounded-lg p-3 text-center">
          <Radio className="h-5 w-5 mx-auto mb-1 text-primary" />
          <p className="text-xs text-muted-foreground">{language === 'ar' ? 'النوع' : 'Type'}</p>
          <p className="font-medium text-sm truncate">{content.categoryText}</p>
        </div>
      </div>

      {/* Keywords/Tags */}
      {content.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {content.tags.slice(0, 10).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag.trim()}
            </Badge>
          ))}
        </div>
      )}

      {/* SEO-optimized text content */}
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4">
        <h3 className="text-base font-semibold">
          {language === 'ar' ? `استمع إلى ${station.name} بث مباشر` : `Listen to ${station.name} Live`}
        </h3>
        <p className="text-muted-foreground text-sm leading-7">
          {language === 'ar' ? (
            <>
              تقدم إذاعة <strong>{station.name}</strong> بثًا مباشرًا على مدار الساعة من {content.country}.
              يمكنك الاستماع إلى المحطة بجودة عالية بدون تقطيع عبر موقع اسمع راديو.
              {content.tags.some(t => ['quran', 'قرآن'].includes(t.toLowerCase())) && (
                <> تقدم المحطة تلاوات قرآنية مميزة من القرآن الكريم على مدار اليوم.</>
              )}
            </>
          ) : (
            <>
              <strong>{station.name}</strong> broadcasts live 24/7 from {content.country}.
              Listen to the station in high quality without interruption on Esmaa Radio.
            </>
          )}
        </p>
      </div>

      {/* CTA Section */}
      <div className="flex flex-wrap gap-3 pt-4 border-t">
        <a href="/">
          <Button variant="outline" size="sm" className="gap-2">
            <Radio className="h-4 w-4" />
            {language === 'ar' ? 'استكشف المزيد من المحطات' : 'Explore More Stations'}
          </Button>
        </a>
        {content.tags.some(t => ['quran', 'قرآن'].includes(t.toLowerCase())) && (
          <a href="/?filter=quran">
            <Button variant="outline" size="sm" className="gap-2">
              📖 {language === 'ar' ? 'المزيد من إذاعات القرآن' : 'More Quran Stations'}
            </Button>
          </a>
        )}
      </div>
    </section>
  );
}

// Convert StationData to RadioStation format
function convertToRadioStation(staticStation: StationData): RadioStation {
  return {
    changeuuid: staticStation.id,
    stationuuid: staticStation.id,
    serveruuid: null,
    name: staticStation.name,
    url: staticStation.streamUrl,
    url_resolved: staticStation.streamUrl,
    homepage: '',
    favicon: staticStation.imageUrl || '',
    tags: staticStation.tags.join(','),
    country: staticStation.country,
    countrycode: staticStation.countryCode,
    iso_3166_2: null,
    state: '',
    language: 'arabic',
    languagecodes: 'ar',
    votes: 0,
    lastchangetime: '',
    lastchangetime_iso8601: '',
    codec: staticStation.codec || 'MP3',
    bitrate: staticStation.bitrate || 128,
    hls: 0,
    lastcheckok: 1,
    lastchecktime: '',
    lastchecktime_iso8601: '',
    lastcheckoktime: '',
    lastcheckoktime_iso8601: '',
    lastlocalchecktime: '',
    lastlocalchecktime_iso8601: '',
    clicktimestamp: '',
    clicktimestamp_iso8601: '',
    clickcount: 0,
    clicktrend: 0,
    ssl_error: 0,
    geo_lat: null,
    geo_long: null,
    has_extended_info: false,
  };
}

// Station content component (inner - uses useSearchParams)
function StationClientInner({ staticStation, staticRelatedStations = [] }: StationClientProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const stationId = params.id as string;
  const autoPlay = searchParams.get('play') !== 'false';

  const {
    language,
    setCurrentStation,
    setIsPlaying,
    currentStation,
    isPlaying,
    favorites,
    saveFavorite,
  } = useRadioStore();

  const t = translations[language];

  const [station, setStation] = useState<RadioStation | null>(
    staticStation ? convertToRadioStation(staticStation) : null
  );
  const [loading, setLoading] = useState(!staticStation);
  const [error, setError] = useState<string | null>(null);
  const [stationImage, setStationImage] = useState<string>('');
  const [relatedStations, setRelatedStations] = useState<RelatedStation[]>(staticRelatedStations);
  const [relatedLoading, setRelatedLoading] = useState(!staticStation);

  // Remove splash screen on mount (for deep links to station pages)
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

    // Remove splash after a short delay for deep links
    const timer = setTimeout(removeSplash, 500);
    return () => clearTimeout(timer);
  }, []);

  // Check if station is favorite
  const isFavorite = station ? favorites.some(f => f.stationuuid === station.stationuuid) : false;

  // Fetch station data if not provided statically
  useEffect(() => {
    if (staticStation) {
      // Already have static data
      return;
    }

    const fetchStation = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/station?id=${stationId}`);
        const data = await response.json();

        if (data.success && data.data) {
          const stationData = data.data as RadioStation;
          
          // Validate required fields
          if (!stationData.name || !stationData.stationuuid) {
            setError(language === 'ar' ? 'بيانات المحطة غير مكتملة' : 'Incomplete station data');
            return;
          }
          
          // Ensure url_resolved is set
          if (!stationData.url_resolved && !stationData.url) {
            setError(language === 'ar' ? 'رابط البث غير متاح' : 'Stream URL not available');
            return;
          }
          
          // Normalize data
          if (!stationData.url_resolved) stationData.url_resolved = stationData.url;
          if (!stationData.url) stationData.url = stationData.url_resolved;
          
          setStation(stationData);
          setStationImage(getStationImageUtil(stationData));

          // Auto-play if enabled - use event to sync with mini player
          if (autoPlay) {
            try {
              setCurrentStation(stationData);
              // Small delay to ensure store is updated before dispatching event
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('playRadioFromCard'));
              }, 50);
            } catch (playError) {
              console.error('Error auto-playing station:', playError);
            }
          }

          // Fetch related stations
          if (stationData.countrycode) {
            try {
              const relatedRes = await fetch(
                `/api/station/related?country=${stationData.countrycode}&tags=${encodeURIComponent(stationData.tags || '')}&exclude=${stationId}&limit=6`
              );
              const relatedData = await relatedRes.json();
              if (relatedData.success && relatedData.data) {
                setRelatedStations(relatedData.data);
              }
            } catch {
              // Silently fail - related stations are not critical
            }
          }
        } else {
          setError(language === 'ar' ? 'المحطة غير موجودة' : 'Station not found');
        }
      } catch (err) {
        console.error('Error fetching station:', err);
        setError(language === 'ar' ? 'حدث خطأ في تحميل المحطة' : 'Error loading station');
      } finally {
        setLoading(false);
        setRelatedLoading(false);
      }
    };

    if (stationId) {
      fetchStation();
    }
  }, [stationId, autoPlay, setCurrentStation, setIsPlaying, language, staticStation]);

  // Set station image for static stations
  useEffect(() => {
    if (staticStation && !stationImage) {
      const convertedStation = convertToRadioStation(staticStation);
      setStationImage(getStationImageUtil(convertedStation));
      
      // Auto-play if enabled - use event to sync with mini player
      if (autoPlay) {
        try {
          setCurrentStation(convertedStation);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('playRadioFromCard'));
          }, 50);
        } catch (playError) {
          console.error('Error auto-playing static station:', playError);
        }
      }
    }
  }, [staticStation, stationImage, autoPlay, setCurrentStation, setIsPlaying]);

  // Handle image error
  const handleImageError = () => {
    if (station) {
      setStationImage(getRandomDefaultImage(station.stationuuid, station.name, station.tags));
    }
  };

  // Play station - use event to sync with mini player
  const handlePlay = () => {
    try {
      if (station) {
        // If already playing this station, pause it
        if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
          setIsPlaying(false);
          window.dispatchEvent(new CustomEvent('pauseRadioFromCard'));
          return;
        }
        setCurrentStation(station);
        // Dispatch event so mini player handles audio lifecycle properly
        window.dispatchEvent(new CustomEvent('playRadioFromCard'));
      }
    } catch (error) {
      console.error('Error playing station:', error);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = () => {
    if (station) {
      saveFavorite(station, !isFavorite);
    }
  };

  // Share station
  const handleShare = async () => {
    if (station && navigator.share) {
      try {
        await navigator.share({
          title: `${station.name} - اسمع راديو`,
          text: `استمع إلى ${station.name} بث مباشر`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  // Go to home - use full page navigation to avoid hydration errors
  const goToHome = () => {
    window.location.href = '/';
  };

  // Loading state
  if (loading) {
    return <StationLoading />;
  }

  // Error state
  if (error || !station) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-xl font-bold">
              {error || (language === 'ar' ? 'المحطة غير موجودة' : 'Station not found')}
            </h1>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? 'قد تم حذف هذه المحطة أو الرابط غير صحيح'
                : 'This station may have been removed or the link is incorrect'}
            </p>
            <Button onClick={goToHome} className="w-full gap-2">
              <Radio className="h-4 w-4" />
              {language === 'ar' ? 'العودة للرئيسية' : 'Go to Home'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Station loaded successfully
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Breadcrumb */}
        <BreadcrumbNav 
          stationName={station.name} 
          country={station.country || station.countrycode || ''} 
          countryCode={station.countrycode || ''} 
        />

        {/* Main Station Card */}
        <article className="w-full overflow-hidden rounded-2xl bg-card shadow-lg" itemScope itemType="https://schema.org/RadioStation">
          {/* Station Image */}
          <div className="relative aspect-video sm:aspect-[2.5/1] bg-gradient-to-br from-primary/20 to-primary/5 rounded-t-2xl overflow-hidden">
            <img
              src={stationImage}
              alt={station.name}
              className="w-full h-full object-contain"
              onError={handleImageError}
              itemProp="image"
            />

            {/* Playing indicator */}
            {currentStation?.stationuuid === station.stationuuid && isPlaying && (
              <div className="absolute top-4 end-4 bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                {language === 'ar' ? 'يعمل الآن' : 'Now Playing'}
              </div>
            )}
          </div>

          {/* Station Name (separate below image) */}
          <div className="px-6 pt-4">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" itemProp="name">{station.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {station.country && (
                <span className="flex items-center gap-1" itemProp="areaServed">
                  <Globe className="h-4 w-4" />
                  {station.country}
                </span>
              )}
              {station.bitrate > 0 && (
                <span className="flex items-center gap-1">
                  <HeadphonesIcon className="h-4 w-4" />
                  {station.bitrate} kbps
                </span>
              )}
              {station.codec && (
                <Badge variant="outline" className="text-xs">{station.codec.toUpperCase()}</Badge>
              )}
            </div>
          </div>

          {/* Tags */}
          {station.tags && (
            <div className="px-6 pt-4 flex flex-wrap gap-1.5">
              {station.tags.split(',').slice(0, 8).map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="p-6 flex flex-wrap gap-3">
            <Button
              onClick={handlePlay}
              size="lg"
              className={cn(
                "flex-1 gap-2 min-w-[140px]",
                currentStation?.stationuuid === station.stationuuid && isPlaying && "bg-green-500 hover:bg-green-600"
              )}
            >
              {currentStation?.stationuuid === station.stationuuid && isPlaying ? (
                <span className="w-3 h-3 bg-white rounded-full animate-pulse" />
              ) : (
                <Play className="h-5 w-5" />
              )}
              {currentStation?.stationuuid === station.stationuuid && isPlaying
                ? (language === 'ar' ? 'يعمل الآن' : 'Now Playing')
                : (language === 'ar' ? 'شغِّل الآن' : 'Play Now')
              }
            </Button>

            <Button
              variant={isFavorite ? "default" : "outline"}
              size="lg"
              onClick={handleToggleFavorite}
              className="gap-2"
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
              {isFavorite ? (language === 'ar' ? 'مفضلة' : 'Saved') : (language === 'ar' ? 'حفظ' : 'Save')}
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleShare}
              className="gap-2"
            >
              <Share2 className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={goToHome}
              className="gap-2"
            >
              <Radio className="h-5 w-5" />
              {language === 'ar' ? 'استكشف' : 'Explore'}
            </Button>
          </div>
        </article>

        {/* Related Stations */}
        {relatedLoading ? (
          <div className="mt-8">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ) : (
          <RelatedStationsSection 
            stations={relatedStations} 
            language={language} 
            country={station.country || station.countrycode || 'المنطقة'} 
          />
        )}

        {/* SEO Content */}
        {station && <StationSEOContent station={station} language={language} />}

        {/* Footer with internal links */}
        <footer className="mt-8 pt-6 border-t pb-24">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
              <ChevronRight className="h-4 w-4" />
              {language === 'ar' ? 'العودة إلى جميع المحطات' : 'Back to All Stations'}
            </a>
            <p className="text-xs text-muted-foreground text-center">
              {language === 'ar'
                ? `اسمع راديو - بث مباشر لمحطات راديو من حول العالم والقرآن الكريم | ${station.name}`
                : `Esmaa Radio - Live streaming of radio stations from around the world and Quran | ${station.name}`}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

// Export the wrapped component as default
export default StationClientWithSuspense;
