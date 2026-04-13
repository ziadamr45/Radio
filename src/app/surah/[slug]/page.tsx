import { Metadata } from 'next';
import SurahClient from '@/components/quran/SurahClient';
import { 
  SURAHS, 
  getSurahBySlug, 
  getAllSurahSlugs,
  type SurahData 
} from '@/lib/surahs-dataset';
import { RECITERS, getPopularReciters } from '@/lib/reciters-dataset';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

// Generate static params for all 114 surahs
export async function generateStaticParams() {
  const slugs = getAllSurahSlugs();
  
  console.log(`[generateStaticParams:Surahs] Generating ${slugs.length} surah pages`);
  
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const surah = getSurahBySlug(slug);

  if (!surah) {
    return {
      title: 'سورة من القرآن الكريم | اسمع راديو',
      description: 'استمع إلى سور القرآن الكريم بأصوات أشهر القراء.',
    };
  }

  // SEO-optimized title
  const title = `سورة ${surah.nameAr} mp3 | استمع وحمّل بأصوات القراء`;
  
  // Description
  const description = surah.descriptionAr || 
    `استمع إلى سورة ${surah.nameAr} بجودة عالية من أشهر القراء. ${surah.englishName} - ${surah.numberOfAyahs} آية.`;
  
  // Keywords
  const keywords = [
    surah.nameAr,
    surah.name,
    `سورة ${surah.nameAr}`,
    `${surah.nameAr} mp3`,
    `${surah.nameAr} استماع`,
    `${surah.nameAr} تحميل`,
    'قرآن كريم',
    'استماع القرآن',
    'سور القرآن',
    surah.englishName,
    `surah ${surah.name}`,
    surah.revelationType === 'Meccan' ? 'سورة مكية' : 'سورة مدنية',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_URL}/surah/${surah.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      locale: 'ar_SA',
      url: `${SITE_URL}/surah/${surah.slug}`,
      siteName: 'اسمع راديو',
      images: [
        {
          url: '/icons/icon-512x512.png',
          width: 512,
          height: 512,
          alt: `سورة ${surah.nameAr}`,
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
    },
  };
}

// Generate JSON-LD structured data
function generateSurahJsonLd(surah: SurahData) {
  const surahUrl = `${SITE_URL}/surah/${surah.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `سورة ${surah.nameAr}`,
    name: surah.nameAr,
    alternateName: surah.englishName,
    description: surah.descriptionAr,
    position: surah.number,
    inLanguage: 'ar',
    author: {
      '@type': 'Organization',
      name: 'الله سبحانه وتعالى',
    },
    isPartOf: {
      '@type': 'Book',
      name: 'القرآن الكريم',
      numberOfPages: 114,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': surahUrl,
    },
    wordCount: surah.numberOfAyahs,
  };
}

// Server Component
export default async function SurahPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const surah = getSurahBySlug(slug);

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">السورة غير موجودة</h1>
          <p className="text-muted-foreground">لم يتم العثور على هذه السورة</p>
        </div>
      </div>
    );
  }

  // Get popular reciters for this surah
  const reciters = getPopularReciters().slice(0, 12);

  // JSON-LD script
  const jsonLd = generateSurahJsonLd(surah);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SurahClient surah={surah} reciters={reciters} />
    </>
  );
}
