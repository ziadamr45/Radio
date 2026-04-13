// Static dataset of all 114 Quran Surahs for SEO-optimized static generation

export interface SurahData {
  id: string;
  number: number;
  slug: string;
  name: string;
  nameAr: string;
  englishName: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  juz: number[];
  description?: string;
  descriptionAr?: string;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);
}

// All 114 Surahs
const RAW_SURAHS: Array<Omit<SurahData, 'slug' | 'description' | 'descriptionAr'>> = [
  { id: 'al-fatiha', number: 1, name: 'Al-Fatihah', nameAr: 'الفاتحة', englishName: 'The Opening', revelationType: 'Meccan', numberOfAyahs: 7, juz: [1] },
  { id: 'al-baqarah', number: 2, name: 'Al-Baqarah', nameAr: 'البقرة', englishName: 'The Cow', revelationType: 'Medinan', numberOfAyahs: 286, juz: [1, 2, 3] },
  { id: 'al-imran', number: 3, name: 'Ali \'Imran', nameAr: 'آل عمران', englishName: 'Family of Imran', revelationType: 'Medinan', numberOfAyahs: 200, juz: [3, 4] },
  { id: 'an-nisa', number: 4, name: 'An-Nisa', nameAr: 'النساء', englishName: 'The Women', revelationType: 'Medinan', numberOfAyahs: 176, juz: [4, 5, 6] },
  { id: 'al-maidah', number: 5, name: 'Al-Ma\'idah', nameAr: 'المائدة', englishName: 'The Table Spread', revelationType: 'Medinan', numberOfAyahs: 120, juz: [6, 7] },
  { id: 'al-anam', number: 6, name: 'Al-An\'am', nameAr: 'الأنعام', englishName: 'The Cattle', revelationType: 'Meccan', numberOfAyahs: 165, juz: [7, 8] },
  { id: 'al-araf', number: 7, name: 'Al-A\'raf', nameAr: 'الأعراف', englishName: 'The Heights', revelationType: 'Meccan', numberOfAyahs: 206, juz: [8, 9] },
  { id: 'al-anfal', number: 8, name: 'Al-Anfal', nameAr: 'الأنفال', englishName: 'The Spoils of War', revelationType: 'Medinan', numberOfAyahs: 75, juz: [9, 10] },
  { id: 'at-tawbah', number: 9, name: 'At-Tawbah', nameAr: 'التوبة', englishName: 'The Repentance', revelationType: 'Medinan', numberOfAyahs: 129, juz: [10, 11] },
  { id: 'yunus', number: 10, name: 'Yunus', nameAr: 'يونس', englishName: 'Jonah', revelationType: 'Meccan', numberOfAyahs: 109, juz: [11] },
  { id: 'hud', number: 11, name: 'Hud', nameAr: 'هود', englishName: 'Hud', revelationType: 'Meccan', numberOfAyahs: 123, juz: [11, 12] },
  { id: 'yusuf', number: 12, name: 'Yusuf', nameAr: 'يوسف', englishName: 'Joseph', revelationType: 'Meccan', numberOfAyahs: 111, juz: [12, 13] },
  { id: 'ar-rad', number: 13, name: 'Ar-Ra\'d', nameAr: 'الرعد', englishName: 'The Thunder', revelationType: 'Medinan', numberOfAyahs: 43, juz: [13] },
  { id: 'ibrahim', number: 14, name: 'Ibrahim', nameAr: 'إبراهيم', englishName: 'Abraham', revelationType: 'Meccan', numberOfAyahs: 52, juz: [13] },
  { id: 'al-hijr', number: 15, name: 'Al-Hijr', nameAr: 'الحجر', englishName: 'The Rocky Tract', revelationType: 'Meccan', numberOfAyahs: 99, juz: [14] },
  { id: 'an-nahl', number: 16, name: 'An-Nahl', nameAr: 'النحل', englishName: 'The Bee', revelationType: 'Meccan', numberOfAyahs: 128, juz: [14] },
  { id: 'al-isra', number: 17, name: 'Al-Isra', nameAr: 'الإسراء', englishName: 'The Night Journey', revelationType: 'Meccan', numberOfAyahs: 111, juz: [15] },
  { id: 'al-kahf', number: 18, name: 'Al-Kahf', nameAr: 'الكهف', englishName: 'The Cave', revelationType: 'Meccan', numberOfAyahs: 110, juz: [15, 16] },
  { id: 'maryam', number: 19, name: 'Maryam', nameAr: 'مريم', englishName: 'Mary', revelationType: 'Meccan', numberOfAyahs: 98, juz: [16] },
  { id: 'ta-ha', number: 20, name: 'Ta-Ha', nameAr: 'طه', englishName: 'Ta-Ha', revelationType: 'Meccan', numberOfAyahs: 135, juz: [16] },
  { id: 'al-anbiya', number: 21, name: 'Al-Anbiya', nameAr: 'الأنبياء', englishName: 'The Prophets', revelationType: 'Meccan', numberOfAyahs: 112, juz: [17] },
  { id: 'al-hajj', number: 22, name: 'Al-Hajj', nameAr: 'الحج', englishName: 'The Pilgrimage', revelationType: 'Medinan', numberOfAyahs: 78, juz: [17] },
  { id: 'al-muminun', number: 23, name: 'Al-Mu\'minun', nameAr: 'المؤمنون', englishName: 'The Believers', revelationType: 'Meccan', numberOfAyahs: 118, juz: [18] },
  { id: 'an-nur', number: 24, name: 'An-Nur', nameAr: 'النور', englishName: 'The Light', revelationType: 'Medinan', numberOfAyahs: 64, juz: [18] },
  { id: 'al-furqan', number: 25, name: 'Al-Furqan', nameAr: 'الفرقان', englishName: 'The Criterion', revelationType: 'Meccan', numberOfAyahs: 77, juz: [18, 19] },
  { id: 'ash-shuara', number: 26, name: 'Ash-Shu\'ara', nameAr: 'الشعراء', englishName: 'The Poets', revelationType: 'Meccan', numberOfAyahs: 227, juz: [19] },
  { id: 'an-naml', number: 27, name: 'An-Naml', nameAr: 'النمل', englishName: 'The Ant', revelationType: 'Meccan', numberOfAyahs: 93, juz: [19, 20] },
  { id: 'al-qasas', number: 28, name: 'Al-Qasas', nameAr: 'القصص', englishName: 'The Stories', revelationType: 'Meccan', numberOfAyahs: 88, juz: [20] },
  { id: 'al-ankabut', number: 29, name: 'Al-\'Ankabut', nameAr: 'العنكبوت', englishName: 'The Spider', revelationType: 'Meccan', numberOfAyahs: 69, juz: [20] },
  { id: 'ar-rum', number: 30, name: 'Ar-Rum', nameAr: 'الروم', englishName: 'The Romans', revelationType: 'Meccan', numberOfAyahs: 60, juz: [21] },
  { id: 'luqman', number: 31, name: 'Luqman', nameAr: 'لقمان', englishName: 'Luqman', revelationType: 'Meccan', numberOfAyahs: 34, juz: [21] },
  { id: 'as-sajdah', number: 32, name: 'As-Sajdah', nameAr: 'السجدة', englishName: 'The Prostration', revelationType: 'Meccan', numberOfAyahs: 30, juz: [21] },
  { id: 'al-ahzab', number: 33, name: 'Al-Ahzab', nameAr: 'الأحزاب', englishName: 'The Combined Forces', revelationType: 'Medinan', numberOfAyahs: 73, juz: [21, 22] },
  { id: 'saba', number: 34, name: 'Saba', nameAr: 'سبأ', englishName: 'Sheba', revelationType: 'Meccan', numberOfAyahs: 54, juz: [22] },
  { id: 'fatir', number: 35, name: 'Fatir', nameAr: 'فاطر', englishName: 'Originator', revelationType: 'Meccan', numberOfAyahs: 45, juz: [22] },
  { id: 'ya-sin', number: 36, name: 'Ya-Sin', nameAr: 'يس', englishName: 'Ya Sin', revelationType: 'Meccan', numberOfAyahs: 83, juz: [22, 23] },
  { id: 'as-saffat', number: 37, name: 'As-Saffat', nameAr: 'الصافات', englishName: 'Those Who Set The Ranks', revelationType: 'Meccan', numberOfAyahs: 182, juz: [23] },
  { id: 'sad', number: 38, name: 'Sad', nameAr: 'ص', englishName: 'The Letter Sad', revelationType: 'Meccan', numberOfAyahs: 88, juz: [23] },
  { id: 'az-zumar', number: 39, name: 'Az-Zumar', nameAr: 'الزمر', englishName: 'The Troops', revelationType: 'Meccan', numberOfAyahs: 75, juz: [23, 24] },
  { id: 'ghafir', number: 40, name: 'Ghafir', nameAr: 'غافر', englishName: 'The Forgiver', revelationType: 'Meccan', numberOfAyahs: 85, juz: [24] },
  { id: 'fussilat', number: 41, name: 'Fussilat', nameAr: 'فصلت', englishName: 'Explained in Detail', revelationType: 'Meccan', numberOfAyahs: 54, juz: [24, 25] },
  { id: 'ash-shura', number: 42, name: 'Ash-Shura', nameAr: 'الشورى', englishName: 'The Consultation', revelationType: 'Meccan', numberOfAyahs: 53, juz: [25] },
  { id: 'az-zukhruf', number: 43, name: 'Az-Zukhruf', nameAr: 'الزخرف', englishName: 'The Ornaments of Gold', revelationType: 'Meccan', numberOfAyahs: 89, juz: [25] },
  { id: 'ad-dukhan', number: 44, name: 'Ad-Dukhan', nameAr: 'الدخان', englishName: 'The Smoke', revelationType: 'Meccan', numberOfAyahs: 59, juz: [25] },
  { id: 'al-jathiyah', number: 45, name: 'Al-Jathiyah', nameAr: 'الجاثية', englishName: 'The Crouching', revelationType: 'Meccan', numberOfAyahs: 37, juz: [25] },
  { id: 'al-ahqaf', number: 46, name: 'Al-Ahqaf', nameAr: 'الأحقاف', englishName: 'The Wind-Curved Sandhills', revelationType: 'Meccan', numberOfAyahs: 35, juz: [26] },
  { id: 'muhammad', number: 47, name: 'Muhammad', nameAr: 'محمد', englishName: 'Muhammad', revelationType: 'Medinan', numberOfAyahs: 38, juz: [26] },
  { id: 'al-fath', number: 48, name: 'Al-Fath', nameAr: 'الفتح', englishName: 'The Victory', revelationType: 'Medinan', numberOfAyahs: 29, juz: [26] },
  { id: 'al-hujurat', number: 49, name: 'Al-Hujurat', nameAr: 'الحجرات', englishName: 'The Rooms', revelationType: 'Medinan', numberOfAyahs: 18, juz: [26] },
  { id: 'qaf', number: 50, name: 'Qaf', nameAr: 'ق', englishName: 'The Letter Qaf', revelationType: 'Meccan', numberOfAyahs: 45, juz: [26] },
  { id: 'adh-dhariyat', number: 51, name: 'Adh-Dhariyat', nameAr: 'الذاريات', englishName: 'The Winnowing Winds', revelationType: 'Meccan', numberOfAyahs: 60, juz: [26, 27] },
  { id: 'at-tur', number: 52, name: 'At-Tur', nameAr: 'الطور', englishName: 'The Mount', revelationType: 'Meccan', numberOfAyahs: 49, juz: [27] },
  { id: 'an-najm', number: 53, name: 'An-Najm', nameAr: 'النجم', englishName: 'The Star', revelationType: 'Meccan', numberOfAyahs: 62, juz: [27] },
  { id: 'al-qamar', number: 54, name: 'Al-Qamar', nameAr: 'القمر', englishName: 'The Moon', revelationType: 'Meccan', numberOfAyahs: 55, juz: [27] },
  { id: 'ar-rahman', number: 55, name: 'Ar-Rahman', nameAr: 'الرحمن', englishName: 'The Beneficent', revelationType: 'Medinan', numberOfAyahs: 78, juz: [27] },
  { id: 'al-waqiah', number: 56, name: 'Al-Waqi\'ah', nameAr: 'الواقعة', englishName: 'The Inevitable', revelationType: 'Meccan', numberOfAyahs: 96, juz: [27] },
  { id: 'al-hadid', number: 57, name: 'Al-Hadid', nameAr: 'الحديد', englishName: 'The Iron', revelationType: 'Medinan', numberOfAyahs: 29, juz: [27, 28] },
  { id: 'al-mujadila', number: 58, name: 'Al-Mujadila', nameAr: 'المجادلة', englishName: 'The Pleading Woman', revelationType: 'Medinan', numberOfAyahs: 22, juz: [28] },
  { id: 'al-hashr', number: 59, name: 'Al-Hashr', nameAr: 'الحشر', englishName: 'The Exile', revelationType: 'Medinan', numberOfAyahs: 24, juz: [28] },
  { id: 'al-mumtahanah', number: 60, name: 'Al-Mumtahanah', nameAr: 'الممتحنة', englishName: 'She that is to be examined', revelationType: 'Medinan', numberOfAyahs: 13, juz: [28] },
  { id: 'as-saff', number: 61, name: 'As-Saff', nameAr: 'الصف', englishName: 'The Ranks', revelationType: 'Medinan', numberOfAyahs: 14, juz: [28] },
  { id: 'al-jumuah', number: 62, name: 'Al-Jumu\'ah', nameAr: 'الجمعة', englishName: 'The Congregation', revelationType: 'Medinan', numberOfAyahs: 11, juz: [28] },
  { id: 'al-munafiqun', number: 63, name: 'Al-Munafiqun', nameAr: 'المنافقون', englishName: 'The Hypocrites', revelationType: 'Medinan', numberOfAyahs: 11, juz: [28] },
  { id: 'at-taghabun', number: 64, name: 'At-Taghabun', nameAr: 'التغابن', englishName: 'The Mutual Disillusion', revelationType: 'Medinan', numberOfAyahs: 18, juz: [28] },
  { id: 'at-talaq', number: 65, name: 'At-Talaq', nameAr: 'الطلاق', englishName: 'The Divorce', revelationType: 'Medinan', numberOfAyahs: 12, juz: [28] },
  { id: 'at-tahrim', number: 66, name: 'At-Tahrim', nameAr: 'التحريم', englishName: 'The Prohibition', revelationType: 'Medinan', numberOfAyahs: 12, juz: [28] },
  { id: 'al-mulk', number: 67, name: 'Al-Mulk', nameAr: 'الملك', englishName: 'The Sovereignty', revelationType: 'Meccan', numberOfAyahs: 30, juz: [29] },
  { id: 'al-qalam', number: 68, name: 'Al-Qalam', nameAr: 'القلم', englishName: 'The Pen', revelationType: 'Meccan', numberOfAyahs: 52, juz: [29] },
  { id: 'al-haqqah', number: 69, name: 'Al-Haqqah', nameAr: 'الحاقة', englishName: 'The Reality', revelationType: 'Meccan', numberOfAyahs: 52, juz: [29] },
  { id: 'al-maarij', number: 70, name: 'Al-Ma\'arij', nameAr: 'المعارج', englishName: 'The Ascending Stairways', revelationType: 'Meccan', numberOfAyahs: 44, juz: [29] },
  { id: 'nuh', number: 71, name: 'Nuh', nameAr: 'نوح', englishName: 'Noah', revelationType: 'Meccan', numberOfAyahs: 28, juz: [29] },
  { id: 'al-jinn', number: 72, name: 'Al-Jinn', nameAr: 'الجن', englishName: 'The Jinn', revelationType: 'Meccan', numberOfAyahs: 28, juz: [29] },
  { id: 'al-muzzammil', number: 73, name: 'Al-Muzzammil', nameAr: 'المزمل', englishName: 'The Enshrouded One', revelationType: 'Meccan', numberOfAyahs: 20, juz: [29] },
  { id: 'al-muddaththir', number: 74, name: 'Al-Muddaththir', nameAr: 'المدثر', englishName: 'The Cloaked One', revelationType: 'Meccan', numberOfAyahs: 56, juz: [29] },
  { id: 'al-qiyamah', number: 75, name: 'Al-Qiyamah', nameAr: 'القيامة', englishName: 'The Resurrection', revelationType: 'Meccan', numberOfAyahs: 40, juz: [29] },
  { id: 'al-insan', number: 76, name: 'Al-Insan', nameAr: 'الإنسان', englishName: 'The Human', revelationType: 'Medinan', numberOfAyahs: 31, juz: [29] },
  { id: 'al-mursalat', number: 77, name: 'Al-Mursalat', nameAr: 'المرسلات', englishName: 'The Emissaries', revelationType: 'Meccan', numberOfAyahs: 50, juz: [29] },
  { id: 'an-naba', number: 78, name: 'An-Naba', nameAr: 'النبأ', englishName: 'The Tidings', revelationType: 'Meccan', numberOfAyahs: 40, juz: [30] },
  { id: 'an-naziat', number: 79, name: 'An-Nazi\'at', nameAr: 'النازعات', englishName: 'Those who drag forth', revelationType: 'Meccan', numberOfAyahs: 46, juz: [30] },
  { id: 'abasa', number: 80, name: '\'Abasa', nameAr: 'عبس', englishName: 'He Frowned', revelationType: 'Meccan', numberOfAyahs: 42, juz: [30] },
  { id: 'at-takwir', number: 81, name: 'At-Takwir', nameAr: 'التكوير', englishName: 'The Overthrowing', revelationType: 'Meccan', numberOfAyahs: 29, juz: [30] },
  { id: 'al-infitar', number: 82, name: 'Al-Infitar', nameAr: 'الانفطار', englishName: 'The Cleaving', revelationType: 'Meccan', numberOfAyahs: 19, juz: [30] },
  { id: 'al-mutaffifin', number: 83, name: 'Al-Mutaffifin', nameAr: 'المطففين', englishName: 'The Defrauding', revelationType: 'Meccan', numberOfAyahs: 36, juz: [30] },
  { id: 'al-inshiqaq', number: 84, name: 'Al-Inshiqaq', nameAr: 'الانشقاق', englishName: 'The Sundering', revelationType: 'Meccan', numberOfAyahs: 25, juz: [30] },
  { id: 'al-buruj', number: 85, name: 'Al-Buruj', nameAr: 'البروج', englishName: 'The Mansions of the Stars', revelationType: 'Meccan', numberOfAyahs: 22, juz: [30] },
  { id: 'at-tariq', number: 86, name: 'At-Tariq', nameAr: 'الطارق', englishName: 'The Nightcomer', revelationType: 'Meccan', numberOfAyahs: 17, juz: [30] },
  { id: 'al-ala', number: 87, name: 'Al-A\'la', nameAr: 'الأعلى', englishName: 'The Most High', revelationType: 'Meccan', numberOfAyahs: 19, juz: [30] },
  { id: 'al-ghashiyah', number: 88, name: 'Al-Ghashiyah', nameAr: 'الغاشية', englishName: 'The Overwhelming', revelationType: 'Meccan', numberOfAyahs: 26, juz: [30] },
  { id: 'al-fajr', number: 89, name: 'Al-Fajr', nameAr: 'الفجر', englishName: 'The Dawn', revelationType: 'Meccan', numberOfAyahs: 30, juz: [30] },
  { id: 'al-balad', number: 90, name: 'Al-Balad', nameAr: 'البلد', englishName: 'The City', revelationType: 'Meccan', numberOfAyahs: 20, juz: [30] },
  { id: 'ash-shams', number: 91, name: 'Ash-Shams', nameAr: 'الشمس', englishName: 'The Sun', revelationType: 'Meccan', numberOfAyahs: 15, juz: [30] },
  { id: 'al-layl', number: 92, name: 'Al-Layl', nameAr: 'الليل', englishName: 'The Night', revelationType: 'Meccan', numberOfAyahs: 21, juz: [30] },
  { id: 'ad-duha', number: 93, name: 'Ad-Duha', nameAr: 'الضحى', englishName: 'The Morning Hours', revelationType: 'Meccan', numberOfAyahs: 11, juz: [30] },
  { id: 'ash-sharh', number: 94, name: 'Ash-Sharh', nameAr: 'الشرح', englishName: 'The Relief', revelationType: 'Meccan', numberOfAyahs: 8, juz: [30] },
  { id: 'at-tin', number: 95, name: 'At-Tin', nameAr: 'التين', englishName: 'The Fig', revelationType: 'Meccan', numberOfAyahs: 8, juz: [30] },
  { id: 'al-alaq', number: 96, name: 'Al-\'Alaq', nameAr: 'العلق', englishName: 'The Clot', revelationType: 'Meccan', numberOfAyahs: 19, juz: [30] },
  { id: 'al-qadr', number: 97, name: 'Al-Qadr', nameAr: 'القدر', englishName: 'The Power', revelationType: 'Meccan', numberOfAyahs: 5, juz: [30] },
  { id: 'al-bayyinah', number: 98, name: 'Al-Bayyinah', nameAr: 'البينة', englishName: 'The Clear Proof', revelationType: 'Medinan', numberOfAyahs: 8, juz: [30] },
  { id: 'az-zalzalah', number: 99, name: 'Az-Zalzalah', nameAr: 'الزلزلة', englishName: 'The Earthquake', revelationType: 'Medinan', numberOfAyahs: 8, juz: [30] },
  { id: 'al-adiyat', number: 100, name: 'Al-\'Adiyat', nameAr: 'العاديات', englishName: 'The Courser', revelationType: 'Meccan', numberOfAyahs: 11, juz: [30] },
  { id: 'al-qariah', number: 101, name: 'Al-Qari\'ah', nameAr: 'القارعة', englishName: 'The Calamity', revelationType: 'Meccan', numberOfAyahs: 11, juz: [30] },
  { id: 'at-takathur', number: 102, name: 'At-Takathur', nameAr: 'التكاثر', englishName: 'The Rivalry in world', revelationType: 'Meccan', numberOfAyahs: 8, juz: [30] },
  { id: 'al-asr', number: 103, name: 'Al-\'Asr', nameAr: 'العصر', englishName: 'The Declining Day', revelationType: 'Meccan', numberOfAyahs: 3, juz: [30] },
  { id: 'al-humazah', number: 104, name: 'Al-Humazah', nameAr: 'الهمزة', englishName: 'The Traducer', revelationType: 'Meccan', numberOfAyahs: 9, juz: [30] },
  { id: 'al-fil', number: 105, name: 'Al-Fil', nameAr: 'الفيل', englishName: 'The Elephant', revelationType: 'Meccan', numberOfAyahs: 5, juz: [30] },
  { id: 'quraysh', number: 106, name: 'Quraysh', nameAr: 'قريش', englishName: 'Quraysh', revelationType: 'Meccan', numberOfAyahs: 4, juz: [30] },
  { id: 'al-man', number: 107, name: 'Al-Ma\'un', nameAr: 'الماعون', englishName: 'The Small Kindnesses', revelationType: 'Meccan', numberOfAyahs: 7, juz: [30] },
  { id: 'al-kawthar', number: 108, name: 'Al-Kawthar', nameAr: 'الكوثر', englishName: 'The Abundance', revelationType: 'Meccan', numberOfAyahs: 3, juz: [30] },
  { id: 'al-kafirun', number: 109, name: 'Al-Kafirun', nameAr: 'الكافرون', englishName: 'The Disbelievers', revelationType: 'Meccan', numberOfAyahs: 6, juz: [30] },
  { id: 'an-nasr', number: 110, name: 'An-Nasr', nameAr: 'النصر', englishName: 'The Divine Support', revelationType: 'Medinan', numberOfAyahs: 3, juz: [30] },
  { id: 'al-masad', number: 111, name: 'Al-Masad', nameAr: 'المسد', englishName: 'The Palm Fiber', revelationType: 'Meccan', numberOfAyahs: 5, juz: [30] },
  { id: 'al-ikhlas', number: 112, name: 'Al-Ikhlas', nameAr: 'الإخلاص', englishName: 'The Sincerity', revelationType: 'Meccan', numberOfAyahs: 4, juz: [30] },
  { id: 'al-falaq', number: 113, name: 'Al-Falaq', nameAr: 'الفلق', englishName: 'The Daybreak', revelationType: 'Meccan', numberOfAyahs: 5, juz: [30] },
  { id: 'an-nas', number: 114, name: 'An-Nas', nameAr: 'الناس', englishName: 'Mankind', revelationType: 'Meccan', numberOfAyahs: 6, juz: [30] },
];

