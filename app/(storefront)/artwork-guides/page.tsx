import { Metadata } from 'next';
import { getArtworkGuides } from '@/lib/db';
import { ArtworkGuidesClient } from '@/components/storefront/ArtworkGuidesClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Artwork Hub & Technical Print Guides | Print Today London',
  description:
    'Comprehensive technical artwork setup guides, bleed specifications, resolution standards, and preflight checklists for London same-day digital printing.',
  keywords: [
    'print artwork guide',
    '3mm bleed explained',
    '300 dpi print resolution',
    'cmyk vs rgb printing',
    'print-ready pdf checklist',
    'roller banner artwork dimensions',
    'London digital printer artwork specs',
  ],
  alternates: {
    canonical: 'https://printtodayuk.com/artwork-guides',
  },
  openGraph: {
    title: 'Artwork Guides & Print Specifications | Print Today UK',
    description:
      'Learn how to supply print-ready files: 3mm bleed, 300 DPI, CMYK color profiles, and preflight checklists.',
    url: 'https://printtodayuk.com/artwork-guides',
    siteName: 'Print Today UK',
    locale: 'en_GB',
    type: 'website',
  },
};

export default async function ArtworkGuidesPage() {
  const guides = await getArtworkGuides(false);

  return <ArtworkGuidesClient initialGuides={guides} />;
}

