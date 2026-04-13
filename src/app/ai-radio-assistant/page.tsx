import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, Brain, Radio, Headphones, 
  Play, Globe,
  Smartphone, Zap, Shield, Heart
} from 'lucide-react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

export const metadata: Metadata = {
  title: 'مساعد الراديو الذكي - ذكاء اصطناعي لتشغيل الراديو بالصوت | اسمع راديو',
  description: 'مساعد ذكاء اصطناعي متقدم لتشغيل محطات الراديو والأذان والقرآن الكريم بالأوامر الصوتية. تحكم صوتي ذكي، اقتراحات مخصصة، وتجربة استماع فريدة.',
  keywords: [
    'مساعد راديو ذكي',
    'ذكاء اصطناعي راديو',
    'تشغيل راديو بالصوت',
    'مساعد ذكي صوتي',
    'AI radio assistant',
    'تحكم صوتي',
    'راديو ذكي',
    'أوامر صوتية',
    'مساعد اسمع راديو',
  ],
  alternates: {
    canonical: `${SITE_URL}/ai-radio-assistant`,
  },
  openGraph: {
    title: 'مساعد الراديو الذكي - ذكاء اصطناعي لتشغيل الراديو بالصوت',
    description: 'مساعد ذكاء اصطناعي متقدم لتشغيل محطات الراديو والقرآن الكريم بالأوامر الصوتية.',
    type: 'website',
    locale: 'ar_SA',
    url: `${SITE_URL}/ai-radio-assistant`,
    siteName: 'اسمع راديو',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'مساعد الراديو الذكي',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مساعد الراديو الذكي - ذكاء اصطناعي لتشغيل الراديو بالصوت',
    description: 'مساعد ذكاء اصطناعي متقدم لتشغيل محطات الراديو والقرآن الكريم بالأوامر الصوتية.',
    images: ['/icons/icon-512x512.png'],
  },
};

const features = [
  {
    icon: Mic,
    title: 'الأوامر الصوتية',
    description: 'تحدث مع المساعد بالعربية أو الإنجليزية. قل "شغّل إذاعة القرآن" أو "ابحث عن راديو مصري" وسيتولى المساعد الباقي.',
    commands: ['شغّل إذاعة القرآن', 'ابحث عن راديو مصري', 'أوقف البث', 'اعمل صوت أعلى'],
  },
  {
    icon: Brain,
    title: 'الذكاء الاصطناعي',
    description: 'يستخدم تقنيات الذكاء الاصطناعي لفهم طلباتك والرد عليها بشكل ذكي. يتعلم من تفضيلاتك مع الوقت.',
  },
  {
    icon: Radio,
    title: 'تشغيل الراديو',
    description: 'تشغيل فوري لأكثر من 40,000 محطة راديو من جميع أنحاء العالم. القرآن الكريم، الأناشيد، الأخبار، والموسيقى.',
  },
  {
    icon: Headphones,
    title: 'جودة عالية',
    description: 'بث مباشر بجودة عالية بدون تقطيع. اختر المحطة المناسبة بناءً على جودة البث وعدد المستمعين.',
  },
];

const voiceCommands = [
  { command: 'شغّل القرآن', action: 'تشغيل إذاعة القرآن الكريم' },
  { command: 'شغّل راديو [اسم المحطة]', action: 'تشغيل محطة معينة' },
  { command: 'ابحث عن [كلمة]', action: 'البحث في المحطات' },
  { command: 'أوقف', action: 'إيقاف البث' },
  { command: 'التالي', action: 'المحطة التالية' },
  { command: 'السابق', action: 'المحطة السابقة' },
  { command: 'صوت أعلى', action: 'رفع مستوى الصوت' },
  { command: 'صوت أقل', action: 'خفض مستوى الصوت' },
  { command: 'ما هي محطات [الدولة]', action: 'عرض محطات دولة معينة' },
  { command: 'شغّل إذاعة إسلامية', action: 'تشغيل إذاعة إسلامية' },
  { command: 'شغّل أناشيد', action: 'تشغيل إذاعة الأناشيد' },
  { command: 'شغّل أخبار', action: 'تشغيل إذاعة إخبارية' },
];

