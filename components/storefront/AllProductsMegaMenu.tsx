'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lightning,
  Flame,
  ArrowSquareOut,
  Sparkle,
} from '@phosphor-icons/react';

interface MegaMenuItem {
  name: string;
  href: string;
  isExternal?: boolean;
  isNew?: boolean;
}

interface LetterGroup {
  letter: string;
  items: MegaMenuItem[];
}

interface MegaMenuColumn {
  groups: LetterGroup[];
}

export const BEST_SELLERS: MegaMenuItem[] = [
  { name: 'Flyers & Leaflets', href: '/category/Printing?subcat=Flyers%20%26%20Leaflets' },
  { name: 'Business Cards', href: '/category/Printing?subcat=Business%20Cards' },
  { name: 'Personalised Mugs', href: '/category/Gift%20Items?subcat=Mugs' },
  { name: 'Custom T-Shirts', href: '/category/Clothing?subcat=T-Shirts' },
  { name: 'Hoodies & Sweatshirts', href: '/category/Clothing?subcat=Hoodies%20%26%20Sweatshirts' },
  { name: 'PVC Banners', href: '/category/Printing?subcat=PVC%20Banners' },
  { name: 'Posters & Signs', href: '/category/Printing?subcat=Posters%20%26%20Signs' },
  { name: 'Stickers & Labels', href: '/category/Printing?subcat=Stickers%20%26%20Labels' },
  { name: 'Promotional Pens', href: '/category/Gift%20Items?subcat=Pens' },
  { name: 'Same-Day London Print', href: '/category/Printing?sameDay=true' },
  { name: 'Eco-Friendly Recycled', href: '/category/Printing', isNew: true },
];

