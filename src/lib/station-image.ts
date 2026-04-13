/**
 * Station Image Utilities
 * Consistent image handling across all components
 * Images are categorized by station type (quran, islamic, nasheed, music, news, sport, talk)
 * Each category has its own pool of professional images
 * NEVER mixes religious images with non-religious stations
 */

import type { RadioStation } from '@/types/radio';

// ============================================================
// Category-Specific Image Pools
// ============================================================

const QURAN_IMAGES = [
  '/images/stations/quran/quran-1.png',
  '/images/stations/quran/quran-2.png',
  '/images/stations/quran/quran-3.png',
  '/images/stations/quran/quran-4.png',
  '/images/stations/quran/quran-5.png',
  '/images/stations/quran/quran-6.png',
  '/images/stations/quran/quran-7.png',
  '/images/stations/quran/quran-8.png',
  '/images/stations/quran/quran-9.png',
  '/images/stations/quran/quran-10.png',
  '/images/stations/quran/quran-11.png',
  '/images/stations/quran/quran-12.png',
  '/images/stations/quran/quran-13.png',
  '/images/stations/quran/quran-14.png',
  '/images/stations/quran/quran-15.png',
  '/images/stations/quran/quran-cairo-special.png',
];

const ISLAMIC_IMAGES = [
  '/images/stations/islamic/islamic-1.png',
  '/images/stations/islamic/islamic-2.png',
  '/images/stations/islamic/islamic-3.png',
  '/images/stations/islamic/islamic-4.png',
  '/images/stations/islamic/islamic-5.png',
  '/images/stations/islamic/islamic-6.png',
  '/images/stations/islamic/islamic-7.png',
];

const NASHEED_IMAGES = [
  '/images/stations/nasheed/nasheed-1.png',
  '/images/stations/nasheed/nasheed-2.png',
  '/images/stations/nasheed/nasheed-3.png',
  '/images/stations/nasheed/nasheed-4.png',
  '/images/stations/nasheed/nasheed-5.png',
  '/images/stations/nasheed/nasheed-6.png',
  '/images/stations/nasheed/nasheed-7.png',
];

const MUSIC_IMAGES = [
  '/images/stations/music/music-1.png',
  '/images/stations/music/music-2.png',
  '/images/stations/music/music-3.png',
  '/images/stations/music/music-4.png',
  '/images/stations/music/music-5.png',
  '/images/stations/music/music-6.png',
  '/images/stations/music/music-7.png',
  '/images/stations/music/music-8.png',
  '/images/stations/music/music-9.png',
  '/images/stations/music/music-10.png',
  '/images/stations/music/music-11.png',
  '/images/stations/music/music-12.png',
  '/images/stations/music/music-13.png',
  '/images/stations/music/music-14.png',
  '/images/stations/music/music-15.png',
  '/images/stations/music/music-16.png',
];

const NEWS_IMAGES = [
  '/images/stations/news/news-1.png',
  '/images/stations/news/news-2.png',
  '/images/stations/news/news-3.png',
  '/images/stations/news/news-4.png',
  '/images/stations/news/news-5.png',
  '/images/stations/news/news-6.png',
];

const SPORT_IMAGES = [
  '/images/stations/sport/sport-1.png',
  '/images/stations/sport/sport-2.png',
  '/images/stations/sport/sport-3.png',
  '/images/stations/sport/sport-4.png',
  '/images/stations/sport/sport-5.png',
];

const TALK_IMAGES = [
  '/images/stations/talk/talk-1.png',
  '/images/stations/talk/talk-2.png',
  '/images/stations/talk/talk-3.png',
  '/images/stations/talk/talk-4.png',
  '/images/stations/talk/talk-5.png',
  '/images/stations/talk/talk-6.png',
];

// Map category to image pool
const CATEGORY_IMAGES: Record<string, string[]> = {
  quran: QURAN_IMAGES,
  islamic: ISLAMIC_IMAGES,
  nasheed: NASHEED_IMAGES,
  music: MUSIC_IMAGES,
  news: NEWS_IMAGES,
  sport: SPORT_IMAGES,
  talk: TALK_IMAGES,
};