export default function AIRadioAssistantPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'مساعد الراديو الذكي',
    alternateName: 'AI Radio Assistant',
    description: 'مساعد ذكاء اصطناعي متقدم لتشغيل محطات الراديو والقرآن الكريم بالأوامر الصوتية.',
    url: `${SITE_URL}/ai-radio-assistant`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'الأوامر الصوتية',
      'الذكاء الاصطناعي',
      'تشغيل الراديو',
      'البحث الذكي',
      'الاقتراحات المخصصة',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <a href="/" className="hover:text-primary transition-colors">الرئيسية</a>
              </li>
              <li className="text-muted-foreground/50">/</li>
              <li className="text-foreground font-medium">مساعد الراديو الذكي</li>
            </ol>
          </nav>

          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/60 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <Brain className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              مساعد الراديو الذكي
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              ذكاء اصطناعي متقدم لتشغيل محطات الراديو والقرآن الكريم بالأوامر الصوتية
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="secondary" className="text-sm py-1.5">
                <Mic className="h-3.5 w-3.5 ms-1.5" />
                أوامر صوتية
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5">
                <Brain className="h-3.5 w-3.5 ms-1.5" />
                ذكاء اصطناعي
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5">
                <Globe className="h-3.5 w-3.5 ms-1.5" />
                عربي وإنجليزي
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5">
                <Shield className="h-3.5 w-3.5 ms-1.5" />
                مجاني
              </Badge>
            </div>
            
            <a href="/">
              <Button size="lg" className="gap-2">
                <Play className="h-5 w-5" />
                جرّب المساعد الآن
              </Button>
            </a>
          </div>

          {/* Features Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">المميزات</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    
                    {feature.commands && (
                      <div className="flex flex-wrap gap-2">
                        {feature.commands.map((cmd, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            "{cmd}"
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Voice Commands Table */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">الأوامر الصوتية</h2>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-end p-4 font-medium">الأمر الصوتي</th>
                        <th className="text-end p-4 font-medium">الإجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voiceCommands.map((cmd, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              "{cmd.command}"
                            </code>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {cmd.action}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* How It Works */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">كيف يعمل؟</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: 1, icon: Mic, title: 'تحدث', description: 'اضغط على زر الميكروفون وتحدث بالأمر الذي تريده' },
                { step: 2, icon: Brain, title: 'تحليل', description: 'يحلل الذكاء الاصطناعي طلبك ويفهم ما تريد' },
                { step: 3, icon: Radio, title: 'تشغيل', description: 'يتم تشغيل المحطة المطلوبة أو تنفيذ الأمر فوراً' },
              ].map((item) => (
                <Card key={item.step} className="text-center">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-full bg-primary text-white mx-auto mb-4 flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                    <h3 className="font-bold mb-2 flex items-center justify-center gap-2">
                      <item.icon className="h-4 w-4 text-primary" />
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-center">لماذا مساعد اسمع راديو؟</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: 'سريع', description: 'تشغيل فوري بدون تأخير' },
                { icon: Heart, title: 'شخصي', description: 'يتعلم من تفضيلاتك' },
                { icon: Smartphone, title: 'متاح', description: 'يعمل على جميع الأجهزة' },
                { icon: Shield, title: 'آمن', description: 'خصوصيتك محمية' },
              ].map((item, index) => (
                <div key={index} className="text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-8">
                <h2 className="text-2xl font-bold mb-4">جرّب المساعد الآن</h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  ابدأ باستخدام مساعد الراديو الذكي الآن واستمتع بتجربة استماع فريدة بالأوامر الصوتية.
                </p>
                <a href="/">
                  <Button size="lg" className="gap-2">
                    <Mic className="h-5 w-5" />
                    ابدأ الآن
                  </Button>
                </a>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              اسمع راديو - مساعد ذكي لتشغيل الراديو والقرآن الكريم
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
