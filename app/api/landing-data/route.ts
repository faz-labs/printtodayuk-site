import { NextRequest, NextResponse } from 'next/server';
import { getLandingSections, getProducts, getCategories, invalidateLandingSectionsCache } from '@/lib/db';
import { DynamicSection, Product, CategoryConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface CachedPayload {
  sections: DynamicSection[];
  products: Product[];
  categories: CategoryConfig[];
  timestamp: number;
}

let memoryCache: CachedPayload | null = null;
const CACHE_TTL_MS = 5 * 1000; // 5 seconds max for snappy real-time updates

export async function POST() {
  memoryCache = null;
  invalidateLandingSectionsCache();
  return NextResponse.json({ success: true, message: 'Landing data cache invalidated' });
}

export async function GET(req: NextRequest) {
  const now = Date.now();
  const url = new URL(req.url);
  const isFreshRequested = url.searchParams.has('t') || url.searchParams.has('fresh');

  // 1. Serve from short-lived memory cache if fresh and not explicitly bypassed
  if (!isFreshRequested && memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        sections: memoryCache.sections,
        products: memoryCache.products,
        categories: memoryCache.categories,
        cached: true,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  // 2. Refresh from Firestore/Database
  try {
    const [sections, products, categories] = await Promise.all([
      getLandingSections().catch(() => []),
      getProducts().catch(() => []),
      getCategories().catch(() => []),
    ]);

    memoryCache = {
      sections,
      products,
      categories,
      timestamp: now,
    };

    return NextResponse.json(
      {
        sections,
        products,
        categories,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching landing data:', error);
    if (memoryCache) {
      return NextResponse.json(
        {
          sections: memoryCache.sections,
          products: memoryCache.products,
          categories: memoryCache.categories,
          cached: true,
          fallback: true,
        },
        { status: 200 }
      );
    }
    return NextResponse.json({ sections: [], products: [], categories: [] }, { status: 500 });
  }
}
