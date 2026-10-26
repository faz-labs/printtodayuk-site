import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  EnvelopeSimple,
  Clock,
  WhatsappLogo,
  ArrowRight,
  ShieldCheck,
  Lightning,
  Train,
  NavigationArrow,
} from '@phosphor-icons/react/dist/ssr';
import { ContactForm } from '@/components/storefront/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Print Today UK - London Studio & Express Print Hub',
  description:
    'Visit Print Today UK at 75 Green Street, E7 8JF London or contact our studio for instant quotes, same-day printing, custom clothing, and commercial printing orders.',
  openGraph: {
    title: 'Contact Print Today UK - East London Studio',
    description:
      '75 Green Street, E7 8JF London. Call 0330 010 3521 or WhatsApp +44 7969 559746 for instant print quotes and express collections.',
  },
};

export default function ContactUsPage() {
  const googleMapsUrl =
    'https://www.google.com/maps/search/?api=1&query=75+Green+Street,+E7+8JF,+London,+United+Kingdom';
  const embedMapsUrl =
    'https://maps.google.com/maps?q=75+Green+Street,+E7+8JF,+London,+United+Kingdom&t=&z=16&ie=UTF8&iwloc=&output=embed';

  return (
    <div className="bg-[#fbfcfd] min-h-screen py-10 sm:py-14 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#012169] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Contact Us</span>
        </nav>

        {/* Page Header Banner */}
        <div className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-black uppercase tracking-wider mb-3">
            <Lightning weight="fill" className="h-4 w-4 text-[#C8102E]" />
            <span>London Studio &amp; Express Print Facility</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Get in Touch with <span className="text-[#012169]">Print Today UK</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Have a question about a print run, custom finish, or rush order? Visit our East London production hub, call our hotline, or send us a message below. All web submissions go straight to{' '}
            <strong className="text-slate-900">sales@printtodayuk.com</strong>.
          </p>
        </div>

        {/* Quick Contact Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {/* Studio Address */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#012169] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-red-50 text-[#C8102E] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MapPin weight="fill" className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                Studio Address
              </h3>
              <p className="text-sm font-bold text-slate-900 leading-snug">
                75 Green Street, E7 8JF<br />
                London, United Kingdom
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#012169] group-hover:underline">
              <span>View on Maps</span>
              <ArrowRight weight="bold" className="h-3 w-3" />
            </span>
          </a>

          {/* Hotline Phone */}
          <a
            href="tel:03300103521"
            className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#012169] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#012169] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Phone weight="fill" className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                Telephone Hotline
              </h3>
              <p className="text-base font-black text-slate-900">
                0330 010 3521
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-tight">
                Mon–Fri 7am–8pm · Sat 10–6 · Sun 10–4
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#012169] group-hover:underline">
              <span>Call Studio Direct</span>
              <ArrowRight weight="bold" className="h-3 w-3" />
            </span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/447969559746?text=Hello%20Print%20Today%20UK%2C%20I%20have%20an%20urgent%20print%20enquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#25D366] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#25D366] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <WhatsappLogo weight="fill" className="h-6 w-6" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                WhatsApp Urgent Desk
              </h3>
              <p className="text-base font-black text-slate-900">
                +44 7969 559746
              </p>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                Fastest Response &amp; File Proofing
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#25D366] group-hover:underline">
              <span>Open WhatsApp Chat</span>
              <ArrowRight weight="bold" className="h-3 w-3" />
            </span>
          </a>

          {/* Sales Email */}
          <a
            href="mailto:sales@printtodayuk.com"
            className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#012169] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-slate-100 text-[#012169] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <EnvelopeSimple weight="fill" className="h-5 w-5" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                Sales &amp; Quotations
              </h3>
              <p className="text-sm font-black text-slate-900 truncate">
                sales@printtodayuk.com
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct Prepress &amp; Trade Inquiries
              </p>
            </div>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#012169] group-hover:underline">
              <span>Send Direct Email</span>
              <ArrowRight weight="bold" className="h-3 w-3" />
            </span>
          </a>
        </div>

        {/* Main 2-Column Section: Form (Left) & Studio Map / Details (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Left Column: Interactive Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Right Column: Studio Map & Visiting Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Studio Map Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xl shadow-slate-200/50 space-y-4 overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-red-50 text-[#C8102E] flex items-center justify-center">
                    <MapPin weight="fill" className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">
                      Studio Location
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      75 Green Street, E7 8JF London
                    </p>
                  </div>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#012169] text-white text-xs font-bold hover:bg-[#0A358C] transition-colors shadow-2xs"
                >
                  <NavigationArrow weight="fill" className="h-3.5 w-3.5" />
                  <span>Directions</span>
                </a>
              </div>

              {/* Embedded Google Map Iframe */}
              <div className="w-full h-72 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100">
                <iframe
                  title="Print Today UK Studio Map - 75 Green Street, London"
                  src={embedMapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>

              {/* Transit & Visiting Guide */}
              <div className="space-y-3 pt-2 text-xs text-slate-600">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Train weight="bold" className="h-4 w-4 text-[#012169] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Public Transport Links:</strong>
                    <span>
                      Upton Park Station (District / Hammersmith &amp; City lines) · Forest Gate Station (Elizabeth line). Several buses stop directly along Green Street.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <Clock weight="bold" className="h-4 w-4 text-[#012169] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block font-bold">Studio Opening Hours:</strong>
                    <span className="block text-slate-700 font-medium">Monday – Friday: 7:00 AM – 8:00 PM</span>
                    <span className="block text-slate-700 font-medium">Saturday: 10:00 AM – 6:00 PM</span>
                    <span className="block text-slate-700 font-medium">Sunday: 10:00 AM – 4:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Consultation Callout Box */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-[#012169] to-[#0d3b66] text-white space-y-3 shadow-xl">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                <ShieldCheck weight="fill" className="h-4 w-4" />
                <span>Trade &amp; Agency Accounts</span>
              </span>
              <h4 className="text-lg font-black tracking-tight leading-snug">
                Need White-Label Print or Ongoing Commercial Terms?
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                We provide exclusive reseller discounts, dedicated account managers, and confidential unbranded packaging for UK design studios and agencies.
              </p>
              <div className="pt-2">
                <a
                  href="mailto:sales@printtodayuk.com?subject=Trade%20Account%20Enquiry%20-%20Print%20Today%20UK"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#012169] text-xs font-black hover:bg-slate-100 transition-colors shadow-sm"
                >
                  <span>Apply for Trade Account</span>
                  <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
