import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, checkRateLimit, logAdminAudit } from '@/lib/adminAuth';
import { getProductById, updateProduct } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface RouteProps {
  params: Promise<{ slug: string }>;
}

/**
 * Process 4: PUT /api/admin/products/:slug
 * Updates a specific product by slug.
 */
export async function PUT(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  // 1. Authentication Check
  const auth = verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // 2. Rate Limiting Check
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Try again in a minute.' },
      { status: 429 }
    );
  }

  try {
    const existing = await getProductById(decodedSlug);
    if (!existing) {
      return NextResponse.json(
        { error: `Product with slug "${decodedSlug}" not found.` },
        { status: 404 }
      );
    }

    const updates = await request.json();

    const updated = await updateProduct(existing.id || existing.slug, updates);

    await logAdminAudit({
      action: 'single_product_update',
      identity: auth.identity,
      slug: decodedSlug,
      summary: `Updated product "${existing.title}" (${decodedSlug}).`,
    });

    return NextResponse.json({
      success: true,
      product: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Update failed: ${err.message || String(err)}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/products/:slug
 * Fetches full product data including external pricing for admin inspection.
 */
export async function GET(request: NextRequest, { params }: RouteProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug).trim();

  const auth = verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const product = await getProductById(decodedSlug);
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json({ product });
}
