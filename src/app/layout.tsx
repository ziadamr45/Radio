import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { UserDataProvider } from "@/components/providers/UserDataProvider";
import { ThemeSync } from "@/components/providers/ThemeSync";
import { ServiceWorkerRegistration } from "@/components/pwa/ServiceWorkerRegistration";
import { JsonLd } from "@/components/seo/JsonLd";
import { MandatoryNotificationPrompt } from "@/components/notifications/MandatoryNotificationPrompt";
import { EnhancedMiniPlayer } from "@/components/player/EnhancedMiniPlayer";
import { SleepTimerManager } from "@/components/radio/SleepTimerManager";
import { QuranMiniPlayer } from "@/components/quran/QuranMiniPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility (WCAG 1.4.4)
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ea580c" },
    { media: "(prefers-color-scheme: dark)", color: "#ea580c" },
  ],
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://asmaeradio.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "اسمع راديو | بث مباشر لجميع محطات الراديو من حول العالم والقرآن الكريم",
    template: "%s | اسمع راديو",
  },
  description: "اسمع راديو - أكثر من 40,000 محطة راديو من جميع أنحاء العالم بث مباشر. محطات القرآن الكريم، الموسيقى، الأخبار، الرياضة، الدراما، القصص. مساعد ذكي بالذكاء الاصطناعي. راديو من أكثر من 250 دولة.",
  keywords: [
    // 🔥 اسم الموقع والعلامة التجارية
    "اسمع راديو",
    "أسمع راديو",
    "asmae radio",
    "asma radio",
    "اسمع راديو مباشر",
    "موقع اسمع راديو",
    "تطبيق اسمع راديو",
    "اسمع راديو بث مباشر",
    "اسمع راديو اون لاين",
    "asmae radio live",
    "اسمع راديو القرآن",
    "اسمع راديو مصر",
    "اسمع راديو السعودية",
    
    // 📻 كلمات الراديو الأساسية
    "راديو مباشر",
    "راديو اون لاين",
    "بث مباشر راديو",
    "إذاعات مباشر",
    "محطات راديو مباشر",
    "استماع راديو",
    "راديو عالمي",
    "راديو مجاني",
    "راديو بدون تحميل",
    "راديو بدون تقطيع",
    "أفضل موقع راديو",
    "موقع راديو مجاني",
    "online radio",
    "radio live",
    "Arabic radio",
    "Arabic radio live",
    "world radio",
    "world radio live",
    "radio streaming",
    "internet radio",
    
    // 🌍 راديو حسب الدول
    "راديو مصر مباشر",
    "راديو السعودية مباشر",
    "راديو الإمارات",
    "راديو المغرب",
    "راديو الكويت",
    "راديو قطر",
    "راديو البحرين",
    "راديو عمان",
    "راديو الأردن",
    "راديو لبنان",
    "راديو سوريا",
    "راديو العراق",
    "راديو تونس",
    "راديو الجزائر",
    "راديو ليبيا",
    "راديو السودان",
    "راديو فلسطين",
    "راديو اليمن",
    "Egypt radio live",
    "Saudi Arabia radio",
    "UAE radio",
    "Kuwait radio",
    "Qatar radio",
    
    // 📻 محطات راديو مشهورة
    "نجوم اف ام بث مباشر",
    "ميكس اف ام مباشر",
    "راديو القرآن القاهرة",
    "إذاعة جدة مباشر",
    "إذاعة القاهرة",
    "إذاعة الرياض",
    "إذاعة دبي",
    "إذاعة أبوظبي",
    "راديو ميلودي",
    "راديو هيتس",
    "راديو المستقبل",
    "إذاعة صوت العرب",
    "إذاعة الشرق الأوسط",
    "nogoum fm",
    "mix fm",
    "melody radio",
    "hits radio",
    
    // 📖 كلمات القرآن الكريم الأساسية
    "القرآن الكريم",
    "القرآن الكريم مباشر",
    "إذاعة القرآن الكريم",
    "إذاعة القرآن الكريم مباشر",
    "القرآن الكريم بث مباشر",
    "راديو قرآن مباشر",
    "استماع القرآن الكريم اون لاين",
    "تحميل القرآن mp3",
    "القرآن كامل صوت",
    "القرآن الكريم mp3",
    "استماع قرآن",
    "قرآن كريم",
    "quran",
    "quran radio",
    "quran live",
    "holy quran",
    "quran mp3",
    "quran streaming",
    "إذاعة القرآن الكريم القاهرة بث مباشر بدون تقطيع",
    
    // 🎤 أسماء القراء
    "عبد الباسط عبد الصمد",
    "عبد الباسط عبد الصمد mp3",
    "المنشاوي قرآن كامل",
    "محمد صديق المنشاوي",
    "الحصري تلاوات",
    "محمود الحصري",
    "مشاري العفاسي قرآن",
    "مشاري راشد العفاسي",
    "سعد الغامدي mp3",
    "سعد الغامدي",
    "عبدالرحمن السديس",
    "سعود الشريم",
    " Maher Al-Muaiqly",
    "ماهر المعيقلي",
    "ياسر الدوسري",
    "عبدالله عواد الجهني",
    "محمد أيوب",
    "علي الحذيفي",
    "أبو بكر الشاطري",
    "صلاح البدير",
    "عبد البارئ الثبيتي",
    "خالد الجليل",
    "ماهر شخانة",
    "ناصر القطامي",
    "محمود الرفاعي",
    "أحمد نعينع",
    "أحمد الحواشي",
    "عادل الكلباني",
    "بندر بليلة",
    "abdul basit abdul samad",
    "mishary alafasy",
    "saad al ghamdi",
    "abdul rahman al sudais",
    "saud al shuraim",
    "mahir al muaiqly",
    
    // 📖 سور القرآن الكريم
    "سورة البقرة mp3",
    "سورة البقرة كاملة",
    "سورة الكهف كاملة",
    "سورة الكهف mp3",
    "سورة يس استماع",
    "سورة يس mp3",
    "سورة الرحمن mp3",
    "سورة الرحمن صوت",
    "سورة الملك صوت",
    "سورة الملك mp3",
    "سورة مريم",
    "سورة طه",
    "سورة الأنبياء",
    "سورة المؤمنون",
    "سورة النور",
    "سورة الفرقان",
    "سورة النمل",
    "سورة القصص",
    "سورة العنكبوت",
    "سورة الروم",
    "سورة لقمان",
    "سورة سبأ",
    "سورة فاطر",
    "سورة الصافات",
    "سورة ص",
    "سورة الزمر",
    "سورة غافر",
    "سورة فصلت",
    "سورة الشورى",
    "سورة الزخرف",
    "سورة الدخان",
    "سورة الجاثية",
    "سورة الأحقاف",
    "سورة محمد",
    "سورة الفتح",
    "سورة الحجرات",
    "سورة ق",
    "سورة الذاريات",
    "سورة الطور",
    "سورة النجم",
    "سورة القمر",
    "سورة الواقعة",
    "سورة الحديد",
    "سورة المجادلة",
    "سورة الحشر",
    "سورة الممتحنة",
    "سورة الصف",
    "سورة الجمعة",
    "سورة المنافقون",
    "سورة التغابن",
    "سورة الطلاق",
    "سورة التحريم",
    "سورة نوح",
    "سورة الجن",
    "سورة المزمل",
    "سورة المدثر",
    "سورة القيامة",
    "سورة الإنسان",
    "سورة المرسلات",
    "سورة النبأ",
    "سورة النازعات",
    "سورة عبس",
    "سورة التكوير",
    "سورة الانفطار",
    "سورة المطففين",
    "سورة الانشقاق",
    "سورة البروج",
    "سورة الطارق",
    "سورة الأعلى",
    "سورة الغاشية",
    "سورة الفجر",
    "سورة البلد",
    "سورة الشمس",
    "سورة الليل",
    "سورة الضحى",
    "سورة الشرح",
    "سورة التين",
    "سورة العلق",
    "سورة القدر",
    "سورة البينة",
    "سورة الزلزلة",
    "سورة العاديات",
    "سورة القارعة",
    "سورة التكاثر",
    "سورة العصر",
    "سورة الهمزة",
    "سورة الفيل",
    "سورة قريش",
    "سورة الماعون",
    "سورة الكوثر",
    "سورة الكافرون",
    "سورة النصر",
    "سورة المسد",
    "سورة الإخلاص",
    "سورة الفلق",
    "سورة الناس",
    "surah baqarah",
    "surah kahf",
    "surah yasin",
    "surah rahman",
    "surah mulk",
    "surah maryam",
    
    // 🤖 كلمات الذكاء الاصطناعي
    "راديو بالذكاء الاصطناعي",
    "موقع راديو بالذكاء الاصطناعي",
    "تشغيل الراديو بالصوت",
    "تشغيل القرآن بالصوت",
    "مساعد ذكي راديو",
    "AI radio player",
    "smart radio app",
    "AI radio assistant",
    "voice control radio",
    "intelligent radio",
    "مساعد ذكي للبحث",
    "مساعد ذكي للتوصيات",
    "radio with AI",
    "AI quran player",
    
    // 🧠 كلمات استخدام طويلة (Long Tail)
    "إذاعة القرآن الكريم القاهرة بث مباشر بدون تقطيع",
    "أفضل موقع للاستماع إلى القرآن الكريم mp3",
    "راديو مصر مباشر بجودة عالية",
    "استماع سورة البقرة كاملة mp3 بدون نت",
    "تحميل القرآن الكريم كامل بصوت واضح",
    "استماع القرآن الكريم بصوت عبد الباسط",
    "راديو السعودية بث مباشر بدون تقطيع",
    "أفضل موقع للاستماع إلى الراديو العالمي",
    "إذاعة القرآن الكريم مباشر من القاهرة",
    "راديو إسلامي بث مباشر بدون إعلانات",
    "تطبيق راديو عالمي مجاني",
    "استماع راديو مصر نجوم اف ام",
    "راديو القرآن الكريم السعودية",
    "بث مباشر إذاعة القرآن الكريم",
    "استماع القرآن الكريم أون لاين مجانا",
    "راديو مصري مباشر بدون تقطيع",
    "أفضل إذاعة للقرآن الكريم",
    "راديو خليجي بث مباشر",
    "راديو عالمي بدون إعلانات",
    "موقع للاستماع للراديو مباشر",
    "راديو السعودية القرآن الكريم مباشر",
    "إذاعة صوت العرب بث مباشر",
    "راديو القرآن الكريم مصر",
    "أذكار الصباح والمساء",
    "أذكار النوم",
    "أذكار الصباح كاملة",
    "أذكار المساء كاملة",
    "أذكار النوم كاملة",
    "morning azkar",
    "evening azkar",
    "sleep azkar",
    "dhikr",
    "islamic azkar",
    "أذكار",
    "ذكر",
    "تسبيح",
    "استغفار",
    "تهليل",
    "تكبير",
    
    // 🔥 كلمات إسلامية
    "إذاعة إسلامية",
    "راديو إسلامي",
    "أناشيد إسلامية",
    "أناشيد",
    "مواعظ",
    "خطب",
    "محاضرات",
    "islamic radio",
    "islamic nasheed",
    "islamic lectures",
    "محتوى إسلامي",
    "قنوات إسلامية",
    "إذاعة السنة النبوية",
    
    // 🎵 كلمات موسيقى
    "راديو موسيقى",
    "راديو أغاني",
    "موسيقى عربية",
    "أغاني عربية",
    "راديو أغاني عربية",
    "arabic music radio",
    "world music radio",
    "music radio",
    "songs radio",
    
    // 📰 كلمات أخبار
    "راديو أخبار",
    "إذاعة أخبار",
    "أخبار عربية",
    "news radio",
    "arabic news",
    "world news radio",
    
    // 🎯 كلمات تقنية
    "تطبيق راديو",
    "تطبيق قرآن",
    "تطبيق إسلامي",
    "راديو للموبايل",
    "راديو للجوال",
    "radio app",
    "quran app",
    "islamic app",
    "mobile radio",
    
    // 🌐 كلمات إنجليزية
    "listen to radio",
    "listen to quran",
    "arabic radio stations",
    "live arabic radio",
    "world radio stations",
    "live world radio",
    "free radio online",
    "best arabic radio",
    "best world radio",
    "quran recitation",
    "quran reciters",
    "famous quran reciters",
    "arabic radio app",
    "world radio app",
    "free quran app",
    "islamic streaming",
    
    // 📱 كلمات PWA
    "راديو بدون تحميل",
    "راديو بدون تثبيت",
    "تطبيق ويب راديو",
    "PWA راديو",
    "progressive web app radio",

    // 🌍 راديو دول العالم - World Radio
    "راديو أمريكا", "راديو بريطانيا", "راديو فرنسا", "راديو ألمانيا", "راديو إيطاليا",
    "راديو إسبانيا", "راديو تركيا", "راديو البرازيل", "راديو الهند", "راديو اليابان",
    "راديو الصين", "راديو روسيا", "راديو كندا", "راديو أستراليا", "راديو المكسيك",
    "راديو الأرجنتين", "راديو كولومبيا", "راديو إندونيسيا", "راديو ماليزيا",
    "راديو باكستان", "راديو بنغلاديش", "راديو تايلاند", "راديو الفلبين",
    "راديو نيجيريا", "راديو جنوب أفريقيا", "راديو كينيا", "راديو الصومال",
    "راديو أثيوبيا", "راديو تنزانيا", "راديو أوغندا", "راديو غانا",
    "راديو المغرب", "راديو تونس", "راديو الجزائر", "راديو السودان", "راديو ليبيا",
    "راديو العراق", "راديو الأردن", "راديو لبنان", "راديو فلسطين", "راديو سوريا",
    "راديو اليمن", "راديو عمان", "راديو الكويت", "راديو قطر", "راديو البحرين",
    "راديو موريتانيا", "راديو جيبوتي", "راديو جزر القمر",
    "راديو هولندا", "راديو بلجيكا", "راديو سويسرا", "راديو النمسا",
    "راديو السويد", "راديو النرويج", "راديو الدنمارك", "راديو فنلندا",
    "راديو بولندا", "راديو التشيك", "راديو رومانيا", "راديو المجر",
    "راديو اليونان", "راديو البرتغال", "راديو كرواتيا", "راديو صربيا",
    "راديو أوكرانيا", "راديو أيرلندا", "راديو اسكتلندا",
    "راديو كوريا", "راديو تايوان", "راديو سنغافورة", "راديو فيتنام",
    "راديو إيران", "راديو أفغانستان", "راديو أذربيجان",
    "راديو مصر مباشر بدون تحميل", "راديو السعودية اون لاين مجاني",
    "راديو الإمارات بث حي", "راديو المغرب مباشر مجاني",
    "راديو العراق اون لاين", "راديو الأردن بث مباشر",
    "راديو لبنان مباشر بدون تقطيع", "راديو فلسطين اون لاين",
    "راديو سوريا مباشر مجاني", "راديو تونس بث حي",
    "راديو الجزائر مباشر بدون تحميل", "راديو السودان اون لاين",
    "راديو ليبيا بث مباشر", "راديو اليمن اون لاين مجاني",
    "راديو عمان مباشر", "راديو الكويت بث حي",
    "راديو قطر مباشر بدون تقطيع", "راديو البحرين اون لاين",
    "radio usa live", "radio uk live", "radio france", "radio germany",
    "radio italy", "radio spain", "radio turkey", "radio brazil",
    "radio india", "radio japan", "radio canada", "radio australia",
    "live radio stations", "world radio stations", "international radio online",
    "free world radio", "all countries radio", "global radio streaming",
    "listen to radio online free", "best radio stations worldwide",
    "internet radio stations by country", "radio stations near me",
    "local radio stations online", "fm radio online", "am radio online",

    // 🎵 تصنيفات الراديو - Radio Genres
    "راديو قرآن كريم", "راديو إسلامي", "راديو أناشيد", "راديو موسيقى",
    "راديو أخبار", "راديو رياضة", "راديو حوار", "راديو ترفيه",
    "راديو دراما", "راديو قصص", "راديو أفلام", "راديو ثقافة",
    "راديو تعليم", "راديو أطفال", "راديو كلاسيك", "راديو جاز",
    "راديو روك", "راديو بوب", "راديو هيب هوب", "راديو إلكترو",
    "راديو ريجي", "راديو لاتين", "راديو كلاسيكي", "راديو دج",
    "راديو ترانس", "راديو لو فاي", "راديو شيل", "راديو إندي",
    "راديو فلكلور", "راديو بلوز", "راديو كانتري",
    "راديو رومانسي", "راديو حب", "راديو كوميدي", "راديو حوار اجتماعي",
    "راديو صحة", "راديو علم", "راديو تقنية", "راديو أعمال",
    "راديو طرب", "راديو مقامات", "راديو شرقي", "راديو خليجي",
    "راديو بدوي", "راديو نوبا", "راديو شعبي",
    "quran radio online", "islamic radio live", "nasheed radio",
    "music radio stations", "news radio live", "sports radio online",
    "talk radio stations", "drama radio", "story radio",
    "classical radio", "jazz radio online", "rock radio stations",
    "pop radio live", "electronic music radio", "lofi radio",
    "hip hop radio", "reggae radio", "latin radio online",
    "romantic radio", "love songs radio", "comedy radio",
    "folk radio", "blues radio", "country music radio",
    "arabic music online", "khaleeji radio", "tarab radio",
    "bedtime stories radio", "kids radio online", "children stories radio",
    "film radio", "cinema radio", "culture radio",

    // 🔍 Long Tail Keywords - بحث طويل
    "أفضل موقع راديو عالمي مجاني بدون تحميل",
    "استماع محطات راديو عالمية بث مباشر بدون تقطيع",
    "راديو عالمي اون لاين بدون تسجيل",
    "موقع للاستماع للقرآن الكريم مباشر بدون نت",
    "بث مباشر محطات راديو من جميع دول العالم",
    "كيف أستمع للراديو على الإنترنت مجانا",
    "أفضل تطبيق راديو عالمي للموبايل",
    "راديو عالمي يعمل بدون إنترنت بعد التحميل",
    "استماع القرآن الكريم بصوت أشهر القراء العرب",
    "تحميل تطبيق اسمع راديو مجاني",
    "راديو مصر مباشر نجوم اف ام بدون تقطيع",
    "إذاعة القرآن الكريم بث مباشر من القاهرة بدون تحميل",
    "راديو موسيقى عربية أون لاين مجاني",
    "أفضل محطات الراديو العالمية المباشرة",
    "راديو الرياضة العالمية بث مباشر",
    "استماع الأخبار العالمية عبر الراديو مباشر",
    "راديو أناشيد إسلامية بدون موسيقى",
    "موقع راديو شامل لكل دول العالم",
    "راديو خليجي مباشر بدون إعلانات",
    "راديو مغربي مباشر بدون تقطيع",
    "راديو جزائري اون لاين بدون تسجيل",
    "راديو عراقي بث مباشر بدون تحميل",
    "راديو سوري مباشر بدون تسجيل",
    "راديو لبناني اون لاين بدون إعلانات",
    "best world radio app free download",
    "listen to world radio online without registration",
    "free online radio stations from all countries",
    "live quran radio streaming without interruption",
    "top world radio stations live streaming",
    "radio stations from egypt saudi uae morocco online",
    "listen to international radio stations online free",
    "all countries radio stations in one place",
    "best internet radio app for all music",
    "islamic radio stations without music",
    "quran radio stations from mecca medina cairo",
    "world news radio live streaming online",
    "sports radio football live",
    "radio drama stories online",
    "bedtime stories radio for kids",
    "classic music radio online",
    "world music radio live streaming",
    "tarab music radio online",
    "folk music radio world",

    // 📊 كلمات بحث متخصصة
    "محطات راديو عالمية", "إذاعات عالمية وبث مباشر",
    "راديو أون لاين مجاني بدون تسجيل", "أكثر من 40000 محطة راديو",
    "راديو من جميع أنحاء العالم", "محطة إذاعية لكل دولة",
    "راديو بلدك مباشر", "استمع لراديو بلدك الآن",
    "all radio stations worldwide", "40000 radio stations",
    "radio from every country", "country radio stations list",
    "complete radio station directory", "radio station finder",
    "find radio stations by country", "browse radio by genre",
    "top radio stations by country", "most popular radio stations",
  ],
  authors: [{ name: "Ziad Amr" }],
  creator: "Ziad Amr",
  publisher: "Ziad Amr",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      "ar-SA": SITE_URL,
      "en-US": `${SITE_URL}?lang=en`,
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "اسمع راديو",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "اسمع راديو | بث مباشر لجميع محطات الراديو من حول العالم والقرآن الكريم",
    description: "استمع إلى أفضل محطات الراديو من حول العالم والقرآن الكريم بث مباشر بجودة عالية. راديو من أكثر من 250 دولة في مكان واحد.",
    type: "website",
    url: SITE_URL,
    siteName: "اسمع راديو",
    locale: "ar_SA",
    alternateLocale: ["en_US", "ar_EG", "ar_SA"],
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "اسمع راديو - بث مباشر لمحطات الراديو من حول العالم",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "اسمع راديو | بث مباشر لجميع محطات الراديو من حول العالم والقرآن الكريم",
    description: "استمع إلى أفضل محطات الراديو من حول العالم والقرآن الكريم بث مباشر بجودة عالية.",
    images: ["/icons/icon-512x512.png"],
  },
  category: "Entertainment",
  classification: "Radio Streaming App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <JsonLd />

        {/* Tell browsers we support light only (first defense layer) */}
        <meta name="color-scheme" content="light" />

        {/* Referrer Policy */}
        <meta name="referrer" content="no-referrer-when-downgrade" />

        {/* Google AdSense - Auto Ads */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8502551436802377" crossOrigin="anonymous" />

        {/* Theme & Language: read from Zustand localStorage and apply immediately to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = JSON.parse(localStorage.getItem('asmae-radio-storage-v4') || '{}');
                var theme = stored && stored.state && stored.state.theme ? stored.state.theme : 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                var csMeta = document.querySelector('meta[name="color-scheme"]');
                if (csMeta) csMeta.setAttribute('content', theme === 'dark' ? 'dark' : 'light');
                var lang = stored && stored.state && stored.state.language ? stored.state.language : 'ar';
                document.documentElement.lang = lang;
                document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

                /* === Detect browser forced dark mode (HeyTap, etc.) === */
                /* If user chose light but system prefers dark, aggressive browsers
                   will forcibly convert the page to dark mode in an ugly way.
                   We detect this and apply our beautiful dark theme instead. */
                if (theme === 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  // Wait for browser to apply its forced dark mode, then check
                  // We use getComputedStyle to see if the browser overrode our color-scheme
                  requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                      var computedCS = getComputedStyle(document.documentElement).colorScheme || '';
                      // If browser changed our color-scheme to dark, it's forcing dark mode
                      if (computedCS.indexOf('dark') !== -1) {
                        // Browser is forcing dark mode - apply our dark theme instead
                        document.documentElement.classList.add('dark');
                        if (csMeta) csMeta.setAttribute('content', 'dark');
                      }
                    });
                  });
                }
              } catch (e) {
                document.documentElement.classList.remove('dark');
              }
            `,
          }}
        />

        {/* Splash screen - shows immediately before React loads - only on first visit */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = JSON.parse(localStorage.getItem('asmae-radio-storage-v4') || '{}');
                var lang = stored && stored.state && stored.state.language ? stored.state.language : 'ar';
                // Update splash screen text based on language
                var titleEl = document.getElementById('splash-title');
                var loadingEl = document.getElementById('splash-loading');
                if (lang === 'en') {
                  if (titleEl) titleEl.textContent = 'Esmaa Radio';
                  if (loadingEl) loadingEl.textContent = 'Loading...';
                  document.getElementById('initial-splash').style.direction = 'ltr';
                }
              } catch (e) {}

              // Check if we're on the home page - only show splash there
              var isHomePage = window.location.pathname === '/' || window.location.pathname === '';
              if (!isHomePage) {
                // Not the home page - hide splash immediately
                var splashNotHome = document.getElementById('initial-splash');
                if (splashNotHome) splashNotHome.style.display = 'none';
              } else if (sessionStorage.getItem('splashShown')) {
                document.addEventListener('DOMContentLoaded', function() {
                  var splash = document.getElementById('initial-splash');
                  if (splash) splash.style.display = 'none';
                });
                // Also try immediately
                var splashNow = document.getElementById('initial-splash');
                if (splashNow) splashNow.style.display = 'none';
              } else {
                sessionStorage.setItem('splashShown', 'true');
              }
              
              // Fallback: Remove splash screen after max 3 seconds (safety net for all pages)
              setTimeout(function() {
                var splash = document.getElementById('initial-splash');
                if (splash) {
                  splash.style.transition = 'opacity 0.3s ease-out';
                  splash.style.opacity = '0';
                  setTimeout(function() {
                    var s = document.getElementById('initial-splash');
                    if (s) s.remove();
                  }, 300);
                }
              }, 3000);
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                margin: 0;
                padding: 0;
              }
              /* Light mode body background */
              body:not(.dark) {
                background: linear-gradient(180deg, #fefefe 0%, #f8f4f0 50%, #f0ebe5 100%);
              }
              /* Dark mode body background */
              body.dark {
                background: linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
              }
              #initial-splash {
                position: fixed;
                inset: 0;
                z-index: 100;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: linear-gradient(180deg, #fefefe 0%, #f8f4f0 50%, #f0ebe5 100%);
              }
              /* Splash screen dark mode */
              .dark #initial-splash {
                background: linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #1a1a1a 100%);
              }
              .dark #initial-splash .title {
                color: #e5e7eb;
              }
              .dark #initial-splash .bar {
                background: #374151;
              }
              #initial-splash .radio-icon {
                width: 128px;
                height: 128px;
                background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
                border-radius: 24px;
                position: relative;
                animation: radioWiggle 2s ease-in-out infinite;
                box-shadow: 0 25px 50px -12px rgba(234, 88, 12, 0.3);
              }
              #initial-splash .screen {
                position: absolute;
                top: 16px;
                left: 16px;
                right: 16px;
                height: 48px;
                background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              #initial-splash .freq {
                color: #fb923c;
                font-family: monospace;
                font-size: 12px;
                animation: blink 0.5s ease-in-out infinite;
              }
              #initial-splash .speakers {
                position: absolute;
                bottom: 16px;
                left: 16px;
                right: 16px;
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 4px;
              }
              #initial-splash .speaker-dot {
                width: 8px;
                height: 8px;
                background: #9a3412;
                border-radius: 50%;
                animation: pulse 0.3s ease-in-out infinite;
              }
              #initial-splash .antenna {
                position: absolute;
                top: -24px;
                left: 50%;
                width: 4px;
                height: 32px;
                background: linear-gradient(to top, #ea580c 0%, #fb923c 100%);
                border-radius: 2px;
                transform-origin: bottom;
                animation: antenna 1.5s ease-in-out infinite;
              }
              #initial-splash .title {
                margin-top: 24px;
                font-size: 36px;
                font-weight: bold;
                color: #1f2937;
                font-family: system-ui, sans-serif;
              }
              #initial-splash .loading {
                margin-top: 8px;
                color: #ea580c;
                font-size: 14px;
                animation: fadeInOut 2s ease-in-out infinite;
              }
              #initial-splash .bar {
                margin-top: 24px;
                width: 192px;
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
              }
              #initial-splash .bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #f97316 0%, #fb923c 100%);
                animation: loading 1.5s ease-in-out forwards;
              }
              @keyframes radioWiggle {
                0%, 100% { transform: rotate(0deg); }
                25% { transform: rotate(-5deg); }
                75% { transform: rotate(5deg); }
              }
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
              @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
              }
              @keyframes antenna {
                0%, 100% { transform: translateX(-50%) rotate(-15deg); }
                50% { transform: translateX(-50%) rotate(15deg); }
              }
              @keyframes fadeInOut {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }
              @keyframes loading {
                0% { width: 0%; }
                100% { width: 100%; }
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {/* Skip to main content link for keyboard/screen reader users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          تخطي للمحتوى الرئيسي / Skip to main content
        </a>

        {/* Initial splash screen - visible immediately before React */}
        <div id="initial-splash">
          <div className="radio-icon">
            <div className="antenna"></div>
            <div className="screen">
              <span className="freq">FM 95.5</span>
            </div>
            <div className="speakers">
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
              <div className="speaker-dot"></div>
            </div>
          </div>
          <div className="title" id="splash-title">اسمع راديو</div>
          <div className="loading" id="splash-loading">جاري التحميل...</div>
          <div className="bar">
            <div className="bar-fill"></div>
          </div>
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ThemeSync />
          <UserDataProvider>
            {/* PWA Service Worker Registration */}
            <ServiceWorkerRegistration />
            {/* Mandatory Notification Prompt */}
            <MandatoryNotificationPrompt />
            <Suspense fallback={null}>
              {children}
            </Suspense>
            {/* Global Audio Player - persists across all pages */}
            <EnhancedMiniPlayer />
            {/* Global Sleep Timer Manager - persists across all pages */}
            <SleepTimerManager />
            {/* Global Quran Player - persists across all pages */}
            <QuranMiniPlayer />
            <Toaster />
          </UserDataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
