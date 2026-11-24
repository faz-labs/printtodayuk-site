'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  WhatsappLogo,
  CheckCircle,
  Clock,
  Sparkle,
  Truck,
  Storefront,
  ShieldCheck,
  SpinnerGap,
  WarningCircle,
  MapPin,
  ArrowRight,
} from '@phosphor-icons/react';
import { trackGenerateLead } from '@/lib/analytics';

const POPULAR_PRODUCTS = [
  'Flyers & Leaflets',
  'Business Cards',
  'Standard Roller Banners',
  'Large Format Posters (A2/A1/A0)',
  'Foam Boards & Signs (Foamex/Correx)',
  'Document Printing & Wire Binding',
  'Stapled Booklets & Brochures',
  'Custom T-Shirts & DTF Workwear',
  'Contour Cut Vinyl Stickers',
  'Bespoke / Multi-Item Order',
];

export default function QuotePage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'collection' | 'delivery'>('collection');
  const [urgency, setUrgency] = useState<'same_day' | 'next_day' | 'standard'>('same_day');
  const [details, setDetails] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter a valid UK phone number.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!product.trim()) {
      setErrorMessage('Please select or specify the product you need.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullContext = `${product.trim()}${quantity.trim() ? ` (${quantity.trim()} units)` : ''} [${
        urgency === 'same_day' ? 'Same-Day Urgent' : urgency === 'next_day' ? 'Next Day' : 'Standard'
      }, ${deliveryOption === 'collection' ? 'Collection E7' : 'London Courier'}]`;

      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          productContext: fullContext,
          selectedOptions: {
            'Product': product.trim(),
            'Quantity': quantity.trim() || 'Custom',
            'Urgency': urgency,
            'Fulfilment': deliveryOption,
          },
          details: details.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit quote inquiry. Please try again or call us.');
      }

      setIsSubmitted(true);
      trackGenerateLead('quote_page', {
        product: product.trim(),
        quantity: quantity.trim(),
        urgency,
      });
    } catch (err: any) {
      console.error('Quote submission error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please contact our team directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fbfcfd] min-h-screen py-10 sm:py-16 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-[#012169] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-bold">Request a Quote</span>
        </nav>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#012169]/10 via-[#C8102E]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-black text-[#012169] mb-4">
              <Sparkle weight="fill" className="h-4 w-4 text-[#C8102E]" />
              <span>Fast 15-Minute Studio Response &bull; In-House London Hub</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Instant Print Quote &amp; Trade Pricing
            </h1>

            <p className="mt-3 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed">
              Tell us what you need printed. Our London prepress specialists will review your requirements, calculate bespoke tiered pricing, and call or email you with full specifications.
            </p>

            {/* Direct hotline & WhatsApp badges */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm font-bold">
              <a
                href="tel:03300103521"
                data-loc="quote_page"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-[#012169] text-white transition-colors"
              >
                <Phone weight="fill" className="h-4 w-4 text-cyan-300" />
                <span>Call Hotline: 0330 010 3521</span>
              </a>

              <a
                href="https://wa.me/447969559746?text=Hi%20Print%20Today%20UK%2C%20I%20would%20like%20to%20request%20an%20instant%20quote."
                target="_blank"
                rel="noopener noreferrer"
                data-loc="quote_page"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors shadow-xs"
              >
                <WhatsappLogo weight="fill" className="h-4 w-4" />
                <span>WhatsApp Instant Quote (+44 7969 559746)</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Grid: Form + Trust Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Form or Success */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle weight="fill" className="h-9 w-9" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Quote Request Received!
                  </h2>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto">
                    We received your inquiry for <strong>{product}</strong>. A London print specialist will call you at <strong>{phone}</strong> within 15 minutes during opening hours.
                  </p>

                  <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs max-w-md mx-auto space-y-1.5">
                    <p><strong>Customer:</strong> {name}</p>
                    <p><strong>Phone:</strong> {phone}</p>
                    <p><strong>Email:</strong> {email}</p>
                    <p><strong>Urgency:</strong> {urgency === 'same_day' ? 'Same-Day Urgent' : urgency === 'next_day' ? 'Next Working Day' : 'Standard'}</p>
                    <p><strong>Fulfilment:</strong> {deliveryOption === 'collection' ? 'Collection E7 (Free)' : 'London Courier Delivery'}</p>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href="tel:03300103521"
                      data-loc="quote_page"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Phone weight="fill" className="h-4 w-4 text-cyan-300" />
                      <span>Need It Faster? Call 0330 010 3521</span>
                    </a>
                    <Link
                      href="/"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors text-center"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-black text-slate-900">
                    Complete Your Quote Request
                  </h2>

                  {/* Customer details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Full Name <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone Number <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 07912 345678"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-[#C8102E]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. sarah@business.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                    />
                  </div>

                  {/* Product & Quantity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Product or Service <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        list="quote-products"
                        required
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        placeholder="e.g. Same-Day Flyers, Roller Banners..."
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                      />
                      <datalist id="quote-products">
                        {POPULAR_PRODUCTS.map((p) => (
                          <option key={p} value={p} />
                        ))}
                      </datalist>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Quantity Required
                      </label>
                      <input
                        type="text"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Fulfilment & Urgency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Collection or Delivery
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeliveryOption('collection')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            deliveryOption === 'collection'
                              ? 'bg-[#012169] text-white border-[#012169] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Storefront weight="bold" className="h-4 w-4 shrink-0" />
                          <span>Collect E7 (Free)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeliveryOption('delivery')}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            deliveryOption === 'delivery'
                              ? 'bg-[#012169] text-white border-[#012169] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Truck weight="bold" className="h-4 w-4 shrink-0" />
                          <span>London Courier</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Turnaround Needed
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setUrgency('same_day')}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                            urgency === 'same_day'
                              ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Same Day
                        </button>
                        <button
                          type="button"
                          onClick={() => setUrgency('next_day')}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                            urgency === 'next_day'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Next Day
                        </button>
                        <button
                          type="button"
                          onClick={() => setUrgency('standard')}
                          className={`py-2 px-1 rounded-xl text-[11px] font-bold text-center border transition-all cursor-pointer ${
                            urgency === 'standard'
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Standard
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes / Details */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Project Specifications or Dimensions (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="e.g. A5 double-sided, 300gsm silk, need delivered by 4pm today..."
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <WarningCircle weight="fill" className="h-4 w-4 shrink-0 text-[#C8102E]" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-13 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-[#012169]/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <SpinnerGap weight="bold" className="h-5 w-5 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Quote Request</span>
                        <ArrowRight weight="bold" className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-slate-400 text-center">
                    No obligation &bull; Free prepress file check included with every quote.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Right Col: Trust & Studio Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                East London Studio
              </h3>

              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin weight="fill" className="h-4 w-4 text-[#C8102E] shrink-0 mt-0.5" />
                  <div>
                    <strong>75 Green Street, London, E7 8JF</strong>
                    <p className="text-[11px] text-slate-500 mt-0.5">Forest Gate / Upton Park, East London</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock weight="fill" className="h-4 w-4 text-[#012169] shrink-0 mt-0.5" />
                  <div>
                    <strong>Production Hours:</strong>
                    <p className="text-[11px] text-slate-500">Mon–Fri: 7:00 AM – 8:00 PM</p>
                    <p className="text-[11px] text-slate-500">Sat: 8:00 AM – 5:00 PM</p>
                    <p className="text-[11px] text-slate-500">Sun: 8:00 AM – 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#012169] to-[#0B2559] text-white rounded-3xl p-6 shadow-md space-y-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-cyan-300">
                <ShieldCheck weight="fill" className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-black">Trade Quality Guarantee</h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                Industrial Xerox digital presses, Mimaki wide-format UV printing, and in-house DTF apparel production.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
