import { Metadata } from 'next';
import ReciterClient from '@/components/quran/ReciterClient';
import { 
  RECITERS, 
  getReciterBySlug, 
  getAllReciterSlugs,
  type ReciterData 
} from '@/lib/reciters-dataset';
import { SURAHS } from '@/lib/surahs-dataset';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

// Generate static params for all reciters
export async function generateStaticParams() {
  const slugs = getAllReciterSlugs();
  
  console.log(`[generateStaticParams:Reciters] Generating ${slugs.length} reciter pages`);
  
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
  const reciter = getReciterBySlug(slug);

  if (!reciter) {
    return {
      title: 'قارئ القرآن | اسمع راديو',
      description: 'استمع إلى تلاوات القرآن الكريم بأصوات أشهر القراء.',
    };
  }

  // SEO-optimized title
  const title = `الشيخ ${reciter.nameAr} | استمع للقرآن الكريم كامل mp3`;
  
  // Description
  const description = reciter.bioAr || 
    `استمع إلى تلاوات الشيخ ${reciter.nameAr} بجودة عالية لجميع السور. قارئ من ${reciter.country}.`;
  
  // Keywords
  const keywords = [
    reciter.nameAr,
    reciter.name,
    `${reciter.nameAr} قرآن`,
    `${reciter.nameAr} mp3`,
    'تلاوات قرآنية',
    'قرآن كريم',
    'استماع القرآن',
    'تحميل القرآن',
    reciter.country,
    'قارئ قرآن',
    'تلاوة',
    'تجويد',
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `${SITE_URL}/reciter/${reciter.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: 'ar_SA',
      url: `${SITE_URL}/reciter/${reciter.slug}`,
      siteName: 'اسمع راديو',
      images: [
        {
          url: '/icons/icon-512x512.png',
          width: 512,
          height: 512,
          alt: reciter.nameAr,
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
function generateReciterJsonLd(reciter: ReciterData) {
  const reciterUrl = `${SITE_URL}/reciter/${reciter.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: reciter.nameAr,
    alternateName: reciter.name,
    description: reciter.bioAr,
    jobTitle: 'قارئ القرآن الكريم',
    nationality: {
      '@type': 'Country',
      name: reciter.country,
    },
    url: reciterUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': reciterUrl,
    },
    knowsAbout: ['القرآن الكريم', 'التجويد', 'التلاوة'],
  };
}

// Server Component
export default async function ReciterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reciter = getReciterBySlug(slug);

  if (!reciter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">القارئ غير موجود</h1>
          <p className="text-muted-foreground">لم يتم العثور على هذا القارئ</p>
        </div>
      </div>
    );
  }

  // Get all surahs for this reciter
  const surahs = SURAHS;

  // JSON-LD script
  const jsonLd = generateReciterJsonLd(reciter);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReciterClient reciter={reciter} surahs={surahs} />
    </>
  );
}
