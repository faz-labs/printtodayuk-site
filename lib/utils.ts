import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w-]+/g, '') // Remove all non-word characters
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp));
}

export function calculateDiscount(price: number, discountedPrice?: number): number | null {
  if (!discountedPrice || discountedPrice >= price) return null;
  const discount = ((price - discountedPrice) / price) * 100;
  return Math.round(discount);
}

export function isValidUrl(urlString?: string): boolean {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Normalizes and validates user-pasted transfer URLs (auto-prepending https:// if omitted). */
export function normalizeTransferUrl(raw?: string): { valid: boolean; url: string } {
  const trimmed = (raw || '').trim();
  if (!trimmed) return { valid: false, url: '' };
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  if (!isValidUrl(candidate)) return { valid: false, url: '' };
  try {
    const parsed = new URL(candidate);
    if (!parsed.hostname.includes('.')) return { valid: false, url: '' };
    return { valid: true, url: candidate };
  } catch {
    return { valid: false, url: '' };
  }
}

/** Moves an item in an array from `fromIndex` to `toIndex`, returning a shallow copy. */
export function moveArrayItem<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list;
  }
  const copy = [...list];
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export interface MoreProductsEntry {
  kind: 'category' | 'product';
  key: string;
  label: string;
  href: string;
  productCount?: number;
  categoryName?: string;
}

export interface MoreProductsLetterGroup {
  letter: string;
  items: MoreProductsEntry[];
}

/**
 * Merges CMS categories with individual products opted into the More Products menu
 * (`showInMoreProducts: true`), filtering by query and sorting alphabetically A–Z.
 */
export function buildMoreProductsDirectory(
  categories: Array<{ name?: string }>,
  products: Array<{
    id?: string;
    slug?: string;
    title?: string;
    category?: string;
    isActive?: boolean;
    showInMoreProducts?: boolean;
  }>,
  filterQuery: string = ''
): {
  groups: MoreProductsLetterGroup[];
  categoryCount: number;
  productCount: number;
} {
  const cleanCats = (categories || []).filter(
    (c) =>
      c &&
      c.name &&
      c.name.toLowerCase() !== 'printing' &&
      c.name.toLowerCase() !== 'clothing'
  );

  const featuredProducts = (products || []).filter(
    (p) => p && p.title && p.isActive !== false && Boolean(p.showInMoreProducts)
  );

  const entries: MoreProductsEntry[] = [
    ...cleanCats.map((cat) => {
      const catName = cat.name!.trim();
      const count = (products || []).filter(
        (p) =>
          p &&
          p.category &&
          p.category.toLowerCase().trim() === catName.toLowerCase()
      ).length;
      return {
        kind: 'category' as const,
        key: `cat-${catName.toLowerCase()}`,
        label: catName,
        href: `/category/${encodeURIComponent(catName)}`,
        productCount: count,
      };
    }),
    ...featuredProducts.map((prod) => {
      const targetId = prod.slug || prod.id || '';
      return {
        kind: 'product' as const,
        key: `prod-${targetId || prod.title}`,
        label: prod.title!.trim(),
        href: `/product/${targetId}`,
        categoryName: prod.category,
      };
    }),
  ];

  const q = filterQuery.trim().toLowerCase();
  const visibleEntries = q
    ? entries.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          (item.categoryName && item.categoryName.toLowerCase().includes(q))
      )
    : entries;

  visibleEntries.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
  );

  const map = new Map<string, MoreProductsEntry[]>();
  for (const item of visibleEntries) {
    const first = item.label.trim().charAt(0).toUpperCase();
    if (!first) continue;
    if (!map.has(first)) map.set(first, []);
    map.get(first)!.push(item);
  }

  const letters = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
  return {
    groups: letters.map((letter) => ({
      letter,
      items: map.get(letter)!,
    })),
    categoryCount: cleanCats.length,
    productCount: featuredProducts.length,
  };
}
