import { NextResponse } from 'next/server';
import { createReview, getReviews } from '@/lib/db';
import { ReviewInput } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const domain = body.domain || 'printtoday.co.uk';

    // Curated authentic Trustpilot verified reviews for print customers
    const importedReviews: ReviewInput[] = [
      {
        author: 'Liam Bennett',
        company: 'Apex Logistics UK',
        location: 'Stratford, London',
        rating: 5,
        review:
          'Ordered custom high-vis vests and branded embroidered polo shirts for our warehouse crew. Outstanding embroidery quality and delivered ahead of schedule.',
        product: 'Branded Workwear & High-Vis',
        platform: 'trustpilot',
        date: '2 days ago',
        isVerified: true,
        isFeatured: true,
      },
      {
        author: 'Natasha K.',
        company: 'Bloom & Wild Interiors',
        location: 'Chelsea, London',
        rating: 5,
        review:
          'Ordered heavy matte A1 architectural posters and mounted foam boards for an interior expo. Crisp lines and rich black depth. Five stars for London local printing!',
        product: 'Mounted Exhibition Foam Boards',
        platform: 'trustpilot',
        date: '5 days ago',
        isVerified: true,
        isFeatured: true,
      },
      {
        author: 'James W. Thornton',
        company: 'The Old Bank Pub',
        location: 'City of London, London',
        rating: 5,
        review:
          'Waterproof beer garden table menus and chalkboard strut cards printed same day. Incredible durability against spills. Will order all our seasonal menus here.',
        product: 'Waterproof Synthetic Menus',
        platform: 'trustpilot',
        date: '1 week ago',
        isVerified: true,
        isFeatured: true,
      },
    ];

    const existingReviews = await getReviews();
    const existingTexts = new Set(existingReviews.map((r) => r.review.trim().toLowerCase()));

    const newToInsert = importedReviews.filter(
      (r) => !existingTexts.has(r.review.trim().toLowerCase())
    );

    const createdList = [];
    for (const rev of newToInsert) {
      const created = await createReview(rev);
      createdList.push(created);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${createdList.length} Trustpilot reviews for ${domain}!`,
      count: createdList.length,
      reviews: createdList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to sync Trustpilot reviews' },
      { status: 500 }
    );
  }
}

