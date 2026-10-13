'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HeroSection } from '@/components/storefront/HeroSection';
import { FeatureHighlights } from '@/components/storefront/FeatureHighlights';
import { CategoryTilesSection } from '@/components/storefront/CategoryTilesSection';
import { CuratedSolutionsSection } from '@/components/storefront/CuratedSolutionsSection';
import { PromoCalloutBanner } from '@/components/storefront/PromoCalloutBanner';
import { CustomerShowcaseSection } from '@/components/storefront/CustomerShowcaseSection';
import { WhyChooseUsSection } from '@/components/storefront/WhyChooseUsSection';
import { NewsletterSection } from '@/components/storefront/NewsletterSection';
import { SearchFilterBar } from '@/components/storefront/SearchFilterBar';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { Product } from '@/lib/types';
import { getProducts, getCategories } from '@/lib/db';
import { Lightning, Printer, TShirt, Sparkle } from '@phosphor-icons/react';

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [activeCatalogTab, setActiveCatalogTab] = useState<'all' | 'same-day' | 'printing' | 'clothing'>('all');
  const [sortBy, setSortBy] = useState<'a-z' | 'z-a' | 'price-asc' | 'price-desc' | 'featured'>('a-z');

  useEffect(() => {
    async function loadData() {
      try {
        const [prodsData, catsData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);
        setAllProducts(prodsData);

        const configSubcats = catsData.flatMap((c) => c.subcategories || []);
        const productSubcats = prodsData.map((p) => p.subcategory).filter(Boolean);
        const combinedSubcats = Array.from(
          new Set([...configSubcats, ...productSubcats])
        );

        setSubcategories(['All', ...combinedSubcats]);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const subcatParam = params.get('subcat');
      const sameDayParam = params.get('sameDay');
      if (subcatParam) {
        setSelectedSubcategory(subcatParam);
      }
      if (sameDayParam === 'true') {
        setSameDayOnly(true);
        setActiveCatalogTab('same-day');
      }
    }
  }, []);

  // Filter & Sort Logic (Default: Alphabetical A to Z)
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        // Tab Filter
        if (activeCatalogTab === 'same-day' && !p.isSameDayAvailable) return false;
        if (activeCatalogTab === 'printing' && p.category.toLowerCase() !== 'printing') return false;
        if (activeCatalogTab === 'clothing' && p.category.toLowerCase() !== 'clothing') return false;

        // Search query check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSubcat = p.subcategory.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSubcat) return false;
        }

        // Subcategory check
        if (selectedSubcategory !== 'All') {
          if (p.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) {
            return false;
          }
        }

        // Same day toggle check
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
  }, [allProducts, activeCatalogTab, searchQuery, selectedSubcategory, sameDayOnly, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedSubcategory('All');
    setSameDayOnly(false);
    setActiveCatalogTab('all');
    setSortBy('a-z');
  };

  const handleTabChange = (tab: 'all' | 'same-day' | 'printing' | 'clothing') => {
    setActiveCatalogTab(tab);
    if (tab === 'same-day') {
      setSameDayOnly(true);
    } else {
      setSameDayOnly(false);
    }
  };

  return (
    <div className="space-y-0">
      {/* 1. Vistaprint-Style Hero Section with Crystal Clear Video */}
      <HeroSection categoryType="Printing" />

      {/* 2. Vistaprint 4-Pillar Confidence & Trust Bar */}
      <FeatureHighlights />

      {/* 3. Vistaprint-Style Popular Category Tiles Grid */}
      <CategoryTilesSection />

      {/* 4. Vistaprint-Style Curated Industry Collections */}
      <CuratedSolutionsSection />

      {/* 5. In the Spotlight: Live Product Catalog Showcase */}
      <section id="catalog" className="py-14 bg-white border-b border-slate-200 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-bold mb-2">
                <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
                <span>Featured Collection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                In the Spotlight: Best-Selling Products
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Customizable print specifications with instant online pricing and same-day turnaround.
              </p>
            </div>

            {/* Vistaprint-Style Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCatalogTab === 'all'
                    ? 'bg-[#012169] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Bestsellers
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('same-day')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCatalogTab === 'same-day'
                    ? 'bg-[#C8102E] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lightning weight="fill" className="h-3 w-3 text-amber-300" />
                <span>Same-Day Ready</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('printing')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCatalogTab === 'printing'
                    ? 'bg-[#012169] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer weight="bold" className="h-3 w-3" />
                <span>Printing</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('clothing')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeCatalogTab === 'clothing'
                    ? 'bg-[#012169] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TShirt weight="bold" className="h-3 w-3" />
                <span>Clothing</span>
              </button>
            </div>
          </div>

          {/* Search, Subcategory Dropdown & Sorter */}
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            subcategories={subcategories}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={setSelectedSubcategory}
            sameDayOnly={sameDayOnly}
            onToggleSameDayOnly={() => setSameDayOnly(!sameDayOnly)}
            sortBy={sortBy}
            onSortChange={setSortBy}
            totalResults={filteredProducts.length}
          />

          {/* Product Cards Grid */}
          <ProductGrid
            products={filteredProducts}
            isLoading={loading}
            onResetFilters={handleReset}
          />
        </div>
      </section>

      {/* 6. High-Impact Promo Callout Banner with Code */}
      <PromoCalloutBanner />

      {/* 7. Real Customer Showcase & 4.9/5 Trustpilot Reviews */}
      <CustomerShowcaseSection />

      {/* 8. Why London Businesses Choose Print Today UK */}
      <WhyChooseUsSection />

      {/* 9. Newsletter Voucher Offer (Claim 10% Off) */}
      <NewsletterSection />
    </div>
  );
}
