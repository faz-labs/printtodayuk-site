'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SquaresFour,
  CaretDown,
  CaretRight,
  X,
  MagnifyingGlass,
  Printer,
  TShirt,
  Stack,
  Sparkle,
  ArrowRight,
} from '@phosphor-icons/react';
import { CategoryConfig } from '@/lib/types';
import { getCategories } from '@/lib/db';
import { Badge } from '@/components/ui/Badge';

interface CategoryMegaMenuProps {
  onSelectCategory?: (category: string, subcategory?: string) => void;
  variant?: 'navbar' | 'filterbar' | 'button';
}

export function CategoryMegaMenu({
  onSelectCategory,
  variant = 'navbar',
}: CategoryMegaMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [filterSearch, setFilterSearch] = useState('');

  useEffect(() => {
    async function fetchCategories() {
      const data = await getCategories();
      setCategories(data);
    }
    fetchCategories();
  }, []);

  const handleSelect = (categoryName: string, subcategory?: string) => {
    setIsOpen(false);
    if (onSelectCategory) {
      onSelectCategory(categoryName, subcategory);
    } else {
      if (categoryName.toLowerCase() === 'clothing') {
        router.push(`/clothing${subcategory ? `?subcat=${encodeURIComponent(subcategory)}` : ''}`);
      } else {
        router.push(`/${subcategory ? `?subcat=${encodeURIComponent(subcategory)}` : ''}`);
      }
    }
  };

  const filteredCategories = categories.map((cat) => {
    if (!filterSearch.trim()) return cat;
    const q = filterSearch.toLowerCase();
    const matchCat = cat.name.toLowerCase().includes(q);
    const subcats = cat.subcategories || [];
    const matchedSubcats = subcats.filter((s) => s.toLowerCase().includes(q));
    if (matchCat) return cat;
    return {
      ...cat,
      subcategories: matchedSubcats,
    };
  }).filter((cat) => (cat.subcategories || []).length > 0 || cat.name.toLowerCase().includes(filterSearch.toLowerCase()));

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('print')) return Printer;
    if (n.includes('cloth') || n.includes('apparel')) return TShirt;
    return Stack;
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      {variant === 'navbar' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
            isOpen
              ? 'bg-[#012169] text-white border-[#012169] shadow-xs'
              : 'bg-slate-100/90 text-slate-800 border-slate-200/80 hover:bg-slate-200/80'
          }`}
          aria-expanded={isOpen}
          aria-label="Browse All Categories"
        >
          <SquaresFour weight="bold" className="h-3.5 w-3.5 text-[#C8102E]" />
          <span>All Categories</span>
          <CaretDown
            weight="bold"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {variant === 'filterbar' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
            isOpen
              ? 'bg-[#012169] text-white border-[#012169]'
              : 'bg-blue-50 text-[#012169] border-blue-200 hover:bg-blue-100/70'
          }`}
        >
          <SquaresFour weight="bold" className="h-3.5 w-3.5 text-[#C8102E]" />
          <span>View All Categories ({categories.length})</span>
          <CaretDown
            weight="bold"
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      )}

      {/* Mega Menu Dropdown Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for outside click */}
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
              onClick={() => setIsOpen(false)}
            />

            {/* Mega Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-20 sm:top-24 sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:mt-3 w-auto sm:w-[680px] lg:w-[860px] xl:w-[940px] max-h-[80vh] overflow-y-auto z-50 bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200"
            >
              {/* Header inside Mega Menu */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      Explore All Product Categories
                    </h3>
                    <Badge variant="uk-blue" className="text-[10px]">
                      {categories.length} Categories
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select any category or subcategory for instant same-day catalog filtering.
                  </p>
                </div>

                {/* Search bar inside Mega Menu */}
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-56">
                    <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Search subcategories..."
                      className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#012169]"
                    />
                  </div>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X weight="bold" className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Multi-Column Multi-Row Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => {
                  const Icon = getCategoryIcon(category.name);

                  return (
                    <div
                      key={category.name}
                      className="rounded-2xl bg-slate-50/80 p-4 border border-slate-200/80 hover:border-[#012169]/30 hover:bg-slate-50 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Category Header */}
                        <button
                          onClick={() => handleSelect(category.name)}
                          className="w-full flex items-center justify-between text-left group mb-3 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-[#012169] text-white flex items-center justify-center shadow-xs">
                              <Icon weight="bold" className="h-4 w-4 text-red-300" />
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900 group-hover:text-[#012169] transition-colors leading-tight">
                                {category.name}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {(category.subcategories || []).length} items
                              </div>
                            </div>
                          </div>
                          <CaretRight weight="bold" className="h-4 w-4 text-slate-300 group-hover:text-[#012169] transition-transform group-hover:translate-x-0.5" />
                        </button>

                        {/* Subcategories List */}
                        {(category.subcategories || []).length > 0 && (
                          <ul className="space-y-1.5 border-t border-slate-200/60 pt-2.5">
                            {(category.subcategories || []).map((subcat) => (
                              <li key={subcat}>
                                <button
                                  onClick={() => handleSelect(category.name, subcat)}
                                  className="w-full text-left flex items-center justify-between text-[11px] font-semibold text-slate-600 hover:text-[#012169] hover:bg-white p-1 rounded-md transition-colors cursor-pointer"
                                >
                                  <span className="truncate">{subcat}</span>
                                  <span className="text-[10px] text-slate-300">→</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* View All in Category Footer */}
                      <button
                        onClick={() => handleSelect(category.name)}
                        className="mt-4 pt-2 border-t border-slate-200/60 text-[10px] font-bold text-[#012169] hover:underline flex items-center justify-between cursor-pointer"
                      >
                        <span>View All {category.name}</span>
                        <ArrowRight weight="bold" className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Quick Help Banner */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-slate-50 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Sparkle weight="fill" className="h-4 w-4 text-[#C8102E]" />
                  <span>Can&apos;t find your exact size or finish? We offer bespoke custom printing.</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    const callMeBtn = document.querySelector('[data-callme-trigger="true"]') as HTMLButtonElement;
                    if (callMeBtn) callMeBtn.click();
                  }}
                  className="font-bold text-[#C8102E] hover:underline shrink-0 cursor-pointer"
                >
                  Request Bespoke Quote →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
