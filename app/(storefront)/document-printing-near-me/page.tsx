import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText,
  Printer,
  Clock,
  Phone,
  WhatsappLogo,
  CheckCircle,
  MapPin,
  EnvelopeSimple,
  ShieldCheck,
  Star,
  FilePdf,
} from '@phosphor-icons/react/dist/ssr';
import { getFaqSchema } from '@/lib/geo-aeo-schemas';
import { AeoFaqSection } from '@/components/storefront/AeoFaqSection';

export const metadata: Metadata = {
  title: 'Document Printing Near Me London | A4/A3 & Binding | Print Today',
  description:
    'Document printing and photocopying near you in London. A4 & A3 black & white and colour, wire binding, booklet stapling. Walk in at 75 Green St, E7.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/document-printing-near-me',
  },
  openGraph: {
    title: 'Document Printing Near Me London | Print Today UK',
    description:
      'Fast document printing, photocopying, and wire binding near you in London. Walk in at 75 Green St E7 or email your PDF.',
    url: 'https://www.printtodayuk.com/document-printing-near-me',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Document Printing Near Me London | Print Today UK',
    description:
      'Fast document printing, photocopying, and wire binding in London. Walk in at 75 Green St E7.',
    site: '@printtodayuk',
  },
};

const DOCUMENT_PRICING = [
  { service: 'A4 Black & White Printing / Copying', single: '£0.15', qty50: '£0.10/pg', qty250: '£0.06/pg', qty500: '£0.04/pg' },
  { service: 'A4 Full Colour Laser Printing (100gsm)', single: '£0.50', qty50: '£0.35/pg', qty250: '£0.22/pg', qty500: '£0.16/pg' },
  { service: 'A3 Full Colour Heavyweight (120gsm)', single: '£1.20', qty50: '£0.80/pg', qty250: '£0.55/pg', qty500: '£0.40/pg' },
  { service: 'Wire-O Document Binding (Clear Cover + Card Back)', single: '£4.50', qty50: '£3.50/ea', qty250: '£2.50/ea', qty500: '£1.90/ea' },
  { service: 'A4 Gloss or Matt Pouch Encapsulation / Lamination', single: '£1.50', qty50: '£1.00/ea', qty250: '£0.70/ea', qty500: '£0.50/ea' },
];

const DOCUMENT_FAQS = [
  {
    question: 'Where can I print documents near me today in London?',
    answer:
      'You can print documents immediately in London at Print Today UK, located at 75 Green Street, London, E7 8JF. Walk in with a USB drive, send your PDF via WhatsApp (+44 7969 559746), or email artwork@printtodayuk.com for instant printing.',
  },
  {
    question: 'Do you offer document wire binding and thesis printing?',
    answer:
      'Yes. We provide Wire-O metal spiral binding with clear protective front acetate covers and heavy card backing. Suitable for university dissertations, pitch decks, corporate reports, and training manuals.',
  },
  {
    question: 'Can I print A4 and A3 documents in full colour or black and white?',
    answer:
      'Yes. We print on premium 80gsm, 100gsm, 120gsm, and 300gsm paper stocks in crisp high-contrast black & white or rich full-colour laser print.',
  },
  {
    question: 'Is there a minimum page count or order fee for document printing?',
    answer:
      'No. There is no minimum page limit. You can print a single flight ticket or legal contract, up to thousands of pages with tiered volume discounts.',
  },
];

export default function DocumentPrintingPage() {
  const faqSchema = getFaqSchema(DOCUMENT_FAQS);

  return (
    <div className="bg-[#fbfcfd] min-h-screen font-sans text-slate-900">
      {/* Schema.org FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Hero Section */}
      <div className="bg-gradient-to-b from-slate-100 via-white to-slate-50 border-b border-slate-200/80 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#012169] transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900" aria-current="page">
              Document Printing Near Me
            </span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-[#012169] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
              <Printer weight="fill" className="h-4 w-4 text-[#C8102E]" />
              <span>Same-Hour Walk-In &bull; 75 Green St, London E7 8JF</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Document Printing &amp; Photocopying Near Me
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Need documents, presentations, contracts, training manuals, or university dissertations printed right now? Walk into our London shop, bring a USB, or send your PDF via WhatsApp or email for instant collection within 15 minutes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="mailto:artwork@printtodayuk.com?subject=Document%20Print%20Order&body=Hi%2C%20please%20find%20attached%20my%20PDF%20document%20for%20printing.%0A%0AOrder%20Details%3A%0A-%20A4%20or%20A3%3A%20%0A-%20Colour%20or%20Black%26White%3A%20%0A-%20Copies%3A%20%0A-%20Binding%3A%20%0A-%20Collect%20time%3A%20"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <FilePdf weight="fill" className="h-5 w-5 text-red-400" />
                <span>Email PDF &bull; Ready in 15 Mins</span>
              </a>

              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I%20have%20a%20document%20PDF%20to%20print."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black shadow-md hover:shadow-lg transition-all"
              >
                <WhatsappLogo weight="fill" className="h-5 w-5" />
                <span>Send PDF via WhatsApp</span>
              </a>

              <a
                href="tel:03300103521"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-sm font-bold shadow-2xs transition-colors"
              >
                <Phone weight="fill" className="h-4 w-4 text-[#012169]" />
                <span>0330 010 3521</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Walk-In Information Bar */}
      <div className="border-b border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <Clock weight="fill" className="h-4 w-4 text-[#C8102E]" />
            <span>Open Mon–Fri 7am–8pm, Sat 8am–5pm, Sun 8am–4pm</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600" />
            <span>Printed While You Wait (Small Runs)</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin weight="fill" className="h-4 w-4 text-[#012169]" />
            <span>75 Green Street, London E7 8JF</span>
          </div>
        </div>
      </div>

      {/* 3. Document Pricing Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Document Printing &amp; Binding Prices
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Clear, transparent walk-in pricing. Bulk discounts applied automatically.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-900 font-bold">
                <th className="p-4">Document Service</th>
                <th className="p-4 text-center">1–49 pgs</th>
                <th className="p-4 text-center">50–249 pgs</th>
                <th className="p-4 text-center">250–499 pgs</th>
                <th className="p-4 text-center bg-blue-50/60 text-[#012169]">500+ pgs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {DOCUMENT_PRICING.map((d, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{d.service}</td>
                  <td className="p-4 text-center">{d.single}</td>
                  <td className="p-4 text-center">{d.qty50}</td>
                  <td className="p-4 text-center font-bold text-slate-900">{d.qty250}</td>
                  <td className="p-4 text-center font-black text-[#012169] bg-blue-50/30">{d.qty500}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* AEO Frequently Asked Questions */}
        <div className="mt-14">
          <AeoFaqSection
            title="London Document Printing FAQs"
            subtitle="Fast answers for customers printing PDFs, theses, tickets, pitch decks, and presentations near them."
            badge="Document Printing Q&A"
            faqs={DOCUMENT_FAQS}
          />
        </div>
      </div>
    </div>
  );
}
