'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { StationCard } from '@/components/radio/StationCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRadioStore } from '@/stores/radio-store';
import { useUserData } from '@/components/providers/UserDataProvider';
import { translations } from '@/lib/translations';
import { normalizeSearch } from '@/lib/search-normalize';
import { Search, Radio, Loader2, ArrowUp } from 'lucide-react';
import type { RadioStation } from '@/types/radio';

interface CountryPageClientProps {
  countryCode: string;
  countryName: string;
  countryNameEn: string;
  stationCount: number;
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

export default function CountryPageClient({
  countryCode,
  countryName,
  countryNameEn,
  stationCount,
  initialStations,
}: CountryPageClientProps) {
  const { language } = useRadioStore();
  const { saveHistory } = useUserData();
  const t = translations[language];

  const [stations, setStations] = useState<RadioStation[]>(
    initialStations.map(toRadioStation)
  );
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(initialStations.length >= 50);
  const [offset, setOffset] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setSearchDebounce(searchQuery.trim());
    }, 500);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Fetch stations on search change
  useEffect(() => {
    const fetchStations = async () => {
      setLoading(true);
      try {
        let endpoint = `/api/radio?action=stations&country=${countryCode}&limit=200&offset=0`;
        if (searchDebounce) {
          const normalizedQuery = normalizeSearch(searchDebounce);
          endpoint += `&search=${encodeURIComponent(normalizedQuery)}`;
        }
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.success && data.data) {
          const mapped = data.data.map(toRadioStation);
          setStations(mapped);
          setHasMore(data.hasMore && !searchDebounce);
          setOffset(200);
        }
      } catch (error) {
        console.error('Failed to search stations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [searchDebounce]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !searchQuery.trim()) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loadingMore, searchQuery, offset]);

  // Show scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/radio?action=stations&country=${countryCode}&limit=200&offset=${offset}`
      );
      const data = await res.json();
      if (data.success && data.data) {
        const newStations = data.data.map(toRadioStation);
        setStations((prev) => [...prev, ...newStations]);
        setOffset((prev) => prev + 200);
        setHasMore(data.hasMore);
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
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`ابحث في محطات ${countryName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pe-10 h-11"
          />
        </div>
      </div>

      {/* Station Count */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Radio className="h-4 w-4" />
          <span>
            {searchDebounce
              ? `نتائج البحث (${stations.length})`
              : `${stations.length} محطة من أصل ${stationCount.toLocaleString('ar-EG')}`}
          </span>
        </div>
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl border overflow-hidden">
              <div className="p-4">
                <div className="flex gap-3">
                  <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              </div>
              <div className="border-t px-4 py-3">
                <Skeleton className="h-9 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : stations.length === 0 ? (
        <div className="text-center py-16">
          <Radio className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لا توجد محطات</h3>
          <p className="text-muted-foreground">
            {searchDebounce
              ? `لا توجد نتائج لـ "${searchDebounce}" في ${countryName}`
              : `لا توجد محطات متاحة حالياً من ${countryName}`}
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

      {/* Load More Trigger */}
      {hasMore && !searchQuery.trim() && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loadingMore && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>جاري تحميل المزيد...</span>
            </div>
          )}
        </div>
      )}

      {/* Load More Button (fallback) */}
      {hasMore && !searchQuery.trim() && !loadingMore && (
        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={loadMore} className="gap-2">
            <Radio className="h-4 w-4" />
            تحميل المزيد من محطات {countryName}
          </Button>
        </div>
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 start-6 z-40 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all"
          aria-label="العودة للأعلى"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
