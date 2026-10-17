'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Product, CategoryConfig } from '@/lib/types';
import { getProducts, getCategories } from '@/lib/db';
import { ProductCard } from '@/components/storefront/ProductCard';
import { SearchFilterBar } from '@/components/storefront/SearchFilterBar';
import { FeatureHighlights } from '@/components/storefront/FeatureHighlights';
import { useCallMe } from '@/components/storefront/CallMeContext';
import {
  CaretRight,
  Lightning,
  Sparkle,
  Phone,
  WhatsappLogo,
  ArrowLeft,
  CircleNotch,
  Tag,
} from '@phosphor-icons/react';

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { openCallMe } = useCallMe();

  const rawCategoryParam = (params?.category as string) || '';
  const categoryName = decodeURIComponent(rawCategoryParam);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryConfig[]>([]);
  const [categoryConfig, setCategoryConfig] = useState<CategoryConfig | null>(null);
  const [subcategories, setSubcategories] = useState<string[]>(['All']);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'a-z' | 'z-a' | 'price-asc' | 'price-desc' | 'featured'>('a-z');
  const [isLoading, setIsLoading] = useState(true);

  // Sync subcat & search query from URL query parameter
  useEffect(() => {
    const subcatFromUrl = searchParams.get('subcat');
    if (subcatFromUrl) {
      setSelectedSubcategory(subcatFromUrl);
    }
    const sameDayFromUrl = searchParams.get('sameDay');
    if (sameDayFromUrl === 'true') {
      setSameDayOnly(true);
    }
    const qFromUrl = searchParams.get('q') || searchParams.get('search');
    if (qFromUrl) {
      setSearchQuery(qFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadCategoryData() {
      setIsLoading(true);
      try {
        const [prodsData, catsData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const cleanCats = catsData.filter(
          (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
        );
        cleanCats.sort((a, b) => a.name.localeCompare(b.name));
        setAllCategories(cleanCats);

        // Find this category (case-insensitive)
        const matchedCat = catsData.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase()
        );
        setCategoryConfig(matchedCat || null);

        // Filter products belonging to this category (matches category name, subcategory, or title)
        // Filter products belonging to this category (matches category name, or title)
        const catTarget = categoryName.toLowerCase().trim();
        const catProducts = prodsData.filter((p) => {
          const pCat = (p.category || '').toLowerCase().trim();
          const pSub = (p.subcategory || '').toLowerCase().trim();
          return (
            pCat === catTarget ||
            (pSub && pSub === catTarget) ||
            pCat.includes(catTarget) ||
            p.title.toLowerCase().includes(catTarget)
          );
        });
        setAllProducts(catProducts);

        // Build list of subcategories
        const configSubcats = matchedCat?.subcategories || [];
        const productSubcats = catProducts
          .map((p) => p.subcategory || '')
          .filter((s): s is string => Boolean(s));
        const combined = Array.from(new Set([...configSubcats, ...productSubcats]));
        setSubcategories(['All', ...combined]);
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (categoryName) {
      loadCategoryData();
    }
  }, [categoryName]);

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (p.title || '').toLowerCase().includes(q);
          const matchDesc = (p.description || '').toLowerCase().includes(q);
          const matchSubcat = (p.subcategory || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSubcat) return false;
        }

        // Subcategory filter
        if (selectedSubcategory !== 'All') {
          if ((p.subcategory || '').toLowerCase() !== selectedSubcategory.toLowerCase()) {
            return false;
          }
        }

        // Same day toggle
        if (sameDayOnly && !p.isSameDayAvailable) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'a-z') {
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        }
        if (sortBy === 'z-a') {
          return b.title.localeCompare(a.title, undefined, { sensitivity: 'base' });
        }
        const priceA = a.discountedPrice || a.price;
        const priceB = b.discountedPrice || b.price;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });
  }, [allProducts, searchQuery, selectedSubcategory, sameDayOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSubcategory('All');
    setSameDayOnly(false);
    setSortBy('a-z');
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Header Banner & Breadcrumbs */}
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <Link href="/" className="hover:text-[#012169] transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              <span>Home</span>
            </Link>
            <CaretRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-900">{categoryName}</span>
            {selectedSubcategory !== 'All' && (
              <>
                <CaretRight className="h-3 w-3 text-slate-400" />
                <span className="font-semibold text-[#012169]">{selectedSubcategory}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-bold mb-2">
                <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
                <span>London Print Collection</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {selectedSubcategory !== 'All' ? `${selectedSubcategory} - ` : ''}
                {categoryName}
              </h1>
              <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
                {categoryConfig?.description ||
                  `Explore premium custom printed ${categoryName.toLowerCase()} with instant pricing and same-day London production.`}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openCallMe(categoryName)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-[#C8102E] text-slate-800 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Phone className="h-4 w-4" />
                <span>Call Me / Fast Quote</span>
              </button>
              <a
                href="https://wa.me/447969559746"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold transition-all shadow-xs"
              >
                <WhatsappLogo weight="fill" className="h-4 w-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          {/* Subcategory Pill Filter Bar */}
          {subcategories.length > 1 && (
            <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {subcategories.map((subcat) => {
                const isActive = selectedSubcategory.toLowerCase() === subcat.toLowerCase();
                const subcatImg = categoryConfig?.subcategoryImages?.[subcat];

                return (
                  <button
                    key={subcat}
                    onClick={() => setSelectedSubcategory(subcat)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                      isActive
                        ? 'bg-[#012169] text-white border-[#012169] shadow-md shadow-[#012169]/20'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {subcatImg ? (
                      <img
                        src={subcatImg}
                        alt={subcat}
                        className="w-4 h-4 rounded-full object-cover"
                      />
                    ) : (
                      <Tag weight="bold" className="w-3.5 h-3.5 opacity-70" />
                    )}
                    <span>{subcat === 'All' ? `All ${categoryName}` : subcat}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Catalog Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search, Filter & Sorter controls */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={allCategories}
          currentCategory={categoryName}
          subcategories={subcategories}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={setSelectedSubcategory}
          sameDayOnly={sameDayOnly}
          onToggleSameDayOnly={() => setSameDayOnly(!sameDayOnly)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
        />

        {/* Loading State */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <CircleNotch className="w-8 h-8 text-[#012169] animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading {categoryName} catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Products Grid with New Clean ProductCard */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug || product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          /* Empty Products State: Prompt user for custom quotes */
          <div className="py-16 text-center bg-slate-50 rounded-3xl border border-slate-200 p-8 max-w-2xl mx-auto">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#012169]/10 text-[#012169] flex items-center justify-center mb-4">
              <Sparkle weight="fill" className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              No pre-listed items found for {selectedSubcategory !== 'All' ? selectedSubcategory : categoryName}
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 max-w-md mx-auto">
              We offer bespoke commercial printing and custom production for any item! Request an instant quote or speak directly with our print team.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => openCallMe(selectedSubcategory !== 'All' ? selectedSubcategory : categoryName)}
                className="px-5 py-2.5 rounded-xl bg-[#012169] text-white text-xs font-bold hover:bg-[#0A358C] transition-all cursor-pointer shadow-md"
              >
                Request Custom Quote
              </button>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Four Pillars Confidence Bar */}
      <FeatureHighlights />
    </div>
  );
}
