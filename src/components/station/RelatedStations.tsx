'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, ExternalLink } from 'lucide-react';
import { getStationImage, getRandomDefaultImage } from '@/lib/station-image';
import type { RadioStation } from '@/types/radio';

interface RelatedStationsProps {
  stationId: string;
  country?: string;
  tags?: string;
}

export function RelatedStations({ stationId, country, tags }: RelatedStationsProps) {
  const [relatedStations, setRelatedStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedStations = async () => {
      try {
        setLoading(true);
        // Fetch stations from same country and with similar tags
        const params = new URLSearchParams();
        params.set('action', 'related');
        if (country) params.set('country', country);
        if (tags) params.set('tags', tags.split(',').slice(0, 2).join(','));
        params.set('exclude', stationId);
        params.set('limit', '6');

        const response = await fetch(`/api/station?${params.toString()}`);
        const data = await response.json();

        if (data.success && data.data) {
          setRelatedStations(data.data.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching related stations:', error);
      } finally {
        setLoading(false);
      }
    };

    if (stationId) {
      fetchRelatedStations();
    }
  }, [stationId, country, tags]);

  if (loading) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm text-muted-foreground">محطات مشابهة</h3>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Skeleton className="w-12 h-12 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-2 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (relatedStations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
        <Radio className="h-4 w-4" />
        محطات مشابهة
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {relatedStations.map((station) => (
          <Link
            key={station.stationuuid}
            href={`/station/${station.stationuuid}`}
            className="group flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <img
              src={getStationImage(station)}
              alt={station.name}
              className="w-10 h-10 rounded-lg object-cover bg-muted"
              onError={(e) => {
                e.currentTarget.src = getRandomDefaultImage(station.stationuuid, station.name, station.tags);
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                {station.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {station.country || station.countrycode}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </div>
  );
}
