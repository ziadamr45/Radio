// Radio Browser API - Shared utilities
// Single source of truth for API server list, fetch logic, and quality scoring

const RADIO_BROWSER_SERVERS = [
  'https://de1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
];

// In-memory cache for API responses (TTL-based)
const apiCache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60_000; // 1 minute cache

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

export async function fetchFromRadioBrowser(endpoint: string, useCache = true): Promise<unknown[]> {
  // Check cache first
  const cacheKey = endpoint;
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as unknown[];
    }
  }
  
  let lastError: Error | null = null;
  
  for (const baseUrl of RADIO_BROWSER_SERVERS) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'User-Agent': 'AsmaeRadio/1.0',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(15000),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const result = Array.isArray(data) ? data : [data];
      
      // Cache the result
      if (useCache) {
        apiCache.set(cacheKey, { data: result, timestamp: Date.now() });
        
        // Clean old cache entries periodically (keep max 100 entries)
        if (apiCache.size > 100) {
          const oldestKey = apiCache.keys().next().value;
          if (oldestKey) apiCache.delete(oldestKey);
        }
      }
      
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }
  
  throw lastError || new Error('All Radio Browser API servers failed');
}

// Countries with their ISO codes (World)
export const COUNTRIES_MAP: Record<string, { code: string; nameAr: string; nameEn: string }> = {
  // الدول العربية
  EG: { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt' },
  SA: { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia' },
  AE: { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE' },
  MA: { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco' },
  DZ: { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria' },
  TN: { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia' },
  JO: { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan' },
  LB: { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon' },
  IQ: { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq' },
  KW: { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait' },
  QA: { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar' },
  BH: { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain' },
  OM: { code: 'OM', nameAr: 'عمان', nameEn: 'Oman' },
  PS: { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine' },
  SY: { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria' },
  SD: { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan' },
  LY: { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya' },
  YE: { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen' },
  MR: { code: 'MR', nameAr: 'موريتانيا', nameEn: 'Mauritania' },
  // الدول الإسلامية
  TR: { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey' },
  IR: { code: 'IR', nameAr: 'إيران', nameEn: 'Iran' },
  ID: { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia' },
  MY: { code: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia' },
  PK: { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan' },
  AF: { code: 'AF', nameAr: 'أفغانستان', nameEn: 'Afghanistan' },
  BD: { code: 'BD', nameAr: 'بنغلاديش', nameEn: 'Bangladesh' },
  // أوروبا
  US: { code: 'US', nameAr: 'أمريكا', nameEn: 'United States' },
  GB: { code: 'GB', nameAr: 'بريطانيا', nameEn: 'United Kingdom' },
  FR: { code: 'FR', nameAr: 'فرنسا', nameEn: 'France' },
  DE: { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany' },
  ES: { code: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain' },
  IT: { code: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy' },
  NL: { code: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands' },
  BE: { code: 'BE', nameAr: 'بلجيكا', nameEn: 'Belgium' },
  SE: { code: 'SE', nameAr: 'السويد', nameEn: 'Sweden' },
  NO: { code: 'NO', nameAr: 'النرويج', nameEn: 'Norway' },
  DK: { code: 'DK', nameAr: 'الدنمارك', nameEn: 'Denmark' },
  FI: { code: 'FI', nameAr: 'فنلندا', nameEn: 'Finland' },
  CH: { code: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland' },
  AT: { code: 'AT', nameAr: 'النمسا', nameEn: 'Austria' },
  PL: { code: 'PL', nameAr: 'بولندا', nameEn: 'Poland' },
  PT: { code: 'PT', nameAr: 'البرتغال', nameEn: 'Portugal' },
  GR: { code: 'GR', nameAr: 'اليونان', nameEn: 'Greece' },
  CZ: { code: 'CZ', nameAr: 'التشيك', nameEn: 'Czech Republic' },
  RO: { code: 'RO', nameAr: 'رومانيا', nameEn: 'Romania' },
  HU: { code: 'HU', nameAr: 'المجر', nameEn: 'Hungary' },
  UA: { code: 'UA', nameAr: 'أوكرانيا', nameEn: 'Ukraine' },
  RU: { code: 'RU', nameAr: 'روسيا', nameEn: 'Russia' },
  IE: { code: 'IE', nameAr: 'أيرلندا', nameEn: 'Ireland' },
  // الأمريكتين
  CA: { code: 'CA', nameAr: 'كندا', nameEn: 'Canada' },
  BR: { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil' },
  MX: { code: 'MX', nameAr: 'المكسيك', nameEn: 'Mexico' },
  AR: { code: 'AR', nameAr: 'الأرجنتين', nameEn: 'Argentina' },
  CO: { code: 'CO', nameAr: 'كولومبيا', nameEn: 'Colombia' },
  CL: { code: 'CL', nameAr: 'تشيلي', nameEn: 'Chile' },
  PE: { code: 'PE', nameAr: 'بيرو', nameEn: 'Peru' },
  CU: { code: 'CU', nameAr: 'كوبا', nameEn: 'Cuba' },
  // أفريقيا
  NG: { code: 'NG', nameAr: 'نيجيريا', nameEn: 'Nigeria' },
  ZA: { code: 'ZA', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa' },
  KE: { code: 'KE', nameAr: 'كينيا', nameEn: 'Kenya' },
  ET: { code: 'ET', nameAr: 'إثيوبيا', nameEn: 'Ethiopia' },
  SO: { code: 'SO', nameAr: 'الصومال', nameEn: 'Somalia' },
  DJ: { code: 'DJ', nameAr: 'جيبوتي', nameEn: 'Djibouti' },
  CM: { code: 'CM', nameAr: 'الكاميرون', nameEn: 'Cameroon' },
  CD: { code: 'CD', nameAr: 'الكونغو الديمقراطية', nameEn: 'DR Congo' },
  MG: { code: 'MG', nameAr: 'مدغشقر', nameEn: 'Madagascar' },
  SN: { code: 'SN', nameAr: 'السنغال', nameEn: 'Senegal' },
  // آسيا
  IN: { code: 'IN', nameAr: 'الهند', nameEn: 'India' },
  JP: { code: 'JP', nameAr: 'اليابان', nameEn: 'Japan' },
  CN: { code: 'CN', nameAr: 'الصين', nameEn: 'China' },
  KR: { code: 'KR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea' },
  TH: { code: 'TH', nameAr: 'تايلاند', nameEn: 'Thailand' },
  PH: { code: 'PH', nameAr: 'الفلبين', nameEn: 'Philippines' },
  VN: { code: 'VN', nameAr: 'فيتنام', nameEn: 'Vietnam' },
  // أوقيانوسيا
  AU: { code: 'AU', nameAr: 'أستراليا', nameEn: 'Australia' },
  NZ: { code: 'NZ', nameAr: 'نيوزيلندا', nameEn: 'New Zealand' },
};
