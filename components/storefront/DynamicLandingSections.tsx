'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DynamicSection, Product, CategoryConfig } from '@/lib/types';
import {
  getLandingSections,
  getLocalLandingSections,
  getProducts,
  getLocalProducts,
  getCategories,
  getLocalCategories,
  saveLocalLandingSections,
  saveLocalProducts,
  saveLocalCategories,
} from '@/lib/db';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { Lightning, ArrowRight, Sparkle, Tag, SquaresFour } from '@phosphor-icons/react';

interface DynamicLandingSectionsProps {
  initialSections?: DynamicSection[];
  initialProducts?: Product[];
  initialCategories?: CategoryConfig[];
}

export function DynamicLandingSections({
  initialSections,
  initialProducts,
  initialCategories,
}: DynamicLandingSectionsProps = {}) {
  // 1. Initialize synchronously: prioritize fresh browser cache if available, else server props
  const [sections, setSections] = useState<DynamicSection[]>(() => {
    if (typeof window !== 'undefined') {
      const local = getLocalLandingSections().filter((s) => s.isActive);
      if (local && local.length > 0) return local;
    }
    if (initialSections && initialSections.length > 0) {
      return initialSections.filter((s) => s.isActive);
    }
    return [];
  });

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const localProds = getLocalProducts();
      if (localProds && localProds.length > 0) return localProds;
    }
    if (initialProducts && initialProducts.length > 0) {
      return initialProducts;
    }
    return [];
  });

  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const localCats = getLocalCategories();
      if (localCats && localCats.length > 0) return localCats;
    }
    if (initialCategories && initialCategories.length > 0) {
      return initialCategories;
    }
    return [];
  });

  useEffect(() => {
    // 2. Fetch fresh data through server API with cache-busting
    async function loadData() {
      try {
        const res = await fetch(`/api/landing-data?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sections)) {
            const active = data.sections.filter((s: DynamicSection) => s.isActive);
            setSections(active);
            saveLocalLandingSections(data.sections);
          }
          if (Array.isArray(data.products) && data.products.length > 0) {
            setProducts(data.products);
            saveLocalProducts(data.products);
          }
          if (Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
            saveLocalCategories(data.categories);
          }
          return;
        }
      } catch (err) {
        console.warn('API landing data fetch error, falling back to direct DB:', err);
      }

      // Fallback: direct database fetch if API route is unavailable
      try {
        const [secs, prods, cats] = await Promise.all([
          getLandingSections(),
          getProducts(),
          getCategories(),
        ]);
        if (Array.isArray(secs)) {
          setSections(secs.filter((s) => s.isActive));
        }
        if (Array.isArray(prods)) {
          setProducts(prods);
        }
        if (Array.isArray(cats)) {
          setCategories(cats);
        }
      } catch (err) {
        console.warn('Direct landing sections fetch warning:', err);
      }
    }
    loadData();

    // 3. Instant reactive sync when sections, products, or categories are modified in CMS
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'print_today_landing_sections') {
        try {
          const updated = JSON.parse(e.newValue || '[]');
          if (Array.isArray(updated)) {
            setSections(updated.filter((s) => s.isActive));
          }
        } catch {}
      } else if (e.key === 'print_today_products') {
        try {
          const updatedProds = JSON.parse(e.newValue || '[]');
          if (Array.isArray(updatedProds)) {
            setProducts(updatedProds);
          }
        } catch {}
      } else if (e.key === 'print_today_categories') {
        try {
          const updatedCats = JSON.parse(e.newValue || '[]');
          if (Array.isArray(updatedCats)) {
            setCategories(updatedCats);
          }
        } catch {}
      }
    };

    const handleSectionsCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DynamicSection[]>;
      if (Array.isArray(customEvent.detail)) {
        setSections(customEvent.detail.filter((s) => s.isActive));
      }
    };

    const handleProductsCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<Product[]>;
      if (Array.isArray(customEvent.detail)) {
        setProducts(customEvent.detail);
      }
    };

    const handleCategoriesCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CategoryConfig[]>;
      if (Array.isArray(customEvent.detail)) {
        setCategories(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('print_today_sections_updated', handleSectionsCustomUpdate);
    window.addEventListener('print_today_products_updated', handleProductsCustomUpdate);
    window.addEventListener('print_today_categories_updated', handleCategoriesCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('print_today_sections_updated', handleSectionsCustomUpdate);
      window.removeEventListener('print_today_products_updated', handleProductsCustomUpdate);
      window.removeEventListener('print_today_categories_updated', handleCategoriesCustomUpdate);
    };
  }, []);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-16 py-8 font-sans">
      {sections.map((section) => {
        // TYPE 3: Split Feature Banner (End-to-end full display width, transparent picture, custom background)
        if (section.type === 'split_banner') {
          return (
            <SplitBannerSection
              key={section.id || section.title}
              section={section}
            />
          );
        }

        // TYPE 1 & 2 (Option A): Source is CATEGORY -> Show Category Cover Images & Links
        if (section.sourceType === 'category') {
          const targetCategoryNames = (section.categoryNames && section.categoryNames.length > 0)
            ? section.categoryNames.map((c) => c.toLowerCase().trim())
            : section.categoryName
            ? [section.categoryName.toLowerCase().trim()]
            : [];

          let sectionCategories = targetCategoryNames.length > 0
            ? categories.filter((c) => c && c.name && targetCategoryNames.includes(c.name.toLowerCase().trim()))
            : categories;

          // Fallback if none matched
          if (sectionCategories.length === 0 && categories.length > 0) {
            sectionCategories = categories.slice(0, 8);
          }

          const firstCategoryName = (section.categoryNames && section.categoryNames[0]) || section.categoryName;
          const viewLink = firstCategoryName
            ? `/category/${encodeURIComponent(firstCategoryName)}`
            : '/category/Printing';

          return (
            <section key={section.id || section.title} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {section.title}
                  </h2>
                  {section.subtitle && (
                    <p className="text-sm text-slate-600 mt-1 font-medium">{section.subtitle}</p>
                  )}
                </div>

                <Link
                  href={viewLink}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#012169] hover:text-[#C8102E] transition-colors"
                >
                  <span>
                    {section.categoryNames && section.categoryNames.length > 1
                      ? `View Collection (${section.categoryNames.length} Categories)`
                      : 'View Collection'}
                  </span>
                  <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                </Link>
              </div>

              {section.type === 'horizontal_scroll' ? (
                <CategoryAutoScrollRow categories={sectionCategories} products={products} />
              ) : (
                <CategoryGrid8Tiles categories={sectionCategories.slice(0, 8)} products={products} />
              )}
            </section>
          );
        }

        // TYPE 1 & 2 (Option B): Source is PRODUCTS -> Show Specific Products
        let sectionProducts: Product[] = [];
        if (section.productIds && section.productIds.length > 0) {
          sectionProducts = section.productIds
            .map((id) => products.find((p) => p.id === id || p.slug === id))
            .filter((p): p is Product => Boolean(p));
        }

        // Fallback: If section has no matched products yet but products are loaded
        if (sectionProducts.length === 0) {
          if (products.length === 0) {
            return (
              <section key={section.id || section.title} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      {section.title}
                    </h2>
                    {section.subtitle && (
                      <p className="text-sm text-slate-600 mt-1 font-medium">{section.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-[4/3] bg-slate-100 rounded-2xl" />
                  ))}
                </div>
              </section>
            );
          }
          sectionProducts = products.slice(0, 8);
        }

        return (
          <section key={section.id || section.title} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-sm text-slate-600 mt-1 font-medium">{section.subtitle}</p>
                )}
              </div>

              <Link
                href="/category/Printing"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#012169] hover:text-[#C8102E] transition-colors"
              >
                <span>View All Products</span>
                <ArrowRight weight="bold" className="h-3.5 w-3.5" />
              </Link>
            </div>

            {section.type === 'horizontal_scroll' ? (
              <AutoScrollRow products={sectionProducts} />
            ) : (
              <Grid8Tiles products={sectionProducts.slice(0, 8)} />
            )}
          </section>
        );
      })}
    </div>
  );
}

// ----------------- COMPONENT: SPLIT FEATURE BANNER -----------------
// End-to-end full width display with zero left/right gaps
function SplitBannerSection({ section }: { section: DynamicSection }) {
  const isImageLeft = section.layoutDirection !== 'image_right';
  const bgColor = section.backgroundColor || '#012169';

  // Determine if text should be light or dark based on background color
  const isLightBg = isColorLight(bgColor);
  const textColor = isLightBg ? 'text-slate-900' : 'text-white';
  const subtitleColor = isLightBg ? 'text-slate-700' : 'text-slate-200';
  const badgeBg = isLightBg ? 'bg-slate-200/80 text-slate-800' : 'bg-white/15 text-white border border-white/20';

  return (
    <section
      style={{ backgroundColor: bgColor }}
      className="w-full relative overflow-hidden transition-all duration-300 py-12 sm:py-16 my-4 shadow-sm"
    >
      {/* Subtle ambient lighting effect */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 bg-black/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative z-10 flex flex-col items-center gap-8 lg:gap-14 ${
            isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
          }`}
        >
          {/* Picture Side: Transparent image auto-scaled w x h without clipping or borders */}
          {section.imageUrl && (
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="relative max-h-[400px] w-full flex items-center justify-center">
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="max-h-[380px] max-w-full w-auto h-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Text Side: Title, Subtitle & Action Button */}
          <div className={`w-full ${section.imageUrl ? 'lg:w-1/2' : 'max-w-3xl mx-auto text-center'} space-y-5 text-left`}>
            {section.badgeText && (
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeBg}`}>
                <Tag weight="fill" className="h-3.5 w-3.5" />
                <span>{section.badgeText}</span>
              </div>
            )}

            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight ${textColor}`}>
              {section.title}
            </h2>

            {section.subtitle && (
              <p className={`text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line ${subtitleColor}`}>
                {section.subtitle}
              </p>
            )}

            {section.buttonText && section.buttonUrl && (
              <div className="pt-2">
                <Link
                  href={section.buttonUrl}
                  className={`inline-flex items-center gap-2 font-bold px-6 py-3.5 rounded-2xl shadow-lg text-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
                    isLightBg
                      ? 'bg-[#012169] text-white hover:bg-[#00143d]'
                      : 'bg-[#C8102E] hover:bg-[#A80C24] text-white'
                  }`}
                >
                  <span>{section.buttonText}</span>
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper to determine if a hex color is light or dark
function isColorLight(hex: string): boolean {
  if (!hex || !hex.startsWith('#')) return false;
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  if (isNaN(rgb)) return false;
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // ITU-R BT.709
  return luma > 165;
}

// ----------------- COMPONENT: CATEGORY AUTO-SCROLL ROW -----------------
function CategoryAutoScrollRow({
  categories,
  products,
}: {
  categories: CategoryConfig[];
  products: Product[];
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let step = 1;

    const scroll = () => {
      if (!isHovered && el) {
        el.scrollLeft += step;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(scroll);
    };

    animId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scroll-smooth"
    >
      {categories.map((cat, idx) => {
        const prodCount = products.filter(
          (p) => p.category && p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
        ).length;

        return (
          <Link
            key={cat.id || `${cat.name}-${idx}`}
            href={`/category/${encodeURIComponent(cat.name)}`}
            className="group flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#012169]/30 transition-all duration-300 flex flex-col"
          >
            {/* Category Cover Image: Full picture display, object-cover, NO white border */}
            <div className="relative w-full aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
              <img
                src={cat.imageUrl || '/images/category-placeholder.png'}
                alt={cat.name}
                className="w-full h-full object-cover p-0 transition-transform duration-500 group-hover:scale-105 block"
                loading="lazy"
              />
              <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-[#012169]/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                <SquaresFour weight="bold" className="h-3 w-3" />
                <span>Category</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                  {prodCount > 0 ? `${prodCount} Products Available` : 'Explore Range'}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#012169] group-hover:text-[#C8102E] transition-colors">
                  Browse Collection
                </span>
                <div className="h-8 w-8 rounded-xl bg-slate-100 group-hover:bg-[#012169] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ----------------- COMPONENT: CATEGORY FIXED 8-TILES GRID (2x4) -----------------
function CategoryGrid8Tiles({
  categories,
  products,
}: {
  categories: CategoryConfig[];
  products: Product[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {categories.map((cat, idx) => {
        const prodCount = products.filter(
          (p) => p.category && p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
        ).length;

        return (
          <Link
            key={cat.id || `${cat.name}-${idx}`}
            href={`/category/${encodeURIComponent(cat.name)}`}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#012169]/30 transition-all duration-300 flex flex-col"
          >
            {/* Category Cover Image: Full picture display, object-cover, NO white border */}
            <div className="relative w-full aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
              <img
                src={cat.imageUrl || '/images/category-placeholder.png'}
                alt={cat.name}
                className="w-full h-full object-cover p-0 transition-transform duration-500 group-hover:scale-105 block"
                loading="lazy"
              />
              <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-[#012169]/90 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                <SquaresFour weight="bold" className="h-3 w-3" />
                <span>Category</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
                  {prodCount > 0 ? `${prodCount} Products` : 'Explore Range'}
                </p>
              </div>

              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#012169] group-hover:text-[#C8102E] transition-colors">
                  View All
                </span>
                <div className="h-7 w-7 rounded-lg bg-slate-100 group-hover:bg-[#012169] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ----------------- COMPONENT: AUTO-SCROLL ROW (PRODUCTS) -----------------
function AutoScrollRow({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll loop
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let step = 1;

    const scroll = () => {
      if (!isHovered && el) {
        el.scrollLeft += step;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 2) {
          el.scrollLeft = 0;
        }
      }
      animId = requestAnimationFrame(scroll);
    };

    animId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animId);
  }, [isHovered]);

  return (
    <div
      ref={scrollRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scroll-smooth"
    >
      {products.map((product, idx) => {
        const discount = calculateDiscount(product.price, product.discountedPrice);
        const activePrice = product.discountedPrice || product.price;

        return (
          <Link
            key={product.id || `${product.slug}-${idx}`}
            href={`/product/${product.slug}`}
            className="group flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#012169]/30 transition-all duration-300 flex flex-col"
          >
            {/* Image Box: Full picture display, object-cover, NO white padding border */}
            <div className="relative w-full aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover p-0 transition-transform duration-300 group-hover:scale-105 block"
                loading="lazy"
              />
              {product.isSameDayAvailable && (
                <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-emerald-600/95 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                  <Lightning weight="fill" className="h-3 w-3" />
                  <span>Same-Day</span>
                </div>
              )}
              {product.discountedPrice && (
                <div className="absolute top-2.5 right-2.5 bg-[#C8102E] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {product.category}
                </span>
                <h3 className="text-sm font-black text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1 mt-0.5">
                  {product.title}
                </h3>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Starting from</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black text-slate-900">
                      {formatCurrency(activePrice)}
                    </span>
                    {product.discountedPrice && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-8 w-8 rounded-xl bg-slate-100 group-hover:bg-[#012169] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight weight="bold" className="h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ----------------- COMPONENT: FIXED 8-TILES GRID (PRODUCTS) -----------------
function Grid8Tiles({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product, idx) => {
        const discount = calculateDiscount(product.price, product.discountedPrice);
        const activePrice = product.discountedPrice || product.price;

        return (
          <Link
            key={product.id || `${product.slug}-${idx}`}
            href={`/product/${product.slug}`}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-[#012169]/30 transition-all duration-300 flex flex-col"
          >
            {/* Image Box: Full picture display, object-cover, NO white padding border */}
            <div className="relative w-full aspect-[4/3] bg-slate-100 flex items-center justify-center overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover p-0 transition-transform duration-300 group-hover:scale-105 block"
                loading="lazy"
              />
              {product.isSameDayAvailable && (
                <div className="absolute top-2 left-2 inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  <Lightning weight="fill" className="h-3 w-3" />
                  <span className="hidden sm:inline">Same-Day</span>
                </div>
              )}
              {product.discountedPrice && (
                <div className="absolute top-2 right-2 bg-[#C8102E] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {product.category}
                </span>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1 mt-0.5">
                  {product.title}
                </h3>
              </div>

              <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">From</span>
                  <span className="text-sm sm:text-base font-black text-slate-900">
                    {formatCurrency(activePrice)}
                  </span>
                </div>

                <div className="h-7 w-7 rounded-lg bg-slate-100 group-hover:bg-[#012169] text-slate-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
