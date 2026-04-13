const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

// WebSite schema
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'اسمع راديو',
  alternateName: 'Esmaa Radio',
  url: SITE_URL,
  description:
    'استمع إلى أفضل محطات الراديو من حول العالم والقرآن الكريم بث مباشر بجودة عالية. راديو من جميع الدول في مكان واحد.',
  inLanguage: ['ar', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  genre: ['Radio', 'Quran', 'Islamic', 'Arabic Music', 'Live Streaming'],
  audience: {
    '@type': 'Audience',
    audienceType: 'Radio Listeners',
    geographicArea: {
      '@type': 'Place',
      name: 'Worldwide',
    },
  },
};

// Organization schema
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'اسمع راديو',
  alternateName: 'Esmaa Radio',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/icons/icon-512x512.png`,
    width: 512,
    height: 512,
  },
  description:
    'منصة اسمع راديو هي تطبيق ويب متقدم لبث مباشر لجميع محطات الراديو من حول العالم والقرآن الكريم.',
  foundingDate: '2026',
  sameAs: [],
};

// WebApplication schema (PWA)
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'اسمع راديو',
  alternateName: 'Esmaa Radio',
  url: SITE_URL,
  description:
    'استمع إلى أفضل محطات الراديو من حول العالم والقرآن الكريم بث مباشر بجودة عالية. تطبيق ويب تقدمي (PWA) يعمل على جميع الأجهزة.',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
  },
  featureList: [
    'بث مباشر لمحطات الراديو من حول العالم',
    'استماع للقرآن الكريم بأصوات أشهر القراء',
    'مؤقت نوم ذكي',
    'مساعد ذكاء اصطناعي',
    'وضع إسلامي',
    'تطبيق ويب تقدمي (PWA)',
    'العمل بدون إنترنت للمفضلة المحفوظة',
  ],
  screenshot: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/screenshots/home.jpg`,
    width: 768,
    height: 1344,
  },
  installUrl: SITE_URL,
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
    </>
  );
}
