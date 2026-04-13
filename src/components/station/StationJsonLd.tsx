interface StationJsonLdProps {
  name: string;
  description: string;
  url: string;
  stationId: string;
  country?: string;
  tags?: string;
  image?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://asmaeradio.com';

export function StationJsonLd({
  name,
  description,
  url,
  stationId,
  country,
  tags,
  image,
}: StationJsonLdProps) {
  const stationUrl = `${SITE_URL}/station/${stationId}`;
  const imageUrl = image || `${SITE_URL}/icons/icon-512x512.png`;

  // AudioObject schema for radio streaming
  const audioObjectSchema = {
    '@context': 'https://schema.org',
    '@type': 'AudioObject',
    name: name,
    description: description,
    url: stationUrl,
    encodingFormat: 'audio/mpeg',
    contentUrl: url,
    thumbnailUrl: imageUrl,
    author: {
      '@type': 'Organization',
      name: name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'اسمع راديو',
      url: SITE_URL,
    },
  };

  // RadioStation schema
  const radioStationSchema = {
    '@context': 'https://schema.org',
    '@type': 'RadioStation',
    name: name,
    description: description,
    url: stationUrl,
    image: imageUrl,
    areaServed: country ? {
      '@type': 'Country',
      name: country,
    } : undefined,
    genre: tags ? tags.split(',').map(t => t.trim()) : ['Radio', 'Arabic'],
    broadcastDisplayName: name,
    parentService: {
      '@type': 'RadioService',
      name: 'اسمع راديو',
      url: SITE_URL,
    },
  };

  // BreadcrumbList schema for navigation
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'الرئيسية',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: name,
        item: stationUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(audioObjectSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(radioStationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}
