import { MetadataRoute } from 'next';
import { STATIONS, type StationData } from '@/lib/stations-dataset';
import { RECITERS } from '@/lib/reciters-dataset';
import { SURAHS } from '@/lib/surahs-dataset';
import { GENRE_CONFIG, ALL_GENRE_SLUGS } from '@/lib/country-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

// Radio Browser API servers (mirrors) - for dynamic stations
const RADIO_BROWSER_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/at1/api/json',
  'https://nl1.api.radio-browser.info/json',
];

// Priority by category
const CATEGORY_PRIORITY: Record<string, number> = {
  quran: 0.95,
  islamic: 0.90,
  nasheed: 0.85,
  news: 0.80,
  music: 0.75,
  sport: 0.75,
  talk: 0.70,
};

interface DynamicStationData {
  stationuuid: string;
  lastchangetime: string;
  name: string;
}

async function fetchFromRadioBrowser(endpoint: string): Promise<DynamicStationData[]> {
  let lastError: Error | null = null;

  for (const baseUrl of RADIO_BROWSER_SERVERS) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'User-Agent': 'AsmaeRadio/1.0',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(15000),
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as DynamicStationData[];
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  throw lastError || new Error('All Radio Browser API servers failed');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/share`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/ai-radio-assistant`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];

  // Track unique station IDs to avoid duplicates
  const seenIds = new Set<string>();
  const stationPages: MetadataRoute.Sitemap = [];

  function addStaticStation(station: StationData) {
    if (station.id && !seenIds.has(station.id)) {
      seenIds.add(station.id);
      const priority = CATEGORY_PRIORITY[station.category] || 0.75;
      stationPages.push({
        url: `${SITE_URL}/station/${station.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority,
      });
    }
  }

  function addDynamicStation(station: DynamicStationData, priority: number, changeFreq: 'daily' | 'weekly' | 'monthly' = 'weekly') {
    if (station.stationuuid && !seenIds.has(station.stationuuid)) {
      seenIds.add(station.stationuuid);
      stationPages.push({
        url: `${SITE_URL}/station/${station.stationuuid}`,
        lastModified: station.lastchangetime
          ? new Date(station.lastchangetime).toISOString()
          : now,
        changeFrequency: changeFreq,
        priority,
      });
    }
  }

  // 1. Add all static radio stations from our dataset (302)
  for (const station of STATIONS) {
    addStaticStation(station);
  }

  console.log(`[Sitemap] Added ${stationPages.length} radio stations from dataset`);

  // 2. Add all Quran reciters (50+)
  const reciterPages: MetadataRoute.Sitemap = RECITERS.map((reciter) => ({
    url: `${SITE_URL}/reciter/${reciter.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: reciter.isPopular ? 0.90 : 0.80,
  }));

  console.log(`[Sitemap] Added ${reciterPages.length} reciter pages`);

  // 3. Add all Surahs (114)
  const surahPages: MetadataRoute.Sitemap = SURAHS.map((surah) => ({
    url: `${SITE_URL}/surah/${surah.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  console.log(`[Sitemap] Added ${surahPages.length} surah pages`);

  try {
    // 4. Fetch additional top stations from Radio Browser API for variety
    const topClicked = await fetchFromRadioBrowser('/stations/topclick/30');
    for (const station of topClicked) {
      addDynamicStation(station, 0.85, 'daily');
    }

    // 5. Fetch Quran and Islamic stations
    const quranStations = await fetchFromRadioBrowser('/stations/bytag/quran?limit=20&order=clickcount&reverse=true')
      .catch(() => [] as DynamicStationData[]);
    for (const station of quranStations) {
      addDynamicStation(station, 0.90, 'weekly');
    }

    console.log(`[Sitemap] Total stations in sitemap: ${stationPages.length}`);

    // 6. Add country pages from Radio Browser API
    const countryPages: MetadataRoute.Sitemap = [];
    try {
      const countries = await fetchFromRadioBrowser('/countries');
      const countryData = (countries as Array<{ iso_3166_1: string; stationcount: number }>)
        .filter((c) => c.stationcount > 0)
        .sort((a, b) => b.stationcount - a.stationcount);

      for (const country of countryData) {
        const priority = country.stationcount > 100 ? 0.85 : country.stationcount > 20 ? 0.75 : 0.60;
        countryPages.push({
          url: `${SITE_URL}/country/${country.iso_3166_1}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority,
        });
      }
      console.log(`[Sitemap] Added ${countryPages.length} country pages`);
    } catch (error) {
      console.error('[Sitemap] Failed to fetch countries for sitemap:', error);
    }

    // 7. Add genre pages (8 genres)
    const genrePages: MetadataRoute.Sitemap = ALL_GENRE_SLUGS.map((slug) => {
      const genre = GENRE_CONFIG[slug];
      return {
        url: `${SITE_URL}/genre/${slug}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: slug === 'quran' ? 0.90 : 0.80,
      };
    });

    console.log(`[Sitemap] Added ${genrePages.length} genre pages`);

    return [...staticPages, ...stationPages, ...reciterPages, ...surahPages, ...countryPages, ...genrePages];
  } catch (error) {
    console.error('[Sitemap] Failed to fetch dynamic stations:', error);
    // Still return static pages if dynamic fetch fails

    // Add genre pages even on error (they're static)
    const genrePagesFallback: MetadataRoute.Sitemap = ALL_GENRE_SLUGS.map((slug) => ({
      url: `${SITE_URL}/genre/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: slug === 'quran' ? 0.90 : 0.80,
    }));

    return [...staticPages, ...stationPages, ...reciterPages, ...surahPages, ...genrePagesFallback];
  }
}
