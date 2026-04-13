import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import GenrePageClient from '@/components/genre/GenrePageClient';
import {
  fetchFromRadioBrowser,
  calculateQualityScore,
  GENRE_CONFIG,
  ALL_GENRE_SLUGS,
} from '@/lib/country-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

// Allow dynamic params for genres added later
export const dynamicParams = true;

// Generate static params for all 8 genres
export async function generateStaticParams() {
  return ALL_GENRE_SLUGS.map((slug) => ({
    slug,
  }));
}

// Generate metadata per genre
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const genre = GENRE_CONFIG[slug];

  if (!genre) {
    return {
      title: 'راديو مباشر | اسمع راديو',
      description: 'استمع إلى محطات الراديو على اسمع راديو.',
    };
  }

  const title = `راديو ${genre.nameAr} مباشر | محطات ${genre.nameAr} بث مباشر - اسمع راديو`;
  const description = `استمع إلى محطات راديو ${genre.nameAr} بث مباشر. أفضل محطات ${genre.nameAr} من جميع أنحاء العالم على اسمع راديو. ${genre.description.slice(0, 120)}.`;

  // Fetch top 10 stations for keyword extraction
  let topStationNames: string[] = [];
  try {
    const stations = await fetchFromRadioBrowser(
      `/stations/bytag/${encodeURIComponent(genre.tag)}?limit=10&order=votes&reverse=true`
    );
    topStationNames = (stations as Array<{ name: string }>)
      .map((s) => s.name)
      .slice(0, 10);
  } catch {
    // Silently fail
  }

  const keywords = [
    `راديو ${genre.nameAr}`,
    `راديو ${genre.nameAr} مباشر`,
    `محطات ${genre.nameAr}`,
    `إذاعة ${genre.nameAr}`,
    `بث مباشر ${genre.nameAr}`,
    `${genre.nameAr} اون لاين`,
    `${genre.nameEn} radio`,
    `${genre.nameEn} radio live`,
    `${genre.nameEn} radio stations`,
    'راديو مباشر',
    'بث مباشر',
    'محطات إذاعية',
    'اسمع راديو',
    'راديو عالمي',
    'online radio',
    ...genre.keywords,
    ...topStationNames.slice(0, 5),
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_URL}/genre/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ar_SA',
      url: `${SITE_URL}/genre/${slug}`,
      siteName: 'اسمع راديو',
      images: [
        {
          url: '/icons/icon-512x512.png',
          width: 512,
          height: 512,
          alt: `راديو ${genre.nameAr} مباشر - اسمع راديو`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/icons/icon-512x512.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  };
}

