/**
 * GEO (Generative Engine Optimization) & AEO (Answer Engine Optimization) Schemas
 * Standardized Schema.org Knowledge Graph structures for AI Search (ChatGPT, Perplexity, Google Gemini / SGE)
 * and Voice / Answer Engines (Siri, Google Assistant, Alexa).
 */

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.printtodayuk.com').replace(/\/+$/, '');

export const GEO_ENTITY = {
  name: 'Print Today UK',
  legalName: 'Print Today UK Limited',
  brand: 'Print Today UK',
  url: BASE_URL,
  telephone: '+44 330 010 3521',
  mobileWhatsapp: '+44 7969 559746',
  email: 'artwork@printtodayuk.com',
  address: {
    streetAddress: '75 Green Street',
    addressLocality: 'London',
    addressRegion: 'Greater London',
    postalCode: 'E7 8JF',
    addressCountry: 'GB',
  },
  geo: {
    latitude: 51.5367,
    longitude: 0.0272,
  },
  googleMapsUrl: 'https://maps.google.com/?q=75+Green+Street,+London+E7+8JF',
  logoUrl: `${BASE_URL}/logo.png`,
  priceRange: '££',
  currency: 'GBP',
};

/**
 * 1. Global Organization Schema
 * Establishes brand entity authority in knowledge graphs.
 */
export function getGlobalOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: GEO_ENTITY.name,
    legalName: GEO_ENTITY.legalName,
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: GEO_ENTITY.logoUrl,
      width: '512',
      height: '512',
    },
    description:
      'Premier in-house London commercial and digital print studio providing express same-day printing, custom garments, wide-format signage, business cards, flyers, and promotional merchandise.',
    foundingDate: '2020',
    telephone: GEO_ENTITY.telephone,
    email: GEO_ENTITY.email,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: GEO_ENTITY.telephone,
        contactType: 'customer service',
        areaServed: 'GB',
        availableLanguage: ['English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: GEO_ENTITY.mobileWhatsapp,
        contactType: 'sales',
        contactOption: 'WhatsApp',
        areaServed: 'GB',
        availableLanguage: ['English'],
      },
    ],
    sameAs: [
      'https://www.instagram.com/printtodayuk',
      'https://www.facebook.com/printtodayuk',
      'https://www.trustpilot.com/review/printtodayuk.com',
    ],
  };
}

/**
 * 2. Global WebSite Schema with Sitelinks SearchBox Action
 * Enables conversational agents to formulate search queries directly into the site.
 */
export function getGlobalWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: GEO_ENTITY.name,
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/all-products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-GB',
  };
}

/**
 * 3. PrintShop / LocalBusiness Schema with Speakable Specification
 * Essential for Local SEO, "near me" searches, and Voice Assistants (Siri / Alexa / Google Assistant).
 */
export function getPrintShopLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PrintShop',
    '@id': `${BASE_URL}/#printshop`,
    name: GEO_ENTITY.name,
    image: [GEO_ENTITY.logoUrl],
    url: BASE_URL,
    telephone: GEO_ENTITY.telephone,
    email: GEO_ENTITY.email,
    priceRange: GEO_ENTITY.priceRange,
    currenciesAccepted: GEO_ENTITY.currency,
    paymentAccepted:
      'Cash, Credit Card, Debit Card, Visa, Mastercard, American Express, Apple Pay, Google Pay, Bank Transfer, PayPal',
    address: {
      '@type': 'PostalAddress',
      streetAddress: GEO_ENTITY.address.streetAddress,
      addressLocality: GEO_ENTITY.address.addressLocality,
      addressRegion: GEO_ENTITY.address.addressRegion,
      postalCode: GEO_ENTITY.address.postalCode,
      addressCountry: GEO_ENTITY.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: GEO_ENTITY.geo.latitude,
      longitude: GEO_ENTITY.geo.longitude,
    },
    hasMap: GEO_ENTITY.googleMapsUrl,
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
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'London' },
      { '@type': 'AdministrativeArea', name: 'Greater London' },
      { '@type': 'Place', name: 'East London' },
      { '@type': 'Place', name: 'Newham' },
      { '@type': 'Place', name: 'Stratford' },
      { '@type': 'Place', name: 'Forest Gate' },
      { '@type': 'Place', name: 'East Ham' },
      { '@type': 'Place', name: 'Upton Park' },
      { '@type': 'Place', name: 'Canary Wharf' },
      { '@type': 'Place', name: 'City of London' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'E7' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'E6' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'E13' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'E15' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'E14' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'EC1' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'EC2' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'WC1' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'WC2' },
      { '@type': 'PostalCodeRangeSpecification', postalCode: 'SE1' },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.6',
      reviewCount: '90',
      bestRating: '5',
      worstRating: '1',
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['.aeo-quick-answer', '.aeo-summary', 'h1', '.speakable-text'],
    },
    sameAs: [
      'https://www.instagram.com/printtodayuk',
      'https://www.trustpilot.com/review/printtodayuk.com',
    ],
  };
}

