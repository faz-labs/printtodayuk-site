'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DynamicSection, Product } from '@/lib/types';
import { getLandingSections, getProducts } from '@/lib/db';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { Lightning, ArrowRight, Sparkle } from '@phosphor-icons/react';

export function DynamicLandingSections() {
  const [sections, setSections] = useState<DynamicSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [secs, prods] = await Promise.all([
          getLandingSections(),
          getProducts(),
        ]);
        setSections(secs.filter((s) => s.isActive));
        setProducts(prods);
      } catch (err) {
        console.warn('Failed to load dynamic sections:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading || sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-16 py-8 font-['Open_Sans',sans-serif]">
      {sections.map((section) => {
        // Resolve products for this section
        let sectionProducts: Product[] = [];
        if (section.sourceType === 'category' && section.categoryName) {
          sectionProducts = products.filter(
            (p) => p && p.category && p.category.toLowerCase() === section.categoryName!.toLowerCase()
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
        // If reached end, seamlessly loop back to start
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
            {/* Image Cover */}
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
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
            {/* Image */}
            <div className="relative h-40 sm:h-48 w-full bg-slate-100 overflow-hidden">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
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
