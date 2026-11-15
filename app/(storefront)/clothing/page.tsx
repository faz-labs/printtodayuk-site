import React from 'react';
import type { Metadata } from 'next';
import { ClothingClient } from '@/components/storefront/ClothingClient';

export const metadata: Metadata = {
  title: 'Custom T-Shirts & Hoodies London | Print Today',
  description:
    'Custom printed t-shirts, hoodies, polos and workwear. DTF printing made in-house in East London. Small and bulk orders, fast turnaround.',
  alternates: {
    canonical: 'https://www.printtodayuk.com/clothing',
  },
  openGraph: {
    title: 'Custom T-Shirts & Hoodies London | Print Today',
    description:
      'Custom printed t-shirts, hoodies, polos and workwear. DTF printing made in-house in East London. Small and bulk orders, fast turnaround.',
    url: 'https://www.printtodayuk.com/clothing',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom T-Shirts & Hoodies London | Print Today',
    description:
      'Custom printed t-shirts, hoodies, polos and workwear. DTF printing made in-house in East London. Small and bulk orders, fast turnaround.',
    site: '@printtodayuk',
  },
};

export default function ClothingPage() {
  return <ClothingClient />;
}
