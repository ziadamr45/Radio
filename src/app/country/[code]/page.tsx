import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CountryPageClient from '@/components/country/CountryPageClient';
import {
  fetchFromRadioBrowser,
  calculateQualityScore,
  getCountryNameAr,
  countryToFlag,
} from '@/lib/country-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

// Allow dynamic params for countries added later
export const dynamicParams = true;

interface CountryInfo {
  iso_3166_1: string;
  name: string;
  stationcount: number;
}

// Cache country list at module level for reuse
let cachedCountries: CountryInfo[] | null = null;

async function getAllCountries(): Promise<CountryInfo[]> {
  if (cachedCountries) return cachedCountries;

  try {
    const countries = await fetchFromRadioBrowser('/countries');
    const filtered = (countries as CountryInfo[])
      .filter((c) => c.stationcount > 0)
      .sort((a, b) => b.stationcount - a.stationcount);
    cachedCountries = filtered;
    return filtered;
  } catch (error) {
    console.error('[CountryPage] Failed to fetch countries:', error);
    return [];
  }
}

// Generate static params for ALL countries with stations
export async function generateStaticParams() {
  const countries = await getAllCountries();
  console.log(`[CountryPage] Generating ${countries.length} static country pages`);

  return countries.map((country) => ({
    code: country.iso_3166_1,
  }));
}

