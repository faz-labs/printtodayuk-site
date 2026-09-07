import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
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
    <html lang="en" className={`${inter.variable} ${inter.className}`}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[#C8102E] selection:text-white">
        {children}
      </body>
    </html>
  );
}