// ============================================================
// Category Detection Keywords
// ============================================================

// Quran-specific keywords (highest priority for religious)
const QURAN_KEYWORDS = [
  'quran', 'قرآن', 'قران', 'koran',
  'recitation', 'تلاوة', 'tilawa',
  'tafseer', 'تفسير', 'tafsir',
  'surah', 'سورة', 'ayah', 'آية', 'ayaat',
  // Famous Quran reciter names
  'مشاري', 'عفاسي', 'afasy', 'mishari',
  'عبدالباسط', 'عبد الباسط', 'abdulbasit', 'abdelbasit',
  'الحصري', 'mahmoud', 'husari',
  'المنشاوي', 'minshawi', 'minshawi',
  'السديس', 'sudais', 'abdulrahman',
  'المعيقلي', 'muaiqly', 'maqqli',
  'فارس', 'عباد', 'fares', 'abbad',
  'الدوسري', 'dosari', 'yasser',
  'الحذيفي', 'hudaify', 'hudhaify',
  'الغامدي', 'ghamdi', 'ahmed',
  'الطباري', 'tabari', 'tabarani',
  'الشريم', 'shuraym',
  'ابن باز', 'ibn baz',
  'القرآن الكريم', 'holy quran',
];

// Nasheed-specific keywords
const NASHEED_KEYWORDS = [
  'nasheed', 'أناشيد', 'اناشيد',
  'mawal', 'موال',
  'burda', 'بردة',
  'madih', 'مدائح',
  'hamasa', 'حماسة',
  'sami', 'سميح',
  'يا دنيا',
];

// Islamic program keywords (religious but not quran/nasheed)
const ISLAMIC_KEYWORDS = [
  'islam', 'إسلام', 'اسلام', 'islamic', 'muslim', 'مسلم',
  'سنة', 'sunna', 'hadith', 'حديث',
  'fatwa', 'فتوى', 'azkar', 'أذكار', 'اذكار',
  'mawaqit', 'مواقيت', 'prayer', 'صلاة',
  'taraweeh', 'تراويح', 'duaa', 'دعاء',
  'sheikh', 'شيخ', 'imam', 'إمام',
  'muezzin', 'أذان', 'adhan',
  'mohamed', 'محمد', 'prophet', 'نبي',
  'mecca', 'مكة', 'medina', 'المدينة',
  'masjid', 'مسجد', 'mosque',
  'zikr', 'ذكر', 'tasbih', 'تسبيح',
  'hajj', 'حج', 'umrah', 'عمره', 'ramadan', 'رمضان',
  'fiqh', 'فقه',
  'seerah', 'سيرة',
  'aqeedah', 'عقيدة',
  'sharia', 'شريعة',
  'iman', 'إيمان',
  'hidaya', 'هداية', 'huda', 'هدى',
  'rahma', 'رحمة',
  'taqwa', 'تقوى',
  'salafi', 'سلفية',
];

// News keywords
const NEWS_KEYWORDS = [
  'news', 'أخبار', 'akhbar',
  'sky news', 'bbc', 'cnn', 'al jazeera', 'الجزيرة',
  'broadcast', 'بث',
  'current affairs', 'شؤون',
];

// Sport keywords
const SPORT_KEYWORDS = [
  'sport', 'رياضة', 'sports',
  'football', 'كرة', 'soccer',
  'basketball', 'كرة سلة',
  'stadium', 'ملعب',
  'olympic', 'أولمبي',
  'championship', 'بطولة',
  'league', 'دوري',
];

// Talk/General keywords
const TALK_KEYWORDS = [
  'talk', 'حوار', 'hiwar',
  'culture', 'ثقافة', 'thaqafa',
  'education', 'تعليم',
  'interview', 'مقابلة',
  'discussion', 'نقاش',
  'debate', 'مناظرة',
  'story', 'stories', 'قصص', 'حكايات',
  'books', 'كتب',
  'entertainment', 'ترفيه',
  'film', 'movie', 'أفلام', 'cinema', 'سينما', 'drama',
  'comedy', 'كوميدي', 'funny',
  'kids', 'children', 'أطفال',
];

