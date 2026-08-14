'use client';

import React from 'react';
import Link from 'next/link';
import {
  Printer,
  MapPin,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Heart,
} from 'lucide-react';
import { useCallMe } from './CallMeContext';

export function Footer() {
  const { openCallMe } = useCallMe();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top London Callout Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-[#4a0e35] via-[#651449] to-[#2d0720] p-8 sm:p-10 mb-16 shadow-2xl relative overflow-hidden text-white flex flex-col lg:flex-row items-center justify-between gap-6 border border-white/10">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold text-rose-200 mb-3 backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              <span>London Express Print Studio</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
              Need same-day printing delivered in London today?
            </h3>
            <p className="mt-2 text-sm text-rose-100/90 leading-relaxed">
              Order before 12pm for guaranteed same-day collection at 75 Green St, E7 8JF or express courier delivery anywhere across London.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              onClick={() => openCallMe('Emergency Same-Day Order')}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#4a0e35] font-black px-6 py-3.5 rounded-xl text-sm shadow-xl hover:bg-rose-50 transition-all hover:scale-105 cursor-pointer"
            >
              <Phone className="h-4 w-4 text-rose-600" />
              <span>Request Urgent Call Back</span>
            </button>
            <a
              href="tel:02081234567"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3.5 rounded-xl text-sm border border-white/20 transition-all"
            >
              Direct: 020 8123 4567
            </a>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#4a0e35] to-[#781857] flex items-center justify-center text-white shadow-md">
                <Printer className="h-5 w-5 text-rose-300" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                PRINT<span className="text-rose-400">TODAY</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              London&apos;s leading on-demand custom printing and apparel studio. We specialize in rapid turnarounds, premium luxury finishes, and vibrant garment printing.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Quality & Satisfaction Guaranteed</span>
            </div>
          </div>

          {/* Col 2: Printing & Clothing Catalogs */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Catalogs & Services
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-rose-500" />
                  <span>Luxury Business Cards</span>
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-rose-500" />
                  <span>Promotional Flyers & Leaflets</span>
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-rose-500" />
                  <span>Heavy Duty PVC Banners</span>
                </Link>
              </li>
              <li>
                <Link href="/clothing" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-rose-500" />
                  <span>Custom DTF Printed T-Shirts</span>
                </Link>
              </li>
              <li>
                <Link href="/clothing" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-rose-500" />
                  <span>Embroidered Hoodies & Polos</span>
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <ArrowRight className="h-3 w-3 text-rose-500" />
                  <span>Commercial Pop-up Canopies</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: London Studio & Location */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              London Studio Hub
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">75 Green St, London</div>
                  <div>E7 8JF, United Kingdom</div>
                  <a
                    href="https://maps.google.com/?q=75+Green+St+London+E7+8JF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-rose-400 hover:underline mt-0.5 inline-block"
                  >
                    View on Google Maps →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">Opening Hours</div>
                  <div>Mon - Sat: 9:00 AM - 7:00 PM</div>
                  <div>Sunday: 11:00 AM - 5:00 PM</div>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Direct Inquiries */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact & Support
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <a
                href="tel:02081234567"
                className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors"
              >
                <Phone className="h-4 w-4 text-rose-400 shrink-0" />
                <span className="font-bold text-white">020 8123 4567</span>
              </a>

              <a
                href="mailto:info@printtodayuk.com"
                className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors"
              >
                <Mail className="h-4 w-4 text-rose-400 shrink-0" />
                <span>info@printtodayuk.com</span>
              </a>

              <div className="pt-2">
                <button
                  onClick={() => openCallMe()}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors text-center cursor-pointer"
                >
                  Request Fast Callback
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Print Today UK. All rights reserved. 75 Green St, London.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
            <span>in London</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
