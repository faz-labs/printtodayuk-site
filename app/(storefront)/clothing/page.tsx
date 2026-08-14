'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HeroSection } from '@/components/storefront/HeroSection';
import { SearchFilterBar } from '@/components/storefront/SearchFilterBar';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { Product } from '@/lib/types';
import { getProducts } from '@/lib/db';
import { CLOTHING_SUBCATEGORIES } from '@/lib/data';
import {
  Shirt,
  Sparkles,
  Scissors,
  Layers,
  Flame,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useCallMe } from '@/components/storefront/CallMeContext';

export default function ClothingCatalogPage() {
  const { openCallMe } = useCallMe();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProducts('Clothing');
        setProducts(data);
      } catch (error) {
        console.error('Failed to load clothing products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const subcatParam = params.get('subcat');
      if (subcatParam) {
        setSelectedSubcategory(subcatParam);
      }
    }
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSubcat = p.subcategory.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSubcat) return false;
        }

        if (selectedSubcategory !== 'All') {
          if (p.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) {
            return false;
          }
        }

        if (sameDayOnly && !p.isSameDayAvailable) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountedPrice || a.price;
        const priceB = b.discountedPrice || b.price;
        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        return 0;
      });
  }, [products, searchQuery, selectedSubcategory, sameDayOnly, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedSubcategory('All');
    setSameDayOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="space-y-12">
      {/* Clothing Hero */}
      <HeroSection categoryType="Clothing" />

      {/* Main Clothing Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        {/* Search & Subcategory Filter Bar */}
        <SearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          subcategories={CLOTHING_SUBCATEGORIES}
          selectedSubcategory={selectedSubcategory}
          onSelectSubcategory={setSelectedSubcategory}
          sameDayOnly={sameDayOnly}
          onToggleSameDayOnly={() => setSameDayOnly(!sameDayOnly)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResults={filteredProducts.length}
        />

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          isLoading={loading}
          onResetFilters={handleReset}
        />
      </div>

      {/* Printing & Embroidery Methods Showcase */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#4a0e35] uppercase tracking-wider">
              Garment Customization Technologies
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              Custom Apparel Methods We Master
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              High durability, ultra-vibrant colors, and tactile finishes for streetwear, hospitality, and trade uniforms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Direct-to-Film (DTF)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full-color photographic prints with stretch resistance. No color limits, ideal for small and medium runs.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-[#4a0e35]/15 text-[#4a0e35] flex items-center justify-center mb-4">
                <Scissors className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Precision Embroidery
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-thread industrial embroidery & 3D puff stitching for polo shirts, jackets, fleeces, and snapbacks.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Screen Printing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-volume economical apparel printing using premium plastisol & water-based inks for events and merchandise.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                High-Vis Heat Vinyl
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Industrial reflective and heat-sealed vinyl for safety vests, workwear trousers, and weather-proof outerwear.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Apparel Consultation CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-[#4a0e35] p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black">
              Need custom staff uniforms or event merchandise fast?
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-rose-100/90 leading-relaxed">
              We stock hundreds of blank t-shirts, hoodies, and polo shirts right here at our 75 Green St studio for emergency same-day printing.
            </p>
          </div>
          <button
            onClick={() => openCallMe('Bulk Clothing Order')}
            className="shrink-0 bg-white text-[#4a0e35] font-black px-6 py-3.5 rounded-xl text-sm shadow-xl hover:bg-rose-50 transition-all hover:scale-105 cursor-pointer"
          >
            Get Custom Apparel Quote
          </button>
        </div>
      </section>
    </div>
  );
}
