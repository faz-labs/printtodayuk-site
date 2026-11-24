'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Envelope,
  ArrowRight,
  UploadSimple,
  FilePdf,
  CheckCircle,
  X,
  Clock,
  WhatsappLogo,
  SpinnerGap,
  WarningCircle,
  Paperclip,
  Truck,
  Storefront,
  ArrowSquareOut,
  LinkSimple,
} from '@phosphor-icons/react';
import { trackGenerateLead, trackEmailClick } from '@/lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_PRODUCTS = [
  'Flyers & Leaflets',
  'Business Cards',
  'Roller Banners',
  'Large Format Posters',
  'Signs & Foam Boards',
  'Document Printing',
  'Booklets & Brochures',
  'Custom T-Shirts / Workwear',
  'Stickers & Labels',
  'Other / Bespoke Item',
];

export function FeatureHighlights() {
  const [showUploadModal, setShowUploadModal] = useState(false);

  // WeTransfer Order Modal Form State
  const [weTransferUrl, setWeTransferUrl] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<'collection' | 'delivery'>('collection');
  const [urgency, setUrgency] = useState<'same_day' | 'next_day' | 'standard'>('same_day');
  const [notes, setNotes] = useState('');

  // Status & Progress State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenModal = () => {
    // 1. Open WeTransfer in a new tab so user can immediately drop files there
    try {
      window.open('https://wetransfer.com', '_blank', 'noopener,noreferrer');
    } catch {
      // In case browser popup blocker catches it, modal has a prominent manual button
    }
    // 2. Open modal on storefront so user can paste their WeTransfer link and email
    setShowUploadModal(true);
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!weTransferUrl.trim()) {
      setErrorMessage('Please paste your WeTransfer download link.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address so our team can communicate with you.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your contact phone number.');
      return;
    }
    if (!product.trim()) {
      setErrorMessage('Please select or specify the product you need.');
      return;
    }
    if (!quantity.trim()) {
      setErrorMessage('Please enter the required quantity.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress('Sending your order to artwork@printtodayuk.com...');

    try {
      // POST order details and WeTransfer link to /api/upload-order (No AWS upload)
      const orderRes = await fetch('/api/upload-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weTransferUrl: weTransferUrl.trim(),
          email: email.trim(),
          name: name.trim(),
          phone: phone.trim(),
          product: product.trim(),
          quantity: quantity.trim(),
          deliveryOption: deliveryOption === 'collection' ? 'Collect from E7 Studio (Free)' : 'London Courier Delivery',
          urgency: urgency === 'same_day' ? 'Same-Day Urgent' : urgency === 'next_day' ? 'Next Working Day' : 'Standard Turnaround',
          notes: notes.trim(),
        }),
      });

      if (!orderRes.ok) {
        const orderErr = await orderRes.json().catch(() => ({}));
        throw new Error(orderErr.error || 'Failed to submit order details to the studio.');
      }

      // Success confirmation & lead tracking
      setIsSubmitted(true);
      trackGenerateLead('wetransfer_upload_order', {
        product: product.trim(),
        quantity: quantity.trim(),
        deliveryOption,
      });
    } catch (err: any) {
      console.error('WeTransfer order submission error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred. Please use WhatsApp fallback below.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleResetModal = () => {
    setShowUploadModal(false);
    setTimeout(() => {
      setWeTransferUrl('');
      setName('');
      setPhone('');
      setEmail('');
      setProduct('');
      setQuantity('');
      setDeliveryOption('collection');
      setUrgency('same_day');
      setNotes('');
      setIsSubmitting(false);
      setIsSubmitted(false);
      setErrorMessage('');
      setUploadProgress('');
    }, 300);
  };

  const buildWhatsAppFallbackUrl = () => {
    const text = `Hi Print Today UK, I have artwork ready for printing.\n\n` +
      `👤 Name: ${name || 'Customer'}\n` +
      `📧 Email: ${email || 'Not provided'}\n` +
      `📞 Phone: ${phone || 'Not provided'}\n` +
      `📄 Product: ${product || 'Print order'}\n` +
      `🔢 Quantity: ${quantity || 'Not specified'}\n` +
      `📁 WeTransfer Link: ${weTransferUrl || 'Attached'}\n\n` +
      `Can I share my files and order details directly here?`;
    return `https://wa.me/447969559746?text=${encodeURIComponent(text)}`;
  };

  return (
    <section className="w-full bg-white border-y border-slate-200/80 shadow-2xs relative z-20 font-sans py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* 1. Eyebrow */}
        <p className="text-xs sm:text-[13px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-3 select-none flex items-center gap-2">
          <span>EAST LONDON PRODUCTION HUB &bull; OPEN 7 DAYS A WEEK</span>
        </p>

        {/* 2. Main Title with 'Signs' highlighted in cyan badge */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl">
          Express Same-Day Printing &amp;{' '}
          <span className="bg-[#A5F3FC]/80 text-slate-950 px-2 sm:px-2.5 py-0.5 rounded-sm inline-block shadow-2xs">
            Signs
          </span>{' '}
          London
        </h2>

        {/* 3. Phone & Email Bar */}
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap mt-5 text-sm sm:text-base font-bold text-slate-900">
          {/* Phone */}
          <a
            href="tel:03300103521"
            data-loc="hero"
            className="inline-flex items-center gap-2 hover:text-[#012169] transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 group-hover:bg-[#012169] text-white flex items-center justify-center shrink-0 transition-colors">
              <Phone weight="fill" className="h-3.5 w-3.5" />
            </div>
            <span>0330 010 3521</span>
          </a>

          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/447969559746?text=Hello%20Print%20Today%20UK%2C%20I%20have%20an%20urgent%20same-day%20print%20order."
            target="_blank"
            rel="noopener noreferrer"
            data-loc="hero"
            className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
              <WhatsappLogo weight="fill" className="h-4 w-4" />
            </div>
            <span className="font-bold">WhatsApp Instant Quote</span>
          </a>

          {/* Email */}
          <a
            href="mailto:artwork@printtodayuk.com"
            data-loc="hero"
            className="inline-flex items-center gap-2 hover:text-[#012169] transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 group-hover:bg-[#012169] text-white flex items-center justify-center shrink-0 transition-colors">
              <Envelope weight="fill" className="h-3.5 w-3.5" />
            </div>
            <span>artwork@printtodayuk.com</span>
          </a>
        </div>

        {/* 4. Small availability notice with confirmed hours */}
        <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-600 mt-2.5 font-medium">
          <Clock weight="bold" className="h-4 w-4 text-[#C8102E] shrink-0" />
          <span>
            <strong>Production Hours:</strong> Mon–Fri 7am–8pm &bull; Sat 8am–5pm &bull; Sun 8am–4pm (75 Green St, E7 8JF).
          </span>
        </div>

        {/* 5. Description paragraph with highlighted keywords */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-4xl">
          London’s dedicated <strong className="font-bold text-slate-900">in-house commercial print and signage facility</strong>. Specialising in{' '}
          <strong className="font-bold text-slate-900">
            urgent same-day{' '}
            <span className="text-sky-600 font-semibold">document printing</span>
          </strong>
          , business cards, flyers, exhibition signs, and <span className="text-sky-600 font-semibold">large format roller banners</span>. Collect free in person or choose{' '}
          <strong className="font-bold text-slate-900">express London courier delivery</strong> across Central and Greater London.
        </p>

        {/* 6. Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8 pt-1">
          {/* Button 1: Same-Day Turnaround — how it works */}
          <Link
            href="/same-day-printing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white font-bold text-sm sm:text-[15px] shadow-md hover:shadow-lg transition-all text-center group cursor-pointer"
          >
            <span>Same-Day Turnaround — How It Works</span>
            <ArrowRight weight="bold" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Button 2: Upload PDF & print now -> Opens full order modal */}
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 hover:border-[#012169] hover:text-[#012169] font-bold text-sm sm:text-[15px] shadow-xs transition-all text-center cursor-pointer"
          >
            <UploadSimple weight="bold" className="h-4 w-4" />
            <span>Upload PDF &amp; Print Now</span>
          </button>

          {/* Button 3: Email PDF — walk in 10 mins (Sends to artwork@printtodayuk.com) */}
          <a
            href="mailto:artwork@printtodayuk.com?subject=Print%20Artwork%20Submission%20-%20Print%20Today%20UK&body=Hi%20Print%20Today%20Team%2C%0A%0AI%20am%20sending%20over%20our%20PDF%20artwork%20for%20urgent%20same-day%20printing.%0A%0AOrder%20Details%3A%0A-%20Item%20Type%3A%20%0A-%20Quantity%3A%20%0A-%20Collection%20or%20Delivery%3A%20%0A-%20Phone%20Number%3A%20%0A%0AThank%20you!"
            data-loc="hero"
            onClick={() => trackEmailClick('artwork@printtodayuk.com', 'hero')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-800 font-bold text-sm sm:text-[15px] shadow-xs transition-all text-center cursor-pointer"
          >
            <FilePdf weight="bold" className="h-4 w-4 text-[#C8102E]" />
            <span>Email PDF — Collect In E7</span>
          </a>
        </div>
      </div>

      {/* Full Interactive P0-1 Upload Order Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-left font-sans my-8 max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={handleResetModal}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X weight="bold" className="h-5 w-5" />
              </button>

              {/* Success View */}
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <CheckCircle weight="fill" className="h-9 w-9" />
                  </div>

                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    WeTransfer Link &amp; Order Received!
                  </h3>
                  <p className="mt-3 text-base text-slate-700 font-semibold max-w-md mx-auto leading-relaxed">
                    Thank you! We have received your artwork link and dispatched your details to <strong className="text-slate-900">artwork@printtodayuk.com</strong>.
                  </p>

                  <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Customer Email:</span>
                      <strong className="text-[#012169] font-bold underline truncate max-w-[220px]">{email}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>WeTransfer Link:</span>
                      <span className="text-emerald-700 font-bold truncate max-w-[220px]">{weTransferUrl}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Customer Name:</span>
                      <strong className="text-slate-900 font-bold">{name}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Contact Phone:</span>
                      <strong className="text-slate-900 font-bold">{phone}</strong>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                      <span>Product:</span>
                      <strong className="text-slate-900 font-bold">{product} ({quantity} units)</strong>
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-500 max-w-md mx-auto">
                    Our London prepress studio will review your files and communicate with you directly at <strong className="text-slate-800">{email}</strong> to confirm your print run.
                  </p>

                  <div className="mt-6 flex flex-col gap-3 max-w-md mx-auto">
                    <a
                      href="tel:03300103521"
                      data-loc="hero"
                      className="w-full py-3.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Phone weight="fill" className="h-4 w-4 text-cyan-300" />
                      <span>Need Urgent Confirmation? Call 0330 010 3521</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleResetModal}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Done &amp; Close
                    </button>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#012169] text-xs font-bold border border-blue-100 mb-2">
                      <LinkSimple weight="bold" className="h-3.5 w-3.5 text-[#012169]" />
                      <span>WeTransfer Artwork Submission</span>
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Share Artwork via WeTransfer &amp; Order
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      Upload your ready-to-print files (PDF, AI, PSD up to 2GB free on WeTransfer), paste the link below with your email, and our studio will confirm your order.
                    </p>
                  </div>

                  {/* Step 1: Open WeTransfer Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/60 border border-blue-200/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#012169] text-white text-[11px] font-black flex items-center justify-center">1</span>
                          <span className="text-xs sm:text-sm font-black text-slate-900">Upload Files on WeTransfer</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Free up to 2GB &bull; No account required &bull; Click &apos;Get a link&apos;
                        </p>
                      </div>
                      <a
                        href="https://wetransfer.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
                      >
                        <span>Open WeTransfer</span>
                        <ArrowSquareOut weight="bold" className="h-3.5 w-3.5 text-cyan-300" />
                      </a>
                    </div>
                  </div>

                  {/* Step 2: WeTransfer Link Input */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#012169] text-white text-[11px] font-black flex items-center justify-center">2</span>
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Paste Your WeTransfer Link <span className="text-[#C8102E]">*</span>
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <LinkSimple weight="bold" className="h-4 w-4 text-emerald-600" />
                      </div>
                      <input
                        type="url"
                        required
                        value={weTransferUrl}
                        onChange={(e) => setWeTransferUrl(e.target.value)}
                        placeholder="e.g. https://we.tl/t-xxxxxxxx or https://wetransfer.com/downloads/..."
                        className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-semibold outline-hidden transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Customer Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Email Address <span className="text-[#C8102E]">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. david@company.com"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Our studio team will email proof confirmation and communicate with you directly at this address.
                    </p>
                  </div>

                  {/* Customer Name & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. David Smith"
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
                        placeholder="e.g. 07123 456789"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Product & Quantity Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Product Required <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        list="popular-products"
                        required
                        value={product}
                        onChange={(e) => setProduct(e.target.value)}
                        placeholder="e.g. Same-Day Flyers, Business Cards..."
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                      />
                      <datalist id="popular-products">
                        {POPULAR_PRODUCTS.map((prod) => (
                          <option key={prod} value={prod} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Quantity <span className="text-[#C8102E]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 250"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                      />
                    </div>
                  </div>

                  {/* Fulfilment & Urgency Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Fulfilment Method
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
                        Urgency Required
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

                  {/* Notes / Special Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Notes or Special Finishing (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Matt laminate, round corners, specific delivery deadline..."
                      className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 text-xs sm:text-sm text-slate-900 font-medium outline-hidden transition-all bg-white"
                    />
                  </div>

                  {/* Error state & WhatsApp fallback */}
                  {errorMessage && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold">
                        <WarningCircle weight="fill" className="h-4 w-4 shrink-0 text-[#C8102E]" />
                        <span>{errorMessage}</span>
                      </div>
                      <p className="text-[11px] text-rose-700">
                        Don&apos;t worry — you can send your artwork directly to our production desk on WhatsApp:
                      </p>
                      <a
                        href={buildWhatsAppFallbackUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 py-2 px-3 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-xs transition-all"
                      >
                        <WhatsappLogo weight="fill" className="h-4 w-4" />
                        <span>Send via WhatsApp Instead</span>
                      </a>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-13 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-[#012169]/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <SpinnerGap weight="bold" className="h-5 w-5 animate-spin" />
                          <span>{uploadProgress || 'Processing Order...'}</span>
                        </>
                      ) : (
                        <>
                          <LinkSimple weight="bold" className="h-5 w-5" />
                          <span>Submit WeTransfer Link &amp; Order</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2">
                      Zero payment required now &bull; We inspect your artwork and confirm production first.
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
