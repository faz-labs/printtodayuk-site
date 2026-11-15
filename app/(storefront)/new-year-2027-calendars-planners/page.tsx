import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calendar,
  Sparkle,
  CheckCircle,
  Phone,
  WhatsappLogo,
  ShieldCheck,
  Star,
  ArrowRight,
  Clock,
  Printer,
  Table,
} from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: '2027 Calendars & Wall Planners London | Bulk Corporate Printing | Print Today',
  description:
    'Custom 2027 wall planners, branded calendars, and wiro bound diaries printed in-house in London. Bulk trade pricing, fast turnaround, free artwork check.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/new-year-2027-calendars-planners',
  },
  openGraph: {
    title: '2027 Calendars & Wall Planners London | Print Today UK',
    description:
      'Custom 2027 wall planners, branded calendars, and wiro bound diaries printed in-house in London. Bulk trade pricing, fast turnaround.',
    url: 'https://www.printtodayuk.com/new-year-2027-calendars-planners',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '2027 Calendars & Wall Planners London | Print Today UK',
    description:
      'Custom 2027 wall planners, branded calendars, and wiro bound diaries printed in-house in London.',
    site: '@printtodayuk',
  },
};

const BULK_TIERS = [
  { item: 'A2 Flat Wall Planners (170gsm Silk)', qty25: '£28.50', qty50: '£39.00', qty100: '£58.00', qty250: '£112.00', qty500: '£185.00' },
  { item: 'A1 Giant Wall Planners (250gsm Silk)', qty25: '£36.00', qty50: '£49.50', qty100: '£76.00', qty250: '£148.00', qty500: '£245.00' },
  { item: 'A4 Wall Calendars (Wire-O + Thumb Hook)', qty25: '£48.00', qty50: '£75.00', qty100: '£125.00', qty250: '£260.00', qty500: '£440.00' },
  { item: 'A5 Wiro Bound Hardback 2027 Diaries', qty25: '£188.18', qty50: '£285.00', qty100: '£480.00', qty250: '£950.00', qty500: '£1,650.00' },
];

export default function NewYearCalendarsPage() {
  return (
    <div className="bg-[#fbfcfd] min-h-screen font-sans text-slate-900">
      {/* 1. Hero Section */}
      <div className="bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200/80 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#012169] transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900" aria-current="page">
              2027 Calendars &amp; Wall Planners
            </span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-[#012169] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
              <Calendar weight="fill" className="h-4 w-4" />
              <span>Corporate &amp; Agency Print 2027 &bull; In-House Production</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              2027 Custom Calendars &amp; Wall Planners London
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Keep your brand on your clients&apos; and staff walls 365 days a year. We print bespoke 2027 wall planners, month-to-view wall calendars, and wire-bound executive diaries right here in our East London studio.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I'd%20like%20a%20bulk%20quote%20for%202027%20wall%20planners%20%2F%20calendars."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black shadow-md hover:shadow-lg transition-all"
              >
                <WhatsappLogo weight="fill" className="h-5 w-5" />
                <span>WhatsApp Instant Quote</span>
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

      {/* 2. Trust Bar */}
      <div className="border-b border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600" />
            <span>FSC-Certified Premium Silk &amp; Uncoated Stocks</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock weight="fill" className="h-4 w-4 text-[#012169]" />
            <span>3-5 Working Day Turnaround (Express Available)</span>
          </div>
          <div className="flex items-center gap-2">
            <Star weight="fill" className="h-4 w-4 text-amber-500" />
            <span>Rated 4.6/5.0 on Google (90 Reviews)</span>
          </div>
        </div>
      </div>

      {/* 3. Bulk Trade Price Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            2027 Calendar &amp; Planner Trade Pricing
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            All prices exclude VAT. Includes free pre-press artwork check and free London collection.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold">
                <th className="p-4">Product / Specification</th>
                <th className="p-4 text-center">25 Qty</th>
                <th className="p-4 text-center">50 Qty</th>
                <th className="p-4 text-center">100 Qty</th>
                <th className="p-4 text-center">250 Qty</th>
                <th className="p-4 text-center bg-blue-50/60 text-[#012169]">500 Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {BULK_TIERS.map((tier, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{tier.item}</td>
                  <td className="p-4 text-center">{tier.qty25}</td>
                  <td className="p-4 text-center">{tier.qty50}</td>
                  <td className="p-4 text-center font-bold text-slate-900">{tier.qty100}</td>
                  <td className="p-4 text-center">{tier.qty250}</td>
                  <td className="p-4 text-center font-black text-[#012169] bg-blue-50/30">{tier.qty500}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <span className="text-slate-600">
            Need bespoke dimensions, custom grid templates, or quantities over 1,000 units?
          </span>
          <a
            href="https://wa.me/447969559746?text=Hi%2C%20I%20need%20a%20bespoke%20high-volume%20quote%20for%202027%20calendars."
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-[#012169] hover:underline"
          >
            Request Bespoke Volume Quote &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
