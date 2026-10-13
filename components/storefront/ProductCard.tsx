'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from '@phosphor-icons/react';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ImageWithFallback } from './ImageWithFallback';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const activePrice = product.discountedPrice || product.price;

  return (
    <Link
      href={`/product/${product.id || product.slug}`}
      className="group block w-full focus:outline-hidden"
    >
      {/* 1. Bordered Image Box matching reference screenshot */}
      <div className="relative w-full aspect-square bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 flex items-center justify-center transition-all duration-200 group-hover:border-slate-300">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.title}
          fallbackText={product.title}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top-left pill badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 pointer-events-none">
          {product.isSameDayAvailable ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#012169] text-white">
              Same Day
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
              Bestseller
            </span>
          )}
        </div>

        {/* Top-right Heart outline icon */}
        <div className="absolute top-3 right-3 text-slate-700 group-hover:text-[#C8102E] transition-colors pointer-events-none">
          <Heart weight="regular" className="w-5 h-5" />
        </div>
      </div>

      {/* 2. Title & Pricing below the image box */}
      <div className="mt-2.5 space-y-0.5">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-2 leading-snug">
          {product.title}
        </h3>

        <div className="pt-0.5">
          <p className="text-sm sm:text-base font-bold text-slate-900">
            From {formatCurrency(activePrice)} each
          </p>
          <p className="text-xs text-slate-500 leading-tight">
            Incl. VAT
          </p>
          <p className="text-xs text-slate-500 leading-tight">
            {product.minQuantity && product.minQuantity > 1
              ? `Min. quantity ${product.minQuantity}`
              : 'No minimum quantity'}
          </p>
        </div>
      </div>
    </Link>
  );
}
