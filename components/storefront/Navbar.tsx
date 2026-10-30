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
  ArrowRight,
  UserCircle,
  ShoppingBag,
  Bell,
} from '@phosphor-icons/react';
import { cn, formatCurrency } from '@/lib/utils';
import { useCallMe } from './CallMeContext';
import { useSmoothScroll } from '@/components/providers/SmoothScrollProvider';
import { CategoryConfig, Product } from '@/lib/types';
import { getCategories, getProducts, getLocalCategories, getLocalProducts } from '@/lib/db';
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
    return [];
  });
  const [products, setProducts] = useState<Product[]>(() => {
    if (initialProducts && initialProducts.length > 0) return initialProducts;
    return [];
  });

  const [hoveredMenu, setHoveredMenu] = useState<'all-products' | null>(null);
  const [isMenuPinned, setIsMenuPinned] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  const whatsNewRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  // Live universal product search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter((p) => {
        if (!p) return false;
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        return titleMatch || catMatch || descMatch;
      })
      .slice(0, 6);
  }, [products, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchFocused(false);
      router.push(`/all-products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Close search dropdown and What's New dropdown on click outside or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (whatsNewRef.current && !whatsNewRef.current.contains(e.target as Node)) {
        setWhatsNewOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setWhatsNewOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

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

  // Close pinned menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setHoveredMenu(null);
        setIsMenuPinned(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
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

  // Max 8 categories for Row 2 category bar
  const displayCategories = useMemo(() => {
    return cleanCategories.slice(0, 8);
  }, [cleanCategories]);

  const handleMouseEnter = (menu: 'all-products') => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredMenu(menu);
  };

  const handleMouseLeave = () => {
    if (isMenuPinned) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 450);
  };

  const toggleMenu = () => {
    if (hoveredMenu === 'all-products') {
      setHoveredMenu(null);
      setIsMenuPinned(false);
    } else {
      setHoveredMenu('all-products');
      setIsMenuPinned(true);
    }
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
          'London Production Hub: 75 Green St, E7 8JF, London. Walk-ins & same-day collection welcome Mon-Fri 7am - 8pm, Sat 10am - 6pm, Sun 10am - 4pm.'
        ),
      icon: MapPin,
    },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-40 w-full bg-white border-b border-slate-200/90 shadow-xs transition-all relative font-sans"
        onMouseLeave={handleMouseLeave}
      >
        {/* ROW 1: Logo (Left) + Search Box (Center) + Actions (Right) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 lg:gap-6 h-16 sm:h-20">
            {/* 1. Logo (Left) with YOUR LOCAL DIGITAL PRINTER subtitle */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-hidden shrink-0"
            >
              <div className="relative flex items-center">
                <img
                  src="/images/logo.png?v=2"
                  srcSet="/images/logo.png?v=2 1x, /images/logo@2x.png?v=2 2x"
                  alt="Print Today UK"
                  width={190}
                  height={48}
                  className="h-9 sm:h-10.5 w-auto max-w-[170px] sm:max-w-[185px] object-contain block transition-transform group-hover:scale-[1.02]"
                  style={{ imageRendering: '-webkit-optimize-contrast' }}
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
                      Your Local Digital Printer
                    </span>
                  </div>
                </div>
              </div>
            </Link>

            {/* 2. Center: Search Box with Search Icon inside border */}
            <div ref={searchContainerRef} className="hidden sm:flex flex-1 max-w-xl mx-2 md:mx-6 relative">
              <form onSubmit={handleSearch} className="w-full relative flex items-center">
                <div className="relative w-full flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (!searchFocused) setSearchFocused(true);
                    }}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search..."
                    className="w-full h-10 sm:h-11 pl-4 pr-11 rounded-xl bg-slate-100 hover:bg-slate-150 focus:bg-white border border-slate-200/90 focus:border-[#012169] text-xs sm:text-sm text-slate-800 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-[#012169]/15 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                  />
                  {/* Search Icon inside the border */}
                  <button
                    type="submit"
                    aria-label="Search"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#012169] transition-colors cursor-pointer"
                  >
                    <MagnifyingGlass weight="bold" className="h-5 w-5" />
                  </button>

                  {/* Clear button if typed */}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
                      aria-label="Clear search"
                    >
                      <X weight="bold" className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </form>

              {/* Universal Search Results Dropdown */}
              <AnimatePresence>
                {searchFocused && searchQuery.trim().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 text-left font-sans"
                  >
                    {/* Header */}
                    <div className="px-3.5 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                        Products ({searchResults.length})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Press Enter to view all
                      </span>
                    </div>

                    {/* Results List */}
                    <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100 p-1.5">
                      {searchResults.length > 0 ? (
                        searchResults.map((prod) => (
                          <Link
                            key={prod.id || prod.slug}
                            href={`/product/${prod.slug || prod.id}`}
                            onClick={() => {
                              setSearchFocused(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 group transition-colors"
                          >
                            <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 flex items-center justify-center">
                              {prod.imageUrl ? (
                                <img
                                  src={prod.imageUrl}
                                  alt={prod.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              ) : (
                                <SquaresFour className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#012169] transition-colors truncate">
                                {prod.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                  {prod.category}
                                </span>
                                {prod.isSameDayAvailable && (
                                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                                    <Lightning weight="fill" className="h-3 w-3" />
                                    Same Day
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs sm:text-sm font-black text-[#012169]">
                                {formatCurrency(prod.discountedPrice || prod.price)}
                              </span>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="py-8 px-4 text-center">
                          <MagnifyingGlass weight="duotone" className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-700">
                            No products found for &ldquo;{searchQuery}&rdquo;
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Try searching for business cards, flyers, banners, or hoodies
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer: View all in catalogue */}
                    <Link
                      href={`/all-products?q=${encodeURIComponent(searchQuery.trim())}`}
                      onClick={() => {
                        setSearchFocused(false);
                      }}
                      className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 hover:bg-blue-50/80 text-[#012169] text-xs font-bold border-t border-slate-100 transition-colors"
                    >
                      <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                      <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Right: What's New? + Sign In + Basket (0) */}
            <div className="flex items-center gap-4 sm:gap-6 shrink-0">
              {/* What's New? Dropdown (Signage & Build Website) */}
              <div
                className="relative hidden md:block"
                ref={whatsNewRef}
                onMouseEnter={() => setWhatsNewOpen(true)}
                onMouseLeave={() => setWhatsNewOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setWhatsNewOpen(!whatsNewOpen)}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#012169] transition-colors cursor-pointer py-2"
                >
                  <Bell weight="bold" className="h-4 w-4 text-[#012169]" />
                  <span>What&apos;s New?</span>
                  <CaretDown
                    weight="bold"
                    className={cn(
                      'h-3 w-3 text-slate-400 transition-transform duration-200',
                      whatsNewOpen ? 'rotate-180 text-[#012169]' : ''
                    )}
                  />
                </button>

                <AnimatePresence>
                  {whatsNewOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-50 overflow-hidden font-sans"
                    >
                      <a
                        href="https://signtoday.co.uk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-[#012169] transition-colors text-xs sm:text-sm font-bold group"
                      >
                        <span>Signage</span>
                        <ArrowSquareOut weight="bold" className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#012169]" />
                      </a>
                      <a
                        href="https://todayai.co.uk"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 text-slate-700 hover:text-[#012169] transition-colors text-xs sm:text-sm font-bold group border-t border-slate-100"
                      >
                        <span>Build Website</span>
                        <ArrowSquareOut weight="bold" className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#012169]" />
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sign In (Hardcoded for now per user instruction) */}
              <button
                type="button"
                onClick={() => setNoticeModal('Sign In & Customer Portal will be available soon with our order management system rollout.')}
                className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#012169] transition-colors cursor-pointer"
              >
                <UserCircle weight="bold" className="h-5 w-5 text-slate-700" />
                <span>Sign In</span>
              </button>

              {/* Basket (0) (Hardcoded for now per user instruction) */}
              <button
                type="button"
                onClick={() => setNoticeModal('Online Shopping Basket & Checkout will be active soon! To place an order now, call 0330 010 3521 or WhatsApp us.')}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-800 hover:text-[#012169] transition-colors cursor-pointer"
              >
                <ShoppingBag weight="bold" className="h-5 w-5 text-slate-700" />
                <span>Basket (0)</span>
              </button>

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

          {/* Mobile Search Input in Row 1 on smaller screens */}
          <div className="sm:hidden pb-3">
            <form onSubmit={handleSearch} className="w-full relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169]"
              />
              <button
                type="submit"
                aria-label="Search"
                className="absolute right-3 text-slate-400 hover:text-[#012169]"
              >
                <MagnifyingGlass weight="bold" className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* ROW 2: More Products + Up to 8 CMS Categories (Centered per request) */}
        <div className="w-full bg-white border-t border-slate-100 shadow-xs relative z-20 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4 xl:gap-7 h-11 overflow-x-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* More Products Button (triggers AllProductsMegaMenu) */}
            <div
              className="relative h-full flex items-center shrink-0"
              onMouseEnter={() => handleMouseEnter('all-products')}
            >
              <button
                type="button"
                id="navbar-atoz-trigger"
                onClick={toggleMenu}
                onMouseEnter={() => handleMouseEnter('all-products')}
                className={cn(
                  'flex items-center gap-1.5 font-sans text-[14px] xl:text-[15px] font-bold transition-all cursor-pointer whitespace-nowrap',
                  hoveredMenu === 'all-products'
                    ? 'text-[#012169]'
                    : 'text-slate-900 hover:text-[#012169]'
                )}
              >
                <span>More Products</span>
                <CaretDown
                  weight="bold"
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    hoveredMenu === 'all-products' ? 'rotate-180 text-[#012169]' : 'text-slate-400'
                  )}
                />
              </button>
            </div>

            {/* Separator */}
            <div className="h-3.5 w-px bg-slate-200 shrink-0" />

            {/* Up to 8 CMS Categories Centered */}
            <div className="flex items-center justify-center gap-6 xl:gap-8 shrink-0">
              {displayCategories.map((cat) => (
                <Link
                  key={cat.id || cat.name}
                  href={`/category/${encodeURIComponent(cat.name)}`}
                  className="text-[14px] xl:text-[15px] font-medium text-slate-700 hover:text-[#012169] transition-colors whitespace-nowrap shrink-0"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop All Products Solopress-Style A-Z Mega Menu */}
        <AnimatePresence>
          {hoveredMenu === 'all-products' && (
            <AllProductsMegaMenu
              categories={categories}
              products={products}
              onClose={() => {
                setHoveredMenu(null);
                setIsMenuPinned(false);
              }}
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
              className="lg:hidden border-t border-slate-200/50 bg-white px-5 pt-4 pb-6 shadow-xl max-h-[82vh] overflow-y-auto"
            >
              <div className="flex flex-col space-y-1">
                {/* Mobile Promo Offer */}
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

                {/* Mobile More Products (A-Z Directory) Toggle */}
                <div className="pb-3 mb-2 border-b border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setMobileAtoZOpen(!mobileAtoZOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold bg-[#012169] text-white shadow-xs transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <SquaresFour weight="bold" className="h-4 w-4 text-white" />
                      <span>More Products (All Categories A–Z)</span>
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
                        <Link
                          href="/all-products"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-[11px] text-[#012169] font-bold hover:underline"
                        >
                          View All Page &rarr;
                        </Link>
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

                {/* Direct What's New links in Mobile Drawer */}
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

                {/* Popular Categories */}
                <div className="px-2 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Categories
                </div>
                <div className="space-y-1">
                  {displayCategories.map((cat) => (
                    <Link
                      key={cat.name}
                      href={`/category/${encodeURIComponent(cat.name)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-sans text-[15px] font-medium text-slate-800 hover:text-[#012169] hover:bg-slate-50 transition-colors"
                    >
                      <span>{cat.name}</span>
                      <ArrowRight weight="bold" className="h-3.5 w-3.5 text-slate-400" />
                    </Link>
                  ))}
                </div>

                {/* Contact Actions in Mobile Drawer */}
                <div className="pt-4 border-t border-slate-200/80 space-y-2">
                  <a
                    href="tel:03300103521"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 font-bold text-sm text-slate-800"
                  >
                    <Phone weight="fill" className="h-4 w-4 text-red-500" />
                    <span>Call 0330 010 3521</span>
                  </a>
                  <a
                    href="https://wa.me/447969559746"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 font-bold text-sm text-white shadow-sm"
                  >
                    <Chats weight="fill" className="h-4 w-4" />
                    <span>WhatsApp Live Chat</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Special Offer Modal Popup */}
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
                    openCallMe();
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold text-sm transition-all shadow-md cursor-pointer font-sans"
                >
                  Apply to New Quote
                </button>
                <button
                  type="button"
                  onClick={() => setPromoModalOpen(false)}
                  className="w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors cursor-pointer font-sans"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Information / Coming Soon Notice Modal */}
      <AnimatePresence>
        {noticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-center font-sans"
            >
              <button
                onClick={() => setNoticeModal(null)}
                className="absolute right-3.5 top-3.5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X weight="bold" className="h-5 w-5" />
              </button>

              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#012169]">
                <Sparkle weight="fill" className="h-6 w-6 text-[#012169]" />
              </div>

              <h4 className="text-lg font-bold text-slate-900 tracking-tight">Print Today Feature Notice</h4>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{noticeModal}</p>

              <div className="mt-5 flex gap-2.5">
                <button
                  onClick={() => {
                    setNoticeModal(null);
                    openCallMe();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Contact Team
                </button>
                <button
                  onClick={() => setNoticeModal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
