'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { HeroSlide } from '@/lib/types';
import { getHeroSlides } from '@/lib/db';
import { DEFAULT_HERO_SLIDES } from '@/lib/data';

interface HeroSectionProps {
  categoryType?: 'Printing' | 'Clothing';
}

export function HeroSection({ categoryType }: HeroSectionProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Load hero slides from CMS/database
  useEffect(() => {
    async function load() {
      try {
        const data = await getHeroSlides();
        if (data && data.length > 0) {
          setSlides(data);
        }
      } catch (err) {
        console.error('Failed to load hero slides:', err);
      }
    }
    load();
  }, []);

  // Auto sliding interval (every 4.5 seconds)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const renderSlideImage = () => {
    const imageElement = (
      <img
        src={currentSlide.imageUrl}
        alt={currentSlide.title || `Hero banner ${currentIndex + 1}`}
        className="w-full h-full object-cover object-center block"
        loading="eager"
        onError={(e) => {
          e.currentTarget.src =
            'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1800&auto=format&fit=crop';
        }}
      />
    );

    if (currentSlide.linkUrl) {
      if (currentSlide.linkUrl.startsWith('http')) {
        return (
          <a
            href={currentSlide.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full h-full cursor-pointer"
          >
            {imageElement}
          </a>
        );
      }
      return (
        <Link href={currentSlide.linkUrl} className="block w-full h-full cursor-pointer">
          {imageElement}
        </Link>
      );
    }

    return imageElement;
  };

  return (
    <div
      className="relative w-full h-[340px] sm:h-[420px] md:h-[480px] overflow-hidden bg-slate-900 select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Sliding Image with AnimatePresence */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide.id || currentIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction === 1 ? 80 : -80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction === 1 ? -80 : 80 }}
          transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          {renderSlideImage()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows: Hidden until mouse hover over hero section */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-20 cursor-pointer hover:scale-105 shadow-md"
          >
            <CaretLeft weight="bold" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next slide"
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-20 cursor-pointer hover:scale-105 shadow-md"
          >
            <CaretRight weight="bold" className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {/* Bottom Pagination Dots (Smaller & Sleeker) */}
      {slides.length > 1 && (
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-full">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              type="button"
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 bg-white shadow-xs'
                  : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
