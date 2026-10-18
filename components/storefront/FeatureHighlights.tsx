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
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';

export function FeatureHighlights() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setShowUploadModal(true);
    }
  };

  return (
    <section className="w-full bg-white border-y border-slate-200/80 shadow-2xs relative z-20 font-sans py-12 sm:py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* 1. Eyebrow */}
        <p className="text-xs sm:text-[13px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-3 select-none">
          LONDON &bull; OPEN 24 HOURS, 7 DAYS A WEEK
        </p>

        {/* 2. Main Title with 'Signs' highlighted in cyan badge */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl">
          24 Hour &amp; Same-Day Printing &amp;{' '}
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
            className="inline-flex items-center gap-2 hover:text-[#012169] transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 group-hover:bg-[#012169] text-white flex items-center justify-center shrink-0 transition-colors">
              <Phone weight="fill" className="h-3.5 w-3.5" />
            </div>
            <span>0330 010 3521</span>
          </a>

          {/* Email */}
          <a
            href="mailto:artwork@printtodayuk.com"
            className="inline-flex items-center gap-2 hover:text-[#012169] transition-colors group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 group-hover:bg-[#012169] text-white flex items-center justify-center shrink-0 transition-colors">
              <Envelope weight="fill" className="h-3.5 w-3.5" />
            </div>
            <span>artwork@printtodayuk.com</span>
          </a>
        </div>

        {/* 4. Small availability notice */}
        <p className="text-xs sm:text-[13px] text-slate-500 mt-2 font-medium">
          Open 24 hours, 7 days a week — call or email and we will tell you what is possible today.
        </p>

        {/* 5. Description paragraph with highlighted keywords */}
        <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed max-w-4xl">
          London’s <strong className="font-bold text-slate-900">24/7 print, signage and display</strong> production, made in our own facility. Specialising in{' '}
          <strong className="font-bold text-slate-900">
            urgent same-day{' '}
            <span className="text-sky-500 font-semibold">document printing</span>
          </strong>
          , exhibition signs and <span className="text-sky-500 font-semibold">large format</span> banners, with{' '}
          <strong className="font-bold text-slate-900">express 1-hour courier delivery</strong> across Central London and same-day or overnight delivery across London.
        </p>

        {/* 6. Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-8 pt-1">
          {/* Button 1: Open 24 hours — how it works → (Navy blue from second image) */}
          <Link
            href="/same-day-printing"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white font-bold text-sm sm:text-[15px] shadow-md hover:shadow-lg transition-all text-center group cursor-pointer"
          >
            <span>Open 24 hours — how it works</span>
            <ArrowRight weight="bold" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Button 2: Upload PDF & print now */}
          <button
            type="button"
            onClick={handleUploadClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-900 hover:border-[#012169] hover:text-[#012169] font-bold text-sm sm:text-[15px] shadow-xs transition-all text-center cursor-pointer"
          >
            <UploadSimple weight="bold" className="h-4 w-4" />
            <span>Upload PDF &amp; print now</span>
          </button>

          {/* Hidden file input for direct PDF selection */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Button 3: Email PDF — walk in 10 mins (Sends to artwork@printtodayuk.com) */}
          <a
            href="mailto:artwork@printtodayuk.com?subject=Print%20Artwork%20Submission%20-%20Print%20Today%20UK&body=Hi%20Print%20Today%20Team%2C%0A%0AI%20am%20sending%20over%20our%20PDF%20artwork%20for%20urgent%20same-day%20printing.%0A%0AOrder%20Details%3A%0A-%20Item%20Type%3A%20%0A-%20Quantity%3A%20%0A-%20Collection%20or%20Delivery%3A%20%0A-%20Phone%20Number%3A%20%0A%0AThank%20you!"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-slate-800 font-bold text-sm sm:text-[15px] shadow-xs transition-all text-center cursor-pointer"
          >
            <FilePdf weight="bold" className="h-4 w-4 text-[#C8102E]" />
            <span>Email PDF — walk in 10 mins</span>
          </a>
        </div>
      </div>

      {/* Upload Confirmation Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-center font-sans"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute right-3.5 top-3.5 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X weight="bold" className="h-5 w-5" />
              </button>

              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle weight="fill" className="h-6 w-6" />
              </div>

              <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                PDF Selected for Printing
              </h4>
              <p className="mt-2 text-sm text-slate-600 font-medium">
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md inline-block max-w-full truncate">
                  {selectedFileName}
                </span>
              </p>
              <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                Click below to send this artwork directly to our London prepress studio at{' '}
                <strong className="text-slate-800">artwork@printtodayuk.com</strong>.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href={`mailto:artwork@printtodayuk.com?subject=Print%20Artwork%20Submission%3A%20${encodeURIComponent(
                    selectedFileName || 'Artwork'
                  )}&body=Hi%20Print%20Today%20Team%2C%0A%0APlease%20find%20attached%20our%20artwork%20(${encodeURIComponent(
                    selectedFileName || 'file'
                  )})%20for%20urgent%20printing.%0A%0AOrder%20Details%3A%0A-%20Item%20Type%3A%20%0A-%20Quantity%3A%20%0A-%20Delivery%20or%20Collection%3A%20%0A-%20Phone%20Number%3A%20%0A%0AThank%20you!`}
                  onClick={() => setShowUploadModal(false)}
                  className="w-full py-3 rounded-xl bg-[#012169] hover:bg-[#0A358C] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Envelope weight="fill" className="h-4 w-4 text-cyan-300" />
                  <span>Send to artwork@printtodayuk.com</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
