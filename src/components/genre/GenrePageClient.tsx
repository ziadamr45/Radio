'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { StationCard } from '@/components/radio/StationCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRadioStore } from '@/stores/radio-store';
import { useUserData } from '@/components/providers/UserDataProvider';
import { Radio, Loader2, ArrowUp } from 'lucide-react';
import type { RadioStation } from '@/types/radio';

interface GenreConfig {
  tag: string;
  nameAr: string;
  nameEn: string;
  color: string;
  slug: string;
  description: string;
  keywords: string[];
}

interface GenrePageClientProps {
  genreSlug: string;
  genreConfig: GenreConfig;
  initialStations: Array<Record<string, unknown>>;
}

// Convert raw station data to RadioStation type
function toRadioStation(raw: Record<string, unknown>): RadioStation {
  return {
    changeuuid: String(raw.changeuuid || ''),
    stationuuid: String(raw.stationuuid || ''),
    serveruuid: (raw.serveruuid as string) || null,
    name: String(raw.name || ''),
    url: String(raw.url || ''),
    url_resolved: String(raw.url_resolved || raw.url || ''),
    homepage: String(raw.homepage || ''),
    favicon: String(raw.favicon || ''),
    tags: String(raw.tags || ''),
    country: String(raw.country || ''),
    countrycode: String(raw.countrycode || ''),
    iso_3166_2: (raw.iso_3166_2 as string) || null,
    state: String(raw.state || ''),
    language: String(raw.language || ''),
    languagecodes: String(raw.languagecodes || ''),
    votes: Number(raw.votes || 0),
    lastchangetime: String(raw.lastchangetime || ''),
    lastchangetime_iso8601: String(raw.lastchangetime_iso8601 || ''),
    codec: String(raw.codec || ''),
    bitrate: Number(raw.bitrate || 0),
    hls: Number(raw.hls || 0),
    lastcheckok: Number(raw.lastcheckok || 1),
    lastchecktime: String(raw.lastchecktime || ''),
    lastchecktime_iso8601: String(raw.lastchecktime_iso8601 || ''),
    lastcheckoktime: String(raw.lastcheckoktime || ''),
    lastcheckoktime_iso8601: String(raw.lastcheckoktime_iso8601 || ''),
    lastlocalchecktime: String(raw.lastlocalchecktime || ''),
    lastlocalchecktime_iso8601: String(raw.lastlocalchecktime_iso8601 || ''),
    clicktimestamp: String(raw.clicktimestamp || ''),
    clicktimestamp_iso8601: String(raw.clicktimestamp_iso8601 || ''),
    clickcount: Number(raw.clickcount || 0),
    clicktrend: Number(raw.clicktrend || 0),
    ssl_error: Number(raw.ssl_error || 0),
    geo_lat: (raw.geo_lat as number) || null,
    geo_long: (raw.geo_long as number) || null,
    has_extended_info: Boolean(raw.has_extended_info),
    qualityScore: Number(raw.qualityScore || 0),
  };
}

export default function GenrePageClient({
  genreSlug,
  genreConfig,
  initialStations,
}: GenrePageClientProps) {
  const { language } = useRadioStore();
  const { saveHistory } = useUserData();

  const [stations, setStations] = useState<RadioStation[]>(
    initialStations.map(toRadioStation)
  );
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(100);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/radio?action=tags&tag=${encodeURIComponent(genreConfig.tag)}&limit=100`
      );
      const data = await res.json();
      if (data.success && data.data) {
        const newStations = data.data.map(toRadioStation);
        // Filter out duplicates
        const existingIds = new Set(stations.map((s) => s.stationuuid));
        const unique = newStations.filter((s) => !existingIds.has(s.stationuuid));
        setStations((prev) => [...prev, ...unique]);
        setOffset((prev) => prev + 100);
      }
    } catch (error) {
      console.error('Failed to load more stations:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handlePlay = useCallback(
    (station: RadioStation) => {
      const { setCurrentStation, setIsPlaying } = useRadioStore.getState();
      setCurrentStation(station);
      setIsPlaying(true);
      saveHistory(station);
    },
    [saveHistory]
  );

  const handleStationClick = useCallback((station: RadioStation) => {
    window.location.assign(`/station/${station.stationuuid}`);
  }, []);

  return (
    <div>
      {/* Station Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Radio className="h-4 w-4" />
          <span>
            {stations.length} محطة {genreConfig.nameAr}
          </span>
        </div>
      </div>

      {/* Stations Grid */}
      {stations.length === 0 ? (
        <div className="text-center py-16">
          <Radio className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد محطات</h3>
          <p className="text-muted-foreground">
            لا توجد محطات متاحة حالياً في تصنيف {genreConfig.nameAr}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stations.map((station) => (
            <StationCard
              key={station.stationuuid}
              station={station}
              onPlay={handlePlay}
              onStationClick={handleStationClick}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {loadingMore ? (
        <div className="flex justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جاري تحميل المزيد...</span>
          </div>
        </div>
      ) : (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={loadMore}
            className="gap-2"
            style={{
              borderColor: `${genreConfig.color}40`,
              color: genreConfig.color,
            }}
          >
            <Radio className="h-4 w-4" />
            تحميل المزيد من محطات {genreConfig.nameAr}
          </Button>
        </div>
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 start-6 z-40 text-white p-3 rounded-full shadow-lg hover:opacity-90 transition-all"
          style={{ backgroundColor: genreConfig.color }}
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
