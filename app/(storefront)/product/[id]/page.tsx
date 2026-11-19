import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '@/lib/db';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';

// Revalidate product pages every 5 minutes (ISR) to cache static HTML on Edge CDN
// Drastically cuts Vercel serverless function invocations & Fluid Active CPU usage
export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

const PRIORITY_PRODUCT_META: Record<string, { title: string; description: string }> = {
  'business-cards': {
    title: 'Business Cards London | Same Day | Print Today UK',
    description:
      'Business cards from £18.84, printed in-house in London. Same-day options, free artwork check, collect free from Green St E7.',
  },
  'flyers': {
    title: 'Flyer Printing London | From £22.80 | Print Today UK',
    description:
      'Flyers from £22.80 for events, offers and launches. Printed in-house in London with same-day options and free artwork check.',
  },
  'large-format-posters': {
    title: 'Large Format Posters London | From £39.90 | Print Today',
    description:
      'Large format posters from £39.90, printed in-house in London. Sharp colour, fast turnaround, collect free from E7.',
  },
  'standard-roller-banners': {
    title: 'Roller Banners London | Print Today UK',
    description:
      'Roller banners printed in-house in London for events, shops and exhibitions. Fast turnaround, free artwork check.',
  },
  'wiro-bound-booklets': {
    title: 'Wiro Bound Booklets London | Print Today UK',
    description:
      'Wiro bound booklets printed in London for reports, manuals and menus. Choose your size and pages. Free artwork check.',
  },
  'flat-wall-planners': {
    title: '2027 Wall Planners | From £18.25 | Print Today UK',
    description:
      'Custom flat wall planners from £18.25. Branded for 2027, printed in-house in London. Order early for January.',
  },
  'wall-calendars': {
    title: 'Custom Wall Calendars 2027 London | Print Today UK',
    description:
      'Custom 2027 wall calendars printed in London for businesses and gifts. Free artwork check, collect free from E7.',
  },
  'wiro-bound-diaries': {
    title: 'Custom Wiro Bound Diaries 2027 | Print Today UK',
    description:
      'Branded wiro bound diaries from £188.18, printed in London. Perfect client and staff gifts for 2027.',
  },
  'flat-wrapping-paper': {
    title: 'Custom Wrapping Paper London | From £44.88',
    description:
      'Custom printed flat wrapping paper from £44.88 for shops and brands. Printed in London. Order early for Christmas.',
  },
  'gift-tags': {
    title: 'Custom Gift Tags London | From £24.53 | Print Today',
    description:
      'Custom printed gift tags from £24.53. Add your logo to every Christmas parcel. Printed in-house in London.',
  },
  'mugs': {
    title: 'Custom Printed Mugs London | Print Today UK',
    description:
      'Personalised mugs for staff, events and customer gifts. Printed in London with a free artwork check.',
  },
  'pens': {
    title: 'Custom Printed Pens London | Print Today UK',
    description:
      'Branded pens for events, offices and giveaways. Printed in London with a free artwork check and fast turnaround.',
  },
  'christmas-sample-pack': {
    title: 'Christmas Sample Pack for Agencies | Print Today UK',
    description:
      'Unbranded Christmas sample pack with desk, wall and seasonal print examples. Ideal for agencies and trade customers.',
  },
  't-shirts': {
    title: 'Custom T-Shirts London | Same Day Option | Print Today',
    description:
      'Custom printed t-shirts for teams, events and brands. DTF printing made in-house in East London. Small and bulk orders.',
  },
  'hoodies': {
    title: 'Custom Hoodies London | Print Today UK',
    description:
      'Custom printed hoodies with your logo on the front and back. Made in-house in East London. Small and bulk orders.',
  },
  'heras-fence-covers': {
    title: 'Heras Fence Covers Printed London | From £62.78',
    description:
      'Printed Heras fence covers from £62.78 for building sites, events and shops. Made in London.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.printtodayuk.com').replace(/\/+$/, '');

  if (!product) {
    notFound();
  }

  const slugOrId = product.slug || product.id || id;
  const canonicalUrl = `${baseUrl}/product/${encodeURIComponent(slugOrId)}`;

  // Check for priority product metadata mapping or use clean end-customer template
  const priorityMeta = PRIORITY_PRODUCT_META[slugOrId] || PRIORITY_PRODUCT_META[product.slug || ''];
  const fromPrice = product.price && product.price > 0 ? product.price.toFixed(2) : '14.69';

  const metaTitle = priorityMeta
    ? priorityMeta.title
    : `${product.title} London | Print Today UK`;

  const metaDescription = priorityMeta
    ? priorityMeta.description
    : `${product.title} printed in-house in London from £${fromPrice}. High quality finish, sharp colour. Same-day options, collect free from Green St E7.`;

  // Commercial intent & local London keywords
  const keywords = [
    product.title,
    `${product.title} London`,
    `same day ${product.title}`,
    `express ${product.title} London`,
    `custom ${product.title} UK`,
    `cheap ${product.title} printing`,
    `${product.title} next day delivery`,
    `same day printing London`,
    `print shop London E7`,
    product.category ? `${product.category} London` : 'commercial printing London',
    product.subcategory ? `${product.subcategory} printing` : 'digital printing London',
    'Print Today UK',
  ];

  // Resolve absolute image URL for OpenGraph & Twitter
  let primaryImage = product.imageUrl || '';
  if (primaryImage && !primaryImage.startsWith('http')) {
    primaryImage = primaryImage.startsWith('/')
      ? `${baseUrl}${primaryImage}`
      : `${baseUrl}/${primaryImage}`;
  }

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'Print Today UK',
      locale: 'en_GB',
      type: 'website',
      images: primaryImage
        ? [
            {
              url: primaryImage,
              width: 1200,
              height: 630,
              alt: `${product.title} - Same Day Printing London | Print Today UK`,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      site: '@printtodayuk',
      creator: '@printtodayuk',
      images: primaryImage ? [primaryImage] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.printtodayuk.com').replace(/\/+$/, '');

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getProducts(product.category).catch(() => []))
    .filter((p) => p.id !== product.id && p.slug !== product.slug)
    .slice(0, 4);

  const slugOrId = product.slug || product.id || id;
  const canonicalUrl = `${baseUrl}/product/${encodeURIComponent(slugOrId)}`;

  // Prepare images array for Schema
  const productImages = (product.images && product.images.length > 0 ? product.images : [product.imageUrl])
    .filter(Boolean)
    .map((img) => (img.startsWith('http') ? img : `${baseUrl}${img.startsWith('/') ? img : `/${img}`}`));

  const primaryImage = productImages[0] || `${baseUrl}/logo.png`;

  // 1. Schema.org Product Structured Data
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: productImages,
    description:
      product.description ||
      `Custom ${product.title} expertly printed in London with express same-day turnaround, collection, or courier delivery.`,
    sku: product.slug || product.id,
    mpn: product.id || product.slug,
    brand: {
      '@type': 'Brand',
      name: 'Print Today UK',
    },
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'GBP',
      price: (product.price && product.price > 0 ? product.price : 14.69).toFixed(2),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Print Today UK',
        url: baseUrl,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'GB',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: 'GBP',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'GB',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.6',
      reviewCount: '90',
      bestRating: '5',
      worstRating: '1',
    },
  };

  // 2. Schema.org BreadcrumbList Structured Data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: product.category || 'Printing',
        item: `${baseUrl}/category/${encodeURIComponent(product.category || 'Printing')}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: canonicalUrl,
      },
    ],
  };

  // 3. Schema.org FAQPage Structured Data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Can I get ${product.title} printed the same day in London?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes! Print Today UK specializes in rapid same-day turnaround for ${product.title}. Order online before our daily cutoff and pick up directly from our London studio at 75 Green Street, London, E7 8JF or have your order dispatched via express same-day London courier.`,
        },
      },
      {
        '@type': 'Question',
        name: `What artwork file formats and bleed are needed for ${product.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `We recommend supplying a press-ready PDF at 300 DPI in CMYK color mode with 3mm bleed on all edges. We also accept high-resolution AI, PSD, EPS, TIFF, and PNG files. Our in-house team provides a complimentary artwork inspection prior to printing.`,
        },
      },
      {
        '@type': 'Question',
        name: `Where can I collect my ${product.title} in London?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `You can collect in person from our London production hub at 75 Green Street, London, E7 8JF (open 7 days: Mon–Fri 7am–8pm, Sat 8am–5pm, Sun 8am–4pm). We also deliver straight to your office, home, hotel, or event venue across London.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I order bespoke or custom bulk quantities of ${product.title}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. In addition to our instant tiered price calculator up to 250,000 units, you can enter any custom quantity directly on this product page or message our London production desk on WhatsApp (+44 7969 559746) for custom trade quotes.`,
        },
      },
    ],
  };

  // 4. Schema.org LocalBusiness / PrintShop Structured Data
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${baseUrl}/#localbusiness`,
    name: 'Print Today UK',
    image: primaryImage,
    telephone: '+44 7969 559746',
    email: 'sales@printtodayuk.com',
    url: baseUrl,
    priceRange: '££',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '75 Green Street',
      addressLocality: 'London',
      postalCode: 'E7 8JF',
      addressCountry: 'GB',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '51.5367',
      longitude: '0.0336',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '07:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Sunday'],
        opens: '08:00',
        closes: '16:00',
      },
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.aeo-quick-answer', '.aeo-summary', 'h1', '.speakable-text'],
    },
    sameAs: [
      'https://www.instagram.com/printtodayuk',
      'https://www.trustpilot.com/review/printtodayuk.com',
    ],
  };

  return (
    <>
      {/* Schema.org Structured Data Injections for Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <ProductDetailClient
        productIdOrSlug={id}
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </>
  );
}
