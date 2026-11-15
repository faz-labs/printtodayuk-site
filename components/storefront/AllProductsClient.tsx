'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { trackWhatsAppClick, trackCallClick } from '@/lib/analytics';

export function AllProductsClient() {
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
    const sameDayFromUrl = searchParams.get('sameDay');
    if (sameDayFromUrl === 'true') {
      setSameDayOnly(true);
    }
  }, [searchParams]);

  // Load live data from Firestore / local cache
  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [catsData, prodsData] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);

        const validCats = catsData.filter(
          (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
        );
        validCats.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(validCats);

        setProducts(prodsData);
      } catch (err) {
        console.error('Failed to load catalog data:', err);
        const fallbackCats = getLocalCategories().filter(
          (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
        );
        fallbackCats.sort((a, b) => a.name.localeCompare(b.name));
        setCategories(fallbackCats);
        setProducts(getLocalProducts());
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalog();
  }, []);

  // Handler to change category and optionally scroll down to products
  const handleSelectCategory = (catName: string, shouldScroll = true) => {
    setSelectedCategory(catName);
    const params = new URLSearchParams(window.location.search);
    if (catName === 'all') {
      params.delete('category');
      params.delete('cat');
    } else {
      params.set('category', catName);
    }
    const newQuery = params.toString();
    router.replace(newQuery ? `/all-products?${newQuery}` : '/all-products', { scroll: false });

    if (shouldScroll && productsSectionRef.current) {
      const topOffset = productsSectionRef.current.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // Filtered & sorted products list
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // 1. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchCat = (p.category || '').toLowerCase().includes(q);
        const matchSubcat = (p.subcategory || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCat && !matchSubcat) return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        const target = selectedCategory.toLowerCase().trim();
        const pCat = (p.category || '').toLowerCase().trim();
        const pSub = (p.subcategory || '').toLowerCase().trim();
        const matchesCategory =
          pCat === target ||
          (pSub && pSub === target) ||
          pCat.includes(target) ||
          p.title.toLowerCase().includes(target);
        if (!matchesCategory) return false;
      }

      // 3. Same Day Only toggle
      if (sameDayOnly && !p.isSameDayAvailable) {
        return false;
      }

      return true;
    });

    // Sorter
    return result.sort((a, b) => {
      if (sortBy === 'a-z') {
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      }
      if (sortBy === 'z-a') {
        return b.title.localeCompare(a.title, undefined, { sensitivity: 'base' });
      }
      if (sortBy === 'price-asc') {
        const priceA = a.discountedPrice || a.price || 0;
        const priceB = b.discountedPrice || b.price || 0;
        return priceA - priceB;
      }
      if (sortBy === 'price-desc') {
        const priceA = a.discountedPrice || a.price || 0;
        const priceB = b.discountedPrice || b.price || 0;
        return priceB - priceA;
      }
      return 0;
    });
  }, [products, searchQuery, selectedCategory, sameDayOnly, sortBy]);

  return (
    <div className="bg-[#fbfcfd] min-h-screen font-sans text-slate-900">
      {/* 1. Header & Semantic Breadcrumb */}
      <section className="bg-white border-b border-slate-200/80 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#012169] transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900" aria-current="page">
              All Products Catalog
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-bold mb-3 shadow-2xs">
                <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
                <span>London In-House Production &bull; 80+ Commercial Products</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                All Print Products London
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                Browse our complete collection of business cards, flyers, posters, roller banners, booklets, stickers, and seasonal print. Printed in-house with same-day London collection and fast UK dispatch.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I'd%20like%20a%20quote%20for%20custom%20printing"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('All Products Header')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <WhatsappLogo weight="fill" className="h-4 w-4" />
                <span>WhatsApp Quote</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  trackCallClick('All Products Header');
                  openCallMe('All Products Catalog');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <PhoneCall weight="bold" className="h-4 w-4" />
                <span>Request Call Back</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Search & Controls Bar */}
      <section ref={productsSectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products (e.g. business cards, flyers, roller banners, hoodies)..."
                className="w-full h-11 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169] focus:bg-white focus:ring-2 focus:ring-[#012169]/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  <X weight="bold" className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Same-Day Toggle & Sorter */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setSameDayOnly(!sameDayOnly)}
                className={`inline-flex items-center gap-2 h-11 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  sameDayOnly
                    ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Lightning weight="fill" className={`h-4 w-4 ${sameDayOnly ? 'text-amber-300' : 'text-[#C8102E]'}`} />
                <span>Same Day Only</span>
              </button>

              <div className="relative flex-1 sm:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full sm:w-44 h-11 px-3.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#012169] cursor-pointer appearance-none pr-8 shadow-2xs"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="a-z">Name: A to Z</option>
                  <option value="z-a">Name: Z to A</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ArrowsDownUp weight="bold" className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleSelectCategory('all', false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                selectedCategory === 'all'
                  ? 'bg-[#012169] text-white border-[#012169] shadow-2xs'
                  : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
              }`}
            >
              All Categories ({products.length})
            </button>
            {categories.map((c) => {
              const isSelected = selectedCategory.toLowerCase() === c.name.toLowerCase();
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => handleSelectCategory(c.name, false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                    isSelected
                      ? 'bg-[#012169] text-white border-[#012169] shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-transparent hover:bg-slate-200'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-[#012169]/20 border-t-[#012169] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500">Loading full catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div>
            <div className="text-xs font-bold text-slate-500 mb-4 flex items-center justify-between">
              <span>Showing {filteredProducts.length} print products</span>
              {selectedCategory !== 'all' && (
                <button
                  type="button"
                  onClick={() => handleSelectCategory('all', false)}
                  className="text-[#012169] hover:underline"
                >
                  Clear category filter &times;
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard key={p.slug || p.id} product={p} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <SquaresFour weight="bold" className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No matching print products found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search terms or clearing your category filters.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSameDayOnly(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#012169] text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
