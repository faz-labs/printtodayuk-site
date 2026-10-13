'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { HeroSection } from '@/components/storefront/HeroSection';
import { FeatureHighlights } from '@/components/storefront/FeatureHighlights';
import { SearchFilterBar } from '@/components/storefront/SearchFilterBar';
import { ProductGrid } from '@/components/storefront/ProductGrid';
import { Product } from '@/lib/types';
import { getProducts, getCategories } from '@/lib/db';
import {
  Flame,
  Scissors,
  Stack,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useCallMe } from '@/components/storefront/CallMeContext';

export default function ClothingCatalogPage() {
  const { openCallMe } = useCallMe();
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [sameDayOnly, setSameDayOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'a-z' | 'z-a' | 'price-asc' | 'price-desc' | 'featured'>('a-z');

  useEffect(() => {
    async function loadData() {
      try {
        const [prodsData, catsData] = await Promise.all([
          getProducts('Clothing'),
          getCategories(),
        ]);
        setProducts(prodsData);

        const clothingCat = catsData.find(
          (c) => c.name.toLowerCase() === 'clothing'
        );
        const configSubcats = clothingCat?.subcategories || [];
        const productSubcats = prodsData.map((p) => p.subcategory).filter(Boolean);
        const combinedSubcats = Array.from(
          new Set([...configSubcats, ...productSubcats])
        );

        setSubcategories(['All', ...combinedSubcats]);
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
  }, [products, searchQuery, selectedSubcategory, sameDayOnly, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedSubcategory('All');
    setSameDayOnly(false);
    setSortBy('a-z');
  };

  return (
    <div className="space-y-10">
      {/* Clothing Hero */}
      <HeroSection categoryType="Clothing" />

      {/* Trust & Feature Highlights Bar */}
      <FeatureHighlights />

      {/* Main Clothing Showcase */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Search & Subcategory Filter Bar */}
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

      {/* Printing & Embroidery Methods Showcase */}
      <section className="bg-white py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-[#012169] uppercase tracking-wider">
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
              <div className="h-10 w-10 rounded-xl bg-red-100 text-[#C8102E] flex items-center justify-center mb-4">
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
              <div className="h-10 w-10 rounded-xl bg-[#012169]/15 text-[#012169] flex items-center justify-center mb-4">
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
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-[#012169] flex items-center justify-center mb-4">
                <Stack weight="duotone" className="h-5 w-5" />
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
        <div className="rounded-3xl bg-[#012169] p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/15">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black">
              Need custom staff uniforms or event merchandise fast?
            </h3>
            <p className="mt-2 text-sm text-white/80 leading-relaxed">
              We stock hundreds of blank t-shirts, hoodies, and polo shirts right here at our 75 Green St studio for emergency same-day printing.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => openCallMe('Bulk Clothing Order')}
              className="bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-xl transition-all hover:scale-105 cursor-pointer border border-[#C8102E]"
            >
              Get Custom Apparel Quote
            </button>
            <a
              href="https://wa.me/447969559746"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-md transition-all text-center"
            >
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Vistaprint-Style Clothing FAQs */}
      <section className="bg-slate-50 py-14 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-[#C8102E] uppercase tracking-wider">
              Help & Information
            </span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              Frequently Asked Questions About Custom Clothing
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'What is Direct-to-Film (DTF) garment printing?',
                a: 'DTF is modern digital transfer printing that prints photographic, full-colour artwork with vivid pigments and a stretchable adhesive backing onto cotton, poly-cotton, fleece, and synthetic fabrics. It feels soft, does not crack, and remains bright through dozens of washes.',
              },
              {
                q: 'Can I order a mix of sizes and colours with one design?',
                a: 'Yes, absolutely! You can choose different sizes (from XS to 5XL) and mix garment colours under the same artwork design without extra setup fees.',
              },
              {
                q: 'How should I care for my custom printed garments?',
                a: 'Wash inside-out at 30°C or 40°C with mild detergent. Do not bleach or tumble dry on high heat. If ironing, iron inside-out or use parchment paper over the printed area.',
              },
              {
                q: 'Can you match Pantone or hex brand colours?',
                a: 'Yes, our DTF printers are calibrated with high-density CMYK+White inks. Supply your artwork in CMYK with high-resolution vector or 300 DPI graphics for optimal color matching.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <h4 className="text-sm font-bold text-slate-900 mb-1">{item.q}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
