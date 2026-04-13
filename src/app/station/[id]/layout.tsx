import { Metadata } from 'next';
import Script from 'next/script';
import { getStationById, type StationData } from '@/lib/stations-dataset';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

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
};

interface DynamicStationData {
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
  clickcount: number;
}

async function fetchStationFromStatic(id: string): Promise<StationData | null> {
  // Only use static dataset for SSR - avoid external API calls that can timeout
  return getStationById(id);
}

// Check if station is from static dataset
function isStaticStation(station: DynamicStationData | StationData): station is StationData {
  return 'category' in station && typeof station.category === 'string' && 
         ['quran', 'islamic', 'nasheed', 'music', 'news', 'sport', 'talk'].includes(station.category);
}

// Default metadata (used when station can't be fetched)
function getDefaultMetadata(id: string): Metadata {
  return {
    title: 'محطة راديو | اسمع راديو',
    description: 'استمع إلى محطات الراديو المفضلة لديك على اسمع راديو - بث مباشر بجودة عالية لمحطات راديو من حول العالم والقرآن الكريم.',
    alternates: {
      canonical: `${SITE_URL}/station/${id}`,
    },
    openGraph: {
      title: 'محطة راديو | اسمع راديو',
      description: 'استمع إلى محطات الراديو المفضلة لديك على اسمع راديو.',
      type: 'website',
      locale: 'ar_SA',
      url: `${SITE_URL}/station/${id}`,
      siteName: 'اسمع راديو',
      images: [
        {
          url: '/icons/icon-512x512.png',
          width: 512,
          height: 512,
          alt: 'اسمع راديو',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'محطة راديو | اسمع راديو',
      description: 'استمع إلى محطات الراديو المفضلة لديك على اسمع راديو.',
      images: ['/icons/icon-512x512.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// Generate metadata for the layout (fallback if page metadata doesn't work)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const station = await fetchStationFromStatic(id);

    if (!station) {
      return getDefaultMetadata(id);
    }

    const countryAr = COUNTRIES_AR[station.countrycode ?? ''] || station.country;
    const categoryAr = isStaticStation(station) ? CATEGORY_AR[station.category] : 'راديو';
    
    // SEO-optimized title (don't add "إذاعة" prefix if name already starts with it)
    const title = station.name.startsWith('إذاعة') 
      ? `${station.name} بث مباشر | استمع الآن بجودة عالية`
      : `إذاعة ${station.name} بث مباشر | استمع الآن بجودة عالية`;
    
    // Description
    let description: string;
    if (isStaticStation(station) && station.description) {
      description = station.description;
    } else {
      description = `استمع إلى ${station.name} بث مباشر من ${countryAr}. إذاعة ${categoryAr} تقدم محتوى مميز. بث مباشر بدون تقطيع على اسمع راديو.`;
    }
    
    // Generate keywords
    const tags = isStaticStation(station) ? station.tags : (station.tags || '').split(',').map(t => t.trim());
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
      ...tags.slice(0, 5),
    ].filter(Boolean);

    const ogImage = isStaticStation(station) 
      ? (station.imageUrl || '/icons/icon-512x512.png')
      : (station.favicon || '/icons/icon-512x512.png');

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `${SITE_URL}/station/${station.stationuuid || (isStaticStation(station) ? station.id : '')}`,
      },
      openGraph: {
        title,
        description,
        type: 'website',
        locale: 'ar_SA',
        url: `${SITE_URL}/station/${station.stationuuid || (isStaticStation(station) ? station.id : '')}`,
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
  } catch (error) {
    console.error('[StationLayout] Failed to fetch station metadata:', error);
    return getDefaultMetadata(id);
  }
}

// JSON-LD structured data generator
function generateStationJsonLd(station: DynamicStationData | StationData) {
  const stationId = isStaticStation(station) ? station.id : (station as DynamicStationData).stationuuid;
  const stationUrl = `${SITE_URL}/station/${stationId}`;
  const countryAr = COUNTRIES_AR[(station.countrycode ?? '') || ''] || station.country;
  const categoryAr = isStaticStation(station) ? CATEGORY_AR[station.category] : 'راديو';
  const tags = isStaticStation(station) ? station.tags : ((station as DynamicStationData).tags || '').split(',').map(t => t.trim());
  const description = isStaticStation(station) && station.description 
    ? station.description 
    : `استمع إلى ${station.name} بث مباشر من ${countryAr}.`;
  const imageUrl = isStaticStation(station) 
    ? (station.imageUrl || `${SITE_URL}/icons/icon-512x512.png`)
    : (station.favicon || `${SITE_URL}/icons/icon-512x512.png`);
  const streamUrl = isStaticStation(station) ? station.streamUrl : station.url_resolved;
  const codec = isStaticStation(station) ? (station.codec || 'MP3') : (station.codec || 'MP3');
  const bitrate = isStaticStation(station) ? (station.bitrate || 128) : (station.bitrate || 128);

  // RadioStation schema
  const radioStationSchema = {
    '@context': 'https://schema.org',
    '@type': 'RadioStation',
    name: station.name,
    url: stationUrl,
    description,
    inLanguage: 'ar',
    genre: tags.slice(0, 5),
    broadcastDisplayName: station.name,
    areaServed: {
      '@type': 'Country',
      name: countryAr,
    },
    image: imageUrl,
    logo: imageUrl,
    broadcastAffiliateOf: {
      '@type': 'Organization',
      name: 'اسمع راديو',
      url: SITE_URL,
    },
    potentialAction: {
      '@type': 'ListenAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: stationUrl,
        actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'],
      },
      expectsAcceptanceOf: {
        '@type': 'Offer',
        availability: 'https://schema.org/InStock',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'محطات الراديو',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: countryAr,
        item: `${SITE_URL}/?country=${station.countrycode}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: station.name,
        item: stationUrl,
      },
    ],
  };

  // AudioBroadcast schema for the stream
  const audioBroadcastSchema = {
    '@context': 'https://schema.org',
    '@type': 'AudioBroadcast',
    name: `${station.name} بث مباشر`,
    description,
    url: stationUrl,
    broadcastDisplayName: station.name,
    inLanguage: 'ar',
    genre: tags.slice(0, 3),
    isLiveBroadcast: true,
    associatedMedia: {
      '@type': 'MediaObject',
      contentUrl: streamUrl,
      encodingFormat: codec,
      bitrate: `${bitrate}`,
    },
    publishedBy: {
      '@type': 'Organization',
      name: station.name,
    },
  };

  // FAQ schema for common questions
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `كيف أستمع إلى ${station.name} مباشر؟`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `يمكنك الاستماع إلى ${station.name} بث مباشر من خلال موقع اسمع راديو. اضغط على زر التشغيل للاستماع الفوري بجودة عالية.`,
        },
      },
      {
        '@type': 'Question',
        name: `هل ${station.name} متاحة للبث المباشر على مدار الساعة؟`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `نعم، ${station.name} تبث على مدار الساعة طوال أيام الأسبوع. يمكنك الاستماع في أي وقت من خلال موقع اسمع راديو.`,
        },
      },
    ],
  };

  return (
    <>
      <Script
        id="station-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(radioStationSchema),
        }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <Script
        id="audio-broadcast-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(audioBroadcastSchema),
        }}
      />
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
    </>
  );
}

// Default JSON-LD for when station can't be fetched
function generateDefaultJsonLd(id: string) {
  const stationUrl = `${SITE_URL}/station/${id}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'محطة راديو',
        item: stationUrl,
      },
    ],
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema),
      }}
    />
  );
}

// Server component that fetches station for JSON-LD
async function StationJsonLd({ stationId }: { stationId: string }) {
  try {
    const station = await fetchStationFromStatic(stationId);
    if (station) {
      return generateStationJsonLd(station);
    }
    return generateDefaultJsonLd(stationId);
  } catch {
    return generateDefaultJsonLd(stationId);
  }
}

export default async function StationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <StationJsonLd stationId={id} />
      {children}
    </>
  );
}
