'use client';

import { useState } from 'react';
import { useRadioStore } from '@/stores/radio-store';
import { ChevronDown, ChevronUp, Radio, BookOpen, Globe, Music, Headphones, Sparkles, Mic } from 'lucide-react';

export function SEOContent() {
  const { language } = useRadioStore();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section className="mt-8 mb-4" aria-label="معلومات عن اسمع راديو">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 hover:border-primary/20 transition-colors text-start"
        aria-expanded={isExpanded}
      >
        <span className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Headphones className="h-4 w-4 text-primary" />
          {language === 'ar' ? 'عن اسمع راديو' : 'About Esmaa Radio'}
        </span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
          {/* About the app */}
          <article className="prose prose-sm dark:prose-invert max-w-none px-1">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              {language === 'ar' ? 'أفضل محطات الراديو من حول العالم - اسمع راديو' : 'Best Radio Stations From Around the World - Esmaa Radio'}
            </h3>
            <p className="text-muted-foreground text-sm leading-7 mb-3">
              {language === 'ar'
                ? 'اسمع راديو هي منصة متكاملة للاستماع إلى بث مباشر راديو من جميع أنحاء العالم. نقدم لك مجموعة واسعة من محطات راديو مباشر تشمل محطات من مصر والسعودية والإمارات والمغرب وتركيا وبريطانيا وأمريكا وفرنسا وألمانيا واليابان والهند والبرازيل وأستراليا وأكثر من 200 دولة أخرى. تطبيق راديو مجاني يتيح لك الاستماع بجودة عالية من أي مكان وفي أي وقت عبر الإنترنت بدون تقطيع.'
                : 'Esmaa Radio is a comprehensive platform for listening to live radio broadcasts from all around the world. We offer a wide range of live radio stations from Egypt, Saudi Arabia, UAE, Morocco, Turkey, UK, USA, France, Germany, Japan, India, Brazil, Australia and over 200 other countries. Free radio app with high quality streaming anytime, anywhere.'}
            </p>
          </article>

          {/* Quran section */}
          <article className="prose prose-sm dark:prose-invert max-w-none px-1">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              {language === 'ar' ? 'استمع إلى القرآن الكريم مباشر - إذاعة القرآن' : 'Listen to Holy Quran Live - Quran Radio'}
            </h3>
            <p className="text-muted-foreground text-sm leading-7 mb-3">
              {language === 'ar'
                ? 'تتميز اسمع راديو بتقديم بث مباشر لإذاعة القرآن الكريم من مختلف دول العالم مثل إذاعة القرآن الكريم القاهرة وإذاعة القرآن الكريم السعودية. يمكنك الاستماع إلى تلاوات خاشعة بأصوات أشهر قراء القرآن الكريم مثل عبد الباسط عبد الصمد والمنشاوي والحصري ومشاري العفاسي وسعد الغامدي والسديس والشريم وماهر المعيقلي وياسر الدوسري. استماع القرآن الكريم mp3 بجودة عالية مع إمكانية تحميل القرآن الكريم كامل.'
                : 'Esmaa Radio features live Quran radio broadcasts from around the world, including Egypt and Saudi Arabia. Listen to beautiful recitations from famous Quran reciters like Abdul Basit Abdul Samad, Al-Minshawi, Al-Hussary, Mishary Alafasy, Saad Al-Ghamdi, Al-Sudais, Al-Shuraim, Maher Al-Muaiqly, and Yasser Al-Dosari. High quality Quran streaming and MP3 download available.'}
            </p>
          </article>

          {/* Surahs section */}
          <article className="prose prose-sm dark:prose-invert max-w-none px-1">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <Mic className="h-4 w-4 text-primary" />
              {language === 'ar' ? 'سور القرآن الكريم' : 'Quran Surahs'}
            </h3>
            <p className="text-muted-foreground text-sm leading-7 mb-3">
              {language === 'ar'
                ? 'استمع إلى جميع سور القرآن الكريم مباشر: سورة البقرة كاملة، سورة الكهف، سورة يس، سورة الرحمن، سورة الملك، سورة مريم، سورة طه، سورة الأنبياء، سورة النور، سورة القصص، سورة فاطر، سورة ق، سورة الواقعة، سورة الحديد، سورة الصف، سورة الجمعة، سورة نوح، سورة الجن، سورة المزمل، سورة المدثر، سورة القيامة، سورة الإنسان، سورة النبأ، سورة النازعات، سورة التكوير، سورة الانفطار، سورة المطففين، سورة الانشقاق، سورة البروج، سورة الطارق، سورة الأعلى، سورة الغاشية، سورة الفجر، سورة البلد، سورة الشمس، سورة الليل، سورة الضحى، سورة الشرح، سورة التين، سورة العلق، سورة القدر، سورة البينة، سورة الزلزلة، سورة العاديات، سورة القارعة، سورة التكاثر، سورة العصر، سورة الهمزة، سورة الفيل، سورة قريش، سورة الماعون، سورة الكوثر، سورة الكافرون، سورة النصر، سورة المسد، سورة الإخلاص، سورة الفلق، سورة الناس.'
                : 'Listen to all Quran surahs live: Surah Al-Baqarah, Surah Al-Kahf, Surah Yasin, Surah Ar-Rahman, Surah Al-Mulk, Surah Maryam, Surah Taha, Surah Al-Anbiya, Surah An-Nur, Surah Al-Qasas, Surah Fatir, Surah Qaf, Surah Al-Waqiah, Surah Al-Hadid, Surah As-Saff, Surah Al-Jumuah, Surah Nuh, Surah Al-Jinn, Surah Al-Muzzammil, Surah Al-Muddaththir, Surah Al-Qiyamah, Surah Al-Insan, Surah An-Naba, Surah An-Nazi\'at, Surah At-Takwir, Surah Al-Infitar, Surah Al-Mutaffifin, Surah Al-Inshiqaq, Surah Al-Buruj, Surah At-Tariq, Surah Al-A\'la, Surah Al-Ghashiyah, Surah Al-Fajr, Surah Al-Balod, Surah Ash-Shams, Surah Al-Lail, Surah Ad-Dhuha, Surah Ash-Sharh, Surah At-Tin, Surah Al-Alaq, Surah Al-Qadr, Surah Al-Bayyinah, Surah Az-Zalzalah, Surah Al-Adiyat, Surah Al-Qari\'ah, Surah At-Takathur, Surah Al-Asr, Surah Al-Humazah, Surah Al-Fil, Surah Quraysh, Surah Al-Ma\'un, Surah Al-Kawthar, Surah Al-Kafirun, Surah An-Nasr, Surah Al-Masad, Surah Al-Ikhlas, Surah Al-Falaq, Surah An-Nas.'}
            </p>
          </article>

          {/* Countries section */}
          <article className="prose prose-sm dark:prose-invert max-w-none px-1">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              {language === 'ar' ? 'راديو من جميع أنحاء العالم' : 'Radio From All Around the World'}
            </h3>
            <p className="text-muted-foreground text-sm leading-7 mb-3">
              {language === 'ar'
                ? 'استمع إلى آلاف المحطات الإذاعية من جميع أنحاء العالم: راديو مصر، راديو السعودية، راديو الإمارات، راديو المغرب، راديو تركيا، راديو بريطانيا، راديو أمريكا، راديو فرنسا، راديو ألمانيا، راديو إسبانيا، راديو إيطاليا، راديو اليابان، راديو الهند، راديو البرازيل، راديو أستراليا، وأكثر من 200 دولة أخرى. سواء كنت تبحث عن أخبار، موسيقى، أغاني، رياضة، أو محتوى إسلامي، ستجد محطتك المفضلة في اسمع راديو.'
                : 'Listen to thousands of radio stations from all around the world: Egypt radio, Saudi Arabia radio, UAE radio, Morocco radio, Turkey radio, UK radio, USA radio, France radio, Germany radio, Spain radio, Italy radio, Japan radio, India radio, Brazil radio, Australia radio, and over 200 other countries. Whether you are looking for news, music, songs, sports, or Islamic content, find your favorite station on Esmaa Radio.'}
            </p>
          </article>

          {/* AI Features */}
          <article className="prose prose-sm dark:prose-invert max-w-none px-1">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {language === 'ar' ? 'مساعد ذكي للبحث والتوصيات - راديو بالذكاء الاصطناعي' : 'AI Assistant for Search & Recommendations'}
            </h3>
            <p className="text-muted-foreground text-sm leading-7 mb-3">
              {language === 'ar'
                ? 'يتميز تطبيق اسمع راديو بمساعد ذكي مدعوم بالذكاء الاصطناعي يمكنك من خلاله البحث عن أي محطة راديو بالصوت أو الكتابة. مساعد ذكي للبحث والتوصيات يساعدك في العثور على أفضل محطات الراديو المناسبة لذوقك. تشغيل الراديو بالصوت وتشغيل القرآن بالصوت بسهولة. AI radio player ذكي يفهم احتياجاتك ويقدم لك توصيات مخصصة.'
                : 'Esmaa Radio features an AI-powered smart assistant that allows you to search for any radio station by voice or text. Intelligent search and recommendation assistant helps you find the best radio stations matching your taste. Voice control radio and Quran playback. Smart AI radio player that understands your needs and provides personalized recommendations.'}
            </p>
          </article>

          {/* Features */}
          <article className="prose prose-sm dark:prose-invert max-w-none px-1">
            <h3 className="text-base font-bold mb-3 flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              {language === 'ar' ? 'مميزات تطبيق اسمع راديو' : 'Esmaa Radio Features'}
            </h3>
            <ul className="text-muted-foreground text-sm leading-7 space-y-1 list-disc list-inside mb-3">
              <li>{language === 'ar' ? 'بث مباشر بأعلى جودة صوتية بدون تقطيع' : 'Live streaming with highest audio quality without interruptions'}</li>
              <li>{language === 'ar' ? 'أكثر من 40,000 محطة راديو من جميع أنحاء العالم' : 'Over 40,000 radio stations from all around the world'}</li>
              <li>{language === 'ar' ? 'أكثر من 50 قارئ للقرآن الكريم' : 'Over 50 Quran reciters'}</li>
              <li>{language === 'ar' ? '114 سورة من القرآن الكريم كاملة' : 'Complete 114 Quran surahs'}</li>
              <li>{language === 'ar' ? 'إذاعة القرآن الكريم بث مباشر' : 'Live Quran radio streaming'}</li>
              <li>{language === 'ar' ? 'أناشيد إسلامية ومحاضرات دينية' : 'Islamic nasheeds and religious lectures'}</li>
              <li>{language === 'ar' ? 'مساعد ذكاء اصطناعي للبحث عن المحطات' : 'AI assistant to find stations'}</li>
              <li>{language === 'ar' ? 'وضع إسلامي لحجب المحتوى غير المناسب' : 'Islamic mode to filter inappropriate content'}</li>
              <li>{language === 'ar' ? 'مؤقت نوم ذكي' : 'Smart sleep timer'}</li>
              <li>{language === 'ar' ? 'يعمل كتطبيق على الهاتف (PWA)' : 'Works as a mobile app (PWA)'}</li>
              <li>{language === 'ar' ? 'مجاني بالكامل بدون إعلانات مزعجة' : 'Completely free without annoying ads'}</li>
            </ul>
          </article>

          {/* Footer links */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {language === 'ar'
                ? 'ابحث في اسمع راديو عن: اسمع راديو، راديو مباشر، بث مباشر راديو، إذاعة القرآن الكريم، راديو مصر، راديو السعودية، راديو تركيا، راديو بريطانيا، راديو أمريكا، راديو فرنسا، راديو ألمانيا، راديو اليابان، راديو الهند، أناشيد إسلامية، سورة البقرة، سورة الكهف، سورة يس، عبد الباسط عبد الصمد، مشاري العفاسي، راديو بالذكاء الاصطناعي، تطبيق راديو مجاني، أفضل موقع راديو، راديو بدون تقطيع، إذاعة إسلامية'
                : 'Search Esmaa Radio for: asmae radio, listen to radio, live radio, online radio, Quran radio, Egypt radio, Saudi Arabia radio, Turkey radio, UK radio, USA radio, France radio, Germany radio, Japan radio, India radio, Islamic nasheeds, Surah Baqarah, Surah Kahf, Surah Yasin, Abdul Basit Abdul Samad, Mishary Alafasy, AI radio, smart radio app, free radio app, best radio website, radio without interruptions, Islamic radio'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
