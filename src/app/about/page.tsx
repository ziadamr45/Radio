'use client';

import { useRadioStore } from '@/stores/radio-store';
import { Radio, BookOpen, Globe, Users, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const { language } = useRadioStore();
  const isArabic = language === 'ar';

  const features = [
    {
      icon: Radio,
      title: isArabic ? 'محطات راديو مميزة' : 'Featured Radio Stations',
      description: isArabic 
        ? 'أكثر من 40,000 محطة راديو من جميع أنحاء العالم'
        : 'Over 40,000 radio stations from all around the world',
    },
    {
      icon: BookOpen,
      title: isArabic ? 'القرآن الكريم' : 'Holy Quran',
      description: isArabic
        ? 'استمع للقرآن الكريم بأصوات أشهر القراء'
        : 'Listen to the Holy Quran with famous reciters',
    },
    {
      icon: Globe,
      title: isArabic ? 'بث مباشر' : 'Live Streaming',
      description: isArabic
        ? 'بث مباشر بجودة عالية بدون تقطيع'
        : 'High quality live streaming without interruptions',
    },
    {
      icon: Sparkles,
      title: isArabic ? 'مساعد ذكي' : 'AI Assistant',
      description: isArabic
        ? 'مساعد ذكي للبحث والتوصيات'
        : 'Smart assistant for search and recommendations',
    },
    {
      icon: Users,
      title: isArabic ? 'متاح للجميع' : 'Available for Everyone',
      description: isArabic
        ? 'تطبيق مجاني بالكامل يعمل على جميع الأجهزة والمتصفحات'
        : 'Completely free app that works on all devices and browsers',
    },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-primary">
          {isArabic ? 'من نحن' : 'About Us'}
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-8">
            <p className="text-muted-foreground text-lg">
              {isArabic
                ? 'اسمع راديو هو تطبيق ويب تقدمي (PWA) متقدم يوفر تجربة استماع فريدة لمحطات الراديو من جميع أنحاء العالم والقرآن الكريم. نحن نسعى لتقديم أفضل تجربة مستخدم من خلال تصميم حديث وميزات مبتكرة.'
                : 'Esmaa Radio is an advanced Progressive Web App (PWA) that provides a unique listening experience for radio stations from around the world and the Holy Quran. We strive to provide the best user experience through modern design and innovative features.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {isArabic ? 'رؤيتنا' : 'Our Vision'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'نؤمن بأن استماع القرآن الكريم والمحطات الإذاعية يجب أن يكونا متاحين للجميع في أي وقت ومن أي مكان. هدفنا هو أن نكون المنصة الأولى للاستماع في العالم.'
                : 'We believe that listening to the Holy Quran and radio stations should be available to everyone at any time and from anywhere. Our goal is to be the premier listening platform in the world.'}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {isArabic ? 'مميزاتنا' : 'Our Features'}
            </h2>
            <div className="grid gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <feature.icon className="h-6 w-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {isArabic ? 'تقنياتنا' : 'Our Technology'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'نستخدم أحدث التقنيات لتقديم تجربة مستخدم سلسة، بما في ذلك Next.js للتطوير، وPWA للعمل بدون إنترنت، والذكاء الاصطناعي للتوصيات الذكية.'
                : 'We use the latest technologies to deliver a seamless user experience, including Next.js for development, PWA for offline functionality, and AI for smart recommendations.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
