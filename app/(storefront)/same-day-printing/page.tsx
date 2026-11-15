import React from 'react';
import type { Metadata } from 'next';
import { SameDayClient } from '@/components/storefront/SameDayClient';

export const metadata: Metadata = {
  title: 'Same Day Printing London | Order by 12pm | Print Today',
  description:
    'Need it today? Order before 12pm for same-day collection from 75 Green St, E7, or London courier. Cards, flyers, posters, banners and documents.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/same-day-printing',
  },
  openGraph: {
    title: 'Same Day Printing London | Order by 12pm | Print Today',
    description:
      'Need it today? Order before 12pm for same-day collection from 75 Green St, E7, or London courier. Cards, flyers, posters, banners and documents.',
    url: 'https://www.printtodayuk.com/same-day-printing',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Same Day Printing London | Order by 12pm | Print Today',
    description:
      'Need it today? Order before 12pm for same-day collection from 75 Green St, E7, or London courier. Cards, flyers, posters, banners and documents.',
    site: '@printtodayuk',
  },
};

export default function SameDayPrintingPage() {
  return <SameDayClient />;
}
