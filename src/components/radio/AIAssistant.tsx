'use client';

import { useState, useEffect } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { useQuranStore } from '@/stores/quran-store';
import { translations } from '@/lib/translations';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, X, Bot, Radio, Volume2, Moon, Sun, Clock, Globe, 
  Heart, Trash2, Settings, Play, Pause, Search, ChevronDown,
  BookOpen, Music, Newspaper, Shield, Zap, Target, Coffee, Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { matchesSearch } from '@/lib/search-normalize';
import type { RadioStation } from '@/types/radio';
import { Send } from 'lucide-react';
import { VoiceButton } from '@/components/VoiceButton';

// ==================== الدول كلها ====================
const ALL_COUNTRIES = [
  // الدول العربية
  { code: 'EG', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬' },
  { code: 'SA', nameAr: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', nameAr: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪' },
  { code: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦' },
  { code: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿' },
  { code: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳' },
  { code: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴' },
  { code: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧' },
  { code: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', flag: '🇮🇶' },
  { code: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼' },
  { code: 'QA', nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦' },
  { code: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭' },
  { code: 'OM', nameAr: 'عمان', nameEn: 'Oman', flag: '🇴🇲' },
  { code: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸' },
  { code: 'SY', nameAr: 'سوريا', nameEn: 'Syria', flag: '🇸🇾' },
  { code: 'SD', nameAr: 'السودان', nameEn: 'Sudan', flag: '🇸🇩' },
  { code: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾' },
  { code: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪' },
  { code: 'MR', nameAr: 'موريتانيا', nameEn: 'Mauritania', flag: '🇲🇷' },
  // الدول الإسلامية
  { code: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷' },
  { code: 'IR', nameAr: 'إيران', nameEn: 'Iran', flag: '🇮🇷' },
  { code: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', flag: '🇮🇩' },
  { code: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾' },
  { code: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰' },
  { code: 'AF', nameAr: 'أفغانستان', nameEn: 'Afghanistan', flag: '🇦🇫' },
  { code: 'BD', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', flag: '🇧🇩' },
  // أوروبا
  { code: 'US', nameAr: 'أمريكا', nameEn: 'United States', flag: '🇺🇸' },
  { code: 'GB', nameAr: 'بريطانيا', nameEn: 'United Kingdom', flag: '🇬🇧' },
  { code: 'FR', nameAr: 'فرنسا', nameEn: 'France', flag: '🇫🇷' },
  { code: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪' },
  { code: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸' },
  { code: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', flag: '🇮🇹' },
  { code: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', nameAr: 'بلجيكا', nameEn: 'Belgium', flag: '🇧🇪' },
  { code: 'SE', nameAr: 'السويد', nameEn: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', nameAr: 'النرويج', nameEn: 'Norway', flag: '🇳🇴' },
  { code: 'DK', nameAr: 'الدنمارك', nameEn: 'Denmark', flag: '🇩🇰' },
  { code: 'FI', nameAr: 'فنلندا', nameEn: 'Finland', flag: '🇫🇮' },
  { code: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland', flag: '🇨🇭' },
  { code: 'AT', nameAr: 'النمسا', nameEn: 'Austria', flag: '🇦🇹' },
  { code: 'PL', nameAr: 'بولندا', nameEn: 'Poland', flag: '🇵🇱' },
  { code: 'PT', nameAr: 'البرتغال', nameEn: 'Portugal', flag: '🇵🇹' },
  { code: 'GR', nameAr: 'اليونان', nameEn: 'Greece', flag: '🇬🇷' },
  { code: 'CZ', nameAr: 'التشيك', nameEn: 'Czech Republic', flag: '🇨🇿' },
  { code: 'RO', nameAr: 'رومانيا', nameEn: 'Romania', flag: '🇷🇴' },
  { code: 'HU', nameAr: 'المجر', nameEn: 'Hungary', flag: '🇭🇺' },
  { code: 'UA', nameAr: 'أوكرانيا', nameEn: 'Ukraine', flag: '🇺🇦' },
  { code: 'RU', nameAr: 'روسيا', nameEn: 'Russia', flag: '🇷🇺' },
  { code: 'IE', nameAr: 'أيرلندا', nameEn: 'Ireland', flag: '🇮🇪' },
  { code: 'RS', nameAr: 'صربيا', nameEn: 'Serbia', flag: '🇷🇸' },
  { code: 'HR', nameAr: 'كرواتيا', nameEn: 'Croatia', flag: '🇭🇷' },
  { code: 'BG', nameAr: 'بلغاريا', nameEn: 'Bulgaria', flag: '🇧🇬' },
  { code: 'SK', nameAr: 'سلوفاكيا', nameEn: 'Slovakia', flag: '🇸🇰' },
  { code: 'SI', nameAr: 'سلوفينيا', nameEn: 'Slovenia', flag: '🇸🇮' },
  { code: 'LT', nameAr: 'ليتوانيا', nameEn: 'Lithuania', flag: '🇱🇹' },
  { code: 'LV', nameAr: 'لاتفيا', nameEn: 'Latvia', flag: '🇱🇻' },
  { code: 'EE', nameAr: 'إستونيا', nameEn: 'Estonia', flag: '🇪🇪' },
  // الأمريكتين
  { code: 'CA', nameAr: 'كندا', nameEn: 'Canada', flag: '🇨🇦' },
  { code: 'MX', nameAr: 'المكسيك', nameEn: 'Mexico', flag: '🇲🇽' },
  { code: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷' },
  { code: 'AR', nameAr: 'الأرجنتين', nameEn: 'Argentina', flag: '🇦🇷' },
  { code: 'CO', nameAr: 'كولومبيا', nameEn: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', nameAr: 'تشيلي', nameEn: 'Chile', flag: '🇨🇱' },
  { code: 'PE', nameAr: 'بيرو', nameEn: 'Peru', flag: '🇵🇪' },
  { code: 'CU', nameAr: 'كوبا', nameEn: 'Cuba', flag: '🇨🇺' },
  { code: 'VE', nameAr: 'فنزويلا', nameEn: 'Venezuela', flag: '🇻🇪' },
  { code: 'EC', nameAr: 'الإكوادور', nameEn: 'Ecuador', flag: '🇪🇨' },
  { code: 'BO', nameAr: 'بوليفيا', nameEn: 'Bolivia', flag: '🇧🇴' },
  { code: 'UY', nameAr: 'الأوروغواي', nameEn: 'Uruguay', flag: '🇺🇾' },
  { code: 'PY', nameAr: 'باراغواي', nameEn: 'Paraguay', flag: '🇵🇾' },
  // أفريقيا
  { code: 'NG', nameAr: 'نيجيريا', nameEn: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', flag: '🇿🇦' },
  { code: 'KE', nameAr: 'كينيا', nameEn: 'Kenya', flag: '🇰🇪' },
  { code: 'ET', nameAr: 'إثيوبيا', nameEn: 'Ethiopia', flag: '🇪🇹' },
  { code: 'SO', nameAr: 'الصومال', nameEn: 'Somalia', flag: '🇸🇴' },
  { code: 'DJ', nameAr: 'جيبوتي', nameEn: 'Djibouti', flag: '🇩🇯' },
  { code: 'KM', nameAr: 'جزر القمر', nameEn: 'Comoros', flag: '🇰🇲' },
  { code: 'TD', nameAr: 'تشاد', nameEn: 'Chad', flag: '🇹🇩' },
  { code: 'NE', nameAr: 'النيجر', nameEn: 'Niger', flag: '🇳🇪' },
  { code: 'ML', nameAr: 'مالي', nameEn: 'Mali', flag: '🇲🇱' },
  { code: 'SN', nameAr: 'السنغال', nameEn: 'Senegal', flag: '🇸🇳' },
  { code: 'GN', nameAr: 'غينيا', nameEn: 'Guinea', flag: '🇬🇳' },
  { code: 'GH', nameAr: 'غانا', nameEn: 'Ghana', flag: '🇬🇭' },
  { code: 'CI', nameAr: 'ساحل العاج', nameEn: 'Ivory Coast', flag: '🇨🇮' },
  { code: 'CM', nameAr: 'الكاميرون', nameEn: 'Cameroon', flag: '🇨🇲' },
  { code: 'CG', nameAr: 'الكونغو', nameEn: 'Congo', flag: '🇨🇬' },
  { code: 'CD', nameAr: 'الكونغو الديمقراطية', nameEn: 'DR Congo', flag: '🇨🇩' },
  { code: 'GA', nameAr: 'الغابون', nameEn: 'Gabon', flag: '🇬🇦' },
  { code: 'AO', nameAr: 'أنغولا', nameEn: 'Angola', flag: '🇦🇴' },
  { code: 'MZ', nameAr: 'موزمبيق', nameEn: 'Mozambique', flag: '🇲🇿' },
  { code: 'TZ', nameAr: 'تنزانيا', nameEn: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', nameAr: 'أوغندا', nameEn: 'Uganda', flag: '🇺🇬' },
  { code: 'RW', nameAr: 'رواندا', nameEn: 'Rwanda', flag: '🇷🇼' },
  { code: 'MG', nameAr: 'مدغشقر', nameEn: 'Madagascar', flag: '🇲🇬' },
  // آسيا
  { code: 'IN', nameAr: 'الهند', nameEn: 'India', flag: '🇮🇳' },
  { code: 'JP', nameAr: 'اليابان', nameEn: 'Japan', flag: '🇯🇵' },
  { code: 'CN', nameAr: 'الصين', nameEn: 'China', flag: '🇨🇳' },
  { code: 'KR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', nameAr: 'تايلاند', nameEn: 'Thailand', flag: '🇹🇭' },
  { code: 'PH', nameAr: 'الفلبين', nameEn: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', nameAr: 'فيتنام', nameEn: 'Vietnam', flag: '🇻🇳' },
  { code: 'MM', nameAr: 'ميانمار', nameEn: 'Myanmar', flag: '🇲🇲' },
  { code: 'KH', nameAr: 'كمبوديا', nameEn: 'Cambodia', flag: '🇰🇭' },
  { code: 'LK', nameAr: 'سريلانكا', nameEn: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'NP', nameAr: 'نيبال', nameEn: 'Nepal', flag: '🇳🇵' },
  { code: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', nameAr: 'نيوزيلندا', nameEn: 'New Zealand', flag: '🇳🇿' },
];

// ==================== القراء المشهورين ====================
// IDs must match the recitersData in /api/quran/route.ts
const POPULAR_RECITERS = [
  { id: '1', name: 'مشاري راشد العفاسي', nameEn: 'Al-Afasy' },
  { id: '2', name: 'عبد الباسط عبد الصمد', nameEn: 'Abdul Basit' },
  { id: '3', name: 'محمد صديق المنشاوي', nameEn: 'Al-Minshawi' },
  { id: '4', name: 'عبد الله الجهني', nameEn: 'Al-Juhany' },
  { id: '5', name: 'عبد الله المطرفي', nameEn: 'Matroud' },
  { id: '6', name: 'علي جابر', nameEn: 'Ali Jaber' },
  { id: '7', name: 'ياسر الدوسري', nameEn: 'Ad-Dossary' },
];

// ==================== الأوامر المتاحة ====================
const COMMANDS: Record<string, { 
  id: string; 
  icon: typeof Radio; 
  labelAr: string; 
  labelEn: string;
  category: string;
  needsInput?: boolean;
}> = {
  // أوامر التشغيل
  playQuran: { 
    id: 'playQuran', 
    icon: BookOpen, 
    labelAr: 'شغل قرآن كريم', 
    labelEn: 'Play Quran',
    category: 'playback'
  },
  playQuranSection: { 
    id: 'playQuranSection', 
    icon: BookOpen, 
    labelAr: 'اذهب للقرآن', 
    labelEn: 'Go to Quran',
    category: 'quran'
  },
  playIslamic: { 
    id: 'playIslamic', 
    icon: Shield, 
    labelAr: 'شغل محتوى إسلامي', 
    labelEn: 'Play Islamic content',
    category: 'playback'
  },
  playNasheed: { 
    id: 'playNasheed', 
    icon: Mic, 
    labelAr: 'شغل أناشيد', 
    labelEn: 'Play Nasheeds',
    category: 'playback'
  },
  playLectures: { 
    id: 'playLectures', 
    icon: Target, 
    labelAr: 'شغل دروس ومحاضرات', 
    labelEn: 'Play Lectures',
    category: 'playback'
  },
  playCalm: { 
    id: 'playCalm', 
    icon: Coffee, 
    labelAr: 'شغل محطات هادئة', 
    labelEn: 'Play calm stations',
    category: 'playback'
  },
  playMusic: { 
    id: 'playMusic', 
    icon: Music, 
    labelAr: 'شغل موسيقى', 
    labelEn: 'Play music',
    category: 'playback'
  },
  playNews: { 
    id: 'playNews', 
    icon: Newspaper, 
    labelAr: 'شغل أخبار', 
    labelEn: 'Play news',
    category: 'playback'
  },
  playCustom: { 
    id: 'playCustom', 
    icon: Search, 
    labelAr: 'ابحث عن محطة...', 
    labelEn: 'Search for station...',
    category: 'playback',
    needsInput: true
  },
  
  // أوامر التحكم
  stop: { 
    id: 'stop', 
    icon: Pause, 
    labelAr: 'إيقاف التشغيل', 
    labelEn: 'Stop playback',
    category: 'control'
  },
  mute: {
    id: 'mute',
    icon: Volume2,
    labelAr: 'كتم الصوت',
    labelEn: 'Mute volume',
    category: 'control'
  },
  unmute: {
    id: 'unmute',
    icon: Volume2,
    labelAr: 'إلغاء الكتم',
    labelEn: 'Unmute volume',
    category: 'control'
  },
  volumeUp: {
    id: 'volumeUp',
    icon: Volume2,
    labelAr: 'ارفع الصوت',
    labelEn: 'Volume up',
    category: 'control'
  },
  volumeDown: {
    id: 'volumeDown',
    icon: Volume2,
    labelAr: 'اخفض الصوت',
    labelEn: 'Volume down',
    category: 'control'
  },
  volume100: {
    id: 'volume100',
    icon: Volume2,
    labelAr: 'الصوت 100%',
    labelEn: 'Volume 100%',
    category: 'control'
  },
  volume50: {
    id: 'volume50',
    icon: Volume2,
    labelAr: 'الصوت 50%',
    labelEn: 'Volume 50%',
    category: 'control'
  },
  
  // أوامر الإعدادات
  darkMode: { 
    id: 'darkMode', 
    icon: Moon, 
    labelAr: 'الوضع الليلي', 
    labelEn: 'Dark mode',
    category: 'settings'
  },
  lightMode: { 
    id: 'lightMode', 
    icon: Sun, 
    labelAr: 'الوضع النهاري', 
    labelEn: 'Light mode',
    category: 'settings'
  },
  islamicMode: { 
    id: 'islamicMode', 
    icon: Shield, 
    labelAr: 'الوضع الإسلامي', 
    labelEn: 'Islamic mode',
    category: 'settings'
  },
  arabicLang: { 
    id: 'arabicLang', 
    icon: Globe, 
    labelAr: 'العربية 🇸🇦', 
    labelEn: 'Arabic 🇸🇦',
    category: 'settings'
  },
  englishLang: { 
    id: 'englishLang', 
    icon: Globe, 
    labelAr: 'English 🇬🇧', 
    labelEn: 'English 🇬🇧',
    category: 'settings'
  },
  
  // أوامر الدول - كل الدول (موجودة في قائمة منفصلة)
  // تم إزالتها من هنا لأنها موجودة في قائمة الدول المنسدلة
  
  // أوامر القرآن
  selectReciter: { 
    id: 'selectReciter', 
    icon: Mic, 
    labelAr: 'اختر قارئ...', 
    labelEn: 'Select reciter...',
    category: 'quran',
    needsInput: true
  },
  selectSurah: { 
    id: 'selectSurah', 
    icon: BookOpen, 
    labelAr: 'اختر سورة...', 
    labelEn: 'Select surah...',
    category: 'quran',
    needsInput: true
  },
  
  // أوامر المؤقت
  sleep15: { 
    id: 'sleep15', 
    icon: Clock, 
    labelAr: 'مؤقت نوم 15 دقيقة', 
    labelEn: 'Sleep timer 15 min',
    category: 'timer'
  },
  sleep30: { 
    id: 'sleep30', 
    icon: Clock, 
    labelAr: 'مؤقت نوم 30 دقيقة', 
    labelEn: 'Sleep timer 30 min',
    category: 'timer'
  },
  sleep60: { 
    id: 'sleep60', 
    icon: Clock, 
    labelAr: 'مؤقت نوم ساعة', 
    labelEn: 'Sleep timer 1 hour',
    category: 'timer'
  },
  cancelSleep: { 
    id: 'cancelSleep', 
    icon: Clock, 
    labelAr: 'إلغاء مؤقت النوم', 
    labelEn: 'Cancel sleep timer',
    category: 'timer'
  },
  
  // أوامر أخرى
  favorites: { 
    id: 'favorites', 
    icon: Heart, 
    labelAr: 'المفضلة', 
    labelEn: 'Favorites',
    category: 'other'
  },
  clearHistory: { 
    id: 'clearHistory', 
    icon: Trash2, 
    labelAr: 'مسح السجل', 
    labelEn: 'Clear history',
    category: 'other'
  },
};

// أسماء التصنيفات
const CATEGORIES: Record<string, { labelAr: string; labelEn: string }> = {
  playback: { labelAr: '🎵 التشغيل', labelEn: '🎵 Playback' },
  quran: { labelAr: '📖 القرآن الكريم', labelEn: '📖 Quran' },
  control: { labelAr: '🎮 التحكم', labelEn: '🎮 Control' },
  settings: { labelAr: '⚙️ الإعدادات', labelEn: '⚙️ Settings' },
  timer: { labelAr: '⏰ مؤقت النوم', labelEn: '⏰ Sleep Timer' },
  other: { labelAr: '📦 أخرى', labelEn: '📦 Other' },
};

export function AIAssistant() {
  const {
    language,
    aiChatOpen,
    setAIChatOpen,
    setCurrentStation,
    setIsPlaying,
    setTheme,
    theme,
    setVolume,
    volume,
    setSleepTimer,
    clearSleepTimer,
    sleepTimerActive,
    setSelectedCountry,
    setIslamicMode,
    islamicMode,
    clearHistory,
    favorites,
    setLanguage,
  } = useRadioStore();

  const {
    reciters,
    surahs,
    selectedReciter,
    setReciters,
    setSurahs,
    setSelectedReciter,
    setSelectedSurah,
    playAudio,
    pauseAudio,
    resumeAudio,
    currentAudio,
    isPlaying: isPlayingQuran,
  } = useQuranStore();

  const [messages, setMessages] = useState<Array<{role: 'assistant' | 'user'; content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [customStationDialog, setCustomStationDialog] = useState(false);
  const [customStationName, setCustomStationName] = useState('');
  const [quranDialog, setQuranDialog] = useState(false);
  const [quranDialogType, setQuranDialogType] = useState<'reciter' | 'surah'>('reciter');
  const [showCountries, setShowCountries] = useState(false);
  const [surahSearchQuery, setSurahSearchQuery] = useState('');
  const [freeTextInput, setFreeTextInput] = useState('');

  const t = translations[language];
  const isArabic = language === 'ar';

  // جلب بيانات القرآن
  useEffect(() => {
    if (reciters.length === 0) {
      fetch('/api/quran?action=reciters')
        .then(res => res.json())
        .then(data => {
          if (data.success) setReciters(data.data);
        });
    }
    if (surahs.length === 0) {
      fetch('/api/quran?action=surahs')
        .then(res => res.json())
        .then(data => {
          if (data.success) setSurahs(data.data);
        });
    }
  }, [reciters.length, surahs.length, setReciters, setSurahs]);

  // رسالة الترحيب
  const welcomeMessage = isArabic 
    ? 'مرحباً! 👋 أنا "سمع"، مساعدك الذكي في تطبيق اسمع راديو.\n\nأقدر أساعدك في:\n• تشغيل المحطات الإذاعية\n• تشغيل القرآن الكريم\n• التحكم في الصوت والإعدادات\n• تغيير الدولة\n\nاختار أي أمر من الأسفل!'
    : 'Hello! 👋 I\'m "Sama", your smart assistant in Esmaa Radio app.\n\nI can help you with:\n• Playing radio stations\n• Playing Quran\n• Controlling volume and settings\n• Changing country\n\nChoose any command below!';

  // تنفيذ الأمر
  const executeCommand = async (commandId: string, inputValue?: string) => {
    setIsLoading(true);
    
    // إضافة رسالة المستخدم
    const command = COMMANDS[commandId];
    if (command) {
      const userMsg = inputValue 
        ? (isArabic ? `ابحث عن: ${inputValue}` : `Search for: ${inputValue}`)
        : (isArabic ? command.labelAr : command.labelEn);
      setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    }

    let response = '';
    let stations: RadioStation[] = [];

    try {
      // تنفيذ الأوامر محلياً
      switch (commandId) {
        case 'playQuran':
          // شغل محطة قرآن من الراديو
          stations = await fetchStationsByTagGlobal('quran', 'quran');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic 
              ? `✅ تم تشغيل ${station.name}\n📖 قرآن كريم من الراديو\n\n💡 لو عايز تلاوة MP3 بقارئ معين، اضغط على زر "القرآن" فوق`
              : `✅ Now playing ${station.name}\n📖 Quran radio\n\n💡 For MP3 recitation, tap "Quran" button above`;
          } else {
            response = isArabic ? '❌ لم أجد محطات قرآن شغالة حالياً' : '❌ No working Quran stations found';
          }
          break;

        case 'playQuranSection':
          // Open Quran selection dialog for reciter and surah selection
          setQuranDialogType('reciter');
          setQuranDialog(true);
          response = isArabic 
            ? '📖 اختر القارئ والسورة التي تريد الاستماع إليها'
            : '📖 Select the reciter and surah you want to listen to';
          break;

        case 'playIslamic':
          stations = await fetchStationsByTagGlobal('islamic', 'islamic');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic 
              ? `✅ تم تشغيل ${station.name}\n🕌 محتوى إسلامي` 
              : `✅ Now playing ${station.name}\n🕌 Islamic content`;
          } else {
            response = isArabic ? '❌ لم أجد محطات إسلامية شغالة حالياً' : '❌ No working Islamic stations found';
          }
          break;

        case 'playNasheed':
          stations = await fetchStationsByTagGlobal('nasheed', 'nasheed');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic 
              ? `✅ تم تشغيل ${station.name}\n🎤 أناشيد` 
              : `✅ Now playing ${station.name}\n🎤 Nasheeds`;
          } else {
            response = isArabic ? '❌ لم أجد محطات أناشيد شغالة حالياً' : '❌ No working Nasheed stations found';
          }
          break;

        case 'playLectures':
          stations = await fetchStationsByTagGlobal('lectures', 'lectures');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic 
              ? `✅ تم تشغيل ${station.name}\n📚 دروس ومحاضرات` 
              : `✅ Now playing ${station.name}\n📚 Lectures`;
          } else {
            response = isArabic ? '❌ لم أجد محطات دروس شغالة حالياً' : '❌ No working lecture stations found';
          }
          break;

        case 'playCalm':
          stations = await fetchStationsByTagGlobal('calm', 'calm');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic ? `✅ تم تشغيل ${station.name} 🎵` : `✅ Now playing ${station.name} 🎵`;
          } else {
            response = isArabic ? '❌ لم أجد محطات هادئة شغالة' : '❌ No calm stations found';
          }
          break;

        case 'playMusic':
          stations = await fetchStationsByTagGlobal('music', 'music');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic ? `✅ تم تشغيل ${station.name}` : `✅ Now playing ${station.name}`;
          } else {
            response = isArabic ? '❌ لم أجد محطات موسيقى شغالة' : '❌ No working music stations found';
          }
          break;

        case 'playNews':
          stations = await fetchStationsByTagGlobal('news', 'news');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic ? `✅ تم تشغيل ${station.name}` : `✅ Now playing ${station.name}`;
          } else {
            response = isArabic ? '❌ لم أجد محطات أخبار شغالة' : '❌ No working news stations found';
          }
          break;

        case 'playCustom':
          if (inputValue) {
            stations = await searchStationsEnhanced(inputValue);
            
            if (stations.length > 0) {
              const station = stations[0];
              const streamUrl = station.url_resolved || station.url;
              setCurrentStation({ ...station, streamUrl });
              setIsPlaying(true);
              response = isArabic 
                ? `✅ تم تشغيل ${station.name}\n\n🏷️ ${station.tags || 'محطة راديو'}\n🌐 ${station.country || ''}`
                : `✅ Now playing ${station.name}\n\n🏷️ ${station.tags || 'Radio station'}\n🌐 ${station.country || ''}`;
            } else {
              response = isArabic 
                ? `❌ لم أجد "${inputValue}"\n\n💡 جرب:\n• اسم المحطة بالإنجليزي\n• اسم القارئ للقرآن\n• نوع الموسيقى (pop, classic)`
                : `❌ No results for "${inputValue}"\n\n💡 Try:\n• Station name in English\n• Reciter name for Quran\n• Music genre (pop, classic)`;
            }
          }
          break;

        case 'selectReciter':
          setQuranDialogType('reciter');
          setQuranDialog(true);
          response = isArabic ? '🎤 اختر القارئ من القائمة' : '🎤 Select a reciter from the list';
          break;

        case 'selectSurah':
          if (!selectedReciter) {
            response = isArabic ? '⚠️ اختر قارئ أولاً' : '⚠️ Please select a reciter first';
          } else {
            setQuranDialogType('surah');
            setQuranDialog(true);
            response = isArabic ? '📖 اختر السورة من القائمة' : '📖 Select a surah from the list';
          }
          break;

        case 'stop':
          // أوقف الراديو والقرآن معاً
          setIsPlaying(false);
          window.dispatchEvent(new CustomEvent('pauseRadioFromCard'));
          if (isPlayingQuran) pauseAudio();
          response = isArabic ? '⏹️ تم إيقاف التشغيل' : '⏹️ Playback stopped';
          break;

        case 'pause':
          // أوقف الراديو والقرآن معاً (مثل stop)
          setIsPlaying(false);
          window.dispatchEvent(new CustomEvent('pauseRadioFromCard'));
          if (isPlayingQuran) pauseAudio();
          response = isArabic ? '⏸️ تم الإيقاف المؤقت' : '⏸️ Paused';
          break;

        case 'resume':
          // استكمل القرآن لو شغال، ولا الراديو
          if (currentAudio) {
            resumeAudio();
            response = isArabic ? '▶️ تم استكمال التشغيل' : '▶️ Resumed';
          } else {
            setIsPlaying(true);
            window.dispatchEvent(new CustomEvent('playRadioFromCard'));
            response = isArabic ? '▶️ تم استكمال التشغيل' : '▶️ Resumed';
          }
          break;

        case 'mute':
          setVolume(0);
          response = isArabic ? '🔇 تم كتم الصوت' : '🔇 Volume muted';
          break;

        case 'volume100':
          setVolume(1.0);
          response = isArabic ? '🔊 الصوت 100%' : '🔊 Volume set to 100%';
          break;

        case 'volume50':
          setVolume(0.5);
          response = isArabic ? '🔉 الصوت 50%' : '🔉 Volume set to 50%';
          break;

        case 'unmute':
          setVolume(1.0);
          response = isArabic ? '🔊 تم إلغاء الكتم - الصوت 100%' : '🔊 Volume unmuted - 100%';
          break;

        case 'volumeUp':
          const newVolUp = Math.min(1, volume + 0.2);
          setVolume(newVolUp);
          response = isArabic ? `🔊 تم رفع الصوت - الآن ${Math.round(newVolUp * 100)}%` : `🔊 Volume increased - now ${Math.round(newVolUp * 100)}%`;
          break;

        case 'volumeDown':
          const newVolDown = Math.max(0, volume - 0.2);
          setVolume(newVolDown);
          response = isArabic ? `🔉 تم خفض الصوت - الآن ${Math.round(newVolDown * 100)}%` : `🔉 Volume decreased - now ${Math.round(newVolDown * 100)}%`;
          break;

        case 'darkMode':
          setTheme('dark');
          response = isArabic ? '🌙 تم تفعيل الوضع الليلي' : '🌙 Dark mode activated';
          break;

        case 'lightMode':
          setTheme('light');
          response = isArabic ? '☀️ تم تفعيل الوضع النهاري' : '☀️ Light mode activated';
          break;

        case 'islamicMode': {
          const newIslamicMode = !islamicMode;
          setIslamicMode(newIslamicMode);
          response = isArabic 
            ? (newIslamicMode ? '🕌 تم تفعيل الوضع الإسلامي' : '🕌 تم إيقاف الوضع الإسلامي')
            : (newIslamicMode ? '🕌 Islamic mode enabled' : '🕌 Islamic mode disabled');
          break;
        }

        case 'arabicLang':
          setLanguage('ar');
          response = '🇸🇦 تم تغيير اللغة إلى العربية';
          break;

        case 'englishLang':
          setLanguage('en');
          response = '🇬🇧 Language changed to English';
          break;

        // معالجة الدول
        default:
          if (commandId.startsWith('country_')) {
            const countryCode = commandId.replace('country_', '');
            const country = ALL_COUNTRIES.find(c => c.code === countryCode);
            if (country) {
              setSelectedCountry(countryCode);
              response = isArabic 
                ? `${country.flag} تم اختيار ${country.nameAr}` 
                : `${country.flag} ${country.nameEn} selected`;
            }
          } else if (commandId === 'sleep15') {
            setSleepTimer(15);
            response = isArabic ? '⏰ مؤقت النوم 15 دقيقة' : '⏰ Sleep timer set to 15 minutes';
          } else if (commandId === 'sleep30') {
            setSleepTimer(30);
            response = isArabic ? '⏰ مؤقت النوم 30 دقيقة' : '⏰ Sleep timer set to 30 minutes';
          } else if (commandId === 'sleep60') {
            setSleepTimer(60);
            response = isArabic ? '⏰ مؤقت النوم ساعة' : '⏰ Sleep timer set to 1 hour';
          } else if (commandId === 'cancelSleep') {
            clearSleepTimer();
            response = isArabic ? '❌ تم إلغاء مؤقت النوم' : '❌ Sleep timer cancelled';
          } else if (commandId === 'favorites') {
            if (favorites.length > 0) {
              const favNames = favorites.slice(0, 5).map(f => f.name).join('\n• ');
              response = isArabic 
                ? `❤️ المفضلة (${favorites.length}):\n• ${favNames}`
                : `❤️ Favorites (${favorites.length}):\n• ${favNames}`;
            } else {
              response = isArabic ? '❤️ لا توجد محطات في المفضلة' : '❤️ No favorite stations';
            }
          } else if (commandId === 'clearHistory') {
            clearHistory();
            response = isArabic ? '🗑️ تم مسح السجل' : '🗑️ History cleared';
          } else {
            response = isArabic ? '❓ أمر غير معروف' : '❓ Unknown command';
          }
      }
    } catch (error) {
      console.error('Command error:', error);
      response = isArabic ? '❌ حدث خطأ، جرب مرة أخرى' : '❌ An error occurred, please try again';
    }

    // إضافة رد المساعد
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  // ==================== نظام البحث الذكي ====================

  const API_SERVERS = [
    'https://de1.api.radio-browser.info/json',
    'https://at1.api.radio-browser.info/json',
    'https://nl1.api.radio-browser.info/json',
  ];

  // الدول المفضلة للبحث (مصر أولاً) — تسلسل ثابت: مصر ← عربي ← عالمي
  const SEARCH_PRIORITY_COUNTRIES = ['EG', 'SA', 'AE', 'MA', 'DZ', 'TN', 'JO', 'LB', 'IQ', 'KW', 'QA', 'BH', 'OM', 'PS', 'SY', 'SD', 'LY', 'YE', 'MR'];
  const EGYPT_FIRST = 'EG'; // مصر دايماً أول واحدة

  // كلمات مفتاحية عربية للتعرف على الأوامر
  const ARABIC_COMMAND_PATTERNS: Array<{ pattern: RegExp; commandId: string; extractParam?: boolean }> = [
    // أوامر القرآن
    { pattern: /(?:شغل|شغّل|عيز|عاوز|ابحث|دور)\s+(?:لي\s+)?(?:ال)?قر[اآ]ن/i, commandId: 'playQuran' },
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:محطات?\s+)?(?:ال)?قر[اآ]ن\s+(?:الكريم)?/i, commandId: 'playQuran' },
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:سورة|آيات|تلاوة)/i, commandId: 'playQuranSection' },
    { pattern: /(?:اهرب|روح|اذهب|افتح)\s+(?:لل)?قر[اآ]ن/i, commandId: 'playQuranSection' },
    // أوامر المحتوى الإسلامي
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:محتوى|برامج|محطات?)\s+(?:إسلامي|اسلامي|ديني)/i, commandId: 'playIslamic' },
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:شيوخ|علماء|دعاة)/i, commandId: 'playIslamic' },
    // أوامر الأناشيد
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:أناشيد|اناشيد|نشيد|أنشودة|منشدين)/i, commandId: 'playNasheed' },
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:طفل|أطفال)\s+(?:إسلامي|اسلامي|أناشيد)/i, commandId: 'playNasheed' },
    // أوامر الدروس والمحاضرات
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:دروس|محاضرات|درس|محاضرة|خطب|خطبة|مواعظ)/i, commandId: 'playLectures' },
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:فتاوى|فتوى|حلقات?\s+علمية)/i, commandId: 'playLectures' },
    // أوامر أخرى
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:محطات?\s+)?هاد[يء]/i, commandId: 'playCalm' },
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:موسيقى|اغاني|أغاني|songs)/i, commandId: 'playMusic' },
    { pattern: /(?:شغل|شغّل|عيز|عاوز)\s+(?:لي\s+)?(?:أخبار|اخبار|news)/i, commandId: 'playNews' },
    // أوامر التحكم (الترتيب مهم - الأكثر تحديداً الأول)
    { pattern: /(?:إيقاف\s+مؤقت|ايقاف مؤقت|وقف\s+مؤقت|pause)/i, commandId: 'pause' },
    { pattern: /(?:اكتم|كتم|اسكت|صامت|sakte|mute)/i, commandId: 'mute' },
    { pattern: /(?:وقف|اوقف|قفل|إيقاف التشغيل|سكت|stop)/i, commandId: 'stop' },
    { pattern: /(?:كمل|استكمل|كمّل|resume|continue)/i, commandId: 'resume' },
    { pattern: /(?:ارفع|زود|كبر)\s+(?:ال)?صوت/i, commandId: 'volumeUp' },
    { pattern: /(?:قلل|خفض|نقص)\s+(?:ال)?صوت/i, commandId: 'volumeDown' },
    { pattern: /(?:الوضع\s+)?(?:الليلي|داكن|dark)/i, commandId: 'darkMode' },
    { pattern: /(?:الوضع\s+)?(?:النهاري|فاتح|light)/i, commandId: 'lightMode' },
    // أوامر عامة
    { pattern: /(?:مساعدة|help|اوامر|الأوامر|ايه\s+تقدر)/i, commandId: 'help' },
    { pattern: /(?:المفضلة|فيفوريت|favorites)/i, commandId: 'favorites' },
    { pattern: /(?:مؤقت|نوم|sleep|timer)/i, commandId: 'sleep30' },
  ];

  // التعرف على أوامر الدول
  const ARABIC_COUNTRY_PATTERNS = [
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:مصر(?:ي)?|مصري)/i, code: 'EG' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:السعودية|سعودي)/i, code: 'SA' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:الإمارات|امارات|اماراتي)/i, code: 'AE' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:المغرب|مغربي)/i, code: 'MA' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:الجزائر|جزائري)/i, code: 'DZ' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:تونس|تونسي)/i, code: 'TN' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:الأردن|اردني)/i, code: 'JO' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:لبنان|لبناني)/i, code: 'LB' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:العراق|عراقي)/i, code: 'IQ' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:الكويت|كويتي)/i, code: 'KW' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:فلسطين|فلسطيني)/i, code: 'PS' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:سوريا|سوري)/i, code: 'SY' },
    { pattern: /(?:محطات?|راديو|إذاعة)\s+(?:السودان|سوداني)/i, code: 'SD' },
  ];

  // خريطة التصنيفات - Tags بتاعة Radio Browser بالإنجليزي فقط (API مش بيفهم عربي)
  const CATEGORY_TAG_MAP: Record<string, string[]> = {
    quran: ['quran', 'koran', 'islam', 'recitation', 'tilawa'],
    islamic: ['islamic', 'islam', 'quran', 'nasheed', 'arabic islamic', 'muslim'],
    nasheed: ['nasheed', 'anashid', 'nashid', 'anasheed', 'islamic songs'],
    lectures: ['lecture', 'islamic', 'talk', 'speech', 'khutba', 'dars', 'durus'],
    calm: ['ambient', 'relax', 'relaxation', 'calm', 'meditation', 'nature sounds', 'sleep', 'chill', 'lounge', 'easy listening', 'new age', 'spa'],
    music: ['pop', 'arabic', 'hits', 'top40', 'music', 'song'],
    news: ['news', 'talk', 'information'],
    egypt: ['egypt', 'masr', 'arabic', 'egyptian'],
    saudi: ['saudi', 'arabia', 'arabic', 'ksa'],
  };

  // التحقق من أن stream URL شغال
  const validateStream = async (url: string): Promise<boolean> => {
    if (!url) return false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return true;
    } catch {
      return false;
    }
  };

  // ==================== تحقق عميق من التصنيفات ====================
  // بيحقق إن المحطة فعلاً بتاع التصنيف المطلوب عن طريق فحص كل الـ tags
  const verifyStationTags = (station: any, category: string): boolean => {
    const tags = (station.tags || '').toLowerCase();
    const name = (station.name || '').toLowerCase();
    const combined = `${tags} ${name}`;

    switch (category) {
      case 'quran':
        return ['quran', 'قرآن', 'koran', 'recitation', 'tilawa', 'تلاوة', 'quran kareem', 'قران'].some(kw => combined.includes(kw));
      case 'islamic':
        return ['islamic', 'islam', 'إسلام', 'muslim', 'قرآن', 'quran', 'nasheed', 'أناشيد', 'anashid', 'ديني', 'religious', 'dini'].some(kw => combined.includes(kw));
      case 'nasheed':
        return ['nasheed', 'أناشيد', 'anashid', 'nashid', 'anasheed', 'islamic songs', 'أنشودة', 'منشد', 'munshid', 'أناشيد أطفال', 'children nasheed'].some(kw => combined.includes(kw));
      case 'lectures':
        return ['lecture', 'lectures', 'محاضرة', 'محاضرات', 'talk', 'speech', 'خطبة', 'خطب', 'khutba', 'dars', 'دروس', 'durus', 'فتوى', 'فتاوى', 'fatwa'].some(kw => combined.includes(kw));
      case 'calm':
        return ['calm', 'relax', 'relaxing', 'ambient', 'chill', 'meditation', 'sleep', 'lounge', 'spa', 'nature sounds', 'new age', 'easy listening', 'هادئ', 'استرخاء'].some(kw => combined.includes(kw));
      case 'music':
        return ['music', 'موسيقى', 'pop', 'rock', 'jazz', 'classic', 'hits', 'top40', 'song', 'أغاني', 'اغاني', 'arabic music'].some(kw => combined.includes(kw));
      case 'news':
        return ['news', 'أخبار', 'اخبار', 'talk', 'information', 'عاجل', 'breaking'].some(kw => combined.includes(kw));
      default:
        return true; // لو مش معروف التصنيف، نقبل أي حاجة
    }
  };

  // ترتيب النتائج حسب مطابقة التصنيف (الأقرب للتصنيف المطلوب الأول)
  const sortByTagRelevance = (stations: any[], category: string): any[] => {
    if (!category || category === 'custom') return stations;

    return stations.sort((a, b) => {
      const aTags = (a.tags || '').toLowerCase();
      const bTags = (b.tags || '').toLowerCase();
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();

      // عدد الكلمات المفتاحية المتطابقة في a
      const categoryKeywords = getCategoryKeywords(category);
      const aScore = categoryKeywords.filter(kw => (aTags + ' ' + aName).includes(kw)).length;
      const bScore = categoryKeywords.filter(kw => (bTags + ' ' + bName).includes(kw)).length;

      return bScore - aScore; // الأعلى أول
    });
  };

  // كلمات مفتاحية لكل تصنيف
  const getCategoryKeywords = (category: string): string[] => {
    const map: Record<string, string[]> = {
      quran: ['quran', 'قرآن', 'koran', 'recitation', 'tilawa', 'تلاوة', 'قران'],
      islamic: ['islamic', 'islam', 'إسلام', 'muslim', 'quran', 'قرآن', 'nasheed', 'أناشيد', 'ديني'],
      nasheed: ['nasheed', 'أناشيد', 'anashid', 'nashid', 'أنشودة', 'منشد', 'islamic songs'],
      lectures: ['lecture', 'محاضرة', 'talk', 'speech', 'خطبة', 'khutba', 'dars', 'دروس', 'فتوى'],
      calm: ['calm', 'relax', 'ambient', 'chill', 'meditation', 'sleep', 'lounge', 'spa', 'nature sounds'],
      music: ['music', 'موسيقى', 'pop', 'rock', 'jazz', 'hits', 'top40', 'أغاني'],
      news: ['news', 'أخبار', 'اخبار', 'talk', 'information', 'عاجل'],
    };
    return map[category] || [];
  };

  // التعرف على الأمر من النص الحر
  const detectCommandFromText = (text: string): { commandId: string; param?: string } | null => {
    // أول شئ: نشوف لو فيه أمر دولة
    for (const cp of ARABIC_COUNTRY_PATTERNS) {
      const match = text.match(cp.pattern);
      if (match) {
        return { commandId: `country_${cp.code}` };
      }
    }

    // ثانياً: نشوف لو فيه أمر معروف
    for (const cmd of ARABIC_COMMAND_PATTERNS) {
      const match = text.match(cmd.pattern);
      if (match) {
        return { commandId: cmd.commandId };
      }
    }

    // ثالثاً: لو فيه "شغل" أو "ابحث" + اسم شيء = بحث مخصص
    const playPattern = text.match(/(?:شغل|شغّل|عيز|عاوز|ابحث|دور)\s+(?:لي\s+)?(?:على?\s+)?(.+)/i);
    if (playPattern && playPattern[1]) {
      const param = playPattern[1].trim();
      return { commandId: 'playCustom', param };
    }

    // رابعاً: لو النص طويل كفاية وغير معروف = بحث عن محطة بالاسم
    if (text.length > 2) {
      return { commandId: 'playCustom', param: text.trim() };
    }

    return null;
  };

  // معالجة النص الحر من المستخدم
  // كلمات التحية العربية والإنجليزية
  const GREETING_PATTERNS = [
    // تحيات إسلامية
    /السلام عليكم/i, /سلام عليكم/i, /وعليكم السلام/i, /سلام/i,
    /السلام عليكم ورحمة الله/i, /السلام عليكم ورحمة الله وبركاته/i,
    /وعليكم السلام ورحمة الله/i, /assalamu alaykum/i, /salaam/i,
    // تحيات عامة عربية
    /اهلا/i, /أهلا/i, /اهلاً/i, /أهلاً/i, /مرحبا/i, /مرحباً/i, /مرحب/i,
    /اهلا بك/i, /أهلا بك/i, /اهلاً بك/i, /أهلاً بك/i,
    /اهلا وسهلا/i, /أهلا وسهلا/i, /حياك/i, /حياك الله/i, /هلا/i, /هلا بك/i,
    /يا هلا/i, /نورت/i, /أهلاً وسهلاً/i, /سلامات/i, /تحية/i,
    /صباح الخير/i, /مساء الخير/i, /صباح النور/i, /مساء النور/i,
    /كيف حالك/i, /كيفك/i, /ازيك/i, /إزيك/i, /ازيك عامل إيه/i, /عامل إيه/i,
    /ايش اخبارك/i, /شخبارك/i, /شلونك/i, /عامل ايه/i, /عايز ايه/i,
    /شخبارك حبيبي/i, /حبيبي/i,
    // تحيات إنجليزية
    /hello/i, /hi/i, /hey/i, /greetings/i, /good morning/i, /good evening/i,
    /good afternoon/i, /how are you/i, /how do you do/i, /what'?s up/i, /whats up/i,
    /welcome/i, /nice to meet you/i, /greet/i, /salaam/i,
  ];

  // التحقق إن النص تحية
  const isGreeting = (text: string): boolean => {
    const normalized = text.trim();
    if (normalized.length > 50) return false; // تحية قصيرة بس
    return GREETING_PATTERNS.some(pattern => pattern.test(normalized));
  };

  // رد التحية العشوائي
  const getGreetingResponse = (): string => {
    const arabicGreetings = [
      'وعليكم السلام ورحمة الله وبركاته! 😊\n\nأنا "سمع"، مساعدك الذكي في تطبيق اسمع راديو 📻\n\nأقدر أساعدك في:\n• تشغيل القرآن الكريم 📖\n• تشغيل محطات راديو من أي دولة 🌍\n• تشغيل أناشيد ومحتوى إسلامي 🕌\n• التحكم في الصوت والإعدادات ⚙️\n\nقولي عايز إيه!',
      'أهلاً وسهلاً! 👋 أهلا بيك في اسمع راديو 📻\n\nأنا هنا عشان أساعدك في:\n• تشغيل محطات راديو من حول العالم 🎵\n• الاستماع للقرآن الكريم بأصوات أشهر القراء 📖\n• تشغيل أناشيد ودروس ومحاضرات 🎤\n• تغيير الإعدادات واللغة ⚙️\n\nإيه اللي تقدر أساعدك فيه؟',
      'حياك الله! 🌟 أهلا بيكم في اسمع راديو\n\nأنا مساعدك الذكي، تقدر تسألني:\n• "شغل قرآن كريم"\n• "شغل محطات مصرية"\n• "شغل أناشيد"\n• "شغل محتوى إسلامي"\n• أو أي محطة راديو تاني! 🎵',
      'وعليكم السلام! 😄 نورت المكان\n\nأنا "سمع" - مساعدك الذكي في اسمع راديو 📻\n\nقولي عايز تستمع لإيه وأنا أشغلك على طول!\n• قرآن كريم 📖\n• راديو من أي دولة 🌍\n• أناشيد إسلامية 🎤\n• موسيقى وأخبار 🎵',
      'مرحباً! 🎉 نورت اسمع راديو\n\nأقدر أساعدك في حاجات كتير:\n• تشغيل القرآن الكريم بأصوات مختلفة 📖\n• البحث عن محطات راديو وتشغيلها 🎵\n• تشغيل أناشيد ودروس إسلامية 🕌\n• التحكم في الإعدادات والصوت ⚙️\n\nقولي عايز إيه!',
    ];
    
    const englishGreetings = [
      'Hello! 👋 Welcome to Esmaa Radio 📻\n\nI\'m your smart assistant. I can help you with:\n• Playing Quran recitations 📖\n• Playing radio stations from around the world 🌍\n• Playing nasheeds and Islamic content 🕌\n• Controlling volume and settings ⚙️\n\nWhat can I help you with?',
      'Hi there! 😊 Nice to have you here!\n\nI can help you play:\n• Quran with different reciters 📖\n• Radio stations from any country 🎵\n• Nasheeds and Islamic lectures 🎤\n• Control settings and volume ⚙️\n\nJust tell me what you\'d like!',
      'Greetings! 🌟 Welcome to Esmaa Radio\n\nI\'m your smart assistant. Try asking me:\n• "Play Quran"\n• "Play Egyptian stations"\n• "Play nasheeds"\n• Or any station name! 🎵',
    ];

    if (isArabic) {
      return arabicGreetings[Math.floor(Math.random() * arabicGreetings.length)];
    }
    return englishGreetings[Math.floor(Math.random() * englishGreetings.length)];
  };

  // التحقق إن النص خارج نطاق الراديو
  const isOffTopic = (text: string): boolean => {
    const normalized = text.trim().toLowerCase();
    if (normalized.length < 3) return false;
    
    // كلمات تخص الراديو والقرآن - لو موجودة يبقى الموضوع مناسب
    const radioKeywords = [
      'قرآن', 'قران', 'راديو', 'محطة', 'شغل', 'إيقاف', 'صوت', 'مؤقت', 'نوم',
      'أنشودة', 'أناشيد', 'نشيد', 'إسلامي', 'ديني', 'قرآن', 'تلاوة', 'سورة',
      'دروس', 'محاضرة', 'خطبة', 'مواعظ', 'فتوى', 'أخبار', 'موسيقى', 'اغاني', 'أغاني',
      'دولة', 'مصر', 'السعودية', 'الإمارات', 'المغرب', 'الجزائر', 'تونس',
      'العراق', 'الأردن', 'لبنان', 'الكويت', 'قطر', 'البحرين', 'عمان', 'فلسطين',
      'سوريا', 'السودان', 'تركيا', 'أمريكا', 'بريطانيا', 'فرنسا', 'ألمانيا',
      'الوضع الليلي', 'الوضع النهاري', 'داكن', 'فاتح', 'العربية', 'english',
      'المفضلة', 'سجل', 'مساعدة', 'help', 'إعدادات', 'quran', 'radio',
      'play', 'stop', 'pause', 'volume', 'mute', 'dark', 'light', 'sleep',
      'nasheed', 'islamic', 'news', 'music', 'calm', 'reciter', 'surah',
    ];
    
    const hasRadioKeyword = radioKeywords.some(kw => normalized.includes(kw));
    if (hasRadioKeyword) return false;
    
    // لو السؤال عن المساعد نفسه
    const aboutAssistant = [
      'مين انت', 'مين أنت', 'إنت مين', 'انت مين', 'ازيك', 'إزيك',
      'ايه انت', 'ايه أنت', 'who are you', 'what are you', 'what can you do',
      'اهلا', 'أهلا', 'مرحبا', 'hello', 'hi',
    ];
    if (aboutAssistant.some(kw => normalized.includes(kw))) return false;
    
    return true;
  };

  // رد لما الموضوع خارج نطاق الراديو
  const getOffTopicResponse = (): string => {
    if (isArabic) {
      return 'بكل احترام 🙏، أنا مساعد متخصص في الراديو والقرآن الكريم في تطبيق اسمع راديو 📻\n\nمقدرش أساعدك في الموضوع ده، بس تقدر تسألني عن:\n• تشغيل القرآن الكريم 📖\n• تشغيل محطات راديو 🎵\n• تشغيل أناشيد ومحتوى إسلامي 🕌\n• التحكم في الإعدادات ⚙️\n\nقولي عايز إيه وأنا أساعدك! 😊';
    }
    return 'Sorry! 🙏 I\'m a specialized assistant for radio and Quran in Esmaa Radio 📻\n\nI can\'t help with that, but I can help you with:\n• Playing Quran recitations 📖\n• Playing radio stations 🎵\n• Playing nasheeds and Islamic content 🕌\n• Controlling settings ⚙️\n\nWhat can I help you with? 😊';
  };

  const handleFreeText = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const detected = detectCommandFromText(text);
      
      if (detected) {
        if (detected.commandId === 'playCustom' && detected.param) {
          // بحث ذكي عن المحطة
          const stations = await searchStationsEnhanced(detected.param);
          
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            const response = isArabic 
              ? `✅ تم تشغيل ${station.name}

🏷️ ${station.tags || 'محطة راديو'}\n🌐 ${station.country || ''}`
              : `✅ Now playing ${station.name}\n\n🏷️ ${station.tags || 'Radio station'}\n🌐 ${station.country || ''}`;
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          } else {
            const response = isArabic 
              ? `❌ لم أجد "${detected.param}"\n\n💡 جرب:\n• اسم المحطة بالإنجليزي\n• اسم القارئ للقرآن\n• نوع المحتوى (قرآن، أناشيد، موسيقى)`
              : `❌ No results for "${detected.param}"\n\n💡 Try:\n• Station name in English\n• Reciter name for Quran\n• Content type (quran, nasheed, music)`;
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
          }
        } else if (detected.commandId === 'help') {
          setMessages(prev => [...prev, { role: 'assistant', content: helpMessage }]);
        } else {
          // تنفيذ الأمر المعروف
          await executeCommandDirect(detected.commandId);
        }
      } else {
        // أول: تشيك لو تحية
        if (isGreeting(text)) {
          const response = getGreetingResponse();
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }
        // ثانياً: تشيك لو الموضوع خارج نطاق الراديو
        else if (isOffTopic(text)) {
          const response = getOffTopicResponse();
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }
        // ثالثاً: لو ملقيناش حاجة = رد ذكي عادي
        else {
          const response = isArabic
          ? `🤔 مش فاهم قصدك بالظبط\n\nجرب تكتب:\n• "شغل قرآن كريم"\n• "شغل أناشيد"\n• "شغل محتوى إسلامي"\n• "شغل دروس ومحاضرات"\n• "شغل محطات مصرية"\n• أو اسم أي محطة تاني 🎵`
          : `🤔 I didn't quite understand\n\nTry:\n• "Play Quran"\n• "Play nasheeds"\n• "Play Islamic content"\n• "Play lectures"\n• "Play Egyptian stations"\n• Or any station name 🎵`;
          setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }
      }
    } catch (error) {
      console.error('Free text error:', error);
      const response = isArabic ? '❌ حدث خطأ، جرب مرة أخرى' : '❌ An error occurred, please try again';
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }

    setIsLoading(false);
  };

  // تنفيذ الأمر مباشرة بدون إضافة رسالة المستخدم (لأن handleFreeText بيعملها)
  const executeCommandDirect = async (commandId: string) => {
    let response = '';
    let stations: RadioStation[] = [];

    try {
      switch (commandId) {
        case 'playQuran':
          // شغل محطة قرآن من الراديو
          stations = await fetchStationsByTagGlobal('quran', 'quran');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic 
              ? `✅ تم تشغيل ${station.name}\n📖 قرآن كريم من الراديو`
              : `✅ Now playing ${station.name}\n📖 Quran radio`;
          } else {
            response = isArabic ? '❌ لم أجد محطات قرآن شغالة حالياً' : '❌ No working Quran stations found';
          }
          break;
        case 'playQuranSection':
          setQuranDialogType('reciter');
          setQuranDialog(true);
          response = isArabic 
            ? '📖 اختر القارئ والسورة التي تريد الاستماع إليها'
            : '📖 Select the reciter and surah you want to listen to';
          break;
        case 'playIslamic':
          stations = await fetchStationsByTagGlobal('islamic', 'islamic');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic 
              ? `✅ تم تشغيل ${station.name}\n🕌 محتوى إسلامي`
              : `✅ Now playing ${station.name}\n🕌 Islamic content`; 
          } else {
            response = isArabic ? '❌ لم أجد محطات إسلامية شغالة حالياً' : '❌ No working Islamic stations found';
          }
          break;
        case 'playNasheed':
          stations = await fetchStationsByTagGlobal('nasheed', 'nasheed');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic 
              ? `✅ تم تشغيل ${station.name}\n🎤 أناشيد` 
              : `✅ Now playing ${station.name}\n🎤 Nasheeds`; 
          } else {
            response = isArabic ? '❌ لم أجد محطات أناشيد شغالة حالياً' : '❌ No working Nasheed stations found';
          }
          break;
        case 'playLectures':
          stations = await fetchStationsByTagGlobal('lectures', 'lectures');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic 
              ? `✅ تم تشغيل ${station.name}\n📚 دروس ومحاضرات` 
              : `✅ Now playing ${station.name}\n📚 Lectures`; 
          } else {
            response = isArabic ? '❌ لم أجد محطات دروس شغالة حالياً' : '❌ No working lecture stations found';
          }
          break;
        case 'playCalm':
          stations = await fetchStationsByTagGlobal('calm', 'calm');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic ? `✅ تم تشغيل ${station.name} 🎵` : `✅ Now playing ${station.name} 🎵`;
          } else {
            response = isArabic ? '❌ لم أجد محطات هادئة شغالة' : '❌ No calm stations found';
          }
          break;
        case 'playMusic':
          stations = await fetchStationsByTagGlobal('music', 'music');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic ? `✅ تم تشغيل ${station.name}` : `✅ Now playing ${station.name}`;
          } else {
            response = isArabic ? '❌ لم أجد محطات موسيقى شغالة' : '❌ No working music stations found';
          }
          break;
        case 'playNews':
          stations = await fetchStationsByTagGlobal('news', 'news');
          if (stations.length > 0) {
            const station = stations[0];
            const streamUrl = station.url_resolved || station.url;
            setCurrentStation({ ...station, streamUrl });
            setIsPlaying(true);
            response = isArabic ? `✅ تم تشغيل ${station.name}` : `✅ Now playing ${station.name}`;
          } else {
            response = isArabic ? '❌ لم أجد محطات أخبار شغالة' : '❌ No working news stations found';
          }
          break;
        case 'stop':
          setIsPlaying(false);
          window.dispatchEvent(new CustomEvent('pauseRadioFromCard'));
          if (isPlayingQuran) pauseAudio();
          response = isArabic ? '⏹️ تم إيقاف التشغيل' : '⏹️ Playback stopped';
          break;
        case 'pause':
          // أوقف الراديو والقرآن معاً (مثل stop)
          setIsPlaying(false);
          window.dispatchEvent(new CustomEvent('pauseRadioFromCard'));
          if (isPlayingQuran) pauseAudio();
          response = isArabic ? '⏸️ تم الإيقاف المؤقت' : '⏸️ Paused';
          break;
        case 'resume':
          if (currentAudio) {
            resumeAudio();
            response = isArabic ? '▶️ تم استكمال التشغيل' : '▶️ Resumed';
          } else {
            setIsPlaying(true);
            window.dispatchEvent(new CustomEvent('playRadioFromCard'));
            response = isArabic ? '▶️ تم استكمال التشغيل' : '▶️ Resumed';
          }
          break;
        case 'mute':
          setVolume(0);
          response = isArabic ? '🔇 تم كتم الصوت' : '🔇 Volume muted';
          break;
        case 'volumeUp': {
          const v = Math.min(1, volume + 0.2);
          setVolume(v);
          response = isArabic ? `🔊 تم رفع الصوت - الآن ${Math.round(v * 100)}%` : `🔊 Volume increased - now ${Math.round(v * 100)}%`;
          break;
        }
        case 'volumeDown': {
          const v = Math.max(0, volume - 0.2);
          setVolume(v);
          response = isArabic ? `🔉 تم خفض الصوت - الآن ${Math.round(v * 100)}%` : `🔉 Volume decreased - now ${Math.round(v * 100)}%`;
          break;
        }
        case 'darkMode':
          setTheme('dark');
          response = isArabic ? '🌙 تم تفعيل الوضع الليلي' : '🌙 Dark mode activated';
          break;
        case 'lightMode':
          setTheme('light');
          response = isArabic ? '☀️ تم تفعيل الوضع النهاري' : '☀️ Light mode activated';
          break;
        case 'islamicMode': {
          const newIslamicMode = !islamicMode;
          setIslamicMode(newIslamicMode);
          response = isArabic 
            ? (newIslamicMode ? '🕌 تم تفعيل الوضع الإسلامي' : '🕌 تم إيقاف الوضع الإسلامي')
            : (newIslamicMode ? '🕌 Islamic mode enabled' : '🕌 Islamic mode disabled');
          break;
        }
        case 'arabicLang':
          setLanguage('ar');
          response = '🇸🇦 تم تغيير اللغة إلى العربية';
          break;
        case 'englishLang':
          setLanguage('en');
          response = '🇬🇧 Language changed to English';
          break;
        case 'mute':
          setVolume(0);
          response = isArabic ? '🔇 تم كتم الصوت' : '🔇 Volume muted';
          break;
        case 'unmute':
          setVolume(1.0);
          response = isArabic ? '🔊 تم إلغاء الكتم - الصوت 100%' : '🔊 Volume unmuted - 100%';
          break;
        case 'volume100':
          setVolume(1.0);
          response = isArabic ? '🔊 الصوت 100%' : '🔊 Volume set to 100%';
          break;
        case 'volume50':
          setVolume(0.5);
          response = isArabic ? '🔉 الصوت 50%' : '🔉 Volume set to 50%';
          break;
        case 'sleep15':
          setSleepTimer(15);
          response = isArabic ? '⏰ مؤقت النوم 15 دقيقة' : '⏰ Sleep timer set to 15 minutes';
          break;
        case 'sleep30':
          setSleepTimer(30);
          response = isArabic ? '⏰ مؤقت النوم 30 دقيقة' : '⏰ Sleep timer set to 30 minutes';
          break;
        case 'sleep60':
          setSleepTimer(60);
          response = isArabic ? '⏰ مؤقت النوم ساعة' : '⏰ Sleep timer set to 1 hour';
          break;
        case 'cancelSleep':
          clearSleepTimer();
          response = isArabic ? '❌ تم إلغاء مؤقت النوم' : '❌ Sleep timer cancelled';
          break;
        case 'favorites':
          if (favorites.length > 0) {
            const favNames = favorites.slice(0, 5).map(f => f.name).join('\n• ');
            response = isArabic 
              ? `❤️ المفضلة (${favorites.length}):\n• ${favNames}`
              : `❤️ Favorites (${favorites.length}):\n• ${favNames}`;
          } else {
            response = isArabic ? '❤️ لا توجد محطات في المفضلة' : '❤️ No favorite stations';
          }
          break;
        case 'clearHistory':
          clearHistory();
          response = isArabic ? '🗑️ تم مسح السجل' : '🗑️ History cleared';
          break;
        default:
          if (commandId.startsWith('country_')) {
            const countryCode = commandId.replace('country_', '');
            const country = ALL_COUNTRIES.find(c => c.code === countryCode);
            if (country) {
              setSelectedCountry(countryCode);
              response = isArabic 
                ? `${country.flag} تم اختيار ${country.nameAr}\n\n📡 جاري تحميل محطات ${country.nameAr}...`
                : `${country.flag} ${country.nameEn} selected`; 
            }
          } else {
            response = isArabic ? '❓ أمر غير معروف' : '❓ Unknown command';
          }
      }
    } catch (error) {
      console.error('Command error:', error);
      response = isArabic ? '❌ حدث خطأ، جرب مرة أخرى' : '❌ An error occurred, please try again';
    }

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
  };

  // بحث ذكي عن محطات شغالة — تسلسل ثابت: مصر ← عربي ← عالمي
  // category: التصنيف للتحقق العميق من الـ tags
  const smartFetchStations = async (tags: string[], options?: {
    country?: string;
    nameContains?: string;
    limit?: number;
    onlyWorking?: boolean;
    category?: string; // للتحقق العميق من التصنيفات
  }): Promise<RadioStation[]> => {
    const limit = options?.limit || 20;
    const category = options?.category || '';
    const allResults: RadioStation[] = [];

    // التسلسل الثابت: مصر ← الدول العربية ← عالمي (بدون فلتر دولة)
    const searchTiers: Array<{ code?: string; langFilter?: string }> = [
      // المرحلة 1: مصر (أولوية قصوى)
      { code: EGYPT_FIRST, langFilter: 'ar' },
      { code: EGYPT_FIRST }, // من غير فلتر لغة
    ];

    // المرحلة 2: باقي الدول العربية
    for (const cc of SEARCH_PRIORITY_COUNTRIES.filter(c => c !== EGYPT_FIRST)) {
      searchTiers.push({ code: cc, langFilter: 'ar' });
    }

    // المرحلة 3: عالمي (بدون فلتر دولة)
    if (!options?.country) {
      searchTiers.push({ langFilter: 'ar' });
      searchTiers.push({}); // بدون أي فلتر
    }

    for (const server of API_SERVERS) {
      try {
        for (const tier of searchTiers) {
          if (allResults.length >= limit) break;

          let url: string;
          const tagList = tags.join(',');

          if (options?.nameContains) {
            url = `${server}/stations/search?name=${encodeURIComponent(options.nameContains)}&limit=${limit}&order=clickcount&reverse=true&hidebroken=true`;
          } else {
            url = `${server}/stations/search?tag=${encodeURIComponent(tagList)}&limit=${limit}&order=clickcount&reverse=true&hidebroken=true`;
          }

          if (options?.country) {
            url += `&countrycode=${encodeURIComponent(options.country)}`;
          } else if (tier.code) {
            url += `&countrycode=${tier.code}`;
          }
          if (tier.langFilter && !options?.country) {
            url += `&languagecodes=${tier.langFilter}`;
          }

          try {
            const response = await fetch(url, {
              headers: { 'User-Agent': 'AsmaeRadio/1.0' },
              signal: AbortSignal.timeout(5000),
            });

            if (!response.ok) continue;
            const data = await response.json();
            if (!Array.isArray(data)) continue;

            for (const station of data) {
              if (allResults.length >= limit) break;
              if (!station.url_resolved || !station.url_resolved.startsWith('http')) continue;
              if (station.lastcheckok !== 1) continue;
              if (allResults.find(s => s.stationuuid === station.stationuuid)) continue;

              // تحقق عميق من التصنيفات لو فيه category محدد
              if (category && !verifyStationTags(station, category)) continue;

              allResults.push(station);
            }
          } catch {
            continue;
          }

          if (allResults.length >= limit) break;
        }

        if (allResults.length > 0) break;
      } catch {
        continue;
      }
    }

    // ترتيب حسب مطابقة التصنيف + شعبية
    if (category) {
      sortByTagRelevance(allResults, category);
    }
    allResults.sort((a, b) => {
      if (a.lastcheckok === 1 && b.lastcheckok !== 1) return -1;
      if (a.lastcheckok !== 1 && b.lastcheckok === 1) return 1;
      const votesA = a.votes || 0;
      const votesB = b.votes || 0;
      if (votesB !== votesA) return votesB - votesA;
      return (b.clicktrend || 0) - (a.clicktrend || 0);
    });

    // التحقق من أن أول محطة شغالة فعلاً
    if (options?.onlyWorking !== false && allResults.length > 1) {
      const topStations = allResults.slice(0, 5);
      for (const station of topStations) {
        const streamUrl = station.url_resolved || station.url;
        const isWorking = await validateStream(streamUrl);
        if (isWorking) {
          const idx = allResults.findIndex(s => s.stationuuid === station.stationuuid);
          if (idx > 0) {
            allResults.splice(idx, 1);
            allResults.unshift(station);
          }
          break;
        }
      }
    }

    return allResults.slice(0, limit);
  };

  // بحث محسن عن المحطات - يدعم البحث بالاسم والتاج (مصر ← عربي ← عالمي)
  const searchStationsEnhanced = async (query: string): Promise<RadioStation[]> => {
    const cleanQuery = query.trim();
    
    // جرب بالاسم الأول (most accurate)
    let results = await smartFetchStations([], {
      nameContains: cleanQuery,
      limit: 10,
    });

    // لو ملقيناش، جرب بالتاج
    if (results.length === 0) {
      results = await smartFetchStations([cleanQuery], { limit: 10 });
    }

    // لو لسه مفيش، جرب بالكلمات المفتاحية
    if (results.length === 0) {
      const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
      if (words.length > 1) {
        for (const word of words) {
          results = await smartFetchStations([word], { limit: 5 });
          if (results.length > 0) break;
        }
      }
    }

    return results;
  };

  // بحث ذكي حسب التصنيف — مصر ← عربي ← عالمي + تحقق عميق من التصنيفات
  const fetchStationsByTagGlobal = async (searchQuery: string, category?: string): Promise<RadioStation[]> => {
    const keywords = searchQuery.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    
    // تحديد التصنيف تلقائياً لو مش محدد
    const detectedCategory = category || (() => {
      const kw = keywords.join(' ');
      if (['quran', 'قرآن', 'قران', 'koran', 'recitation', 'tilawa', 'تلاوة'].some(k => kw.includes(k))) return 'quran';
      if (['islamic', 'islam', 'إسلام', 'muslim', 'ديني'].some(k => kw.includes(k))) return 'islamic';
      if (['nasheed', 'أناشيد', 'anashid', 'nashid', 'أنشودة', 'منشد'].some(k => kw.includes(k))) return 'nasheed';
      if (['lecture', 'محاضرة', 'talk', 'speech', 'خطبة', 'khutba', 'دروس', 'فتوى'].some(k => kw.includes(k))) return 'lectures';
      if (['calm', 'relax', 'ambient', 'chill', 'meditation', 'sleep', 'lounge'].some(k => kw.includes(k))) return 'calm';
      if (['music', 'موسيقى', 'pop', 'rock', 'jazz', 'أغاني', 'اغاني'].some(k => kw.includes(k))) return 'music';
      if (['news', 'أخبار', 'اخبار', 'عاجل'].some(k => kw.includes(k))) return 'news';
      return '';
    })();
    
    // نشوف لو التصنيف معروف في الـ map
    const matchedTags = keywords.reduce<string[]>((acc, kw) => {
      for (const [key, tags] of Object.entries(CATEGORY_TAG_MAP)) {
        if (key.includes(kw) || kw.includes(key)) {
          acc.push(...tags);
          return acc;
        }
      }
      acc.push(kw);
      return acc;
    }, []);

    const uniqueTags = [...new Set(matchedTags)];

    // البحث مع تحقق عميق من التصنيفات + تسلسل مصر ← عربي ← عالمي
    const stations = await smartFetchStations(uniqueTags, {
      limit: 15,
      onlyWorking: true,
      category: detectedCategory,
    });

    if (stations.length > 0) return stations;

    // لو مفيش نتائج: جرب بحث أوسع عالمي بدون تحقق عميق
    for (const server of API_SERVERS) {
      try {
        const url = `${server}/stations/search?tag=${encodeURIComponent(uniqueTags.join(','))}&limit=15&order=clickcount&reverse=true&hidebroken=true`;
        const response = await fetch(url, {
          headers: { 'User-Agent': 'AsmaeRadio/1.0' },
          signal: AbortSignal.timeout(8000),
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const valid = data.filter((s: any) => 
              s.url_resolved && 
              s.url_resolved.startsWith('http') &&
              s.lastcheckok === 1
            );
            if (valid.length > 0) return valid.slice(0, 15);
          }
        }
      } catch {
        continue;
      }
    }

    // محاولة أخيرة: البحث بالاسم
    for (const keyword of keywords) {
      for (const server of API_SERVERS) {
        try {
          const url = `${server}/stations/search?name=${encodeURIComponent(keyword)}&limit=10&order=clickcount&reverse=true&hidebroken=true`;
          const response = await fetch(url, {
            headers: { 'User-Agent': 'AsmaeRadio/1.0' },
            signal: AbortSignal.timeout(8000),
          });
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              const valid = data.filter((s: any) => 
                s.url_resolved && 
                s.url_resolved.startsWith('http') &&
                s.lastcheckok === 1
              );
              if (valid.length > 0) return valid.slice(0, 10);
            }
          }
        } catch {
          continue;
        }
      }
    }
    
    return [];
  };

  // تشغيل سورة قرآن
  const playQuranSurah = (reciterId: string, surahNumber: number) => {
    const reciter = reciters.find(r => r.id === reciterId);
    const surah = surahs.find(s => s.number === surahNumber);
    
    if (reciter && surah) {
      setSelectedReciter(reciter);
      setSelectedSurah(surah);
      playAudio(reciter, surah);
      
      // الانتقال لتبويب القرآن
      window.dispatchEvent(new CustomEvent('navigateToQuran'));
      
      const response = isArabic 
        ? `✅ يتم تشغيل:\n📖 ${surah.name}\n🎤 ${reciter.name}`
        : `✅ Now playing:\n📖 ${surah.nameEn}\n🎤 ${reciter.nameEn}`;
      
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }
    setQuranDialog(false);
  };

  // رسالة المساعدة
  const helpMessage = isArabic 
    ? `📚 **كل الأوامر المتاحة:**

🎵 **التشغيل:**
• شغل قرآن كريم
• شغل محتوى إسلامي
• شغل أناشيد
• شغل دروس ومحاضرات
• شغل محطات هادئة
• شغل موسيقى / أخبار
• ابحث عن محطة...

📖 **القرآن الكريم:**
• اذهب للقرآن
• اختر قارئ...
• اختر سورة...

🎮 **التحكم:**
• إيقاف / إيقاف مؤقت
• استكمال التشغيل
• كتم / إلغاء الكتم
• ارفع / اخفض الصوت
• الصوت 100% / 50%

⚙️ **الإعدادات:**
• الوضع الليلي / النهاري
• الوضع الإسلامي
• العربية / English

🌍 **الدول:**
• أكثر من 80 دولة حول العالم متاحة

⏰ **مؤقت النوم:**
• 15 / 30 / 60 دقيقة`
    : `📚 **All Available Commands:**

🎵 **Playback:**
• Play Quran
• Play Islamic content
• Play Nasheeds
• Play Lectures
• Play calm stations
• Play music / news
• Search for station...

📖 **Quran:**
• Go to Quran
• Select reciter...
• Select surah...

🎮 **Control:**
• Stop / Pause
• Resume playback
• Mute / Unmute
• Volume up / down
• Volume 100% / 50%

⚙️ **Settings:**
• Dark / Light mode
• Islamic mode
• Arabic / English

🌍 **Countries:**
• 80+ countries worldwide available

⏰ **Sleep Timer:**
• 15 / 30 / 60 minutes`;

  return (
    <>
      {/* Floating Button */}
      <Button
        variant="default"
        size="icon"
        className="rounded-full fixed bottom-24 end-4 z-50 shadow-lg h-14 w-14 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-110"
        onClick={() => {
          setAIChatOpen(true);
          setMessages([]);
        }}
      >
        <Sparkles className="h-6 w-6" />
      </Button>
      
      {/* Main Sheet */}
      <Sheet open={aiChatOpen} onOpenChange={setAIChatOpen}>
        <SheetContent
          side="bottom"
          className="h-[100dvh] inset-x-0 bottom-0 flex flex-col p-0 rounded-t-3xl [&>button]:hidden border-t bg-background"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-card shrink-0 rounded-t-3xl">
            <SheetClose className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors">
              <X className="h-5 w-5" />
            </SheetClose>
            
            <SheetTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="text-center">
                <span className="text-lg font-bold">{t.aiAssistant}</span>
                <p className="text-xs text-muted-foreground font-normal">
                  {isArabic ? 'سمع - مساعدك الذكي' : 'Sama - Your Smart Assistant'}
                </p>
              </div>
            </SheetTitle>
            
            <div className="w-10" />
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 pb-24 space-y-4">
              {/* Welcome or Messages */}
              {messages.length === 0 ? (
                <div className="space-y-4">
                  {/* Welcome */}
                  <div className="bg-muted rounded-2xl p-4 text-center">
                    <p className="whitespace-pre-line text-sm">{welcomeMessage}</p>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => {
                        // Open reciter selection dialog directly
                        setSurahSearchQuery('');
                        setQuranDialogType('reciter');
                        setQuranDialog(true);
                      }}
                    >
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium">{isArabic ? '📖 القرآن' : '📖 Quran'}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex flex-col gap-2"
                      onClick={() => setMessages([{ role: 'assistant', content: helpMessage }])}
                    >
                      <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                        <Settings className="h-5 w-5 text-accent-foreground" />
                      </div>
                      <span className="text-sm font-medium">{isArabic ? 'مساعدة' : 'Help'}</span>
                    </Button>
                  </div>

                  {/* Popular Commands */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      {isArabic ? '🎵 تشغيل سريع' : '🎵 Quick Play'}
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[COMMANDS.playQuran, COMMANDS.playIslamic, COMMANDS.playNasheed, COMMANDS.playCalm, COMMANDS.playMusic, COMMANDS.playNews].map((cmd) => (
                        <Button
                          key={cmd.id}
                          variant="outline"
                          className="h-auto py-3 flex flex-col gap-1"
                          onClick={() => executeCommand(cmd.id)}
                          disabled={isLoading}
                        >
                          <cmd.icon className="h-5 w-5 text-primary" />
                          <span className="text-xs">{isArabic ? cmd.labelAr : cmd.labelEn}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Station */}
                  <Button
                    variant="default"
                    className="w-full h-auto py-4 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600"
                    onClick={() => setCustomStationDialog(true)}
                  >
                    <Search className="h-5 w-5" />
                    <span className="font-medium">{isArabic ? '🔍 ابحث عن محطة...' : '🔍 Search for station...'}</span>
                  </Button>

                  {/* Countries */}
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-between"
                      onClick={() => setShowCountries(!showCountries)}
                    >
                      <span>{isArabic ? '🌍 الدول' : '🌍 Countries'}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", showCountries && "rotate-180")} />
                    </Button>
                    
                    {showCountries && (
                      <ScrollArea className="h-48 rounded-lg border">
                        <div className="grid grid-cols-3 gap-1 p-2">
                          {ALL_COUNTRIES.map((country) => (
                            <Button
                              key={country.code}
                              variant="ghost"
                              size="sm"
                              className="h-auto py-2 flex flex-col gap-1"
                              onClick={() => executeCommand(`country_${country.code}`)}
                            >
                              <span className="text-lg">{country.flag}</span>
                              <span className="text-[10px] truncate">{isArabic ? country.nameAr : country.nameEn}</span>
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>

                  {/* Toggle Commands List */}
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-between"
                    onClick={() => setShowCommands(!showCommands)}
                  >
                    <span>{isArabic ? '📋 كل الأوامر' : '📋 All Commands'}</span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", showCommands && "rotate-180")} />
                  </Button>

                  {/* All Commands */}
                  {showCommands && (
                    <div className="space-y-4">
                      {Object.entries(CATEGORIES).map(([catKey, catLabel]) => (
                        <div key={catKey} className="space-y-2">
                          <h4 className="font-semibold text-sm text-muted-foreground">
                            {isArabic ? catLabel.labelAr : catLabel.labelEn}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.values(COMMANDS)
                              .filter(cmd => cmd.category === catKey)
                              .map((cmd) => (
                                <Button
                                  key={cmd.id}
                                  variant="outline"
                                  size="sm"
                                  className="justify-start gap-2 h-auto py-2"
                                  onClick={() => {
                                    if (cmd.needsInput) {
                                      if (cmd.id === 'selectReciter' || cmd.id === 'selectSurah') {
                                        executeCommand(cmd.id);
                                      } else {
                                        setCustomStationDialog(true);
                                      }
                                    } else {
                                      executeCommand(cmd.id);
                                    }
                                  }}
                                  disabled={isLoading}
                                >
                                  <cmd.icon className="h-4 w-4 shrink-0" />
                                  <span className="text-xs truncate">{isArabic ? cmd.labelAr : cmd.labelEn}</span>
                                </Button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Messages */}
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3",
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        )}
                      >
                        <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons after response */}
                  {!isLoading && messages.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setMessages([])}
                      >
                        {isArabic ? '🏠 الرئيسية' : '🏠 Home'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuranDialogType('reciter');
                          setQuranDialog(true);
                        }}
                      >
                        {isArabic ? '📖 القرآن' : '📖 Quran'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomStationDialog(true)}
                      >
                        {isArabic ? '🔍 بحث' : '🔍 Search'}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Free Text Input */}
          <div className="shrink-0 border-t bg-card p-3 rounded-b-3xl">
            <div className="flex gap-2">
              <Input
                value={freeTextInput}
                onChange={(e) => setFreeTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && freeTextInput.trim()) {
                    handleFreeText(freeTextInput.trim());
                    setFreeTextInput('');
                  }
                }}
                placeholder={
                  isArabic 
                    ? 'اكتب أي حاجة... مثال: شغل قرآن، أناشيد، محطات مصرية'
                    : 'Type anything... e.g.: play Quran, nasheeds, Egyptian stations'
                }
                className="h-12 text-sm"
                disabled={isLoading}
              />
              <VoiceButton
                onResult={(text) => {
                  setFreeTextInput(text);
                  handleFreeText(text);
                }}
                lang={isArabic ? 'ar-SA' : 'en-US'}
                className="h-12 w-12"
                disabled={isLoading}
              />
              <Button
                onClick={() => {
                  if (freeTextInput.trim()) {
                    handleFreeText(freeTextInput.trim());
                    setFreeTextInput('');
                  }
                }}
                disabled={isLoading || !freeTextInput.trim()}
                className="h-12 px-4"
                size="default"
              >
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary-foreground rounded-full animate-bounce delay-100" />
                  </div>
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Custom Station Dialog */}
      <Dialog open={customStationDialog} onOpenChange={setCustomStationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isArabic ? 'ابحث عن محطة' : 'Search for station'}</DialogTitle>
            <DialogDescription>
              {isArabic ? 'اكتب اسم المحطة أو النوع أو القارئ' : 'Type station name, genre, or reciter name'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={customStationName}
              onChange={(e) => setCustomStationName(e.target.value)}
              placeholder={isArabic ? 'مثال: القرآن الكريم، نجو، fm...' : 'e.g., Quran, music, fm...'}
              className="h-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customStationName.trim()) {
                  executeCommand('playCustom', customStationName);
                  setCustomStationName('');
                  setCustomStationDialog(false);
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomStationDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button
              onClick={() => {
                if (customStationName.trim()) {
                  executeCommand('playCustom', customStationName);
                  setCustomStationName('');
                  setCustomStationDialog(false);
                }
              }}
              disabled={!customStationName.trim() || isLoading}
            >
              {isArabic ? 'شغل 🎵' : 'Play 🎵'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quran Selection Dialog */}
      <Dialog open={quranDialog} onOpenChange={setQuranDialog}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle>
              {quranDialogType === 'reciter' 
                ? (isArabic ? 'اختر القارئ' : 'Select Reciter')
                : (isArabic ? 'اختر السورة' : 'Select Surah')}
            </DialogTitle>
            <DialogDescription>
              {quranDialogType === 'reciter'
                ? (isArabic ? 'اختر القارئ الذي تريد الاستماع له' : 'Choose the reciter you want to listen to')
                : (isArabic ? `القارئ: ${selectedReciter?.name || ''}` : `Reciter: ${selectedReciter?.name || ''}`)}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-2">
            <div className="space-y-2">
              {quranDialogType === 'reciter' ? (
                // قائمة القراء
                <div className="grid grid-cols-1 gap-2">
                {reciters.map((reciter) => (
                  <Button
                    key={reciter.id}
                    variant={selectedReciter?.id === reciter.id ? 'default' : 'outline'}
                    className="w-full justify-start gap-3 h-auto py-3"
                    onClick={() => {
                      setSelectedReciter(reciter);
                      setSurahSearchQuery('');
                      setQuranDialogType('surah');
                    }}
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      {reciter.name.charAt(0)}
                    </div>
                    <div className="text-start min-w-0">
                      <p className="font-medium truncate">{reciter.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{reciter.nameEn}</p>
                    </div>
                  </Button>
                ))}
                </div>
              ) : (
                // قائمة السور
                <>
                  {/* زر الرجوع للقراء + بحث */}
                  <div className="sticky top-0 bg-background pb-2 z-10 space-y-2 -mx-6 px-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-muted-foreground"
                      onClick={() => setQuranDialogType('reciter')}
                    >
                      ← {isArabic ? 'رجوع للقراء' : 'Back to reciters'}
                    </Button>
                    <Input
                      value={surahSearchQuery}
                      onChange={(e) => setSurahSearchQuery(e.target.value)}
                      placeholder={isArabic ? '🔍 ابحث عن سورة...' : '🔍 Search surah...'}
                      className="h-10"
                    />
                  </div>
                  
                  {/* كل السور 114 سورة */}
                  <p className="text-xs text-muted-foreground mb-1">
                    {isArabic ? `📚 كل السور (${surahs.length})` : `📚 All Surahs (${surahs.length})`}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                  {surahs
                    .filter((surah) => {
                      if (!surahSearchQuery || !surahSearchQuery.trim()) return true;
                      return (
                        matchesSearch(surah.name, surahSearchQuery) ||
                        matchesSearch(surah.nameEn, surahSearchQuery) ||
                        surah.number.toString() === surahSearchQuery.trim()
                      );
                    })
                    .map((surah) => (
                    <Button
                      key={surah.number}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between gap-2 h-auto py-2"
                      onClick={() => {
                        if (selectedReciter) {
                          playQuranSurah(selectedReciter.id, surah.number);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs shrink-0">
                          {surah.number}
                        </span>
                        <span className="text-sm truncate">{surah.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{surah.nameEn}</span>
                    </Button>
                  ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <DialogFooter className="p-4 pt-2 shrink-0 border-t">
            <Button variant="outline" size="sm" onClick={() => setQuranDialog(false)}>
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
