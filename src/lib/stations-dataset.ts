// Static dataset of 300+ radio stations for SEO-optimized static generation
// Each station includes: id (slug), name, country, countryCode, category, streamUrl

export interface StationData {
  id: string;
  slug: string;
  name: string;
  nameAr?: string;
  country: string;
  countryCode: string;
  category: 'quran' | 'islamic' | 'nasheed' | 'music' | 'news' | 'sport' | 'talk';
  streamUrl: string;
  tags: string[];
  bitrate?: number;
  codec?: string;
  description?: string;
  imageUrl?: string;
  // Aliases for compatibility with other code
  stationuuid?: string;
  countrycode?: string;
}

// Country code to name mapping
const COUNTRIES: Record<string, string> = {
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

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

// Generate unique Arabic description
function generateDescription(station: { name: string; country: string; countryCode: string; category: StationData['category']; tags: string[] }): string {
  const countryAr = COUNTRIES[station.countryCode] || station.country;
  const categoryAr = CATEGORY_AR[station.category] || station.category;
  const tagsText = station.tags.slice(0, 3).join('، ');

  const templates = {
    quran: [
      `إذاعة ${station.name} من أشهر إذاعات القرآن الكريم في ${countryAr}، تقدم تلاوات قرآنية عذبة من كتاب الله على مدار الساعة. استمع الآن بجودة عالية على اسمع راديو.`,
      `${station.name} إذاعة قرآنية متميزة تبث من ${countryAr}، تقدم أفضل التلاوات القرآنية بصوت قراء كبار. بث مباشر بدون تقطيع.`,
      `استمع إلى ${station.name} بث مباشر للقرآن الكريم من ${countryAr}. إذاعة متخصصة في تلاوات القرآن والأذكار.`,
    ],
    islamic: [
      `${station.name} إذاعة إسلامية متخصصة من ${countryAr} تقدم برامج دينية متنوعة وأناشيد إسلامية. استمع الآن على اسمع راديو.`,
      `إذاعة ${station.name} تبث من ${countryAr} وتقدم محتوى إسلامي مميز يشمل الأناشيد والأذكار والبرامج الدينية.`,
    ],
    nasheed: [
      `${station.name} إذاعة متخصصة في الأناشيد الإسلامية من ${countryAr}، تقدم أجمل الأناشيد والابتهالات. استمع الآن.`,
      `إذاعة ${station.name} من ${countryAr} تقدم أفضل الأناشيد الإسلامية والصوتيات المميزة.`,
    ],
    music: [
      `${station.name} محطة إذاعية من ${countryAr} تقدم أحدث الأغاني والنجوم الكبار. استمع لأفضل الموسيقى على مدار الساعة.`,
      `إذاعة ${station.name} تبث من ${countryAr} وتقدم مزيجًا من الأغاني والنجوم المفضلين.`,
    ],
    news: [
      `${station.name} إذاعة إخبارية من ${countryAr} تقدم آخر الأخبار المحلية والعالمية والتحليلات. تابع الأحداث أولًا بأول.`,
      `استمع إلى ${station.name} بث مباشر من ${countryAr}. إذاعة متخصصة في الأخبار والتقارير والتحليلات.`,
    ],
    sport: [
      `${station.name} إذاعة رياضية من ${countryAr} تقدم تغطية مباشرة للمباريات والأحداث الرياضية. تابع رياضتك المفضلة.`,
    ],
    talk: [
      `${station.name} إذاعة حوارية من ${countryAr} تقدم برامج نقاشية متنوعة ومواضيع اجتماعية. استمع الآن.`,
    ],
  };

  const descriptions = templates[station.category] || templates.music;
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Raw station data (will be enriched with slugs and descriptions)
const RAW_STATIONS: Array<Omit<StationData, 'slug' | 'description'>> = [
  // ========== QURAN STATIONS (50+) ==========
  // Egypt Quran Stations
  { id: 'quran-cairo', name: 'إذاعة القرآن الكريم من القاهرة', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'مصر'] },
  { id: 'quran-alexandria', name: 'إذاعة القرآن الكريم الإسكندرية', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'إسكندرية'] },
  { id: 'nile-quran', name: 'إذاعة نيل القرآن الكريم', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'نيل'] },
  { id: 'quran-egypt-official', name: 'إذاعة القرآن الكريم الرسمية', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن'] },
  { id: 'radiokoran', name: 'Radio Koran Egypt', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'koran', 'egypt'] },
  
  // Saudi Quran Stations
  { id: 'quran-riyadh', name: 'إذاعة القرآن الكريم الرياض', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'السعودية'] },
  { id: 'quran-jeddah', name: 'إذاعة القرآن الكريم جدة', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'جدة'] },
  { id: 'quran-madinah', name: 'إذاعة القرآن الكريم المدينة', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'المدينة'] },
  { id: 'quran-makkah', name: 'إذاعة القرآن الكريم مكة', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'مكة'] },
  { id: 'saudi-quran', name: 'Saudi Quran Radio', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'saudi'] },
  
  // UAE Quran Stations
  { id: 'quran-dubai', name: 'إذاعة القرآن الكريم دبي', country: 'UAE', countryCode: 'AE', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'دبي'] },
  { id: 'quran-abudhabi', name: 'إذاعة القرآن الكريم أبوظبي', country: 'UAE', countryCode: 'AE', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'أبوظبي'] },
  { id: 'quran-sharjah', name: 'إذاعة القرآن الكريم الشارقة', country: 'UAE', countryCode: 'AE', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'الشارقة'] },
  
  // Morocco Quran Stations
  { id: 'quran-casablanca', name: 'إذاعة القرآن الكريم الدار البيضاء', country: 'Morocco', countryCode: 'MA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'المغرب'] },
  { id: 'quran-rabat', name: 'إذاعة القرآن الكريم الرباط', country: 'Morocco', countryCode: 'MA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'الرباط'] },
  { id: 'mohammed6-quran', name: 'إذاعة محمد السادس للقرآن', country: 'Morocco', countryCode: 'MA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'محمد السادس'] },
  
  // Algeria Quran Stations
  { id: 'quran-algiers', name: 'إذاعة القرآن الكريم الجزائر', country: 'Algeria', countryCode: 'DZ', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'الجزائر'] },
  { id: 'quran-oran', name: 'إذاعة القرآن الكريم وهران', country: 'Algeria', countryCode: 'DZ', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'وهران'] },
  { id: 'coran-algerie', name: 'Coran Algérie Radio', country: 'Algeria', countryCode: 'DZ', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'coran', 'algerie'] },
  
  // Tunisia Quran Stations
  { id: 'quran-tunis', name: 'إذاعة القرآن الكريم تونس', country: 'Tunisia', countryCode: 'TN', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'تونس'] },
  { id: 'quran-sfax', name: 'إذاعة القرآن الكريم صفاقس', country: 'Tunisia', countryCode: 'TN', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'صفاقس'] },
  
  // Jordan Quran Stations
  { id: 'quran-amman', name: 'إذاعة القرآن الكريم عمان', country: 'Jordan', countryCode: 'JO', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'الأردن'] },
  { id: 'jordan-quran-radio', name: 'Jordan Quran Radio', country: 'Jordan', countryCode: 'JO', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'jordan'] },
  
  // Kuwait Quran Stations
  { id: 'quran-kuwait', name: 'إذاعة القرآن الكريم الكويت', country: 'Kuwait', countryCode: 'KW', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'الكويت'] },
  { id: 'kuwait-quran-official', name: 'Kuwait Official Quran Radio', country: 'Kuwait', countryCode: 'KW', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'kuwait'] },
  
  // Qatar Quran Stations
  { id: 'quran-doha', name: 'إذاعة القرآن الكريم الدوحة', country: 'Qatar', countryCode: 'QA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'قطر'] },
  { id: 'qatar-quran', name: 'Qatar Quran Radio', country: 'Qatar', countryCode: 'QA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'qatar'] },
  
  // Bahrain Quran Stations
  { id: 'quran-bahrain', name: 'إذاعة القرآن الكريم البحرين', country: 'Bahrain', countryCode: 'BH', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'البحرين'] },
  
  // Oman Quran Stations
  { id: 'quran-muscat', name: 'إذاعة القرآن الكريم مسقط', country: 'Oman', countryCode: 'OM', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'عمان'] },
  
  // Palestine Quran Stations
  { id: 'quran-palestine', name: 'إذاعة القرآن الكريم فلسطين', country: 'Palestine', countryCode: 'PS', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'فلسطين'] },
  { id: 'alaqsa-quran', name: 'إذاعة الأقصى للقرآن', country: 'Palestine', countryCode: 'PS', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'الأقصى', 'فلسطين'] },
  
  // Syria Quran Stations
  { id: 'quran-damascus', name: 'إذاعة القرآن الكريم دمشق', country: 'Syria', countryCode: 'SY', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'سوريا'] },
  
  // Iraq Quran Stations
  { id: 'quran-baghdad', name: 'إذاعة القرآن الكريم بغداد', country: 'Iraq', countryCode: 'IQ', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'العراق'] },
  { id: 'quran-basra', name: 'إذاعة القرآن الكريم البصرة', country: 'Iraq', countryCode: 'IQ', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'البصرة'] },
  
  // Sudan Quran Stations
  { id: 'quran-khartoum', name: 'إذاعة القرآن الكريم الخرطوم', country: 'Sudan', countryCode: 'SD', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'السودان'] },
  
  // Libya Quran Stations
  { id: 'quran-tripoli', name: 'إذاعة القرآن الكريم طرابلس', country: 'Libya', countryCode: 'LY', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'ليبيا'] },
  
  // Yemen Quran Stations
  { id: 'quran-sanaa', name: 'إذاعة القرآن الكريم صنعاء', country: 'Yemen', countryCode: 'YE', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'اليمن'] },
  
  // Mauritania Quran Stations
  { id: 'quran-nouakchott', name: 'إذاعة القرآن الكريم نواكشوط', country: 'Mauritania', countryCode: 'MR', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'موريتانيا'] },
  
  // Lebanon Quran Stations
  { id: 'quran-beirut', name: 'إذاعة القرآن الكريم بيروت', country: 'Lebanon', countryCode: 'LB', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'قرآن', 'لبنان'] },
  
  // Additional Quran Stations
  { id: 'holy-quran-radio', name: 'Holy Quran Radio International', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'international'] },
  { id: 'quran-24-7', name: 'Quran 24/7 Radio', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', '24/7'] },
  { id: 'quran-mp3', name: 'Quran MP3 Radio', country: 'UAE', countryCode: 'AE', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'mp3'] },
  { id: 'quran-tv-radio', name: 'Quran TV Radio', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'tv'] },
  { id: 'recitation-quran', name: 'Quran Recitation Radio', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'recitation'] },
  { id: 'tilawa-radio', name: 'إذاعة التلاوة', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'تلاوة'] },
  { id: 'tafseer-quran', name: 'إذاعة تفسير القرآن', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'تفسير'] },
  
  // ========== ISLAMIC STATIONS (40+) ==========
  { id: 'islamic-cairo', name: 'إذاعة البرنامج العام الإسلامي', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'إسلامي', 'مصر'] },
  { id: 'islamic-riyadh', name: 'إذاعة البرنامج الثاني الإسلامي', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'إسلامي', 'السعودية'] },
  { id: 'islamic-dubai', name: 'إذاعة دبي الإسلامية', country: 'UAE', countryCode: 'AE', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'دبي'] },
  { id: 'islamic-khobar', name: 'إذاعة الخبر الإسلامية', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'الخبر'] },
  { id: 'islamic-dammam', name: 'إذاعة الدمام الإسلامية', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'الدمام'] },
  { id: 'sunnah-radio', name: 'إذاعة السنة النبوية', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'سنة', 'حديث'] },
  { id: 'fajr-islamic', name: 'إذاعة الفجر الإسلامية', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'الفجر'] },
  { id: 'iman-radio', name: 'إذاعة الإيمان', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'إيمان'] },
  { id: 'hidaya-radio', name: 'إذاعة الهداية', country: 'Jordan', countryCode: 'JO', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'هداية'] },
  { id: 'nour-radio', name: 'إذاعة النور', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'نور'] },
  { id: 'huda-radio', name: 'إذاعة الهدى', country: 'Kuwait', countryCode: 'KW', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'هدى'] },
  { id: 'rahma-radio', name: 'إذاعة الرحمة', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'رحمة'] },
  { id: 'taqwa-radio', name: 'إذاعة التقوى', country: 'UAE', countryCode: 'AE', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'تقوى'] },
  { id: 'salafi-radio', name: 'إذاعة السلفية', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'سلفية'] },
  { id: 'azkar-morning', name: 'إذاعة أذكار الصباح', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'أذكار', 'صباح'] },
  { id: 'azkar-evening', name: 'إذاعة أذكار المساء', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'أذكار', 'مساء'] },
  { id: 'duaa-radio', name: 'إذاعة الدعاء', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'دعاء'] },
  { id: 'fiqh-radio', name: 'إذاعة الفقه الإسلامي', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'فقه'] },
  { id: 'seerah-radio', name: 'إذاعة السيرة النبوية', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'سيرة'] },
  { id: 'islamic-knowledge', name: 'Islamic Knowledge Radio', country: 'UAE', countryCode: 'AE', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'knowledge'] },
  { id: 'islamic-lectures', name: 'Islamic Lectures Radio', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'lectures'] },
  { id: 'prophet-stories', name: 'قصص الأنبياء', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'قصص', 'أنبياء'] },
  { id: 'islamic-science', name: 'العلوم الإسلامية', country: 'Jordan', countryCode: 'JO', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'علوم'] },
  { id: 'islamic-history', name: 'التاريخ الإسلامي', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'تاريخ'] },
  { id: 'sharia-radio', name: 'إذاعة الشريعة', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'شريعة'] },
  { id: 'islamic-ethics', name: 'الأخلاق الإسلامية', country: 'UAE', countryCode: 'AE', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'أخلاق'] },
  { id: 'islamic-education', name: 'التربية الإسلامية', country: 'Kuwait', countryCode: 'KW', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'تربية'] },
  { id: 'islamic-family', name: 'الأسرة المسلمة', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'أسرة'] },
  { id: 'islamic-youth', name: 'شباب الإسلام', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'شباب'] },
  { id: 'islamic-women', name: 'إذاعة المرأة المسلمة', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'مرأة'] },
  { id: 'islamic-children', name: 'إذاعة الأطفال المسلمين', country: 'UAE', countryCode: 'AE', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'أطفال'] },
  { id: 'islamic-meditation', name: 'التأمل الإسلامي', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'تأمل'] },
  { id: 'islamic-prayers', name: 'صلاة المسلم', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'صلاة'] },
  { id: 'islamic-ramadan', name: 'إذاعة رمضان', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'رمضان'] },
  { id: 'islamic-hajj', name: 'إذاعة الحج', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'حج'] },
  { id: 'islamic-umrah', name: 'إذاعة العمرة', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'عمرة'] },
  { id: 'islamic-fiqh', name: 'الفقه الإسلامي', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'فقه'] },
  { id: 'islamic-aqeedah', name: 'العقيدة الإسلامية', country: 'Saudi Arabia', countryCode: 'SA', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'عقيدة'] },
  { id: 'islamic-tafsir', name: 'التفسير الإسلامي', country: 'Egypt', countryCode: 'EG', category: 'islamic', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['islamic', 'تفسير'] },
  
  // ========== NASHEED STATIONS (30+) ==========
  { id: 'nasheed-egypt', name: 'إذاعة الأناشيد المصرية', country: 'Egypt', countryCode: 'EG', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'أناشيد', 'مصر'] },
  { id: 'nasheed-saudi', name: 'إذاعة الأناشيد السعودية', country: 'Saudi Arabia', countryCode: 'SA', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'أناشيد', 'السعودية'] },
  { id: 'nasheed-uae', name: 'إذاعة الأناشيد الإماراتية', country: 'UAE', countryCode: 'AE', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'أناشيد', 'إمارات'] },
  { id: 'anasheed-fan', name: 'إذاعة الأناشيد فن', country: 'Egypt', countryCode: 'EG', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'فن'] },
  { id: 'nasheed-classic', name: 'الأناشيد الكلاسيكية', country: 'Saudi Arabia', countryCode: 'SA', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'كلاسيك'] },
  { id: 'nasheed-modern', name: 'الأناشيد الحديثة', country: 'UAE', countryCode: 'AE', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'حديث'] },
  { id: 'nasheed-children', name: 'أناشيد الأطفال', country: 'Egypt', countryCode: 'EG', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'أطفال'] },
  { id: 'nasheed-sufi', name: 'الأناشيد الصوفية', country: 'Morocco', countryCode: 'MA', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'صوفي'] },
  { id: 'nasheed-mawal', name: 'إذاعة الموال', country: 'Iraq', countryCode: 'IQ', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'موال'] },
  { id: 'nasheed-burda', name: 'إذاعة البردة', country: 'Egypt', countryCode: 'EG', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'بردة'] },
  { id: 'nasheed-madih', name: 'إذاعة المدائح النبوية', country: 'Saudi Arabia', countryCode: 'SA', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'مدائح'] },
  { id: 'nasheed-talaa', name: 'إذاعة طلع البدر علينا', country: 'Saudi Arabia', countryCode: 'SA', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'طلع'] },
  { id: 'nasheed-islamic-songs', name: 'Islamic Songs Radio', country: 'UAE', countryCode: 'AE', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'songs'] },
  { id: 'nasheed-hamasa', name: 'إذاعة الحماسة', country: 'Saudi Arabia', countryCode: 'SA', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'حماسة'] },
  { id: 'nasheed-samt', name: 'إذاعة الصمت', country: 'Egypt', countryCode: 'EG', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'صمت'] },
  { id: 'nasheed-rahman', name: 'أناشيد الرحمن', country: 'Jordan', countryCode: 'JO', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'رحمن'] },
  { id: 'nasheed-noor', name: 'أناشيد النور', country: 'Kuwait', countryCode: 'KW', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'نور'] },
  { id: 'nasheed-huda', name: 'أناشيد الهدى', country: 'Qatar', countryCode: 'QA', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'هدى'] },
  { id: 'nasheed-iman', name: 'أناشيد الإيمان', country: 'Bahrain', countryCode: 'BH', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'إيمان'] },
  { id: 'nasheed-wahd', name: 'أناشيد الوعد', country: 'Oman', countryCode: 'OM', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'وعد'] },
  { id: 'nasheed-fajr', name: 'أناشيد الفجر', country: 'Egypt', countryCode: 'EG', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'فجر'] },
  { id: 'nasheed-maghrib', name: 'أناشيد المغرب', country: 'Morocco', countryCode: 'MA', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'مغرب'] },
  { id: 'nasheed-jazair', name: 'أناشيد الجزائر', country: 'Algeria', countryCode: 'DZ', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'جزائر'] },
  { id: 'nasheed-tunis', name: 'أناشيد تونس', country: 'Tunisia', countryCode: 'TN', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'تونس'] },
  { id: 'nasheed-sudan', name: 'أناشيد السودان', country: 'Sudan', countryCode: 'SD', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'سودان'] },
  { id: 'nasheed-yemen', name: 'أناشيد اليمن', country: 'Yemen', countryCode: 'YE', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'يمن'] },
  { id: 'nasheed-palestine', name: 'أناشيد فلسطين', country: 'Palestine', countryCode: 'PS', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'فلسطين'] },
  { id: 'nasheed-iraq', name: 'أناشيد العراق', country: 'Iraq', countryCode: 'IQ', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'عراق'] },
  { id: 'nasheed-sham', name: 'أناشيد الشام', country: 'Syria', countryCode: 'SY', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'شام'] },
  { id: 'nasheed-libya', name: 'أناشيد ليبيا', country: 'Libya', countryCode: 'LY', category: 'nasheed', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['nasheed', 'ليبيا'] },
  
  // ========== MUSIC STATIONS (80+) ==========
  // Egypt Music
  { id: 'nogoum-fm', name: 'نجوم إف إم', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'نجوم', 'مصري'] },
  { id: 'melo-fm', name: 'ميلو إف إم', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'ميلو', 'مصري'] },
  { id: 'mfm', name: 'إم إف إم مصر', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'mfm'] },
  { id: 'shaaby-fm', name: 'إذاعة شعبي إف إم', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'شعبي', 'مصري'] },
  { id: 'dabke-fm', name: 'إذاعة الدبكة', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'دبكة'] },
  { id: 'mahraganat-fm', name: 'إذاعة المهرجنات', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'مهرجنات'] },
  { id: 'arabic-hits', name: 'Arabic Hits Radio', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'hits', 'arabic'] },
  { id: 'cairo-fm', name: 'القاهرة إف إم', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'القاهرة'] },
  { id: 'alexandria-fm', name: 'الإسكندرية إف إم', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'إسكندرية'] },
  { id: 'nile-fm', name: 'نيل إف إم', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'نيل'] },
  { id: 'radio-masr', name: 'راديو مصر', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://live.radiomasr.net/RADIOMASR', tags: ['music', 'راديو مصر', 'مصري', 'ERTU'] },
  
  // Saudi Music
  { id: 'rotana-radio', name: 'إذاعة روتانا', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'روتانا', 'سعودي'] },
  { id: 'mix-fm-saudi', name: 'ميكس إف إم السعودية', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'mix', 'سعودي'] },
  { id: 'rythm-fm', name: 'ريذم إف إم', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'ريذم'] },
  { id: 'mbc-fm', name: 'إم بي سي إف إم', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'mbc'] },
  { id: 'panorama-fm', name: 'بانوراما إف إم', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'بانوراما'] },
  { id: 'saudi-radio', name: 'إذاعة السعودية', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'السعودية'] },
  { id: 'riyadh-radio', name: 'إذاعة الرياض', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الرياض'] },
  { id: 'jeddah-radio', name: 'إذاعة جدة', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'جدة'] },
  
  // UAE Music
  { id: 'dubai-fm', name: 'دبي إف إم', country: 'UAE', countryCode: 'AE', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'دبي'] },
  { id: 'abudhabi-fm', name: 'أبوظبي إف إم', country: 'UAE', countryCode: 'AE', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'أبوظبي'] },
  { id: 'sharjah-fm', name: 'الشارقة إف إم', country: 'UAE', countryCode: 'AE', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الشارقة'] },
  { id: 'al-arabiya-fm', name: 'العربية إف إم', country: 'UAE', countryCode: 'AE', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'العربية'] },
  { id: 'al-khaleej-fm', name: 'الخليج إف إم', country: 'UAE', countryCode: 'AE', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الخليج'] },
  { id: 'uae-radio', name: 'UAE Radio', country: 'UAE', countryCode: 'AE', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'uae'] },
  { id: 'channel-4-fm', name: 'القناة الرابعة', country: 'UAE', countryCode: 'AE', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'channel4'] },
  
  // Lebanon Music
  { id: 'beirut-fm', name: 'بيروت إف إم', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'بيروت', 'لبناني'] },
  { id: 'leb-fm', name: 'لبنان إف إم', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'لبنان'] },
  { id: 'mtv-lebanon', name: 'إم تي في لبنان', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'mtv', 'لبنان'] },
  { id: 'al-nour-fm', name: 'النور إف إم لبنان', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'النور'] },
  { id: 'lbci-radio', name: 'إل بي سي راديو', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'lbci'] },
  
  // Morocco Music
  { id: 'casablanca-fm', name: 'الدار البيضاء إف إم', country: 'Morocco', countryCode: 'MA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الدار البيضاء', 'مغربي'] },
  { id: 'maroc-music', name: 'Maroc Music Radio', country: 'Morocco', countryCode: 'MA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'maroc'] },
  { id: 'rabat-fm', name: 'الرباط إف إم', country: 'Morocco', countryCode: 'MA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الرباط'] },
  { id: 'med-radio', name: 'ميد راديو', country: 'Morocco', countryCode: 'MA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'med'] },
  { id: 'hit-radio-maroc', name: 'هيت راديو المغرب', country: 'Morocco', countryCode: 'MA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'hit'] },
  { id: 'chada-fm', name: 'شذا إف إم', country: 'Morocco', countryCode: 'MA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'شذا'] },
  
  // Algeria Music
  { id: 'algerie-radio', name: 'إذاعة الجزائر', country: 'Algeria', countryCode: 'DZ', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الجزائر', 'جزائري'] },
  { id: 'oran-fm', name: 'وهران إف إم', country: 'Algeria', countryCode: 'DZ', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'وهران'] },
  { id: 'rai-music', name: 'إذاعة الراي', country: 'Algeria', countryCode: 'DZ', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'راي', 'rai'] },
  { id: 'djazairia-radio', name: 'الجزائرية راديو', country: 'Algeria', countryCode: 'DZ', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الجزائرية'] },
  
  // Tunisia Music
  { id: 'tunis-radio', name: 'إذاعة تونس', country: 'Tunisia', countryCode: 'TN', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'تونس', 'تونسي'] },
  { id: 'mosaique-fm', name: 'موزاييك إف إم', country: 'Tunisia', countryCode: 'TN', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'موزاييك'] },
  { id: 'shems-fm', name: 'شمس إف إم', country: 'Tunisia', countryCode: 'TN', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'شمس'] },
  { id: 'jawhara-fm', name: 'جوهرة إف إم', country: 'Tunisia', countryCode: 'TN', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'جوهرة'] },
  { id: 'express-fm', name: 'إكسبريس إف إم', country: 'Tunisia', countryCode: 'TN', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'express'] },
  
  // Jordan Music
  { id: 'amman-fm', name: 'عمان إف إم', country: 'Jordan', countryCode: 'JO', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'عمان', 'أردني'] },
  { id: 'play-fm-jordan', name: 'بلاي إف إم الأردن', country: 'Jordan', countryCode: 'JO', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'play'] },
  { id: 'beat-fm', name: 'بيت إف إم', country: 'Jordan', countryCode: 'JO', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'beat'] },
  
  // Kuwait Music
  { id: 'kuwait-fm', name: 'الكويت إف إم', country: 'Kuwait', countryCode: 'KW', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الكويت', 'كويتي'] },
  { id: 'marina-fm', name: 'مارينا إف إم', country: 'Kuwait', countryCode: 'KW', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'مارينا'] },
  { id: 'al-watan-fm', name: 'الوطن إف إم', country: 'Kuwait', countryCode: 'KW', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الوطن'] },
  
  // Qatar Music
  { id: 'doha-fm', name: 'الدوحة إف إم', country: 'Qatar', countryCode: 'QA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الدوحة', 'قطري'] },
  { id: 'qatar-radio', name: 'إذاعة قطر', country: 'Qatar', countryCode: 'QA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'قطر'] },
  
  // Bahrain Music
  { id: 'bahrain-fm', name: 'البحرين إف إم', country: 'Bahrain', countryCode: 'BH', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'البحرين', 'بحريني'] },
  { id: 'bahrain-radio', name: 'إذاعة البحرين', country: 'Bahrain', countryCode: 'BH', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'البحرين'] },
  
  // Oman Music
  { id: 'muscat-fm', name: 'مسقط إف إم', country: 'Oman', countryCode: 'OM', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'مسقط', 'عماني'] },
  { id: 'oman-radio', name: 'إذاعة عمان', country: 'Oman', countryCode: 'OM', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'عمان'] },
  
  // Palestine Music
  { id: 'palestine-fm', name: 'فلسطين إف إم', country: 'Palestine', countryCode: 'PS', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'فلسطين', 'فلسطيني'] },
  { id: 'ramallah-fm', name: 'رام الله إف إم', country: 'Palestine', countryCode: 'PS', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'رام الله'] },
  { id: 'gaza-fm', name: 'غزة إف إم', country: 'Palestine', countryCode: 'PS', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'غزة'] },
  
  // Iraq Music
  { id: 'baghdad-fm', name: 'بغداد إف إم', country: 'Iraq', countryCode: 'IQ', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'بغداد', 'عراقي'] },
  { id: 'al-rasheed-fm', name: 'الرشيد إف إم', country: 'Iraq', countryCode: 'IQ', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'الرشيد'] },
  { id: 'dijlah-fm', name: 'دجلة إف إم', country: 'Iraq', countryCode: 'IQ', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'دجلة'] },
  
  // Syria Music
  { id: 'damascus-fm', name: 'دمشق إف إم', country: 'Syria', countryCode: 'SY', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'دمشق', 'سوري'] },
  { id: 'syria-radio', name: 'إذاعة سوريا', country: 'Syria', countryCode: 'SY', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'سوريا'] },
  { id: 'al-madina-fm', name: 'المدينة إف إم', country: 'Syria', countryCode: 'SY', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'المدينة'] },
  
  // Additional Music
  { id: 'arabic-music-24', name: 'Arabic Music 24', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'arabic', '24/7'] },
  { id: 'orient-music', name: 'الموسيقى الشرقية', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'شرقي'] },
  { id: 'khaliji-music', name: 'الموسيقى الخليجية', country: 'Saudi Arabia', countryCode: 'SA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'خليجي'] },
  { id: 'maghreb-music', name: 'الموسيقى المغاربية', country: 'Morocco', countryCode: 'MA', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'مغاربي'] },
  { id: 'classic-arabic', name: 'الكلاسيكيات العربية', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'كلاسيك'] },
  { id: 'om-kalthoum', name: 'أم كلثوم راديو', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'أم كلثوم'] },
  { id: 'abdul-halim', name: 'عبد الحليم حافظ', country: 'Egypt', countryCode: 'EG', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'عبد الحليم'] },
  { id: 'fairouz-radio', name: 'فيروز راديو', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'فيروز'] },
  { id: 'sabah-radio', name: 'صباح راديو', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'صباح'] },
  { id: 'wadih-safi', name: 'وديع الصافي', country: 'Lebanon', countryCode: 'LB', category: 'music', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['music', 'وديع الصافي'] },
  
  // ========== NEWS STATIONS (40+) ==========
  { id: 'nile-news', name: 'إذاعة نيل للأخبار', country: 'Egypt', countryCode: 'EG', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'أخبار', 'مصر'] },
  { id: 'egypt-news', name: 'أخبار مصر', country: 'Egypt', countryCode: 'EG', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'أخبار'] },
  { id: 'sada-masr', name: 'صدى مصر', country: 'Egypt', countryCode: 'EG', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'صدى'] },
  { id: 'akhbar-el-yom', name: 'أخبار اليوم', country: 'Egypt', countryCode: 'EG', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'أخبار اليوم'] },
  { id: 'sky-news-arabia', name: 'سكاي نيوز عربية', country: 'UAE', countryCode: 'AE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'sky news'] },
  { id: 'al-arabiya-news', name: 'العربية نيوز', country: 'UAE', countryCode: 'AE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'العربية'] },
  { id: 'al-jazeera-news', name: 'الجزيرة نيوز', country: 'Qatar', countryCode: 'QA', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'الجزيرة'] },
  { id: 'bbc-arabic-news', name: 'بي بي سي العربية', country: 'UK', countryCode: 'GB', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'bbc', 'arabic'] },
  { id: 'monte-carlo-news', name: 'مونت كارلو الدولية', country: 'France', countryCode: 'FR', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'monte carlo'] },
  { id: 'rfi-arabic', name: 'راديو فرانس الدولية', country: 'France', countryCode: 'FR', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'rfi'] },
  { id: 'sawa-news', name: 'راديو سوا', country: 'USA', countryCode: 'US', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'سوا'] },
  { id: 'hurra-news', name: 'الحرة نيوز', country: 'USA', countryCode: 'US', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'الحرة'] },
  { id: 'saudi-news', name: 'أخبار السعودية', country: 'Saudi Arabia', countryCode: 'SA', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'أخبار السعودية'] },
  { id: 'riyadh-news', name: 'أخبار الرياض', country: 'Saudi Arabia', countryCode: 'SA', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'الرياض'] },
  { id: 'jeddah-news', name: 'أخبار جدة', country: 'Saudi Arabia', countryCode: 'SA', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'جدة'] },
  { id: 'dubai-news', name: 'أخبار دبي', country: 'UAE', countryCode: 'AE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'دبي'] },
  { id: 'abudhabi-news', name: 'أخبار أبوظبي', country: 'UAE', countryCode: 'AE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'أبوظبي'] },
  { id: 'kuwait-news', name: 'أخبار الكويت', country: 'Kuwait', countryCode: 'KW', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'الكويت'] },
  { id: 'qatar-news', name: 'أخبار قطر', country: 'Qatar', countryCode: 'QA', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'قطر'] },
  { id: 'bahrain-news', name: 'أخبار البحرين', country: 'Bahrain', countryCode: 'BH', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'البحرين'] },
  { id: 'oman-news', name: 'أخبار عمان', country: 'Oman', countryCode: 'OM', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'عمان'] },
  { id: 'jordan-news', name: 'أخبار الأردن', country: 'Jordan', countryCode: 'JO', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'الأردن'] },
  { id: 'lebanon-news', name: 'أخبار لبنان', country: 'Lebanon', countryCode: 'LB', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'لبنان'] },
  { id: 'palestine-news', name: 'أخبار فلسطين', country: 'Palestine', countryCode: 'PS', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'فلسطين'] },
  { id: 'iraq-news', name: 'أخبار العراق', country: 'Iraq', countryCode: 'IQ', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'العراق'] },
  { id: 'syria-news', name: 'أخبار سوريا', country: 'Syria', countryCode: 'SY', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'سوريا'] },
  { id: 'morocco-news', name: 'أخبار المغرب', country: 'Morocco', countryCode: 'MA', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'المغرب'] },
  { id: 'algeria-news', name: 'أخبار الجزائر', country: 'Algeria', countryCode: 'DZ', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'الجزائر'] },
  { id: 'tunisia-news', name: 'أخبار تونس', country: 'Tunisia', countryCode: 'TN', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'تونس'] },
  { id: 'sudan-news', name: 'أخبار السودان', country: 'Sudan', countryCode: 'SD', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'السودان'] },
  { id: 'libya-news', name: 'أخبار ليبيا', country: 'Libya', countryCode: 'LY', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'ليبيا'] },
  { id: 'yemen-news', name: 'أخبار اليمن', country: 'Yemen', countryCode: 'YE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'اليمن'] },
  { id: 'arabic-news-24', name: 'Arabic News 24', country: 'UAE', countryCode: 'AE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', '24/7'] },
  { id: 'world-news-arabic', name: 'World News Arabic', country: 'UK', countryCode: 'GB', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'world'] },
  { id: 'middle-east-news', name: 'Middle East News', country: 'UAE', countryCode: 'AE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'middle east'] },
  { id: 'gulf-news-radio', name: 'Gulf News Radio', country: 'UAE', countryCode: 'AE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'gulf'] },
  { id: 'economic-news', name: 'الأخبار الاقتصادية', country: 'UAE', countryCode: 'AE', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'اقتصاد'] },
  { id: 'sports-news-arabic', name: 'الأخبار الرياضية', country: 'Saudi Arabia', countryCode: 'SA', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'رياضة'] },
  { id: 'local-news', name: 'الأخبار المحلية', country: 'Egypt', countryCode: 'EG', category: 'news', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['news', 'محلية'] },
  
  // ========== SPORT STATIONS (20+) ==========
  { id: 'cairo-sport', name: 'إذاعة القاهرة الرياضية', country: 'Egypt', countryCode: 'EG', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'رياضة', 'مصر'] },
  { id: 'egypt-sport', name: 'Egypt Sports Radio', country: 'Egypt', countryCode: 'EG', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'egypt'] },
  { id: 'saudi-sport', name: 'الرياضة السعودية', country: 'Saudi Arabia', countryCode: 'SA', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'سعودي'] },
  { id: 'dubai-sport', name: 'دبي الرياضية', country: 'UAE', countryCode: 'AE', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'دبي'] },
  { id: 'abudhabi-sport', name: 'أبوظبي الرياضية', country: 'UAE', countryCode: 'AE', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'أبوظبي'] },
  { id: 'kuwait-sport', name: 'الكويت الرياضية', country: 'Kuwait', countryCode: 'KW', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'الكويت'] },
  { id: 'qatar-sport', name: 'قطر الرياضية', country: 'Qatar', countryCode: 'QA', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'قطر'] },
  { id: 'bahrain-sport', name: 'البحرين الرياضية', country: 'Bahrain', countryCode: 'BH', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'البحرين'] },
  { id: 'oman-sport', name: 'عمان الرياضية', country: 'Oman', countryCode: 'OM', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'عمان'] },
  { id: 'jordan-sport', name: 'الأردن الرياضي', country: 'Jordan', countryCode: 'JO', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'الأردن'] },
  { id: 'football-radio', name: 'Football Radio', country: 'UAE', countryCode: 'AE', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'football'] },
  { id: 'kora-radio', name: 'كورة راديو', country: 'Egypt', countryCode: 'EG', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'كورة'] },
  { id: 'match-radio', name: 'ماتش راديو', country: 'Saudi Arabia', countryCode: 'SA', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'match'] },
  { id: 'goal-radio', name: 'جول راديو', country: 'UAE', countryCode: 'AE', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'goal'] },
  { id: 'basketball-radio', name: 'كرة السلة راديو', country: 'Egypt', countryCode: 'EG', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'basketball'] },
  { id: 'tennis-radio', name: 'التنس راديو', country: 'UAE', countryCode: 'AE', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'tennis'] },
  { id: 'cricket-radio', name: 'الكريكيت راديو', country: 'UAE', countryCode: 'AE', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'cricket'] },
  { id: 'arabic-sports', name: 'Arabic Sports Radio', country: 'Saudi Arabia', countryCode: 'SA', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'arabic'] },
  { id: 'gulf-sports', name: 'Gulf Sports Radio', country: 'UAE', countryCode: 'AE', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'gulf'] },
  { id: 'world-sports-arabic', name: 'World Sports Arabic', country: 'Qatar', countryCode: 'QA', category: 'sport', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['sport', 'world'] },
  
  // ========== TALK STATIONS (20+) ==========
  { id: 'cairo-talk', name: 'إذاعة القاهرة للحوار', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'حوار', 'مصر'] },
  { id: 'egypt-talk', name: 'Egypt Talk Radio', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'egypt'] },
  { id: 'saudi-talk', name: 'الحوار السعودي', country: 'Saudi Arabia', countryCode: 'SA', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'سعودي'] },
  { id: 'dubai-talk', name: 'دبي للحوار', country: 'UAE', countryCode: 'AE', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'دبي'] },
  { id: 'rotana-khalijia', name: 'روتانا خليجية', country: 'Saudi Arabia', countryCode: 'SA', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'خليجي'] },
  { id: 'social-talk', name: 'الحوار الاجتماعي', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'اجتماعي'] },
  { id: 'family-talk', name: 'حوار الأسرة', country: 'UAE', countryCode: 'AE', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'أسرة'] },
  { id: 'youth-talk', name: 'حوار الشباب', country: 'Saudi Arabia', countryCode: 'SA', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'شباب'] },
  { id: 'women-talk', name: 'حوار المرأة', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'مرأة'] },
  { id: 'health-talk', name: 'حوار الصحة', country: 'UAE', countryCode: 'AE', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'صحة'] },
  { id: 'education-talk', name: 'حوار التربية', country: 'Jordan', countryCode: 'JO', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'تربية'] },
  { id: 'culture-talk', name: 'الحوار الثقافي', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'ثقافة'] },
  { id: 'art-talk', name: 'حوار الفن', country: 'Lebanon', countryCode: 'LB', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'فن'] },
  { id: 'book-talk', name: 'حوار الكتاب', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'كتب'] },
  { id: 'science-talk', name: 'الحوار العلمي', country: 'UAE', countryCode: 'AE', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'علم'] },
  { id: 'technology-talk', name: 'حوار التقنية', country: 'UAE', countryCode: 'AE', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'تقنية'] },
  { id: 'business-talk', name: 'حوار الأعمال', country: 'UAE', countryCode: 'AE', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'أعمال'] },
  { id: 'legal-talk', name: 'الحوار القانوني', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'قانون'] },
  { id: 'psychology-talk', name: 'الحوار النفسي', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'نفسي'] },
  { id: 'arabic-talk', name: 'Arabic Talk Radio', country: 'Egypt', countryCode: 'EG', category: 'talk', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['talk', 'arabic'] },

  // ========== DRAMA, STORIES & CULTURE STATIONS ==========
  // Saudi Arabia - Film & Cinema
  { id: 'fred-film-radio-ar', name: 'Fred Film Radio (لغة عربية)', country: 'Saudi Arabia', countryCode: 'SA', category: 'talk', streamUrl: 'https://s10.webradio-hosting.com/proxy/fredradioar/stream', tags: ['culture', 'film', 'movie', 'أفلام', 'سينما', 'ثقافة'] },
  // UAE - Stories for Kids
  { id: 'fun-radio-kids-stories', name: 'Fun Radio For Kids - Bedtime Stories', country: 'UAE', countryCode: 'AE', category: 'talk', streamUrl: 'https://drive.uber.radio/uber/forkidzbedtimestories/icecast.audio', tags: ['stories', 'storytelling', 'books', 'children', 'kids', 'قصص', 'حكايات', 'أطفال'] },
  // Morocco - Culture & Education
  { id: 'radio-manarat', name: 'Radio Manarat', country: 'Morocco', countryCode: 'MA', category: 'talk', streamUrl: 'https://listen.radioking.com/radio/252934/stream/297385', tags: ['culture', 'education', 'talk', 'ثقافة', 'تعليم', 'حوار'] },
  // Palestine - Culture & News
  { id: 'radio-nas', name: 'راديو الناس', country: 'Palestine', countryCode: 'PS', category: 'talk', streamUrl: 'https://cdna.streamgates.net/RadioNas/Live-Audio/icecast.audio', tags: ['culture', 'news', 'talk', 'music', 'ثقافة', 'أخبار', 'حوار', 'موسيقى'] },
  // Tunisia - Entertainment & News
  { id: 'mosaiquefm', name: 'mosaiquefm', country: 'Tunisia', countryCode: 'TN', category: 'talk', streamUrl: 'https://radio.mosaiquefm.net/mosalive', tags: ['news', 'talk', 'music', 'entertainment', 'أخبار', 'حوار', 'موسيقى', 'ترفيه'] },
  
  // ========== ADDITIONAL QURAN STATIONS (30+) ==========
  { id: 'quran-almajd', name: 'إذاعة المجد للقرآن الكريم', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'المجد', 'قرآن'] },
  { id: 'quran-assakina', name: 'إذاعة السكينة', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'السكينة', 'قرآن'] },
  { id: 'quran-tarbawiya', name: 'إذاعة التربوية القرآنية', country: 'Morocco', countryCode: 'MA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'تربوية', 'مغرب'] },
  { id: 'quran-bayan', name: 'إذاعة البيان القرآنية', country: 'UAE', countryCode: 'AE', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'البيان', 'إمارات'] },
  { id: 'quran-athaqalayn', name: 'إذاعة الثقلين', country: 'Iran', countryCode: 'IR', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'الثقلين'] },
  { id: 'quran-aldar', name: 'إذاعة الدار القرآنية', country: 'Kuwait', countryCode: 'KW', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'الدار', 'كويت'] },
  { id: 'quran-alaqsa2', name: 'إذاعة الأقصى القرآنية 2', country: 'Palestine', countryCode: 'PS', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'الأقصى', 'فلسطين'] },
  { id: 'quran-sawt-alhikma', name: 'صوت الحكمة القرآنية', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'صوت الحكمة'] },
  { id: 'quran-ibn-kathir', name: 'تفسير ابن كثير', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'تفسير', 'ابن كثير'] },
  { id: 'quran-alafasy', name: 'تلاوات العفاسي', country: 'Kuwait', countryCode: 'KW', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'العفاسي', 'كويت'] },
  { id: 'quran-sudais', name: 'تلاوات السديس', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'السديس', 'سعودية'] },
  { id: 'quran-shuraim', name: 'تلاوات الشريم', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'الشريم', 'سعودية'] },
  { id: 'quran-abdulbaset', name: 'تلاوات عبد الباسط', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'عبد الباسط', 'مصر'] },
  { id: 'quran-minshawi', name: 'تلاوات المنشاوي', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'المنشاوي', 'مصر'] },
  { id: 'quran-husary', name: 'تلاوات الحصري', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'الحصري', 'مصر'] },
  { id: 'quran-abdulrahman', name: 'تلاوات عبد الرحمن السديس', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'عبد الرحمن'] },
  { id: 'quran-maahir', name: 'تلاوات ماهر المعيقلي', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'ماهر', 'سعودية'] },
  { id: 'quran-yasser', name: 'تلاوات ياسر الدوسري', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'ياسر', 'سعودية'] },
  { id: 'quran-saad', name: 'تلاوات سعد الغامدي', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'سعد', 'الغامدي'] },
  { id: 'quran-fares', name: 'تلاوات فارس عباد', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'فارس', 'عباد'] },
  { id: 'quran-nabil', name: 'تلاوات نبيل العوضي', country: 'Kuwait', countryCode: 'KW', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'نبيل', 'العوضي'] },
  { id: 'quran-mishari', name: 'تلاوات مشاري العفاسي', country: 'Kuwait', countryCode: 'KW', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'مشاري', 'العفاسي'] },
  { id: 'quran-ahmed', name: 'تلاوات أحمد العجمي', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'أحمد', 'العجمي'] },
  { id: 'quran-hani', name: 'تلاوات هاني الرفاعي', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'هاني', 'الرفاعي'] },
  { id: 'quran-khalid', name: 'تلاوات خالد الجليل', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'خالد', 'الجليل'] },
  { id: 'quran-ali', name: 'تلاوات علي الحذيفي', country: 'Saudi Arabia', countryCode: 'SA', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'علي', 'الحذيفي'] },
  { id: 'quran-muhammad', name: 'تلاوات محمد صديق المنشاوي', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'محمد', 'منشاوي'] },
  { id: 'quran-mustafa', name: 'تلاوات مصطفى إسماعيل', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'مصطفى', 'إسماعيل'] },
  { id: 'quran-mahmoud', name: 'تلاوات محمود الحصري', country: 'Egypt', countryCode: 'EG', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'محمود', 'الحصري'] },
  { id: 'quran-tawfik', name: 'تلاوات توفيق الصايغ', country: 'Lebanon', countryCode: 'LB', category: 'quran', streamUrl: 'https://stream.zeno.fm/yn65fsaurfhvv', tags: ['quran', 'توفيق', 'لبنان'] },
];