export const COLUMNS_DATA: MegaMenuColumn[] = [
  // Column 1: A, B
  {
    groups: [
      {
        letter: 'A',
        items: [
          { name: 'A-Boards & Pavement Signs', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Advertising Signs', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Aluminium Signs', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Appointment Cards', href: '/category/Printing?subcat=Business%20Cards' },
          { name: 'Aprons & Uniforms', href: '/category/Clothing?subcat=Workwear%20%26%20High-Vis' },
        ],
      },
      {
        letter: 'B',
        items: [
          { name: 'Badges & Lanyards', href: '/category/Printing?subcat=ID%20Cards%20%26%20Lanyards' },
          { name: 'Bags (Cotton Tote)', href: '/category/Gift%20Items?subcat=Tote%20Bags' },
          { name: 'Ball Point Pens', href: '/category/Gift%20Items?subcat=Pens' },
          { name: 'Banners (Outdoor PVC)', href: '/category/Printing?subcat=PVC%20Banners' },
          { name: 'Brochures & Booklets', href: '/category/Printing?subcat=Brochures%20%26%20Booklets' },
          { name: 'Business Cards', href: '/category/Printing?subcat=Business%20Cards' },
          { name: 'Business Stationery', href: '/category/Printing?subcat=Business%20Cards' },
        ],
      },
    ],
  },

  // Column 2: C, D, E
  {
    groups: [
      {
        letter: 'C',
        items: [
          { name: 'Cafe Barriers', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Calendars & Diaries', href: '/category/Gift%20Items?subcat=Notebooks%20%26%20Diaries' },
          { name: 'Canvas Prints', href: '/category/Printing?subcat=Posters%20%26%20Signs' },
          { name: 'Caps & Headwear', href: '/category/Clothing?subcat=Caps%20%26%20Headwear' },
          { name: 'Car Decals & Vinyl', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Ceramic Mugs', href: '/category/Gift%20Items?subcat=Mugs' },
          { name: 'Christmas Printing', href: '/category/Printing' },
          { name: 'Clothing & Apparel', href: '/category/Clothing' },
          { name: 'Compliment Slips', href: '/category/Printing?subcat=Business%20Cards' },
          { name: 'Correx Signs (Fluted)', href: 'https://signtodayai.co.uk', isExternal: true },
        ],
      },
      {
        letter: 'D',
        items: [
          { name: 'Deck Chairs & Seating', href: '/category/Printing?subcat=Canopies%20%26%20Gazebos' },
          { name: 'Diaries & Notebooks', href: '/category/Gift%20Items?subcat=Notebooks%20%26%20Diaries' },
          { name: 'Display Boards (Foamex)', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'DTF Printed T-Shirts', href: '/category/Clothing?subcat=T-Shirts' },
        ],
      },
      {
        letter: 'E',
        items: [
          { name: 'Eco-Friendly Kraft Print', href: '/category/Printing', isNew: true },
          { name: 'Exhibition Displays', href: '/category/Printing?subcat=PVC%20Banners' },
          { name: 'Express Same-Day Printing', href: '/category/Printing?sameDay=true' },
        ],
      },
    ],
  },

  // Column 3: F, G, H, I
  {
    groups: [
      {
        letter: 'F',
        items: [
          { name: 'Fabric Displays', href: '/category/Printing?subcat=Canopies%20%26%20Gazebos' },
          { name: 'Flags & Teardrops', href: '/category/Printing?subcat=Canopies%20%26%20Gazebos' },
          { name: 'Floor Stickers (Slip-rated)', href: '/category/Printing?subcat=Stickers%20%26%20Labels' },
          { name: 'Flyers & Leaflets', href: '/category/Printing?subcat=Flyers%20%26%20Leaflets' },
          { name: 'Foamex Rigid Signs', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Foil Blocked Cards', href: '/category/Printing?subcat=Business%20Cards' },
          { name: 'Folded Leaflets & Menus', href: '/category/Printing?subcat=Flyers%20%26%20Leaflets' },
          { name: 'Folders (Presentation)', href: '/category/Printing?subcat=Brochures%20%26%20Booklets' },
        ],
      },
      {
        letter: 'G',
        items: [
          { name: 'Gazebos & Canopies', href: '/category/Printing?subcat=Canopies%20%26%20Gazebos' },
          { name: 'Gift Items & Merch', href: '/category/Gift%20Items' },
          { name: 'Gift Vouchers', href: '/category/Printing?subcat=Flyers%20%26%20Leaflets' },
          { name: 'Greeting Cards', href: '/category/Printing?subcat=Business%20Cards' },
        ],
      },
      {
        letter: 'H',
        items: [
          { name: 'Hi-Vis Safety Vests', href: '/category/Clothing?subcat=Workwear%20%26%20High-Vis' },
          { name: 'Hoodies & Sweatshirts', href: '/category/Clothing?subcat=Hoodies%20%26%20Sweatshirts' },
          { name: 'Hospitality Menus', href: '/category/Printing?subcat=Flyers%20%26%20Leaflets' },
        ],
      },
      {
        letter: 'I',
        items: [
          { name: 'ID Cards & Lanyards', href: '/category/Printing?subcat=ID%20Cards%20%26%20Lanyards' },
          { name: 'Insulated Bottles', href: '/category/Gift%20Items?subcat=Water%20Bottles' },
        ],
      },
    ],
  },

  // Column 4: M, N, O, P
  {
    groups: [
      {
        letter: 'M',
        items: [
          { name: 'Magic Colour Reveal Mugs', href: '/category/Gift%20Items?subcat=Mugs' },
          { name: 'Magnetic Vehicle Signs', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Menus & Table Talkers', href: '/category/Printing?subcat=Flyers%20%26%20Leaflets' },
          { name: 'Metal Engraved Pens', href: '/category/Gift%20Items?subcat=Pens' },
          { name: 'Mugs & Drinkware', href: '/category/Gift%20Items?subcat=Mugs' },
        ],
      },
      {
        letter: 'N',
        items: [
          { name: 'NCR Duplicate Pads', href: '/category/Printing?subcat=Brochures%20%26%20Booklets' },
          { name: 'Notebooks & Hardbacks', href: '/category/Gift%20Items?subcat=Notebooks%20%26%20Diaries' },
          { name: 'Notepads (Desk Pads)', href: '/category/Gift%20Items?subcat=Notebooks%20%26%20Diaries' },
        ],
      },
      {
        letter: 'O',
        items: [
          { name: 'Order of Service Booklets', href: '/category/Printing?subcat=Brochures%20%26%20Booklets' },
          { name: 'Outdoor Mesh Banners', href: '/category/Printing?subcat=PVC%20Banners' },
        ],
      },
      {
        letter: 'P',
        items: [
          { name: 'Packaging & Product Boxes', href: '/category/Printing?subcat=Stickers%20%26%20Labels' },
          { name: 'Paper Bags & Totes', href: '/category/Gift%20Items?subcat=Tote%20Bags' },
          { name: 'Pens (Executive Metal)', href: '/category/Gift%20Items?subcat=Pens' },
          { name: 'Polo Shirts (Embroidered)', href: '/category/Clothing?subcat=Polo%20Shirts' },
          { name: 'Posters (Satin / Gloss)', href: '/category/Printing?subcat=Posters%20%26%20Signs' },
          { name: 'PVC Outdoor Banners', href: '/category/Printing?subcat=PVC%20Banners' },
        ],
      },
    ],
  },

  // Column 5: S, T, W
  {
    groups: [
      {
        letter: 'S',
        items: [
          { name: 'Safety Signs & Site Boards', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Same-Day London Dispatch', href: '/category/Printing?sameDay=true' },
          { name: 'Selfie Frames & Boards', href: '/category/Printing?subcat=Posters%20%26%20Signs' },
          { name: 'Signage & Shop Fronts', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Stickers & Labels', href: '/category/Printing?subcat=Stickers%20%26%20Labels' },
          { name: 'Stylus Pens', href: '/category/Gift%20Items?subcat=Pens' },
          { name: 'Sweatshirts & Jumpers', href: '/category/Clothing?subcat=Hoodies%20%26%20Sweatshirts' },
        ],
      },
      {
        letter: 'T',
        items: [
          { name: 'T-Shirts (DTF Full Colour)', href: '/category/Clothing?subcat=T-Shirts' },
          { name: 'Table Talkers (Tent Cards)', href: '/category/Printing?subcat=Flyers%20%26%20Leaflets' },
          { name: 'Tablecloths (Fitted / Loose)', href: '/category/Printing?subcat=Canopies%20%26%20Gazebos' },
          { name: 'Tickets & Event Wristbands', href: '/category/Printing?subcat=Flyers%20%26%20Leaflets' },
          { name: 'Tote Bags (Canvas & Cotton)', href: '/category/Gift%20Items?subcat=Tote%20Bags' },
        ],
      },
      {
        letter: 'W',
        items: [
          { name: 'Water Bottles (Insulated)', href: '/category/Gift%20Items?subcat=Water%20Bottles' },
          { name: 'Window Graphics & Frosted', href: 'https://signtodayai.co.uk', isExternal: true },
          { name: 'Workwear & High-Vis', href: '/category/Clothing?subcat=Workwear%20%26%20High-Vis' },
        ],
      },
    ],
  },
];

interface AllProductsMegaMenuProps {
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function AllProductsMegaMenu({
  onClose,
  onMouseEnter,
  onMouseLeave,
}: AllProductsMegaMenuProps) {
  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.995 }}
      transition={{ duration: 0.16, ease: 'easeOut' }}
      className="absolute left-0 right-0 top-full w-full bg-white border-b-2 border-[#012169] shadow-2xl z-50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="flex gap-8">
          {/* 1. Left Best Sellers Sidebar */}
          <div className="w-56 shrink-0 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
            {/* Header pill like Solopress */}
            <div className="px-3.5 py-2.5 rounded-xl bg-[#012169] text-white text-xs font-black uppercase tracking-wider flex items-center justify-between shadow-xs mb-3">
              <div className="flex items-center gap-1.5">
                <Flame weight="fill" className="h-4 w-4 text-amber-300" />
                <span>Best Sellers</span>
              </div>
              <span className="text-[10px] text-red-200">Top 10</span>
            </div>

            <div className="space-y-1">
              {BEST_SELLERS.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-[#012169] hover:bg-white hover:shadow-xs transition-all group"
                >
                  <span className="truncate">{item.name}</span>
                  {item.isNew ? (
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 rounded-sm border border-emerald-200">
                      NEW
                    </span>
                  ) : (
                    <span className="text-slate-300 group-hover:text-[#012169] group-hover:translate-x-0.5 transition-all text-xs">
                      →
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {/* Quick emergency same-day callout */}
            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Lightning weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
              <span className="font-bold text-slate-700">Same-Day London Dispatch</span>
            </div>
          </div>

          {/* 2. Main Alphabetical A-Z Columns */}
          <div className="flex-1 grid grid-cols-5 gap-6">
            {COLUMNS_DATA.map((col, colIdx) => (
              <div key={colIdx} className="space-y-5">
                {col.groups.map((group) => (
                  <div key={group.letter} className="space-y-1">
                    {/* Alphabet letter header (Solopress style: bold blue letter) */}
                    <div className="text-xs font-black text-[#012169] border-b border-slate-100 pb-0.5 mb-1.5 flex items-center gap-1">
                      <span>{group.letter}</span>
                      <div className="h-0.5 w-4 bg-[#012169]/30 rounded-full" />
                    </div>

                    {/* Links under letter */}
                    <div className="space-y-0.5">
                      {group.items.map((item) => {
                        const content = (
                          <div className="flex items-center justify-between text-xs text-slate-600 hover:text-[#012169] hover:underline transition-colors py-0.5 leading-snug group cursor-pointer">
                            <span className="truncate">{item.name}</span>
                            {item.isNew && (
                              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1 rounded-xs border border-emerald-200 ml-1">
                                NEW
                              </span>
                            )}
                            {item.isExternal && (
                              <ArrowSquareOut className="h-2.5 w-2.5 text-slate-400 group-hover:text-[#012169] shrink-0 ml-1" />
                            )}
                          </div>
                        );

                        if (item.isExternal) {
                          return (
                            <a
                              key={item.name}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={onClose}
                            >
                              {content}
                            </a>
                          );
                        }

                        return (
                          <Link key={item.name} href={item.href} onClick={onClose}>
                            {content}
                          </Link>
                        );
                      })}
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
