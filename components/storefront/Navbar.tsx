'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useCallMe } from './CallMeContext';
import { CategoryConfig } from '@/lib/types';
import { getCategories } from '@/lib/db';

export function Navbar() {
  const pathname = usePathname();
  const { openCallMe } = useCallMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [noticeModal, setNoticeModal] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<'printing' | 'clothing' | 'gift' | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleMouseEnter = (menu: 'printing' | 'clothing' | 'gift') => {
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
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            {/* Logo: Image with automatic graceful fallback */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              <div className="relative flex items-center">
                <img
                  src="/images/logo.png"
                  alt="Print Today UK"
                  className="h-10 sm:h-12 w-auto max-w-[200px] object-contain block"
                  onError={(e) => {
                    // If image is not placed yet, gracefully show stylized typography logo
                    e.currentTarget.style.display = 'none';
                    const fallbackEl = document.getElementById('navbar-text-logo');
                    if (fallbackEl) fallbackEl.style.display = 'flex';
                  }}
                />
                <div id="navbar-text-logo" className="hidden items-center gap-2.5">
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#012169] to-[#0B2559] flex items-center justify-center text-white shadow-md shadow-[#012169]/20 group-hover:scale-105 transition-transform">
                    <Printer weight="bold" className="h-6 w-6 text-red-300" />
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

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {/* Printing Nav with Hover Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('printing')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/category/Printing"
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5',
                    pathname.toLowerCase().includes('printing')
                      ? 'text-[#012169] bg-[#012169]/10 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                  )}
                >
                  <Printer
                    weight="bold"
                    className={cn(
                      'h-4 w-4',
                      pathname.toLowerCase().includes('printing') ? 'text-[#012169]' : 'text-slate-500'
                    )}
                  />
                  <span>Printing</span>
                  <CaretDown
                    weight="bold"
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 text-slate-400',
                      hoveredMenu === 'printing' && 'rotate-180 text-[#012169]'
                    )}
                  />
                </Link>

                {/* Printing Hover Dropdown */}
                <AnimatePresence>
                  {hoveredMenu === 'printing' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl p-3 shadow-2xl border border-slate-200/90 z-50"
                    >
                      <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                        <span>Printing Categories</span>
                        <span className="text-[10px] text-[#C8102E] font-bold">⚡ Same Day</span>
                      </div>
                      <div className="space-y-0.5 max-h-72 overflow-y-auto">
                        {printingSubcategories.map((subcat) => (
                          <Link
                            key={subcat}
                            href={`/category/Printing?subcat=${encodeURIComponent(subcat)}`}
                            onClick={() => setHoveredMenu(null)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#012169] hover:bg-[#012169]/5 transition-colors group"
                          >
                            <span className="truncate">{subcat}</span>
                            <span className="text-slate-300 group-hover:text-[#012169] group-hover:translate-x-0.5 transition-all text-xs">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <Link
                          href="/category/Printing"
                          onClick={() => setHoveredMenu(null)}
                          className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-[#012169] hover:underline"
                        >
                          <span>View All Printing</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Clothing Nav with Hover Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('clothing')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/category/Clothing"
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5',
                    pathname.toLowerCase().includes('clothing')
                      ? 'text-[#012169] bg-[#012169]/10 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                  )}
                >
                  <TShirt
                    weight="bold"
                    className={cn(
                      'h-4 w-4',
                      pathname.toLowerCase().includes('clothing') ? 'text-[#012169]' : 'text-slate-500'
                    )}
                  />
                  <span>Clothing</span>
                  <CaretDown
                    weight="bold"
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 text-slate-400',
                      hoveredMenu === 'clothing' && 'rotate-180 text-[#012169]'
                    )}
                  />
                </Link>

                {/* Clothing Hover Dropdown */}
                <AnimatePresence>
                  {hoveredMenu === 'clothing' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl p-3 shadow-2xl border border-slate-200/90 z-50"
                    >
                      <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                        <span>Clothing Categories</span>
                        <span className="text-[10px] text-[#C8102E] font-bold">⚡ Custom Apparel</span>
                      </div>
                      <div className="space-y-0.5 max-h-72 overflow-y-auto">
                        {clothingSubcategories.map((subcat) => (
                          <Link
                            key={subcat}
                            href={`/category/Clothing?subcat=${encodeURIComponent(subcat)}`}
                            onClick={() => setHoveredMenu(null)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#012169] hover:bg-[#012169]/5 transition-colors group"
                          >
                            <span className="truncate">{subcat}</span>
                            <span className="text-slate-300 group-hover:text-[#012169] group-hover:translate-x-0.5 transition-all text-xs">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <Link
                          href="/category/Clothing"
                          onClick={() => setHoveredMenu(null)}
                          className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-[#012169] hover:underline"
                        >
                          <span>View All Clothing</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Gift Items Nav with Hover Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('gift')}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/category/Gift%20Items"
                  className={cn(
                    'relative px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5',
                    pathname.toLowerCase().includes('gift')
                      ? 'text-[#012169] bg-[#012169]/10 shadow-xs'
                      : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                  )}
                >
                  <Gift
                    weight="bold"
                    className={cn(
                      'h-4 w-4',
                      pathname.toLowerCase().includes('gift') ? 'text-[#012169]' : 'text-slate-500'
                    )}
                  />
                  <span>Gift Items</span>
                  <CaretDown
                    weight="bold"
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200 text-slate-400',
                      hoveredMenu === 'gift' && 'rotate-180 text-[#012169]'
                    )}
                  />
                </Link>

                {/* Gift Items Hover Dropdown */}
                <AnimatePresence>
                  {hoveredMenu === 'gift' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-1.5 w-72 bg-white rounded-2xl p-3 shadow-2xl border border-slate-200/90 z-50"
                    >
                      <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1.5 flex items-center justify-between">
                        <span>Gift Items Categories</span>
                        <span className="text-[10px] text-[#C8102E] font-bold">⚡ Custom Merch</span>
                      </div>
                      <div className="space-y-0.5 max-h-72 overflow-y-auto">
                        {giftSubcategories.map((subcat) => (
                          <Link
                            key={subcat}
                            href={`/category/Gift%20Items?subcat=${encodeURIComponent(subcat)}`}
                            onClick={() => setHoveredMenu(null)}
                            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#012169] hover:bg-[#012169]/5 transition-colors group"
                          >
                            <span className="truncate">{subcat}</span>
                            <span className="text-slate-300 group-hover:text-[#012169] group-hover:translate-x-0.5 transition-all text-xs">
                              →
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-100">
                        <Link
                          href="/category/Gift%20Items"
                          onClick={() => setHoveredMenu(null)}
                          className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-[#012169] hover:underline"
                        >
                          <span>View All Gift Items</span>
                          <span>→</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-5 w-px bg-slate-200 mx-2" />

              {/* Signs & Banners - External Direct Link */}
              <a
                href="https://signtodayai.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#012169] hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1"
              >
                <span>Signs & Banners</span>
                <ArrowSquareOut weight="bold" className="h-3 w-3 text-slate-400" />
              </a>

              {/* Other Secondary Service Links */}
              {otherServices.map((link) => (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#012169] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Header Right Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openCallMe()}
                className="hidden sm:inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#A80C24] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-[#C8102E]/20 hover:scale-102 cursor-pointer"
              >
                <Phone weight="fill" className="h-3.5 w-3.5 text-white" />
                <span>Instant Quote</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
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
        </div>

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