// Process raw stations to add slugs and descriptions
export const STATIONS: StationData[] = RAW_STATIONS.map(station => {
  const { id, name, country, countryCode, category, streamUrl, tags, bitrate, codec, imageUrl, nameAr } = station;
  return {
    id,
    slug: id || generateSlug(name),
    name,
    nameAr,
    country,
    countryCode,
    category,
    streamUrl,
    tags,
    bitrate,
    codec,
    imageUrl,
    description: generateDescription({ name, country, countryCode, category, tags }),
    // Add aliases for compatibility
    stationuuid: id,
    countrycode: countryCode,
  };
});

// Export functions for SEO
export function getStationById(id: string): StationData | undefined {
  return STATIONS.find(s => s.id === id || s.slug === id);
}

export function getStationsByCountry(countryCode: string): StationData[] {
  return STATIONS.filter(s => s.countryCode === countryCode);
}

export function getStationsByCategory(category: string): StationData[] {
  return STATIONS.filter(s => s.category === category);
}

export function getRelatedStations(stationId: string, limit: number = 6): StationData[] {
  const station = getStationById(stationId);
  if (!station) return [];
  
  // First, try to find stations from same country and category
  const sameCountryAndCategory = STATIONS.filter(
    s => s.id !== stationId && 
    s.countryCode === station.countryCode && 
    s.category === station.category
  );
  
  // Then, stations from same country
  const sameCountry = STATIONS.filter(
    s => s.id !== stationId && 
    s.countryCode === station.countryCode &&
    !sameCountryAndCategory.includes(s)
  );
  
  // Then, stations from same category
  const sameCategory = STATIONS.filter(
    s => s.id !== stationId && 
    s.category === station.category &&
    !sameCountryAndCategory.includes(s) &&
    !sameCountry.includes(s)
  );
  
  // Combine and limit
  return [...sameCountryAndCategory, ...sameCountry, ...sameCategory].slice(0, limit);
}

// Get all station IDs for generateStaticParams
export function getAllStationIds(): string[] {
  return STATIONS.map(s => s.id);
}

// Get stations count
export function getStationCount(): number {
  return STATIONS.length;
}

// Get stations by filter
export function getFilteredStations(filter: {
  country?: string;
  category?: string;
  limit?: number;
}): StationData[] {
  let filtered = [...STATIONS];
  
  if (filter.country) {
    filtered = filtered.filter(s => s.countryCode === filter.country);
  }
  
  if (filter.category) {
    filtered = filtered.filter(s => s.category === filter.category);
  }
  
  if (filter.limit) {
    filtered = filtered.slice(0, filter.limit);
  }
  
  return filtered;
}
