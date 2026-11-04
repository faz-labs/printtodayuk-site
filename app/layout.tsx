import type { Metadata, Viewport } from 'next';
import { Lato } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { ScrollToTop } from '@/components/providers/ScrollToTop';

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://printtodayuk.com'),
  title: 'Print Today | Same Day Custom Printing & Apparel in London',
  description:
    'Custom business cards, flyers, booklets, brochures, t-shirts, hoodies, PVC banners, and ID cards with same-day small & large batch delivery across London.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lato.variable} ${lato.className}`}>
      <body className={`${lato.className} min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#C8102E] selection:text-white`}>
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
