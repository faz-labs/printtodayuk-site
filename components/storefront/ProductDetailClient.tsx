'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  CaretUp,
  Printer,
  Package,
  FileText,
  ChatCircleDots,
  WhatsappLogo,
  Question,
} from '@phosphor-icons/react';
import { Product, CustomField } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { ImageWithFallback } from '@/components/storefront/ImageWithFallback';
import { ProductCard } from '@/components/storefront/ProductCard';
import { useCallMe } from '@/components/storefront/CallMeContext';
import { getLocalProducts } from '@/lib/db';
import {
  getWorkingDueDates,
  calculatePrintWeight,
  generateDynamicPriceMatrix,
  calculateCustomQuantityPrice,
  cleanOptionDisplayName,
  parseOptionModifier,
} from '@/lib/pricingEngine';

interface ProductDetailClientProps {
  productIdOrSlug?: string;
  initialProduct: Product | null;
  initialRelatedProducts: Product[];
}

export function ProductDetailClient({
  productIdOrSlug,
  initialProduct,
  initialRelatedProducts,
}: ProductDetailClientProps) {
  const { openCallMe } = useCallMe();

  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>(initialRelatedProducts);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Real-time synchronization when CMS edits a product
  useEffect(() => {
    const syncFromLocal = () => {
      const local = getLocalProducts();
      const target = (productIdOrSlug || product?.id || product?.slug || '').toLowerCase().trim();
      if (!target) return;
      const found = local.find(
        (p) =>
          (p.slug && p.slug.toLowerCase() === target) ||
          (p.id && p.id.toLowerCase() === target)
      );
      if (found) {
        setProduct(found);
      }
    };

    window.addEventListener('print_today_products_updated', syncFromLocal);
    window.addEventListener('storage', syncFromLocal);

    // Initial check on mount in case localStorage has newer CMS edits than SSR
    syncFromLocal();

    return () => {
      window.removeEventListener('print_today_products_updated', syncFromLocal);
      window.removeEventListener('storage', syncFromLocal);
    };
  }, [productIdOrSlug, product?.id, product?.slug]);

  useEffect(() => {
    if (initialProduct) {
      setProduct((prev) => {
        if (prev?.updatedAt && initialProduct.updatedAt && prev.updatedAt > initialProduct.updatedAt) {
          return prev;
        }
        return initialProduct;
      });
      setSelectedImageIndex(0);
    }
  }, [initialProduct]);

  useEffect(() => {
    setRelatedProducts(initialRelatedProducts);
  }, [initialRelatedProducts]);

  // FALLBACK DEFAULT SPECIFICATION STATE (used if product has no custom fields in CMS)
  const [finishedSize, setFinishedSize] = useState<string>('A5');
  const [printedSides, setPrintedSides] = useState<'Single Sided' | 'Double Sided'>('Single Sided');
  const [stock, setStock] = useState<string>('150gsm Silk');
  const [lamination, setLamination] = useState<string>('No Lamination');
  const [embellishment, setEmbellishment] = useState<string>('No Embellishment');
  const [numberOfSets, setNumberOfSets] = useState<number>(1);
  const [fileCopies, setFileCopies] = useState<string>('No');

  // CMS CUSTOM FIELD SELECTIONS (Driven 100% by CMS product configuration)
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>(() => {
    if (initialProduct?.customFields && initialProduct.customFields.length > 0) {
      const init: Record<string, string> = {};
      initialProduct.customFields.forEach((cf) => {
        if (cf.options && cf.options.length > 0) {
          init[cf.name] = cf.defaultValue || cf.options[0];
        }
      });
      return init;
    }
    return {};
  });

  // Keep customFieldValues in sync whenever the product's customFields change
  useEffect(() => {
    if (product?.customFields && product.customFields.length > 0) {
      setCustomFieldValues((prev) => {
        const next = { ...prev };
        product.customFields?.forEach((cf) => {
          if (cf.options && cf.options.length > 0) {
            // Keep previous selected value if it exists in current options, else default to first option
            if (!next[cf.name] || !cf.options.includes(next[cf.name])) {
              next[cf.name] = cf.defaultValue || cf.options[0];
            }
          }
        });
        return next;
      });
    }
  }, [product]);

  // MATRIX SELECTION STATE
  const [selectedQuantity, setSelectedQuantity] = useState<number>(() => {
    if (initialProduct?.quantityTiers && initialProduct.quantityTiers.length > 0) {
      return initialProduct.quantityTiers[0].quantity;
    }
    return initialProduct?.minQuantity && initialProduct.minQuantity > 0
      ? initialProduct.minQuantity
      : 25;
  });
  const [selectedSpeed, setSelectedSpeed] = useState<'sameDay' | 'nextDay' | 'standard'>('standard');
  const [customQuantityInput, setCustomQuantityInput] = useState<string>('');
  const [showAllQuantities, setShowAllQuantities] = useState(false);
  const tableScrollRef = useRef<HTMLDivElement>(null);

  // Directly capture mouse wheel on price matrix to scroll rows smoothly instead of window
  useEffect(() => {
    const el = tableScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.stopPropagation();
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;

      if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
        el.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  useEffect(() => {
    const firstQty =
      product?.quantityTiers && product.quantityTiers.length > 0
        ? product.quantityTiers[0].quantity
        : product?.minQuantity;
    if (firstQty && firstQty > 0) {
      setSelectedQuantity((prev) => (prev < firstQty ? firstQty : prev));
    }
  }, [product?.quantityTiers, product?.minQuantity]);

  // Accordion state for Left Column Pill Buttons
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // FAQ accordion state for bottom SEO section
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Dynamic Due Dates (skips weekends)
  const dueDates = useMemo(() => getWorkingDueDates(), []);

  // SEO FAQs with product context matching FAQPage JSON-LD Schema
  const productFaqs = useMemo(
    () => [
      {
        question: `Can I get ${product?.title || 'this item'} printed the same day in London?`,
        answer: `Yes! Print Today UK provides express same-day printing for ${
          product?.title || 'this product'
        }. Order online before our daily cutoff to pick up directly from our London studio at 75 Green Street, London, E7 8JF or choose express courier delivery directly to your door across London.`,
      },
      {
        question: `What artwork file formats and bleed are needed for ${product?.title || 'printing'}?`,
        answer: `We recommend supplying a press-ready PDF at 300 DPI in CMYK color mode with 3mm bleed on all edges. We also accept high-resolution AI, PSD, EPS, TIFF, and PNG files. Every order receives a complimentary 24-point prepress inspection before printing.`,
      },
      {
        question: `Where can I collect my ${product?.title || 'order'} in London?`,
        answer: `You can collect in person from our central London print studio at 75 Green Street, London, E7 8JF (open Monday through Saturday). We also offer rapid courier delivery directly to homes, corporate offices, hotels, event spaces, and venues across Central and Greater London.`,
      },
      {
        question: `Can I order bespoke or custom bulk quantities of ${product?.title || 'this item'}?`,
        answer: `Yes! While our matrix table provides instant tiered quotes up to 250,000 units, you can also enter any custom quantity directly on this product page or message our London production desk on WhatsApp (+44 7969 559746) for custom trade quotes.`,
      },
    ],
    [product?.title]
  );

  // Aggregated options map for the pricing engine
  const activeOptions = useMemo(() => {
    if (product?.customFields && product.customFields.length > 0) {
      return {
        ...customFieldValues,
      };
    }
    return {
      'Finished Size': finishedSize,
      'Printed Sides': printedSides,
      Stock: stock,
      Lamination: lamination,
      Embellishment: embellishment,
      'File Copies': fileCopies,
    };
  }, [
    product?.customFields,
    customFieldValues,
    finishedSize,
    printedSides,
    stock,
    lamination,
    embellishment,
    fileCopies,
  ]);

  // Base price anchor from CMS: set for minimum quantity on 3-5 working days (Standard delivery)
  const basePriceAnchor =
    product?.price && product.price > 0
      ? product.price
      : product?.quantityTiers && product.quantityTiers.length > 0 && typeof product.quantityTiers[0].price === 'number' && product.quantityTiers[0].price > 0
      ? product.quantityTiers[0].price
      : 14.69;

  // Has CMS Custom Fields defined?
  const hasCMSFields = Boolean(product?.customFields && product.customFields.length > 0);

  // Dynamic Physical Number of Sets: parsed from CMS dropdown if defined, otherwise 1
  const physicalNumberOfSets = useMemo(() => {
    if (hasCMSFields && product?.customFields) {
      const setKey = Object.keys(customFieldValues).find(
        (k) => /\bsets?\b/i.test(k) && !k.toLowerCase().includes('cassette') && !k.toLowerCase().includes('offset')
      );
      if (setKey) {
        const val = customFieldValues[setKey] || '';
        const match = val.match(/(\d+)\s*sets?/i) || val.match(/^(\d+)$/);
        if (match) {
          const parsed = parseInt(match[1], 10);
          return isNaN(parsed) || parsed < 1 ? 1 : Math.min(parsed, 100);
        }
      }
      return 1;
    }
    return numberOfSets;
  }, [hasCMSFields, product?.customFields, customFieldValues, numberOfSets]);



  // DYNAMIC PRICE MATRIX (Fully reactive to all dropdown options and sets)
  const effectiveMaxQty =
    product?.maxQuantity && product.maxQuantity >= (product?.minQuantity || 1)
      ? product.maxQuantity
      : 250000;

  const priceMatrix = useMemo(() => {
    return generateDynamicPriceMatrix(
      basePriceAnchor,
      activeOptions,
      physicalNumberOfSets,
      undefined,
      product?.minQuantity,
      product?.maxSameDayQuantity,
      hasCMSFields,
      effectiveMaxQty,
      product?.maxNextDayQuantity,
      product?.sameDayIncreasePercent,
      product?.nextDayIncreasePercent,
      product?.quantityTiers,
      product?.variantQuantityTiers
    );
  }, [
    basePriceAnchor,
    activeOptions,
    physicalNumberOfSets,
    product?.minQuantity,
    product?.maxSameDayQuantity,
    product?.maxNextDayQuantity,
    hasCMSFields,
    effectiveMaxQty,
    product?.sameDayIncreasePercent,
    product?.nextDayIncreasePercent,
    product?.quantityTiers,
    product?.variantQuantityTiers,
  ]);

  // Ensure selectedQuantity always matches a valid row in the matrix
  useEffect(() => {
    if (priceMatrix.length > 0) {
      const exists = priceMatrix.some((r) => r.quantity === selectedQuantity);
      if (!exists) {
        setSelectedQuantity(priceMatrix[0].quantity);
      }
    }
  }, [priceMatrix, selectedQuantity]);

  // Active Size and Stock names used for Dynamic Weight Calculation
  const activeSizeName = useMemo(() => {
    if (product?.customFields && product.customFields.length > 0) {
      // Find field matching "size"
      const sizeKey = Object.keys(customFieldValues).find((k) =>
        k.toLowerCase().includes('size')
      );
      if (sizeKey && customFieldValues[sizeKey]) {
        return customFieldValues[sizeKey];
      }
    }
    return finishedSize;
  }, [product?.customFields, customFieldValues, finishedSize]);

  const activeStockName = useMemo(() => {
    if (product?.customFields && product.customFields.length > 0) {
      // Find field matching "stock" or "paper"
      const stockKey = Object.keys(customFieldValues).find((k) =>
        k.toLowerCase().includes('stock') || k.toLowerCase().includes('paper')
      );
      if (stockKey && customFieldValues[stockKey]) {
        return customFieldValues[stockKey];
      }
    }
    return stock;
  }, [product?.customFields, customFieldValues, stock]);

  // DYNAMIC WEIGHT CALCULATION (Weight per item in grams & Total weight in kg)
  const printWeight = useMemo(() => {
    return calculatePrintWeight(activeSizeName, activeStockName, selectedQuantity, physicalNumberOfSets);
  }, [activeSizeName, activeStockName, selectedQuantity, physicalNumberOfSets]);

  // ACTIVE SELECTED CELL PRICE
  const currentSelectedPrice = useMemo(() => {
    const row = priceMatrix.find((r) => r.quantity === selectedQuantity) || priceMatrix[0];
    if (!row) return 19.89;
    let effectiveSpeed = selectedSpeed;
    if (effectiveSpeed === 'sameDay' && row.sameDay.isAvailable === false) {
      effectiveSpeed = row.nextDay.isAvailable !== false ? 'nextDay' : 'standard';
    } else if (effectiveSpeed === 'nextDay' && row.nextDay.isAvailable === false) {
      effectiveSpeed = 'standard';
    }
    return row[effectiveSpeed].price;
  }, [priceMatrix, selectedQuantity, selectedSpeed]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleAccordion = (key: string) => {
    setActiveAccordion((prev) => (prev === key ? null : key));
  };

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkle className="h-8 w-8" weight="duotone" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The requested product may have been moved or updated in our catalog.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 bg-[#012169] text-white font-bold rounded-xl text-xs hover:bg-[#0A358C] transition-colors"
          >
            Back to All Products
          </Link>
          <button
            onClick={() => openCallMe('Product Inquiry')}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Ask a Specialist
          </button>
        </div>
      </div>
    );
  }

  const productImages =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
      ? [product.imageUrl]
      : [];
  const currentImage = productImages[selectedImageIndex] || product.imageUrl;

  const speedLabels = {
    sameDay: {
      title: 'Same Day Express',
      dueDate: dueDates.sameDay,
    },
    nextDay: {
      title: '1 Working Day',
      dueDate: dueDates.nextDay,
    },
    standard: {
      title: '3-5 Working Days',
      dueDate: dueDates.standard,
    },
  };

  const handleSelectCell = (qty: number, speed: 'sameDay' | 'nextDay' | 'standard') => {
    setSelectedQuantity(qty);
    const row = priceMatrix.find((r) => r.quantity === qty);
    let effectiveSpeed = speed;
    if (effectiveSpeed === 'sameDay' && row?.sameDay.isAvailable === false) {
      effectiveSpeed = row?.nextDay.isAvailable !== false ? 'nextDay' : 'standard';
    } else if (effectiveSpeed === 'nextDay' && row?.nextDay.isAvailable === false) {
      effectiveSpeed = 'standard';
    }
    setSelectedSpeed(effectiveSpeed);
  };

  const handleConfirmOrder = () => {
    const finalQty = selectedQuantity;
    const finalSpeedTitle = speedLabels[selectedSpeed].title;
    const context = `${product.title} - ${finalQty.toLocaleString()} units (${finalSpeedTitle}, £${currentSelectedPrice.toFixed(
      2
    )}${physicalNumberOfSets > 1 ? `, ${physicalNumberOfSets} sets` : ''})`;

    const cleanedActiveOptions: Record<string, string> = {};
    for (const [k, v] of Object.entries(activeOptions)) {
      cleanedActiveOptions[k] = cleanOptionDisplayName(v);
    }

    openCallMe(context, cleanedActiveOptions);
  };

  const buildWhatsAppUrl = (isCustom: boolean = false): string => {
    const parsedCustom = parseInt(customQuantityInput.trim(), 10);
    const customQty = !isNaN(parsedCustom) && parsedCustom > 0 ? parsedCustom : 0;
    const qty = isCustom && customQty > 0 ? customQty : selectedQuantity;
    const speed = speedLabels[selectedSpeed];

    let msg = `Hi Print Today UK, I would like to ${
      isCustom ? 'request a bespoke trade quote' : 'order / enquire'
    } for:\n\n`;
    msg += `📄 *Product:* ${product.title}\n`;
    msg += `🔢 *Quantity:* ${qty.toLocaleString()} units${
      physicalNumberOfSets > 1 ? ` (${physicalNumberOfSets} sets)` : ''
    }\n`;

    if (!isCustom) {
      msg += `⚡ *Delivery Speed:* ${speed.title} (Due ${speed.dueDate})\n`;
      msg += `💰 *Estimated Price:* £${currentSelectedPrice.toFixed(2)}\n`;
    }

    msg += `\n📋 *Specifications:*\n`;
    for (const [key, value] of Object.entries(activeOptions)) {
      msg += `• ${key}: ${cleanOptionDisplayName(value)}\n`;
    }

    if (isCustom && customQty > 0) {
      msg += `\n💬 *Note:* Requesting bespoke volume trade pricing for ${customQty.toLocaleString()} units.\n`;
    }

    if (typeof window !== 'undefined') {
      msg += `\n🔗 *Link:* ${window.location.href}`;
    }

    return `https://wa.me/447969559746?text=${encodeURIComponent(msg)}`;
  };

  // Sliced matrix rows for clean UI height with "See More Quantities" expansion
  const visibleMatrixRows = showAllQuantities ? priceMatrix : priceMatrix.slice(0, 10);

  return (
    <div className="bg-[#fbfcfd] min-h-screen py-8 sm:py-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Semantic Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-slate-200/60">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-0.5">
            <Link href="/" className="hover:text-[#012169] transition-colors font-medium">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href={product.category === 'Clothing' ? '/clothing' : `/category/${encodeURIComponent(product.category || 'Printing')}`}
              className="hover:text-[#012169] transition-colors font-medium"
            >
              {product.category || 'Printing'}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[220px] sm:max-w-none" aria-current="page">
              {product.title}
            </span>
          </nav>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              href={product.category === 'Clothing' ? '/clothing' : '/'}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#012169] transition-colors"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Catalog</span>
            </Link>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle weight="fill" className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <ShareNetwork weight="bold" className="h-3.5 w-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1:1 CLONE TWO-COLUMN GRID (Matching Image 1) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ================= LEFT COLUMN: Product Image & Pill Accordion Tabs ================= */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            {/* Main Product Showcase Card */}
            <div className="relative w-full aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shadow-xs flex items-center justify-center p-0">
              <ImageWithFallback
                src={currentImage}
                alt={product.title}
                fallbackText={product.title}
                priority
                className="w-full h-full object-cover"
              />

              {/* Express Same Day Badge */}
              {product.isSameDayAvailable && (
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#102a43] text-white text-[11px] font-bold shadow-xs">
                  <Lightning weight="fill" className="h-3.5 w-3.5 text-amber-300" />
                  <span>London Express</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery (if multiple images exist) */}
            {productImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {productImages.map((imgUrl, idx) => (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-100 p-0 ${
                      idx === selectedImageIndex
                        ? 'border-[#102a43] shadow-xs'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={imgUrl}
                      alt={`${product.title} ${idx + 1}`}
                      fallbackText={`${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* STACKED PILL ACCORDION BUTTONS (Matching Image 1) */}
            <div className="space-y-2 pt-2">
              {/* 1. Artwork Set Up */}
              <div className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('artwork')}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <FileText weight="bold" className="h-4 w-4 text-slate-600" />
                    <span>Artwork Set Up</span>
                  </span>
                  {activeAccordion === 'artwork' ? (
                    <CaretUp weight="bold" className="h-3.5 w-3.5 text-slate-500" />
                  ) : (
                    <CaretDown weight="bold" className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'artwork' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 space-y-2 bg-slate-50/50"
                    >
                      <p>
                        Please supply your artwork in <strong>CMYK format</strong> at{' '}
                        <strong>300 DPI</strong> with a minimum of <strong>3mm bleed</strong> on all
                        edges.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 bg-white rounded-sm border border-slate-200">
                          <strong>Accepted Formats:</strong>
                          <div className="text-slate-500">PDF, AI, PSD, High-Res JPEG, Canva</div>
                        </div>
                        <div className="p-2 bg-white rounded-sm border border-slate-200">
                          <strong>Free Pre-Flight:</strong>
                          <div className="text-slate-500">Our studio checks every file free</div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Sell This Product (Solid Navy Pill Button from Image 1) */}
              <div className="border border-[#102a43] rounded-md bg-[#102a43] text-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('reseller')}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0c2033] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Package weight="bold" className="h-4 w-4 text-amber-300" />
                    <span>Sell This Product</span>
                  </span>
                  {activeAccordion === 'reseller' ? (
                    <CaretUp weight="bold" className="h-3.5 w-3.5 text-white/80" />
                  ) : (
                    <CaretDown weight="bold" className="h-3.5 w-3.5 text-white/80" />
                  )}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'reseller' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-xs text-slate-200 border-t border-white/10 space-y-2 bg-[#0d2338]"
                    >
                      <p>
                        Are you a designer, agency, or trade reseller? We offer plain, unbranded
                        white-label packaging and direct-to-client dispatch anywhere across London
                        and the UK.
                      </p>
                      <div className="text-[11px] text-amber-300 font-semibold">
                        ✓ 100% Blind White-Label Shipping • Trade Invoicing Available
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 3. Technical Specification */}
              <div className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('tech')}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Printer weight="bold" className="h-4 w-4 text-slate-600" />
                    <span>Technical Specification</span>
                  </span>
                  {activeAccordion === 'tech' ? (
                    <CaretUp weight="bold" className="h-3.5 w-3.5 text-slate-500" />
                  ) : (
                    <CaretDown weight="bold" className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'tech' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 space-y-1.5 bg-slate-50/50"
                    >
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Printing Technology:</span>
                        <span className="font-semibold text-slate-800">
                          High Definition Digital &amp; Litho
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-200">
                        <span className="text-slate-500">Paper Range:</span>
                        <span className="font-semibold text-slate-800">130gsm - 450gsm Premium</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">Finishes:</span>
                        <span className="font-semibold text-slate-800">
                          Matt, Gloss, Velvet Soft-Touch, Spot UV
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 4. Key Information */}
              <div className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleAccordion('keyinfo')}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <MapPin weight="bold" className="h-4 w-4 text-slate-600" />
                    <span>Key Information</span>
                  </span>
                  {activeAccordion === 'keyinfo' ? (
                    <CaretUp weight="bold" className="h-3.5 w-3.5 text-slate-500" />
                  ) : (
                    <CaretDown weight="bold" className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </button>
                <AnimatePresence>
                  {activeAccordion === 'keyinfo' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 pt-1 text-xs text-slate-600 border-t border-slate-100 space-y-2 bg-slate-50/50"
                    >
                      <p>
                        <strong>London Production Hub:</strong> 75 Green St, E7 8JF. Walk-ins and
                        same-day collections welcome Mon-Fri 7am - 8pm, Sat 10am - 6pm, Sun 10am - 4pm.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Express London courier delivery dispatched daily directly to your office or
                        event venue.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Title, Descriptions, Specifications & Dynamic Matrix ================= */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Titles & Marketing Copy */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {product.title}
              </h1>

              <div className="mt-3 space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  {product.description ||
                    `${product.title} are a quick, cost-effective way to grab attention and spread your client's message far and wide. Whether it's for promotions, events, or new launches, their lightweight design and vibrant print options make them perfect for handouts, mailers, or display. Easy to distribute and hard to ignore.`}
                </p>
                <p>
                  Expertly printed on a choice of quality paper stocks with a range of laminations and
                  finishes, they can be tailored to suit everything from short-term campaigns to
                  polished promotional materials.
                </p>
                <p className="pt-1">
                  Looking for custom shape options? Check out our{' '}
                  <Link
                    href="/all-products"
                    className="text-[#012169] font-bold underline hover:text-[#0A358C]"
                  >
                    Custom Shape {product.title}
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* SPECIFICATION DROPDOWNS & CONTROLS (Driven 100% by CMS when customFields exist) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 pt-1">
              {hasCMSFields ? (
                // A. PRODUCT HAS CUSTOM FIELDS IN CMS -> RENDER THEM DIRECTLY
                <>
                  {product.customFields!.map((field, fIdx) => {
                    const isSidesField =
                      field.name.toLowerCase().includes('side') &&
                      field.options.length === 2 &&
                      field.options.some((o) => o.toLowerCase().includes('single')) &&
                      field.options.some((o) => o.toLowerCase().includes('double'));

                    const currentValue = customFieldValues[field.name] || field.options[0];

                    if (isSidesField) {
                      // Render as Segmented Buttons (Matching Image 1)
                      return (
                        <div key={field.id || field.name}>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {field.name}:
                          </label>
                          <div className="grid grid-cols-2 gap-1.5 h-10">
                            {field.options.map((opt) => {
                              const isSelected = currentValue === opt;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() =>
                                    setCustomFieldValues((prev) => ({
                                      ...prev,
                                      [field.name]: opt,
                                    }))
                                  }
                                  className={`flex items-center justify-center gap-1.5 px-3 rounded-sm text-xs font-bold transition-all cursor-pointer border ${
                                    isSelected
                                      ? 'bg-[#102a43] text-white border-[#102a43]'
                                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  <span>{cleanOptionDisplayName(opt)}</span>
                                  {isSelected && <Check weight="bold" className="h-3.5 w-3.5" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // Standard Dropdown for CMS field
                    return (
                      <div key={field.id || field.name}>
                        <label className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-1">
                          <span>{field.name}:</span>
                          <span title={field.name} className="inline-flex">
                            <Question weight="fill" className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            value={currentValue}
                            onChange={(e) =>
                              setCustomFieldValues((prev) => ({
                                ...prev,
                                [field.name]: e.target.value,
                              }))
                            }
                            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] cursor-pointer appearance-none pr-8 shadow-2xs"
                          >
                            {field.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {cleanOptionDisplayName(opt)}
                              </option>
                            ))}
                          </select>
                          <CaretDown
                            weight="bold"
                            className="h-3.5 w-3.5 text-slate-500 absolute right-3 top-3.5 pointer-events-none"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Dynamic Weight Per Item & Total Weight Box */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1 truncate">
                        Weight Per Item:
                      </label>
                      <div className="h-10 px-3 flex items-center bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-800 select-none shadow-2xs">
                        {printWeight.weightPerItemGrams}g
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1 truncate">
                        Total Weight:
                      </label>
                      <div className="h-10 px-3 flex items-center bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-800 select-none shadow-2xs">
                        {printWeight.totalWeightKg}kg
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // B. PRODUCT HAS NO CMS CUSTOM FIELDS -> RENDER DEFAULT STANDARD PRINT CONTROLS
                <>
                  {/* Finished Size */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Finished Size:
                    </label>
                    <div className="relative">
                      <select
                        value={finishedSize}
                        onChange={(e) => setFinishedSize(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] cursor-pointer appearance-none pr-8 shadow-2xs"
                      >
                        <option value="A6">A6 (105 × 148 mm)</option>
                        <option value="A5">A5 (148 × 210 mm)</option>
                        <option value="A4">A4 (210 × 297 mm)</option>
                        <option value="A3">A3 (297 × 420 mm)</option>
                        <option value="DL">DL (99 × 210 mm)</option>
                        <option value="Square">Square (148 × 148 mm)</option>
                      </select>
                      <CaretDown
                        weight="bold"
                        className="h-3.5 w-3.5 text-slate-500 absolute right-3 top-3.5 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Printed Sides (Segmented Button Pills matching Image 1) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Printed Sides:
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 h-10">
                      <button
                        type="button"
                        onClick={() => setPrintedSides('Single Sided')}
                        className={`flex items-center justify-center gap-1.5 px-3 rounded-sm text-xs font-bold transition-all cursor-pointer border ${
                          printedSides === 'Single Sided'
                            ? 'bg-[#102a43] text-white border-[#102a43]'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>Single Sided</span>
                        {printedSides === 'Single Sided' && (
                          <Check weight="bold" className="h-3.5 w-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPrintedSides('Double Sided')}
                        className={`flex items-center justify-center gap-1.5 px-3 rounded-sm text-xs font-bold transition-all cursor-pointer border ${
                          printedSides === 'Double Sided'
                            ? 'bg-[#102a43] text-white border-[#102a43]'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>Double Sided</span>
                        {printedSides === 'Double Sided' && (
                          <Check weight="bold" className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-1">
                      <span>Stock:</span>
                      <span title="Paper stock density & finish" className="inline-flex">
                        <Question weight="fill" className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] cursor-pointer appearance-none pr-8 shadow-2xs"
                      >
                        <option value="130gsm Gloss">130gsm Gloss</option>
                        <option value="150gsm Silk">150gsm Silk</option>
                        <option value="170gsm Silk">170gsm Silk</option>
                        <option value="250gsm Silk">250gsm Silk</option>
                        <option value="350gsm Silk">350gsm Silk (Card Stock)</option>
                        <option value="400gsm Matt">400gsm Matt Premium</option>
                      </select>
                      <CaretDown
                        weight="bold"
                        className="h-3.5 w-3.5 text-slate-500 absolute right-3 top-3.5 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Weight Per Item & Total Weight */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1 truncate">
                        Weight Per Item:
                      </label>
                      <div className="h-10 px-3 flex items-center bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-800 select-none shadow-2xs">
                        {printWeight.weightPerItemGrams}g
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1 truncate">
                        Total Weight:
                      </label>
                      <div className="h-10 px-3 flex items-center bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-800 select-none shadow-2xs">
                        {printWeight.totalWeightKg}kg
                      </div>
                    </div>
                  </div>

                  {/* Lamination */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-1">
                      <span>Lamination:</span>
                      <span title="Protective surface coating" className="inline-flex">
                        <Question weight="fill" className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={lamination}
                        onChange={(e) => setLamination(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] cursor-pointer appearance-none pr-8 shadow-2xs"
                      >
                        <option value="No Lamination">No Lamination</option>
                        <option value="Matt Lamination">Matt Lamination (+£12.00)</option>
                        <option value="Gloss Lamination">Gloss Lamination (+£12.00)</option>
                        <option value="Soft Touch Lamination">Soft Touch Velvet (+£16.00)</option>
                      </select>
                      <CaretDown
                        weight="bold"
                        className="h-3.5 w-3.5 text-slate-500 absolute right-3 top-3.5 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Embellishment */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-1">
                      <span>Embellishment:</span>
                      <span title="Specialty foils & Spot UV highlights" className="inline-flex">
                        <Question weight="fill" className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={embellishment}
                        onChange={(e) => setEmbellishment(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] cursor-pointer appearance-none pr-8 shadow-2xs"
                      >
                        <option value="No Embellishment">No Embellishment</option>
                        <option value="Gold Foil">Metallic Gold Foil (+£24.00)</option>
                        <option value="Silver Foil">Metallic Silver Foil (+£24.00)</option>
                        <option value="Spot UV">Raised Spot UV Gloss (+£24.00)</option>
                      </select>
                      <CaretDown
                        weight="bold"
                        className="h-3.5 w-3.5 text-slate-500 absolute right-3 top-3.5 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Number of Sets */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-1">
                      <span>Number of Sets:</span>
                      <span title="Different artwork sets / variations of this run" className="inline-flex">
                        <Question weight="fill" className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={numberOfSets}
                        onChange={(e) => setNumberOfSets(Math.max(1, parseInt(e.target.value, 10)))}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] cursor-pointer appearance-none pr-8 shadow-2xs"
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                      </select>
                      <CaretDown
                        weight="bold"
                        className="h-3.5 w-3.5 text-slate-500 absolute right-3 top-3.5 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* File Copies */}
                  <div>
                    <label className="flex items-center gap-1 text-xs font-bold text-slate-800 mb-1">
                      <span>File Copies:</span>
                      <span title="Physical printed hardcopy proof posted in advance" className="inline-flex">
                        <Question weight="fill" className="h-3.5 w-3.5 text-slate-400 cursor-pointer" />
                      </span>
                    </label>
                    <div className="relative">
                      <select
                        value={fileCopies}
                        onChange={(e) => setFileCopies(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-sm text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#102a43] focus:ring-1 focus:ring-[#102a43] cursor-pointer appearance-none pr-8 shadow-2xs"
                      >
                        <option value="No">No</option>
                        <option value="Yes (1 Proof Copy)">Yes (1 Physical Hardcopy Proof)</option>
                        <option value="Yes (Multiple Copies)">Yes (Multiple Hardcopy Proofs)</option>
                      </select>
                      <CaretDown
                        weight="bold"
                        className="h-3.5 w-3.5 text-slate-500 absolute right-3 top-3.5 pointer-events-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ================= THE DYNAMIC PRICE MATRIX TABLE (1:1 Clone of Image 1) ================= */}
            <div className="pt-2">
              {/* Header info bar above table showing current selection */}
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>Price Chart & Delivery Schedule:</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#102a43] text-white text-[11px] font-black shadow-xs">
                    <Check weight="bold" className="h-3 w-3 text-emerald-400" />
                    <span>
                      {selectedQuantity.toLocaleString()} Units Selected
                    </span>
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 hidden sm:block">
                  Click any price or quantity to select
                </div>
              </div>

              <div
                data-lenis-prevent
                className="border border-slate-300 rounded-sm overflow-hidden bg-white shadow-2xs"
              >
                {/* 1. TABLE HEADER */}
                <div className="grid grid-cols-4 bg-white border-b border-slate-300 text-center select-none">
                  {/* Left Column Header: Quantity */}
                  <div className="p-3 sm:p-4 flex items-center justify-center font-bold text-xs sm:text-sm text-slate-900 border-r border-slate-300">
                    Quantity:
                  </div>

                  {/* Column 1: Same Day Express */}
                  <div className="p-2 sm:p-3 border-r border-slate-300 flex flex-col items-center justify-center bg-slate-50/50">
                    <div className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1">
                      <span>Same Day Express</span>
                    </div>
                    <div className="my-0.5">
                      <span className="text-sm">🏃</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      Due Date:
                      <br />
                      <span className="font-bold text-slate-700">{dueDates.sameDay}</span>
                    </div>
                  </div>

                  {/* Column 2: 1 Working Day */}
                  <div className="p-2 sm:p-3 border-r border-slate-300 flex flex-col items-center justify-center bg-slate-50/50">
                    <div className="font-bold text-xs sm:text-sm text-slate-900">1 Working day</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1">
                      Due Date:
                      <br />
                      <span className="font-bold text-slate-700">{dueDates.nextDay}</span>
                    </div>
                  </div>

                  {/* Column 3: 3-5 Working Days */}
                  <div className="p-2 sm:p-3 flex flex-col items-center justify-center bg-slate-50/50">
                    <div className="font-bold text-xs sm:text-sm text-slate-900">3-5 Working Days</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-1">
                      Due Date:
                      <br />
                      <span className="font-bold text-slate-700">{dueDates.standard}</span>
                    </div>
                  </div>
                </div>

                {/* 2. SCROLLABLE QUANTITY MATRIX ROWS */}
                <div
                  ref={tableScrollRef}
                  data-lenis-prevent
                  onWheel={(e) => {
                    // Prevent Lenis smooth scroll on window from intercepting mouse wheel
                    e.stopPropagation();
                  }}
                  className="max-h-[420px] overflow-y-auto overscroll-contain divide-y divide-slate-200 touch-pan-y"
                  style={{ overscrollBehavior: 'contain' }}
                >
                  {visibleMatrixRows.map((row) => {
                    const isQtyActive = selectedQuantity === row.quantity;

                    const isSameDayActive = isQtyActive && selectedSpeed === 'sameDay';
                    const isNextDayActive = isQtyActive && selectedSpeed === 'nextDay';
                    const isStandardActive = isQtyActive && selectedSpeed === 'standard';

                    return (
                      <div
                        key={row.quantity}
                        className={`grid grid-cols-4 text-xs select-none transition-all ${
                          isQtyActive
                            ? 'bg-blue-50/90 border-l-4 border-l-[#102a43]'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        {/* Quantity Number Cell (Prominently Highlighted When Selected) */}
                        <div
                          onClick={() => handleSelectCell(row.quantity, selectedSpeed)}
                          className={`p-2 sm:p-2.5 border-r border-slate-300 flex items-center justify-center gap-1.5 font-black text-xs sm:text-sm transition-all cursor-pointer ${
                            isQtyActive
                              ? 'bg-[#102a43] text-white shadow-inner'
                              : 'bg-slate-100/80 text-slate-800 hover:bg-slate-200'
                          }`}
                          title={`Select ${row.quantity.toLocaleString()} units`}
                        >
                          <span>{row.quantity.toLocaleString()}</span>
                          {isQtyActive && (
                            <Check weight="bold" className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          )}
                        </div>

                        {/* Speed Column 1: Same Day Express */}
                        {row.sameDay.isAvailable !== false ? (
                          <button
                            type="button"
                            onClick={() => handleSelectCell(row.quantity, 'sameDay')}
                            className={`p-2 sm:p-2.5 border-r border-slate-300 flex items-center justify-between px-3 transition-all cursor-pointer ${
                              isSameDayActive
                                ? 'bg-[#102a43] text-white font-bold shadow-inner'
                                : isQtyActive
                                ? 'bg-blue-50/60 hover:bg-blue-100/70 text-slate-800 font-medium'
                                : 'bg-white hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs sm:text-sm">
                                £{row.sameDay.price.toFixed(2)}
                              </span>
                              {row.sameDay.rrpPrice && (
                                <span
                                  className={`text-[10px] line-through ${
                                    isSameDayActive ? 'text-slate-300' : 'text-slate-400'
                                  }`}
                                >
                                  £{row.sameDay.rrpPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <span
                              className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ml-1 ${
                                isSameDayActive
                                  ? 'border-white bg-white'
                                  : isQtyActive
                                  ? 'border-slate-400 bg-white/70'
                                  : 'border-slate-300 bg-transparent'
                              }`}
                            >
                              {isSameDayActive && (
                                <span className="h-2 w-2 rounded-full bg-[#102a43]" />
                              )}
                            </span>
                          </button>
                        ) : (
                          <div
                            title="Order exceeds same-day print capacity"
                            className={`p-2 sm:p-2.5 border-r border-slate-300 flex items-center justify-center text-slate-400 text-xs font-semibold cursor-not-allowed select-none ${
                              isQtyActive ? 'bg-slate-100/80' : 'bg-slate-50'
                            }`}
                          >
                            <span>—</span>
                          </div>
                        )}

                        {/* Speed Column 2: 1 Working Day */}
                        {row.nextDay.isAvailable !== false ? (
                          <button
                            type="button"
                            onClick={() => handleSelectCell(row.quantity, 'nextDay')}
                            className={`p-2 sm:p-2.5 border-r border-slate-300 flex items-center justify-between px-3 transition-all cursor-pointer ${
                              isNextDayActive
                                ? 'bg-[#102a43] text-white font-bold shadow-inner'
                                : isQtyActive
                                ? 'bg-blue-50/60 hover:bg-blue-100/70 text-slate-800 font-medium'
                                : 'bg-white hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs sm:text-sm">
                                £{row.nextDay.price.toFixed(2)}
                              </span>
                              {row.nextDay.rrpPrice && (
                                <span
                                  className={`text-[10px] line-through ${
                                    isNextDayActive ? 'text-slate-300' : 'text-slate-400'
                                  }`}
                                >
                                  £{row.nextDay.rrpPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                            <span
                              className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ml-1 ${
                                isNextDayActive
                                  ? 'border-white bg-white'
                                  : isQtyActive
                                  ? 'border-slate-400 bg-white/70'
                                  : 'border-slate-300 bg-transparent'
                              }`}
                            >
                              {isNextDayActive && (
                                <span className="h-2 w-2 rounded-full bg-[#102a43]" />
                              )}
                            </span>
                          </button>
                        ) : (
                          <div
                            title="Order exceeds 1-day print capacity"
                            className={`p-2 sm:p-2.5 border-r border-slate-300 flex items-center justify-center text-slate-400 text-xs font-semibold cursor-not-allowed select-none ${
                              isQtyActive ? 'bg-slate-100/80' : 'bg-slate-50'
                            }`}
                          >
                            <span>—</span>
                          </div>
                        )}

                        {/* Speed Column 3: 3-4 Working Days */}
                        <button
                          type="button"
                          onClick={() => handleSelectCell(row.quantity, 'standard')}
                          className={`p-2 sm:p-2.5 flex items-center justify-between px-3 transition-all cursor-pointer ${
                            isStandardActive
                              ? 'bg-[#102a43] text-white font-bold shadow-inner'
                              : isQtyActive
                              ? 'bg-blue-50/60 hover:bg-blue-100/70 text-slate-800 font-medium'
                              : 'bg-white hover:bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs sm:text-sm">
                              £{row.standard.price.toFixed(2)}
                            </span>
                            {row.standard.rrpPrice && (
                              <span
                                className={`text-[10px] line-through ${
                                  isStandardActive ? 'text-slate-300' : 'text-slate-400'
                                }`}
                              >
                                £{row.standard.rrpPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <span
                            className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ml-1 ${
                              isStandardActive
                                ? 'border-white bg-white'
                                : isQtyActive
                                ? 'border-slate-400 bg-white/70'
                                : 'border-slate-300 bg-transparent'
                            }`}
                          >
                            {isStandardActive && (
                              <span className="h-2 w-2 rounded-full bg-[#102a43]" />
                            )}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* SEE MORE QUANTITIES BUTTON */}
                {priceMatrix.length > 10 && (
                  <div className="p-2.5 bg-slate-50/90 border-t border-slate-300 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllQuantities(!showAllQuantities)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold text-[#102a43] bg-white border border-slate-300 shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <span>
                        {showAllQuantities
                          ? 'Show Fewer Quantities'
                          : `See More Quantities (${priceMatrix.length - 10} more up to ${
                              product.maxQuantity ? product.maxQuantity.toLocaleString() : '250,000'
                            })`}
                      </span>
                      <CaretDown
                        weight="bold"
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          showAllQuantities ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                )}
              </div>

              {/* DEDICATED CUSTOM QUANTITY SECTION */}
              <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-slate-50 via-blue-50/40 to-slate-50 border border-slate-200/90 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Sparkle weight="fill" className="h-4 w-4 text-[#C8102E]" />
                      <span>Need a Custom Quantity or Large Volume?</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enter any bespoke quantity below to get an instant direct trade quote on WhatsApp with your selected specifications.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={customQuantityInput}
                        onChange={(e) => setCustomQuantityInput(e.target.value)}
                        placeholder="Custom Qty (e.g. 15,000)..."
                        className="w-44 sm:w-48 h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/10 shadow-2xs"
                      />
                      {customQuantityInput && (
                        <button
                          type="button"
                          onClick={() => setCustomQuantityInput('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                          title="Clear"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {customQuantityInput.trim() && (
                      <a
                        href={buildWhatsAppUrl(true)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap animate-pulse hover:animate-none"
                      >
                        <WhatsappLogo weight="fill" className="h-4 w-4" />
                        <span>Request Quote on WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ORDER SELECTION SUMMARY & ACTION BUTTONS */}
            <div className="pt-2 space-y-3">
              {/* Active Selection Summary Card */}
              <div className="p-3.5 rounded-md bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedQuantity.toLocaleString()} × {product.title}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5 line-clamp-1">
                    {Object.entries(activeOptions)
                      .map(([k, v]) => `${k}: ${cleanOptionDisplayName(v)}`)
                      .join(' • ')}{' '}
                    • {speedLabels[selectedSpeed].title} (Due {speedLabels[selectedSpeed].dueDate})
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <div className="text-2xl font-black text-[#102a43]">
                    £{currentSelectedPrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    £
                    {(
                      currentSelectedPrice /
                      (selectedQuantity * physicalNumberOfSets)
                    ).toFixed(2)}{' '}
                    each
                  </div>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleConfirmOrder}
                className="w-full h-12 rounded-md bg-[#C8102E] hover:bg-[#A80C24] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Phone weight="fill" className="h-4 w-4" />
                <span>Confirm Order / Request Same-Day Quote</span>
              </button>

              {/* Secondary Action Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={buildWhatsAppUrl(false)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-10 rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <WhatsappLogo weight="fill" className="h-4 w-4" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    const cleanedActiveOptions: Record<string, string> = {};
                    for (const [k, v] of Object.entries(activeOptions)) {
                      cleanedActiveOptions[k] = cleanOptionDisplayName(v);
                    }
                    openCallMe(
                      `Free Artwork Proof for ${product.title} (${selectedQuantity.toLocaleString()} units)`,
                      cleanedActiveOptions
                    );
                  }}
                  className="flex items-center justify-center gap-2 h-10 rounded-md bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 transition-colors cursor-pointer shadow-2xs"
                >
                  <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#012169]" />
                  <span>Free Artwork Proof</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SEO TRUST & VALUE PROPOSITIONS ================= */}
        <section className="mt-16 pt-10 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="h-9 w-9 rounded-lg bg-rose-50 text-[#C8102E] flex items-center justify-center mb-3">
                <Lightning weight="fill" className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">London Same-Day Print</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Need it today? Order before our cutoff for instant same-day print & dispatch across London.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="h-9 w-9 rounded-lg bg-blue-50 text-[#012169] flex items-center justify-center mb-3">
                <MapPin weight="fill" className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">In-Store Collection Hub</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Collect in person at 75 Green Street, London, E7 8JF with free customer parking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck weight="fill" className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Free 24-Point Artwork Check</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Our prepress team inspects 300 DPI resolution, bleed, and CMYK color before printing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
              <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Sparkle weight="fill" className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Eco-Friendly FSC Inks & Stocks</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Printed using vegetable-based inks on sustainably sourced, premium FSC certified stocks.
              </p>
            </div>
          </div>
        </section>

        {/* ================= SEO RICH FAQ ACCORDION SECTION ================= */}
        <section className="mt-10 bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-bold mb-2">
              <Question weight="bold" className="h-3.5 w-3.5 text-[#C8102E]" />
              <span>Everything You Need to Know</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions About {product.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Have questions about ordering, turnaround times, or London delivery? Find quick answers below.
            </p>
          </div>

          <div className="mt-6 divide-y divide-slate-200 border-t border-b border-slate-200">
            {productFaqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-slate-900 hover:text-[#012169] transition-colors cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <CaretDown
                      weight="bold"
                      className={`h-4 w-4 shrink-0 text-slate-500 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#012169]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed pr-6">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600">
              <span className="font-bold text-slate-900">Have a custom specification or urgent deadline?</span>{' '}
              Our London studio specialists are ready to help.
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href={buildWhatsAppUrl(false)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-colors"
              >
                <WhatsappLogo weight="fill" className="h-3.5 w-3.5" />
                <span>WhatsApp Specialist</span>
              </a>
              <button
                type="button"
                onClick={() => openCallMe(`SEO Inquiry for ${product.title}`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#012169] hover:bg-[#0A358C] text-white font-bold transition-colors cursor-pointer"
              >
                <Phone weight="fill" className="h-3.5 w-3.5" />
                <span>Request Call Back</span>
              </button>
            </div>
          </div>
        </section>

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Related {product.category} Products
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Explore other express same-day printed materials in London.
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
          </section>
        )}
      </div>
    </div>
  );
}
