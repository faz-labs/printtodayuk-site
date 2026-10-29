import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

function normalizeStr(s: any): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// Helper to map URL path/slug to store categories
function mapRoute1Category(path: string): string {
  const p = path.toLowerCase();
  if (p.includes('roller-banner') || p.includes('banners-and-pop-ups') || p.includes('banner')) return 'Roller Banners';
  if (p.includes('business-card')) return 'Business Cards';
  if (p.includes('flyer') || p.includes('leaflet')) return 'Flyers & Leaflets';
  if (p.includes('booklet') || p.includes('brochure')) return 'Books & Booklets';
  if (p.includes('poster')) return 'Posters';
  if (p.includes('sticker') || p.includes('label')) return 'Stickers & Labels';
  if (p.includes('exhibition') || p.includes('display')) return 'Events & Exhibitions';
  if (p.includes('sign') || p.includes('board') || p.includes('rigid') || p.includes('signage')) return 'Rigid Media';
  if (p.includes('merchandise') || p.includes('bag')) return 'Merchandise';
  if (p.includes('point-of-sale') || p.includes('pos')) return 'Point of Sale';
  return 'Roller Banners';
}

function resolveAttributeSelections(attributes: any[], searchParams: URLSearchParams): Record<string, number> {
  const selections: Record<string, number> = {};

  for (const attr of attributes) {
    const attrNameNorm = normalizeStr(attr.attributeName || '');
    const attrDisplayNorm = normalizeStr(attr.attributeDisplayName || '');
    
    let matchedOptId: number | null = null;

    // Check each query param in URL
    for (const [key, val] of searchParams.entries()) {
      const cleanKey = normalizeStr(key.replace(/-\d{1,2}$/, ''));
      if (
        cleanKey === attrNameNorm || 
        cleanKey === attrDisplayNorm || 
        attrNameNorm.includes(cleanKey) || 
        cleanKey.includes(attrNameNorm)
      ) {
        // Strip trailing route1 duplicate counters like -2, -3 from val
        const cleanVal = normalizeStr(val.replace(/-\d{1,2}$/, ''));
        const matched = attr.options?.find((opt: any) => {
          const optNorm = normalizeStr(opt.name || opt.displayName || '');
          return (
            optNorm === cleanVal || 
            optNorm.replace(/mm$|gsm$/, '') === cleanVal ||
            optNorm.replace(/mm$|gsm$/, '') === cleanVal.replace(/mm$|gsm$/, '')
          );
        });
        if (matched) {
          matchedOptId = matched.optionID;
          break;
        }
      }
    }

    // Default to first option if not matched by query param
    if (!matchedOptId && attr.options && attr.options.length > 0) {
      matchedOptId = attr.options[0].optionID;
    }

    if (matchedOptId) {
      selections[String(attr.attributeID)] = matchedOptId;
    }
  }

  return selections;
}

