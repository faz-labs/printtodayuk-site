'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Phone, RefreshCw } from 'lucide-react';
import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';
import { useCallMe } from './CallMeContext';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onResetFilters?: () => void;
}

export function ProductGrid({
  products,
  isLoading = false,
  onResetFilters,
}: ProductGridProps) {
  const { openCallMe } = useCallMe();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs animate-pulse flex flex-col space-y-4"
          >
            <div className="h-[265px] aspect-square w-full bg-slate-200 rounded-xl" />
            <div className="h-4 bg-slate-200 rounded-md w-3/4" />
            <div className="h-3 bg-slate-100 rounded-md w-full" />
            <div className="h-3 bg-slate-100 rounded-md w-2/3" />
            <div className="pt-4 mt-auto border-t border-slate-100 flex justify-between items-center">
              <div className="h-6 bg-slate-200 rounded-md w-1/3" />
              <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-white border border-slate-200/80 p-12 text-center shadow-lg max-w-xl mx-auto my-8"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
          <Sparkles className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900">No matching products found</h3>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          We offer thousands of custom sizes, finishes, and apparel options tailored to your needs.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onResetFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
          <button
            onClick={() => openCallMe('Custom Requirement')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4a0e35] text-white text-xs font-bold hover:bg-[#5d1243] shadow-md shadow-[#4a0e35]/20 transition-all hover:scale-105"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Request Custom Order via Call Me</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence mode="popLayout">
        {products.map((product, index) => (
          <motion.div
            key={product.id || product.slug}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
