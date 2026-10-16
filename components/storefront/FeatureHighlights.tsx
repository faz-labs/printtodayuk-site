'use client';

import React from 'react';
import Link from 'next/link';
import { Lightning, ArrowRight } from '@phosphor-icons/react';
import FoldText from '@/components/ui/FoldText';

export function FeatureHighlights() {
  return (
    <section className="w-full bg-gradient-to-b from-white via-slate-50/60 to-white border-y border-slate-200/80 shadow-2xs relative z-20 font-sans py-14 sm:py-18 md:py-22 overflow-hidden">
      {/* Subtle decorative background ambient glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[300px] bg-gradient-to-r from-blue-400/10 via-red-400/10 to-amber-300/10 blur-3xl rounded-full pointer-events-none"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center relative z-10">
        {/* Express Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-[#C8102E] text-xs font-black uppercase tracking-wider mb-5 shadow-2xs">
          <Lightning weight="fill" className="h-3.5 w-3.5 text-[#C8102E] animate-pulse" />
          <span>Express 24/7 Service • London Production Studio</span>
        </div>

        {/* Line 1 FoldText Animation (Large 3D Paper Fold Text) */}
        <div className="w-full flex justify-center overflow-visible">
          <FoldText
            text="Same Day & 24/7 Printing"
            foldStyle="paper"
            splitBy="char"
            hinge="top"
            trigger="scroll"
            foldAngle={92}
            duration={0.65}
            stagger={0.035}
            staggerFrom="start"
            ease="power3.out"
            loopDelay={1.4}
            hoverRefold
            refoldRadius={140}
            refoldAngle={45}
            perspective={700}
            creaseShading={0.55}
            color="#0F172A"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight block text-center"
          />
        </div>

        {/* Line 2 FoldText Animation (Large 3D Paper Fold Text) */}
        <div className="w-full flex justify-center overflow-visible mt-1 sm:mt-2">
          <FoldText
            text="& Signage London"
            foldStyle="paper"
            splitBy="char"
            hinge="top"
            trigger="scroll"
            foldAngle={92}
            duration={0.65}
            stagger={0.035}
            staggerFrom="start"
            ease="power3.out"
            loopDelay={1.4}
            hoverRefold
            refoldRadius={140}
            refoldAngle={45}
            perspective={700}
            creaseShading={0.55}
            color="#012169"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight block text-center"
          />
        </div>

        {/* Subtitle description */}
        <p className="mt-4 sm:mt-5 max-w-2xl text-slate-600 text-sm sm:text-base md:text-lg font-medium leading-relaxed">
          High-definition digital printing, promotional merchandise &amp; architectural signage delivered across London on the same day.
        </p>

        {/* Centered CTA Button in the Middle */}
        <div className="pt-7 sm:pt-9 flex justify-center w-full">
          <Link
            href="/same-day-printing"
            className="inline-flex items-center justify-center gap-3 px-8 sm:px-11 py-4 sm:py-4.5 rounded-2xl bg-[#012169] hover:bg-[#C8102E] text-white text-base sm:text-lg font-black shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 group cursor-pointer"
          >
            <span>Get Sameday Prints</span>
            <ArrowRight weight="bold" className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
