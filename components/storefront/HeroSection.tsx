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
}

export function HeroSection({ categoryType = 'Printing' }: HeroSectionProps) {
  const { openCallMe } = useCallMe();

  const isPrinting = categoryType === 'Printing';

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#2d0720] to-[#1a0413] text-white pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 right-10 w-[400px] h-[400px] bg-[#781857]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid line background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Banner Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-rose-300 text-xs font-semibold mb-6 shadow-lg"
          >
            <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span>London Express Hub • Same-Day Dispatch Available</span>
            <span className="h-1 w-1 rounded-full bg-rose-400" />
            <span className="text-white/80">Order by 12pm</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] sm:leading-[1.15]"
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
            className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-rose-600/30 text-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              <span>Get Same-Day Quote</span>
            </button>

            {isPrinting ? (
              <Link
                href="/clothing"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3.5 rounded-xl backdrop-blur-md text-sm transition-all hover:scale-105"
              >
                <Shirt className="h-4 w-4 text-rose-300" />
                <span>Explore Clothing Catalog</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3.5 rounded-xl backdrop-blur-md text-sm transition-all hover:scale-105"
              >
                <Printer className="h-4 w-4 text-rose-300" />
                <span>Explore Printing Catalog</span>
              </Link>
            )}
          </motion.div>

          {/* Feature Highlights Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 text-left pt-6 border-t border-white/10"
          >
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
              <Clock className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Same Day Dispatch</div>
                <div className="text-[11px] text-slate-400">Order by 12pm for today</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
              <MapPin className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">London Studio</div>
                <div className="text-[11px] text-slate-400">75 Green St, E7 8JF</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Quality Guarantee</div>
                <div className="text-[11px] text-slate-400">HD Pigment & DTF Print</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
              <Sparkles className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white">Artwork Check</div>
                <div className="text-[11px] text-slate-400">Free 100% proof check</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