function scrapeSolopress(url: string) {
  try {
    const stdout = execSync(
      `curl.exe -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" "${url}"`,
      { maxBuffer: 10 * 1024 * 1024 }
    );
    const html = stdout.toString('utf-8');

    // Extract Title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    let title = titleMatch ? titleMatch[1].replace(/\s*\|\s*Solopress.*$/i, '').trim() : '';
    if (!title || title.toLowerCase() === 'products') {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      title = parts[parts.length - 1]?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'Solopress Product';
    }

    // Extract Description
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() || '';

    // Extract Images
    const images: string[] = [];
    const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
    if (ogImg && !ogImg.includes('logo') && !images.includes(ogImg)) images.push(ogImg);

    // Enhanced Ecommerce products or prices
    const eeMatches = Array.from(html.matchAll(/"item_name":\s*"([^"]+)"[^}]+"price":\s*([0-9.]+)/gi));
    let basePrice = 24.00;
    if (eeMatches.length > 0 && eeMatches[0][2]) {
      basePrice = parseFloat(eeMatches[0][2]);
    }

    // Suggest category
    const cat = mapRoute1Category(url);

    // Default quantity tiers based on product type
    const isBanner = url.toLowerCase().includes('banner');
    const quantityTiers = isBanner
      ? [
          { quantity: 1, price: basePrice },
          { quantity: 2, percentIncrease: 70 },
          { quantity: 5, percentIncrease: 250 },
          { quantity: 10, percentIncrease: 550 },
          { quantity: 25, percentIncrease: 1300 },
        ]
      : [
          { quantity: 25, price: basePrice },
          { quantity: 50, percentIncrease: 40 },
          { quantity: 100, percentIncrease: 80 },
          { quantity: 250, percentIncrease: 150 },
          { quantity: 500, percentIncrease: 250 },
          { quantity: 1000, percentIncrease: 400 },
        ];

    return {
      title,
      description: metaDesc,
      category: cat,
      price: basePrice,
      images,
      imageUrl: images[0] || '',
      customFields: [],
      quantityTiers,
      sameDayIncreasePercent: 35.4,
      nextDayIncreasePercent: 10.0,
      maxSameDayQuantity: 25,
      maxNextDayQuantity: 100,
      sourceUrl: url,
      source: 'solopress',
      notice: 'Imported from Solopress! Note: Solopress computes live checkout tables inside private client sessions; price tiers have been seeded from their product catalog base price.',
    };
  } catch (e: any) {
    throw new Error('Failed to fetch Solopress product data: ' + e.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json(
        { error: 'Please provide a valid URL (e.g. from Route1Print or Solopress).' },
        { status: 400 }
      );
    }

    const isRoute1 = url.includes('route1print.co.uk');
    const isSolopress = url.includes('solopress.com');

    // Route 1: Solopress Universal Handler
    if (isSolopress) {
      const data = scrapeSolopress(url);
      return NextResponse.json({
        success: true,
        data,
      });
    }

    // Route 2: Route1Print Universal Handler
    if (isRoute1) {
      const urlObj = new URL(url);
      const cleanPath = urlObj.pathname.replace(/^\/+|\/+$/g, '');

      // 1. Fetch Route1 Product Bundle API
      const bundleApiUrl = `https://product.route1print.co.uk/productpages/by-url/bundle?url=${encodeURIComponent(cleanPath)}&brandID=1`;
      let bundleData: any = null;

      try {
        const bundleRes = await fetch(bundleApiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
          },
        });
        if (bundleRes.ok) {
          bundleData = await bundleRes.json();
        }
      } catch (e) {
        console.warn('Route1 bundle API fetch failed:', e);
      }

      // 2. Fetch Route1 HTML to extract LD+JSON priceGrid (fallback)
      let htmlText = '';
      try {
        const htmlRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html',
          },
        });
        if (htmlRes.ok) {
          htmlText = await htmlRes.text();
        }
      } catch (e) {
        console.warn('Route1 HTML fetch failed:', e);
      }

      // Extract ip:priceGrid from HTML LD+JSON for fallback
      let fallbackPriceGrid: any = null;
      const jsonLdMatches = htmlText.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
      for (const match of jsonLdMatches) {
        const content = match.replace(/<\/?script[^>]*>/gi, '').trim();
        try {
          const parsed = JSON.parse(content);
          if (parsed['ip:priceGrid']) {
            fallbackPriceGrid = parsed['ip:priceGrid'];
            break;
          }
        } catch (e) {}
      }

      // Extract Title & Description
      const title =
        bundleData?.page?.name ||
        bundleData?.page?.pageTitle ||
        htmlText.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*\|\s*Route1Print.*$/i, '').trim() ||
        'Imported Route1 Product';

      let description = bundleData?.page?.metaDescription || '';
      if (!description && bundleData?.contentTabs && bundleData.contentTabs.length > 0) {
        description = bundleData.contentTabs[0].content?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '';
      }

      // Extract Images (exclude MP4 videos)
      const images: string[] = [];
      if (bundleData?.images && Array.isArray(bundleData.images)) {
        for (const img of bundleData.images) {
          const urlStr = img.cloudFrontUrl || img.imageUrl || img.url;
          if (urlStr && typeof urlStr === 'string' && !urlStr.toLowerCase().endsWith('.mp4')) {
            images.push(urlStr);
          }
        }
      }

      // Fallback images from HTML if bundle didn't have any
      if (images.length === 0) {
        const imgMatches = htmlText.match(/https:\/\/d1oigiyh3i17y2\.cloudfront\.net\/[^"'`\s]+\.(?:jpg|jpeg|png|webp)/gi) || [];
        for (const img of imgMatches) {
          if (!images.includes(img) && !img.includes('avatar') && !img.includes('icon')) {
            images.push(img);
          }
        }
      }

      // Extract Custom Fields (Dropdowns)
      const customFields: Array<{ id: string; name: string; options: string[]; required?: boolean }> = [];
      const attributes = bundleData?.preview?.attributes && Array.isArray(bundleData.preview.attributes)
        ? bundleData.preview.attributes
        : [];

      const skipNames = ['quantity', 'turnaround', 'sets', 'binding', 'banding', 'cut type', 'file copies'];
      for (const attr of attributes) {
        const displayName = attr.attributeDisplayName || attr.attributeName || '';
        const lowerName = displayName.toLowerCase();

        // Skip non-option fields
        if (skipNames.some((s) => lowerName.includes(s))) continue;

        const optionsList: string[] = [];
        if (attr.options && Array.isArray(attr.options)) {
          for (const opt of attr.options) {
            const optName = opt.displayName || opt.name || '';
            if (optName && !optionsList.includes(optName)) {
              optionsList.push(optName);
            }
          }
        }

        if (optionsList.length > 0) {
          customFields.push({
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: displayName,
            options: optionsList,
            required: true,
          });
        }
      }

      // Resolve user's selected variant options from URL query parameters!
      const resolvedSelections = resolveAttributeSelections(attributes, urlObj.searchParams);

      const qtyAttr = attributes.find((a: any) =>
        (a.attributeName || a.attributeDisplayName || '').toLowerCase().includes('quantity')
      );
      const turnaroundAttr = attributes.find((a: any) =>
        (a.attributeName || a.attributeDisplayName || '').toLowerCase().includes('turnaround')
      );

      const quantityTiers: Array<{ quantity: number; price?: number; percentIncrease?: number }> = [];
      let sameDayIncreasePercent = 35.4;
      let nextDayIncreasePercent = 10.0;
      let basePrice = 14.69;

      let batchSucceeded = false;

      // 3. FULL LIVE PRICING BATCH FETCH: Fetch ALL quantities (30 to 50 rows!) via Route1 Pricing Batch API
      if (qtyAttr && turnaroundAttr && bundleData?.page?.productID) {
        try {
          const productID = bundleData.page.productID;
          const productPageID = bundleData.page.id;
          const brandID = bundleData.page.brandID || 1;

          const standardTurnaround =
            turnaroundAttr.options?.find((t: any) => /3-4|3-5|standard|economy/i.test(t.name || t.displayName)) ||
            turnaroundAttr.options?.[turnaroundAttr.options.length - 1];
          const sameDayTurnaround = turnaroundAttr.options?.find((t: any) =>
            /same\s*day|express/i.test(t.name || t.displayName)
          );
          const nextDayTurnaround = turnaroundAttr.options?.find((t: any) =>
            /1\s*work|next\s*day/i.test(t.name || t.displayName)
          );

          const standardTurnaroundId = standardTurnaround?.optionID || 817;

          // Collect other selections (paper size, cassette, finish, etc.)
          const otherOptionIds = Object.entries(resolvedSelections)
            .filter(([attrId]) => Number(attrId) !== qtyAttr.attributeID && Number(attrId) !== turnaroundAttr.attributeID)
            .map(([, optId]) => optId);

          const validQuantities: number[] = [];
          const batchItems: any[] = [];

          // Generate batch requests for ALL quantities
          for (const opt of qtyAttr.options || []) {
            const qty = parseInt(opt.name || opt.displayName, 10);
            if (isNaN(qty) || qty < 1) continue;

            validQuantities.push(qty);
            batchItems.push({
              productID,
              productPageID,
              brandID,
              attributeOptionIDs: [opt.optionID, standardTurnaroundId, ...otherOptionIds],
              quantity: qty,
            });
          }

          // Also query Qty 1 for Same Day and Next Day to get exact turnaround surcharges
          if (sameDayTurnaround && qtyAttr.options?.[0]) {
            batchItems.push({
              productID,
              productPageID,
              brandID,
              attributeOptionIDs: [qtyAttr.options[0].optionID, sameDayTurnaround.optionID, ...otherOptionIds],
              quantity: validQuantities[0] || 1,
            });
          }

          if (nextDayTurnaround && qtyAttr.options?.[0]) {
            batchItems.push({
              productID,
              productPageID,
              brandID,
              attributeOptionIDs: [qtyAttr.options[0].optionID, nextDayTurnaround.optionID, ...otherOptionIds],
              quantity: validQuantities[0] || 1,
            });
          }

          if (batchItems.length > 0) {
            const batchRes = await fetch('https://product.route1print.co.uk/pricecalculation/batch', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              },
              body: JSON.stringify(batchItems),
            });

            if (batchRes.ok) {
              const batchJson = await batchRes.json();
              const results = batchJson?.results || [];

              if (Array.isArray(results) && results.length >= validQuantities.length) {
                // Populate ALL quantity tiers!
                for (let i = 0; i < validQuantities.length; i++) {
                  const qty = validQuantities[i];
                  const r = results[i];
                  const price = r && r.success && r.finalPrice > 0 ? Number(r.finalPrice) : 0;
                  if (price <= 0) continue;

                  if (quantityTiers.length === 0) {
                    basePrice = price;
                    quantityTiers.push({
                      quantity: qty,
                      price: Number(basePrice.toFixed(2)),
                    });
                  } else {
                    const pct = Number((((price - basePrice) / basePrice) * 100).toFixed(1));
                    quantityTiers.push({
                      quantity: qty,
                      percentIncrease: Math.max(0, pct),
                    });
                  }
                }

                // Check same day surcharge %
                const sameDayResult = results[validQuantities.length];
                if (sameDayResult && sameDayResult.success && sameDayResult.finalPrice > basePrice) {
                  sameDayIncreasePercent = Number(
                    (((sameDayResult.finalPrice - basePrice) / basePrice) * 100).toFixed(1)
                  );
                }

                // Check next day surcharge %
                const nextDayResult = results[validQuantities.length + 1];
                if (nextDayResult && nextDayResult.success && nextDayResult.finalPrice > basePrice) {
                  nextDayIncreasePercent = Number(
                    (((nextDayResult.finalPrice - basePrice) / basePrice) * 100).toFixed(1)
                  );
                }

                if (quantityTiers.length > 0) {
                  batchSucceeded = true;
                }
              }
            }
          }
        } catch (batchErr) {
          console.warn('Route1 batch price calculation failed, falling back to static priceGrid:', batchErr);
        }
      }

      // 4. Fallback to HTML LD+JSON priceGrid if batch calculation failed
      if (!batchSucceeded && fallbackPriceGrid && fallbackPriceGrid.rows && Array.isArray(fallbackPriceGrid.rows)) {
        const turnarounds = fallbackPriceGrid.turnarounds || [];
        const sameDayTurnaround = turnarounds.find((t: any) => /same\s*day|express/i.test(t.label));
        const nextDayTurnaround = turnarounds.find((t: any) => /1\s*work|next\s*day/i.test(t.label));
        const standardTurnaround =
          turnarounds.find((t: any) => /3-4|3-5|standard|economy/i.test(t.label)) ||
          turnarounds[turnarounds.length - 1];

        const sameDayId = sameDayTurnaround?.id;
        const nextDayId = nextDayTurnaround?.id;
        const standardId = standardTurnaround?.id;

        const firstRow = fallbackPriceGrid.rows[0];
        const row0Standard = standardId && firstRow.prices?.[standardId] ? Number(firstRow.prices[standardId]) : 0;
        basePrice = row0Standard > 0 ? row0Standard : 14.69;

        if (firstRow.prices) {
          const row0SameDay = sameDayId ? Number(firstRow.prices[sameDayId]) : 0;
          const row0NextDay = nextDayId ? Number(firstRow.prices[nextDayId]) : 0;

          if (row0SameDay > basePrice) {
            sameDayIncreasePercent = Number((((row0SameDay - basePrice) / basePrice) * 100).toFixed(1));
          }
          if (row0NextDay > basePrice) {
            nextDayIncreasePercent = Number((((row0NextDay - basePrice) / basePrice) * 100).toFixed(1));
          }
        }

        for (let i = 0; i < fallbackPriceGrid.rows.length; i++) {
          const row = fallbackPriceGrid.rows[i];
          const qty = Number(row.quantity);
          if (isNaN(qty) || qty < 1) continue;

          if (i === 0) {
            quantityTiers.push({
              quantity: qty,
              price: Number(basePrice.toFixed(2)),
            });
          } else {
            const rowPrice = standardId && row.prices?.[standardId] ? Number(row.prices[standardId]) : 0;
            if (rowPrice > 0) {
              const pct = Number((((rowPrice - basePrice) / basePrice) * 100).toFixed(1));
              quantityTiers.push({
                quantity: qty,
                percentIncrease: Math.max(0, pct),
              });
            } else {
              quantityTiers.push({
                quantity: qty,
                percentIncrease: i * 80,
              });
            }
          }
        }
      }

      const suggestedCategory = mapRoute1Category(cleanPath);

      return NextResponse.json({
        success: true,
        data: {
          title,
          description,
          category: suggestedCategory,
          price: basePrice,
          images,
          imageUrl: images[0] || '',
          customFields,
          quantityTiers,
          sameDayIncreasePercent,
          nextDayIncreasePercent,
          maxSameDayQuantity: 25,
          maxNextDayQuantity: 100,
          sourceUrl: url,
          source: 'route1',
        },
      });
    }

    // Route 3: Generic Website Fallback
    try {
      const stdout = execSync(
        `curl.exe -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" "${url}"`,
        { maxBuffer: 10 * 1024 * 1024 }
      );
      const html = stdout.toString('utf-8');
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : 'Imported Product';
      const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1]?.trim() || '';
      const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1];
      const images: string[] = ogImg ? [ogImg] : [];

      return NextResponse.json({
        success: true,
        data: {
          title,
          description: metaDesc,
          category: mapRoute1Category(url),
          price: 19.99,
          images,
          imageUrl: images[0] || '',
          customFields: [],
          quantityTiers: [
            { quantity: 25, price: 19.99 },
            { quantity: 50, percentIncrease: 40 },
            { quantity: 100, percentIncrease: 80 },
            { quantity: 250, percentIncrease: 150 },
            { quantity: 500, percentIncrease: 250 },
          ],
          sameDayIncreasePercent: 35.4,
          nextDayIncreasePercent: 10.0,
          maxSameDayQuantity: 25,
          maxNextDayQuantity: 100,
          sourceUrl: url,
          source: 'generic',
        },
      });
    } catch (e: any) {
      return NextResponse.json(
        { error: 'Failed to scrape URL: ' + e.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Universal scraper error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to scrape product data' },
      { status: 500 }
    );
  }
}
