'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lightning,
  Phone,
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  ShieldCheck,
  Truck,
  Sparkle,
  ShareNetwork,
  CheckCircle,
  CaretDown,
  Star,
} from '@phosphor-icons/react';
import { Product } from '@/lib/types';
import { getProductById, getProducts } from '@/lib/db';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import { ImageWithFallback } from '@/components/storefront/ImageWithFallback';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductDetailTabs } from '@/components/storefront/ProductDetailTabs';
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
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      if (!idOrSlug) return;
      setLoading(true);
      try {
        const prod = await getProductById(idOrSlug);
        setProduct(prod);
        setSelectedImageIndex(0);
        if (prod) {
          setQuantity(prod.minQuantity || 1);
          // Initialize default selected options
          if (prod.customFields && prod.customFields.length > 0) {
            const initialOpts: Record<string, string> = {};
            prod.customFields.forEach((field) => {
              if (field.options && field.options.length > 0) {
                initialOpts[field.name] = field.defaultValue || field.options[0];
              }
            });
            setSelectedOptions(initialOpts);
          }

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
          <Sparkle className="h-8 w-8" weight="duotone" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The requested product may have been moved or updated.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#012169] text-white font-bold rounded-xl text-xs hover:bg-[#0A358C]"
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

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [];
  const currentImage = productImages[selectedImageIndex] || product.imageUrl;

  return (
    <div className="py-8 sm:py-12 space-y-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href={product.category === 'Clothing' ? '/clothing' : '/'}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#012169] transition-colors"
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
                <CheckCircle weight="fill" className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <ShareNetwork weight="bold" className="h-3.5 w-3.5" />
                <span>Share Product</span>
              </>
            )}
          </button>
        </div>

        {/* Main Product Details View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left Column: Image Gallery & Studio Guarantees */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24">
            <div className="relative w-full aspect-square bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200/80">
              <ImageWithFallback
                src={currentImage}
                alt={product.title}
                fallbackText={product.title}
                priority
                className="object-cover"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.isSameDayAvailable && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#012169] text-white font-bold text-xs shadow-lg">
                    <Lightning weight="fill" className="h-3.5 w-3.5 text-amber-300" />
                    <span>Same-Day London Dispatch</span>
                  </span>
                )}
                {discount && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#C8102E] text-white font-black text-xs shadow-lg">
                    Special Offer: {discount}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery for Multiple Pictures */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5">
                {productImages.map((imgUrl, idx) => {
                  const isSelected = idx === selectedImageIndex;
                  return (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-100 ${
                        isSelected
                          ? 'border-[#012169] ring-2 ring-[#012169]/30 shadow-md scale-105'
                          : 'border-slate-200 opacity-70 hover:opacity-100 hover:border-slate-300'
                      }`}
                    >
                      <ImageWithFallback
                        src={imgUrl}
                        alt={`${product.title} view ${idx + 1}`}
                        fallbackText={`${idx + 1}`}
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Studio Guarantee Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center shadow-xs">
                <Clock weight="duotone" className="h-5 w-5 text-[#C8102E] mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">Same Day Pickup</div>
                <div className="text-[10px] text-slate-500">Ready in 2-4 hours</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center shadow-xs">
                <MapPin weight="fill" className="h-5 w-5 text-[#012169] mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">London Studio</div>
                <div className="text-[10px] text-slate-500">75 Green St, E7 8JF</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 text-center shadow-xs">
                <ShieldCheck weight="duotone" className="h-5 w-5 text-[#012169] mx-auto mb-1" />
                <div className="text-xs font-bold text-slate-900">100% Quality</div>
                <div className="text-[10px] text-slate-500">Free Artwork Check</div>
              </div>
            </div>
          </div>

          {/* Right Column: Information, Options & Pricing */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#012169]">
                  {product.category}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-500">
                  {product.subcategory}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                  <Star weight="fill" className="h-3.5 w-3.5" />
                  <span>4.9 (1,240+ reviews)</span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {product.title}
              </h1>

              {/* Dynamic Price Breakdown (Vistaprint Style) */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Estimated Price
                  </div>
                  <div className="flex items-baseline gap-3 mt-0.5">
                    <span className="text-3xl font-black text-[#012169]">
                      {formatCurrency(basePrice * (quantity === product.minQuantity ? 1 : Math.max(1, (quantity / (product.minQuantity || 100)) * 0.85)))}
                    </span>
                    {product.discountedPrice && (
                      <span className="text-base text-slate-400 line-through">
                        {formatCurrency(product.price * (quantity === product.minQuantity ? 1 : Math.max(1, (quantity / (product.minQuantity || 100)) * 0.85)))}
                      </span>
                    )}
                  </div>
                </div>

                <div className="sm:text-right">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Unit Price
                  </div>
                  <div className="text-sm font-bold text-slate-700 mt-0.5">
                    £{((basePrice * (quantity === product.minQuantity ? 1 : Math.max(1, (quantity / (product.minQuantity || 100)) * 0.85))) / quantity).toFixed(2)} each
                  </div>
                </div>
              </div>
            </div>

            {/* Vistaprint-Style Quantity Selection Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Select Quantity
                </label>
                <span className="text-xs font-bold text-[#012169]">
                  {quantity} units selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { qty: product.minQuantity || 100, label: 'Standard' },
                  { qty: (product.minQuantity || 100) * 2, label: 'Popular' },
                  { qty: (product.minQuantity || 100) * 5, label: 'Best Value' },
                  { qty: (product.minQuantity || 100) * 10, label: 'Bulk Savings' },
                ].map((tier) => {
                  const isSelected = quantity === tier.qty;
                  return (
                    <button
                      key={tier.qty}
                      type="button"
                      onClick={() => setQuantity(tier.qty)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-[#012169] bg-[#012169]/8 ring-2 ring-[#012169]/20 text-[#012169] font-bold'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-black">{tier.qty} units</div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {tier.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* London Studio Delivery & Collection Speed Box */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-2.5">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock weight="bold" className="h-4 w-4 text-[#C8102E]" />
                <span>London Dispatch & Collection Options</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50">
                  <Lightning weight="fill" className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">Same-Day Studio Pickup (Free)</div>
                    <div className="text-slate-500 text-[11px]">Ready today from 2:00 PM at 75 Green St, E7 8JF if ordered before 12pm.</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50">
                  <Truck weight="bold" className="h-4 w-4 text-[#012169] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">London Express Courier</div>
                    <div className="text-slate-500 text-[11px]">Same-day evening door delivery anywhere in Greater London.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Product Options & Dropdowns */}
            {product.customFields && product.customFields.length > 0 && (
              <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
                  <Sparkle weight="fill" className="h-4 w-4 text-[#C8102E]" />
                  <span>Choose Your Specifications</span>
                </div>

                <div className="space-y-4">
                  {product.customFields.map((field) => (
                    <div key={field.id || field.name} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800">
                          {field.name}
                        </label>
                        {selectedOptions[field.name] && (
                          <span className="text-[11px] font-semibold text-[#012169] bg-[#012169]/8 px-2 py-0.5 rounded-md">
                            Selected: {selectedOptions[field.name]}
                          </span>
                        )}
                      </div>

                      {/* Dropdown Selector */}
                      <div className="relative">
                        <select
                          value={selectedOptions[field.name] || field.options[0]}
                          onChange={(e) =>
                            setSelectedOptions((prev) => ({
                              ...prev,
                              [field.name]: e.target.value,
                            }))
                          }
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 focus:bg-white cursor-pointer appearance-none pr-10 transition-all"
                        >
                          {field.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <CaretDown weight="bold" className="h-4 w-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() =>
                  openCallMe(
                    `${product.title} (${quantity} units)`,
                    selectedOptions
                  )
                }
                className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#C8102E] to-[#A80C24] hover:from-[#A80C24] hover:to-[#85081C] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-red-900/20 transition-all transform hover:scale-102 cursor-pointer border border-red-700/40"
              >
                <Phone weight="fill" className="h-4 w-4 text-white" />
                <span>Confirm Order / Request Same-Day Quote</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://wa.me/447969559746"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-sm transition-colors text-center"
                >
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  onClick={() =>
                    openCallMe(
                      `Artwork Proof Check for ${product.title}`,
                      selectedOptions
                    )
                  }
                  className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-colors cursor-pointer"
                >
                  <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#012169]" />
                  <span>Free Artwork Proof</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Vistaprint-Style Lower Tabs: Overview, Specs, Finishes, Reviews & FAQs */}
        <ProductDetailTabs product={product} />
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
                className="text-xs font-bold text-[#012169] hover:underline"
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
