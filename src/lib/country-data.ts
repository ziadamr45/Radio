/**
 * Country data utilities - shared between country pages and other components
 */

// Arabic country names mapping
export const COUNTRY_NAMES_AR: Record<string, string> = {
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
  US: 'أمريكا',
  GB: 'بريطانيا',
  FR: 'فرنسا',
  DE: 'ألمانيا',
  TR: 'تركيا',
  BR: 'البرازيل',
  IN: 'الهند',
  JP: 'اليابان',
  CN: 'الصين',
  RU: 'روسيا',
  ES: 'إسبانيا',
  IT: 'إيطاليا',
  ID: 'إندونيسيا',
  MY: 'ماليزيا',
  PK: 'باكستان',
  IR: 'إيران',
  AF: 'أفغانستان',
  BD: 'بنغلاديش',
  TH: 'تايلاند',
  NL: 'هولندا',
  BE: 'بلجيكا',
  SE: 'السويد',
  NO: 'النرويج',
  DK: 'الدنمارك',
  FI: 'فنلندا',
  CH: 'سويسرا',
  AT: 'النمسا',
  PL: 'بولندا',
  PT: 'البرتغال',
  GR: 'اليونان',
  CZ: 'التشيك',
  RO: 'رومانيا',
  HU: 'المجر',
  UA: 'أوكرانيا',
  CA: 'كندا',
  AU: 'أستراليا',
  NZ: 'نيوزيلندا',
  MX: 'المكسيك',
  AR: 'الأرجنتين',
  CO: 'كولومبيا',
  CL: 'تشيلي',
  PE: 'بيرو',
  CU: 'كوبا',
  NG: 'نيجيريا',
  ZA: 'جنوب أفريقيا',
  KE: 'كينيا',
  ET: 'إثيوبيا',
  SO: 'الصومال',
  DJ: 'جيبوتي',
  KM: 'جزر القمر',
  TD: 'تشاد',
  NE: 'النيجر',
  ML: 'مالي',
  SN: 'السنغال',
  GN: 'غينيا',
  GW: 'غينيا بيساو',
  SL: 'سيراليون',
  LR: 'ليبيريا',
  BF: 'بوركينا فاسو',
  CI: 'ساحل العاج',
  GH: 'غانا',
  TG: 'توغو',
  BJ: 'بنين',
  TG: 'توغو',
  CM: 'الكاميرون',
  CG: 'الكونغو',
  CD: 'الكونغو الديمقراطية',
  GA: 'الغابون',
  GQ: 'غينيا الاستوائية',
  CF: 'أفريقيا الوسطى',
  AO: 'أنغولا',
  MZ: 'موزمبيق',
  TZ: 'تنزانيا',
  UG: 'أوغندا',
  RW: 'رواندا',
  BI: 'بوروندي',
  MG: 'مدغشقر',
  MU: 'موريشيوس',
  SC: 'سيشل',
  ST: 'ساو تومي وبرينسيبي',
  CV: 'الرأس الأخضر',
  GM: 'غامبيا',
  TN: 'تونس',
};

