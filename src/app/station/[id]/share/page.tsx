import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Radio Browser API - Fetch single station by UUID
const RADIO_BROWSER_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
];

async function fetchStation(stationId: string) {
  let lastError: Error | null = null;
  
  for (const baseUrl of RADIO_BROWSER_SERVERS) {
    try {
      const response = await fetch(`${baseUrl}/stations/byuuid/${stationId}`, {
        headers: {
          'User-Agent': 'AsmaeRadio/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return Array.isArray(data) ? data[0] : data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }
  
  return null;
}

// Generate dynamic metadata for social sharing
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const station = await fetchStation(id);
  
  if (!station) {
    return {
      title: 'محطة غير موجودة | اسمع راديو',
      description: 'المحطة غير موجودة',
    };
  }
  
  const stationName = station.name || 'محطة راديو';
  const stationCountry = station.country || station.countrycode || '';
  const stationTags = station.tags || '';
  
  // Detect station type for description
  let categoryText = 'إذاعة متنوعة';
  const tags = stationTags.toLowerCase();
  const name = stationName.toLowerCase();
  
  if (tags.includes('quran') || tags.includes('قرآن') || name.includes('quran')) {
    categoryText = 'إذاعة قرآنية';
  } else if (tags.includes('islam') || tags.includes('إسلام') || tags.includes('nasheed')) {
    categoryText = 'إذاعة إسلامية';
  } else if (tags.includes('music') || tags.includes('موسيقى') || tags.includes('pop')) {
    categoryText = 'إذاعة موسيقية';
  } else if (tags.includes('news') || tags.includes('أخبار')) {
    categoryText = 'إذاعة أخبارية';
  }
  
  const description = `استمع إلى ${stationName}${stationCountry ? ` - ${stationCountry}` : ''} | ${categoryText}`;
  const title = `${stationName} | اسمع راديو`;
  const imageUrl = station.favicon || '/og-default.png';
  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://asmaeradio.com'}/station/${id}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'music.radio_station',
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: stationName,
        },
      ],
      locale: 'ar_EG',
      siteName: 'اسمع راديو',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

// Server component that redirects to client page
export default async function SharePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const station = await fetchStation(id);
  
  if (!station) {
    notFound();
  }
  
  // This page is for metadata only - the actual content is rendered by the client page
  // The link preview will show the station info
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta httpEquiv="refresh" content={`0;url=/station/${id}`} />
      </head>
      <body>
        <noscript>
          <meta httpEquiv="refresh" content={`0;url=/station/${id}`} />
        </noscript>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div>
            <h1>{station.name}</h1>
            <p>{station.country || station.countrycode}</p>
            <a 
              href={`/station/${id}`}
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '12px 24px',
                backgroundColor: '#8B5CF6',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              استمع الآن
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
