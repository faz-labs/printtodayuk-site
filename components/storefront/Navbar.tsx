'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Tag,
  Copy,
  Check,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useCallMe } from './CallMeContext';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';
import { CategoryConfig, Product } from '@/lib/types';
import { getCategories, getProducts, getLocalCategories, getLocalProducts } from '@/lib/db';
import { INITIAL_CATEGORIES } from '@/lib/data';
import { AllProductsMegaMenu } from './AllProductsMegaMenu';

interface NavbarProps {
  initialCategories?: CategoryConfig[];
  initialProducts?: Product[];
}

export function Navbar({ initialCategories = [], initialProducts = [] }: NavbarProps = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const { openCallMe } = useCallMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileAtoZOpen, setMobileAtoZOpen] = useState(false);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [noticeModal, setNoticeModal] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryConfig[]>(() => {
    if (initialCategories && initialCategories.length > 0) return initialCategories;
    return typeof window !== 'undefined' ? getLocalCategories() : [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialProducts && initialProducts.length > 0) return initialProducts;
    return typeof window !== 'undefined' ? getLocalProducts() : [];
  });
  const [hoveredMenu, setHoveredMenu] = useState<'all-products' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/Printing?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load navbar data:', err);
      }
    }
    loadData();

    // Cross-tab synchronization
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'print_today_categories') {
        try {
          const updated = JSON.parse(e.newValue || '[]');
          if (Array.isArray(updated)) {
            setCategories(updated);
          }
        } catch {}
      }
    };

    // Same-tab reactive synchronization
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CategoryConfig[]>;
      if (Array.isArray(customEvent.detail)) {
        setCategories(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('print_today_categories_updated', handleLocalUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('print_today_categories_updated', handleLocalUpdate);
    };
  }, []);

  const { lenis } = useSmoothScroll();

  useEffect(() => {
    if (hoveredMenu === 'all-products') {
      lenis?.stop();
    } else {
      lenis?.start();
    }
    return () => {
      lenis?.start();
    };
  }, [hoveredMenu, lenis]);

  const cleanCategories = useMemo(() => {
    return categories.filter(
      (c) => c && c.name && c.name.toLowerCase() !== 'printing' && c.name.toLowerCase() !== 'clothing'
    );
  }, [categories]);

  const handleMouseEnter = (menu: 'all-products') => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredMenu(menu);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 350);
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
        className="sticky top-2 sm:top-3 z-40 w-full px-2.5 sm:px-4 lg:px-6 transition-all duration-300"
        onMouseLeave={handleMouseLeave}
      >
        {/* Soft Multi-Color Aurora Glow Behind Center Nav (Matching User's Reference Screenshot) */}
        <div
          aria-hidden="true"
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-80 sm:w-[580px] h-28 bg-gradient-to-r from-indigo-500/25 via-pink-500/35 to-amber-300/25 blur-3xl rounded-full pointer-events-none opacity-85 transition-opacity"
        />

        {/* 3D FLOATING ROUNDED CAPSULE NAVBAR */}
        <div className="max-w-7xl mx-auto rounded-full bg-gradient-to-b from-white/50 via-white/30 to-white/20 backdrop-blur-2xl sm:backdrop-blur-3xl backdrop-saturate-180 backdrop-brightness-105 border border-white/80 shadow-[0_20px_45px_-12px_rgba(1,33,105,0.18),0_8px_20px_-6px_rgba(0,0,0,0.08),inset_0_1.5px_1px_0_rgba(255,255,255,0.95),inset_0_-1.5px_2px_0_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5 relative z-10 px-4 sm:px-6 lg:px-8 transition-all duration-300">
          <div className="flex items-center justify-between gap-3 lg:gap-6 h-16 sm:h-18 lg:h-19">
            {/* 1. Logo (Left) */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-hidden shrink-0"
            >
              <div className="relative flex items-center">
                <img
                  src="/images/logo.png"
                  alt="Print Today UK"
                  className="h-9 sm:h-11 w-auto max-w-[190px] object-contain block drop-shadow-2xs"
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

            {/* 2. Center: A to Z Products Mega Menu, Signage & Build Website */}
            <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2 h-full flex-1 relative">
              {/* Subtle ambient light center anchor */}
              <div
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-12 bg-gradient-to-r from-violet-400/20 via-fuchsia-400/25 to-yellow-300/20 blur-xl rounded-full pointer-events-none"
              />

              {/* A to Z Products Mega Menu Trigger */}
              <div
                className="relative h-full flex items-center shrink-0 z-10"
                onMouseEnter={() => handleMouseEnter('all-products')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  type="button"
                  onClick={() => setHoveredMenu(hoveredMenu === 'all-products' ? null : 'all-products')}
                  className={cn(
                    'h-10 px-4 rounded-full flex items-center gap-2 font-sans text-[15px] xl:text-[16px] font-semibold transition-all cursor-pointer',
                    hoveredMenu === 'all-products'
                      ? 'bg-white/80 text-[#012169] shadow-xs backdrop-blur-md'
                      : 'text-slate-800 hover:text-[#012169] hover:bg-white/50'
                  )}
                >
                  <SquaresFour weight="bold" className="h-4.5 w-4.5 text-[#012169]" />
                  <span>A to Z Products</span>
                  <CaretDown
                    weight="bold"
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200',
                      hoveredMenu === 'all-products' ? 'rotate-180 text-[#012169]' : 'text-slate-400'
                    )}
                  />
                </button>
              </div>

              {/* Signage - Redirects to signtoday.co.uk */}
              <a
                href="https://signtoday.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 rounded-full flex items-center transition-all font-sans text-[15px] xl:text-[16px] font-semibold text-slate-700 hover:text-[#012169] hover:bg-white/50 whitespace-nowrap z-10"
              >
                <span>Signage</span>
              </a>

              {/* Build Website - Redirects to todayai.co.uk */}
              <a
                href="https://todayai.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 rounded-full flex items-center transition-all font-sans text-[15px] xl:text-[16px] font-semibold text-slate-700 hover:text-[#012169] hover:bg-white/50 whitespace-nowrap z-10"
              >
                <span>Build Website</span>
              </a>
            </nav>

            {/* 3. Right: Expandable Search Bar + Mobile Menu */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              {/* Expandable Search Input (short bar that pops open on hover or focus) */}
              <form
                onSubmit={handleSearch}
                className="relative flex items-center group"
              >
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="w-32 sm:w-44 md:w-56 focus:w-64 sm:focus:w-72 md:focus:w-80 hover:w-48 sm:hover:w-56 md:hover:w-64 h-10 pl-9.5 pr-3.5 bg-white/45 hover:bg-white/70 focus:bg-white/95 border border-white/80 hover:border-slate-200 focus:border-[#012169]/40 rounded-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#012169]/15 transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_6px_rgba(0,0,0,0.03)] backdrop-blur-md"
                  />
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-[#012169] focus:text-[#012169] transition-colors cursor-pointer"
                  >
                    <MagnifyingGlass weight="bold" className="h-4.5 w-4.5" />
                  </button>
                </div>
              </form>

              {/* Mobile Menu Toggle Button */}
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

        {/* Desktop All Products Solopress-Style A-Z Mega Menu */}
        <AnimatePresence>
          {hoveredMenu === 'all-products' && (
            <AllProductsMegaMenu
              categories={cleanCategories}
              products={products}
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
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="lg:hidden mt-2 mx-auto max-w-7xl rounded-3xl border border-white/80 bg-white/85 backdrop-blur-2xl px-5 pt-4 pb-6 shadow-2xl max-h-[82vh] overflow-y-auto"
            >
              <div className="flex flex-col space-y-1">
                {/* Mobile 10% Off Promo Offer */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setPromoModalOpen(true);
                  }}
                  className="w-full mb-2.5 flex items-center justify-between p-3 rounded-xl bg-red-50 hover:bg-red-100/80 border border-red-200/90 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Tag weight="fill" className="h-4 w-4 text-[#C8102E]" />
                    <span className="text-xs font-semibold text-slate-900 font-sans">
                      Get <strong className="text-[#C8102E]">10% off</strong> your next print order
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#C8102E] text-white px-2 py-0.5 rounded shadow-2xs">
                    FIRSTPRINT10
                  </span>
                </button>

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
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {[...categories]
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((cat) => (
                            <Link
                              key={cat.name}
                              href={`/category/${encodeURIComponent(cat.name)}`}
                              onClick={() => {
                                setMobileAtoZOpen(false);
                                setMobileMenuOpen(false);
                              }}
                              className="text-xs font-bold text-[#012169] block py-1 border-b border-slate-200/80 hover:underline truncate"
                            >
                              {cat.name}
                            </Link>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Direct Partner Links in Mobile Drawer */}
                <div className="grid grid-cols-2 gap-2 pb-2 mb-2 border-b border-slate-100">
                  <a
                    href="https://signtoday.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span>Signage</span>
                  </a>
                  <a
                    href="https://todayai.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                  >
                    <span>Build Website</span>
                  </a>
                </div>

                <div className="px-2 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Product Categories (A–Z)
                </div>
                <div className="space-y-1">
                  {[...cleanCategories]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((cat) => (
                      <Link
                        key={cat.name}
                        href={`/category/${encodeURIComponent(cat.name)}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-sans text-[16px] font-medium text-slate-800 hover:text-[#012169] hover:bg-slate-50 transition-colors"
                      >
                        <span>{cat.name}</span>
                        <ArrowSquareOut weight="bold" className="h-4 w-4 text-slate-400" />
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

      {/* 10% Off Promo Offer Modal */}
      <AnimatePresence>
        {promoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center"
            >
              <button
                onClick={() => setPromoModalOpen(false)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X weight="bold" className="h-5 w-5" />
              </button>

              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-[#C8102E]">
                <Tag weight="fill" className="h-7 w-7" />
              </div>

              <span className="text-xs font-bold text-[#C8102E] uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full border border-red-200/60 inline-block mb-2 font-sans">
                Special Introductory Offer
              </span>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight font-sans">
                Get 10% Off Your Next Print Order
              </h3>

              <p className="mt-2 text-sm text-slate-600 leading-relaxed font-sans">
                Quote or apply the promo code below at checkout, in store at 75 Green St, or when placing your order over the phone / live chat.
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">Promo Code</div>
                  <div className="text-xl font-mono font-extrabold text-[#012169]">FIRSTPRINT10</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('FIRSTPRINT10');
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2500);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {copiedCode ? (
                    <>
                      <Check weight="bold" className="h-4 w-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy weight="bold" className="h-4 w-4" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPromoModalOpen(false);
                    router.push('/category/Printing');
                  }}
                  className="w-full py-3 rounded-xl bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold text-sm shadow-md transition-colors cursor-pointer font-sans"
                >
                  Browse Products & Redeem
                </button>
                <a
                  href="https://wa.me/447969559746?text=Hi%2C%20I%20would%20like%20to%20use%20code%20FIRSTPRINT10%20for%2010%25%20off"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200/80 transition-colors flex items-center justify-center gap-1.5 font-sans"
                >
                  <span>Order via WhatsApp Live Chat</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
