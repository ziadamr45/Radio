// Quran types for the application

export interface Reciter {
  id: number;
  name: string;
  nameAr: string;
  nameEn: string;
  server: string;
  rewaya: string;
  count: number; // number of surahs available
  letter: string;
  sogh: string;
  totalAudioFiles: number;
}

export interface Surah {
  id: number;
  name: string;
  nameAr: string;
  nameEn: string;
  number: number;
  ayahs: number;
  type: 'meccan' | 'medinan';
  revelationOrder: number;
}

export interface QuranAudio {
  reciterId: number;
  reciterName: string;
  surahNumber: number;
  surahName: string;
  surahNameAr: string;
  audioUrl: string;
  duration?: number;
}

export interface QuranFavorite {
  type: 'reciter' | 'surah';
  id: number;
  name: string;
  nameAr: string;
  addedAt: number;
}

export interface QuranPlaybackState {
  currentAudio: QuranAudio | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export interface QuranProgress {
  reciterId: number | null;
  surahNumber: number;
  position: number;
  lastPlayedAt: number;
}

// Surah data - all 114 surahs
export const surahs: Surah[] = [
  { id: 1, name: 'الفاتحة', nameAr: 'الفاتحة', nameEn: 'Al-Fatihah', number: 1, ayahs: 7, type: 'meccan', revelationOrder: 5 },
  { id: 2, name: 'البقرة', nameAr: 'البقرة', nameEn: 'Al-Baqarah', number: 2, ayahs: 286, type: 'medinan', revelationOrder: 87 },
  { id: 3, name: 'آل عمران', nameAr: 'آل عمران', nameEn: 'Aal-Imran', number: 3, ayahs: 200, type: 'medinan', revelationOrder: 89 },
  { id: 4, name: 'النساء', nameAr: 'النساء', nameEn: 'An-Nisa', number: 4, ayahs: 176, type: 'medinan', revelationOrder: 92 },
  { id: 5, name: 'المائدة', nameAr: 'المائدة', nameEn: 'Al-Maidah', number: 5, ayahs: 120, type: 'medinan', revelationOrder: 112 },
  { id: 6, name: 'الأنعام', nameAr: 'الأنعام', nameEn: 'Al-Anam', number: 6, ayahs: 165, type: 'meccan', revelationOrder: 55 },
  { id: 7, name: 'الأعراف', nameAr: 'الأعراف', nameEn: 'Al-Araf', number: 7, ayahs: 206, type: 'meccan', revelationOrder: 39 },
  { id: 8, name: 'الأنفال', nameAr: 'الأنفال', nameEn: 'Al-Anfal', number: 8, ayahs: 75, type: 'medinan', revelationOrder: 88 },
  { id: 9, name: 'التوبة', nameAr: 'التوبة', nameEn: 'At-Tawbah', number: 9, ayahs: 129, type: 'medinan', revelationOrder: 113 },
  { id: 10, name: 'يونس', nameAr: 'يونس', nameEn: 'Yunus', number: 10, ayahs: 109, type: 'meccan', revelationOrder: 51 },
  { id: 11, name: 'هود', nameAr: 'هود', nameEn: 'Hud', number: 11, ayahs: 123, type: 'meccan', revelationOrder: 52 },
  { id: 12, name: 'يوسف', nameAr: 'يوسف', nameEn: 'Yusuf', number: 12, ayahs: 111, type: 'meccan', revelationOrder: 53 },
  { id: 13, name: 'الرعد', nameAr: 'الرعد', nameEn: 'Ar-Rad', number: 13, ayahs: 43, type: 'medinan', revelationOrder: 96 },
  { id: 14, name: 'إبراهيم', nameAr: 'إبراهيم', nameEn: 'Ibrahim', number: 14, ayahs: 52, type: 'meccan', revelationOrder: 72 },
  { id: 15, name: 'الحجر', nameAr: 'الحجر', nameEn: 'Al-Hijr', number: 15, ayahs: 99, type: 'meccan', revelationOrder: 54 },
  { id: 16, name: 'النحل', nameAr: 'النحل', nameEn: 'An-Nahl', number: 16, ayahs: 128, type: 'meccan', revelationOrder: 70 },
  { id: 17, name: 'الإسراء', nameAr: 'الإسراء', nameEn: 'Al-Isra', number: 17, ayahs: 111, type: 'meccan', revelationOrder: 50 },
  { id: 18, name: 'الكهف', nameAr: 'الكهف', nameEn: 'Al-Kahf', number: 18, ayahs: 110, type: 'meccan', revelationOrder: 69 },
  { id: 19, name: 'مريم', nameAr: 'مريم', nameEn: 'Maryam', number: 19, ayahs: 98, type: 'meccan', revelationOrder: 44 },
  { id: 20, name: 'طه', nameAr: 'طه', nameEn: 'Ta-Ha', number: 20, ayahs: 135, type: 'meccan', revelationOrder: 45 },
  { id: 21, name: 'الأنبياء', nameAr: 'الأنبياء', nameEn: 'Al-Anbiya', number: 21, ayahs: 112, type: 'meccan', revelationOrder: 73 },
  { id: 22, name: 'الحج', nameAr: 'الحج', nameEn: 'Al-Hajj', number: 22, ayahs: 78, type: 'medinan', revelationOrder: 103 },
  { id: 23, name: 'المؤمنون', nameAr: 'المؤمنون', nameEn: 'Al-Muminun', number: 23, ayahs: 118, type: 'meccan', revelationOrder: 74 },
  { id: 24, name: 'النور', nameAr: 'النور', nameEn: 'An-Nur', number: 24, ayahs: 64, type: 'medinan', revelationOrder: 102 },
  { id: 25, name: 'الفرقان', nameAr: 'الفرقان', nameEn: 'Al-Furqan', number: 25, ayahs: 77, type: 'meccan', revelationOrder: 42 },
  { id: 26, name: 'الشعراء', nameAr: 'الشعراء', nameEn: 'Ash-Shuara', number: 26, ayahs: 227, type: 'meccan', revelationOrder: 47 },
  { id: 27, name: 'النمل', nameAr: 'النمل', nameEn: 'An-Naml', number: 27, ayahs: 93, type: 'meccan', revelationOrder: 48 },
  { id: 28, name: 'القصص', nameAr: 'القصص', nameEn: 'Al-Qasas', number: 28, ayahs: 88, type: 'meccan', revelationOrder: 49 },
  { id: 29, name: 'العنكبوت', nameAr: 'العنكبوت', nameEn: 'Al-Ankabut', number: 29, ayahs: 69, type: 'meccan', revelationOrder: 85 },
  { id: 30, name: 'الروم', nameAr: 'الروم', nameEn: 'Ar-Rum', number: 30, ayahs: 60, type: 'meccan', revelationOrder: 84 },
  { id: 31, name: 'لقمان', nameAr: 'لقمان', nameEn: 'Luqman', number: 31, ayahs: 34, type: 'meccan', revelationOrder: 57 },
  { id: 32, name: 'السجدة', nameAr: 'السجدة', nameEn: 'As-Sajdah', number: 32, ayahs: 30, type: 'meccan', revelationOrder: 75 },
  { id: 33, name: 'الأحزاب', nameAr: 'الأحزاب', nameEn: 'Al-Ahzab', number: 33, ayahs: 73, type: 'medinan', revelationOrder: 90 },
  { id: 34, name: 'سبأ', nameAr: 'سبأ', nameEn: 'Saba', number: 34, ayahs: 54, type: 'meccan', revelationOrder: 58 },
  { id: 35, name: 'فاطر', nameAr: 'فاطر', nameEn: 'Fatir', number: 35, ayahs: 45, type: 'meccan', revelationOrder: 43 },
  { id: 36, name: 'يس', nameAr: 'يس', nameEn: 'Ya-Sin', number: 36, ayahs: 83, type: 'meccan', revelationOrder: 41 },
  { id: 37, name: 'الصافات', nameAr: 'الصافات', nameEn: 'As-Saffat', number: 37, ayahs: 182, type: 'meccan', revelationOrder: 56 },
  { id: 38, name: 'ص', nameAr: 'ص', nameEn: 'Sad', number: 38, ayahs: 88, type: 'meccan', revelationOrder: 38 },
  { id: 39, name: 'الزمر', nameAr: 'الزمر', nameEn: 'Az-Zumar', number: 39, ayahs: 75, type: 'meccan', revelationOrder: 59 },
  { id: 40, name: 'غافر', nameAr: 'غافر', nameEn: 'Ghafir', number: 40, ayahs: 85, type: 'meccan', revelationOrder: 60 },
  { id: 41, name: 'فصلت', nameAr: 'فصلت', nameEn: 'Fussilat', number: 41, ayahs: 54, type: 'meccan', revelationOrder: 61 },
  { id: 42, name: 'الشورى', nameAr: 'الشورى', nameEn: 'Ash-Shura', number: 42, ayahs: 53, type: 'meccan', revelationOrder: 62 },
  { id: 43, name: 'الزخرف', nameAr: 'الزخرف', nameEn: 'Az-Zukhruf', number: 43, ayahs: 89, type: 'meccan', revelationOrder: 63 },
  { id: 44, name: 'الدخان', nameAr: 'الدخان', nameEn: 'Ad-Dukhan', number: 44, ayahs: 59, type: 'meccan', revelationOrder: 64 },
  { id: 45, name: 'الجاثية', nameAr: 'الجاثية', nameEn: 'Al-Jathiyah', number: 45, ayahs: 37, type: 'meccan', revelationOrder: 65 },
  { id: 46, name: 'الأحقاف', nameAr: 'الأحقاف', nameEn: 'Al-Ahqaf', number: 46, ayahs: 35, type: 'meccan', revelationOrder: 66 },
  { id: 47, name: 'محمد', nameAr: 'محمد', nameEn: 'Muhammad', number: 47, ayahs: 38, type: 'medinan', revelationOrder: 95 },
  { id: 48, name: 'الفتح', nameAr: 'الفتح', nameEn: 'Al-Fath', number: 48, ayahs: 29, type: 'medinan', revelationOrder: 111 },
  { id: 49, name: 'الحجرات', nameAr: 'الحجرات', nameEn: 'Al-Hujurat', number: 49, ayahs: 18, type: 'medinan', revelationOrder: 106 },
  { id: 50, name: 'ق', nameAr: 'ق', nameEn: 'Qaf', number: 50, ayahs: 45, type: 'meccan', revelationOrder: 34 },
  { id: 51, name: 'الذاريات', nameAr: 'الذاريات', nameEn: 'Adh-Dhariyat', number: 51, ayahs: 60, type: 'meccan', revelationOrder: 67 },
  { id: 52, name: 'الطور', nameAr: 'الطور', nameEn: 'At-Tur', number: 52, ayahs: 49, type: 'meccan', revelationOrder: 76 },
  { id: 53, name: 'النجم', nameAr: 'النجم', nameEn: 'An-Najm', number: 53, ayahs: 62, type: 'meccan', revelationOrder: 23 },
  { id: 54, name: 'القمر', nameAr: 'القمر', nameEn: 'Al-Qamar', number: 54, ayahs: 55, type: 'meccan', revelationOrder: 37 },
  { id: 55, name: 'الرحمن', nameAr: 'الرحمن', nameEn: 'Ar-Rahman', number: 55, ayahs: 78, type: 'medinan', revelationOrder: 97 },
  { id: 56, name: 'الواقعة', nameAr: 'الواقعة', nameEn: 'Al-Waqiah', number: 56, ayahs: 96, type: 'meccan', revelationOrder: 46 },
  { id: 57, name: 'الحديد', nameAr: 'الحديد', nameEn: 'Al-Hadid', number: 57, ayahs: 29, type: 'medinan', revelationOrder: 94 },
  { id: 58, name: 'المجادلة', nameAr: 'المجادلة', nameEn: 'Al-Mujadilah', number: 58, ayahs: 22, type: 'medinan', revelationOrder: 105 },
  { id: 59, name: 'الحشر', nameAr: 'الحشر', nameEn: 'Al-Hashr', number: 59, ayahs: 24, type: 'medinan', revelationOrder: 101 },
  { id: 60, name: 'الممتحنة', nameAr: 'الممتحنة', nameEn: 'Al-Mumtahanah', number: 60, ayahs: 13, type: 'medinan', revelationOrder: 91 },
  { id: 61, name: 'الصف', nameAr: 'الصف', nameEn: 'As-Saff', number: 61, ayahs: 14, type: 'medinan', revelationOrder: 109 },
  { id: 62, name: 'الجمعة', nameAr: 'الجمعة', nameEn: 'Al-Jumuah', number: 62, ayahs: 11, type: 'medinan', revelationOrder: 110 },
  { id: 63, name: 'المنافقون', nameAr: 'المنافقون', nameEn: 'Al-Munafiqun', number: 63, ayahs: 11, type: 'medinan', revelationOrder: 104 },
  { id: 64, name: 'التغابن', nameAr: 'التغابن', nameEn: 'At-Taghabun', number: 64, ayahs: 18, type: 'medinan', revelationOrder: 108 },
  { id: 65, name: 'الطلاق', nameAr: 'الطلاق', nameEn: 'At-Talaq', number: 65, ayahs: 12, type: 'medinan', revelationOrder: 99 },
  { id: 66, name: 'التحريم', nameAr: 'التحريم', nameEn: 'At-Tahrim', number: 66, ayahs: 12, type: 'medinan', revelationOrder: 107 },
  { id: 67, name: 'الملك', nameAr: 'الملك', nameEn: 'Al-Mulk', number: 67, ayahs: 30, type: 'meccan', revelationOrder: 77 },
  { id: 68, name: 'القلم', nameAr: 'القلم', nameEn: 'Al-Qalam', number: 68, ayahs: 52, type: 'meccan', revelationOrder: 2 },
  { id: 69, name: 'الحاقة', nameAr: 'الحاقة', nameEn: 'Al-Haqqah', number: 69, ayahs: 52, type: 'meccan', revelationOrder: 78 },
  { id: 70, name: 'المعارج', nameAr: 'المعارج', nameEn: 'Al-Maarij', number: 70, ayahs: 44, type: 'meccan', revelationOrder: 79 },
  { id: 71, name: 'نوح', nameAr: 'نوح', nameEn: 'Nuh', number: 71, ayahs: 28, type: 'meccan', revelationOrder: 71 },
  { id: 72, name: 'الجن', nameAr: 'الجن', nameEn: 'Al-Jinn', number: 72, ayahs: 28, type: 'meccan', revelationOrder: 40 },
  { id: 73, name: 'المزمل', nameAr: 'المزمل', nameEn: 'Al-Muzzammil', number: 73, ayahs: 20, type: 'meccan', revelationOrder: 3 },
  { id: 74, name: 'المدثر', nameAr: 'المدثر', nameEn: 'Al-Muddaththir', number: 74, ayahs: 56, type: 'meccan', revelationOrder: 4 },
  { id: 75, name: 'القيامة', nameAr: 'القيامة', nameEn: 'Al-Qiyamah', number: 75, ayahs: 40, type: 'meccan', revelationOrder: 31 },
  { id: 76, name: 'الإنسان', nameAr: 'الإنسان', nameEn: 'Al-Insan', number: 76, ayahs: 31, type: 'medinan', revelationOrder: 98 },
  { id: 77, name: 'المرسلات', nameAr: 'المرسلات', nameEn: 'Al-Mursalat', number: 77, ayahs: 50, type: 'meccan', revelationOrder: 33 },
  { id: 78, name: 'النبأ', nameAr: 'النبأ', nameEn: 'An-Naba', number: 78, ayahs: 40, type: 'meccan', revelationOrder: 80 },
  { id: 79, name: 'النازعات', nameAr: 'النازعات', nameEn: 'An-Naziat', number: 79, ayahs: 46, type: 'meccan', revelationOrder: 81 },
  { id: 80, name: 'عبس', nameAr: 'عبس', nameEn: 'Abasa', number: 80, ayahs: 42, type: 'meccan', revelationOrder: 24 },
  { id: 81, name: 'التكوير', nameAr: 'التكوير', nameEn: 'At-Takwir', number: 81, ayahs: 29, type: 'meccan', revelationOrder: 7 },
  { id: 82, name: 'الانفطار', nameAr: 'الانفطار', nameEn: 'Al-Infitar', number: 82, ayahs: 19, type: 'meccan', revelationOrder: 82 },
  { id: 83, name: 'المطففين', nameAr: 'المطففين', nameEn: 'Al-Mutaffifin', number: 83, ayahs: 36, type: 'meccan', revelationOrder: 86 },
  { id: 84, name: 'الانشقاق', nameAr: 'الانشقاق', nameEn: 'Al-Inshiqaq', number: 84, ayahs: 25, type: 'meccan', revelationOrder: 83 },
  { id: 85, name: 'البروج', nameAr: 'البروج', nameEn: 'Al-Buruj', number: 85, ayahs: 22, type: 'meccan', revelationOrder: 27 },
  { id: 86, name: 'الطارق', nameAr: 'الطارق', nameEn: 'At-Tariq', number: 86, ayahs: 17, type: 'meccan', revelationOrder: 36 },
  { id: 87, name: 'الأعلى', nameAr: 'الأعلى', nameEn: 'Al-Ala', number: 87, ayahs: 19, type: 'meccan', revelationOrder: 8 },
  { id: 88, name: 'الغاشية', nameAr: 'الغاشية', nameEn: 'Al-Ghashiyah', number: 88, ayahs: 26, type: 'meccan', revelationOrder: 68 },
  { id: 89, name: 'الفجر', nameAr: 'الفجر', nameEn: 'Al-Fajr', number: 89, ayahs: 30, type: 'meccan', revelationOrder: 10 },
  { id: 90, name: 'البلد', nameAr: 'البلد', nameEn: 'Al-Balad', number: 90, ayahs: 20, type: 'meccan', revelationOrder: 35 },
  { id: 91, name: 'الشمس', nameAr: 'الشمس', nameEn: 'Ash-Shams', number: 91, ayahs: 15, type: 'meccan', revelationOrder: 26 },
  { id: 92, name: 'الليل', nameAr: 'الليل', nameEn: 'Al-Layl', number: 92, ayahs: 21, type: 'meccan', revelationOrder: 9 },
  { id: 93, name: 'الضحى', nameAr: 'الضحى', nameEn: 'Ad-Duhaa', number: 93, ayahs: 11, type: 'meccan', revelationOrder: 11 },
  { id: 94, name: 'الشرح', nameAr: 'الشرح', nameEn: 'Ash-Sharh', number: 94, ayahs: 8, type: 'meccan', revelationOrder: 12 },
  { id: 95, name: 'التين', nameAr: 'التين', nameEn: 'At-Tin', number: 95, ayahs: 8, type: 'meccan', revelationOrder: 28 },
  { id: 96, name: 'العلق', nameAr: 'العلق', nameEn: 'Al-Alaq', number: 96, ayahs: 19, type: 'meccan', revelationOrder: 1 },
  { id: 97, name: 'القدر', nameAr: 'القدر', nameEn: 'Al-Qadr', number: 97, ayahs: 5, type: 'meccan', revelationOrder: 25 },
  { id: 98, name: 'البينة', nameAr: 'البينة', nameEn: 'Al-Bayyinah', number: 98, ayahs: 8, type: 'medinan', revelationOrder: 100 },
  { id: 99, name: 'الزلزلة', nameAr: 'الزلزلة', nameEn: 'Az-Zalzalah', number: 99, ayahs: 8, type: 'medinan', revelationOrder: 93 },
  { id: 100, name: 'العاديات', nameAr: 'العاديات', nameEn: 'Al-Adiyat', number: 100, ayahs: 11, type: 'meccan', revelationOrder: 14 },
  { id: 101, name: 'القارعة', nameAr: 'القارعة', nameEn: 'Al-Qariah', number: 101, ayahs: 11, type: 'meccan', revelationOrder: 30 },
  { id: 102, name: 'التكاثر', nameAr: 'التكاثر', nameEn: 'At-Takathur', number: 102, ayahs: 8, type: 'meccan', revelationOrder: 16 },
  { id: 103, name: 'العصر', nameAr: 'العصر', nameEn: 'Al-Asr', number: 103, ayahs: 3, type: 'meccan', revelationOrder: 13 },
  { id: 104, name: 'الهمزة', nameAr: 'الهمزة', nameEn: 'Al-Humazah', number: 104, ayahs: 9, type: 'meccan', revelationOrder: 32 },
  { id: 105, name: 'الفيل', nameAr: 'الفيل', nameEn: 'Al-Fil', number: 105, ayahs: 5, type: 'meccan', revelationOrder: 19 },
  { id: 106, name: 'قريش', nameAr: 'قريش', nameEn: 'Quraysh', number: 106, ayahs: 4, type: 'meccan', revelationOrder: 29 },
  { id: 107, name: 'الماعون', nameAr: 'الماعون', nameEn: 'Al-Maun', number: 107, ayahs: 7, type: 'meccan', revelationOrder: 17 },
  { id: 108, name: 'الكوثر', nameAr: 'الكوثر', nameEn: 'Al-Kawthar', number: 108, ayahs: 3, type: 'meccan', revelationOrder: 15 },
  { id: 109, name: 'الكافرون', nameAr: 'الكافرون', nameEn: 'Al-Kafirun', number: 109, ayahs: 6, type: 'meccan', revelationOrder: 18 },
  { id: 110, name: 'النصر', nameAr: 'النصر', nameEn: 'An-Nasr', number: 110, ayahs: 3, type: 'medinan', revelationOrder: 114 },
  { id: 111, name: 'المسد', nameAr: 'المسد', nameEn: 'Al-Masad', number: 111, ayahs: 5, type: 'meccan', revelationOrder: 6 },
  { id: 112, name: 'الإخلاص', nameAr: 'الإخلاص', nameEn: 'Al-Ikhlas', number: 112, ayahs: 4, type: 'meccan', revelationOrder: 22 },
  { id: 113, name: 'الفلق', nameAr: 'الفلق', nameEn: 'Al-Falaq', number: 113, ayahs: 5, type: 'meccan', revelationOrder: 20 },
  { id: 114, name: 'الناس', nameAr: 'الناس', nameEn: 'An-Nas', number: 114, ayahs: 6, type: 'meccan', revelationOrder: 21 },
];

// Popular reciters list
export const popularReciters: Reciter[] = [
  { id: 1, name: 'عبد الباسط عبد الصمد', nameAr: 'عبد الباسط عبد الصمد', nameEn: 'Abdul Basit Abdul Samad', server: 'https://server7.mp3quran.net/basit', rewaya: 'حفص عن عاصم', count: 114, letter: 'ع', sogh: 'mujawwad', totalAudioFiles: 114 },
  { id: 2, name: 'ماهر المعيقلي', nameAr: 'ماهر المعيقلي', nameEn: 'Maher Al-Muaiqly', server: 'https://server7.mp3quran.net/maher', rewaya: 'حفص عن عاصم', count: 114, letter: 'م', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 3, name: 'محمد صديق المنشاوي', nameAr: 'محمد صديق المنشاوي', nameEn: 'Mohamed Siddiq Al-Minshawi', server: 'https://server7.mp3quran.net/minsh', rewaya: 'حفص عن عاصم', count: 114, letter: 'م', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 4, name: 'مشاري راشد العفاسي', nameAr: 'مشاري راشد العفاسي', nameEn: 'Mishary Rashid Al-Afasy', server: 'https://server7.mp3quran.net/afasy', rewaya: 'حفص عن عاصم', count: 114, letter: 'م', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 5, name: 'عبد الرحمن السديس', nameAr: 'عبد الرحمن السديس', nameEn: 'Abdurrahman As-Sudais', server: 'https://server7.mp3quran.net/sds', rewaya: 'حفص عن عاصم', count: 114, letter: 'ع', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 6, name: 'سعود الشريم', nameAr: 'سعود الشريم', nameEn: 'Saoud Al-Shuraim', server: 'https://server7.mp3quran.net/shur', rewaya: 'حفص عن عاصم', count: 114, letter: 'س', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 7, name: 'أبو بكر الشاطري', nameAr: 'أبو بكر الشاطري', nameEn: 'Abu Bakr Al-Shatri', server: 'https://server7.mp3quran.net/shatri', rewaya: 'حفص عن عاصم', count: 114, letter: 'أ', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 8, name: 'هاني الرفاعي', nameAr: 'هاني الرفاعي', nameEn: 'Hani Ar-Rifai', server: 'https://server7.mp3quran.net/hani', rewaya: 'حفص عن عاصم', count: 114, letter: 'ه', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 9, name: 'ياسر الدوسري', nameAr: 'ياسر الدوسري', nameEn: 'Yasser Ad-Dossary', server: 'https://server7.mp3quran.net/yasser', rewaya: 'حفص عن عاصم', count: 114, letter: 'ي', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 10, name: 'محمد أيوب', nameAr: 'محمد أيوب', nameEn: 'Mohammed Ayyoub', server: 'https://server7.mp3quran.net/ayyoub', rewaya: 'حفص عن عاصم', count: 114, letter: 'م', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 11, name: 'عبد الله عواد الجهني', nameAr: 'عبد الله عواد الجهني', nameEn: 'Abdullah Al-Juhany', server: 'https://server7.mp3quran.net/juhany', rewaya: 'حفص عن عاصم', count: 114, letter: 'ع', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 12, name: 'صلاح البدير', nameAr: 'صلاح البدير', nameEn: 'Salah Al-Budair', server: 'https://server7.mp3quran.net/budair', rewaya: 'حفص عن عاصم', count: 114, letter: 'ص', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 13, name: 'علي الحذيفي', nameAr: 'علي الحذيفي', nameEn: 'Ali Al-Hudhaify', server: 'https://server7.mp3quran.net/hud', rewaya: 'حفص عن عاصم', count: 114, letter: 'ع', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 14, name: 'عبد المحسن القاسم', nameAr: 'عبد المحسن القاسم', nameEn: 'Abdul Mohsen Al-Qasim', server: 'https://server7.mp3quran.net/qasm', rewaya: 'حفص عن عاصم', count: 114, letter: 'ع', sogh: 'murattal', totalAudioFiles: 114 },
  { id: 15, name: 'فارس عباد', nameAr: 'فارس عباد', nameEn: 'Fares Abbad', server: 'https://server7.mp3quran.net/afares', rewaya: 'حفص عن عاصم', count: 114, letter: 'ف', sogh: 'murattal', totalAudioFiles: 114 },
];
