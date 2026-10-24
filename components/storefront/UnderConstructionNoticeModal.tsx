'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WhatsappLogo,
  Phone,
  X,
  MapPin,
  Sparkle,
  ArrowRight,
  CheckCircle,
} from '@phosphor-icons/react';
import { useCallMe } from './CallMeContext';

export function UnderConstructionNoticeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { openCallMe } = useCallMe();

  useEffect(() => {
    // Check if dismissed in this session
    try {
      const dismissed = sessionStorage.getItem('pt_under_construction_dismissed');
      if (!dismissed) {
        // Small delay for smooth entrance transition after landing
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    } catch {
      // Fallback if sessionStorage is unavailable
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('pt_under_construction_dismissed', 'true');
    } catch {
      // Ignore
    }
    setIsOpen(false);
  };

  const handleRequestCallback = () => {
    handleDismiss();
    openCallMe('Under Construction Site Inquiry');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity"
          />

          {/* Modal Card - Wider and bigger */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
            className="relative w-full max-w-2xl sm:max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-slate-900/10 overflow-hidden z-10 my-auto text-black"
          >
            {/* Top British Ribbon Bar */}
            <div className="h-3 w-full bg-gradient-to-r from-[#012169] via-[#C8102E] to-[#012169]" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-black transition-colors cursor-pointer z-10"
              aria-label="Close Notice"
            >
              <X weight="bold" className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8 md:p-10">
              {/* Status Header Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/90 text-black text-xs sm:text-sm font-extrabold border border-amber-300 shadow-xs">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600" />
                  </span>
                  <span>Website Upgrade in Progress</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-black bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-300">
                  <CheckCircle weight="fill" className="h-4 w-4 text-emerald-700" />
                  <span>Studio Fully Open &amp; Printing</span>
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-tight leading-snug">
                Our Website is Under Construction, but{' '}
                <span className="text-[#012169] underline decoration-[#C8102E] decoration-4 underline-offset-6">
                  Our Business is Fully Running!
                </span>
              </h2>

              {/* Informative Body - 16px (text-base) in high-contrast black */}
              <p className="mt-4 text-base sm:text-lg text-black font-medium leading-relaxed">
                We are currently modernising our online checkout experience to serve you better. In the meantime,{' '}
                <strong className="font-black text-black underline decoration-slate-300 underline-offset-2">
                  our London production hub and print presses are running daily
                </strong>{' '}
                with express same-day dispatch and studio collections.
              </p>

              {/* Call-to-Action Highlights Box */}
              <div className="mt-6 space-y-3">
                {/* 1. WhatsApp Button (Primary green action) */}
                <a
                  href="https://wa.me/447969559746?text=Hello%20Print%20Today%20UK%2C%20I%20have%20an%20urgent%20print%20enquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full p-4 sm:p-5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-between shadow-xl shadow-[#25D366]/30 transition-all transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                      <WhatsappLogo weight="fill" className="h-7 w-7 text-white drop-shadow-sm" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-100">
                        Fastest Response · Instant Quotes
                      </div>
                      <div className="text-base sm:text-xl font-black text-white">
                        WhatsApp Us: +44 7969 559746
                      </div>
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1.5 transition-transform shrink-0">
                    <ArrowRight weight="bold" className="h-5 w-5" />
                  </div>
                </a>

                {/* 2. Phone Hotline Button */}
                <a
                  href="tel:03300103521"
                  className="group w-full p-4 sm:p-5 rounded-2xl bg-[#012169] hover:bg-[#0A358C] text-white flex items-center justify-between shadow-xl shadow-[#012169]/25 transition-all transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                      <Phone weight="fill" className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-200">
                        Telephone Orders &amp; Hotline
                      </div>
                      <div className="text-base sm:text-xl font-black text-white">
                        Call 0330 010 3521
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-200 text-right font-medium hidden sm:block">
                    Mon–Sat 9am–7pm
                  </div>
                </a>
              </div>

              {/* Secondary Options */}
              <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleRequestCallback}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-sm sm:text-base font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Sparkle weight="fill" className="h-4 w-4 text-amber-400" />
                  <span>Request Instant Callback</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl border-2 border-black bg-white text-black text-sm sm:text-base font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Browse Catalogue &amp; Prices
                </button>
              </div>

              {/* Studio Address Note - 16px font and black */}
              <div className="mt-5 pt-4 border-t-2 border-slate-200 flex items-start gap-2.5 text-sm sm:text-base text-black font-medium">
                <MapPin weight="fill" className="h-5 w-5 text-[#C8102E] shrink-0 mt-0.5" />
                <span>
                  <strong className="font-black text-black">Studio Location:</strong> 75 Green Street, E7 8JF, London, United Kingdom (Walk-ins &amp; express same-day collections welcome).
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
