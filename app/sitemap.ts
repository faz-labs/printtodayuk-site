import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/lib/db';

export const revalidate = 3600; // Cache and revalidate hourly

function parseSafeDate(val: any): Date {
  if (!val) return new Date();
  const d = new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}

// Key apparel products guaranteed to be indexed
const KNOWN_APPAREL_SLUGS = [
  't-shirts',
  'hoodies',
  'sweatshirts',
  'polo-shirts',
  'tote-bags',
  'workwear-high-vis',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.printtodayuk.com').replace(/\/+$/, '');

  // 1. Core High-Priority Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/same-day-printing`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/all-products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/clothing`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/category/Printing`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Ad Campaign High-Intent Landing Pages (P1-6)
    {
      url: `${baseUrl}/christmas-printing`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/new-year-2027-calendars-planners`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/printing-east-london`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/same-day-t-shirt-printing-london`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/document-printing-near-me`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // 2. Dynamic Categories
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await getCategories();
    categoryRoutes = categories
      .filter((c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing')
      .map((c) => ({
        url: `${baseUrl}/category/${encodeURIComponent(c.name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      }));
  } catch (err) {
    console.warn('Sitemap category fetch error:', err);
  }

  // 3. Dynamic Products + Guaranteed Clothing Products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    const seenUrls = new Set<string>();

    for (const p of products) {
      if (!p) continue;
      const slugOrId = p.slug || p.id;
      if (!slugOrId) continue;

      const url = `${baseUrl}/product/${encodeURIComponent(slugOrId)}`;
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      productRoutes.push({
        url,
        lastModified: parseSafeDate(p.updatedAt || p.createdAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }

    // Ensure known apparel products are always included (P1-2)
    for (const slug of KNOWN_APPAREL_SLUGS) {
      const url = `${baseUrl}/product/${slug}`;
      if (!seenUrls.has(url)) {
        seenUrls.add(url);
        productRoutes.push({
          url,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch (err) {
    console.warn('Sitemap product fetch error:', err);
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
