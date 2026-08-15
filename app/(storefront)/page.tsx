'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HeroSection } from '@/components/storefront/HeroSection';
import { FeatureHighlights } from '@/components/storefront/FeatureHighlights';
import { SearchFilterBar } from '@/components/storefront/SearchFilterBar';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { Product } from '@/lib/types';
import { getProducts, getCategories } from '@/lib/db';
import {
  Zap,
  CheckCircle,
  Truck,
  Layers,
  Sparkles,
  Star,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useCallMe } from '@/components/storefront/CallMeContext';

export default function PrintingCatalogPage() {
  const { openCallMe } = useCallMe();
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  useEffect(() => {
    async function loadData() {
      try {
        const [prodsData, catsData] = await Promise.all([
          getProducts('Printing'),
          getCategories(),
        ]);
        setProducts(prodsData);

        const printingCat = catsData.find(
          (c) => c.name.toLowerCase() === 'printing'
        );
        const configSubcats = printingCat?.subcategories || [];
        const productSubcats = prodsData.map((p) => p.subcategory).filter(Boolean);
        const combinedSubcats = Array.from(
          new Set([...configSubcats, ...productSubcats])
        );

        setSubcategories(['All', ...combinedSubcats]);
      } catch (error) {
        console.error('Failed to load printing products:', error);
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

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
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

        // Same day check
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
        return 0; // featured default order
      });
  }, [products, searchQuery, selectedSubcategory, sameDayOnly, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedSubcategory('All');
    setSameDayOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <HeroSection categoryType="Printing" />

      {/* Trust & Feature Highlights Bar */}
      <FeatureHighlights />

      {/* Main Catalog Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Search & Filter Bar */}
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

        {/* Product Grid */}
        <ProductGrid
          products={filteredProducts}
          isLoading={loading}
          onResetFilters={handleReset}
        />
      </div>

      {/* London Production Workflow Section */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
              Speed • Precision • Quality
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              How Same-Day Printing Works in London
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              From file submission to studio collection in under 3 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl bg-slate-50 p-6 border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-[#4a0e35] text-white flex items-center justify-center font-black text-lg mb-4 shadow-md">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Order & Artwork Review
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your product or request a fast quote. Our in-house designers inspect your PDF, bleed, and resolution for 100% print precision.
              </p>
            </div>

            <div className="relative rounded-2xl bg-slate-50 p-6 border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                High-Speed London Printing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Printed on industry-leading digital presses and wide-format eco-solvent machines right in our London production studio on Green St.
              </p>
            </div>

            <div className="relative rounded-2xl bg-slate-50 p-6 border border-slate-200/80 shadow-xs">
              <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-md">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Same-Day Pick Up or Courier
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Collect instantly from 75 Green St, E7 8JF, or have our London courier dispatch directly to your office, event venue, or doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-[#2e0921] p-8 sm:p-12 text-white shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-amber-400" />
                ))}
              </div>
              <h3 className="text-2xl font-black">Rated 4.9/5 by London Businesses</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Trusted by hundreds of event organizers, restaurants, retail shops, agencies, and corporations across Greater London.
              </p>
              <button
                onClick={() => openCallMe('General Printing Consultation')}
                className="mt-6 px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Speak to a Print Expert
              </button>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/10 p-5 border border-white/10 backdrop-blur-md">
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  &ldquo;Saved our event! Requested an urgent turnaround in the morning and our order was ready for pickup by early afternoon. Flawless quality.&rdquo;
                </p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-300">Marcus Sterling</span>
                  <span className="text-slate-400">Tech Summit London</span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-5 border border-white/10 backdrop-blur-md">
                <p className="text-xs text-slate-200 italic leading-relaxed">
                  &ldquo;The print finish and paper quality exceeded all expectations. The Print Today team on Green St is unmatched in turnaround speed and service.&rdquo;
                </p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-300">Priya Patel</span>
                  <span className="text-slate-400">Architecture Studio</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
