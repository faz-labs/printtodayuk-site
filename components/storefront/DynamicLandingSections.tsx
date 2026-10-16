'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DynamicSection, Product } from '@/lib/types';
import { getLandingSections, getLocalLandingSections, getProducts } from '@/lib/db';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { Lightning, ArrowRight, Sparkle, Tag } from '@phosphor-icons/react';

export function DynamicLandingSections() {
  // 1. Initialize synchronously from local cache so there is ZERO flash, ZERO delay, and NO loading modal
  const [sections, setSections] = useState<DynamicSection[]>(() => {
    if (typeof window !== 'undefined') {
      return getLocalLandingSections().filter((s) => s.isActive);
    }
    return [];
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // 2. Fetch fresh data from Firestore in the background
    async function loadData() {
      try {
        const [secs, prods] = await Promise.all([
          getLandingSections(),
          getProducts(),
        ]);
        if (Array.isArray(secs)) {
          setSections(secs.filter((s) => s.isActive));
        }
        if (Array.isArray(prods)) {
          setProducts(prods);
        }
      } catch (err) {
        console.warn('DynamicLandingSections fetch warning:', err);
      }
    }
    loadData();

    // 3. Instant reactive sync when sections are modified in CMS (same-tab or cross-tab)
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'print_today_landing_sections') {
        try {
          const updated = JSON.parse(e.newValue || '[]');
          if (Array.isArray(updated)) {
            setSections(updated.filter((s) => s.isActive));
          }
        } catch {}
      }
    };

    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<DynamicSection[]>;
      if (Array.isArray(customEvent.detail)) {
        setSections(customEvent.detail.filter((s) => s.isActive));
      }
    };

    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('print_today_sections_updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('print_today_sections_updated', handleCustomUpdate);
    };
  }, []);

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-16 py-8 font-['Open_Sans',sans-serif]">
      {sections.map((section) => {
        // TYPE 3: Split Feature Banner (Transparent Picture + Text + Custom Background)
        if (section.type === 'split_banner') {
          return (
            <SplitBannerSection
              key={section.id || section.title}
              section={section}
            />
          );
        }

        // TYPE 1 & 2: Product Grid / Auto-Scroll Sections
        let sectionProducts: Product[] = [];
        if (section.sourceType === 'category' && section.categoryName) {
          sectionProducts = products.filter(
            (p) => p && p.category && p.category.toLowerCase().trim() === section.categoryName!.toLowerCase().trim()
          );
        } else if (section.sourceType === 'products' && section.productIds) {
          sectionProducts = products.filter(
            (p) => section.productIds!.includes(p.id || '') || section.productIds!.includes(p.slug || '')
          );
        }

        if (sectionProducts.length === 0) return null;

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

              {section.categoryName && (
                <Link
                  href={`/category/${encodeURIComponent(section.categoryName)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#012169] hover:text-[#C8102E] transition-colors"
                >
                  <span>View All in {section.categoryName}</span>
                  <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {/* Layout Type 1: Horizontal Scroll Row with Auto-Scroll */}
            {section.type === 'horizontal_scroll' ? (
              <AutoScrollRow products={sectionProducts} />
            ) : (
              /* Layout Type 2: Fixed 8-Tile Grid (2 Rows x 4 Items) */
              <Grid8Tiles products={sectionProducts.slice(0, 8)} />
            )}
          </section>
        );
      })}
    </div>
  );
}

// ----------------- COMPONENT: SPLIT FEATURE BANNER -----------------
function SplitBannerSection({ section }: { section: DynamicSection }) {
  const isImageLeft = section.layoutDirection !== 'image_right';
  const bgColor = section.backgroundColor || '#012169';

  // Determine if text should be light or dark based on background color
  const isLightBg = isColorLight(bgColor);
  const textColor = isLightBg ? 'text-slate-900' : 'text-white';
  const subtitleColor = isLightBg ? 'text-slate-700' : 'text-slate-200';
  const badgeBg = isLightBg ? 'bg-slate-200/80 text-slate-800' : 'bg-white/15 text-white border border-white/20';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        style={{ backgroundColor: bgColor }}
        className="relative rounded-3xl overflow-hidden shadow-xl p-8 sm:p-12 transition-all duration-300"
      >
        {/* Subtle ambient lighting effect */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

        <div
          className={`relative z-10 flex flex-col items-center gap-8 lg:gap-12 ${
            isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'
          }`}
        >
          {/* Picture Side: Transparent image auto-scaled w x h without clipping or borders */}
          {section.imageUrl && (
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="relative max-h-[380px] w-full flex items-center justify-center">
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="max-h-[360px] max-w-full w-auto h-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
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

// ----------------- COMPONENT: AUTO-SCROLL ROW -----------------
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
        // Loop back seamlessly
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
            {/* Image Box: Full picture display, auto w x h, no white padding border, no inner rounded border */}
            <div className="relative w-full aspect-[4/3] bg-slate-50 flex items-center justify-center overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-contain p-0 transition-transform duration-300 group-hover:scale-105"
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

// ----------------- COMPONENT: FIXED 8-TILES GRID (2x4) -----------------
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
            {/* Image Box: Full picture display, auto w x h, no white padding border, no inner rounded border */}
            <div className="relative w-full aspect-[4/3] bg-slate-50 flex items-center justify-center overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-contain p-0 transition-transform duration-300 group-hover:scale-105"
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
