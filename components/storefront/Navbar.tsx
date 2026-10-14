'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  TShirt,
  Gift,
  Globe,
  TrendUp,
  MapPin,
  List,
  X,
  Phone,
  ArrowSquareOut,
  Sparkle,
  CaretDown,
  SquaresFour,
  MagnifyingGlass,
  Chats,
  Clock,
  Lightning,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useCallMe } from './CallMeContext';
import { CategoryConfig } from '@/lib/types';
import { getCategories } from '@/lib/db';
import { AllProductsMegaMenu, COLUMNS_DATA } from './AllProductsMegaMenu';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { openCallMe } = useCallMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAtoZOpen, setMobileAtoZOpen] = useState(false);
  const [noticeModal, setNoticeModal] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<'all-products' | 'printing' | 'clothing' | 'gift' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/Printing?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load navbar categories:', err);
      }
    }
    loadCategories();
  }, []);

  const printingCat = categories.find((c) => c.name.toLowerCase() === 'printing');
  const printingSubcategories = printingCat?.subcategories || [
    'Business Cards',
    'Flyers & Leaflets',
    'Posters',
    'PVC Banners',
    'Folded Brochures',
    'Canopies & Gazebos',
    'Stickers & Labels',
    'ID Cards & Badges',
  ];

  const clothingCat = categories.find((c) => c.name.toLowerCase() === 'clothing');
  const clothingSubcategories = clothingCat?.subcategories || [
    'T-Shirts (DTF Print)',
    'Hoodies & Sweatshirts',
    'Corporate Polos',
    'Workwear & High-Vis',
    'Tote Bags & Aprons',
    'Caps & Beanies',
  ];

  const giftCat = categories.find((c) => c.name.toLowerCase() === 'gift items');
  const giftSubcategories = giftCat?.subcategories || [
    'Mugs',
    'Pens',
    'Water Bottles',
    'Notebooks & Diaries',
    'Keyrings & Lanyards',
    'Tote Bags',
  ];

  const handleMouseEnter = (menu: 'all-products' | 'printing' | 'clothing' | 'gift') => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredMenu(menu);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 150);
  };

  const otherServices = [
    {
      name: 'Websites',
      action: () =>
        setNoticeModal(
          'Digital Web Services: High-converting landing pages and e-commerce websites crafted by our London digital studio. Inquire via Call Me for project scopes.'
        ),
      icon: Globe,
    },
    {
      name: 'Digital Marketing',
      action: () =>
        setNoticeModal(
          'Targeted London SEO, Google Ads, and social media campaigns designed to grow local retail, hospitality, and corporate visibility.'
        ),
      icon: TrendUp,
    },
    {
      name: 'Find a Studio',
      action: () =>
        setNoticeModal(
          'London Production Hub: 75 Green St, E7 8JF, London. Walk-ins & same-day collection welcome Mon-Sat 9am - 7pm.'
        ),
      icon: MapPin,
    },
  ];

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full relative bg-white border-b border-slate-200/90 shadow-xs"
        onMouseLeave={handleMouseLeave}
      >
        {/* LINE 1: Top Row (Logo, Solopress Search Bar, Operation Hours, Same-Day Delivery & Live Chat) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 lg:gap-8">
            {/* 1. Logo (Left) */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-hidden shrink-0"
            >
              <div className="relative flex items-center">
                <img
                  src="/images/logo.png"
                  alt="Print Today UK"
                  className="h-10 sm:h-12 w-auto max-w-[200px] object-contain block"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallbackEl = document.getElementById('navbar-text-logo');
                    if (fallbackEl) fallbackEl.style.display = 'flex';
                  }}
                />
                <div id="navbar-text-logo" className="hidden items-center gap-2.5">
                  <div className="h-10 sm:h-11 w-10 sm:w-11 rounded-xl bg-gradient-to-br from-[#012169] to-[#0B2559] flex items-center justify-center text-white shadow-md shadow-[#012169]/20 group-hover:scale-105 transition-transform">
                    <Printer weight="bold" className="h-5 sm:h-6 w-5 sm:w-6 text-red-300" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                      PRINT<span className="text-[#012169]">TODAY</span>
                      <span className="text-[#C8102E] font-extrabold text-xs ml-1 bg-red-50 px-1.5 py-0.5 rounded-sm border border-red-200/60">
                        UK
                      </span>
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-1">
                      Same Day London
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* 2. Solopress Center Search Bar */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-lg lg:max-w-xl items-center"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full h-10.5 pl-4 pr-3 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-r-0 border-slate-300 rounded-l-md text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169] transition-all"
              />
              <button
                type="submit"
                className="h-10.5 px-5 bg-[#012169] hover:bg-[#082b7d] text-white font-bold text-xs uppercase tracking-wider rounded-r-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <span>Search</span>
                <MagnifyingGlass weight="bold" className="h-3.5 w-3.5" />
              </button>
            </form>

            {/* 3. Right: Opening Times, Same Day Delivery & Live Chat */}
            <div className="hidden lg:flex flex-col items-end shrink-0">
              {/* Opening Hours text - matching Solopress top right */}
              <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 leading-snug">
                <Clock weight="fill" className="h-3.5 w-3.5 text-slate-400" />
                <span>Open <strong className="text-slate-900">8:00am to 8:00pm</strong>, Monday to Friday</span>
              </div>

              {/* Second sub-line: Same Day Delivery badge & Live Chat button */}
              <div className="flex items-center gap-3 mt-1">
                <Link
                  href="/category/Printing?sameDay=true"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#012169] bg-blue-50/90 hover:bg-blue-100 border border-blue-200/80 px-2.5 py-0.5 rounded-full transition-colors"
                >
                  <Lightning weight="fill" className="h-3 w-3 text-[#C8102E]" />
                  <span>Same Day Delivery</span>
                </Link>

                <a
                  href="https://wa.me/447969559746"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#012169] hover:text-[#0A358C] hover:underline transition-colors cursor-pointer"
                >
                  <Chats weight="fill" className="h-4 w-4 text-[#012169]" />
                  <span>Live chat</span>
                </a>
              </div>
            </div>

            {/* Mobile actions (Live Chat / Hamburger) */}
            <div className="flex lg:hidden items-center gap-2">
              <a
                href="https://wa.me/447969559746"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#012169] bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200"
              >
                <Chats weight="fill" className="h-4 w-4" />
                <span>Chat</span>
              </a>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X weight="bold" className="h-6 w-6" />
                ) : (
                  <List weight="bold" className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <form
            onSubmit={handleSearch}
            className="flex md:hidden mt-2.5 items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What are you looking for?"
              className="w-full h-9 pl-3.5 pr-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white"
            />
            <button
              type="submit"
              className="h-9 px-3.5 bg-[#012169] text-white font-bold text-xs rounded-r-md flex items-center justify-center shrink-0"
            >
              <MagnifyingGlass weight="bold" className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* LINE 2: Bottom Row (All Products Mega Menu Trigger, Direct Category Links, Instant Quote) */}
        <div className="hidden lg:block border-t border-slate-200/90 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 xl:gap-2 h-11 text-xs xl:text-sm font-semibold">
              {/* Solopress-Style "More Products" / "All Products" Mega Menu Trigger */}
              <div
                className="relative h-full flex items-center"
                onMouseEnter={() => handleMouseEnter('all-products')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  className={cn(
                    'h-full px-3.5 flex items-center gap-1.5 font-bold transition-all border-b-2 cursor-pointer',
                    hoveredMenu === 'all-products'
                      ? 'border-[#012169] text-[#012169] bg-slate-50/80'
                      : 'border-transparent text-slate-800 hover:text-[#012169]'
                  )}
                >
                  <SquaresFour weight="bold" className="h-4 w-4" />
                  <span>More Products</span>
                  <CaretDown
                    weight="bold"
                    className={cn(
                      'h-3 w-3 transition-transform duration-200',
                      hoveredMenu === 'all-products' ? 'rotate-180 text-[#012169]' : 'text-slate-400'
                    )}
                  />
                </button>
              </div>

              {/* Direct Category Links (Solopress exact layout) */}
              <Link
                href="/category/Printing?subcat=Flyers%20%26%20Leaflets"
                className={cn(
                  'h-full px-3 flex items-center transition-colors border-b-2 whitespace-nowrap',
                  pathname.includes('Flyers')
                    ? 'border-[#012169] text-[#012169] font-bold'
                    : 'border-transparent text-slate-700 hover:text-[#012169]'
                )}
              >
                Flyers & Leaflets
              </Link>

              <Link
                href="/category/Printing?subcat=Business%20Cards"
                className={cn(
                  'h-full px-3 flex items-center transition-colors border-b-2 whitespace-nowrap',
                  pathname.includes('Business%20Cards')
                    ? 'border-[#012169] text-[#012169] font-bold'
                    : 'border-transparent text-slate-700 hover:text-[#012169]'
                )}
              >
                Business Cards
              </Link>

              <Link
                href="/category/Printing?subcat=Brochures%20%26%20Booklets"
                className="h-full px-3 flex items-center transition-colors border-b-2 border-transparent text-slate-700 hover:text-[#012169] whitespace-nowrap"
              >
                Brochures & Books
              </Link>

              <Link
                href="/category/Printing?subcat=PVC%20Banners"
                className="h-full px-3 flex items-center transition-colors border-b-2 border-transparent text-slate-700 hover:text-[#012169] whitespace-nowrap"
              >
                Roller Banners
              </Link>

              <Link
                href="/category/Printing?subcat=Posters%20%26%20Signs"
                className="h-full px-3 flex items-center transition-colors border-b-2 border-transparent text-slate-700 hover:text-[#012169] whitespace-nowrap"
              >
                Posters
              </Link>

              <Link
                href="/category/Printing?subcat=Stickers%20%26%20Labels"
                className="h-full px-3 flex items-center transition-colors border-b-2 border-transparent text-slate-700 hover:text-[#012169] whitespace-nowrap"
              >
                Stickers & Packaging
              </Link>

              <Link
                href="/category/Clothing"
                className={cn(
                  'h-full px-3 flex items-center transition-colors border-b-2 whitespace-nowrap',
                  pathname.toLowerCase().includes('clothing')
                    ? 'border-[#012169] text-[#012169] font-bold'
                    : 'border-transparent text-slate-700 hover:text-[#012169]'
                )}
              >
                Clothing & Apparel
              </Link>

              <Link
                href="/category/Gift%20Items"
                className={cn(
                  'h-full px-3 flex items-center transition-colors border-b-2 whitespace-nowrap',
                  pathname.toLowerCase().includes('gift')
                    ? 'border-[#012169] text-[#012169] font-bold'
                    : 'border-transparent text-slate-700 hover:text-[#012169]'
                )}
              >
                Gift Items
              </Link>

              <a
                href="https://signtodayai.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="h-full px-3 flex items-center gap-1 transition-colors border-b-2 border-transparent text-slate-700 hover:text-[#012169] whitespace-nowrap ml-auto"
              >
                <span>Signs & Banners</span>
                <ArrowSquareOut weight="bold" className="h-3 w-3 text-slate-400" />
              </a>

              {/* Instant Quote / Call Me button */}
              <button
                onClick={() => openCallMe()}
                className="ml-2 inline-flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A80C24] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs hover:scale-102 cursor-pointer"
              >
                <Phone weight="fill" className="h-3 w-3" />
                <span>Instant Quote</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Desktop All Products Solopress-Style A-Z Mega Menu */}
        <AnimatePresence>
          {hoveredMenu === 'all-products' && (
            <AllProductsMegaMenu
              onClose={() => setHoveredMenu(null)}
              onMouseEnter={() => handleMouseEnter('all-products')}
              onMouseLeave={handleMouseLeave}
            />
          )}
        </AnimatePresence>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex flex-col space-y-1">
                {/* Solopress-Style Mobile A-Z Directory Toggle */}
                <div className="pb-3 mb-2 border-b border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setMobileAtoZOpen(!mobileAtoZOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold bg-[#012169] text-white shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <SquaresFour weight="bold" className="h-4 w-4 text-white" />
                      <span>Explore All Products (A–Z)</span>
                    </div>
                    <CaretDown
                      weight="bold"
                      className={cn(
                        'h-4 w-4 transition-transform duration-200 text-white/80',
                        mobileAtoZOpen && 'rotate-180 text-white'
                      )}
                    />
                  </button>

                  {mobileAtoZOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3.5 max-h-[60vh] overflow-y-auto"
                    >
                      <div className="text-[11px] font-black uppercase tracking-wider text-[#012169] flex items-center justify-between pb-1 border-b border-slate-200">
                        <span>A–Z Directory</span>
                        <span className="text-[10px] text-slate-500 font-semibold">Alphabetical Index</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {COLUMNS_DATA.flatMap((c) => c.groups).map((group) => (
                          <div key={group.letter} className="space-y-1">
                            <span className="text-xs font-black text-[#012169] block border-b border-slate-200 pb-0.5">
                              {group.letter}
                            </span>
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const linkContent = (
                                  <span className="block text-xs font-semibold text-slate-600 hover:text-[#012169] truncate">
                                    {item.name}
                                  </span>
                                );
                                if (item.isExternal) {
                                  return (
                                    <a
                                      key={item.name}
                                      href={item.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => {
                                        setMobileAtoZOpen(false);
                                        setMobileMenuOpen(false);
                                      }}
                                    >
                                      {linkContent}
                                    </a>
                                  );
                                }
                                return (
                                  <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => {
                                      setMobileAtoZOpen(false);
                                      setMobileMenuOpen(false);
                                    }}
                                  >
                                    {linkContent}
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Printing Catalog
                </div>
                <Link
                  href="/category/Printing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#012169]/10 text-[#012169]"
                >
                  <div className="flex items-center gap-3">
                    <Printer weight="bold" className="h-5 w-5" />
                    <span>All Printing Products</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-slate-700">
                    Popular
                  </span>
                </Link>

                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-3">
                  {printingSubcategories.map((subcat) => (
                    <Link
                      key={subcat}
                      href={`/category/Printing?subcat=${encodeURIComponent(subcat)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#012169]"
                    >
                      {subcat}
                    </Link>
                  ))}
                </div>

                <div className="pt-3 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Clothing Catalog
                </div>
                <Link
                  href="/category/Clothing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#012169]/10 text-[#012169]"
                >
                  <div className="flex items-center gap-3">
                    <TShirt weight="bold" className="h-5 w-5" />
                    <span>All Clothing & Apparel</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-slate-700">
                    Custom
                  </span>
                </Link>

                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-3">
                  {clothingSubcategories.map((subcat) => (
                    <Link
                      key={subcat}
                      href={`/category/Clothing?subcat=${encodeURIComponent(subcat)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#012169]"
                    >
                      {subcat}
                    </Link>
                  ))}
                </div>

                <div className="pt-3 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Gift Items Catalog
                </div>
                <Link
                  href="/category/Gift%20Items"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold bg-[#012169]/10 text-[#012169]"
                >
                  <div className="flex items-center gap-3">
                    <Gift weight="bold" className="h-5 w-5" />
                    <span>All Gift & Promo Items</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-slate-700">
                    Custom
                  </span>
                </Link>

                <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 ml-3">
                  {giftSubcategories.map((subcat) => (
                    <Link
                      key={subcat}
                      href={`/category/Gift%20Items?subcat=${encodeURIComponent(subcat)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-[#012169]"
                    >
                      {subcat}
                    </Link>
                  ))}
                </div>

                <div className="pt-3 pb-1 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Services & External Hubs
                </div>

                {/* Signs & Banners External link */}
                <a
                  href="https://signtodayai.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left"
                >
                  <span>Signs & Banners</span>
                  <ArrowSquareOut weight="bold" className="h-4 w-4 text-slate-400" />
                </a>

                {otherServices.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      link.action();
                    }}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <span>{link.name}</span>
                    <ArrowSquareOut weight="bold" className="h-4 w-4 text-slate-400" />
                  </button>
                ))}

                <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openCallMe();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold py-3 rounded-xl shadow-sm text-sm"
                  >
                    <Phone weight="fill" className="h-4 w-4" />
                    <span>Call Me / Instant Quote</span>
                  </button>
                  <a
                    href="tel:+447969559746"
                    className="flex items-center justify-center gap-2 text-xs font-semibold text-[#012169] py-2"
                  >
                    Direct Dial: +44 7969 559746
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Notice info modal for secondary services */}
      {noticeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100"
          >
            <div className="flex items-center gap-2 text-[#012169] mb-2 font-bold">
              <Sparkle weight="fill" className="h-5 w-5 text-[#C8102E]" />
              <span>Studio Information</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{noticeModal}</p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setNoticeModal(null);
                  openCallMe();
                }}
                className="px-4 py-2 bg-[#012169] text-white text-xs font-bold rounded-xl hover:bg-[#0A358C]"
              >
                Inquire Now
              </button>
              <button
                onClick={() => setNoticeModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
