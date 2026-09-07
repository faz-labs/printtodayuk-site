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
      {/* Background WebM Video (Bright & Vivid) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none transition-opacity duration-1000 z-0"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src={defaultVideoSrc} type="video/webm" />
        <source src="/videos/hero.webm" type="video/webm" />
      </video>

      {/* Ambient background glow accents in Blue and Red */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#012169]/40 rounded-full blur-3xl pointer-events-none z-1" />
      <div className="absolute -top-24 right-10 w-[400px] h-[400px] bg-[#C8102E]/25 rounded-full blur-3xl pointer-events-none z-1" />

      {/* Subtle translucent overlay for crisp text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#012169]/80 via-[#012169]/60 to-[#012169]/90 pointer-events-none z-1" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Banner Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold mb-6 shadow-lg"
          >
            <Lightning weight="fill" className="h-3.5 w-3.5 text-amber-300" />
            <span>London Express Hub • Same-Day Dispatch Available</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#C8102E]" />
            <span className="text-white">Order by 12pm</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]"
          >
            {isPrinting ? (
              <>
                London&apos;s Fastest{' '}
                <span className="text-white underline decoration-[#C8102E] decoration-wavy decoration-from-font">
                  Same Day Custom Printing
                </span>
              </>
            ) : (
              <>
                Premium Custom{' '}
                <span className="text-white underline decoration-[#C8102E] decoration-wavy decoration-from-font">
                  Apparel & Workwear
                </span>{' '}
                in London
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            {isPrinting
              ? 'Luxury business cards, flyers, folded brochures, PVC banners, canopies, ID cards, and promotional merchandise printed on-demand with London studio collection or rapid courier delivery.'
              : 'Direct-to-Film (DTF) printed t-shirts, heavy fleece hoodies, embroidered corporate polos, and safety high-vis workwear. Small & large batches delivered fast.'}
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
