'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  MagnifyingGlass,
  ArrowRight,
  Clock,
  Sparkle,
  CheckCircle,
  FilePdf,
  ShieldCheck,
  EnvelopeSimple,
  Chats,
  X,
  Tag,
} from '@phosphor-icons/react';
import { ArtworkGuide } from '@/lib/types';

interface ArtworkGuidesClientProps {
  initialGuides: ArtworkGuide[];
}

export function ArtworkGuidesClient({ initialGuides = [] }: ArtworkGuidesClientProps) {
  const [guides] = useState<ArtworkGuide[]>(initialGuides);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    guides.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return ['All', ...Array.from(set)];
  }, [guides]);

  // Filtered guides
  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      const matchCat = selectedCategory === 'All' || g.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [guides, selectedCategory, searchQuery]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-20">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#012169] via-[#011a54] to-[#01133f] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle Ambient Background Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-red-300 mb-4"
          >
            <Sparkle weight="bold" className="h-4 w-4 text-amber-300" />
            <span>London Digital Print &amp; Prepress Technical Hub</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight"
          >
            Artwork Guides &amp; <span className="text-red-400">Print Specifications</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-4 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Everything you need to supply print-ready files: bleed setup, resolution standards, CMYK color profiles, and preflight checklists for razor-sharp commercial print output.
          </motion.p>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-8 max-w-xl mx-auto relative"
          >
            <div className="relative flex items-center">
              <MagnifyingGlass
                weight="bold"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides (e.g. bleed, 300 DPI, CMYK, roller banner)..."
                className="w-full h-12 sm:h-14 pl-12 pr-10 rounded-2xl bg-white text-slate-900 text-sm placeholder:text-slate-400 font-medium shadow-xl focus:outline-hidden focus:ring-4 focus:ring-blue-400/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X weight="bold" className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Category Filter Pills */}
        <div className="bg-white p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#012169] text-white shadow-md shadow-[#012169]/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Guides Count / Search Summary */}
        <div className="mt-8 flex items-center justify-between text-xs sm:text-sm text-slate-500 font-semibold px-1">
          <span>
            Showing <strong className="text-slate-900">{filteredGuides.length}</strong>{' '}
            {filteredGuides.length === 1 ? 'guide' : 'guides'}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </span>

          <Link
            href="/product-templates"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#012169] hover:text-[#C8102E] transition-colors"
          >
            <span>Need Templates? View Dielines</span>
            <ArrowRight weight="bold" className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Guides Card Grid */}
        {filteredGuides.length === 0 ? (
          <div className="mt-8 py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-8">
            <BookOpen weight="duotone" className="h-14 w-14 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No matching guides found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              We couldn&apos;t find any artwork guides matching your search criteria. Try a different term or clear your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#012169] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredGuides.map((guide, idx) => (
              <motion.article
                key={guide.id || guide.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Image */}
                  <Link href={`/artwork-guides/${guide.slug}`} className="block relative aspect-16/10 w-full overflow-hidden bg-slate-100">
                    <img
                      src={guide.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80'}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#012169]/90 text-white backdrop-blur-md shadow-xs">
                        {guide.category || 'Artwork Setup'}
                      </span>
                    </div>
                  </Link>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-2.5">
                      <Clock weight="bold" className="h-3.5 w-3.5 text-slate-400" />
                      <span>{guide.readingTime || '3 min read'}</span>
                      <span>•</span>
                      <span>Print Today Studio</span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#012169] transition-colors leading-snug">
                      <Link href={`/artwork-guides/${guide.slug}`}>
                        {guide.title}
                      </Link>
                    </h2>

                    <p className="mt-2.5 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {guide.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Card Footer: Read More CTA Button */}
                <div className="px-6 pb-6 pt-2">
                  <Link
                    href={`/artwork-guides/${guide.slug}`}
                    className="w-full inline-flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 group-hover:bg-[#012169] text-[#012169] group-hover:text-white text-xs sm:text-sm font-bold transition-all duration-200"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight weight="bold" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Free Preflight Assistance Callout */}
        <section className="mt-16 bg-gradient-to-br from-slate-900 via-[#012169] to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-xs font-bold text-red-300">
                <ShieldCheck weight="fill" className="h-4 w-4 text-red-400" />
                <span>Complimentary Preflight Check</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Not sure if your artwork is 100% print-ready?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Send your PDF, AI, or PSD files to our London prepress studio before ordering. Our technicians will inspect your bleed, resolution, fonts, and CMYK color profiles free of charge.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href="mailto:artwork@printtodayuk.com?subject=Free%20Artwork%20Preflight%20Check"
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#C8102E] hover:bg-[#A80C24] text-white text-xs sm:text-sm font-bold transition-all shadow-md text-center"
              >
                <EnvelopeSimple weight="bold" className="h-4 w-4" />
                <span>Email Artwork for Review</span>
              </a>
              <a
                href="https://wa.me/447969559746?text=Hi%2C%20I%20need%20help%20checking%20my%20artwork%20for%20printing."
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold transition-all border border-white/20 text-center"
              >
                <Chats weight="bold" className="h-4 w-4 text-emerald-400" />
                <span>WhatsApp Prepress Help</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

