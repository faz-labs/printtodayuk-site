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

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 my-auto text-slate-800"
          >
            {/* Top British Ribbon Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-[#012169] via-[#C8102E] to-[#012169]" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer z-10"
              aria-label="Close Notice"
            >
              <X weight="bold" className="h-4 w-4" />
            </button>

            <div className="p-6 sm:p-7">
              {/* Status Header Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200/80 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                  <span>Website Upgrade in Progress</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/70">
                  <CheckCircle weight="fill" className="h-3 w-3 text-emerald-600" />
                  <span>Studio Fully Open</span>
                </span>
              </div>

              {/* Main Headline */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Our Website is Under Construction, but{' '}
                <span className="text-[#012169] underline decoration-[#C8102E] decoration-2 underline-offset-4">
                  Our Business is Fully Running!
                </span>
              </h2>

              {/* Informative Body */}
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                We are currently modernising our online checkout experience. In the meantime,{' '}
                <strong className="text-slate-800">our London print presses are running daily</strong>{' '}
                with express same-day dispatch and studio collections.
              </p>

              {/* Call-to-Action Highlights Box */}
              <div className="mt-5 space-y-2.5">
                {/* 1. WhatsApp Button (Primary green action) */}
                <a
                  href="https://wa.me/447969559746?text=Hello%20Print%20Today%20UK%2C%20I%20have%20an%20urgent%20print%20enquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-full p-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-between shadow-lg shadow-[#25D366]/25 transition-all transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <WhatsappLogo weight="fill" className="h-6 w-6 text-white drop-shadow-xs" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                        Fastest Response
                      </div>
                      <div className="text-sm font-black text-white">
                        WhatsApp Us: +44 7969 559746
                      </div>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform shrink-0">
                    <ArrowRight weight="bold" className="h-4 w-4" />
                  </div>
                </a>

                {/* 2. Phone Hotline Button */}
                <a
                  href="tel:03300103521"
                  className="group w-full p-3.5 rounded-2xl bg-[#012169] hover:bg-[#0A358C] text-white flex items-center justify-between shadow-lg shadow-[#012169]/20 transition-all transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Phone weight="fill" className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-200">
                        Telephone Orders &amp; Hotline
                      </div>
                      <div className="text-sm font-black text-white">
                        Call 0330 010 3521
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-blue-200 text-right hidden sm:block">
                    Mon–Sat 9am–7pm
                  </div>
                </a>
              </div>

              {/* Secondary Options */}
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={handleRequestCallback}
                  className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkle weight="fill" className="h-3.5 w-3.5 text-amber-500" />
                  <span>Request Instant Callback</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Browse Catalogue &amp; Prices
                </button>
              </div>

              {/* Studio Address Note */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
                <MapPin weight="fill" className="h-3.5 w-3.5 text-[#C8102E] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-700">Studio Location:</strong> 75 Green Street, E7 8JF, London, United Kingdom (Walk-ins &amp; express collections welcome).
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