// Generate SEO-rich Arabic content per genre
function generateGenreSEOContent(genre: typeof GENRE_CONFIG[string], stationCount: number): string {
  const genreNameAr = genre.nameAr;
  const genreNameEn = genre.nameEn;

  const contentMap: Record<string, string> = {
    quran: `
      <h2>إذاعات القرآن الكريم بث مباشر</h2>
      <p>استمع إلى إذاعات القرآن الكريم بث مباشر على مدار الساعة من مختلف أنحاء العالم الإسلامي. نقدم لكم أكبر مجموعة من محطات إذاعة القرآن الكريم التي تبث تلاوات قرآنية عذبة بأصوات أشهر القراء.</p>
      <h2>أفضل إذاعات القرآن الكريم</h2>
      <p>تضم صفحة القرآن الكريم على اسمع راديو أكثر من ${stationCount} محطة إذاعية متخصصة في بث القرآن الكريم. من إذاعة القرآن الكريم المصرية إلى إذاعة القرآن الكريم السعودية وجميع إذاعات القرآن من مختلف أنحاء العالم.</p>
      <h2>مميزات الاستماع إلى القرآن الكريم عبر اسمع راديو</h2>
      <p>بث مباشر بجودة عالية وبدون تقطيع، تلاوات من مختلف القراء، بث على مدار 24 ساعة، إمكانية حفظ المحطات المفضلة. اسمع راديو هو وجهتكم المثالية للاستماع إلى كلام الله تعالى في أي وقت ومن أي مكان.</p>
    `,
    islamic: `
      <h2>المحطات الإذاعية الإسلامية بث مباشر</h2>
      <p>استمع إلى أفضل المحطات الإذاعية الإسلامية بث مباشر. نقدم لكم مجموعة متنوعة من المحطات التي تقدم برامج دينية ومواعظ وخطب وأناشيد إسلامية ومحتوى تعليمي.</p>
      <h2>محتوى إسلامي متنوع</h2>
      <p>تشمل محطاتنا الإسلامية برامج في تفسير القرآن والحديث النبوي والفقه الإسلامي والسيرة النبوية. كما تقدم المحطات أناشيد إسلامية وأدعية. مع أكثر من ${stationCount} محطة إذاعية إسلامية، ستجد محتوى يناسب جميع الأعمار والاهتمامات.</p>
      <h2>لماذا اسمع راديو للبرامج الإسلامية؟</h2>
      <p>نوفر لكم بث مباشر بجودة صوت عالية مع ضمان عدم التقطيع. يمكنكم الاستماع من أي جهاز متصل بالإنترنت بدون تحميل أي تطبيق.</p>
    `,
    nasheed: `
      <h2>محطات الأناشيد الإسلامية بث مباشر</h2>
      <p>استمع إلى أجمل الأناشيد الإسلامية بث مباشر على اسمع راديو. نقدم لكم أكثر من ${stationCount} محطة متخصصة في بث الأناشيد الإسلامية بدون موسيقى.</p>
      <h2>أناشيد إسلامية متنوعة</h2>
      <p>من الأناشيد الدينية التقليدية إلى الأناشيد الحديثة، نقدم لكم تشكيلة واسعة من الإنشاد الإسلامي. أناشيد للأطفال والكبار، أناشيد عن الرسول ﷺ، أناشيد في مدح الرسول، وأناشيد تربوية وتعليمية.</p>
      <h2>استمع إلى الأناشيد بدون موسيقى</h2>
      <p>جميع المحطات في قسم الأناشيد تقدم إنشاداً إسلامياً خالياً من الموسيقى وفقاً للضوابط الشرعية. استمتع بأجمل الأصوات والكلمات التي تلامس القلب.</p>
    `,
    music: `
      <h2>محطات راديو الموسيقى بث مباشر</h2>
      <p>استمع إلى أفضل محطات راديو الموسيقى العالمية بث مباشر. نقدم لكم أكثر من ${stationCount} محطة موسيقية متنوعة تغطي جميع الأذواق الموسيقية.</p>
      <h2>موسيقى من حول العالم</h2>
      <p>من الموسيقى الكلاسيكية إلى أحدث الأغاني الشعبية، ومن الجاز إلى البوب والروك. ستجد محطة موسيقية تناسب ذوقك في قائمة راديو الموسيقى على اسمع راديو.</p>
      <h2>أحدث الأغاني والألبومات</h2>
      <p>محطاتنا الموسيقية تبث أحدث الأغاني والألبومات من أشهر الفنانين حول العالم. ابقَ على اطلاع بأحدث الإصدارات الموسيقية من خلال راديو الموسيقى.</p>
    `,
    news: `
      <h2>محطات راديو الأخبار بث مباشر</h2>
      <p>استمع إلى محطات الأخبار بث مباشر لتكون على اطلاع دائم بأحدث المستجدات المحلية والعالمية. نقدم لكم أكثر من ${stationCount} محطة إذاعية إخبارية.</p>
      <h2>أخبار عربية وعالمية على مدار الساعة</h2>
      <p>محطاتنا الإخبارية تغطي جميع الأحداث الهامة من مختلف أنحاء العالم. من الأخبار السياسية والاقتصادية إلى الرياضية والثقافية.</p>
      <h2>تابع الأخبار أثناء التنقل</h2>
      <p>مع اسمع راديو، يمكنك متابعة آخر الأخبار أثناء القيادة أو العمل أو في أي وقت. بث مباشر بجودة صوت واضحة يضمن لكم عدم تفويت أي خبر مهم.</p>
    `,
    sport: `
      <h2>محطات راديو الرياضة بث مباشر</h2>
      <p>استمع إلى محطات راديو الرياضة بث مباشر لتتابع أحدث الأحداث الرياضية والبطولات والمباريات. نقدم لكم أكثر من ${stationCount} محطة رياضية.</p>
      <h2>تعليق رياضي مباشر</h2>
      <p>تابع المباريات مباشرة مع أفضل المعلقين الرياضيين. من كرة القدم إلى كرة السلة والتنس وجميع الرياضات الأخرى.</p>
      <h2>أخبار رياضية وتحليلات</h2>
      <p>محطاتنا الرياضية لا تقدم التعليق المباشر فحسب، بل أيضاً أخباراً رياضية وتحليلات وتوقعات للمباريات والبطولات المختلفة.</p>
    `,
    talk: `
      <h2>محطات الراديو الحوارية بث مباشر</h2>
      <p>استمع إلى محطات الراديو الحوارية بث مباشر التي تقدم برامج حوارية وندوات ومناقشات في مختلف المجالات. نقدم لكم أكثر من ${stationCount} محطة حوارية.</p>
      <h2>برامج حوارية متنوعة</h2>
      <p>من البرامج السياسية والاقتصادية إلى البرامج الاجتماعية والثقافية. محطاتنا الحوارية تقدم محتوى غنياً يلامس جميع جوانب الحياة.</p>
      <h2>تفاعل مباشر مع المذيعين</h2>
      <p>بعض محطاتنا الحوارية تتيح للمستمعين التفاعل المباشر مع المذيعين والضيوف عبر الهاتف أو وسائل التواصل الاجتماعي.</p>
    `,
    entertainment: `
      <h2>محطات الراديو الترفيهية بث مباشر</h2>
      <p>استمع إلى محطات الراديو الترفيهية بث مباشر التي تقدم برامج ترفيهية ومسابقات وكوميديا. نقدم لكم أكثر من ${stationCount} محطة ترفيهية.</p>
      <h2>ترفيه لجميع الأعمار</h2>
      <p>من البرامج الصباحية المنعشة إلى البرامج المسائية الممتعة. محطاتنا الترفيهية تقدم محتوى يناسب جميع أفراد العائلة.</p>
      <h2>مسابقات وجوائز</h2>
      <p>بعض محطاتنا الترفيهية تنظم مسابقات أسبوعية وشهرية مع جوائز قيمة. تابعوا البرامج الترفيهية على اسمع راديو ولا تفوتوا أي فرصة للفوز.</p>
    `,
  };

  return contentMap[genre.slug] || `
    <h2>راديو ${genreNameAr} بث مباشر</h2>
    <p>استمع إلى محطات راديو ${genreNameAr} بث مباشر على اسمع راديو. نقدم لكم أكثر من ${stationCount} محطة ${genreNameAr.toLowerCase()} من جميع أنحاء العالم.</p>
    <h2>محطات ${genreNameAr} متنوعة</h2>
    <p>تشمل قائمتنا أفضل محطات ${genreNameAr} التي تقدم محتوى مميز وبث مباشر على مدار الساعة. استمتع بأفضل البرامج ${genreNameAr} بجودة عالية.</p>
  `;
}

