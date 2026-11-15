import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  MagnifyingGlass,
  ArrowRight,
  House,
  WhatsappLogo,
  Phone,
  Sparkle,
  Printer,
  Tag,
  Lightning,
} from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Page Not Found (404) | Print Today UK',
  description:
    'The requested print or apparel page could not be found. Browse our London printing services, same-day collection, or request an instant quote via WhatsApp.',
  robots: {
    index: false,
    follow: false,
  },
};

const POPULAR_LINKS = [
  { name: 'Business Cards', href: '/category/Business%20Cards', tag: 'Same Day' },
  { name: 'Flyers & Leaflets', href: '/category/Flyers%20%26%20Leaflets', tag: 'From £22.80' },
  { name: 'Roller Banners', href: '/category/Roller%20Banners', tag: 'Events' },
  { name: 'Large Format Posters', href: '/category/Posters%20%26%20Flexible%20Media', tag: 'From £39.90' },
  { name: 'Custom T-Shirts & Hoodies', href: '/clothing', tag: 'DTF Printing' },
  { name: 'Same Day Printing London', href: '/same-day-printing', tag: 'Express' },
  { name: 'Christmas & 2027 Planners', href: '/christmas-printing', tag: 'Seasonal' },
  { name: 'Full Product Catalog', href: '/all-products', tag: 'Browse All' },
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] bg-slate-50 flex items-center justify-center px-4 py-16 sm:py-24 font-sans text-slate-900">
      <div className="max-w-2xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-black text-[#C8102E] mb-4 shadow-2xs">
          <Sparkle weight="fill" className="h-3.5 w-3.5" />
          <span>Error 404 &bull; Page Not Found</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Looking for custom printing in London?
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
          The link you followed may have moved or been updated. Let&apos;s get you to the right place or get you an instant studio quote right now.
        </p>

        {/* Quick Instant Quote / Support Bar */}
        <div className="mt-8 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-400">
                Can&apos;t find what you need?
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                Speak directly to our London print technicians
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="https://wa.me/447969559746?text=Hello%20Print%20Today%20UK%2C%20I%20couldn't%20find%20the%20page%20I%20was%20looking%20for.%20Can%20you%20help%20me%20with%20a%20print%20quote%3F"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <WhatsappLogo weight="fill" className="h-4 w-4" />
                <span>WhatsApp Quote</span>
              </a>
              <a
                href="tel:03300103521"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <Phone weight="fill" className="h-3.5 w-3.5 text-[#012169]" />
                <span>0330 010 3521</span>
              </a>
            </div>
          </div>

          {/* Popular Categories Grid */}
          <div className="pt-4">
            <div className="text-xs font-bold text-slate-500 mb-2.5">
              Popular Print &amp; Apparel Products:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {POPULAR_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col p-2.5 rounded-lg border border-slate-200 hover:border-[#012169] hover:bg-blue-50/40 transition-all text-left group"
                >
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 mt-0.5">
                    {item.tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Primary Home Action */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <House weight="fill" className="h-4 w-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/all-products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-sm shadow-2xs transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight weight="bold" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
