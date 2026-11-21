import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminAuth, checkRateLimit, logAdminAudit } from '@/lib/adminAuth';
import { validateProductImport } from '@/lib/productImportEngine';
import { getProducts, createProduct, updateProduct } from '@/lib/db';
import { Product, ProductImportResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * Process 4: Protected Admin Write API
 * POST /api/admin/products
 * Allows scripted creation and updates of products from JSON.
 *
 * Query Parameters:
 * - dryRun: "true" | "false" (Default false: write nothing if true)
 * - mode: "merge" | "replace" (Default "merge" for existing products)
 */
export async function POST(request: NextRequest) {
  // 1. Authentication Check
  const auth = verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  // 2. Rate Limiting Check
  const rateLimit = checkRateLimit(request);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Admin API is rate-limited to 120 requests/minute.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const isDryRun = searchParams.get('dryRun') === 'true';
  const importMode = searchParams.get('mode') === 'replace' ? 'replace' : 'merge';

  try {
    const body = await request.json();

    // Support single product object, array of products, or wrapped object { products: [...] }
    let rawProducts: any[] = [];
    if (Array.isArray(body)) {
      rawProducts = body;
    } else if (Array.isArray(body.products)) {
      rawProducts = body.products;
    } else if (body.product && typeof body.product === 'object') {
      rawProducts = [body.product];
    } else if (typeof body === 'object') {
      rawProducts = [body];
    }

    if (rawProducts.length === 0) {
      return NextResponse.json(
        { error: 'No product records found in request body. Supply a JSON array or product object.' },
        { status: 400 }
      );
    }

    // 3. Fetch existing catalog slugs to detect creates vs updates
    const existingProducts = await getProducts(undefined, true);
    const existingSlugMap = new Map<string, Product>();
    existingProducts.forEach((p) => {
      if (p.slug) existingSlugMap.set(p.slug.toLowerCase().trim(), p);
    });
    const existingSlugsSet = new Set(existingSlugMap.keys());

    // 4. Validate all products using Process 1 Validation Engine
    const validationReport = validateProductImport(rawProducts, existingSlugsSet);

    if (!validationReport.valid && !isDryRun) {
      return NextResponse.json(
        {
          error: 'Validation failed. Fix the errors below before importing.',
          report: validationReport,
        },
        { status: 400 }
      );
    }

    // 5. Dry-run execution
    if (isDryRun) {
      const projectedActions = rawProducts.map((p, idx) => {
        const slug = (p.slug || '').toLowerCase().trim();
        const exists = existingSlugsSet.has(slug);
        return {
          slug,
          title: p.title,
          action: exists ? (importMode === 'replace' ? 'will_replace' : 'will_update') : 'will_create',
          hasVariantTables: Boolean(p.variantQuantityTiers && Object.keys(p.variantQuantityTiers).length > 0),
          hasPriceMatrix: Boolean(p.priceMatrix),
        };
      });

      await logAdminAudit({
        action: 'bulk_product_import_dry_run',
        identity: auth.identity,
        productCount: rawProducts.length,
        dryRun: true,
        summary: `Validated ${rawProducts.length} products (Valid: ${validationReport.validCount}, Errors: ${validationReport.invalidCount}) in dry-run mode.`,
      });

      return NextResponse.json({
        success: validationReport.valid,
        dryRun: true,
        report: validationReport,
        projectedActions,
      });
    }

    // 6. Real import execution
    const importResult: ProductImportResult = {
      success: true,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [],
      details: [],
    };

    for (const rawProd of rawProducts) {
      const slug = (rawProd.slug || '').toLowerCase().trim();
      const existing = existingSlugMap.get(slug);

      try {
        if (existing) {
          // Update existing
          const updatePayload = importMode === 'replace' ? rawProd : { ...existing, ...rawProd };
          await updateProduct(existing.id || existing.slug, updatePayload);
          importResult.updated++;
          importResult.details.push({ slug, action: 'updated' });
        } else {
          // Create new
          await createProduct(rawProd);
          importResult.created++;
          importResult.details.push({ slug, action: 'created' });
        }
      } catch (err: any) {
        importResult.errors.push({ slug, title: rawProd.title, message: err.message || 'Unknown save error' });
        importResult.details.push({ slug, action: 'error', message: err.message });
      }
    }

    importResult.success = importResult.errors.length === 0;

    await logAdminAudit({
      action: 'bulk_product_import_execute',
      identity: auth.identity,
      productCount: rawProducts.length,
      dryRun: false,
      summary: `Imported ${rawProducts.length} products: ${importResult.created} created, ${importResult.updated} updated, ${importResult.errors.length} errors.`,
    });

    return NextResponse.json({
      success: importResult.success,
      report: validationReport,
      result: importResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal import error: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/products
 * Returns summary list of catalog products for admin automation.
 */
export async function GET(request: NextRequest) {
  const auth = verifyAdminAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const products = await getProducts(undefined, true);
  return NextResponse.json({
    total: products.length,
    products: products.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      price: p.price,
      isActive: p.isActive,
      pricingDataExternal: Boolean(p.pricingDataExternal),
      updatedAt: p.updatedAt,
    })),
  });
}
