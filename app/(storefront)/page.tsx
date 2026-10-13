'use client';

import React from 'react';
import { HeroSection } from '@/components/storefront/HeroSection';
import { FeatureHighlights } from '@/components/storefront/FeatureHighlights';
import { CategoryTilesSection } from '@/components/storefront/CategoryTilesSection';
import { CategorySections } from '@/components/storefront/CategorySections';
import { CuratedSolutionsSection } from '@/components/storefront/CuratedSolutionsSection';
import { PromoCalloutBanner } from '@/components/storefront/PromoCalloutBanner';
import { CustomerShowcaseSection } from '@/components/storefront/CustomerShowcaseSection';
import { WhyChooseUsSection } from '@/components/storefront/WhyChooseUsSection';
import { NewsletterSection } from '@/components/storefront/NewsletterSection';

export default function HomePage() {
  return (
    <div className="space-y-0">
      {/* 1. Vistaprint-Style Hero Section with Crystal Clear Video */}
      <HeroSection categoryType="Printing" />

      {/* 2. Vistaprint 4-Pillar Confidence & Trust Bar */}
      <FeatureHighlights />

      {/* 3. Category Sections (Gift Items, Printing, Clothing) with Subcategory Picture Cards (Mug, Pen, etc.) */}
      <CategorySections />

      {/* 4. Popular Category Quick Highlights */}
      <CategoryTilesSection />

      {/* 5. Curated Industry Solutions */}
      <CuratedSolutionsSection />

      {/* 6. High-Impact Promo Callout Banner with Code */}
      <PromoCalloutBanner />

      {/* 7. Real Customer Showcase & 4.9/5 Trustpilot Reviews */}
      <CustomerShowcaseSection />

      {/* 8. Why London Businesses Choose Print Today UK */}
      <WhyChooseUsSection />

      {/* 9. Newsletter Voucher Offer (Claim 10% Off) */}
      <NewsletterSection />
    </div>
  );
}
