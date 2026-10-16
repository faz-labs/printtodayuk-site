'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lightning,
  Flame,
  MagnifyingGlass,
  Sparkle,
} from '@phosphor-icons/react';
import { CategoryConfig, Product } from '@/lib/types';
import { getLocalCategories } from '@/lib/db';

export interface CatalogEntry {
  name: string;
  href: string;
  letter: string;
  isSameDay?: boolean;
  isPopular?: boolean;
  isProduct?: boolean;
  category?: string;
}

// Master comprehensive print catalog covering letters A to Z
const BASE_PRINT_CATALOG: { name: string; href: string; isSameDay?: boolean; isPopular?: boolean }[] = [
  // A
  { name: 'Acrylic Signs & Plaques', href: '/category/Signage' },
  { name: 'Address & Return Labels', href: '/category/Stickers%20%26%20Labels' },
  { name: 'A-Frame Pavement Signs', href: '/category/Signage', isSameDay: true, isPopular: true },
  { name: 'Apparel & Uniforms', href: '/category/Clothing' },
  { name: 'Appointment Cards', href: '/category/Business%20Cards' },

  // B
  { name: 'Backdrops & Media Walls', href: '/category/PVC%20Banners' },
  { name: 'Banners (PVC & Mesh)', href: '/category/PVC%20Banners', isSameDay: true, isPopular: true },
  { name: 'Beer Mats & Coasters', href: '/category/Printing' },
  { name: 'Booklets (Stapled & Wire-Bound)', href: '/category/Brochures%20%26%20Booklets', isSameDay: true },
  { name: 'Bookmarks', href: '/category/Printing' },
  { name: 'Brochures & Catalogues', href: '/category/Brochures%20%26%20Booklets', isSameDay: true },
  { name: 'Business Cards (Standard 400gsm)', href: '/category/Business%20Cards', isSameDay: true, isPopular: true },
  { name: 'Business Cards (Luxury Spot UV)', href: '/category/Business%20Cards' },
  { name: 'Business Cards (Recycled Eco)', href: '/category/Business%20Cards' },

  // C
  { name: 'Calendars & Wall Planners', href: '/category/Printing' },
  { name: 'Canopies & Pop-Up Gazebos', href: '/category/Canopies%20%26%20Gazebos' },
  { name: 'Canvas Prints & Frames', href: '/category/Printing', isSameDay: true },
  { name: 'Car & Van Magnetics', href: '/category/Signage' },
  { name: 'Certificate Printing', href: '/category/Printing', isSameDay: true },
  { name: 'Compliment Slips', href: '/category/Printing' },
  { name: 'Correx Outdoor Signs', href: '/category/Posters%20%26%20Signs', isSameDay: true },
  { name: 'Custom T-Shirts', href: '/category/T-Shirts', isSameDay: true, isPopular: true },

  // D
  { name: 'Desk Calendars & Blotters', href: '/category/Printing' },
  { name: 'Die-Cut Vinyl Stickers', href: '/category/Stickers%20%26%20Labels', isSameDay: true, isPopular: true },
  { name: 'Digital Menus & Boards', href: '/category/Signage' },
  { name: 'Direct Mail Flyers', href: '/category/Flyers' },
  { name: 'Door Hangers', href: '/category/Printing' },

  // E
  { name: 'Embroidered Polo Shirts', href: '/category/Clothing' },
  { name: 'Envelopes (Custom Printed)', href: '/category/Printing' },
  { name: 'Event Canopies & Tents', href: '/category/Canopies%20%26%20Gazebos' },
  { name: 'Event Tickets & Vouchers', href: '/category/Printing', isSameDay: true },
  { name: 'Exhibition Stands & Pop-Ups', href: '/category/Signage' },

  // F
  { name: 'Feather Flags & Teardrop Flags', href: '/category/Signage' },
  { name: 'Flyers (A5 Standard)', href: '/category/Flyers', isSameDay: true, isPopular: true },
  { name: 'Flyers (A6 Postcard)', href: '/category/Flyers', isSameDay: true },
  { name: 'Flyers (DL Format)', href: '/category/Flyers', isSameDay: true },
  { name: 'Foamex Display Boards', href: '/category/Posters%20%26%20Signs', isSameDay: true },
  { name: 'Folded Leaflets (Bi-Fold & Tri-Fold)', href: '/category/Flyers', isSameDay: true },
  { name: 'Folders & Presentation Packs', href: '/category/Printing' },

  // G
  { name: 'Gazebos (Heavy Duty 3x3m)', href: '/category/Canopies%20%26%20Gazebos' },
  { name: 'Gift Bags (Printed Paper)', href: '/category/Printing' },
  { name: 'Gift Certificates & Vouchers', href: '/category/Printing' },
  { name: 'Greeting Cards & Envelopes', href: '/category/Printing', isSameDay: true },

  // H
  { name: 'Hanging Signs & Ceiling Banners', href: '/category/Signage' },
  { name: 'Hardcover Notebooks', href: '/category/Notebooks%20%26%20Diaries' },
  { name: 'High-Vis Safety Vests', href: '/category/Clothing', isSameDay: true },
  { name: 'Hoodies (Pullover Fleece)', href: '/category/Hoodies%20%26%20Sweatshirts', isSameDay: true, isPopular: true },
  { name: 'Hoodies (Zip-Up Jackets)', href: '/category/Hoodies%20%26%20Sweatshirts' },

  // I
  { name: 'ID Badges & Photo Cards', href: '/category/ID%20Cards%20%26%20Lanyards', isSameDay: true },
  { name: 'Invitations (Wedding & Corporate)', href: '/category/Printing', isSameDay: true },

  // J
  { name: 'Journals & Diaries', href: '/category/Notebooks%20%26%20Diaries' },

  // K
  { name: 'Keyrings & Promotional Gifts', href: '/category/Printing' },
  { name: 'Kraft Eco Business Cards', href: '/category/Business%20Cards' },

  // L
  { name: 'Labels (Waterproof Bottle Labels)', href: '/category/Stickers%20%26%20Labels', isSameDay: true },
  { name: 'Lanyards (Custom Printed Neck)', href: '/category/ID%20Cards%20%26%20Lanyards' },
  { name: 'Leaflets (Folded Marketing)', href: '/category/Flyers', isSameDay: true },
  { name: 'Letterheads (80gsm - 120gsm)', href: '/category/Printing', isSameDay: true },
  { name: 'Lightboxes & Neon Flex Signs', href: '/category/Signage' },
  { name: 'Loyalty Cards & Stamp Cards', href: '/category/Business%20Cards', isSameDay: true },

  // M
  { name: 'Magnetic Van & Car Signs', href: '/category/Signage' },
  { name: 'Menus (Folded Restaurant)', href: '/category/Flyers', isSameDay: true },
  { name: 'Menus (Waterproof & Laminated)', href: '/category/Flyers', isSameDay: true },
  { name: 'Mesh Banners (Windproof)', href: '/category/PVC%20Banners' },
  { name: 'Mugs (11oz Ceramic Photo Mugs)', href: '/category/Personalised%20Mugs', isSameDay: true, isPopular: true },
  { name: 'Mugs (Magic Heat Reveal)', href: '/category/Personalised%20Mugs' },

  // N
  { name: 'NCR Duplicate & Triplicate Pads', href: '/category/Printing', isSameDay: true },
  { name: 'Notebooks (Wire Spiral Bound)', href: '/category/Notebooks%20%26%20Diaries' },
  { name: 'Notepads & Desk Blotters', href: '/category/Printing' },

  // O
  { name: 'Order of Service Booklets', href: '/category/Brochures%20%26%20Booklets', isSameDay: true },
  { name: 'Outdoor Waterproof Posters', href: '/category/Posters%20%26%20Signs', isSameDay: true },

  // P
  { name: 'Package Inserts & Thank You Cards', href: '/category/Printing' },
  { name: 'Pavement Signs & Swing Boards', href: '/category/Signage' },
  { name: 'Personalised Photo Mugs', href: '/category/Personalised%20Mugs', isSameDay: true },
  { name: 'Polo Shirts (Embroidered Pique)', href: '/category/Clothing' },
  { name: 'Pop-Up Exhibition Displays', href: '/category/Signage' },
  { name: 'Postcards (Standard A6)', href: '/category/Flyers', isSameDay: true },
  { name: 'Posters (A0 / A1 / A2 / A3 / A4)', href: '/category/Posters%20%26%20Signs', isSameDay: true, isPopular: true },
  { name: 'Presentation Folders & Wallets', href: '/category/Printing' },
  { name: 'Product Packaging Boxes', href: '/category/Printing' },
  { name: 'Promotional Pens (Laser Engraved)', href: '/category/Promotional%20Pens', isPopular: true },
  { name: 'Promotional Pens (Soft-Touch Ballpoint)', href: '/category/Promotional%20Pens' },
  { name: 'PVC Banners (Eyelets & Hemmed)', href: '/category/PVC%20Banners', isSameDay: true, isPopular: true },

  // R
  { name: 'Receipt & Invoice Pads (NCR)', href: '/category/Printing' },
  { name: 'Recycled Business Cards', href: '/category/Business%20Cards' },
  { name: 'Restaurant Menus & Table Talkers', href: '/category/Flyers', isSameDay: true },
  { name: 'Roller Banners (Standard Pull-Up)', href: '/category/PVC%20Banners', isSameDay: true, isPopular: true },
  { name: 'Roller Banners (Wide / Double-Sided)', href: '/category/PVC%20Banners' },

  // S
  { name: 'Same-Day 24/7 Rush Printing', href: '/category/Flyers?sameDay=true', isSameDay: true, isPopular: true },
  { name: 'Self-Adhesive Vinyl Graphics', href: '/category/Signage', isSameDay: true },
  { name: 'Shop Front Signs & Fascias', href: '/category/Signage' },
  { name: 'Signage & Architectural Displays', href: '/category/Signage' },
  { name: 'Spot UV Luxury Cards', href: '/category/Business%20Cards' },
  { name: 'Stapled Booklets & Catalogues', href: '/category/Brochures%20%26%20Booklets' },
  { name: 'Stickers (Die-Cut Vinyl)', href: '/category/Stickers%20%26%20Labels', isSameDay: true, isPopular: true },
  { name: 'Stickers (Roll & Sheet Labels)', href: '/category/Stickers%20%26%20Labels', isSameDay: true },
  { name: 'Sweatshirts (Crewneck Fleece)', href: '/category/Clothing' },

  // T
  { name: 'Table Talkers (3-Sided Card)', href: '/category/Printing' },
  { name: 'Takeaway Menus (Folded Leaflets)', href: '/category/Flyers', isSameDay: true },
  { name: 'Tickets (Numbered & Perforated)', href: '/category/Printing', isSameDay: true },
  { name: 'Tote Bags (100% Cotton Canvas)', href: '/category/Tote%20Bags', isSameDay: true },
  { name: 'Tri-Fold & Z-Fold Leaflets', href: '/category/Flyers', isSameDay: true },
  { name: 'T-Shirts (Direct-to-Film DTF)', href: '/category/T-Shirts', isSameDay: true, isPopular: true },
  { name: 'T-Shirts (Heavyweight Oversized)', href: '/category/T-Shirts' },

  // V
  { name: 'Vehicle Magnetic Signs', href: '/category/Signage' },
  { name: 'Vinyl Banners (Weatherproof 510gsm)', href: '/category/PVC%20Banners', isSameDay: true },
  { name: 'Vinyl Decals & Lettering', href: '/category/Signage', isSameDay: true },
  { name: 'Vouchers & Gift Cards', href: '/category/Printing' },

  // W
  { name: 'Wall Calendars (A4 / A3)', href: '/category/Printing' },
  { name: 'Water Bottles (Stainless Steel 500ml)', href: '/category/Water%20Bottles' },
  { name: 'Window Decals & One-Way Vision', href: '/category/Signage' },
  { name: 'Window Frosting & Etch Vinyl', href: '/category/Signage' },
  { name: 'Workwear & Site Safety Fleeces', href: '/category/Clothing', isSameDay: true },

  // Y
  { name: 'Yard Signs & Correx Boards', href: '/category/Posters%20%26%20Signs', isSameDay: true },

  // Z
  { name: 'Z-Fold Pocket Leaflets', href: '/category/Flyers', isSameDay: true },
];

