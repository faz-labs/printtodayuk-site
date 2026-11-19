import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  WhatsappLogo,
  Clock,
  Train,
  Car,
  CheckCircle,
  Star,
  ArrowRight,
  ShieldCheck,
  Printer,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';
import { getPrintShopLocalBusinessSchema, getFaqSchema } from '@/lib/geo-aeo-schemas';
import { AeoFaqSection } from '@/components/storefront/AeoFaqSection';

export const metadata: Metadata = {
  title: 'Print Shop East London | 75 Green St E7 | Print Today UK',
  description:
    'In-house print shop in East London at 75 Green Street, E7 8JF. Walk-ins welcome, same-day printing, free collection & customer parking. Serving East Ham, Stratford, Ilford.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/printing-east-london',
  },
  openGraph: {
    title: 'Print Shop East London | 75 Green St E7 | Print Today UK',
    description:
      'In-house print shop in East London at 75 Green Street, E7 8JF. Walk-ins welcome, same-day printing, free collection & customer parking.',
    url: 'https://www.printtodayuk.com/printing-east-london',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Print Shop East London | 75 Green St E7 | Print Today UK',
    description:
      'In-house print shop in East London at 75 Green Street, E7 8JF. Walk-ins welcome, same-day printing.',
    site: '@printtodayuk',
  },
};

const AREAS_SERVED = [
  'East Ham (E6)',
  'Forest Gate (E7)',
  'Upton Park (E13)',
  'Stratford (E15)',
  'Ilford (IG1)',
  'Barking (IG11)',
  'Canning Town (E16)',
  'Plaistow (E13)',
  'Manor Park (E12)',
  'Leytonstone (E11)',
  'Canary Wharf (E14)',
  'Central London (EC1-EC4)',
];

const LOCAL_SERVICES = [
  { name: 'Same-Day Business Cards', href: '/product/business-cards', desc: 'From £18.84. High-definition 400gsm card, collect in as little as 3 hours.' },
  { name: 'Flyers & Promotional Leaflets', href: '/product/flyers', desc: 'From £22.80. Crisp full colour print for restaurant menus, sales and events.' },
  { name: 'Large Format Posters (A2-A0)', href: '/product/large-format-posters', desc: 'From £39.90. Vibrant satin photo posters printed on our Epson SureColor.' },
  { name: 'Roller & Exhibition Banners', href: '/product/standard-roller-banners', desc: 'From £45.00. Heavyweight stop-light film with sturdy cassette.' },
  { name: 'Document Printing & Photocopying', href: '/document-printing-near-me', desc: 'From £0.10/pg. Fast walk-in printing, thesis binding and A4/A3 copying.' },
  { name: 'Custom T-Shirts & DTF Hoodies', href: '/clothing', desc: 'From £12.50. Printed in-house on our industrial DTF equipment.' },
];

const EAST_LONDON_FAQS = [
  {
    question: 'Where is Print Today UK located in East London?',
    answer:
      'We are located at 75 Green Street, London, E7 8JF, directly between Forest Gate and Upton Park in East London. Our studio is easily accessible via the Elizabeth Line (Forest Gate) or District Line (Upton Park) with customer parking right outside.',
  },
  {
    question: 'Can I walk into your East London shop to place or collect an order?',
    answer:
      'Yes, walk-ins are warmly welcome! You can visit our studio to review paper samples, discuss bespoke printing, or collect orders in person 7 days a week.',
  },
  {
    question: 'What are the opening hours of your East London print studio?',
    answer:
      'We are open 7 days a week: Monday to Friday 7:00 AM – 8:00 PM, Saturday 8:00 AM – 5:00 PM, and Sunday 8:00 AM – 4:00 PM.',
  },
  {
    question: 'Is there parking available for order collection at 75 Green Street?',
    answer:
      'Yes. There is a customer parking bay directly outside 75 Green Street for easy order pickups, loading large banner stands, or collecting heavy boxes of print.',
  },
];

