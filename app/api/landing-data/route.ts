import { NextResponse } from 'next/server';
import { getLandingSections, getProducts } from '@/lib/db';
import { DynamicSection, Product } from '@/lib/types';

// In-memory cache for ultra-fast (1-5ms) responses without waiting for Firestore
interface CachedPayload {
  sections: DynamicSection[];
  products: Product[];
  timestamp: number;
}

let memoryCache: CachedPayload | null = null;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function GET() {
  const now = Date.now();

  // 1. Serve immediately from memory cache if fresh
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        sections: memoryCache.sections,
        products: memoryCache.products,
        cached: true,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  }

  // 2. Refresh from Firestore/Database
  try {
    const [sections, products] = await Promise.all([
      getLandingSections().catch(() => []),
      getProducts().catch(() => []),
    ]);

    memoryCache = {
      sections,
      products,
      timestamp: now,
    };

    return NextResponse.json(
      {
        sections,
        products,
        cached: false,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching landing data:', error);
    // Return stale cache if available, else empty fallback
    if (memoryCache) {
      return NextResponse.json(
        {
          sections: memoryCache.sections,
          products: memoryCache.products,
          cached: true,
          fallback: true,
        },
        { status: 200 }
      );
    }
    return NextResponse.json({ sections: [], products: [] }, { status: 500 });
  }
}