// Generate comprehensive metadata per country
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const codeUpper = code.toUpperCase();
  const countries = await getAllCountries();
  const country = countries.find((c) => c.iso_3166_1 === codeUpper);

  if (!country) {
    return {
      title: 'راديو مباشر | اسمع راديو',
      description: 'استمع إلى محطات الراديو من جميع أنحاء العالم على اسمع راديو.',
    };
  }

  const countryAr = getCountryNameAr(codeUpper, country.name);
  const countryEn = country.name;
  const stationCount = country.stationcount;

  // Fetch top 10 stations for keyword extraction
  let topStationNames: string[] = [];
  try {
    const stations = await fetchFromRadioBrowser(
      `/stations/bycountrycodeexact/${codeUpper}?limit=10&order=votes&reverse=true`
    );
    topStationNames = (stations as Array<{ name: string }>)
      .map((s) => s.name)
      .slice(0, 10);
  } catch {
    // Silently fail - keywords are optional
  }

  const title = `راديو ${countryAr} مباشر | جميع محطات الراديو من ${countryAr} - اسمع راديو`;
  const description = `استمع إلى جميع محطات الراديو من ${countryEn} بث مباشر. أكثر من ${stationCount} محطة إذاعية من ${countryEn} متاحة على اسمع راديو. ${countryAr} راديو مباشر بدون تقطيع.`;

  const keywords = [
    `راديو ${countryAr}`,
    `راديو ${countryAr} مباشر`,
    `${countryAr} راديو`,
    `محطات راديو ${countryAr}`,
    `إذاعات ${countryAr}`,
    `بث مباشر ${countryAr}`,
    `${countryEn} radio`,
    `${countryEn} radio live`,
    `${countryEn} radio stations`,
    'راديو مباشر',
    'بث مباشر',
    'محطات إذاعية',
    'اسمع راديو',
    'راديو عالمي',
    'online radio',
    ...topStationNames.slice(0, 5),
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_URL}/country/${codeUpper}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_SA',
      url: `${SITE_URL}/country/${codeUpper}`,
      siteName: 'اسمع راديو',
      images: [
        {
          url: '/icons/icon-512x512.png',
          width: 512,
          height: 512,
          alt: `راديو ${countryAr} مباشر - اسمع راديو`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/icons/icon-512x512.png'],
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

// Generate SEO-rich Arabic content for a country
function generateCountrySEOContent(
  countryAr: string,
  countryEn: string,
  stationCount: number,
  topStations: Array<{ name: string; tags: string; codec: string; bitrate: number }>
): string {
  const stationNamesHtml = topStations
    .slice(0, 10)
    .map((s) => `<strong>${s.name}</strong>`)
    .join(' و ');

  return `
    <h2>راديو ${countryAr} بث مباشر</h2>
    <p>مرحباً بكم في صفحة راديو ${countryAr} على موقع اسمع راديو. نقدم لكم أكبر مجموعة من محطات الراديو من ${countryAr} بث مباشر على مدار الساعة. يمكنك الاستماع إلى أكثر من ${stationCount} محطة إذاعية من ${countryEn} بجودة عالية وبدون تقطيع.</p>
    
    <h2>محطات راديو ${countryAr} الأشهر</h2>
    <p>تضم قائمة محطات راديو ${countryAr} على اسمع راديو أشهر الإذاعات مثل ${stationNamesHtml}. جميع هذه المحطات تبث مباشرة على مدار الساعة ويمكنكم الاستماع إليها مجاناً من أي مكان في العالم.</p>
    
    <h2>استمع إلى راديو ${countryAr} اون لاين</h2>
    <p>بفضل موقع اسمع راديو، يمكنك الآن الاستماع إلى جميع محطات راديو ${countryAr} عبر الإنترنت بسهولة تامة. لا حاجة لتحميل أي تطبيق، فقط اختر المحطة المفضلة لديك وابدأ الاستماع فوراً. نوفر لكم بث مباشر بجودة عالية مع ضمان عدم التقطيع.</p>
    
    <h2>أنواع محطات راديو ${countryAr}</h2>
    <p>تنوع المحطات الإذاعية في ${countryAr} يشمل محطات القرآن الكريم والمحطات الإسلامية والمحطات الموسيقية ومحطات الأخبار والمحطات الرياضية والمحطات الحوارية. سواء كنت تبحث عن تلاوات قرآنية أو أغاني أو أخبار عاجلة، ستجد ما يناسبك في قائمة راديو ${countryAr} على اسمع راديو.</p>
    
    <h2>لماذا اسمع راديو؟</h2>
    <p>اسمع راديو هو أفضل موقع للاستماع إلى راديو ${countryAr} مباشر عبر الإنترنت. نوفر لكم تجربة استماع مميزة بجودة صوت عالية وبدون إعلانات مزعجة. كما يمكنكم حفظ المحطات المفضلة لديكم والعودة إليها في أي وقت. مع اسمع راديو، راديو ${countryAr} أصبح في متناول يدك أينما كنت.</p>
  `;
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const codeUpper = code.toUpperCase();
  const countries = await getAllCountries();
  const country = countries.find((c) => c.iso_3166_1 === codeUpper);

  if (!country) {
    notFound();
  }

  const countryAr = getCountryNameAr(codeUpper, country.name);
  const countryEn = country.name;
  const stationCount = country.stationcount;
  const flag = countryToFlag(codeUpper);

  // Fetch top 50 stations for this country
  let rawStations: Array<Record<string, unknown>> = [];
  try {
    const stations = await fetchFromRadioBrowser(
      `/stations/bycountrycodeexact/${codeUpper}?limit=50&order=clickcount&reverse=true`
    );
    rawStations = (stations as Array<Record<string, unknown>>).map((station) => ({
      ...station,
      qualityScore: calculateQualityScore(station),
    }));
  } catch (error) {
    console.error(`[CountryPage] Failed to fetch stations for ${codeUpper}:`, error);
  }

  // Top station names for SEO content
  const topStationsForSEO = rawStations.slice(0, 10).map((s) => ({
    name: String(s.name || ''),
    tags: String(s.tags || ''),
    codec: String(s.codec || ''),
    bitrate: Number(s.bitrate || 0),
  }));

  const seoContentHtml = generateCountrySEOContent(countryAr, countryEn, stationCount, topStationsForSEO);

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/country/${codeUpper}`,
        url: `${SITE_URL}/country/${codeUpper}`,
        name: `راديو ${countryAr} مباشر | اسمع راديو`,
        description: `استمع إلى جميع محطات الراديو من ${countryEn} بث مباشر. أكثر من ${stationCount} محطة إذاعية متاحة.`,
        inLanguage: 'ar',
        isPartOf: {
          '@id': `${SITE_URL}/#website`,
        },
        about: {
          '@type': 'Country',
          name: countryEn,
          nameAr: countryAr,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElements: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'الرئيسية',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'الدول',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${flag} ${countryAr}`,
            item: `${SITE_URL}/country/${codeUpper}`,
          },
        ],
      },
      {
        '@type': 'ItemList',
        name: `محطات راديو ${countryAr}`,
        description: `قائمة بأهم محطات الراديو من ${countryAr}`,
        numberOfItems: stationCount,
        itemListElement: rawStations.slice(0, 50).map((station, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'RadioStation',
            name: String(station.name || ''),
            url: `${SITE_URL}/station/${station.stationuuid}`,
            image: String(station.favicon || ''),
            broadcaster: {
              '@type': 'Organization',
              name: String(station.name || ''),
            },
            inLanguage: String(station.language || ''),
            areaServed: {
              '@type': 'Country',
              name: countryEn,
            },
          },
        })),
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Server-rendered header + client island */}
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        {/* Hero Section - Server Rendered */}
        <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li>
                  <a href="/" className="hover:text-primary transition-colors">
                    الرئيسية
                  </a>
                </li>
                <li>/</li>
                <li>
                  <span className="text-foreground font-medium">
                    {flag} {countryAr}
                  </span>
                </li>
              </ol>
            </nav>

            <div className="flex items-start gap-4">
              <span className="text-5xl">{flag}</span>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  راديو {countryAr} مباشر
                </h1>
                <p className="text-muted-foreground text-lg mb-3">
                  استمع إلى جميع محطات الراديو من {countryEn} بث مباشر
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium">
                    📻 {stationCount.toLocaleString('ar-EG')} محطة إذاعية
                  </div>
                  <div className="bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full text-sm font-medium">
                    ✅ بث مباشر بدون تقطيع
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Client Island - Interactive Stations List */}
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <CountryPageClient
            countryCode={codeUpper}
            countryName={countryAr}
            countryNameEn={countryEn}
            stationCount={stationCount}
            initialStations={rawStations}
          />

          {/* SEO Content Section */}
          <section className="mt-12 prose prose-sm dark:prose-invert max-w-none">
            <div
              className="bg-muted/30 rounded-xl p-6"
              dangerouslySetInnerHTML={{ __html: seoContentHtml }}
            />
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t pb-24 text-center">
            <p className="text-sm text-muted-foreground">
              اسمع راديو - بث مباشر لجميع محطات الراديو من {countryAr} |{' '}
              {countryEn} Radio Live
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