// Music keywords (checked last - broadest category)
const MUSIC_KEYWORDS = [
  'music', 'موسيقى', 'musica',
  'hits', 'hit', 'megahits',
  'songs', 'أغاني', 'اغاني',
  'طرب', 'نجوم', 'فن',
  'pop', 'rock', 'jazz', 'blues',
  'mix', 'melody', 'rotana',
  'fm', 'dj', 'dance', 'remix',
  'electronic', 'techno', 'trance', 'edm',
  'lo-fi', 'lofi', 'chill',
  'hip hop', 'hiphop', 'rap', 'r&b', 'rnb',
  'reggae', 'latin', 'kpop',
  'romance', 'رومانسي', 'love', 'حب',
  'classic', 'classical', 'كلاسيك',
  'alternative', 'indie', 'folk',
  'country', 'western',
  'metal', 'punk', 'ska',
  'lounge', 'bar', 'club',
  'retro', 'vintage', 'oldies',
  'top 40', 'top40', 'charts',
  '80s', '90s', '00s', '2000',
  'oriental', 'شرقي',
  'khaliji', 'خليجي',
  'maghreb', 'مغاربي',
  'shaaby', 'شعبي', 'mahraganat', 'مهرجنات',
  'dabke', 'دبكة',
  'rai', 'راي',
  'amr diab', 'diab', 'abdul halim', 'fairouz', 'فيروز', 'صباح',
  'om kalthoum', 'أم كلثوم', 'wadih safi', 'وديع الصافي',
];

// ============================================================
// Category Detection
// ============================================================

type StationCategory = 'quran' | 'islamic' | 'nasheed' | 'music' | 'news' | 'sport' | 'talk';

/**
 * Detect station category from name and tags
 * Priority order: quran > nasheed > islamic > sport > news > talk > music
 */
function detectStationCategory(stationName: string, stationTags?: string): StationCategory {
  const combined = (stationName + ' ' + (stationTags || '')).toLowerCase();
  const nameLower = stationName.toLowerCase();

  // 1. Quran (highest priority religious)
  if (QURAN_KEYWORDS.some(k => nameLower.includes(k.toLowerCase()))) {
    return 'quran';
  }
  // Also check tags for quran
  if (QURAN_KEYWORDS.some(k => combined.includes(k.toLowerCase()))) {
    // Make sure the quran keyword is prominent (in name or multiple tag matches)
    const quranTagCount = QURAN_KEYWORDS.filter(k => combined.includes(k.toLowerCase())).length;
    if (quranTagCount >= 1 && nameLower.includes('quran') || nameLower.includes('قرآن') || nameLower.includes('قران') || nameLower.includes('koran') || nameLower.includes('تلاوة') || nameLower.includes('تفسير')) {
      return 'quran';
    }
  }

  // 2. Nasheed
  if (NASHEED_KEYWORDS.some(k => combined.includes(k.toLowerCase()))) {
    return 'nasheed';
  }

  // 3. Islamic programs
  if (ISLAMIC_KEYWORDS.some(k => combined.includes(k.toLowerCase()))) {
    return 'islamic';
  }

  // 4. Sport
  if (SPORT_KEYWORDS.some(k => combined.includes(k.toLowerCase()))) {
    return 'sport';
  }

  // 5. News
  if (NEWS_KEYWORDS.some(k => combined.includes(k.toLowerCase()))) {
    return 'news';
  }

  // 6. Talk/General
  if (TALK_KEYWORDS.some(k => combined.includes(k.toLowerCase()))) {
    return 'talk';
  }

  // 7. Music (default for entertainment/content stations)
  if (MUSIC_KEYWORDS.some(k => combined.includes(k.toLowerCase()))) {
    return 'music';
  }

  // Default fallback
  return 'music';
}

// ============================================================
// Utility Functions
// ============================================================

// Fallback image
const FALLBACK_IMAGE = '/images/default-station.png';

// Cache for consistent image assignment per station
const stationImageCache = new Map<string, string>();

/**
 * Check if URL is valid and not empty
 */
