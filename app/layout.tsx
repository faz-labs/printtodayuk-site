import type { Metadata, Viewport } from 'next';
import { Lato } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { ScrollToTop } from '@/components/providers/ScrollToTop';
import {
  getGlobalOrganizationSchema,
  getGlobalWebSiteSchema,
  getPrintShopLocalBusinessSchema,
} from '@/lib/geo-aeo-schemas';

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  display: 'swap',
  variable: '--font-lato',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.printtodayuk.com'),
  title: {
    default: 'Same-Day Printing London | Print Today UK',
    template: '%s | Print Today UK',
  },
  description:
    'In-house same-day printing in East London: business cards, flyers, banners, t-shirts and more. Collect free from Green St or London courier.',
  keywords: [
    'print shop near me',
    'printing shop near me',
    'same day printing london',
    'same day printing',
    'printing services london',
    'business cards near me',
    't shirt printing london',
    'roller banners london',
    'flyers printing london',
    'document printing near me',
    'east london printer',
    'Print Today UK',
  ],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const globalKnowledgeGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      getGlobalOrganizationSchema(),
      getGlobalWebSiteSchema(),
      getPrintShopLocalBusinessSchema(),
    ],
  };

  return (
    <html lang="en" className={`${lato.variable} ${lato.className}`}>
      <body className={`${lato.className} min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#C8102E] selection:text-white`}>
        {/* GEO & AEO Global Knowledge Graph (Organization, WebSite & PrintShop) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(globalKnowledgeGraph),
          }}
        />

        {/* Google tag (gtag.js) - Google Analytics (G-0FWH5K8KNN) & Google Ads (AW-819537929) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-0FWH5K8KNN"
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-819537929"
        />
        <Script
          id="google-tag-manager-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-819537929');
              gtag('config', 'G-0FWH5K8KNN');
            `,
          }}
        />
        <ScrollToTop />
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
