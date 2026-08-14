'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap,
  Phone,
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  Truck,
  Sparkles,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Product } from '@/lib/types';
import { getProductById, getProducts } from '@/lib/db';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { ImageWithFallback } from '@/components/storefront/ImageWithFallback';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { useCallMe } from '@/components/storefront/CallMeContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { openCallMe } = useCallMe();

  const idOrSlug = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState<number>(100);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        const prod = await getProductById(idOrSlug);
        setProduct(prod);
        if (prod) {
          setQuantity(prod.minQuantity || 1);
          // Load related products
          const allProds = await getProducts(prod.category);
          setRelatedProducts(
            allProds.filter((p) => p.id !== prod.id && p.slug !== prod.slug).slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-4/3 bg-slate-200 rounded-3xl" />
          <div className="space-y-6">
            <div className="h-6 bg-slate-200 rounded-md w-1/4" />
            <div className="h-10 bg-slate-200 rounded-md w-3/4" />
            <div className="h-20 bg-slate-100 rounded-md w-full" />
            <div className="h-12 bg-slate-200 rounded-xl w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The requested product may have been moved or updated.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#4a0e35] text-white font-bold rounded-xl text-xs hover:bg-[#5d1243]"
          >
            Back to All Products
          </Link>
          <button
            onClick={() => openCallMe('Product Inquiry')}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200"
          >
            Ask a Specialist
          </button>
        </div>
      </div>
    );
  }

  const basePrice = product.discountedPrice || product.price;
  const discount = calculateDiscount(product.price, product.discountedPrice);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="py-8 sm:py-12 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href={product.category === 'Clothing' ? '/clothing' : '/'}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#4a0e35] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {product.category} Catalog</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share Product</span>
              </>
            )}
          </button>
        </div>

        {/* Main Product Details View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative w-full max-w-[400px] h-[400px] aspect-square mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-200/80">
              <ImageWithFallback
                src={product.imageUrl}
                alt={product.title}
                fallbackText={product.title}
                priority
                className="object-cover"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isSameDayAvailable && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-lg">
                    <Zap className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    <span>Same-Day London Dispatch</span>
                  </span>
                )}
                {discount && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-rose-600 text-white font-black text-xs shadow-lg">
                    Special Offer: {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Studio Guarantee Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center shadow-xs">
                <Clock className="h-5 w-5 text-rose-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">Same Day Pickup</div>
                <div className="text-[10px] text-slate-500">Ready in 2-4 hours</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center shadow-xs">
                <MapPin className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">London Studio</div>
                <div className="text-[10px] text-slate-500">75 Green St, E7 8JF</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center shadow-xs">
                <ShieldCheck className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">100% Quality</div>
                <div className="text-[10px] text-slate-500">Free Artwork Check</div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Pricing */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4a0e35]">
                  {product.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {product.subcategory}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.title}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-[#4a0e35]">
                  {formatCurrency(basePrice)}
                </span>
                {product.discountedPrice && (
                  <span className="text-base text-slate-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                )}
                <span className="text-xs font-bold text-slate-500">
                  {product.minQuantity ? `(Min order: ${product.minQuantity} units)` : ''}
                </span>
              </div>
            </div>

            {/* Same-day Emergency Callout */}
            {product.isSameDayAvailable && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                    <Zap className="h-4 w-4 fill-amber-300 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900">
                      Need This Today in London?
                    </h4>
                    <p className="mt-0.5 text-xs text-emerald-700 leading-relaxed">
                      Order or request a quote before 12pm for guaranteed same-day collection at our Green St studio or London express courier.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                Description & Specifications
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Features Checklist */}
            {product.features && product.features.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">
                  Key Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/70 border border-slate-200/60 text-xs font-medium text-slate-800"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="pt-4 space-y-3">
              <button
                onClick={() => openCallMe(product.title)}
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#4a0e35] to-[#67154a] hover:from-[#591240] hover:to-[#781957] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#4a0e35]/25 transition-all transform hover:scale-102 cursor-pointer"
              >
                <Phone className="h-4 w-4 text-rose-300" />
                <span>Request Same-Day Quote / Call Me</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:02081234567"
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors"
                >
                  <span>Dial 020 8123 4567</span>
                </a>

                <button
                  onClick={() => openCallMe(`Artwork Check for ${product.title}`)}
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#4a0e35]" />
                  <span>Free Artwork Proof</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-slate-100/60 py-16 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  Related {product.category} Products
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Explore other popular same-day items in this category.
                </p>
              </div>
              <Link
                href={product.category === 'Clothing' ? '/clothing' : '/'}
                className="text-xs font-bold text-[#4a0e35] hover:underline"
              >
                View Full Catalog →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id || p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
