import React from 'react';
import type { Metadata } from 'next';
import { HeroSection } from '@/components/storefront/HeroSection';
import { TrustBar } from '@/components/storefront/TrustBar';
import { FeatureHighlights } from '@/components/storefront/FeatureHighlights';
import { DynamicLandingSections } from '@/components/storefront/DynamicLandingSections';
import { CuratedSolutionsSection } from '@/components/storefront/CuratedSolutionsSection';
import { CustomerShowcaseSection } from '@/components/storefront/CustomerShowcaseSection';
import { WhyChooseUsSection } from '@/components/storefront/WhyChooseUsSection';
import { NewsletterSection } from '@/components/storefront/NewsletterSection';
import { AeoQuickAnswer } from '@/components/storefront/AeoQuickAnswer';
import { AeoFaqSection } from '@/components/storefront/AeoFaqSection';
import { getLandingSections, getProducts, getHeroSlides, getCategories, getReviews } from '@/lib/db';
import {
  HOMEPAGE_AEO_FAQS,
  getFaqSchema,
  getHowToOrderSchema,
  getPrintShopLocalBusinessSchema,
} from '@/lib/geo-aeo-schemas';

// Revalidate homepage every 60 seconds (ISR) to cache static HTML on Edge CDN
// Drastically cuts Vercel serverless function invocations & Fluid Active CPU usage
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Same-Day Printing London | Print Today UK',
  description:
    'In-house same-day printing in East London: business cards, flyers, banners, t-shirts and more. Collect free from Green St or London courier.',
  alternates: {
    canonical: 'https://www.printtodayuk.com',
  },
  openGraph: {
    title: 'Same-Day Printing London | Print Today UK',
    description:
      'In-house same-day printing in East London: business cards, flyers, banners, t-shirts and more. Collect free from Green St or London courier.',
    url: 'https://www.printtodayuk.com',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Same-Day Printing London | Print Today UK',
    description:
      'In-house same-day printing in East London: business cards, flyers, banners, t-shirts and more. Collect free from Green St or London courier.',
    site: '@printtodayuk',
  },
};

const LOCAL_BUSINESS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Print Today UK',
  url: 'https://www.printtodayuk.com/',
  telephone: '+44 330 010 3521',
  email: 'artwork@printtodayuk.com',
  image: 'https://www.printtodayuk.com/logo.png',
  priceRange: '££',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '75 Green Street',
    addressLocality: 'London',
    postalCode: 'E7 8JF',
    addressCountry: 'GB',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 51.5367,
    longitude: 0.0272,
  },
  areaServed: [
    'London',
    'East London',
    'East Ham',
    'Forest Gate',
    'Upton Park',
    'Stratford',
    'Ilford',
    'Barking',
    'Canning Town',
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '08:00',
      closes: '17:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '08:00',
      closes: '16:00',
    },
  ],
  sameAs: ['https://www.instagram.com/printtodayuk'],
};

export default async function HomePage() {
  const [initialSections, initialProducts, initialHeroSlides, initialCategories, initialReviews] = await Promise.all([
    getLandingSections().catch(() => []),
    getProducts().catch(() => []),
    getHeroSlides().catch(() => []),
    getCategories().catch(() => []),
    getReviews().catch(() => []),
  ]);

  const faqSchema = getFaqSchema(HOMEPAGE_AEO_FAQS);
  const howToSchema = getHowToOrderSchema();

  return (
    <div className="space-y-0">
      {/* Schema.org LocalBusiness Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
      />
      {/* Schema.org FAQPage for Generative Engine Optimization (GEO) & Answer Engines (AEO) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Schema.org HowTo: Ordering Same-Day Printing in London */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      {/* Semantic Server-Rendered H1 for SEO keyword ranking */}
      <h1 className="sr-only">
        Same-Day Printing in London | Commercial Print Shop Near Me | Print Today UK
      </h1>

      {/* 1. Hero Section */}
      <HeroSection categoryType="Printing" initialSlides={initialHeroSlides} />

      {/* 2. 6-Feature Confidence & Opening Hours Trust Bar */}
      <TrustBar />

      {/* 3. AEO Direct Answer Summary for AI Overviews, Siri & Google Assistant */}
      <AeoQuickAnswer />

      {/* 4. Same-Day Service Highlights & Confirmed Studio Hours */}
      <FeatureHighlights />

      {/* 5. Dynamic CMS-Managed Landing Sections (Horizontal Auto-Scroll, 8-Tile Grids & Split Banners) */}
      <DynamicLandingSections
        initialSections={initialSections}
        initialProducts={initialProducts}
        initialCategories={initialCategories}
      />

      {/* 6. Curated Industry Solutions */}
      <CuratedSolutionsSection />

      {/* 7. Real Customer Showcase & 4.6/5 Google Reviews */}
      <CustomerShowcaseSection initialReviews={initialReviews} />

      {/* 8. Why London Businesses Choose Print Today UK */}
      <WhyChooseUsSection />

      {/* 9. AEO Frequently Asked Questions Section with Microdata */}
      <AeoFaqSection faqs={HOMEPAGE_AEO_FAQS} />

      {/* 10. Newsletter Voucher Offer (Claim 10% Off) */}
      <NewsletterSection />
    </div>
  );
}
