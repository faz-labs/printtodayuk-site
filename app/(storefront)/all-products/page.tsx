import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { AllProductsClient } from '@/components/storefront/AllProductsClient';

export const metadata: Metadata = {
  title: 'All Print Products London | Print Today UK',
  description:
    'Browse business cards, flyers, posters, roller banners, booklets, stickers, calendars and more. Printed in-house in London with same-day options.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/all-products',
  },
  openGraph: {
    title: 'All Print Products London | Print Today UK',
    description:
      'Browse business cards, flyers, posters, roller banners, booklets, stickers, calendars and more. Printed in-house in London with same-day options.',
    url: 'https://www.printtodayuk.com/all-products',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All Print Products London | Print Today UK',
    description:
      'Browse business cards, flyers, posters, roller banners, booklets, stickers, calendars and more. Printed in-house in London with same-day options.',
    site: '@printtodayuk',
  },
};

export default function AllProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-10 w-10 border-4 border-[#012169]/20 border-t-[#012169] rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-600">Loading catalog...</p>
          </div>
        </div>
      }
    >
      <AllProductsClient />
    </Suspense>
  );
}
