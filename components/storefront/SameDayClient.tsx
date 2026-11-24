'use client';

import React from 'react';
import Link from 'next/link';
import {
  Lightning,
  Clock,
  MapPin,
  Phone,
  WhatsappLogo,
  ArrowRight,
  CheckCircle,
  Sparkle,
  Printer,
  FilePdf,
  ShieldCheck,
  Truck,
} from '@phosphor-icons/react';
import { useCallMe } from '@/components/storefront/CallMeContext';

const SAME_DAY_PRODUCTS = [
  {
    title: 'Business Cards',
    price: 'From £18.84',
    href: '/category/Business%20Cards',
    description: '350gsm–450gsm card stock, silk, matte or uncoated finishes.',
    badge: 'Collect in 3 hrs',
  },
  {
    title: 'Flyers & Leaflets',
    price: 'From £22.80',
    href: '/product/flyers',
    description: '130gsm–300gsm gloss or silk for events, launches and menus.',
    badge: 'Popular',
  },
  {
    title: 'Large Format Posters',
    price: 'From £39.90',
    href: '/product/large-format-posters',
    description: 'A2, A1, A0 & bespoke sizes on 200gsm satin photo paper.',
    badge: 'Vibrant CMYK',
  },
  {
    title: 'Roller Banners',
    price: 'From £45.00',
    href: '/product/standard-roller-banners',
    description: '850mm × 2000mm roll-up banner with padded carry case.',
    badge: 'Expo Ready',
  },
  {
    title: 'Document Printing',
    price: 'From £0.10/pg',
    href: '/document-printing-near-me',
    description: 'A4/A3 colour or black & white documents, wire binding, stapling.',
    badge: 'Walk-in Welcome',
  },
  {
    title: 'Custom T-Shirts & DTF',
    price: 'From £12.50',
    href: '/clothing',
    description: 'Full colour DTF apparel printing in-house. No minimum order.',
    badge: 'Same-Day DTF',
  },
  {
    title: 'Foam Boards & Signs',
    price: 'From £28.00',
    href: '/category/Rigid%20Media',
    description: '3mm & 5mm lightweight Foamex and Correx boards for events.',
    badge: 'Rigid Media',
  },
  {
    title: 'Stickers & Labels',
    price: 'From £15.00',
    href: '/category/Stickers%20%26%20Labels',
    description: 'Contour cut vinyl decals, packaging stickers & sheet labels.',
    badge: 'Die-Cut Vinyl',
  },
];

export function SameDayClient() {
  const { openCallMe } = useCallMe();

  return (
    <div className="bg-[#fbfcfd] min-h-screen py-10 sm:py-16 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#012169] transition-colors">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900" aria-current="page">
            Same-Day Printing London
          </span>
        </nav>

        {/* Hero Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-10 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#012169]/10 via-[#C8102E]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-xs font-black text-[#C8102E] mb-4 shadow-2xs">
              <Lightning weight="fill" className="h-4 w-4" />
              <span>London Same-Day Print Hub &bull; Order by 12pm</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Same-Day Printing in London
            </h1>

            <p className="mt-4 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
              Need it today? Order before <strong>12:00 PM</strong> for guaranteed same-day collection from our East London studio at <strong>75 Green Street, E7 8JF</strong> or express London same-day courier dispatch.
            </p>

            {/* Quick Action CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I%20need%20an%20urgent%20same-day%20print%20order%20in%20London."
                target="_blank"
                rel="noopener noreferrer"
                data-loc="hero"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <WhatsappLogo weight="fill" className="h-5 w-5" />
                <span>WhatsApp Urgent Order</span>
              </a>

              <a
                href="tel:03300103521"
                data-loc="hero"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Phone weight="fill" className="h-4 w-4 text-red-400" />
                <span>Call 0330 010 3521</span>
              </a>

              <button
                type="button"
                onClick={() => openCallMe('Same-Day Urgent Print')}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <span>Request Call Back</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Rules Bar */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-[#C8102E] flex items-center justify-center shrink-0">
              <Clock weight="fill" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">12:00 PM Daily Cutoff</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Send approved artwork before midday for guaranteed same-day collection or dispatch.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#012169] flex items-center justify-center shrink-0">
              <MapPin weight="fill" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Free London Collection</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Collect in person from 75 Green St, London E7 8JF. Free customer parking available.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck weight="fill" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Free Artwork Pre-Flight</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Our prepress experts inspect resolution, bleed and colour before running production.
              </p>
            </div>
          </div>
        </div>

        {/* Same-Day Products Grid */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Available for Same-Day Printing
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Produced in-house on high-speed digital presses in East London.
              </p>
            </div>
            <Link
              href="/all-products"
              className="text-xs font-bold text-[#012169] hover:underline flex items-center gap-1"
            >
              <span>View all 80+ products</span>
              <ArrowRight weight="bold" className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAME_DAY_PRODUCTS.map((prod) => (
              <Link
                key={prod.title}
                href={prod.href}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-[#012169] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {prod.badge}
                    </span>
                    <span className="text-xs font-black text-[#C8102E]">
                      {prod.price}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#012169] transition-colors">
                    {prod.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {prod.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#012169]">
                  <span>Order same-day</span>
                  <ArrowRight weight="bold" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 4-Step Process Section */}
        <div className="mt-16 p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-2xs">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center">
            How Same-Day Printing Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 text-center mt-1 max-w-lg mx-auto">
            From design submission to finished product in as little as 3 hours.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#012169] text-white font-black flex items-center justify-center text-sm shadow-xs mb-3">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Choose Specs or WhatsApp</h4>
              <p className="text-xs text-slate-500 mt-1">
                Select your product or message us directly on WhatsApp with your file &amp; quantities.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#012169] text-white font-black flex items-center justify-center text-sm shadow-xs mb-3">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Free Artwork Check</h4>
              <p className="text-xs text-slate-500 mt-1">
                We verify 300 DPI resolution, 3mm bleed and CMYK colours and confirm proofs with you.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#012169] text-white font-black flex items-center justify-center text-sm shadow-xs mb-3">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">In-House Production</h4>
              <p className="text-xs text-slate-500 mt-1">
                Printed, trimmed, laminated or pressed immediately in our East London studio.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#012169] text-white font-black flex items-center justify-center text-sm shadow-xs mb-3">
                4
              </div>
              <h4 className="text-sm font-bold text-slate-900">Collect or Courier</h4>
              <p className="text-xs text-slate-500 mt-1">
                Collect free from 75 Green St, London E7 or have your order delivered via same-day courier.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
