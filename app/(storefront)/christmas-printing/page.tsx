import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkle,
  Calendar,
  Gift,
  Tree,
  Package,
  Phone,
  WhatsappLogo,
  CheckCircle,
  Clock,
  ShieldCheck,
  Star,
  ArrowRight,
  MapPin,
} from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Christmas Printing London | Wrapping Paper, Gift Tags, Cards | Print Today',
  description:
    'Custom Christmas printing in London: branded wrapping paper, gift tags, Christmas cards, festive menus and 2027 calendars. In-house print, order early for Christmas.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/christmas-printing',
  },
  openGraph: {
    title: 'Christmas Printing London | Custom Seasonal Print | Print Today UK',
    description:
      'Custom Christmas printing in London: branded wrapping paper, gift tags, Christmas cards, festive menus and 2027 calendars. In-house print, order early for Christmas.',
    url: 'https://www.printtodayuk.com/christmas-printing',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Christmas Printing London | Print Today UK',
    description:
      'Custom Christmas printing in London: branded wrapping paper, gift tags, Christmas cards, festive menus and 2027 calendars.',
    site: '@printtodayuk',
  },
};

const SEASONAL_PRODUCTS = [
  {
    title: 'Custom Wrapping Paper',
    price: 'From £44.88',
    href: '/product/flat-wrapping-paper',
    description: '100gsm & 120gsm premium uncoated or silk sheets. Custom branded logos & festive patterns.',
    tag: 'Retail & Gifts',
  },
  {
    title: 'Branded Gift Tags',
    price: 'From £24.53',
    href: '/product/gift-tags',
    description: '350gsm silk or kraft card with drilled holes. Foil highlights available for festive packaging.',
    tag: 'Christmas Essential',
  },
  {
    title: 'Festive Menus & Table Talkers',
    price: 'From £28.00',
    href: '/category/Point%20of%20Sale',
    description: 'Laminated wipe-clean menus, folded table talkers and drink lists for holiday restaurant bookings.',
    tag: 'Hospitality',
  },
  {
    title: '2027 Wall Planners',
    price: 'From £18.25',
    href: '/product/flat-wall-planners',
    description: 'A2, A1 and A0 giant branded year planners. Ready for staff, office walls, and corporate client gifts.',
    tag: 'New Year Prep',
  },
  {
    title: 'Custom Wall Calendars 2027',
    price: 'From £35.00',
    href: '/product/wall-calendars',
    description: 'Wire-o bound with thumb hook. High-resolution photographic prints for 12 months of brand exposure.',
    tag: 'Client Gifts',
  },
  {
    title: 'Christmas Cards & Postcards',
    price: 'From £22.80',
    href: '/product/flyers',
    description: 'Folded greetings cards on heavy 350gsm stock with matching luxury envelopes.',
    tag: 'Greetings',
  },
];

const CHRISTMAS_FAQS = [
  {
    q: 'What is the Christmas order deadline for guaranteed delivery?',
    a: 'For UK standard delivery, please place your order by Friday 18 December. For London courier or in-store collection at 75 Green Street, E7 8JF, you can collect right up to 24 December at 1:00 PM.',
  },
  {
    q: 'Can you print metallic gold or silver foil on Christmas cards and gift tags?',
    a: 'Yes! We offer digital foil embellishments in metallic gold, silver, copper, and raised Spot UV for luxury festive stationery and packaging.',
  },
  {
    q: 'What sizes are available for custom wrapping paper?',
    a: 'Our custom wrapping paper is supplied in large 500mm × 700mm flat sheets on 100gsm or 120gsm FSC-certified paper, ideal for gift wrapping without cracking.',
  },
  {
    q: 'Can I collect in person in London?',
    a: 'Yes, collection is 100% free from our East London print hub at 75 Green Street, London E7 8JF. Customer parking is available directly in front.',
  },
];

export default function ChristmasPrintingPage() {
  return (
    <div className="bg-[#fbfcfd] min-h-screen font-sans text-slate-900">
      {/* 1. Header & Semantic Breadcrumb */}
      <div className="bg-gradient-to-b from-rose-50/50 via-white to-slate-50 border-b border-slate-200/80 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#012169] transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900" aria-current="page">
              Christmas &amp; Seasonal Printing
            </span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-[#C8102E] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
              <Tree weight="fill" className="h-4 w-4" />
              <span>Christmas 2026 &bull; Order Early for Christmas</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Christmas &amp; Holiday Printing in London
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Elevate your festive brand experience. We print branded wrapping paper, luxury foil gift tags, restaurant holiday menus, greeting cards, and 2027 wall planners in-house right here in East London.
            </p>

            {/* Christmas Deadlines Pill */}
            <div className="mt-6 p-4 rounded-2xl bg-white border border-rose-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock weight="fill" className="h-5 w-5 text-[#C8102E] shrink-0" />
                <div>
                  <strong className="text-slate-900 block font-bold">Christmas Delivery Deadlines:</strong>
                  <span className="text-slate-600">UK Courier: Order by 18 Dec &bull; London E7 Collection: Open until 24 Dec (1pm)</span>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold shrink-0">
                In-Stock Guaranteed
              </span>
            </div>

            {/* Quick CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I'd%20like%20a%20quote%20for%20Christmas%20printing%20(wrapping%20paper%2C%20tags%2C%20calendars)."
                target="_blank"
                rel="noopener noreferrer"
                data-loc="christmas_page"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black shadow-md hover:shadow-lg transition-all"
              >
                <WhatsappLogo weight="fill" className="h-5 w-5" />
                <span>WhatsApp Christmas Quote</span>
              </a>

              <a
                href="tel:03300103521"
                data-loc="christmas_page"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Phone weight="fill" className="h-4 w-4 text-red-400" />
                <span>Call 0330 010 3521</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Trust Bar */}
      <div className="border-b border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600" />
            <span>Free 24-Point Artwork Pre-Flight Check</span>
          </div>
          <div className="flex items-center gap-2">
            <Package weight="fill" className="h-4 w-4 text-[#012169]" />
            <span>Printed In-House in London</span>
          </div>
          <div className="flex items-center gap-2">
            <Star weight="fill" className="h-4 w-4 text-amber-500" />
            <span>Rated 4.6/5.0 on Google (90 Reviews)</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin weight="fill" className="h-4 w-4 text-[#C8102E]" />
            <span>Collect Free from 75 Green St, E7</span>
          </div>
        </div>
      </div>

      {/* 3. Products Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Popular Christmas &amp; Holiday Print Products
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Available with fast turnaround, metallic foil options, and luxury paper stocks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SEASONAL_PRODUCTS.map((prod) => (
            <Link
              key={prod.title}
              href={prod.href}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-[#012169] hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-[#C8102E] border border-rose-200/60">
                    {prod.tag}
                  </span>
                  <span className="text-xs font-black text-slate-900">
                    {prod.price}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#012169] transition-colors">
                  {prod.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#012169]">
                <span>Order festive print</span>
                <ArrowRight weight="bold" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. FAQs */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 text-center mb-8">
          Frequently Asked Questions About Christmas Printing
        </h2>
        <div className="space-y-4">
          {CHRISTMAS_FAQS.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <h4 className="text-sm font-bold text-slate-900 mb-1">{faq.q}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
