'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CategoryConfig, Product } from '@/lib/types';
import { getCategories, getProducts } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { CircleNotch, ArrowRight, Package } from '@phosphor-icons/react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=600&auto=format&fit=crop';

export function CategorySections() {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load category sections:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <CircleNotch className="w-8 h-8 text-[#012169] animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12 sm:space-y-16 py-10 sm:py-14 bg-white font-['Open_Sans',sans-serif]">
      {categories.map((cat) => {
        // Find products under this category
        const catProducts = products.filter(
          (p) => p && p.category && p.category.toLowerCase() === cat.name.toLowerCase()
        );

        return (
          <section
            key={cat.name}
            id={`category-${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="scroll-mt-20 border-b border-slate-100 last:border-b-0 pb-12 sm:pb-16"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="flex items-baseline justify-between gap-4 mb-6">
                <div className="flex items-baseline gap-4">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {cat.name}
                  </h2>
                  <Link
                    href={`/category/${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#012169] transition-colors group"
                  >
                    <span>Shop now</span>
                    <ArrowRight
                      weight="bold"
                      className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>

              {/* Grid of Products under this Category */}
              {catProducts.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                  {catProducts.slice(0, 8).map((product) => {
                    const activePrice = product.discountedPrice || product.price;

                    return (
                      <Link
                        key={product.id || product.slug}
                        href={`/product/${product.slug}`}
                        className="group flex flex-col focus:outline-hidden"
                      >
                        {/* Card Image */}
                        <div className="relative w-full aspect-square bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden p-3 sm:p-5 flex items-center justify-center transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-md">
                          <img
                            src={product.imageUrl || cat.imageUrl || FALLBACK_IMAGE}
                            alt={product.title}
                            className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.src = FALLBACK_IMAGE;
                            }}
                          />
                        </div>

                        {/* Title & Price Below Card */}
                        <div className="mt-2.5 text-left">
                          <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1 block">
                            {product.title}
                          </span>
                          <span className="text-xs text-slate-500 font-semibold block mt-0.5">
                            From {formatCurrency(activePrice)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                /* Fallback single category card with cover image */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    href={`/category/${encodeURIComponent(cat.name)}`}
                    className="group flex flex-col focus:outline-hidden"
                  >
                    <div className="relative w-full aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 flex items-center justify-center transition-all group-hover:shadow-md">
                      <img
                        src={cat.imageUrl || FALLBACK_IMAGE}
                        alt={cat.name}
                        className="w-full h-full object-contain rounded-xl transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="mt-2 text-left">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-[#012169] block">
                        Explore {cat.name}
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
