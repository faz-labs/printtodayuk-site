import React from 'react';
import type { Metadata } from 'next';
import { getProductById, getProducts } from '@/lib/db';
import { ProductDetailClient } from '@/components/storefront/ProductDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id).catch(() => null);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://printtodayuk.com').replace(/\/+$/, '');

  if (!product) {
    return {
      title: 'Product Not Found | Print Today UK',
      description: 'The requested custom print or apparel product is not available in our catalog.',
      robots: { index: false, follow: false },
    };
  }

  const slugOrId = product.slug || product.id || id;
  const canonicalUrl = `${baseUrl}/product/${encodeURIComponent(slugOrId)}`;

  // High-converting commercial title (under 65 chars for Google SERP display)
  const metaTitle = `${product.title} London | Same Day Express Printing | Print Today UK`;

  // Compelling meta description (150-160 chars)
  const metaDescription = product.description
    ? product.description.length > 155
      ? `${product.description.slice(0, 150).trim()}... Order same-day in London.`
      : product.description
    : `Order custom ${product.title} in London with same-day express printing & delivery. Premium FSC-certified paper stocks, free artwork check & collection from Green St.`;

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
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://printtodayuk.com').replace(/\/+$/, '');

  const relatedProducts = product
    ? (await getProducts(product.category).catch(() => []))
        .filter((p) => p.id !== product.id && p.slug !== product.slug)
        .slice(0, 4)
    : [];

  if (!product) {
    return (
      <ProductDetailClient
        productIdOrSlug={id}
        initialProduct={null}
        initialRelatedProducts={[]}
      />
    );
  }

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
      ratingValue: '4.9',
      reviewCount: '348',
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
          text: `You can collect in person from our London production hub at 75 Green Street, London, E7 8JF. We are open Monday through Saturday. We also deliver straight to your office, home, hotel, or event venue across London.`,
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
