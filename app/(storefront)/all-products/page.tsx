'use client';

import React, { useState, useEffect, useMemo, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SquaresFour,
  MagnifyingGlass,
  X,
  Lightning,
  Sparkle,
  ArrowRight,
  ArrowUpRight,
  CaretRight,
  Funnel,
  PhoneCall,
  WhatsappLogo,
  Check,
  Tag,
  ArrowsDownUp,
  SlidersHorizontal,
} from '@phosphor-icons/react';
import { Product, CategoryConfig } from '@/lib/types';
import { getCategories, getProducts, getLocalCategories, getLocalProducts } from '@/lib/db';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ImageWithFallback } from '@/components/storefront/ImageWithFallback';
import { useCallMe } from '@/components/storefront/CallMeContext';
import { cn, formatCurrency } from '@/lib/utils';

function AllProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openCallMe } = useCallMe();
  const productsSectionRef = useRef<HTMLDivElement>(null);

  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'a-z' | 'z-a' | 'price-asc' | 'price-desc'>('featured');
  const [isLoading, setIsLoading] = useState(true);

  // Sync category param from URL query (?category=...)
  useEffect(() => {
    const catFromUrl = searchParams.get('category') || searchParams.get('cat');
    if (catFromUrl) {
      setSelectedCategory(decodeURIComponent(catFromUrl));
    }
    const qFromUrl = searchParams.get('q') || searchParams.get('search');
    if (qFromUrl) {
      setSearchQuery(qFromUrl);
    }
  }, [searchParams]);

  // Load live CMS categories and products
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      try {
        const [catsData, prodsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        if (!isMounted) return;

        // Clean categories (no 'printing' or 'clothing' container labels)
        const validCats = (catsData || []).filter(
          (c) =>
            c &&
            c.name &&
            c.name.trim().length > 0 &&
            c.name.toLowerCase() !== 'printing' &&
            c.name.toLowerCase() !== 'clothing'
        );

        // Sort alphabetically A to Z
        validCats.sort((a, b) => a.name.localeCompare(b.name));

        setCategories(validCats);
        setProducts(prodsData || []);
      } catch (err) {
        console.error('Failed to load categories/products:', err);
        // Fallback to local cache if offline
        const localCats = getLocalCategories().filter(
          (c) =>
            c &&
            c.name &&
            c.name.toLowerCase() !== 'printing' &&
            c.name.toLowerCase() !== 'clothing'
        );
        localCats.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(localCats);
        setProducts(getLocalProducts());
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    // Listen for real-time CMS category updates
    const handleCategoryUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        const validCats = e.detail.filter(
          (c: any) =>
            c &&
            c.name &&
            c.name.toLowerCase() !== 'printing' &&
            c.name.toLowerCase() !== 'clothing'
        );
        validCats.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCategories(validCats);
      }
    };
    window.addEventListener('print_today_categories_updated', handleCategoryUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('print_today_categories_updated', handleCategoryUpdate);
    };
  }, []);

  // Compute product counts for each category
  const productCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const prod of products) {
      if (!prod || !prod.category) continue;
      const key = prod.category.trim().toLowerCase();
      map.set(key, (map.get(key) || 0) + 1);
    }
    return map;
  }, [products]);

  // Handle selecting a category
  const handleSelectCategory = (categoryName: string, shouldScroll = true) => {
    setSelectedCategory(categoryName);

    // Update URL query parameter without a hard page reload
    const url = new URL(window.location.href);
    if (categoryName === 'all') {
      url.searchParams.delete('category');
      url.searchParams.delete('cat');
    } else {
      url.searchParams.set('category', categoryName);
    }
    window.history.pushState({}, '', url.toString());

    if (shouldScroll && productsSectionRef.current) {
      // Smoothly scroll down to the products view
      setTimeout(() => {
        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Filter categories matching search input (for the categories grid)
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  // Filter products for the products grid
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      if (!prod) return false;

      // 1. Category Filter
      if (selectedCategory !== 'all') {
        const target = selectedCategory.toLowerCase().trim();
        const pCat = (prod.category || '').toLowerCase().trim();
        const pSub = (prod.subcategory || '').toLowerCase().trim();
        const matchesCategory =
          pCat === target ||
          (pSub && pSub === target) ||
          pCat.includes(target) ||
          prod.title.toLowerCase().includes(target);

        if (!matchesCategory) return false;
      }

      // 2. Same-day only
      if (sameDayOnly && !prod.isSameDayAvailable) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = prod.title.toLowerCase().includes(q);
        const descMatch = prod.description?.toLowerCase().includes(q);
        const catMatch = prod.category?.toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [products, selectedCategory, sameDayOnly, searchQuery]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'a-z':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'z-a':
        return list.sort((a, b) => b.title.localeCompare(a.title));
      case 'price-asc':
        return list.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price-desc':
        return list.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'featured':
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  // Active category object if a single category is selected
  const activeCategoryConfig = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return categories.find(
      (c) => c.name.toLowerCase().trim() === selectedCategory.toLowerCase().trim()
    );
  }, [categories, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#012169] via-[#012169] to-[#0A358C] text-white pt-10 pb-14 sm:pt-14 sm:pb-20">
        {/* Ambient background glow & grid */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-red-500/15 blur-3xl pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <CaretRight weight="bold" className="h-3 w-3 text-slate-400" />
            <span className="text-white font-bold">All Products & Categories</span>
            {selectedCategory !== 'all' && (
              <>
                <CaretRight weight="bold" className="h-3 w-3 text-slate-400" />
                <span className="text-cyan-300 font-bold">{selectedCategory}</span>
              </>
            )}
          </nav>

          {/* Header Title */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-cyan-200 mb-4">
              <Sparkle weight="fill" className="h-3.5 w-3.5 text-yellow-300" />
              <span>Direct From CMS & Live Database</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              All Categories & Products
            </h1>

            <p className="mt-3 text-sm sm:text-base lg:text-lg text-slate-200 leading-relaxed font-normal">
              Explore our full catalogue of same-day printing and custom apparel in London.
              Click any category cover below to instantly view all products in that category.
            </p>
          </div>

          {/* Quick Search & Filter in Hero */}
          <div className="mt-8 max-w-2xl">
            <div className="relative flex items-center">
              <MagnifyingGlass
                weight="bold"
                className="absolute left-4 h-5 w-5 text-slate-400 pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories (e.g. Business Cards, T-Shirts, Banners, Mugs)..."
                className="w-full h-13 pl-12 pr-12 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm sm:text-base font-medium shadow-xl shadow-black/20 focus:outline-hidden focus:ring-4 focus:ring-cyan-400/40 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                  aria-label="Clear search"
                >
                  <X weight="bold" className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick stats pills */}
            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs text-slate-200 font-semibold">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
                {categories.length} Live Categories
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">
                {products.length} Total Products
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 flex items-center gap-1.5">
                <Lightning weight="fill" className="h-3.5 w-3.5 text-emerald-300" />
                Same Day London Delivery Available
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES COVER GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-5 sm:p-7 lg:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <SquaresFour weight="bold" className="h-5 w-5 text-[#012169]" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Browse by Category
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Click any category cover image below to filter products under that category.
              </p>
            </div>

            {/* View All Categories Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectCategory('all', true)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5',
                  selectedCategory === 'all'
                    ? 'bg-[#012169] text-white shadow-md shadow-[#012169]/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <span>View All Products</span>
                <span className="text-xs font-semibold opacity-80">({products.length})</span>
              </button>
            </div>
          </div>

          {/* Loading Skeletons */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4.5 pt-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse space-y-2.5">
                  <div className="aspect-4/3 rounded-2xl bg-slate-200" />
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Category Cards Grid */}
          {!isLoading && filteredCategories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4.5 pt-6">
              {filteredCategories.map((cat) => {
                const count = productCountMap.get(cat.name.trim().toLowerCase()) || 0;
                const isSelected =
                  selectedCategory.toLowerCase().trim() === cat.name.toLowerCase().trim();

                return (
                  <div
                    key={cat.id || cat.name}
                    onClick={() => handleSelectCategory(cat.name, true)}
                    className={cn(
                      'group relative flex flex-col rounded-2xl p-2.5 sm:p-3 transition-all duration-200 cursor-pointer text-left border',
                      isSelected
                        ? 'bg-blue-50/70 border-[#012169] ring-2 ring-[#012169]/20 shadow-lg shadow-[#012169]/10'
                        : 'bg-slate-50/60 hover:bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                    )}
                  >
                    {/* Category Cover Image Container */}
                    <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-200 flex items-center justify-center">
                      <ImageWithFallback
                        src={cat.imageUrl}
                        alt={cat.name}
                        fallbackText={cat.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />

                      {/* Best seller badge */}
                      {cat.isBestSeller && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#C8102E] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                          Popular
                        </div>
                      )}

                      {/* Active indicator badge */}
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-md bg-[#012169] text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                          <Check weight="bold" className="h-3 w-3 text-cyan-300" />
                          <span>Active</span>
                        </div>
                      )}
                    </div>

                    {/* Category Title & Info */}
                    <div className="mt-2.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3
                          className={cn(
                            'text-xs sm:text-sm font-black line-clamp-2 leading-tight transition-colors',
                            isSelected
                              ? 'text-[#012169]'
                              : 'text-slate-900 group-hover:text-[#012169]'
                          )}
                        >
                          {cat.name}
                        </h3>
                        {cat.description && (
                          <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>

                      {/* Footer: Count and Link to dedicated category page */}
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-600">
                          {count} {count === 1 ? 'Product' : 'Products'}
                        </span>

                        <Link
                          href={`/category/${encodeURIComponent(cat.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          title={`Open dedicated ${cat.name} category page`}
                          className="p-1 rounded-md text-slate-400 hover:text-[#012169] hover:bg-slate-200/60 transition-colors"
                        >
                          <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty Search for Categories */}
          {!isLoading && filteredCategories.length === 0 && (
            <div className="py-12 text-center">
              <SquaresFour weight="duotone" className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No categories found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                No categories matched &quot;{searchQuery}&quot;. Clear your search or contact our team for a custom quote.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. PRODUCTS DISPLAY SECTION */}
      <section
        id="products-view"
        ref={productsSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 scroll-mt-24"
      >
        {/* Products Filter Header */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg shadow-slate-200/50 border border-slate-200/80 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Tag weight="fill" className="h-5 w-5 text-[#C8102E]" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedCategory === 'all'
                    ? 'All Products'
                    : `Products in "${selectedCategory}"`}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Showing {sortedProducts.length}{' '}
                {sortedProducts.length === 1 ? 'product' : 'products'} available for London delivery & collection.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {selectedCategory !== 'all' && (
                <>
                  <Link
                    href={`/category/${encodeURIComponent(selectedCategory)}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>Visit Category Page</span>
                    <ArrowUpRight weight="bold" className="h-3.5 w-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSelectCategory('all', false)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-[#C8102E] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <X weight="bold" className="h-3.5 w-3.5" />
                    <span>Clear Filter</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Filter Bar Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            {/* Horizontal Category Scroll Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 max-w-full sm:max-w-xl">
              <button
                type="button"
                onClick={() => handleSelectCategory('all', false)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0',
                  selectedCategory === 'all'
                    ? 'bg-[#012169] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                All ({products.length})
              </button>
              {categories.map((cat) => {
                const isSelected =
                  selectedCategory.toLowerCase().trim() === cat.name.toLowerCase().trim();
                const count = productCountMap.get(cat.name.trim().toLowerCase()) || 0;
                return (
                  <button
                    key={cat.id || cat.name}
                    type="button"
                    onClick={() => handleSelectCategory(cat.name, false)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0',
                      isSelected
                        ? 'bg-[#012169] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Same-day switch & Sort dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Same day toggle */}
              <button
                type="button"
                onClick={() => setSameDayOnly(!sameDayOnly)}
                className={cn(
                  'h-9 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border',
                  sameDayOnly
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                )}
              >
                <Lightning weight="fill" className="h-3.5 w-3.5 text-yellow-300" />
                <span>Same-Day Only</span>
              </button>

              {/* Sort by */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-9 pl-3 pr-8 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 focus:outline-hidden focus:border-[#012169] transition-all cursor-pointer appearance-none"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="a-z">Sort: Name (A-Z)</option>
                  <option value="z-a">Sort: Name (Z-A)</option>
                  <option value="price-asc">Sort: Price (Low to High)</option>
                  <option value="price-desc">Sort: Price (High to Low)</option>
                </select>
                <ArrowsDownUp
                  weight="bold"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. PRODUCT GRID */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="aspect-square bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-4/5" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : sortedProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {sortedProducts.map((product) => (
                <motion.div
                  key={product.id || product.slug}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty Products State */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <SquaresFour weight="duotone" className="h-8 w-8" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {selectedCategory !== 'all'
                ? `No products found under "${selectedCategory}"`
                : 'No products match your criteria'}
            </h3>

            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              We offer bespoke printing, rush turnaround, and custom garments on request.
              Speak with our London print shop team directly for an instant quote!
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openCallMe(selectedCategory !== 'all' ? selectedCategory : undefined)}
                className="px-5 py-2.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#012169]/20 flex items-center gap-2 cursor-pointer"
              >
                <PhoneCall weight="bold" className="h-4 w-4" />
                <span>Request Call Me Back</span>
              </button>

              <a
                href="https://wa.me/447951478144?text=Hi%20Print%20Today,%20I'd%20like%20a%20quote%20for%20custom%20printing"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
              >
                <WhatsappLogo weight="bold" className="h-4 w-4" />
                <span>WhatsApp Instant Quote</span>
              </a>

              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all', false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  View All Products
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-10 w-10 border-4 border-[#012169]/20 border-t-[#012169] rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <AllProductsContent />
    </Suspense>
  );
}
