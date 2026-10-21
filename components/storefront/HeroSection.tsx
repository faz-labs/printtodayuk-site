'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { HeroSlide } from '@/lib/types';
import { getHeroSlides, getLocalHeroSlides } from '@/lib/db';
import { DEFAULT_HERO_SLIDES } from '@/lib/data';

interface HeroSectionProps {
  categoryType?: 'Printing' | 'Clothing';
  initialSlides?: HeroSlide[];
}

export function HeroSection({ categoryType, initialSlides }: HeroSectionProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    if (initialSlides && initialSlides.length > 0) return initialSlides;
    return DEFAULT_HERO_SLIDES;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Load hero slides from CMS/database and listen for live updates
  useEffect(() => {
    if (!initialSlides || initialSlides.length === 0) {
      const local = getLocalHeroSlides();
      if (local && local.length > 0) setSlides(local);
    }

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

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'print_today_hero_slides') {
        try {
          const updated = JSON.parse(e.newValue || '[]');
          if (Array.isArray(updated) && updated.length > 0) {
            setSlides(updated);
          }
        } catch {}
      }
    };

    const handleCustomUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<HeroSlide[]>;
      if (Array.isArray(customEvent.detail) && customEvent.detail.length > 0) {
        setSlides(customEvent.detail);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('print_today_hero_slides_updated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('print_today_hero_slides_updated', handleCustomUpdate);
    };
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
  const hasLink = Boolean(currentSlide?.linkUrl && currentSlide.linkUrl.trim().length > 0);
  const slideLink = hasLink ? currentSlide.linkUrl!.trim() : '';
  const isExternal = slideLink.startsWith('http://') || slideLink.startsWith('https://');

  const renderSlideImage = () => {
    return (
      <img
        src={currentSlide.imageUrl}
        alt={currentSlide.title || `Hero banner ${currentIndex + 1}`}
        className="w-full h-full object-cover object-center block select-none pointer-events-none"
        loading="eager"
        onError={(e) => {
          e.currentTarget.src =
            'https://placehold.co/1800x540/012169/ffffff?text=Print+Today+London';
        }}
      />
    );
  };

  return (
    <div
      className="relative z-10 w-full aspect-[16/7.5] xs:aspect-[16/7.5] sm:aspect-[21/8] md:h-[380px] lg:h-[480px] xl:h-[480px] min-h-[165px] max-h-[480px] overflow-hidden bg-slate-900 select-none group"
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
          {hasLink ? (
            isExternal ? (
              <a
                href={slideLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full cursor-pointer"
              >
                {renderSlideImage()}
              </a>
            ) : (
              <Link
                href={slideLink}
                className="block w-full h-full cursor-pointer"
              >
                {renderSlideImage()}
              </Link>
            )
          ) : (
            renderSlideImage()
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows: Centered vertically */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            type="button"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-20 cursor-pointer hover:scale-105 shadow-md"
          >
            <CaretLeft weight="bold" className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Next slide"
            type="button"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-11 sm:w-11 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-xs text-white flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-300 z-20 cursor-pointer hover:scale-105 shadow-md"
          >
            <CaretRight weight="bold" className="h-4 w-4 sm:h-6 sm:w-6" />
          </button>
        </>
      )}

      {/* Bottom Pagination Dots (Smaller & Sleeker) */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 sm:bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-full">
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
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-4 sm:w-5 bg-white shadow-xs'
                  : 'w-1 sm:w-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