export function isValidUrl(url: string | null | undefined): boolean {
  if (!url || url === 'null' || url === 'undefined' || url.trim() === '') {
    return false;
  }
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if image URL is likely broken/white
 */
export function isLikelyBrokenImage(url: string | null | undefined): boolean {
  if (!url) return true;
  const brokenPatterns = [
    'placeholder', 'empty', 'blank', 'white',
    'default-favicon', 'favicon.ico', '/favicon',
    '1x1', 'pixel', 'transparent',
    'captcha', 'verification', 'cloudflare',
    '404', 'error', 'not-found',
    'radio-browser.info/favicon',  // Generic API favicons
  ];
  const lowerUrl = url.toLowerCase();
  return brokenPatterns.some(pattern => lowerUrl.includes(pattern));
}

/**
 * Simple hash function for deterministic random selection
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Get a deterministic image from a category pool based on station ID
 * Special stations get dedicated images
 */
function getCategoryImage(category: StationCategory, stationId: string, stationName: string = ''): string {
  const pool = CATEGORY_IMAGES[category] || MUSIC_IMAGES;
  
  // Special mapping for Cairo Quran station - always use the dedicated image
  const nameLower = stationName.toLowerCase();
  if (category === 'quran' && (
    nameLower.includes('القاهرة') || nameLower.includes('cairo') || 
    nameLower.includes('القاهره') || nameLower.includes('qahira')
  ) && (
    nameLower.includes('قرآن') || nameLower.includes('قران') || nameLower.includes('quran')
  )) {
    return '/images/stations/quran/quran-cairo-special.png';
  }
  
  const index = hashString(stationId) % pool.length;
  return pool[index];
}

// ============================================================
// Public API
// ============================================================

/**
 * Get a deterministic default image for a station based on its category
 * Categorizes the station and picks from the appropriate image pool
 */
export function getRandomDefaultImage(stationId: string, stationName: string, stationTags?: string): string {
  // Check cache first
  if (stationImageCache.has(stationId)) {
    return stationImageCache.get(stationId)!;
  }

  const category = detectStationCategory(stationName, stationTags);
  const image = getCategoryImage(category, stationId, stationName);

  // Cache the result
  stationImageCache.set(stationId, image);
  return image;
}

/**
 * Get station image URL
 * Main function - categorizes station and picks appropriate image
 * Religious stations (quran/islamic/nasheed) ALWAYS use category-based images
 * to avoid showing generic music/radio favicons from the API
 */
export function getStationImage(station: RadioStation | null | undefined): string {
  if (!station) {
    return FALLBACK_IMAGE;
  }

  // Detect station category
  const category = detectStationCategory(station.name, station.tags);

  // Religious stations: ALWAYS use category-based images, never the API favicon
  // This prevents Quran stations from showing music icons or generic radio favicons
  if (category === 'quran' || category === 'islamic' || category === 'nasheed') {
    return getRandomDefaultImage(station.stationuuid, station.name, station.tags);
  }

  // Check if station has a valid favicon (for non-religious stations)
  if (isValidUrl(station.favicon) && !isLikelyBrokenImage(station.favicon)) {
    return station.favicon;
  }

  // Return category-based default image
  return getRandomDefaultImage(station.stationuuid, station.name, station.tags);
}

/**
 * Get image for station with just basic info (for history/favorites)
 * Religious stations always use category-based images
 */
export function getStationImageFromData(
  stationuuid: string,
  name: string,
  favicon?: string | null,
  tags?: string | null
): string {
  // Detect category for religious stations
  const category = detectStationCategory(name, tags ?? undefined);

  // Religious stations: ALWAYS use category-based images
  if (category === 'quran' || category === 'islamic' || category === 'nasheed') {
    return getRandomDefaultImage(stationuuid, name, tags ?? undefined);
  }

  // Check if has valid favicon (for non-religious stations)
  if (isValidUrl(favicon) && !isLikelyBrokenImage(favicon)) {
    return favicon!;
  }

  // Return category-based default image
  return getRandomDefaultImage(stationuuid, name, tags ?? undefined);
}

/**
 * Get surah image based on surah number
 */
export function getSurahImage(surahNumber: number): string {
  const imageNumber = ((surahNumber - 1) % 10) + 1;
  return `/images/quran-surahs/surah-${imageNumber}.png`;
}
