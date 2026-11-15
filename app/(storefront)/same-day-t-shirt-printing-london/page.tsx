import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Flame,
  Clock,
  Sparkle,
  Phone,
  WhatsappLogo,
  CheckCircle,
  ShieldCheck,
  Star,
  ArrowRight,
  Package,
} from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Same Day T-Shirt Printing London | No Minimum | Print Today UK',
  description:
    'Same-day custom t-shirt and hoodie printing in London. DTF full colour printing in-house, no minimum order. Collect from 75 Green St E7 or London courier.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/same-day-t-shirt-printing-london',
  },
  openGraph: {
    title: 'Same Day T-Shirt Printing London | No Minimum | Print Today UK',
    description:
      'Same-day custom t-shirt and hoodie printing in London. DTF full colour printing in-house, no minimum order.',
    url: 'https://www.printtodayuk.com/same-day-t-shirt-printing-london',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Same Day T-Shirt Printing London | Print Today UK',
    description:
      'Same-day custom t-shirt and hoodie printing in London. DTF printing in-house, no minimum order.',
    site: '@printtodayuk',
  },
};

const APPAREL_PRICES = [
  { item: 'Standard White T-Shirt (100% Cotton, 185gsm)', single: '£14.50', qty10: '£11.00/ea', qty50: '£8.50/ea', qty100: '£6.80/ea' },
  { item: 'Black & Coloured T-Shirts (185gsm Heavy Cotton)', single: '£16.00', qty10: '£12.50/ea', qty50: '£9.50/ea', qty100: '£7.80/ea' },
  { item: 'Classic Pullover Hoodie (280gsm Fleece)', single: '£26.00', qty10: '£21.00/ea', qty50: '£17.50/ea', qty100: '£14.80/ea' },
  { item: 'Embroidered or DTF Polo Shirt (220gsm Pique)', single: '£19.50', qty10: '£15.00/ea', qty50: '£12.00/ea', qty100: '£9.90/ea' },
  { item: 'Natural Cotton Tote Bags (Long Handles)', single: '£9.50', qty10: '£6.50/ea', qty50: '£4.20/ea', qty100: '£2.90/ea' },
];

export default function SameDayTShirtPrintingPage() {
  return (
    <div className="bg-[#fbfcfd] min-h-screen font-sans text-slate-900">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-b from-red-50/40 via-white to-slate-50 border-b border-slate-200/80 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#012169] transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/clothing" className="hover:text-[#012169] transition-colors">
              Clothing
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900" aria-current="page">
              Same Day T-Shirt Printing London
            </span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-[#C8102E] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
              <Flame weight="fill" className="h-4 w-4" />
              <span>In-House DTF Production &bull; No Minimum Order</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Same-Day T-Shirt &amp; Hoodie Printing in London
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Need custom printed t-shirts today for an event, brand launch, stag/hen party, or trade uniform? We print full-colour Direct-to-Film (DTF) apparel in our East London studio with zero minimum orders and express same-day turnaround.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I%20need%20same-day%20t-shirt%20%2F%20hoodie%20printing%20in%20London."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black shadow-md hover:shadow-lg transition-all"
              >
                <WhatsappLogo weight="fill" className="h-5 w-5" />
                <span>WhatsApp Urgent T-Shirt Order</span>
              </a>

              <a
                href="tel:03300103521"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Phone weight="fill" className="h-4 w-4 text-red-400" />
                <span>Call 0330 010 3521</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Highlights Bar */}
      <div className="border-b border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600" />
            <span>No Minimum Order (Print 1 to 1,000+)</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock weight="fill" className="h-4 w-4 text-[#C8102E]" />
            <span>Ready in as Little as 3 Hours</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck weight="fill" className="h-4 w-4 text-[#012169]" />
            <span>50+ Wash Durability &bull; Ultra Soft Feel</span>
          </div>
          <div className="flex items-center gap-2">
            <Star weight="fill" className="h-4 w-4 text-amber-500" />
            <span>Rated 4.6/5 on Google (90 Reviews)</span>
          </div>
        </div>
      </div>

      {/* 3. Garment Price Matrix */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Same-Day London Apparel Pricing
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Includes garment, high-resolution full colour DTF front or back print, and free in-store collection.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold">
                <th className="p-4">Garment / Quality</th>
                <th className="p-4 text-center">Single (1 Qty)</th>
                <th className="p-4 text-center">10 Qty</th>
                <th className="p-4 text-center">50 Qty</th>
                <th className="p-4 text-center bg-blue-50/60 text-[#012169]">100+ Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {APPAREL_PRICES.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{p.item}</td>
                  <td className="p-4 text-center">{p.single}</td>
                  <td className="p-4 text-center">{p.qty10}</td>
                  <td className="p-4 text-center">{p.qty50}</td>
                  <td className="p-4 text-center font-black text-[#012169] bg-blue-50/30">{p.qty100}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
