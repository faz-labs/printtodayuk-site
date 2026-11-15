import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getProducts } from '@/lib/db';
import { CategoryClient } from '@/components/storefront/CategoryClient';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export const CATEGORY_METADATA_MAP: Record<string, { title: string; description: string }> = {
  'printing': {
    title: 'Printing Services London | Print Today UK',
    description:
      'Full colour printing in East London: documents, flyers, posters, booklets and more. Same-day options, free collection or London courier.',
  },
  'books & booklets': {
    title: 'Booklet & Book Printing London | Print Today',
    description:
      'Wiro bound and perfect bound booklets, notebooks and books printed in-house in London. Free artwork check on every order.',
  },
  'business cards': {
    title: 'Business Cards London | Same Day | Print Today',
    description:
      'Standard, uncoated and folded business cards from £18.41. Same-day options in London. Free artwork check, collect free from E7.',
  },
  'catalogues & samples': {
    title: 'Catalogue & Sample Pack Printing London | Print Today',
    description:
      'Catalogues, swatch books and unbranded sample packs printed in London. Ideal for agencies and trade customers.',
  },
  'events & exhibitions': {
    title: 'Exhibition & Event Print London | Print Today UK',
    description:
      'Pop-up displays, fabric stands, lightboxes and event graphics printed in-house in London. Fast turnaround for expos and shows.',
  },
  'flyers & leaflets': {
    title: 'Flyer & Leaflet Printing London | From £22.80',
    description:
      'Flyers from £22.80 plus folded and creased leaflets, printed in-house in London. Same-day options, free collection from E7.',
  },
  'merchandise': {
    title: 'Branded Merchandise London | Mugs, Pens, Bags',
    description:
      'Custom mugs, pens, paper bags and promotional gifts for clients and staff. Printed in London with a free artwork check.',
  },
  'outdoor': {
    title: 'Outdoor Banners, Flags & Fence Covers London',
    description:
      'Heras fence covers, teardrop and feather flags, crowd barrier covers and outdoor banners printed in London.',
  },
  'point of sale': {
    title: 'Point of Sale Print London | Menus & Table Talkers',
    description:
      'Table talkers, strut cards, menus and in-store displays printed in-house in London. Same-day options for cafes, bars and shops.',
  },
  'posters & flexible media': {
    title: 'Poster & Large Format Printing London | £39.90',
    description:
      'Large format posters from £39.90, backlit posters and flexible media printed in-house in London. Fast turnaround.',
  },
  'rigid media': {
    title: 'Foam Board, Correx & Rigid Signs London | Print Today',
    description:
      'Foam signs, display boards, Correx and aluminium composite signage printed in London. Same-day options available.',
  },
  'roller banners': {
    title: 'Roller Banners London | Pull Up Banners | Print Today',
    description:
      'Standard, premium, wide and double-sided roller banners printed in-house in London. Fast turnaround for events and shops.',
  },
  'seasonal': {
    title: 'Christmas & 2027 Calendars, Planners | Print Today',
    description:
      'Custom 2027 wall planners, calendars and diaries plus wrapping paper and gift tags. Printed in London, order early for Christmas.',
  },
  'stationery': {
    title: 'Business Stationery London | Letterheads & More',
    description:
      'Letterheads, compliment slips, notepads and presentation folders printed in London. Free artwork check, fast turnaround.',
  },
  'stickers & labels': {
    title: 'Stickers & Labels London | Custom Printed',
    description:
      'Custom stickers, decals and labels printed in-house in London. Small and bulk runs with fast turnaround.',
  },
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);
  const categories = await getCategories().catch(() => []);
  const matched = categories.find((c) => c.name.toLowerCase() === decodedCategory.toLowerCase());

  if (!matched && decodedCategory.toLowerCase() !== 'printing') {
    notFound();
  }

  const normalized = decodedCategory.toLowerCase().trim();
  const metaOverride = CATEGORY_METADATA_MAP[normalized];
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.printtodayuk.com').replace(/\/+$/, '');
  const canonicalUrl = `${baseUrl}/category/${encodeURIComponent(decodedCategory)}`;

  const metaTitle = metaOverride?.title || `${decodedCategory} London | Print Today UK`;
  const metaDescription =
    metaOverride?.description ||
    `Order custom ${decodedCategory} printed in London with express turnaround, free artwork check & collection from 75 Green St, London E7.`;

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: 'Print Today UK',
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      site: '@printtodayuk',
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.printtodayuk.com').replace(/\/+$/, '');

  const [prodsData, catsData] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const matchedCat = catsData.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  );

  // Return true 404 if category is unknown (P0-2 fix)
  if (!matchedCat && categoryName.toLowerCase() !== 'printing') {
    notFound();
  }

  const cleanCats = catsData.filter(
    (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
  );
  cleanCats.sort((a, b) => a.name.localeCompare(b.name));

  const catTarget = categoryName.toLowerCase().trim();
  const catProducts = prodsData.filter((p) => {
    const pCat = (p.category || '').toLowerCase().trim();
    const pSub = (p.subcategory || '').toLowerCase().trim();
    return (
      pCat === catTarget ||
      (pSub && pSub === catTarget) ||
      pCat.includes(catTarget) ||
      p.title.toLowerCase().includes(catTarget)
    );
  });

  const canonicalUrl = `${baseUrl}/category/${encodeURIComponent(categoryName)}`;

  // Breadcrumb schema
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
        name: categoryName,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CategoryClient
        categoryName={categoryName}
        initialCategoryConfig={matchedCat || null}
        initialProducts={catProducts}
        allCategories={cleanCats}
      />
    </>
  );
}