// Generate unique Arabic description for each surah
function generateDescriptionAr(surah: Omit<SurahData, 'slug' | 'description' | 'descriptionAr'>): string {
  const typeAr = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
  const templates = [
    `سورة ${surah.nameAr} وهي سورة ${typeAr}، تحتوي على ${surah.numberOfAyahs} آية. استمع إلى تلاوات سورة ${surah.nameAr} بصوت أشهر القراء بجودة عالية.`,
    `سورة ${surah.nameAr} من القرآن الكريم، ترتيبها ${surah.number} في المصحف، وهي سورة ${typeAr} وعدد آياتها ${surah.numberOfAyahs}.`,
    `استمع إلى سورة ${surah.nameAr} بصوت أفضل القراء. السورة ${typeAr} وتقع في الجزء ${surah.juz[0]}. تلاوات قرآنية بجودة عالية.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

// Generate English description
function generateDescription(surah: Omit<SurahData, 'slug' | 'description' | 'descriptionAr'>): string {
  const type = surah.revelationType;
  return `Surah ${surah.name} (${surah.englishName}) - ${type} surah with ${surah.numberOfAyahs} verses. Listen to beautiful recitations by famous Quran reciters in high quality.`;
}

// Process raw surahs to add slugs and descriptions
export const SURAHS: SurahData[] = RAW_SURAHS.map(surah => ({
  ...surah,
  slug: generateSlug(surah.name),
  description: generateDescription(surah),
  descriptionAr: generateDescriptionAr(surah),
}));

// Export functions for SEO
export function getSurahById(id: string): SurahData | undefined {
  return SURAHS.find(s => s.id === id || s.slug === id);
}

export function getSurahByNumber(number: number): SurahData | undefined {
  return SURAHS.find(s => s.number === number);
}

export function getSurahBySlug(slug: string): SurahData | undefined {
  return SURAHS.find(s => s.slug === slug);
}

export function getMeccanSurahs(): SurahData[] {
  return SURAHS.filter(s => s.revelationType === 'Meccan');
}

export function getMedinanSurahs(): SurahData[] {
  return SURAHS.filter(s => s.revelationType === 'Medinan');
}

export function getSurahsByJuz(juz: number): SurahData[] {
  return SURAHS.filter(s => s.juz.includes(juz));
}

export function getAllSurahSlugs(): string[] {
  return SURAHS.map(s => s.slug);
}

export function getSurahCount(): number {
  return SURAHS.length;
}

// Get related surahs (same juz or adjacent)
export function getRelatedSurahs(surahNumber: number, limit: number = 6): SurahData[] {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return [];
  
  // Adjacent surahs
  const adjacent = SURAHS.filter(s => 
    Math.abs(s.number - surahNumber) <= 3 && s.number !== surahNumber
  );
  
  // Same juz
  const sameJuz = SURAHS.filter(s => 
    s.juz.some(j => surah.juz.includes(j)) && s.number !== surahNumber && !adjacent.includes(s)
  );
  
  return [...adjacent, ...sameJuz].slice(0, limit);
}
