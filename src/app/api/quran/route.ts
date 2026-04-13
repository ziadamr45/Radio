import { NextRequest, NextResponse } from 'next/server';

// Quranicaudio.com CDN - Verified working reciter folders
// Format: https://download.quranicaudio.com/quran/{folder}/{surah_padded}.mp3
// Surah numbers are padded to 3 digits: 001, 002, etc.

// Verified working reciters with correct folder names
const recitersData = [
  { id: '1', identifier: 'mishaari_raashid_al_3afaasee', name: 'مشاري راشد العفاسي', nameEn: 'Mishary Rashid Al-Afasy', style: 'مرتل' },
  { id: '2', identifier: 'abdul_basit_murattal', name: 'عبد الباسط عبد الصمد', nameEn: 'Abdul Basit Abdul Samad', style: 'مرتل' },
  { id: '3', identifier: 'minshawi_mujawwad', name: 'محمد صديق المنشاوي (مجود)', nameEn: 'Mohamed Siddiq Al-Minshawi (Mujawwad)', style: 'مجود' },
  { id: '4', identifier: 'abdullaah_3awwaad_al-juhaynee', name: 'عبد الله الجهني', nameEn: 'Abdullah Al-Juhany', style: 'مرتل' },
  { id: '5', identifier: 'abdullah_matroud', name: 'عبد الله المطرفي', nameEn: 'Abdullah Matroud', style: 'مرتل' },
  { id: '6', identifier: 'ali_jaber', name: 'علي جابر', nameEn: 'Ali Jaber', style: 'مرتل' },
  { id: '7', identifier: 'yasser_ad-dussary', name: 'ياسر الدوسري', nameEn: 'Yasser Ad-Dossary', style: 'مرتل' },
  { id: '8', identifier: 'aziz_alili', name: 'عزيز عليلي', nameEn: 'Aziz Alili', style: 'مرتل' },
  { id: '9', identifier: 'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/', name: 'إسلام صبحي', nameEn: 'Islam Sobhi', style: 'مرتل', server: 'mp3quran' },
];

