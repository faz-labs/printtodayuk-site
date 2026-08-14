'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Phone, ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { Product } from '@/lib/types';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { Card3D } from '@/components/ui/Card3D';
import { Badge } from '@/components/ui/Badge';
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
    <Card3D depth={10} className="flex flex-col h-full overflow-hidden group">
      {/* Image Container: 265x265px square */}
      <div className="relative w-full h-[265px] aspect-square bg-slate-100 overflow-hidden">
        <ImageWithFallback
          src={product.imageUrl}
          alt={product.title}
          fallbackText={product.title}
          className="group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-col gap-1.5 items-start">
            {product.isSameDayAvailable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 text-white shadow-md">
                <Zap className="h-3 w-3 fill-amber-300 text-amber-300" />
                <span>Same Day</span>
              </span>
            )}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-md shadow-xs border border-white/40">
              {product.subcategory}
            </span>
          </div>

          {discount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-600 text-white shadow-md">
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
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#4a0e35] transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Description */}
          <p className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Feature Snippets */}
          {product.features && product.features.length > 0 && (
            <div className="mt-3 space-y-1">
              {product.features.slice(0, 2).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                  <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Order Info */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {product.minQuantity ? `From ${product.minQuantity} units` : 'From'}
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-[#4a0e35]">
                {formatCurrency(activePrice)}
              </span>
              {product.discountedPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>

          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
            London Pickup/Delivery
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => openCallMe(product.title)}
            className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-slate-100 hover:bg-[#4a0e35] text-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call Me</span>
          </button>

          <Link
            href={`/product/${product.id || product.slug}`}
            className="flex items-center justify-center gap-1 h-9 rounded-xl bg-[#4a0e35] hover:bg-[#601445] text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>Details</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card3D>
  );
}