export default async function GenrePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const genre = GENRE_CONFIG[slug];

  if (!genre) {
    notFound();
  }

  // Fetch top 100 stations for this genre
  let rawStations: Array<Record<string, unknown>> = [];
  try {
    const stations = await fetchFromRadioBrowser(
      `/stations/bytag/${encodeURIComponent(genre.tag)}?limit=100&order=votes&reverse=true`
    );
    rawStations = (stations as Array<Record<string, unknown>>).map((station) => ({
      ...station,
      qualityScore: calculateQualityScore(station),
    }));
  } catch (error) {
    console.error(`[GenrePage] Failed to fetch stations for ${slug}:`, error);
  }

  const stationCount = rawStations.length;
  const seoContentHtml = generateGenreSEOContent(genre, stationCount);

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/genre/${slug}`,
        url: `${SITE_URL}/genre/${slug}`,
        name: `راديو ${genre.nameAr} مباشر | اسمع راديو`,
        description: `استمع إلى محطات راديو ${genre.nameAr} بث مباشر. أفضل محطات ${genre.nameAr} على اسمع راديو.`,
        inLanguage: 'ar',
        isPartOf: {
          '@id': `${SITE_URL}/#website`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElements: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'الرئيسية',
            item: SITE_URL,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'التصنيفات',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: genre.nameAr,
            item: `${SITE_URL}/genre/${slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
        {/* Hero Section - Server Rendered */}
        <section
          className="border-b"
          style={{
            background: `linear-gradient(135deg, ${genre.color}15 0%, ${genre.color}05 50%, transparent 100%)`,
          }}
        >
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex items-center gap-2 text-sm text-muted-foreground">
                <li>
                  <a href="/" className="hover:text-primary transition-colors">
                    الرئيسية
                  </a>
                </li>
                <li>/</li>
                <li>
                  <span className="text-foreground font-medium">{genre.nameAr}</span>
                </li>
              </ol>
            </nav>

            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${genre.color}20, ${genre.color}40)`,
                }}
              >
                {genre.slug === 'quran' && '📖'}
                {genre.slug === 'islamic' && '🕌'}
                {genre.slug === 'nasheed' && '🎤'}
                {genre.slug === 'music' && '🎵'}
                {genre.slug === 'news' && '📰'}
                {genre.slug === 'sport' && '⚽'}
                {genre.slug === 'talk' && '🎙️'}
                {genre.slug === 'entertainment' && '🎭'}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  راديو {genre.nameAr} مباشر
                </h1>
                <p className="text-muted-foreground text-lg mb-3">
                  {genre.nameEn} Radio — {genre.description.slice(0, 80)}...
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className="px-4 py-1.5 rounded-full text-sm font-medium"
                    style={{
                      backgroundColor: `${genre.color}15`,
                      color: genre.color,
                    }}
                  >
                    📻 {stationCount.toLocaleString('ar-EG')} محطة
                  </div>
                  <div className="bg-green-500/10 text-green-600 px-4 py-1.5 rounded-full text-sm font-medium">
                    ✅ بث مباشر بدون تقطيع
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Client Island - Interactive Stations List */}
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <GenrePageClient
            genreSlug={slug}
            genreConfig={genre}
            initialStations={rawStations}
          />

          {/* SEO Content Section */}
          <section className="mt-12 prose prose-sm dark:prose-invert max-w-none">
            <div
              className="bg-muted/30 rounded-xl p-6"
              dangerouslySetInnerHTML={{ __html: seoContentHtml }}
            />
          </section>

          {/* Other Genres Links */}
          <section className="mt-8">
            <h2 className="text-lg font-bold mb-4">تصنيفات أخرى</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_GENRE_SLUGS.filter((s) => s !== slug).map((otherSlug) => {
                const otherGenre = GENRE_CONFIG[otherSlug];
                return (
                  <a
                    key={otherSlug}
                    href={`/genre/${otherSlug}`}
                    className="px-4 py-2 rounded-lg text-sm font-medium border hover:shadow-md transition-all"
                    style={{
                      borderColor: `${otherGenre.color}30`,
                      backgroundColor: `${otherGenre.color}08`,
                      color: otherGenre.color,
                    }}
                  >
                    {otherGenre.nameAr}
                  </a>
                );
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t pb-24 text-center">
            <p className="text-sm text-muted-foreground">
              اسمع راديو - بث مباشر لجميع محطات راديو {genre.nameAr} | {genre.nameEn} Radio
              Live
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}
