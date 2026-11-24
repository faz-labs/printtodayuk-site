import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, Clock, CurrencyGbp, Truck, CheckCircle } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Print Today UK',
  description:
    'Terms of service, same-day production guidelines, artwork specifications, cancellation, and payment policies for Print Today UK.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="bg-[#fbfcfd] min-h-screen py-10 sm:py-16 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#012169] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Terms &amp; Conditions</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#012169] text-xs font-bold border border-blue-200/60 mb-4">
            <FileText weight="fill" className="h-4 w-4" />
            <span>Commercial Print &amp; Retail Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Please read these terms and conditions carefully before placing an order with Print Today UK (75 Green Street, London, E7 8JF). By placing an order, requesting a quote, or supplying artwork, you agree to be bound by these terms.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">1.</span> Orders &amp; Quotations
            </h2>
            <p>
              All quotations provided online, over the phone (0330 010 3521), via WhatsApp (+44 7969 559746), or by email are valid for 14 days unless stated otherwise. A contract is formed once we receive written or digital order confirmation, approved artwork, and agreed payment terms.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">2.</span> Artwork Specifications &amp; Proof Approval
            </h2>
            <p>
              The customer is responsible for ensuring that supplied artwork complies with commercial production standards:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong>Resolution:</strong> Images should be minimum 300 DPI at 100% final output size.</li>
              <li><strong>Colour Mode:</strong> CMYK colour profile. RGB or Pantone spot colours will be converted automatically, which may result in slight colour variance.</li>
              <li><strong>Bleed &amp; Margins:</strong> 3mm bleed on all trimmed edges and a minimum 3mm quiet safety zone from the cut line.</li>
              <li><strong>Approval:</strong> Digital proofs must be approved before printing commences. Print Today UK is not liable for typographical errors, spelling mistakes, or layout discrepancies present in customer-approved artwork.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">3.</span> Same-Day Turnaround &amp; Cutoff Times
            </h2>
            <p>
              Same-day printing services require artwork approval and payment confirmation before <strong>12:00 PM (Midday)</strong> Monday through Friday, unless an express out-of-hours arrangement has been confirmed in writing. Orders submitted after cutoff will be scheduled for the following production working day.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">4.</span> Fulfilment: Collection &amp; Courier Delivery
            </h2>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong>Collection:</strong> Orders marked for collection can be picked up free of charge from our London hub at 75 Green Street, E7 8JF during studio opening hours.</li>
              <li><strong>London Courier Delivery:</strong> Courier deliveries are executed via point-to-point same-day couriers or standard national couriers (DPD / Royal Mail). While we make every endeavor to meet delivery windows, Print Today UK is not liable for third-party courier delays caused by extreme traffic, road closures, or adverse weather conditions.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">5.</span> Pricing &amp; Value Added Tax (VAT)
            </h2>
            <p>
              Prices shown on matrix grids are displayed ex-VAT by default, with an optional toggle to show inclusive of 20% UK VAT. Certain printed matter (such as flyers, leaflets, and booklets) may qualify for zero-rating (0% VAT) under HMRC Notice 701/10, provided they meet statutory criteria (e.g., non-interactive, non-writable).
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">6.</span> Cancellations &amp; Bespoke Goods Policy
            </h2>
            <p>
              In accordance with the <strong>Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013</strong>, custom manufactured, personalised, or bespoke printed items cannot be cancelled or returned once production (ripping, platemaking, or printing) has commenced.
            </p>
            <p className="mt-2">
              If a product suffers from a verified manufacturing defect or damage in transit, notification must be given within 48 hours of receipt. Verified defects will be promptly reprinted and dispatched at our expense.
            </p>
          </section>

          {/* Section 7 */}
          <section className="pt-4 border-t border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">7.</span> Governing Law &amp; Contact
            </h2>
            <p>
              These Terms and Conditions are governed by and construed in accordance with the laws of <strong>England and Wales</strong>, and both parties submit to the exclusive jurisdiction of the English courts.
            </p>
            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-1">
              <p><strong>Print Today UK</strong></p>
              <p>75 Green Street, London, E7 8JF, United Kingdom</p>
              <p>Hotline: 0330 010 3521 | WhatsApp: +44 7969 559746 | Email: sales@printtodayuk.com</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
