'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lightning,
  Flame,
  ArrowSquareOut,
  FolderOpen,
} from '@phosphor-icons/react';
import { CategoryConfig, Product } from '@/lib/types';
import { getLocalCategories } from '@/lib/db';
import { INITIAL_CATEGORIES } from '@/lib/data';

interface MegaMenuItem {
  name: string;
  href: string;
  isExternal?: boolean;
  isNew?: boolean;
}

export const BEST_SELLERS: MegaMenuItem[] = [
  { name: 'Flyers & Leaflets', href: '/category/Flyers%20%26%20Leaflets' },
  { name: 'Business Cards', href: '/category/Business%20Cards' },
  { name: 'Personalised Mugs', href: '/category/Personalised%20Mugs' },
  { name: 'Custom T-Shirts', href: '/category/T-Shirts' },
  { name: 'Hoodies & Sweatshirts', href: '/category/Hoodies%20%26%20Sweatshirts' },
  { name: 'PVC Banners', href: '/category/PVC%20Banners' },
  { name: 'Posters & Signs', href: '/category/Posters%20%26%20Signs' },
  { name: 'Stickers & Labels', href: '/category/Stickers%20%26%20Labels' },
  { name: 'Promotional Pens', href: '/category/Promotional%20Pens' },
  { name: 'Same-Day London Print', href: '/category/Flyers%20%26%20Leaflets?sameDay=true' },
  { name: 'Eco-Friendly Recycled', href: '/category/Business%20Cards', isNew: true },
];

interface DynamicCategoryGroup {
  letter: string;
  categories: {
    category: CategoryConfig;
    subcategories: string[];
    products: Product[];
  }[];
}

