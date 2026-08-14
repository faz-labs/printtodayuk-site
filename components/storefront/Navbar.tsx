'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  Shirt,
  Globe,
  TrendingUp,
  MapPin,
  Menu,
  X,
  Phone,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCallMe } from './CallMeContext';
import { CategoryMegaMenu } from './CategoryMegaMenu';

export function Navbar() {
  const pathname = usePathname();
  const { openCallMe } = useCallMe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [noticeModal, setNoticeModal] = useState<string | null>(null);

  const mainLinks = [
    {
      name: 'Printing',
      href: '/',
      icon: Printer,
      active: pathname === '/' || pathname.startsWith('/product'),
      badge: 'Popular',
    },
    {
      name: 'Clothing',
      href: '/clothing',
      icon: Shirt,
      active: pathname === '/clothing',
      badge: 'Custom Apparel',
    },
  ];

  const secondaryLinks = [
    {
      name: 'Signs & Banners',
      action: () => setNoticeModal('Signs & Large Format Displays: Banners, A-Boards, Window Graphics, and Lightboxes available for London same-day dispatch. Call our print studio for instant quote.'),
      icon: MapPin,
    },
    {
      name: 'Websites',
      action: () => setNoticeModal('Digital Web Services: High-converting landing pages and e-commerce websites crafted by our London digital studio. Inquire via Call Me for project scopes.'),
      icon: Globe,
    },
    {
      name: 'Digital Marketing',
      action: () => setNoticeModal('Digital Marketing: SEO, Local London Google Business optimization & paid social campaigns to grow your business.'),
      icon: TrendingUp,
    },
    {
      name: 'Find a Studio',
      action: () => setNoticeModal('London Production Hub: 75 Green St, E7 8JF, London. Walk-ins & same-day collection welcome Mon-Sat 9am - 7pm.'),
      icon: MapPin,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-hidden"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#4a0e35] to-[#781857] flex items-center justify-center text-white shadow-md shadow-[#4a0e35]/20 group-hover:scale-105 transition-transform">
                <Printer className="h-6 w-6 text-rose-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-none">
                  PRINT<span className="text-[#4a0e35]">TODAY</span>
                  <span className="text-rose-500 font-extrabold text-xs ml-1 bg-rose-50 px-1.5 py-0.5 rounded-sm border border-rose-200/60">
                    UK
                  </span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase mt-1">
                  Same Day London
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              <CategoryMegaMenu variant="navbar" />

              {mainLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2',
                      item.active
                        ? 'text-[#4a0e35] bg-[#4a0e35]/10 shadow-xs'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100/80'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        item.active ? 'text-[#4a0e35]' : 'text-slate-500'
                      )}
                    />
                    <span>{item.name}</span>
                    {item.active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#4a0e35] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              <div className="h-5 w-px bg-slate-200 mx-2" />

              {/* Secondary Service Links */}
              {secondaryLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-[#4a0e35] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </nav>

            {/* Header Right Action */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => openCallMe()}
                className="hidden sm:inline-flex items-center gap-2 bg-[#4a0e35] hover:bg-[#5d1243] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 shadow-md shadow-[#4a0e35]/20 hover:scale-102 cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5 text-rose-300" />
                <span>Instant Quote</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
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
              className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl"
            >
              <div className="flex flex-col space-y-1">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Main Catalogs
                </div>
                {mainLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold',
                        item.active
                          ? 'bg-[#4a0e35] text-white'
                          : 'text-slate-800 hover:bg-slate-100'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </div>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          item.active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        )}
                      >
                        {item.badge}
                      </span>
                    </Link>
                  );
                })}

                <div className="pt-3 pb-1 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Services & Studios
                </div>
                {secondaryLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      link.action();
                    }}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <span>{link.name}</span>
                    <ExternalLink className="h-4 w-4 text-slate-400" />
                  </button>
                ))}

                <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openCallMe();
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl shadow-sm text-sm"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Me / Instant Quote</span>
                  </button>
                  <a
                    href="tel:02081234567"
                    className="flex items-center justify-center gap-2 text-xs font-semibold text-[#4a0e35] py-2"
                  >
                    Direct Dial: 020 8123 4567
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
            <div className="flex items-center gap-2 text-[#4a0e35] mb-2 font-bold">
              <Sparkles className="h-5 w-5 text-rose-500" />
              <span>Studio Information</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">{noticeModal}</p>
            <div className="mt-5 flex gap-2 justify-end">
              <button
                onClick={() => {
                  setNoticeModal(null);
                  openCallMe();
                }}
                className="px-4 py-2 bg-[#4a0e35] text-white text-xs font-bold rounded-xl hover:bg-[#5d1243]"
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
