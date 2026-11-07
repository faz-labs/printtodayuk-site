import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  CaretRight,
  Clock,
  CalendarBlank,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  EnvelopeSimple,
  Chats,
  CheckCircle,
  FilePdf,
  ShareNetwork,
  Printer,
  Sparkle,
} from '@phosphor-icons/react/dist/ssr';
import { getArtworkGuideBySlug, getArtworkGuides } from '@/lib/db';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getArtworkGuideBySlug(slug);

  if (!guide) {
    return {
      title: 'Artwork Guide Not Found | Print Today London',
    };
  }

  return {
    title: `${guide.title} | Artwork Guides | Print Today London`,
    description: guide.shortDescription,
    alternates: {
      canonical: `https://printtodayuk.com/artwork-guides/${guide.slug}`,
    },
    openGraph: {
      title: `${guide.title} | Print Today Artwork Hub`,
      description: guide.shortDescription,
      url: `https://printtodayuk.com/artwork-guides/${guide.slug}`,
      siteName: 'Print Today UK',
      images: [
        {
          url: guide.imageUrl,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
      type: 'article',
    },
  };
}

export default async function ArtworkGuideDetailPage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = await getArtworkGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  // Fetch related guides
  const allGuides = await getArtworkGuides(false);
  const otherGuides = allGuides.filter((g) => g.id !== guide.id).slice(0, 3);

  const formattedDate = guide.updatedAt
    ? new Date(guide.updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recently Updated';

  return (
    <div className="bg-slate-50 min-h-screen font-sans pb-24">
      {/* Top Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-2 text-xs text-slate-500 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-[#012169] transition-colors shrink-0">
            Home
          </Link>
          <CaretRight weight="bold" className="h-3 w-3 text-slate-400 shrink-0" />
          <Link href="/artwork-guides" className="hover:text-[#012169] transition-colors shrink-0">
            Artwork Hub
          </Link>
          <CaretRight weight="bold" className="h-3 w-3 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 truncate">{guide.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Back Link */}
        <Link
          href="/artwork-guides"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#012169] transition-colors mb-6 group"
        >
          <ArrowLeft weight="bold" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to all Artwork Guides</span>
        </Link>

        {/* Article Header Card */}
        <header className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#012169] text-white">
              {guide.category || 'Artwork Setup'}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <Clock weight="bold" className="h-4 w-4 text-slate-400" />
              <span>{guide.readingTime || '3 min read'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <CalendarBlank weight="bold" className="h-4 w-4 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            {guide.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {guide.shortDescription}
          </p>
        </header>

        {/* Featured Image */}
        {guide.imageUrl && (
          <div className="relative aspect-16/9 md:aspect-21/9 w-full rounded-3xl overflow-hidden shadow-md border border-slate-200/80 mb-10 bg-slate-100">
            <img
              src={guide.imageUrl}
              alt={guide.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Content Layout (Article + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Rich Article Body */}
          <main className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs">
            <div
              className="prose prose-slate prose-lg max-w-none text-slate-800 leading-relaxed
                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900
                prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-slate-100
                prose-h3:text-lg prose-h3:sm:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:leading-relaxed prose-p:my-4 prose-p:text-slate-700
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1.5 prose-li:text-slate-700
                prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2
                prose-strong:font-bold prose-strong:text-slate-900
                prose-blockquote:border-l-4 prose-blockquote:border-[#012169] prose-blockquote:bg-blue-50/70 prose-blockquote:p-4 prose-blockquote:rounded-r-2xl prose-blockquote:not-italic prose-blockquote:my-6
                prose-a:text-[#012169] prose-a:font-bold prose-a:underline hover:prose-a:text-[#C8102E]"
              dangerouslySetInnerHTML={{ __html: guide.content }}
            />

            {/* Bottom Article Sign-off */}
            <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-[#012169] text-white flex items-center justify-center font-bold">
                  PT
                </div>
                <div>
                  <div className="font-bold text-slate-900">Print Today Technical Prepress Team</div>
                  <div className="text-[11px] text-slate-400">75 Green St, London E7 8JF</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/artwork-guides"
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  All Artwork Guides
                </Link>
              </div>
            </div>
          </main>

          {/* Right Column: Preflight Box, Specs Summary & Related Guides */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Free Preflight Check Box */}
            <div className="bg-gradient-to-br from-[#012169] to-[#011438] rounded-3xl p-6 text-white shadow-lg space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/30 text-[11px] font-bold text-red-300">
                <ShieldCheck weight="fill" className="h-4 w-4 text-red-400" />
                <span>Prepress Studio Assist</span>
              </div>

              <h3 className="text-xl font-black text-white leading-snug">
                Need us to check your artwork?
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Send your PDF or design files to our London prepress studio. We check bleed, resolution, and font embedding free of charge.
              </p>

              <div className="space-y-2 pt-2">
                <a
                  href="mailto:artwork@printtodayuk.com?subject=Artwork%20Preflight%20Review"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#C8102E] hover:bg-[#A80C24] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <EnvelopeSimple weight="bold" className="h-4 w-4" />
                  <span>Email Artwork to Studio</span>
                </a>
                <a
                  href="https://wa.me/447969559746?text=Hi%2C%20can%20you%20check%20my%20artwork%20file%3F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/20"
                >
                  <Chats weight="bold" className="h-4 w-4 text-emerald-300" />
                  <span>WhatsApp Live Help</span>
                </a>
              </div>
            </div>

            {/* Quick Print Specs Cheat Sheet */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900">
                <Sparkle weight="bold" className="h-4 w-4 text-amber-500" />
                <span>Quick Specs Reference</span>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Bleed:</strong> 3mm on all 4 edges (6mm total width/height)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Safe Margin:</strong> Keep text 5mm away from the cut line
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Resolution:</strong> 300 DPI at 100% printed scale
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Color Profile:</strong> CMYK (FOGRA39 or ISO Coated v2)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-slate-900">Format:</strong> High Quality Print PDF (PDF/X-1a)
                  </div>
                </li>
              </ul>

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href="/product-templates"
                  className="w-full inline-flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#012169] transition-colors"
                >
                  <span>Download Product Dielines</span>
                  <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Related Artwork Guides */}
            {otherGuides.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Recommended Guides
                </h3>

                <div className="divide-y divide-slate-100 space-y-3">
                  {otherGuides.map((og) => (
                    <Link
                      key={og.id}
                      href={`/artwork-guides/${og.slug}`}
                      className="block pt-3 first:pt-0 group"
                    >
                      <span className="text-[10px] font-bold text-[#012169] uppercase tracking-wider">
                        {og.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-2 mt-0.5">
                        {og.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                        {og.shortDescription}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Ready to Order CTA */}
            <div className="bg-slate-100 rounded-3xl p-6 border border-slate-200 text-center space-y-3">
              <Printer weight="duotone" className="h-10 w-10 text-[#012169] mx-auto" />
              <h4 className="text-sm font-black text-slate-900">Ready to Print in London?</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Same-day dispatch and 24-hour collection available from our Stratford studio.
              </p>
              <Link
                href="/all-products"
                className="inline-flex items-center justify-center gap-1.5 w-full py-3 rounded-xl bg-[#012169] hover:bg-[#00174c] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <span>Browse Print Products</span>
                <ArrowRight weight="bold" className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

