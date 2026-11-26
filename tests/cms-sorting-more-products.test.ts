import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { moveArrayItem, buildMoreProductsDirectory } from '@/lib/utils';

describe('CMS Sorting Helpers & More Products Alphabetical Directory', () => {
  test('1. moveArrayItem moves items cleanly to top, bottom, and intermediate positions', () => {
    const items = ['slide-1', 'slide-2', 'slide-3', 'slide-4'];

    // Move bottom item to top (index 3 -> 0)
    assert.deepEqual(moveArrayItem(items, 3, 0), ['slide-4', 'slide-1', 'slide-2', 'slide-3']);

    // Move top item to bottom (index 0 -> 3)
    assert.deepEqual(moveArrayItem(items, 0, 3), ['slide-2', 'slide-3', 'slide-4', 'slide-1']);

    // Swap neighbors (index 1 -> 2)
    assert.deepEqual(moveArrayItem(items, 1, 2), ['slide-1', 'slide-3', 'slide-2', 'slide-4']);

    // Out of bounds returns original array unchanged
    assert.deepEqual(moveArrayItem(items, -1, 2), items);
    assert.deepEqual(moveArrayItem(items, 1, 9), items);
    assert.deepEqual(moveArrayItem(items, 2, 2), items);
  });

  test('2. buildMoreProductsDirectory lists categories + opted-in live products alphabetically', () => {
    const categories = [
      { name: 'Flyers & Leaflets' },
      { name: 'Business Cards' },
      { name: 'Printing' }, // legacy container ignored
      { name: 'Clothing' }, // legacy container ignored
    ];

    const products = [
      { id: '1', slug: 'a5-brochures', title: 'A5 Brochures', category: 'Booklets', isActive: true, showInMoreProducts: true },
      { id: '2', slug: 'banner-stands', title: 'Banner Stands', category: 'Banners', isActive: true, showInMoreProducts: true },
      { id: '3', slug: 'hidden-card', title: 'Art Print Hidden', category: 'Art', isActive: false, showInMoreProducts: true },
      { id: '4', slug: 'not-opted-in', title: 'DL Flyers', category: 'Flyers & Leaflets', isActive: true, showInMoreProducts: false },
    ];

    const dir = buildMoreProductsDirectory(categories, products);

    assert.equal(dir.categoryCount, 2);
    assert.equal(dir.productCount, 2);
    assert.deepEqual(
      dir.groups.map((g) => g.letter),
      ['A', 'B', 'F']
    );

    const groupB = dir.groups.find((g) => g.letter === 'B')!;
    assert.deepEqual(
      groupB.items.map((i) => ({ kind: i.kind, label: i.label, href: i.href })),
      [
        { kind: 'product', label: 'Banner Stands', href: '/product/banner-stands' },
        { kind: 'category', label: 'Business Cards', href: '/category/Business%20Cards' },
      ]
    );
  });

  test('3. buildMoreProductsDirectory filters both categories and featured products by search query', () => {
    const categories = [{ name: 'Flyers & Leaflets' }, { name: 'Business Cards' }];
    const products = [
      { id: '1', slug: 'velvet-business-cards', title: 'Velvet Business Cards', category: 'Business Cards', isActive: true, showInMoreProducts: true },
      { id: '2', slug: 'vinyl-stickers', title: 'Vinyl Stickers', category: 'Stickers', isActive: true, showInMoreProducts: true },
    ];

    const filtered = buildMoreProductsDirectory(categories, products, 'business');
    assert.deepEqual(
      filtered.groups.flatMap((g) => g.items.map((i) => i.label)),
      ['Business Cards', 'Velvet Business Cards']
    );
  });
});
