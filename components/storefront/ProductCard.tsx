'use client';

import React from 'react';
import Link from 'next/link';
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
      className="group flex flex-col w-full focus:outline-hidden"
    >
      {/* 1. CARD CONTAINER: Full fill picture, no white padding border */}
      <div className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:shadow-md">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.title}
          fallbackText={product.title}
          className="w-full h-full object-cover p-0 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* 2. TEXT IS OUT OF THE CARD: Title and pricing below the image container */}
      <div className="mt-2.5 space-y-0.5 text-left">
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
