import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

const lato = Lato({
  subsets: ['latin'],
  weight: ['100', '300', '400', '700', '900'],
  display: 'swap',
  variable: '--font-lato',
});

export const metadata: Metadata = {
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
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
