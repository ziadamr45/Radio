// Static dataset of Quran reciters for SEO-optimized static generation
// Each reciter includes: id, name, nameAr, bio, bioAr, image, surahs available

export interface ReciterData {
  id: string;
  slug: string;
  name: string;
  nameAr: string;
  bio?: string;
  bioAr?: string;
  imageUrl?: string;
  audioBaseUrl: string;
  totalSurahs: number;
  isPopular: boolean;
  country: string;
  countryCode: string;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

// Quran reciters with their audio sources
const RAW_RECITERS: Array<Omit<ReciterData, 'slug' | 'bio' | 'bioAr'>> = [
  // Popular Reciters
  { id: 'abdul-basit', name: 'Abdul Basit Abdul Samad', nameAr: 'عبد الباسط عبد الصمد', audioBaseUrl: 'https://cdns.quranco.com/abdulbaset', totalSurahs: 114, isPopular: true, country: 'Egypt', countryCode: 'EG' },
  { id: 'mohamed-siddiq', name: 'Mohamed Siddiq El-Minshawi', nameAr: 'محمد صديق المنشاوي', audioBaseUrl: 'https://cdns.quranco.com/minshawi', totalSurahs: 114, isPopular: true, country: 'Egypt', countryCode: 'EG' },
  { id: 'mahmoud-khalil', name: 'Mahmoud Khalil Al-Husary', nameAr: 'محمود خليل الحصري', audioBaseUrl: 'https://cdns.quranco.com/husary', totalSurahs: 114, isPopular: true, country: 'Egypt', countryCode: 'EG' },
  { id: 'abdul-rahman', name: 'Abdul Rahman Al-Sudais', nameAr: 'عبد الرحمن السديس', audioBaseUrl: 'https://cdns.quranco.com/sudais', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'saud-shuraim', name: 'Saud Al-Shuraim', nameAr: 'سعود الشريم', audioBaseUrl: 'https://cdns.quranco.com/shuraim', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'mishari-alafasy', name: 'Mishari Rashid Al-Afasy', nameAr: 'مشاري راشد العفاسي', audioBaseUrl: 'https://cdns.quranco.com/afasy', totalSurahs: 114, isPopular: true, country: 'Kuwait', countryCode: 'KW' },
  { id: 'maher-muaiqly', name: 'Maher Al-Muaiqly', nameAr: 'ماهر المعيقلي', audioBaseUrl: 'https://cdns.quranco.com/maher', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'yasser-dosari', name: 'Yasser Al-Dosari', nameAr: 'ياسر الدوسري', audioBaseUrl: 'https://cdns.quranco.com/yasser', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'saad-ghamdi', name: 'Saad Al-Ghamdi', nameAr: 'سعد الغامدي', audioBaseUrl: 'https://cdns.quranco.com/ghamdi', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'ahmed-ajmi', name: 'Ahmed Al-Ajmi', nameAr: 'أحمد العجمي', audioBaseUrl: 'https://cdns.quranco.com/ajmi', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  
  // More Egyptian Reciters
  { id: 'mustafa-ismail', name: 'Mustafa Ismail', nameAr: 'مصطفى إسماعيل', audioBaseUrl: 'https://cdns.quranco.com/mustafa', totalSurahs: 114, isPopular: true, country: 'Egypt', countryCode: 'EG' },
  { id: 'muhammad-refaat', name: 'Muhammad Refaat', nameAr: 'محمد رفعت', audioBaseUrl: 'https://cdns.quranco.com/refaat', totalSurahs: 114, isPopular: true, country: 'Egypt', countryCode: 'EG' },
  { id: 'kamel-youssef', name: 'Kamel Youssef El-Bahtimy', nameAr: 'كامل يوسف البهتيمي', audioBaseUrl: 'https://cdns.quranco.com/kamel', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  { id: 'mahmoud-ali-banna', name: 'Mahmoud Ali Al-Banna', nameAr: 'محمود علي البنا', audioBaseUrl: 'https://cdns.quranco.com/banna', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  { id: 'abdul-hadi', name: 'Abdul Hadi Kanakeri', nameAr: 'عبد الهادي كنكري', audioBaseUrl: 'https://cdns.quranco.com/hadi', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  { id: 'mostafa-mahmoud', name: 'Mostafa Mahmoud', nameAr: 'مصطفى محمود', audioBaseUrl: 'https://cdns.quranco.com/mostafa', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  { id: 'ahmed-nuaina', name: 'Ahmed Nuaina', nameAr: 'أحمد نعينع', audioBaseUrl: 'https://cdns.quranco.com/nuaina', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  { id: 'reda-abdul', name: 'Reda Abdul Aal', nameAr: 'رضا عبد العال', audioBaseUrl: 'https://cdns.quranco.com/reda', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  
  // More Saudi Reciters
  { id: 'ali-hudhaifi', name: 'Ali Al-Hudhaifi', nameAr: 'علي الحذيفي', audioBaseUrl: 'https://cdns.quranco.com/hudhaifi', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'fahad-kundain', name: 'Fahad Al-Kundain', nameAr: 'فهد الكندري', audioBaseUrl: 'https://cdns.quranco.com/kundain', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'abdullah-basfar', name: 'Abdullah Basfar', nameAr: 'عبد الله بصفر', audioBaseUrl: 'https://cdns.quranco.com/basfar', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'abdullah-awad', name: 'Abdullah Awad Al-Juhani', nameAr: 'عبد الله عوض الجهني', audioBaseUrl: 'https://cdns.quranco.com/juhani', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'bandar-balila', name: 'Bandar Balila', nameAr: 'بندر بليلة', audioBaseUrl: 'https://cdns.quranco.com/balila', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'khalid-jalil', name: 'Khalid Al-Jalil', nameAr: 'خالد الجليل', audioBaseUrl: 'https://cdns.quranco.com/jalil', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'tareq-ibrahim', name: 'Tareq Ibrahim', nameAr: 'طارق إبراهيم', audioBaseUrl: 'https://cdns.quranco.com/tareq', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'mohammed-salih', name: 'Mohammed Salih', nameAr: 'محمد صالح', audioBaseUrl: 'https://cdns.quranco.com/salih', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  
  // Kuwaiti Reciters
  { id: 'fares-abbad', name: 'Fares Abbad', nameAr: 'فارس عباد', audioBaseUrl: 'https://cdns.quranco.com/abbad', totalSurahs: 114, isPopular: true, country: 'Kuwait', countryCode: 'KW' },
  { id: 'nabil-al-awadi', name: 'Nabil Al-Awadi', nameAr: 'نبيل العوضي', audioBaseUrl: 'https://cdns.quranco.com/awadi', totalSurahs: 114, isPopular: false, country: 'Kuwait', countryCode: 'KW' },
  { id: 'ahmed-al-fahad', name: 'Ahmed Al-Fahad', nameAr: 'أحمد الفهد', audioBaseUrl: 'https://cdns.quranco.com/fahad', totalSurahs: 114, isPopular: false, country: 'Kuwait', countryCode: 'KW' },
  
  // UAE Reciters
  { id: 'ahmed-al-hosary', name: 'Ahmed Al-Hosary', nameAr: 'أحمد الحصري', audioBaseUrl: 'https://cdns.quranco.com/ahosary', totalSurahs: 114, isPopular: false, country: 'UAE', countryCode: 'AE' },
  { id: 'mohammed-ahmed', name: 'Mohammed Ahmed', nameAr: 'محمد أحمد', audioBaseUrl: 'https://cdns.quranco.com/mahmed', totalSurahs: 114, isPopular: false, country: 'UAE', countryCode: 'AE' },
  
  // Other Reciters
  { id: 'hani-rifai', name: 'Hani Al-Rifai', nameAr: 'هاني الرفاعي', audioBaseUrl: 'https://cdns.quranco.com/rifai', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'muhammad-ayyub', name: 'Muhammad Ayyub', nameAr: 'محمد أيوب', audioBaseUrl: 'https://cdns.quranco.com/ayyub', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'ibrahim-al-akhdar', name: 'Ibrahim Al-Akhdar', nameAr: 'إبراهيم الأخضر', audioBaseUrl: 'https://cdns.quranco.com/akhdar', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  
  // Syrian Reciters
  { id: 'mohammad-shahhat', name: 'Mohammad Shahhat', nameAr: 'محمد شحاته', audioBaseUrl: 'https://cdns.quranco.com/shahhat', totalSurahs: 114, isPopular: false, country: 'Syria', countryCode: 'SY' },
  { id: 'abdul-basit-hamid', name: 'Abdul Basit Hamid', nameAr: 'عبد الباسط حامد', audioBaseUrl: 'https://cdns.quranco.com/hamid', totalSurahs: 114, isPopular: false, country: 'Syria', countryCode: 'SY' },
  
  // Palestinian Reciters
  { id: 'mohammad-siddiq-2', name: 'Mohammad Siddiq', nameAr: 'محمد صديق', audioBaseUrl: 'https://cdns.quranco.com/msiddiq', totalSurahs: 114, isPopular: false, country: 'Palestine', countryCode: 'PS' },
  
  // Moroccan Reciters
  { id: 'abdul-rashid', name: 'Abdul Rashid Sufi', nameAr: 'عبد الرشيد صوفي', audioBaseUrl: 'https://cdns.quranco.com/sufi', totalSurahs: 114, isPopular: false, country: 'Morocco', countryCode: 'MA' },
  
  // Indonesian Reciters
  { id: 'muammar-za', name: 'Muammar ZA', nameAr: 'معمر زا', audioBaseUrl: 'https://cdns.quranco.com/muammar', totalSurahs: 114, isPopular: true, country: 'Indonesia', countryCode: 'ID' },
  
  // Additional Popular Reciters
  { id: 'abdurrahman-as-sudais', name: 'Abdurrahman As-Sudais', nameAr: 'عبد الرحمن السديس', audioBaseUrl: 'https://cdns.quranco.com/asudais', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'salih-bukhatir', name: 'Salih Bukhatir', nameAr: 'صالح بخاطر', audioBaseUrl: 'https://cdns.quranco.com/bukhatir', totalSurahs: 114, isPopular: false, country: 'UAE', countryCode: 'AE' },
  { id: 'idris-abkar', name: 'Idris Abkar', nameAr: 'إدريس أبكر', audioBaseUrl: 'https://cdns.quranco.com/abkar', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'nasser-al-qatami', name: 'Nasser Al-Qatami', nameAr: 'ناصر القطامي', audioBaseUrl: 'https://cdns.quranco.com/qatami', totalSurahs: 114, isPopular: true, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'adel-rayan', name: 'Adel Rayan', nameAr: 'عادل ريان', audioBaseUrl: 'https://cdns.quranco.com/rayan', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  { id: 'ayman-swaid', name: 'Ayman Swaid', nameAr: 'أيمان سويد', audioBaseUrl: 'https://cdns.quranco.com/swaid', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'adel-kalbani', name: 'Adel Kalbani', nameAr: 'عادل الكلباني', audioBaseUrl: 'https://cdns.quranco.com/kalbani', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'tawfiq-sayegh', name: 'Tawfiq Sayegh', nameAr: 'توفيق الصايغ', audioBaseUrl: 'https://cdns.quranco.com/sayegh', totalSurahs: 114, isPopular: false, country: 'Lebanon', countryCode: 'LB' },
  { id: 'mohammed-tahir', name: 'Mohammed Tahir', nameAr: 'محمد طاهر', audioBaseUrl: 'https://cdns.quranco.com/tahir', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  
  // Additional Reciters
  { id: 'ahmed-agha', name: 'Ahmed Agha', nameAr: 'أحمد آغا', audioBaseUrl: 'https://cdns.quranco.com/agha', totalSurahs: 114, isPopular: false, country: 'Palestine', countryCode: 'PS' },
  { id: 'abdul-wali', name: 'Abdul Wali Al-Arkani', nameAr: 'عبد الولي الأركاني', audioBaseUrl: 'https://cdns.quranco.com/arkani', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'abdul-karim', name: 'Abdul Karim Al-Dossari', nameAr: 'عبد الكريم الدوسري', audioBaseUrl: 'https://cdns.quranco.com/dossari', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'sahl-yasin', name: 'Sahl Yasin', nameAr: 'سهل ياسين', audioBaseUrl: 'https://cdns.quranco.com/yasin', totalSurahs: 114, isPopular: false, country: 'Iraq', countryCode: 'IQ' },
  { id: 'yahya-hendawi', name: 'Yahya Hendawi', nameAr: 'يحيى حنداوي', audioBaseUrl: 'https://cdns.quranco.com/hendawi', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  { id: 'ahmed-trabulsi', name: 'Ahmed Trabulsi', nameAr: 'أحمد طرابلسي', audioBaseUrl: 'https://cdns.quranco.com/trabulsi', totalSurahs: 114, isPopular: false, country: 'Libya', countryCode: 'LY' },
  { id: 'omar-qazabri', name: 'Omar Qazabri', nameAr: 'عمر القزابري', audioBaseUrl: 'https://cdns.quranco.com/qazabri', totalSurahs: 114, isPopular: false, country: 'Morocco', countryCode: 'MA' },
  { id: 'abdul-mohsen', name: 'Abdul Mohsen Al-Qasim', nameAr: 'عبد المحسن القاسم', audioBaseUrl: 'https://cdns.quranco.com/qasim', totalSurahs: 114, isPopular: false, country: 'Saudi Arabia', countryCode: 'SA' },
  { id: 'abduh-kholaf', name: 'Abduh Kholaf', nameAr: 'عبده خلاف', audioBaseUrl: 'https://cdns.quranco.com/kholaf', totalSurahs: 114, isPopular: false, country: 'Egypt', countryCode: 'EG' },
  
  // mp3quran.net Reciters
  { id: 'islam-sobhi', name: 'Islam Sobhi', nameAr: 'إسلام صبحي', audioBaseUrl: 'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem', totalSurahs: 106, isPopular: false, country: 'Egypt', countryCode: 'EG' },
];

// Country code to Arabic name mapping
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
  ID: 'إندونيسيا',
  IR: 'إيران',
};

// Generate unique Arabic biography for each reciter
function generateBioAr(reciter: Omit<ReciterData, 'slug' | 'bio' | 'bioAr'>): string {
  const countryAr = COUNTRIES_AR[reciter.countryCode] || reciter.country;
  
  const templates = [
    `الشيخ ${reciter.nameAr} من أشهر قراء القرآن الكريم في ${countryAr}، يتميز بصوت عذب وأداء مؤثر يجذب المستمعين. استمع إلى تلاواته القرآنية بجودة عالية على اسمع راديو.`,
    `${reciter.nameAr} قارئ قرآن كريم من ${countryAr}، عُرف بتلاوته المميزة وأدائه الفريد. يمكنك الاستماع إلى جميع سور القرآن الكريم بصوته الشجي.`,
    `الشيخ ${reciter.nameAr} قارئ من ${countryAr}، يقرأ القرآن الكريم بتجويد متقن وأداء راقي. تلاواته تبعث السكينة في النفوس.`,
    `من أبرز قراء القرآن في ${countryAr}، الشيخ ${reciter.nameAr} يتميز بأسلوبه الفريد في التلاوة. استمع لتلاواته كاملة على منصتنا.`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Generate English biography
function generateBio(reciter: Omit<ReciterData, 'slug' | 'bio' | 'bioAr'>): string {
  const templates = [
    `Sheikh ${reciter.name} is one of the most renowned Quran reciters from ${reciter.country}. Listen to his beautiful recitations in high quality on Esmaa Radio.`,
    `${reciter.name} is a celebrated Quran reciter from ${reciter.country}, known for his melodious voice and touching recitation style.`,
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

// Process raw reciters to add slugs and bios
export const RECITERS: ReciterData[] = RAW_RECITERS.map(reciter => ({
  ...reciter,
  slug: generateSlug(reciter.name),
  bio: generateBio(reciter),
  bioAr: generateBioAr(reciter),
}));

// Export functions for SEO
export function getReciterById(id: string): ReciterData | undefined {
  return RECITERS.find(r => r.id === id || r.slug === id);
}

export function getReciterBySlug(slug: string): ReciterData | undefined {
  return RECITERS.find(r => r.slug === slug);
}

export function getPopularReciters(): ReciterData[] {
  return RECITERS.filter(r => r.isPopular);
}

export function getRecitersByCountry(countryCode: string): ReciterData[] {
  return RECITERS.filter(r => r.countryCode === countryCode);
}

export function getAllReciterSlugs(): string[] {
  return RECITERS.map(r => r.slug);
}

export function getReciterCount(): number {
  return RECITERS.length;
}

// Get related reciters (same country or popular)
export function getRelatedReciters(reciterId: string, limit: number = 6): ReciterData[] {
  const reciter = getReciterById(reciterId);
  if (!reciter) return [];
  
  // First, reciters from same country
  const sameCountry = RECITERS.filter(
    r => r.id !== reciterId && r.countryCode === reciter.countryCode
  );
  
  // Then, popular reciters
  const popular = RECITERS.filter(
    r => r.id !== reciterId && r.isPopular && !sameCountry.includes(r)
  );
  
  return [...sameCountry, ...popular].slice(0, limit);
}
