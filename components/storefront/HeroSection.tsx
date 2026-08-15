'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  ShieldCheck,
  MapPin,
  Clock,
  Printer,
  Shirt,
  Sparkles,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
    <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-20 lg:pt-24 lg:pb-28">
      {/* Background WebM Video (Bright & Vivid) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none transition-opacity duration-1000 z-0"
        onError={(e) => {
          // Gracefully hide video if not placed in public/videos yet
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src={defaultVideoSrc} type="video/webm" />
        <source src="/videos/hero.webm" type="video/webm" />
      </video>

      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-3xl pointer-events-none z-1" />
      <div className="absolute -top-24 right-10 w-[400px] h-[400px] bg-[#781857]/20 rounded-full blur-3xl pointer-events-none z-1" />

      {/* Subtle translucent overlay for crisp text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-black/30 to-slate-950/65 pointer-events-none z-1" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Banner Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-rose-300 text-xs font-semibold mb-6 shadow-xl"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>London Express Hub • Same-Day Dispatch Available</span>
            <span className="h-1 w-1 rounded-full bg-rose-400" />
            <span className="text-white/90">Order by 12pm</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] sm:leading-[1.15] drop-shadow-lg [text-shadow:_0_2px_12px_rgba(0,0,0,0.8)]"
          >
            {isPrinting ? (
              <>
                London&apos;s Fastest{' '}
                <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
                  Same Day Custom Printing
                </span>
              </>
            ) : (
              <>
                Premium Custom{' '}
                <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-amber-200 bg-clip-text text-transparent">
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
            className="mt-6 text-base sm:text-lg text-slate-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md [text-shadow:_0_1px_8px_rgba(0,0,0,0.7)] font-medium"
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-xl shadow-rose-600/40 text-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Get Same-Day Quote</span>
            </button>

            {isPrinting ? (
              <Link
                href="/clothing"
                className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white border border-white/25 font-bold px-6 py-3.5 rounded-xl backdrop-blur-md text-sm transition-all hover:scale-105 shadow-lg"
              >
                <Shirt className="h-4 w-4 text-rose-300" />
                <span>Explore Clothing Catalog</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-black/40 hover:bg-black/60 text-white border border-white/25 font-bold px-6 py-3.5 rounded-xl backdrop-blur-md text-sm transition-all hover:scale-105 shadow-lg"
              >
                <Printer className="h-4 w-4 text-rose-300" />
                <span>Explore Printing Catalog</span>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
