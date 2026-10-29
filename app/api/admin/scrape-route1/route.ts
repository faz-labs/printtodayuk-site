import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';

export const dynamic = 'force-dynamic';

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

      // 2. Fetch Route1 HTML to extract LD+JSON priceGrid
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

      // Extract ip:priceGrid from HTML LD+JSON
      let priceGrid: any = null;
      const jsonLdMatches = htmlText.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];
      for (const match of jsonLdMatches) {
        const content = match.replace(/<\/?script[^>]*>/gi, '').trim();
        try {
          const parsed = JSON.parse(content);
          if (parsed['ip:priceGrid']) {
            priceGrid = parsed['ip:priceGrid'];
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
      if (bundleData?.preview?.attributes && Array.isArray(bundleData.preview.attributes)) {
        const skipNames = ['quantity', 'turnaround', 'sets', 'binding', 'banding', 'cut type', 'file copies'];
        for (const attr of bundleData.preview.attributes) {
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
      }

      // Extract Quantity Tiers & Turnaround Speeds from priceGrid
      const quantityTiers: Array<{ quantity: number; price?: number; percentIncrease?: number }> = [];
      let sameDayIncreasePercent = 35.4;
      let nextDayIncreasePercent = 10.0;
      let basePrice = 14.69;

      if (priceGrid && priceGrid.rows && Array.isArray(priceGrid.rows) && priceGrid.rows.length > 0) {
        // Find turnaround IDs
        const turnarounds = priceGrid.turnarounds || [];
        const sameDayTurnaround = turnarounds.find((t: any) => /same\s*day|express/i.test(t.label));
        const nextDayTurnaround = turnarounds.find((t: any) => /1\s*work|next\s*day/i.test(t.label));
        const standardTurnaround =
          turnarounds.find((t: any) => /3-4|3-5|standard|economy/i.test(t.label)) ||
          turnarounds[turnarounds.length - 1];

        const sameDayId = sameDayTurnaround?.id;
        const nextDayId = nextDayTurnaround?.id;
        const standardId = standardTurnaround?.id;

        // First row defines the base price anchor
        const firstRow = priceGrid.rows[0];
        const row0Standard = standardId && firstRow.prices?.[standardId] ? Number(firstRow.prices[standardId]) : 0;
        basePrice = row0Standard > 0 ? row0Standard : 14.69;

        // Calculate turnaround % increase relative to standard
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

        // Build explicit quantity tiers
        for (let i = 0; i < priceGrid.rows.length; i++) {
          const row = priceGrid.rows[i];
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
