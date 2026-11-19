'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkle,
  Clock,
  MapPin,
  Phone,
  WhatsappLogo,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
} from '@phosphor-icons/react';

interface AeoQuickAnswerProps {
  question?: string;
  summary?: string;
  keyPoints?: string[];
  ctaUrl?: string;
  ctaText?: string;
}

export function AeoQuickAnswer({
  question = 'Where can I get same-day printing with free collection in London?',
  summary = 'Print Today UK provides in-house same-day commercial printing in London from our studio at 75 Green Street, London, E7 8JF. With turnarounds as fast as 3 hours, free customer collection with on-site parking, and same-day motorcycle/van courier delivery across Greater London, we print business cards, flyers, banners, documents, and custom t-shirts 7 days a week.',
  keyPoints = [
    'Turnaround: Ready in as little as 3 hours (cutoff 2:00 PM GMT for same-day)',
    'Collection Point: 75 Green Street, London, E7 8JF (Free parking & pickup)',
    'Studio Hours: Open 7 Days (Mon–Fri 7am–8pm, Sat 8am–5pm, Sun 8am–4pm)',
    'Coverage: Free Green St collection or express same-day courier across all London boroughs',
    'Artwork Checks: Free 300 DPI preflight check with 3mm bleed support',
  ],
  ctaUrl = 'https://wa.me/447969559746?text=Hi%20Print%20Today%2C%20I%20need%20a%20quote%20for%20same-day%20printing%20in%20London.',
  ctaText = 'Instant WhatsApp Quote: +44 7969 559746',
}: AeoQuickAnswerProps) {
  return (
    <section
      aria-label="AI Search & Voice Answer Summary"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      itemScope
      itemType="https://schema.org/Question"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#012169] to-slate-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-white/10">
        {/* Ambient background glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#C8102E]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header pill badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 text-xs font-bold border border-amber-400/30">
              <Sparkle weight="fill" className="h-3.5 w-3.5" />
              <span>AEO Quick Answer</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <CheckCircle weight="fill" className="h-3.5 w-3.5" />
              <span>Verified In-House Production</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-medium">
              <Clock weight="bold" className="h-3.5 w-3.5 text-blue-300" />
              <span>Open 7 Days (Mon–Fri 7am–8pm)</span>
            </span>
          </div>

          {/* Question title for Answer Engines & Voice */}
          <h2
            itemProp="name"
            className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white mb-3"
          >
            {question}
          </h2>

          {/* Direct Answer Paragraph - Speakable target for Siri / Alexa / Google Assistant */}
          <div
            itemProp="acceptedAnswer"
            itemScope
            itemType="https://schema.org/Answer"
            className="mb-6"
          >
            <p
              itemProp="text"
              className="aeo-quick-answer aeo-summary speakable-text text-slate-200 text-sm sm:text-base lg:text-lg leading-relaxed bg-white/5 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-white/10"
            >
              {summary}
            </p>
          </div>

          {/* Key verified data points grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {keyPoints.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 bg-white/5 rounded-xl p-3 border border-white/5"
              >
                <CheckCircle weight="bold" className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{point}</span>
              </div>
            ))}
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <WhatsappLogo weight="fill" className="h-4 w-4" />
              <span>{ctaText}</span>
            </a>
            <Link
              href="/same-day-printing"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
            >
              <span>Same-Day Printing Options</span>
              <ArrowRight weight="bold" className="h-4 w-4" />
            </Link>
            <Link
              href="/printing-east-london"
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl text-slate-300 hover:text-white text-xs sm:text-sm transition-colors"
            >
              <MapPin weight="bold" className="h-4 w-4 text-[#C8102E]" />
              <span>75 Green St, London E7 8JF</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