// Genre configuration
export const GENRE_CONFIG: Record<string, {
  tag: string;
  nameAr: string;
  nameEn: string;
  color: string;
  slug: string;
  description: string;
  keywords: string[];
}> = {
  quran: {
    tag: 'quran',
    nameAr: 'قرآن كريم',
    nameEn: 'Holy Quran',
    color: '#059669',
    slug: 'quran',
    description: 'استمع إلى إذاعات القرآن الكريم بث مباشر من مختلف أنحاء العالم. تلاوات قرآنية عذبة على مدار الساعة من أشهر القراء.',
    keywords: ['قرآن كريم', 'إذاعة القرآن', 'راديو قرآن', 'تلاوة قرآنية', 'بث قرآن مباشر', 'quran radio', 'quran live'],
  },
  islamic: {
    tag: 'islamic',
    nameAr: 'إسلامي',
    nameEn: 'Islamic',
    color: '#0D9488',
    slug: 'islamic',
    description: 'محطات إذاعية إسلامية متنوعة تقدم برامج دينية ومواعظ وخطب وأناشيد إسلامية. استمع إلى محتوى إسلامي مميز بث مباشر.',
    keywords: ['راديو إسلامي', 'إذاعة إسلامية', 'برامج دينية', 'مواعظ', 'أناشيد إسلامية', 'islamic radio'],
  },
  nasheed: {
    tag: 'nasheed',
    nameAr: 'أناشيد',
    nameEn: 'Nasheed',
    color: '#D97706',
    slug: 'nasheed',
    description: 'محطات متخصصة في الأناشيد الإسلامية والأغاني الدينية. استمع إلى أجمل الأناشيد الإسلامية بجودة عالية بدون موسيقى.',
    keywords: ['أناشيد إسلامية', 'إنشاد ديني', 'أناشيد بدون موسيقى', 'أغاني إسلامية', 'nasheed radio'],
  },
  music: {
    tag: 'music',
    nameAr: 'موسيقى',
    nameEn: 'Music',
    color: '#7C3AED',
    slug: 'music',
    description: 'محطات راديو موسيقية متنوعة تقدم أحدث الأغاني من حول العالم. استمع إلى راديو الموسيقى العالمية بث مباشر.',
    keywords: ['راديو موسيقى', 'أغاني', 'موسيقى', 'راديو أغاني', 'music radio'],
  },
  news: {
    tag: 'news',
    nameAr: 'أخبار',
    nameEn: 'News',
    color: '#DC2626',
    slug: 'news',
    description: 'محطات إذاعية إخبارية تقدم آخر الأخبار المحلية والعالمية على مدار الساعة. ابقَ على اطلاع بكل جديد.',
    keywords: ['راديو أخبار', 'إذاعة أخبار', 'أخبار', 'أخبار مباشر', 'news radio'],
  },
  sport: {
    tag: 'sport',
    nameAr: 'رياضة',
    nameEn: 'Sport',
    color: '#059669',
    slug: 'sport',
    description: 'محطات راديو رياضية تغطي أحدث الأحداث الرياضية والبطولات والمباريات. استمع للتعليق الرياضي المباشر.',
    keywords: ['راديو رياضي', 'إذاعة رياضية', 'تعليق رياضي', 'أخبار رياضية', 'sport radio'],
  },
  talk: {
    tag: 'talk',
    nameAr: 'حواريات',
    nameEn: 'Talk',
    color: '#2563EB',
    slug: 'talk',
    description: 'محطات حوارية تقدم برامج حوارية وندوات ومناقشات في مختلف المجالات. استمع إلى أفضل البرامج الحوارية من حول العالم.',
    keywords: ['راديو حواري', 'برامج حوارية', 'ندوات', 'مناقشات', 'talk radio'],
  },
  entertainment: {
    tag: 'entertainment',
    nameAr: 'ترفيه',
    nameEn: 'Entertainment',
    color: '#EC4899',
    slug: 'entertainment',
    description: 'محطات ترفيهية تقدم برامج ترفيهية ومسابقات وكوميديا وترفيه للمستمعين. استمع إلى أجمل البرامج الترفيهية.',
    keywords: ['راديو ترفيهي', 'برامج ترفيهية', 'مسابقات', 'كوميديا', 'entertainment radio'],
  },
};

// All genre slugs
export const ALL_GENRE_SLUGS = Object.keys(GENRE_CONFIG);

// Get Arabic name for country code
export function getCountryNameAr(code: string, englishName?: string): string {
  return COUNTRY_NAMES_AR[code] || englishName || code;
}

// Convert country code to emoji flag
export function countryToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌍';
  return code
    .toUpperCase()
    .split('')
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join('');
}

// Radio Browser API servers
export const RADIO_BROWSER_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
];

// Fetch with fallback servers
export async function fetchFromRadioBrowser(endpoint: string, timeout = 15000): Promise<unknown[]> {
  let lastError: Error | null = null;

  for (const baseUrl of RADIO_BROWSER_SERVERS) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'User-Agent': 'AsmaeRadio/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data as unknown[];
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  throw lastError || new Error('All Radio Browser API servers failed');
}

// Quality score calculation (matching the API route)
export function calculateQualityScore(station: Record<string, unknown>): number {
  let qualityScore = 50;

  const bitrate = typeof station.bitrate === 'number' ? station.bitrate : 0;
  if (bitrate >= 128) qualityScore += 30;
  else if (bitrate >= 64) qualityScore += 20;
  else if (bitrate >= 32) qualityScore += 10;

  if (station.lastcheckok === 1) qualityScore += 20;

  const votes = typeof station.votes === 'number' ? station.votes : 0;
  if (votes > 100) qualityScore += 10;
  else if (votes > 50) qualityScore += 7;
  else if (votes > 10) qualityScore += 5;

  if (station.ssl_error === 0) qualityScore += 5;

  return Math.min(100, Math.max(0, qualityScore));
}
