'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lightning,
  Printer,
  TShirt,
  PhoneCall,
} from '@phosphor-icons/react';
import { useCallMe } from './CallMeContext';

interface HeroSectionProps {
  categoryType?: 'Printing' | 'Clothing';
  videoSrc?: string;
}

export function HeroSection({
  categoryType = 'Printing',
  videoSrc,
}: HeroSectionProps) {
  const { openCallMe } = useCallMe();

  const isPrinting = categoryType === 'Printing';
  const defaultVideoSrc =
    videoSrc || (isPrinting ? '/videos/hero-printing.webm' : '/videos/hero-clothing.webm');

  return (
    <section className="relative overflow-hidden bg-[#012169] text-white pt-16 pb-20 lg:pt-24 lg:pb-28">
      {/* Background WebM Video (Crystal Clear & Vivid) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-90 pointer-events-none transition-opacity duration-1000 z-0"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src={defaultVideoSrc} type="video/webm" />
        <source src="/videos/hero.webm" type="video/webm" />
      </video>

      {/* Clear, subtle contrast gradient overlay so video is visible and text is sharp */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#012169]/40 via-black/25 to-[#012169]/70 pointer-events-none z-1" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Banner Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/30 text-white text-xs font-bold mb-6 shadow-xl"
          >
            <Lightning weight="fill" className="h-3.5 w-3.5 text-amber-400" />
            <span className="drop-shadow-xs">London Express Hub • Same-Day Dispatch</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E]" />
            <span className="text-red-300 font-extrabold drop-shadow-xs">Order by 12pm</span>
          </motion.div>

          {/* Main Headline - Clean Mix of White & Red (No Underline) */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] drop-shadow-[0_3px_10px_rgba(0,0,0,0.9)]"
          >
            {isPrinting ? (
              <>
                <span className="text-white">London&apos;s Fastest </span>
                <span className="text-[#C8102E] bg-white/95 px-3 py-0.5 rounded-xl inline-block shadow-xl my-1">
                  Same Day
                </span>{' '}
                <span className="text-white">Custom Printing</span>
              </>
            ) : (
              <>
                <span className="text-white">Premium Custom </span>
                <span className="text-[#C8102E] bg-white/95 px-3 py-0.5 rounded-xl inline-block shadow-xl my-1">
                  Apparel & Workwear
                </span>{' '}
                <span className="text-white">in London</span>
              </>
            )}
          </motion.h1>

          {/* Subtitle - High Legibility & Mixed Accent Highlights */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-white font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)]"
          >
            {isPrinting ? (
              <>
                Luxury <span className="text-red-300 font-bold">business cards</span>, flyers, folded brochures, PVC banners, canopies, ID cards, and promotional merchandise printed on-demand with <span className="text-white font-bold">London studio collection</span> or rapid courier delivery.
              </>
            ) : (
              <>
                Direct-to-Film (DTF) printed <span className="text-red-300 font-bold">t-shirts</span>, heavy fleece hoodies, embroidered corporate polos, and safety high-vis workwear. <span className="text-white font-bold">Delivered fast</span> across London.
              </>
            )}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4"
          >
            <button
              onClick={() => openCallMe(isPrinting ? 'Same-Day Printing Quote' : 'Clothing Quote')}
              className="inline-flex items-center gap-2 bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold px-6 py-3.5 rounded-xl shadow-xl text-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-[#C8102E]"
            >
              <PhoneCall weight="bold" className="h-4 w-4" />
              <span>Get Same-Day Quote</span>
            </button>

            {isPrinting ? (
              <Link
                href="/clothing"
                className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#012169] font-bold px-6 py-3.5 rounded-xl text-sm transition-all hover:scale-105 shadow-lg"
              >
                <TShirt weight="bold" className="h-4 w-4 text-[#012169]" />
                <span>Explore Clothing Catalog</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-[#012169] font-bold px-6 py-3.5 rounded-xl text-sm transition-all hover:scale-105 shadow-lg"
              >
                <Printer weight="bold" className="h-4 w-4 text-[#012169]" />
                <span>Explore Printing Catalog</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
