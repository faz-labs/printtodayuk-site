'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CreditCard,
  FileText,
  TShirt,
  Flag,
  Sticker,
  ShoppingBag,
  Lightning,
  Sparkle,
  ArrowRight,
  ArrowSquareOut,
} from '@phosphor-icons/react';

interface CategoryTile {
  title: string;
  subtitle: string;
  priceFrom: string;
  href: string;
  isExternal?: boolean;
  isSameDay?: boolean;
  badge?: string;
  imageUrl: string;
  icon: React.ElementType;
}

export function CategoryTilesSection() {
  const tiles: CategoryTile[] = [
    {
      title: 'Business Cards',
      subtitle: 'Luxury Matt, Soft-Touch, Gloss & Gold Foil',
      priceFrom: '£19.00',
      href: '/category/Printing?subcat=Business%20Cards',
      badge: 'Bestseller',
      imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
      icon: CreditCard,
    },
    {
      title: 'Photo Mugs',
      subtitle: 'Vibrant full-colour wrap ceramic & magic mugs',
      priceFrom: '£6.99',
      href: '/category/Gift%20Items?subcat=Mugs',
      badge: 'Popular Gift',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
      icon: Sparkle,
    },
    {
      title: 'T-Shirts & Apparel',
      subtitle: 'Direct-to-Film (DTF) full colour printed tees',
      priceFrom: '£14.99',
      href: '/category/Clothing?subcat=T-Shirts',
      badge: 'Express DTF',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
      icon: TShirt,
    },
    {
      title: 'Flyers & Leaflets',
      subtitle: 'Folded brochures, menus & marketing prints',
      priceFrom: '£25.00',
      href: '/category/Printing?subcat=Flyers%20%26%20Leaflets',
      badge: 'Popular',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop',
      icon: FileText,
    },
    {
      title: 'Promotional Pens',
      subtitle: 'Precision laser engraved & soft-touch click pens',
      priceFrom: '£3.25',
      href: '/category/Gift%20Items?subcat=Pens',
      badge: 'Corporate',
      imageUrl: 'https://images.unsplash.com/photo-1585336261026-41862551e1e4?q=80&w=600&auto=format&fit=crop',
      icon: Sparkle,
    },
    {
      title: 'Signs & Banners',
      subtitle: 'PVC outdoor vinyl, mesh & roller pull-up banners',
      priceFrom: '£35.00',
      href: 'https://signtodayai.co.uk',
      isExternal: true,
      badge: 'signtodayai.co.uk',
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
      icon: Flag,
    },
    {
      title: 'Stickers & Labels',
      subtitle: 'Waterproof die-cut vinyl & product roll stickers',
      priceFrom: '£15.00',
      href: '/category/Printing?subcat=Stickers%20%26%20Labels',
      badge: 'Custom Cut',
      imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=600&auto=format&fit=crop',
      icon: Sticker,
    },
    {
      title: 'Hoodies & Workwear',
      subtitle: 'Heavy fleece jumpers, hi-vis vests & polos',
      priceFrom: '£24.99',
      href: '/category/Clothing?subcat=Hoodies%20%26%20Sweatshirts',
      badge: 'Durable',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop',
      icon: ShoppingBag,
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-bold mb-2">
            <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
            <span>Popular Categories</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Explore Print & Apparel Categories
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Hand-crafted in London with same-day collection at 75 Green St, E7 8JF or express delivery.
          </p>
        </div>

        <Link
          href="/#catalog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#012169] hover:text-[#C8102E] transition-colors"
        >
          <span>View all products</span>
          <ArrowRight weight="bold" className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of 8 Category Tiles (Vistaprint Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {tiles.map((tile, idx) => {
          const Icon = tile.icon;
          const CardContent = (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className={`group relative h-full flex flex-col justify-between rounded-2xl sm:rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white cursor-pointer ${
                tile.isSameDay
                  ? 'border-[#C8102E]/40 hover:border-[#C8102E] ring-1 ring-[#C8102E]/20'
                  : 'border-slate-200/90 hover:border-[#012169]/40'
              }`}
            >
              {/* Photo Banner with Aspect Ratio */}
              <div className="relative w-full aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={tile.imageUrl}
                  alt={tile.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                />

                {/* Gradient shade */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

                {/* Badge Overlay */}
                {tile.badge && (
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold shadow-md ${
                        tile.isSameDay
                          ? 'bg-[#C8102E] text-white'
                          : 'bg-white/95 text-[#012169]'
                      }`}
                    >
                      {tile.isSameDay && (
                        <Lightning weight="fill" className="h-3 w-3 text-amber-300" />
                      )}
                      <span>{tile.badge}</span>
                    </span>
                  </div>
                )}

                {/* Price pill on image */}
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-bold">
                    From {tile.priceFrom}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1">
                      {tile.title}
                    </h3>
                    {tile.isExternal ? (
                      <ArrowSquareOut
                        weight="bold"
                        className="h-4 w-4 text-slate-400 group-hover:text-[#C8102E] shrink-0"
                      />
                    ) : (
                      <ArrowRight
                        weight="bold"
                        className="h-4 w-4 text-slate-400 group-hover:text-[#012169] group-hover:translate-x-1 transition-all shrink-0"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {tile.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#012169]">
                  <span className="group-hover:underline">Shop now</span>
                  <div className="h-6 w-6 rounded-full bg-slate-100 group-hover:bg-[#012169] group-hover:text-white flex items-center justify-center transition-colors">
                    <Icon weight="bold" className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );

          if (tile.isExternal) {
            return (
              <a
                key={tile.title}
                href={tile.href}
                target="_blank"
                rel="noopener noreferrer"
                className="h-full block"
              >
                {CardContent}
              </a>
            );
          }

          return (
            <Link key={tile.title} href={tile.href} className="h-full block">
              {CardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