export const TOP_BEST_SELLERS = [
  { name: 'Business Cards', href: '/category/Business%20Cards', badge: 'Popular' },
  { name: 'Flyers & Leaflets', href: '/category/Flyers', badge: 'Same Day' },
  { name: 'Roller Banners', href: '/category/PVC%20Banners', badge: 'Top Seller' },
  { name: 'PVC Banners', href: '/category/PVC%20Banners', badge: 'Same Day' },
  { name: 'Posters & Signs', href: '/category/Posters%20%26%20Signs', badge: 'Hot' },
  { name: 'Stickers & Labels', href: '/category/Stickers%20%26%20Labels', badge: 'Fast' },
  { name: 'Custom T-Shirts', href: '/category/T-Shirts', badge: 'Popular' },
  { name: 'Personalised Mugs', href: '/category/Personalised%20Mugs', badge: 'Gift' },
  { name: 'Hoodies & Sweatshirts', href: '/category/Hoodies%20%26%20Sweatshirts', badge: 'Winter' },
  { name: 'Promotional Pens', href: '/category/Promotional%20Pens', badge: 'Bulk' },
];

interface AllProductsMegaMenuProps {
  categories?: CategoryConfig[];
  products?: Product[];
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function AllProductsMegaMenu({
  categories = [],
  products = [],
  onClose,
  onMouseEnter,
  onMouseLeave,
}: AllProductsMegaMenuProps) {
  const [filterQuery, setFilterQuery] = useState('');

  // 1. Merge CMS categories and products with comprehensive catalog
  const allEntries = useMemo<CatalogEntry[]>(() => {
    const map = new Map<string, CatalogEntry>();

    // A. Seed standard catalog items
    for (const item of BASE_PRINT_CATALOG) {
      const letter = item.name.trim().charAt(0).toUpperCase();
      map.set(item.name.toLowerCase().trim(), {
        name: item.name,
        href: item.href,
        letter,
        isSameDay: item.isSameDay,
        isPopular: item.isPopular,
      });
    }

    // B. Merge CMS Categories (override or add)
    let catList = categories && categories.length > 0 ? categories : [];
    if (catList.length === 0 && typeof window !== 'undefined') {
      catList = getLocalCategories();
    }
    for (const cat of catList) {
      if (!cat || !cat.name) continue;
      const key = cat.name.toLowerCase().trim();
      if (key === 'printing' || key === 'clothing') continue;
      const letter = cat.name.trim().charAt(0).toUpperCase();
      map.set(key, {
        name: cat.name,
        href: `/category/${encodeURIComponent(cat.name)}`,
        letter,
        isPopular: Boolean(cat.isBestSeller),
      });
    }

    // C. Merge individual CMS Products
    if (products && products.length > 0) {
      for (const prod of products) {
        if (!prod || !prod.title) continue;
        const key = prod.title.toLowerCase().trim();
        const letter = prod.title.trim().charAt(0).toUpperCase();
        map.set(key, {
          name: prod.title,
          href: `/product/${prod.slug || prod.id}`,
          letter,
          isProduct: true,
          category: prod.category,
          isSameDay: Boolean(prod.isSameDayAvailable),
        });
      }
    }

    // Sort alphabetically by name
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, products]);

  // 2. Filter entries by search query if user types in search box
  const filteredEntries = useMemo(() => {
    if (!filterQuery.trim()) return allEntries;
    const q = filterQuery.toLowerCase().trim();
    return allEntries.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [allEntries, filterQuery]);

  // 3. Group by alphabetical letter
  const letterGroups = useMemo(() => {
    const map = new Map<string, CatalogEntry[]>();
    for (const item of filteredEntries) {
      const l = item.letter;
      if (!map.has(l)) {
        map.set(l, []);
      }
      map.get(l)!.push(item);
    }
    const letters = Array.from(map.keys()).sort();
    return letters.map((letter) => ({
      letter,
      items: map.get(letter)!,
    }));
  }, [filteredEntries]);

  // 4. Distribute into 4 balanced columns for clean mega menu layout
  const columns = useMemo(() => {
    const numCols = 4;
    const cols: typeof letterGroups[] = Array.from({ length: numCols }, () => []);
    letterGroups.forEach((group, idx) => {
      cols[idx % numCols].push(group);
    });
    return cols;
  }, [letterGroups]);

  // 5. Dynamic Best Sellers list (CMS marked items prioritized + standard staples)
  const bestSellersList = useMemo(() => {
    const cmsBests = categories.filter((c) => Boolean(c.isBestSeller));
    if (cmsBests.length > 0) {
      return cmsBests.map((c) => ({
        name: c.name,
        href: `/category/${encodeURIComponent(c.name)}`,
        badge: 'Featured',
      }));
    }
    return TOP_BEST_SELLERS;
  }, [categories]);

  // All available letters for quick jump
  const availableLetters = useMemo(() => {
    return Array.from(new Set(allEntries.map((e) => e.letter))).sort();
  }, [allEntries]);

  const scrollToLetter = (letter: string) => {
    const el = document.getElementById(`letter-group-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-lenis-prevent
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute left-0 right-0 top-full pt-1.5 max-w-7xl mx-auto z-50 pointer-events-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Invisible Hover Safety Bridge: prevents mouseleave when moving from navbar capsule to menu */}
      <div
        className="absolute -top-3 left-0 right-0 h-4 bg-transparent cursor-default pointer-events-auto"
        onMouseEnter={onMouseEnter}
      />

      {/* Floating 3D Rounded Glass Card Container with Smooth Scrolling */}
      <div
        data-lenis-prevent
        className="rounded-3xl bg-white/98 backdrop-blur-3xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(1,33,105,0.22),0_8px_20px_-6px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5 max-h-[75vh] overflow-y-auto overscroll-contain px-5 sm:px-7 py-6 transition-all"
        style={{ scrollbarGutter: 'stable' }}
      >
        {/* Top Header Row: Title, Quick Search Input, & Alphabetical Jump Pills */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#012169] text-white flex items-center justify-center shadow-xs">
              <Sparkle weight="fill" className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#012169] font-sans tracking-tight">
                All Products A to Z
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Browse our complete London same-day & 24/7 print catalog ({allEntries.length} items)
              </p>
            </div>
          </div>

          {/* Quick Filter Search & Letter Jump Bar */}
          <div className="flex items-center gap-3">
            {/* Instant Filter */}
            <div className="relative">
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter A-Z list..."
                className="w-48 sm:w-60 h-8.5 pl-8 pr-3 text-xs rounded-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#012169] focus:outline-hidden focus:ring-1 focus:ring-[#012169]/20 transition-all font-sans text-slate-800 placeholder:text-slate-400"
              />
              <MagnifyingGlass
                weight="bold"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
              />
            </div>

            {/* Quick Letter Navigation Bar */}
            <div className="hidden xl:flex items-center gap-0.5 text-[11px] font-bold text-slate-600 bg-slate-100/80 px-2 py-1 rounded-full border border-slate-200/60">
              {availableLetters.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => scrollToLetter(l)}
                  className="w-5 h-5 rounded-full hover:bg-[#012169] hover:text-white transition-colors cursor-pointer flex items-center justify-center font-mono"
                  title={`Jump to ${l}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mega Menu Body: Left Best Sellers Sidebar + Main 4-Column A-Z Grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* 1. Left Best Sellers Sidebar */}
          <div className="w-full lg:w-56 shrink-0 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 h-fit">
            <div className="px-3 py-2 rounded-xl bg-[#012169] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs mb-3">
              <Flame weight="fill" className="h-4 w-4 text-amber-300" />
              <span>Best Sellers</span>
            </div>

            <div className="space-y-1">
              {bestSellersList.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg font-sans text-[13px] font-medium text-slate-700 hover:text-[#012169] hover:bg-white hover:shadow-xs transition-all group"
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-[11px] text-slate-400 group-hover:text-[#012169] transition-transform group-hover:translate-x-0.5 shrink-0 ml-1">
                    →
                  </span>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5 font-sans">
              <Lightning weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
              <span className="font-semibold text-slate-700">Same-Day London Dispatch</span>
            </div>
          </div>

          {/* 2. Main Alphabetical A-Z Columns */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((colGroups, colIdx) => (
              <div key={colIdx} className="space-y-6">
                {colGroups.map((group) => (
                  <div
                    key={group.letter}
                    id={`letter-group-${group.letter}`}
                    className="space-y-2 scroll-mt-2"
                  >
                    {/* Alphabet letter header (bold blue letter with accent pill) */}
                    <div className="font-sans text-[17px] font-bold text-[#012169] border-b border-slate-200 pb-1 flex items-center gap-2">
                      <span className="font-mono">{group.letter}</span>
                      <div className="h-0.5 w-5 bg-[#012169]/30 rounded-full" />
                      <span className="text-[11px] font-medium text-slate-400 ml-auto font-sans">
                        {group.items.length}
                      </span>
                    </div>

                    {/* Products & Categories under this letter */}
                    <div className="space-y-1 pl-0.5">
                      {group.items.map((item) => (
                        <div key={item.name}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center justify-between font-sans text-[13.5px] font-medium text-slate-800 hover:text-[#012169] group transition-colors py-0.5 hover:translate-x-0.5"
                          >
                            <span className="group-hover:underline truncate">{item.name}</span>
                            <div className="flex items-center gap-1 shrink-0 ml-1.5">
                              {item.isSameDay && (
                                <span className="text-[9px] font-bold text-[#C8102E] bg-red-50 border border-red-200/60 px-1 py-0.2 rounded-sm uppercase tracking-tight">
                                  24h
                                </span>
                              )}
                              {item.isProduct && (
                                <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 px-1 py-0.2 rounded-sm">
                                  Item
                                </span>
                              )}
                              <span className="text-[11px] text-slate-300 group-hover:text-[#012169] transition-transform group-hover:translate-x-0.5">
                                →
                              </span>
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
