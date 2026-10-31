import { NextResponse } from 'next/server';
import { getReviews, createReview, updateReview, deleteReview } from '@/lib/db';
import { ReviewInput } from '@/lib/types';

export async function GET() {
  try {
    const reviews = await getReviews();
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Support both single review and bulk review import (array or { items: ReviewInput[] })
    const items: ReviewInput[] = Array.isArray(body)
      ? body
      : Array.isArray(body.items)
      ? body.items
      : [body];

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No review items provided' },
        { status: 400 }
      );
    }

    const createdList = [];
    for (const item of items) {
      if (item && item.author && item.review) {
        const created = await createReview({
          ...item,
          rating: typeof item.rating === 'number' ? Math.min(5, Math.max(1, Math.round(item.rating))) : 5,
          platform: item.platform || 'google',
          isVerified: item.isVerified ?? true,
          isFeatured: item.isFeatured ?? true,
        });
        createdList.push(created);
      }
    }

    if (createdList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Author and review content are required for each item' },
        { status: 400 }
      );
    }

    // If single item, return original shape for backward compatibility
    if (!Array.isArray(body) && !body.items && createdList.length === 1) {
      return NextResponse.json({ success: true, review: createdList[0] });
    }

    return NextResponse.json({
      success: true,
      count: createdList.length,
      reviews: createdList,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const updated = await updateReview(id, updates);
    return NextResponse.json({ success: true, review: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    await deleteReview(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}

