'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Heart, InstagramLogo } from '@phosphor-icons/react';

export function CustomerShowcaseSection() {
  const reviews = [
    {
      author: 'Marcus Sterling',
      company: 'Tech Summit London',
      location: 'Canary Wharf, London',
      rating: 5,
      review:
        'Saved our conference! Requested an emergency turnaround in the morning and 250 presentation booklets plus badges were ready for collection at 75 Green St by early afternoon. Flawless print quality.',
      product: 'Folded Booklets & Name Badges',
    },
    {
      author: 'Priya Patel',
      company: 'Studio Verde Architects',
      location: 'Shoreditch, London',
      rating: 5,
      review:
        'The soft-touch velvet finish and metallic gold foil on our business cards exceeded all expectations. Unmatched local service in East London.',
      product: 'Luxury Foil Business Cards',
    },
    {
      author: 'David O’Connor',
      company: 'The Copper Grill',
      location: 'Soho, London',
      rating: 5,
      review:
        'We needed waterproof laminated menus and embroidered staff aprons printed fast for our grand opening. Completed in 48 hours with crisp logo detail.',
      product: 'Waterproof Menus & Aprons',
    },
  ];

  const showcaseProjects = [
    {
      title: 'Luxury Gold Foil Business Cards',
      category: 'Business Cards',
      imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=500&auto=format&fit=crop',
      tag: '#PrintedByPrintToday',
    },
    {
      title: 'Full Colour DTF Custom Hoodies',
      category: 'Apparel & Uniforms',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=500&auto=format&fit=crop',
      tag: 'London Studio Print',
    },
    {
      title: 'High-Impact Event Roller Banners',
      category: 'Exhibition Displays',
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop',
      tag: 'Same Day Collection',
    },
    {
      title: 'Die-Cut Waterproof Packaging Labels',
      category: 'Product Stickers',
      imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=500&auto=format&fit=crop',
      tag: 'Precision Contour Cut',
    },
  ];

  return (
    <section className="bg-white py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Trustpilot Rating Pill */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-3 shadow-xs">
            <div className="flex items-center text-emerald-600">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} weight="fill" className="h-3.5 w-3.5" />
              ))}
            </div>
            <span>Rated 4.9 / 5 on Trustpilot & Google Reviews</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Loved by 1,000+ London Businesses & Creators
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            See real work printed in our London studio for cafes, tech agencies, corporate teams, and creators.
          </p>
        </div>

        {/* Visual Customer Creation Gallery (Vistaprint Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {showcaseProjects.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block">
                  {item.tag}
                </span>
                <div className="text-xs font-bold line-clamp-1 mt-0.5">
                  {item.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials 3-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.author}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} weight="fill" className="h-4 w-4" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  &ldquo;{rev.review}&rdquo;
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <span>{rev.author}</span>
                    <CheckCircle weight="fill" className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div className="text-[11px] text-slate-500">{rev.company} • {rev.location}</div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[#012169]">
                  {rev.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
