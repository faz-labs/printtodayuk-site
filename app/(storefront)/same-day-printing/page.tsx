'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lightning,
  Clock,
  MapPin,
  Phone,
  WhatsappLogo,
  ArrowLeft,
  CheckCircle,
  Sparkle,
} from '@phosphor-icons/react';
import { useCallMe } from '@/components/storefront/CallMeContext';

export default function SameDayPrintingComingSoonPage() {
  const { openCallMe } = useCallMe();

  return (
    <div className="bg-slate-50 min-h-screen py-10 sm:py-16 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#012169] transition-colors"
          >
            <ArrowLeft weight="bold" className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-8 sm:p-12 text-center relative">
          {/* Decorative glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-b from-[#012169]/10 to-transparent blur-2xl pointer-events-none" />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-black uppercase tracking-wider mb-6">
            <Lightning weight="fill" className="h-4 w-4 text-[#C8102E]" />
            <span>Launch Notice • 24/7 Express Facility</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Same Day &amp; 24 Hours <br className="hidden sm:inline" />
            <span className="text-[#012169]">Printing &amp; Signs London</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our fully automated instant-dispatch portal is <strong>Coming Soon</strong>! In the meantime, our East London studio is fully operational for all urgent same-day orders.
          </p>

          {/* Emergency Service Pillars */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <Clock weight="fill" className="h-5 w-5 text-[#C8102E] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">3-Hour Production</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Order before 12pm for guaranteed same-day collection or courier.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <MapPin weight="fill" className="h-5 w-5 text-[#012169] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">London Studio Hub</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">75 Green St, London E7 8JF. Direct walk-in &amp; express dispatch.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <CheckCircle weight="fill" className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Quality Assured</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">High definition digital pigment, eco-solvent and DTF printing.</p>
              </div>
            </div>
          </div>

          {/* Action CTAs: Direct Ordering Right Now */}
          <div className="mt-10 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/447969559746?text=Hi%2C%20I%20need%20an%20urgent%20same-day%20print%20order%20in%20London."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <WhatsappLogo weight="fill" className="h-5 w-5" />
              <span>WhatsApp Urgent Order</span>
            </a>

            <button
              onClick={() => openCallMe('Same-Day Emergency Order')}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#012169] hover:bg-[#C8102E] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Phone weight="bold" className="h-4 w-4" />
              <span>Request Fast Call-Back</span>
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold transition-all"
            >
              <span>Explore Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
