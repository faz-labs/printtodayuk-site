import React from 'react';
import { HeroSection } from '@/components/storefront/HeroSection';
import { FeatureHighlights } from '@/components/storefront/FeatureHighlights';
import { DynamicLandingSections } from '@/components/storefront/DynamicLandingSections';
import { CuratedSolutionsSection } from '@/components/storefront/CuratedSolutionsSection';
import { PromoCalloutBanner } from '@/components/storefront/PromoCalloutBanner';
import { CustomerShowcaseSection } from '@/components/storefront/CustomerShowcaseSection';
import { WhyChooseUsSection } from '@/components/storefront/WhyChooseUsSection';
import { NewsletterSection } from '@/components/storefront/NewsletterSection';
import { getLandingSections, getProducts, getHeroSlides, getCategories } from '@/lib/db';

// Always render the latest CMS-managed sections and hero banners in real-time
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [initialSections, initialProducts, initialHeroSlides, initialCategories] = await Promise.all([
    getLandingSections().catch(() => []),
    getProducts().catch(() => []),
    getHeroSlides().catch(() => []),
    getCategories().catch(() => []),
  ]);

  return (
    <div className="space-y-0">
      {/* 1. Vistaprint-Style Hero Section with Crystal Clear Video */}
      <HeroSection categoryType="Printing" initialSlides={initialHeroSlides} />

      {/* 2. Vistaprint 4-Pillar Confidence & Trust Bar */}
      <FeatureHighlights />

      {/* 3. Dynamic CMS-Managed Landing Sections (Horizontal Auto-Scroll, 8-Tile Grids & Split Banners) */}
      <DynamicLandingSections
        initialSections={initialSections}
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />

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