export default function PrintingEastLondonPage() {
  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=75+Green+Street,+E7+8JF,+London,+United+Kingdom';

  const localBusinessSchema = getPrintShopLocalBusinessSchema();
  const faqSchema = getFaqSchema(EAST_LONDON_FAQS);

  return (
    <div className="bg-[#fbfcfd] min-h-screen font-sans text-slate-900">
      {/* Schema.org LocalBusiness Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      {/* Schema.org FAQPage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Header Banner */}
      <div className="bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b border-slate-200/80 py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#012169] transition-colors">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-bold text-slate-900" aria-current="page">
              Print Shop East London
            </span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-[#012169] text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
              <MapPin weight="fill" className="h-4 w-4 text-[#C8102E]" />
              <span>75 Green Street, London E7 8JF &bull; Walk-Ins Welcome</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Your Local East London Print Shop
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              Looking for a reputable print shop near you? <strong>Print Today UK</strong> is your local East London commercial printer. We print business cards, flyers, posters, banners, documents, and custom clothing in-house with same-day collection available 7 days a week.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <MapPin weight="fill" className="h-4 w-4 text-red-400" />
                <span>Get Directions (75 Green St)</span>
              </a>

              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I'm%20visiting%20your%20East%20London%20shop%20and%20need%20a%20print%20quote."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-black shadow-md hover:shadow-lg transition-all"
              >
                <WhatsappLogo weight="fill" className="h-5 w-5" />
                <span>WhatsApp Local Desk</span>
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

      {/* 2. Studio Details Grid: Hours, Transport, Parking */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-[#C8102E] flex items-center justify-center mb-4">
              <Clock weight="fill" className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Studio Hours</h3>
            <ul className="text-xs text-slate-600 space-y-1.5 font-medium">
              <li className="flex justify-between py-1 border-b border-slate-100">
                <span>Monday &ndash; Friday</span>
                <strong className="text-slate-900">7:00 AM &ndash; 8:00 PM</strong>
              </li>
              <li className="flex justify-between py-1 border-b border-slate-100">
                <span>Saturday</span>
                <strong className="text-slate-900">8:00 AM &ndash; 5:00 PM</strong>
              </li>
              <li className="flex justify-between py-1">
                <span>Sunday</span>
                <strong className="text-slate-900">8:00 AM &ndash; 4:00 PM</strong>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#012169] flex items-center justify-center mb-4">
              <Train weight="fill" className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Public Transport</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Located on busy Green Street. Just a <strong>5-minute walk from Upton Park Station</strong> (District &amp; Hammersmith &amp; City lines) or 10 minutes from Forest Gate (Elizabeth line). Bus routes 104, 238, 325 and 376 stop right outside.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Car weight="fill" className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Customer Parking</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dedicated customer parking bay available directly outside for fast order collection and bulky print pickups (signs, banners and heavy garment boxes).
            </p>
          </div>
        </div>

        {/* Areas Served Tag Cloud */}
        <div className="mt-10 p-6 rounded-2xl bg-slate-100 border border-slate-200/80">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3">
            East London Neighbourhoods We Serve Daily:
          </h3>
          <div className="flex flex-wrap gap-2">
            {AREAS_SERVED.map((area) => (
              <span
                key={area}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        {/* Local Services Grid */}
        <div className="mt-14">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 text-center mb-8">
            Popular In-House Printing Services in East London
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOCAL_SERVICES.map((serv) => (
              <Link
                key={serv.name}
                href={serv.href}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-[#012169] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#012169] transition-colors">
                    {serv.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {serv.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#012169]">
                  <span>View specifications</span>
                  <ArrowRight weight="bold" className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* AEO Frequently Asked Questions */}
        <div className="mt-16">
          <AeoFaqSection
            title="East London Print Shop FAQs"
            subtitle="Everything you need to know about visiting 75 Green Street, order collection, turnaround times, and local parking."
            badge="Local East London Q&A"
            faqs={EAST_LONDON_FAQS}
          />
        </div>
      </div>
    </div>
  );
}