interface AllProductsMegaMenuProps {
  categories?: CategoryConfig[];
  products?: Product[];
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function AllProductsMegaMenu({
  categories,
  products = [],
  onClose,
  onMouseEnter,
  onMouseLeave,
}: AllProductsMegaMenuProps) {
  // Use passed CMS categories (filtering out legacy container categories)
  const rawCategories = useMemo(() => {
    let list = categories && categories.length > 0 ? categories : [];
    if (list.length === 0 && typeof window !== 'undefined') {
      list = getLocalCategories();
    }
    return list.filter(
      (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
    );
  }, [categories]);

  // Build alphabetical letter groups from CMS Category names
  const letterGroups = useMemo<DynamicCategoryGroup[]>(() => {
    const map = new Map<string, DynamicCategoryGroup['categories']>();

    // Sort categories alphabetically A to Z
    const sorted = [...rawCategories].sort((a, b) => a.name.localeCompare(b.name));

    for (const cat of sorted) {
      const letter = cat.name.trim().charAt(0).toUpperCase();
      if (!letter) continue;

      // Find products belonging to this category or matching subcategory
      const catProducts = products.filter(
        (p) =>
          p.category.toLowerCase().trim() === cat.name.toLowerCase().trim() ||
          p.subcategory.toLowerCase().trim() === cat.name.toLowerCase().trim()
      );

      // Unique subcategories for this category (excluding 'All')
      const subcats = (cat.subcategories || []).filter((s) => s.toLowerCase() !== 'all');

      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push({
        category: cat,
        subcategories: subcats,
        products: catProducts,
      });
    }

    // Convert map to sorted letter group array
    const letters = Array.from(map.keys()).sort();
    return letters.map((letter) => ({
      letter,
      categories: map.get(letter)!,
    }));
  }, [rawCategories, products]);

  // Distribute letter groups into 4 balanced columns
  const columns = useMemo(() => {
    const numCols = 4;
    const cols: DynamicCategoryGroup[][] = Array.from({ length: numCols }, () => []);
    letterGroups.forEach((group, index) => {
      cols[index % numCols].push(group);
    });
    return cols;
  }, [letterGroups]);

  // Derive featured Best Sellers list from CMS categories marked with isBestSeller
  const enlistedBestSellers = useMemo(() => {
    const fromCms = rawCategories.filter((c) => c.isBestSeller);
    if (fromCms.length > 0) {
      return fromCms;
    }
    // Fallback if none ticked yet: default popular categories from active catalog
    const defaultNames = new Set([
      'business cards',
      'flyers & leaflets',
      'personalised mugs',
      'hoodies & sweatshirts',
      'pvc banners',
      'posters & signs',
      'stickers & labels',
      'promotional pens',
      't-shirts',
    ]);
    const defaults = rawCategories.filter((c) => defaultNames.has(c.name.toLowerCase().trim()));
    return defaults.length > 0 ? defaults : rawCategories.slice(0, 8);
  }, [rawCategories]);

  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-lenis-prevent
      onWheel={(e) => e.stopPropagation()}
      initial={{ opacity: 0, y: 6, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.995 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="absolute left-0 right-0 top-full w-full bg-white border-b-2 border-[#012169] shadow-2xl z-50 max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="flex gap-8">
          {/* 1. Left Best Sellers Sidebar (Managed via CMS isBestSeller toggle, Top 10 text removed) */}
          <div className="w-56 shrink-0 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
            <div className="px-3.5 py-2.5 rounded-xl bg-[#012169] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs mb-3">
              <Flame weight="fill" className="h-4 w-4 text-amber-300" />
              <span>Best Sellers</span>
            </div>

            <div className="space-y-1">
              {enlistedBestSellers.map((item) => (
                <Link
                  key={item.name}
                  href={`/category/${encodeURIComponent(item.name)}`}
                  onClick={onClose}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg font-['Open_Sans',sans-serif] text-[15px] font-medium text-slate-700 hover:text-[#012169] hover:bg-white hover:shadow-xs transition-all group"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-slate-300 group-hover:text-[#012169] group-hover:translate-x-0.5 transition-all text-xs">
                    →
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5 font-['Open_Sans',sans-serif]">
              <Lightning weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
              <span className="font-semibold text-slate-700">Same-Day London Dispatch</span>
            </div>
          </div>

          {/* 2. Main Alphabetical A-Z Columns based on CMS Categories & Products */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((colGroups, colIdx) => (
              <div key={colIdx} className="space-y-6">
                {colGroups.map((group) => (
                  <div key={group.letter} className="space-y-2.5">
                    {/* Alphabet letter header (Solopress style: bold blue letter) */}
                    <div className="font-['Open_Sans',sans-serif] text-[18px] font-bold text-[#012169] border-b border-slate-200 pb-1 flex items-center gap-2">
                      <span>{group.letter}</span>
                      <div className="h-0.5 w-6 bg-[#012169]/30 rounded-full" />
                    </div>

                    {/* Categories under this letter */}
                    <div className="space-y-3 pl-1">
                      {group.categories.map(({ category, subcategories, products: catProds }) => (
                        <div key={category.name} className="space-y-1">
                          {/* Category Name header link in Open Sans 16px Medium */}
                          <Link
                            href={`/category/${encodeURIComponent(category.name)}`}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 font-['Open_Sans',sans-serif] text-[16px] font-medium text-slate-900 hover:text-[#012169] group transition-colors leading-snug"
                          >
                            <span className="group-hover:underline">{category.name}</span>
                            <span className="text-[12px] text-slate-400 group-hover:text-[#012169] transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </Link>

                          {/* Subcategories & Products under this Category */}
                          {(subcategories.length > 0 || catProds.length > 0) && (
                            <div className="space-y-0.5 pl-2.5 border-l-2 border-slate-100">
                              {/* Subcategories */}
                              {subcategories.map((subcat) => (
                                <Link
                                  key={subcat}
                                  href={`/category/${encodeURIComponent(category.name)}?subcat=${encodeURIComponent(subcat)}`}
                                  onClick={onClose}
                                  className="block font-['Open_Sans',sans-serif] text-[13px] text-slate-600 hover:text-[#012169] hover:underline transition-colors py-0.5 truncate"
                                >
                                  {subcat}
                                </Link>
                              ))}

                              {/* Any specific products under category that might not be in subcategories */}
                              {catProds.slice(0, 3).map((p) => (
                                <Link
                                  key={p.id || p.slug}
                                  href={`/product/${p.id || p.slug}`}
                                  onClick={onClose}
                                  className="block font-['Open_Sans',sans-serif] text-[13px] text-slate-500 hover:text-[#012169] hover:underline transition-colors py-0.5 truncate"
                                >
                                  {p.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
