'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';

interface CategoryTile {
  title: string;
  subtitle?: string;
  priceFrom?: string;
  href: string;
  imageUrl: string;
}

export function CategoryTilesSection() {
  const tiles: CategoryTile[] = [
    {
      title: 'Business Cards',
      priceFrom: 'From £19.00',
      href: '/category/Business%20Cards',
      imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Personalised Mugs',
      priceFrom: 'From £6.99',
      href: '/category/Personalised%20Mugs',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'T-Shirts & Apparel',
      priceFrom: 'From £14.99',
      href: '/category/T-Shirts',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Flyers & Leaflets',
      priceFrom: 'From £25.00',
      href: '/category/Flyers%20%26%20Leaflets',
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Promotional Pens',
      priceFrom: 'From £3.25',
      href: '/category/Promotional%20Pens',
      imageUrl: 'https://images.unsplash.com/photo-1585336261026-41862551e1e4?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Signs & Banners',
      priceFrom: 'From £35.00',
      href: '/category/PVC%20Banners',
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Stickers & Labels',
      priceFrom: 'From £15.00',
      href: '/category/Stickers%20%26%20Labels',
      imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=600&auto=format&fit=crop',
    },
    {
      title: 'Hoodies & Workwear',
      priceFrom: 'From £24.99',
      href: '/category/Hoodies%20%26%20Sweatshirts',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=600&auto=format&fit=crop',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header: Title and Shop now link directly matching user screenshot */}
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            In the spotlight
          </h2>
          <Link
            href="/category/Printing"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#012169] transition-colors group"
          >
            <span>Shop now</span>
            <ArrowRight
              weight="bold"
              className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </div>

      {/* Grid of Cards: Image inside bordered card, Text OUTSIDE the card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        {tiles.map((tile) => {
          const isExternal = tile.href.startsWith('http');
          const CardInner = (
            <div className="group flex flex-col focus:outline-hidden">
              {/* CARD CONTAINER: Shows ONLY the image with rounded border. NO text or badges inside */}
              <div className="relative w-full aspect-square bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden p-3 sm:p-5 flex items-center justify-center transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-md">
                <img
                  src={tile.imageUrl}
                  alt={tile.title}
                  className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* TEXT IS OUT OF THE CARD: Clean text directly below the card */}
              <div className="mt-2.5 text-left space-y-0.5">
                <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1 block">
                  {tile.title}
                </span>
                {tile.priceFrom && (
                  <span className="text-xs text-slate-500 block">
                    {tile.priceFrom}
                  </span>
                )}
              </div>
            </div>
          );

          if (isExternal) {
            return (
              <a
                key={tile.title}
                href={tile.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {CardInner}
              </a>
            );
          }

          return (
            <Link key={tile.title} href={tile.href}>
              {CardInner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
