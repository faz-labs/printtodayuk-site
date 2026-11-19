import React from 'react';
import type { Metadata } from 'next';
import { ClothingClient } from '@/components/storefront/ClothingClient';
import { AeoQuickAnswer } from '@/components/storefront/AeoQuickAnswer';
import { getFaqSchema } from '@/lib/geo-aeo-schemas';

export const revalidate = 300; // 5-minute ISR cache

export const metadata: Metadata = {
  title: 'Custom T-Shirts & Hoodies London | Same Day Printing | Print Today UK',
  description:
    'Custom printed t-shirts, hoodies, polos and workwear. Industrial DTF printing made in-house at 75 Green St, London E7. Same-day options, no minimum order, free collection.',
  keywords: [
    'custom t-shirt printing london',
    'same day t-shirt printing london',
    'dtf printing london',
    'custom hoodies london',
    'printed workwear east london',
    't-shirt printing green street e7',
    'custom printed clothing london',
    'bulk hoodie printing london',
  ],
  alternates: {
    canonical: 'https://www.printtodayuk.com/clothing',
  },
  openGraph: {
    title: 'Custom T-Shirts & Hoodies London | Print Today UK',
    description:
      'In-house custom printed t-shirts, hoodies, polos and workwear. Industrial DTF printing in East London with same-day turnaround and free collection.',
    url: 'https://www.printtodayuk.com/clothing',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom T-Shirts & Hoodies London | Print Today UK',
    description:
      'Custom printed t-shirts, hoodies, polos and workwear. DTF printing made in-house in East London. Small and bulk orders, fast turnaround.',
    site: '@printtodayuk',
  },
};

const CLOTHING_FAQS = [
  {
    question: 'Where can I get custom t-shirts and hoodies printed same-day in London?',
    answer:
      'Print Today UK provides in-house same-day t-shirt and hoodie printing at 75 Green Street, London, E7 8JF. With no minimum order quantity and fast turnaround, collect directly from our East London studio or order same-day London courier delivery.',
  },
  {
    question: 'What printing technology is used for custom garments at Print Today UK?',
    answer:
      'We use commercial Direct-to-Film (DTF) transfer printing. DTF produces photographic full-colour prints with high stretchability, wash durability up to 60 washes, and soft-touch feel on 100% cotton, polyester, blends, and heavy fleece.',
  },
  {
    question: 'Is there a minimum order quantity (MOQ) for custom clothing?',
    answer:
      'No. There is strictly no minimum order quantity. You can order a single custom t-shirt for a birthday or brand sample, or order bulk runs of 500+ hoodies with tiered volume trade discounts.',
  },
  {
    question: 'Can I mix garment sizes and colours in a single order?',
    answer:
      'Yes. You can combine sizes from XS to 5XL and mix different garment colors while using the same artwork file without incurring duplicate setup charges.',
  },
  {
    question: 'What is the cutoff time for same-day t-shirt printing in London?',
    answer:
      'Place your custom apparel order with print-ready artwork before 2:00 PM GMT Monday to Friday for guaranteed same-day collection or London courier dispatch. Urgent evening orders can be accommodated via WhatsApp.',
  },
];

const CLOTHING_SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Custom Garment & T-Shirt Printing London',
  provider: {
    '@type': 'PrintShop',
    name: 'Print Today UK',
    telephone: '+44 330 010 3521',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '75 Green Street',
      addressLocality: 'London',
      postalCode: 'E7 8JF',
      addressCountry: 'GB',
    },
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'London',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Custom Apparel Printing Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Custom T-Shirt DTF Printing London',
          description: 'Full colour direct-to-film printing on 100% ring-spun cotton t-shirts with same-day collection.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Custom Hoodie & Sweatshirt Printing',
          description: 'Heavy blend fleece hoodies and crewneck sweatshirts with front, back, and sleeve prints.',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Branded Workwear & High-Vis Printing',
          description: 'Personalized polo shirts, high-visibility vests, and durable corporate uniform printing.',
        },
      },
    ],
  },
};

export default function ClothingPage() {
  const faqSchema = getFaqSchema(CLOTHING_FAQS);

  return (
    <div>
      {/* Schema.org FAQPage Structured Data for Generative Engines & Voice Search */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Schema.org Service Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CLOTHING_SERVICE_SCHEMA) }}
      />

      {/* AEO Direct Answer Summary specifically for London Apparel & T-Shirt Searches */}
      <div className="pt-4 pb-2">
        <AeoQuickAnswer
          question="Where can I get custom t-shirts and hoodies printed same-day in London?"
          summary="Print Today UK provides in-house custom garment printing, DTF t-shirts, hoodies, and branded workwear from our London studio at 75 Green Street, E7 8JF. With no minimum order quantity, fast same-day turnaround, and premium 100% cotton blanks, collect in person for free or receive same-day London courier delivery."
          keyPoints={[
            'Turnaround: Same-day available (cutoff 2:00 PM for urgent apparel orders)',
            'Technology: Industrial Direct-to-Film (DTF) full-color vibrant prints',
            'Minimum Order: No MOQ (1 custom piece up to 5,000+ bulk orders)',
            'Collection Point: 75 Green Street, London E7 8JF (Free collection & parking)',
            'Garments: T-shirts, hoodies, sweatshirts, polo shirts, aprons & high-vis',
          ]}
          ctaUrl="https://wa.me/447969559746?text=Hi%20Print%20Today%2C%20I%20need%20a%20quote%20for%20custom%20t-shirts%2Fhoodies."
          ctaText="WhatsApp Custom Apparel Quote: +44 7969 559746"
        />
      </div>

      <ClothingClient />
    </div>
  );
}
