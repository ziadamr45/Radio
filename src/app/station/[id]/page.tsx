import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StationClient from '@/components/station/StationClient';
import { StationErrorBoundary } from '@/components/station/StationErrorBoundary';
import { 
  STATIONS, 
  getStationById, 
  getRelatedStations, 
  getAllStationIds,
  type StationData 
} from '@/lib/stations-dataset';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

// Allow dynamic params for stations not in static dataset
export const dynamicParams = true;

// Category to Arabic name mapping
const CATEGORY_AR: Record<string, string> = {
  quran: 'قرآن كريم',
  islamic: 'إسلامي',
  nasheed: 'أناشيد',
  music: 'موسيقى',
  news: 'أخبار',
  sport: 'رياضة',
  talk: 'حواريات',
};

// Country code to name mapping
const COUNTRIES_AR: Record<string, string> = {
  EG: 'مصر',
  SA: 'السعودية',
  AE: 'الإمارات',
  MA: 'المغرب',
  DZ: 'الجزائر',
  TN: 'تونس',
  JO: 'الأردن',
  LB: 'لبنان',
  IQ: 'العراق',
  KW: 'الكويت',
  QA: 'قطر',
  BH: 'البحرين',
  OM: 'عمان',
  PS: 'فلسطين',
  SY: 'سوريا',
  SD: 'السودان',
  LY: 'ليبيا',
  YE: 'اليمن',
  MR: 'موريتانيا',
  GB: 'بريطانيا',
  FR: 'فرنسا',
  US: 'أمريكا',
};

// Generate static params for all 300+ stations
export async function generateStaticParams() {
  const stationIds = getAllStationIds();
  
  console.log(`[generateStaticParams] Generating ${stationIds.length} static station pages`);
  
  return stationIds.map((id) => ({
    id,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const station = getStationById(id);

  if (!station) {
    return {
      title: 'محطة راديو | اسمع راديو',
      description: 'استمع إلى محطات الراديو المفضلة لديك على اسمع راديو - بث مباشر بجودة عالية لمحطات راديو من حول العالم والقرآن الكريم.',
    };
  }

  const countryAr = COUNTRIES_AR[station.countryCode] || station.country;
  const categoryAr = CATEGORY_AR[station.category] || station.category;
  
  // SEO-optimized title (don't add "إذاعة" prefix if name already starts with it)
  const title = station.name.startsWith('إذاعة') 
    ? `${station.name} بث مباشر | استمع الآن بجودة عالية`
    : `إذاعة ${station.name} بث مباشر | استمع الآن بجودة عالية`;
  
  // Use pre-generated description or create one
  const description = station.description || 
    `استمع إلى ${station.name} بث مباشر من ${countryAr}. إذاعة ${categoryAr} تقدم محتوى مميز. بث مباشر بدون تقطيع على اسمع راديو.`;
  
  // Generate keywords
  const keywords = [
    station.name,
    `${station.name} بث مباشر`,
    `${station.name} مباشر`,
    'راديو مباشر',
    'بث مباشر راديو',
    'اسمع راديو',
    countryAr,
    `راديو ${countryAr}`,
    categoryAr,
    'محطات راديو مميزة',
    'online radio',
    'راديو عالمي',
    'استماع مباشر',
    'إذاعة',
    ...station.tags.slice(0, 5),
  ].filter(Boolean);

  const ogImage = station.imageUrl || '/icons/icon-512x512.png';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_URL}/station/${station.id}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_SA',
      url: `${SITE_URL}/station/${station.id}`,
      siteName: 'اسمع راديو',
      images: [
        {
          url: ogImage,
          width: ogImage === '/icons/icon-512x512.png' ? 512 : 192,
          height: ogImage === '/icons/icon-512x512.png' ? 512 : 192,
          alt: station.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

// Convert StationData to RelatedStation format for client
function toRelatedStation(station: StationData) {
  return {
    stationuuid: station.id,
    name: station.name,
    country: station.country,
    countrycode: station.countryCode,
    tags: station.tags.join(','),
    favicon: station.imageUrl || '',
    url_resolved: station.streamUrl,
    codec: station.codec || 'MP3',
    bitrate: station.bitrate || 128,
    votes: 0,
  };
}

// Server Component - generates static HTML
export default async function StationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const station = getStationById(id);

  if (!station) {
    // For static generation, we still render the page
    // The client will handle the API fetch for dynamic stations
    return (
      <StationErrorBoundary>
        <StationClient staticStation={null} staticRelatedStations={[]} />
      </StationErrorBoundary>
    );
  }

  // Get related stations from static dataset
  const relatedStationsData = getRelatedStations(id, 6);
  const relatedStations = relatedStationsData.map(toRelatedStation);

  return (
    <StationErrorBoundary>
      <StationClient 
        staticStation={station} 
        staticRelatedStations={relatedStations}
      />
    </StationErrorBoundary>
  );
}
