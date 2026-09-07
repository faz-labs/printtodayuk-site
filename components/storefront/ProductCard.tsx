'use client';

import React from 'react';
import Link from 'next/link';
import { Lightning, Phone, ArrowUpRight } from '@phosphor-icons/react';
import { Product } from '@/lib/types';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { Card3D } from '@/components/ui/Card3D';
import { ImageWithFallback } from './ImageWithFallback';
import { useCallMe } from './CallMeContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { openCallMe } = useCallMe();

  const discount = calculateDiscount(product.price, product.discountedPrice);
  const activePrice = product.discountedPrice || product.price;

  return (
    <Card3D className="flex flex-col h-full overflow-hidden group">
      {/* Image Container: 265x265px square */}
      <div className="relative w-full h-[265px] aspect-square bg-slate-100 overflow-hidden">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.title}
          fallbackText={product.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-col gap-1.5 items-start">
            {product.isSameDayAvailable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#012169] text-white shadow-md">
                <Lightning weight="fill" className="h-3 w-3 text-amber-300" />
                <span>Same Day</span>
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-white/95 text-[#012169] shadow-xs border border-slate-200">
              {product.subcategory}
            </span>
          </div>

          {discount && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-extrabold bg-[#C8102E] text-white shadow-md">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex-1">
          {/* Title */}
          <Link href={`/product/${product.id || product.slug}`}>
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#012169] transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Order Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              {product.minQuantity ? `From ${product.minQuantity} units` : 'From'}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#012169]">
                {formatCurrency(activePrice)}
              </span>
              {product.discountedPrice && (
                <span className="text-sm text-slate-400 line-through font-semibold">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => openCallMe(product.title)}
            className="flex items-center justify-center gap-1.5 h-10 rounded-xl bg-slate-100 hover:bg-[#C8102E] text-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call Me</span>
          </button>

          <Link
            href={`/product/${product.id || product.slug}`}
            className="flex items-center justify-center gap-1 h-10 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>Details</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card3D>
  );
}
