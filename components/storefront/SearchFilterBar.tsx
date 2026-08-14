'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Zap, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CategoryMegaMenu } from './CategoryMegaMenu';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  subcategories: string[];
  selectedSubcategory: string;
  onSelectSubcategory: (subcat: string) => void;
  sameDayOnly: boolean;
  onToggleSameDayOnly: () => void;
  sortBy: 'featured' | 'price-asc' | 'price-desc';
  onSortChange: (sort: 'featured' | 'price-asc' | 'price-desc') => void;
  totalResults: number;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  subcategories,
  selectedSubcategory,
  onSelectSubcategory,
  sameDayOnly,
  onToggleSameDayOnly,
  sortBy,
  onSortChange,
  totalResults,
}: SearchFilterBarProps) {
  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-200/70 mb-8 space-y-4">
      {/* Top row: Search Input & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search printing products, clothing, banners, flyers..."
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#4a0e35] focus:ring-2 focus:ring-[#4a0e35]/15 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Same-day quick toggle */}
        <button
          onClick={onToggleSameDayOnly}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none',
            sameDayOnly
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          )}
        >
          <Zap
            className={cn(
              'h-3.5 w-3.5',
              sameDayOnly ? 'text-amber-300 fill-amber-300' : 'text-slate-400'
            )}
          />
          <span>Same Day Dispatch</span>
        </button>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as 'featured' | 'price-asc' | 'price-desc')
            }
            className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-[#4a0e35] cursor-pointer"
          >
            <option value="featured">Featured / Best Match</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Subcategory filter pills & More Categories Mega Dropdown */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        <div className="shrink-0">
          <CategoryMegaMenu variant="filterbar" />
        </div>

        <div className="h-4 w-px bg-slate-200 shrink-0" />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar flex-1">
          {subcategories.map((subcat) => {
            const isSelected = selectedSubcategory === subcat;
            return (
              <button
                key={subcat}
                onClick={() => onSelectSubcategory(subcat)}
                className={cn(
                  'relative px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none',
                  isSelected
                    ? 'text-white'
                    : 'text-slate-600 bg-slate-100/80 hover:bg-slate-200/70 hover:text-slate-900'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selectedSubcatPill"
                    className="absolute inset-0 bg-[#4a0e35] rounded-full shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{subcat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results counter indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'product' : 'products'}
          {searchQuery && (
            <>
              {' '}
              matching &ldquo;<span className="text-[#4a0e35] font-semibold">{searchQuery}</span>&rdquo;
            </>
          )}
        </span>
        {selectedSubcategory !== 'All' && (
          <span className="text-slate-400">
            Category: <span className="font-semibold text-slate-700">{selectedSubcategory}</span>
          </span>
        )}
      </div>
    </div>
  );
}
