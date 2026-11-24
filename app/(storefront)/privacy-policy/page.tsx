import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, LockKey, EnvelopeSimple, Phone, MapPin } from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Privacy Policy | Print Today UK',
  description:
    'Our UK GDPR-compliant Privacy Policy explaining how Print Today UK collects, protects, uses, and retains customer details and artwork files.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#fbfcfd] min-h-screen py-10 sm:py-16 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#012169] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Privacy Policy</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60 mb-4">
            <ShieldCheck weight="fill" className="h-4 w-4 text-emerald-600" />
            <span>UK GDPR &amp; Data Protection Act 2018 Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Last Updated: November 2026. Print Today UK (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy and treating your personal data with utmost transparency and security.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">1.</span> Who We Are (Data Controller)
            </h2>
            <p>
              Print Today UK operates the commercial printing facility located at <strong>75 Green Street, London, E7 8JF, United Kingdom</strong>. For the purposes of the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018, Print Today UK is the Data Controller responsible for your personal data.
            </p>
            <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-600 space-y-1">
              <p><strong>Hotline:</strong> 0330 010 3521</p>
              <p><strong>Studio WhatsApp / Mobile:</strong> +44 7969 559746</p>
              <p><strong>Email:</strong> artwork@printtodayuk.com</p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">2.</span> What Information We Collect
            </h2>
            <p>We only collect information necessary to fulfill print quotes, process orders, and provide customer support:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong>Contact Information:</strong> Full name, telephone number, and email address.</li>
              <li><strong>Delivery Information:</strong> Physical shipping address, postcode, and delivery instructions (for courier dispatch).</li>
              <li><strong>Order &amp; Artwork Data:</strong> Selected product specifications (quantities, dimensions, paper stocks) and uploaded graphic artwork files (PDF, JPG, PNG, AI, EPS).</li>
              <li><strong>Communication Records:</strong> Enquiries, quote correspondence, and email/WhatsApp messages.</li>
              <li><strong>Technical Data:</strong> Anonymised analytics (e.g., page views, link clicks) collected via Google Analytics (GA4) and Google Ads conversion tags.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">3.</span> How We Use Your Data &amp; Legal Basis
            </h2>
            <p>We process your personal information under the following legal bases:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong>Performance of a Contract:</strong> To manufacture your printed items, carry out digital prepress proofing, provide quotes, arrange courier dispatch or in-store collection, and notify you when orders are ready.</li>
              <li><strong>Legitimate Interests:</strong> To improve our printing website, prevent fraudulent orders, and provide responsive customer service.</li>
              <li><strong>Legal Compliance:</strong> To maintain standard financial, tax, and invoicing records as required by HMRC and UK company laws.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">4.</span> Artwork Storage &amp; Security
            </h2>
            <p>
              Uploaded print artwork is transferred directly to private Amazon Web Services (AWS S3) cloud storage using secure 256-bit TLS encryption and restricted presigned access. Artwork files are accessible exclusively by our authorised prepress technicians.
            </p>
            <p className="mt-2">
              We never sell, rent, license, or share your proprietary design files, logos, or customer lists with external marketing agencies or third parties.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">5.</span> Data Retention Period
            </h2>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong>Uploaded Artwork Files:</strong> Retained for <strong>30 days</strong> from submission to accommodate re-orders and print corrections, after which files are automatically purged from active storage.</li>
              <li><strong>Inquiry &amp; Quote Records:</strong> Retained for up to 12 months for customer service continuity.</li>
              <li><strong>Accounting &amp; Invoicing Records:</strong> Retained for 6 years in accordance with statutory UK tax regulations (HMRC).</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">6.</span> Your UK GDPR Rights
            </h2>
            <p>Under UK data protection law, you have rights including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li><strong>Right of Access:</strong> You can ask for copies of your personal information.</li>
              <li><strong>Right to Rectification:</strong> You can ask us to rectify inaccurate or incomplete information.</li>
              <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You can request that we delete your personal details and artwork files.</li>
              <li><strong>Right to Restriction &amp; Objection:</strong> You can object to processing or ask us to restrict how your data is used.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact our privacy desk at <strong>artwork@printtodayuk.com</strong> or call <strong>0330 010 3521</strong>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="pt-4 border-t border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-[#012169]">7.</span> Contact &amp; Complaints
            </h2>
            <p>
              If you have any questions about this policy or our data practices, please reach out to:
            </p>
            <div className="mt-3 p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs sm:text-sm text-slate-800 space-y-1">
              <p><strong>Print Today UK Data Protection Desk</strong></p>
              <p>75 Green Street, London, E7 8JF</p>
              <p>Email: artwork@printtodayuk.com | Phone: 0330 010 3521</p>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              You also have the right to lodge a complaint with the UK Information Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="underline font-bold text-slate-700">ico.org.uk</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