/**
 * 4. FAQPage Schema Generator
 * Feeds structured Q&A directly into Google AI Overviews, Perplexity citations, and Voice Answers.
 */
export function getFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 5. HowTo Schema: How to Order Same-Day Printing in London
 */
export function getHowToOrderSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Order Same-Day Printing in London',
    description:
      'Step-by-step guide to ordering express same-day business cards, flyers, roller banners, documents, and apparel with 3-hour turnaround, free Green St collection, or London courier.',
    totalTime: 'PT3H',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'GBP',
      value: '18.84',
    },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Your Print Product and Turnaround',
        text: 'Browse our catalog (business cards, flyers, roller banners, t-shirts, documents) and select Same-Day express production.',
        url: `${BASE_URL}/all-products`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Upload Your Print-Ready Artwork',
        text: 'Upload your file (PDF, AI, PSD, or PNG) with 3mm bleed and 300 DPI CMYK resolution. Our preflight team checks every file for free.',
        url: `${BASE_URL}/artwork-guides`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Instant Production at Our East London Studio',
        text: 'Your order goes straight to our high-precision digital presses and wide-format printers at 75 Green Street, London E7 8JF.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Free Studio Collection or Express Courier Delivery',
        text: 'Collect in as little as 3 hours with free on-site parking at 75 Green Street E7 8JF, or have our London bike & van couriers deliver straight to your door.',
        url: `${BASE_URL}/same-day-printing`,
      },
    ],
  };
}

/**
 * Core Homepage AEO FAQs covering top voice and Generative Engine queries
 */
export const HOMEPAGE_AEO_FAQS = [
  {
    question: 'Where can I get same-day printing in London with fast in-person collection?',
    answer:
      'You can collect same-day prints in as little as 3 hours from Print Today UK at 75 Green Street, London, E7 8JF. Our in-house production facility operates 7 days a week (Mon–Fri 7am–8pm, Sat 8am–5pm, Sun 8am–4pm) with customer parking and free collection.',
  },
  {
    question: 'What is the daily cutoff time for London same-day printing orders?',
    answer:
      'For guaranteed same-day collection or London courier dispatch, place your order and approve artwork before 2:00 PM Monday through Friday. For urgent emergency out-of-hours print runs, message our London production desk on WhatsApp (+44 7969 559746).',
  },
  {
    question: 'Which print products can be produced same-day in London?',
    answer:
      'We manufacture business cards (400gsm silk/matt/gloss), promotional flyers and folded leaflets, pull-up roller banners, PVC vinyl banners, foam board signs, posters up to A0, architectural drawings, bound booklets, stapled documents, and custom DTF printed t-shirts and hoodies same-day in-house.',
  },
  {
    question: 'Can you deliver printed items by same-day courier across Central and Greater London?',
    answer:
      'Yes. In addition to free collection from our Green Street studio in East London, we provide direct same-day motorcycle and dedicated van couriers delivering across Central London (EC1–EC4, WC1–WC2), Canary Wharf (E14), Stratford (E15), and all London boroughs within 2 to 4 hours of job completion.',
  },
  {
    question: 'What file format, resolution, and bleed are required for printing?',
    answer:
      'We recommend press-ready PDF files set to 300 DPI resolution in CMYK color mode with 3mm bleed on all outer edges and crop marks. We also accept high-resolution PNG, TIFF, Adobe Illustrator (.AI), and Photoshop (.PSD) files. Our in-house team provides a free preflight inspection on every order.',
  },
  {
    question: 'Can I print custom t-shirts, hoodies, or workwear on the same day in London?',
    answer:
      'Yes. We utilize industrial Direct-to-Film (DTF) apparel printing at our London studio. We offer single custom samples up to bulk orders of 1,000+ units with vibrant, wash-durable full-color graphics on 100% cotton garments.',
  },
];
