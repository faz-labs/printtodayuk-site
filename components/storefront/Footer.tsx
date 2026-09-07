'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  MapPin,
  Phone,
  Envelope,
  Clock,
  ShieldCheck,
  Lightning,
  ArrowRight,
  Heart,
} from '@phosphor-icons/react';
import { useCallMe } from './CallMeContext';
import { getCategories } from '@/lib/db';
import { CategoryConfig } from '@/lib/types';

export function Footer() {
  const { openCallMe } = useCallMe();
  const [categories, setCategories] = useState<CategoryConfig[]>([]);

  useEffect(() => {
    async function loadFooterCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load footer categories:', err);
      }
    }
    loadFooterCategories();
  }, []);

  return (
    <footer className="bg-[#012169] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top London Callout Banner */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md p-8 sm:p-10 mb-16 shadow-xl relative overflow-hidden text-white flex flex-col lg:flex-row items-center justify-between gap-6 border border-white/20">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white mb-3 backdrop-blur-md">
              <Lightning weight="fill" className="h-3.5 w-3.5 text-white" />
              <span>London Express Print Studio</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Need same-day printing delivered in London today?
            </h3>
            <p className="mt-2 text-sm text-white/85 leading-relaxed">
              Order before 12pm for guaranteed same-day collection at 75 Green St, E7 8JF or express courier delivery anywhere across London.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => openCallMe('Emergency Same-Day Order')}
              className="inline-flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow-xl transition-all cursor-pointer border border-[#C8102E]"
            >
              <Phone weight="fill" className="h-4 w-4 text-white" />
              <span>Request Urgent Call Back</span>
            </button>
            <a
              href="tel:03300103521"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#012169] hover:bg-white/90 font-bold px-5 py-3.5 rounded-xl text-sm transition-all shadow-md"
            >
              Direct: 0330 010 3521
            </a>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/15">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img
                src="/images/logo.png"
                alt="Print Today UK"
                className="h-10 sm:h-12 w-auto max-w-[200px] object-contain block bg-white p-1 rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallbackEl = document.getElementById('footer-text-logo');
                  if (fallbackEl) fallbackEl.style.display = 'flex';
                }}
              />
              <div id="footer-text-logo" className="hidden items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#012169] shadow-md">
                  <Printer weight="bold" className="h-5 w-5 text-[#C8102E]" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">
                  PRINT<span className="text-[#C8102E]">TODAY</span>
                  <span className="text-[#012169] font-extrabold text-xs ml-1 bg-white px-1.5 py-0.5 rounded-sm">
                    UK
                  </span>
                </span>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              London&apos;s leading on-demand custom printing and apparel studio. We specialize in rapid turnarounds, premium luxury finishes, and vibrant garment printing.
            </p>
            <div className="flex items-center gap-2 text-xs text-white font-bold">
              <ShieldCheck weight="fill" className="h-4 w-4 text-[#C8102E]" />
              <span>100% Quality & Satisfaction Guaranteed</span>
            </div>
          </div>

          {/* Col 2: Printing & Clothing Catalogs */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/15 pb-2">
              Catalogs & Services
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-2">
                  <ArrowRight weight="bold" className="h-3.5 w-3.5 text-[#C8102E]" />
                  <span>Printing Catalog</span>
                </Link>
              </li>
              <li>
                <Link href="/clothing" className="hover:text-white transition-colors flex items-center gap-2">
                  <ArrowRight weight="bold" className="h-3.5 w-3.5 text-[#C8102E]" />
                  <span>Clothing & Apparel</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://signtodayai.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors flex items-center gap-2"
                >
                  <ArrowRight weight="bold" className="h-3.5 w-3.5 text-[#C8102E]" />
                  <span>Signs & Banners (External) ↗</span>
                </a>
              </li>
              {categories.flatMap((cat) =>
                (cat.subcategories || []).slice(0, 2).map((subcat) => {
                  const href =
                    cat.name.toLowerCase() === 'clothing'
                      ? `/clothing?subcat=${encodeURIComponent(subcat)}`
                      : `/?subcat=${encodeURIComponent(subcat)}`;
                  return (
                    <li key={`${cat.name}-${subcat}`}>
                      <Link
                        href={href}
                        className="hover:text-white transition-colors flex items-center gap-2"
                      >
                        <ArrowRight weight="bold" className="h-3.5 w-3.5 text-[#C8102E]" />
                        <span>{subcat}</span>
                      </Link>
                    </li>
                  );
                })
              ).slice(0, 4)}
            </ul>
          </div>

          {/* Col 3: London Studio & Location */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/15 pb-2">
              London Studio Hub
            </h4>
            <div className="space-y-3.5 text-sm text-white/80">
              <div className="flex items-start gap-2.5">
                <MapPin weight="fill" className="h-4 w-4 text-[#C8102E] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">75 Green St, London</div>
                  <div className="text-xs text-white/70">E7 8JF, United Kingdom</div>
                  <a
                    href="https://maps.google.com/?q=75+Green+St+London+E7+8JF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white underline hover:text-red-200 mt-1 inline-block"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock weight="bold" className="h-4 w-4 text-[#C8102E] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Opening Hours</div>
                  <div className="text-xs text-white/80">Mon - Sat: 9:00 AM - 7:00 PM</div>
                  <div className="text-xs text-white/80">Sunday: 11:00 AM - 5:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Direct Inquiries */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/15 pb-2">
              Contact & Support
            </h4>
            <div className="space-y-3.5 text-sm text-white/80">
              <a
                href="tel:03300103521"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Phone weight="fill" className="h-4 w-4 text-[#C8102E] shrink-0" />
                <span className="font-bold text-white text-base">0330 010 3521</span>
              </a>

              <a
                href="mailto:info@printtodayuk.com"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Envelope weight="fill" className="h-4 w-4 text-[#C8102E] shrink-0" />
                <span>info@printtodayuk.com</span>
              </a>

              <div className="pt-2">
                <button
                  onClick={() => openCallMe()}
                  className="w-full py-3 px-4 rounded-xl bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold text-sm shadow-md transition-colors text-center cursor-pointer border border-[#C8102E]"
                >
                  Request Fast Callback
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <div>
            © {new Date().getFullYear()} Print Today UK. All rights reserved. 75 Green St, London.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
            <span>in London</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