// Surahs data with Arabic names
const surahsData = [
  { number: 1, name: 'الفاتحة', nameEn: 'Al-Fatihah', ayahs: 7, type: 'meccan' },
  { number: 2, name: 'البقرة', nameEn: 'Al-Baqarah', ayahs: 286, type: 'medinan' },
  { number: 3, name: 'آل عمران', nameEn: 'Aal-Imran', ayahs: 200, type: 'medinan' },
  { number: 4, name: 'النساء', nameEn: 'An-Nisa', ayahs: 176, type: 'medinan' },
  { number: 5, name: 'المائدة', nameEn: 'Al-Maidah', ayahs: 120, type: 'medinan' },
  { number: 6, name: 'الأنعام', nameEn: 'Al-Anam', ayahs: 165, type: 'meccan' },
  { number: 7, name: 'الأعراف', nameEn: 'Al-Araf', ayahs: 206, type: 'meccan' },
  { number: 8, name: 'الأنفال', nameEn: 'Al-Anfal', ayahs: 75, type: 'medinan' },
  { number: 9, name: 'التوبة', nameEn: 'At-Tawbah', ayahs: 129, type: 'medinan' },
  { number: 10, name: 'يونس', nameEn: 'Yunus', ayahs: 109, type: 'meccan' },
  { number: 11, name: 'هود', nameEn: 'Hud', ayahs: 123, type: 'meccan' },
  { number: 12, name: 'يوسف', nameEn: 'Yusuf', ayahs: 111, type: 'meccan' },
  { number: 13, name: 'الرعد', nameEn: 'Ar-Rad', ayahs: 43, type: 'medinan' },
  { number: 14, name: 'إبراهيم', nameEn: 'Ibrahim', ayahs: 52, type: 'meccan' },
  { number: 15, name: 'الحجر', nameEn: 'Al-Hijr', ayahs: 99, type: 'meccan' },
  { number: 16, name: 'النحل', nameEn: 'An-Nahl', ayahs: 128, type: 'meccan' },
  { number: 17, name: 'الإسراء', nameEn: 'Al-Isra', ayahs: 111, type: 'meccan' },
  { number: 18, name: 'الكهف', nameEn: 'Al-Kahf', ayahs: 110, type: 'meccan' },
  { number: 19, name: 'مريم', nameEn: 'Maryam', ayahs: 98, type: 'meccan' },
  { number: 20, name: 'طه', nameEn: 'Ta-Ha', ayahs: 135, type: 'meccan' },
  { number: 21, name: 'الأنبياء', nameEn: 'Al-Anbiya', ayahs: 112, type: 'meccan' },
  { number: 22, name: 'الحج', nameEn: 'Al-Hajj', ayahs: 78, type: 'medinan' },
  { number: 23, name: 'المؤمنون', nameEn: 'Al-Muminun', ayahs: 118, type: 'meccan' },
  { number: 24, name: 'النور', nameEn: 'An-Nur', ayahs: 64, type: 'medinan' },
  { number: 25, name: 'الفرقان', nameEn: 'Al-Furqan', ayahs: 77, type: 'meccan' },
  { number: 26, name: 'الشعراء', nameEn: 'Ash-Shuara', ayahs: 227, type: 'meccan' },
  { number: 27, name: 'النمل', nameEn: 'An-Naml', ayahs: 93, type: 'meccan' },
  { number: 28, name: 'القصص', nameEn: 'Al-Qasas', ayahs: 88, type: 'meccan' },
  { number: 29, name: 'العنكبوت', nameEn: 'Al-Ankabut', ayahs: 69, type: 'meccan' },
  { number: 30, name: 'الروم', nameEn: 'Ar-Rum', ayahs: 60, type: 'meccan' },
  { number: 31, name: 'لقمان', nameEn: 'Luqman', ayahs: 34, type: 'meccan' },
  { number: 32, name: 'السجدة', nameEn: 'As-Sajdah', ayahs: 30, type: 'meccan' },
  { number: 33, name: 'الأحزاب', nameEn: 'Al-Ahzab', ayahs: 73, type: 'medinan' },
  { number: 34, name: 'سبأ', nameEn: 'Saba', ayahs: 54, type: 'meccan' },
  { number: 35, name: 'فاطر', nameEn: 'Fatir', ayahs: 45, type: 'meccan' },
  { number: 36, name: 'يس', nameEn: 'Ya-Sin', ayahs: 83, type: 'meccan' },
  { number: 37, name: 'الصافات', nameEn: 'As-Saffat', ayahs: 182, type: 'meccan' },
  { number: 38, name: 'ص', nameEn: 'Sad', ayahs: 88, type: 'meccan' },
  { number: 39, name: 'الزمر', nameEn: 'Az-Zumar', ayahs: 75, type: 'meccan' },
  { number: 40, name: 'غافر', nameEn: 'Ghafir', ayahs: 85, type: 'meccan' },
  { number: 41, name: 'فصلت', nameEn: 'Fussilat', ayahs: 54, type: 'meccan' },
  { number: 42, name: 'الشورى', nameEn: 'Ash-Shura', ayahs: 53, type: 'meccan' },
  { number: 43, name: 'الزخرف', nameEn: 'Az-Zukhruf', ayahs: 89, type: 'meccan' },
  { number: 44, name: 'الدخان', nameEn: 'Ad-Dukhan', ayahs: 59, type: 'meccan' },
  { number: 45, name: 'الجاثية', nameEn: 'Al-Jathiyah', ayahs: 37, type: 'meccan' },
  { number: 46, name: 'الأحقاف', nameEn: 'Al-Ahqaf', ayahs: 35, type: 'meccan' },
  { number: 47, name: 'محمد', nameEn: 'Muhammad', ayahs: 38, type: 'medinan' },
  { number: 48, name: 'الفتح', nameEn: 'Al-Fath', ayahs: 29, type: 'medinan' },
  { number: 49, name: 'الحجرات', nameEn: 'Al-Hujurat', ayahs: 18, type: 'medinan' },
  { number: 50, name: 'ق', nameEn: 'Qaf', ayahs: 45, type: 'meccan' },
  { number: 51, name: 'الذاريات', nameEn: 'Adh-Dhariyat', ayahs: 60, type: 'meccan' },
  { number: 52, name: 'الطور', nameEn: 'At-Tur', ayahs: 49, type: 'meccan' },
  { number: 53, name: 'النجم', nameEn: 'An-Najm', ayahs: 62, type: 'meccan' },
  { number: 54, name: 'القمر', nameEn: 'Al-Qamar', ayahs: 55, type: 'meccan' },
  { number: 55, name: 'الرحمن', nameEn: 'Ar-Rahman', ayahs: 78, type: 'medinan' },
  { number: 56, name: 'الواقعة', nameEn: 'Al-Waqiah', ayahs: 96, type: 'meccan' },
  { number: 57, name: 'الحديد', nameEn: 'Al-Hadid', ayahs: 29, type: 'medinan' },
  { number: 58, name: 'المجادلة', nameEn: 'Al-Mujadilah', ayahs: 22, type: 'medinan' },
  { number: 59, name: 'الحشر', nameEn: 'Al-Hashr', ayahs: 24, type: 'medinan' },
  { number: 60, name: 'الممتحنة', nameEn: 'Al-Mumtahanah', ayahs: 13, type: 'medinan' },
  { number: 61, name: 'الصف', nameEn: 'As-Saff', ayahs: 14, type: 'medinan' },
  { number: 62, name: 'الجمعة', nameEn: 'Al-Jumuah', ayahs: 11, type: 'medinan' },
  { number: 63, name: 'المنافقون', nameEn: 'Al-Munafiqun', ayahs: 11, type: 'medinan' },
  { number: 64, name: 'التغابن', nameEn: 'At-Taghabun', ayahs: 18, type: 'medinan' },
  { number: 65, name: 'الطلاق', nameEn: 'At-Talaq', ayahs: 12, type: 'medinan' },
  { number: 66, name: 'التحريم', nameEn: 'At-Tahrim', ayahs: 12, type: 'medinan' },
  { number: 67, name: 'الملك', nameEn: 'Al-Mulk', ayahs: 30, type: 'meccan' },
  { number: 68, name: 'القلم', nameEn: 'Al-Qalam', ayahs: 52, type: 'meccan' },
  { number: 69, name: 'الحاقة', nameEn: 'Al-Haqqah', ayahs: 52, type: 'meccan' },
  { number: 70, name: 'المعارج', nameEn: 'Al-Maarij', ayahs: 44, type: 'meccan' },
  { number: 71, name: 'نوح', nameEn: 'Nuh', ayahs: 28, type: 'meccan' },
  { number: 72, name: 'الجن', nameEn: 'Al-Jinn', ayahs: 28, type: 'meccan' },
  { number: 73, name: 'المزمل', nameEn: 'Al-Muzzammil', ayahs: 20, type: 'meccan' },
  { number: 74, name: 'المدثر', nameEn: 'Al-Muddaththir', ayahs: 56, type: 'meccan' },
  { number: 75, name: 'القيامة', nameEn: 'Al-Qiyamah', ayahs: 40, type: 'meccan' },
  { number: 76, name: 'الإنسان', nameEn: 'Al-Insan', ayahs: 31, type: 'medinan' },
  { number: 77, name: 'المرسلات', nameEn: 'Al-Mursalat', ayahs: 50, type: 'meccan' },
  { number: 78, name: 'النبأ', nameEn: 'An-Naba', ayahs: 40, type: 'meccan' },
  { number: 79, name: 'النازعات', nameEn: 'An-Naziat', ayahs: 46, type: 'meccan' },
  { number: 80, name: 'عبس', nameEn: 'Abasa', ayahs: 42, type: 'meccan' },
  { number: 81, name: 'التكوير', nameEn: 'At-Takwir', ayahs: 29, type: 'meccan' },
  { number: 82, name: 'الانفطار', nameEn: 'Al-Infitar', ayahs: 19, type: 'meccan' },
  { number: 83, name: 'المطففين', nameEn: 'Al-Mutaffifin', ayahs: 36, type: 'meccan' },
  { number: 84, name: 'الانشقاق', nameEn: 'Al-Inshiqaq', ayahs: 25, type: 'meccan' },
  { number: 85, name: 'البروج', nameEn: 'Al-Buruj', ayahs: 22, type: 'meccan' },
  { number: 86, name: 'الطارق', nameEn: 'At-Tariq', ayahs: 17, type: 'meccan' },
  { number: 87, name: 'الأعلى', nameEn: 'Al-Ala', ayahs: 19, type: 'meccan' },
  { number: 88, name: 'الغاشية', nameEn: 'Al-Ghashiyah', ayahs: 26, type: 'meccan' },
  { number: 89, name: 'الفجر', nameEn: 'Al-Fajr', ayahs: 30, type: 'meccan' },
  { number: 90, name: 'البلد', nameEn: 'Al-Balad', ayahs: 20, type: 'meccan' },
  { number: 91, name: 'الشمس', nameEn: 'Ash-Shams', ayahs: 15, type: 'meccan' },
  { number: 92, name: 'الليل', nameEn: 'Al-Layl', ayahs: 21, type: 'meccan' },
  { number: 93, name: 'الضحى', nameEn: 'Ad-Duhaa', ayahs: 11, type: 'meccan' },
  { number: 94, name: 'الشرح', nameEn: 'Ash-Sharh', ayahs: 8, type: 'meccan' },
  { number: 95, name: 'التين', nameEn: 'At-Tin', ayahs: 8, type: 'meccan' },
  { number: 96, name: 'العلق', nameEn: 'Al-Alaq', ayahs: 19, type: 'meccan' },
  { number: 97, name: 'القدر', nameEn: 'Al-Qadr', ayahs: 5, type: 'meccan' },
  { number: 98, name: 'البينة', nameEn: 'Al-Bayyinah', ayahs: 8, type: 'medinan' },
  { number: 99, name: 'الزلزلة', nameEn: 'Az-Zalzalah', ayahs: 8, type: 'medinan' },
  { number: 100, name: 'العاديات', nameEn: 'Al-Adiyat', ayahs: 11, type: 'meccan' },
  { number: 101, name: 'القارعة', nameEn: 'Al-Qariah', ayahs: 11, type: 'meccan' },
  { number: 102, name: 'التكاثر', nameEn: 'At-Takathur', ayahs: 8, type: 'meccan' },
  { number: 103, name: 'العصر', nameEn: 'Al-Asr', ayahs: 3, type: 'meccan' },
  { number: 104, name: 'الهمزة', nameEn: 'Al-Humazah', ayahs: 9, type: 'meccan' },
  { number: 105, name: 'الفيل', nameEn: 'Al-Fil', ayahs: 5, type: 'meccan' },
  { number: 106, name: 'قريش', nameEn: 'Quraysh', ayahs: 4, type: 'meccan' },
  { number: 107, name: 'الماعون', nameEn: 'Al-Maun', ayahs: 7, type: 'meccan' },
  { number: 108, name: 'الكوثر', nameEn: 'Al-Kawthar', ayahs: 3, type: 'meccan' },
  { number: 109, name: 'الكافرون', nameEn: 'Al-Kafirun', ayahs: 6, type: 'meccan' },
  { number: 110, name: 'النصر', nameEn: 'An-Nasr', ayahs: 3, type: 'medinan' },
  { number: 111, name: 'المسد', nameEn: 'Al-Masad', ayahs: 5, type: 'meccan' },
  { number: 112, name: 'الإخلاص', nameEn: 'Al-Ikhlas', ayahs: 4, type: 'meccan' },
  { number: 113, name: 'الفلق', nameEn: 'Al-Falaq', ayahs: 5, type: 'meccan' },
  { number: 114, name: 'الناس', nameEn: 'An-Nas', ayahs: 6, type: 'meccan' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'reciters':
        return NextResponse.json({
          success: true,
          data: recitersData
        });

      case 'surahs':
        return NextResponse.json({
          success: true,
          data: surahsData
        });

      case 'audio': {
        const reciterId = searchParams.get('reciterId');
        const surahNumber = searchParams.get('surah');
        
        if (!reciterId || !surahNumber) {
          return NextResponse.json({
            success: false,
            error: 'Missing reciterId or surah parameter'
          }, { status: 400 });
        }

        const reciter = recitersData.find(r => r.id === reciterId);
        if (!reciter) {
          return NextResponse.json({
            success: false,
            error: 'Reciter not found'
          }, { status: 404 });
        }

        // Use Quranicaudio.com CDN or mp3quran.net if identifier is a full URL
        const surahPadded = surahNumber.padStart(3, '0');
        const audioUrl = reciter.identifier.startsWith('http')
          ? `${reciter.identifier}${surahPadded}.mp3`
          : `https://download.quranicaudio.com/quran/${reciter.identifier}/${surahPadded}.mp3`;

        return NextResponse.json({
          success: true,
          data: {
            reciterId,
            reciterName: reciter.name,
            reciterNameEn: reciter.nameEn,
            surahNumber: parseInt(surahNumber),
            surahName: surahsData[parseInt(surahNumber) - 1]?.name,
            audioUrl,
          }
        });
      }

      case 'surah_info': {
        const surahNumber = searchParams.get('surah');
        
        if (!surahNumber) {
          return NextResponse.json({
            success: false,
            error: 'Missing surah parameter'
          }, { status: 400 });
        }

        const surah = surahsData[parseInt(surahNumber) - 1];
        if (!surah) {
          return NextResponse.json({
            success: false,
            error: 'Surah not found'
          }, { status: 404 });
        }

        return NextResponse.json({
          success: true,
          data: surah
        });
      }

      default:
        return NextResponse.json({
          success: true,
          data: {
            reciters: recitersData,
            surahs: surahsData
          }
        });
    }
  } catch (error) {
    console.error('Quran API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
