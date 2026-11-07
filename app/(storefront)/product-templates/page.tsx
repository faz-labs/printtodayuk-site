import { Metadata } from 'next';
import Link from 'next/link';
import {
  Ruler,
  FilePdf,
  DownloadSimple,
  ArrowRight,
  ShieldCheck,
  EnvelopeSimple,
  Sparkle,
  CheckCircle,
  CaretRight,
  Printer,
} from '@phosphor-icons/react/dist/ssr';

export const metadata: Metadata = {
  title: 'Free Product Templates & Print Dielines | Print Today London',
  description:
    'Download standard UK print templates and exact dieline specifications for business cards, A5/A4 flyers, folded leaflets, and roller banners.',
  alternates: {
    canonical: 'https://printtodayuk.com/product-templates',
  },
  openGraph: {
    title: 'Product Templates & Print Dielines | Print Today UK',
    description:
      'Exact trim sizes, 3mm bleed tolerances, and safe margins for all standard UK print products.',
    url: 'https://printtodayuk.com/product-templates',
  },
};

const TEMPLATES = [
  {
    category: 'Flyers & Leaflets',
    items: [
      { name: 'A7 Flyer', trim: '74 × 105 mm', bleed: '80 × 111 mm', pixels300dpi: '945 × 1311 px' },
      { name: 'A6 Postcard / Flyer', trim: '105 × 148 mm', bleed: '111 × 154 mm', pixels300dpi: '1311 × 1819 px' },
      { name: 'A5 Flyer (Most Popular)', trim: '148 × 210 mm', bleed: '154 × 216 mm', pixels300dpi: '1819 × 2551 px' },
      { name: 'A4 Leaflet / Menu', trim: '210 × 297 mm', bleed: '216 × 303 mm', pixels300dpi: '2551 × 3579 px' },
      { name: 'A3 Poster / Placemat', trim: '297 × 420 mm', bleed: '303 × 426 mm', pixels300dpi: '3579 × 5031 px' },
      { name: 'DL Flyer (1/3 A4)', trim: '99 × 210 mm', bleed: '105 × 216 mm', pixels300dpi: '1240 × 2551 px' },
      { name: 'Square Flyer', trim: '148 × 148 mm', bleed: '154 × 154 mm', pixels300dpi: '1819 × 1819 px' },
    ],
  },
  {
    category: 'Business Cards',
    items: [
      { name: 'Standard UK Business Card', trim: '85 × 55 mm', bleed: '91 × 61 mm', pixels300dpi: '1075 × 720 px' },
      { name: 'Square Business Card', trim: '55 × 55 mm', bleed: '61 × 61 mm', pixels300dpi: '720 × 720 px' },
      { name: 'Mini Business Card', trim: '66 × 55 mm', bleed: '72 × 61 mm', pixels300dpi: '850 × 720 px' },
      { name: 'Folded Business Card (Horizontal)', trim: '170 × 55 mm', bleed: '176 × 61 mm', pixels300dpi: '2079 × 720 px' },
    ],
  },
  {
    category: 'Roller Banners & Large Format',
    items: [
      { name: '800mm Roller Banner', trim: '800 × 2000 mm', bleed: '806 × 2153 mm (incl. 150mm base)', pixels300dpi: '4759 × 12715 px (at 150 DPI)' },
      { name: '850mm Roller Banner', trim: '850 × 2000 mm', bleed: '856 × 2153 mm (incl. 150mm base)', pixels300dpi: '5055 × 12715 px (at 150 DPI)' },
      { name: '1000mm Roller Banner', trim: '1000 × 2000 mm', bleed: '1006 × 2153 mm (incl. 150mm base)', pixels300dpi: '5941 × 12715 px (at 150 DPI)' },
      { name: 'A2 Poster', trim: '420 × 594 mm', bleed: '426 × 600 mm', pixels300dpi: '5031 × 7087 px' },
      { name: 'A1 Poster', trim: '594 × 841 mm', bleed: '600 × 847 mm', pixels300dpi: '7087 × 10012 px' },
      { name: 'A0 Giant Poster', trim: '841 × 1189 mm', bleed: '847 × 1195 mm', pixels300dpi: '10012 × 14114 px' },
    ],
  },
];

export default function ProductTemplatesPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#012169] transition-colors">
            Home
          </Link>
          <CaretRight weight="bold" className="h-3 w-3 text-slate-400" />
          <Link href="/artwork-guides" className="hover:text-[#012169] transition-colors">
            Artwork Hub
          </Link>
          <CaretRight weight="bold" className="h-3 w-3 text-slate-400" />
          <span className="font-semibold text-slate-900">Product Templates &amp; Dielines</span>
        </div>
      </div>

      {/* Header */}
      <section className="bg-gradient-to-b from-[#012169] to-[#011438] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-red-300">
            <Ruler weight="bold" className="h-4 w-4 text-amber-300" />
            <span>UK Standard Commercial Dielines</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Product Templates &amp; <span className="text-red-400">Dimensions</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Ensure your artwork aligns perfectly with London press standards. Refer to exact trim lines, 3mm bleed margins, and pixel dimensions below.
          </p>
        </div>
      </section>

      {/* Tables Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="space-y-10">
          {TEMPLATES.map((section) => (
            <div
              key={section.category}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#012169]" />
                  <span>{section.category}</span>
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  3mm Bleed Required
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Finished Trim Size</th>
                      <th className="py-3 px-4">Artwork Size (With 3mm Bleed)</th>
                      <th className="py-3 px-4">Pixel Canvas (300 DPI)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {section.items.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{row.name}</td>
                        <td className="py-3.5 px-4 font-mono text-[#012169] font-semibold">{row.trim}</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">{row.bleed}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">{row.pixels300dpi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Prepress Box */}
        <div className="mt-12 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-black text-slate-900">Need Custom Dimensions or Blank Template Files?</h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Our prepress team can generate blank PDF or InDesign dielines for packaging, folders, or custom cutouts.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/artwork-guides"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Artwork Guides
            </Link>
            <a
              href="mailto:artwork@printtodayuk.com?subject=Custom%20Dieline%20Request"
              className="px-5 py-2.5 rounded-xl bg-[#012169] hover:bg-[#00174c] text-white text-xs font-bold transition-colors shadow-xs"
            >
              Request Custom Dieline
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
