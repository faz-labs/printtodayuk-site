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

  // Dynamic Due Dates (skips weekends)
  const dueDates = useMemo(() => getWorkingDueDates(), []);

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
    product?.quantityTiers && product.quantityTiers.length > 0 && typeof product.quantityTiers[0].price === 'number' && product.quantityTiers[0].price > 0
      ? product.quantityTiers[0].price
      : product?.price || 14.69;

  // Has CMS Custom Fields defined?
  const hasCMSFields = Boolean(product?.customFields && product.customFields.length > 0);

  // Dynamic Physical Number of Sets: parsed from CMS dropdown if defined, otherwise 1
  const physicalNumberOfSets = useMemo(() => {
    if (hasCMSFields && product?.customFields) {
      const setKey = Object.keys(customFieldValues).find((k) => k.toLowerCase().includes('set'));
      if (setKey) {
        const val = customFieldValues[setKey] || '';
        const numMatch = val.match(/(\d+)/);
        if (numMatch) {
          return Math.max(1, parseInt(numMatch[1], 10));
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
      product?.quantityTiers
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
  ]);

  // Custom Quantity dynamic price calculation
  const isCustomQuantityExceedsMax = Boolean(
    customQuantityInput &&
    !isNaN(parseInt(customQuantityInput.trim(), 10)) &&
    parseInt(customQuantityInput.trim(), 10) > effectiveMaxQty
  );

  const isCustomQuantityActive = Boolean(
    customQuantityInput &&
    customQuantityInput.trim().length > 0 &&
    !isNaN(parseInt(customQuantityInput.trim(), 10)) &&
    parseInt(customQuantityInput.trim(), 10) > 0 &&
    !isCustomQuantityExceedsMax
  );
  const customQuantityNumber = isCustomQuantityActive
    ? parseInt(customQuantityInput.trim(), 10)
    : 0;

  // Ensure selectedQuantity always matches a valid row in the matrix
  useEffect(() => {
    if (priceMatrix.length > 0 && !isCustomQuantityActive) {
      const exists = priceMatrix.some((r) => r.quantity === selectedQuantity);
      if (!exists) {
        setSelectedQuantity(priceMatrix[0].quantity);
      }
    }
  }, [priceMatrix, selectedQuantity, isCustomQuantityActive]);

  const customQuantityPrices = useMemo(() => {
    if (!isCustomQuantityActive || customQuantityNumber < 1) return null;
    return calculateCustomQuantityPrice(
      customQuantityNumber,
      basePriceAnchor,
      activeOptions,
      physicalNumberOfSets,
      product?.minQuantity,
      product?.maxSameDayQuantity,
      hasCMSFields,
      effectiveMaxQty,
      product?.maxNextDayQuantity,
      product?.sameDayIncreasePercent,
      product?.nextDayIncreasePercent,
      product?.quantityTiers
    );
  }, [
    isCustomQuantityActive,
    customQuantityNumber,
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
  ]);

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
    const qty = customQuantityNumber > 0 ? customQuantityNumber : selectedQuantity;
    return calculatePrintWeight(activeSizeName, activeStockName, qty, physicalNumberOfSets);
  }, [activeSizeName, activeStockName, selectedQuantity, customQuantityNumber, physicalNumberOfSets]);

  // ACTIVE SELECTED CELL PRICE
  const currentSelectedPrice = useMemo(() => {
    if (customQuantityNumber > 0 && customQuantityPrices) {
      let effectiveSpeed = selectedSpeed;
      if (effectiveSpeed === 'sameDay' && !customQuantityPrices.isSameDayAvailable) {
        effectiveSpeed = customQuantityPrices.isNextDayAvailable ? 'nextDay' : 'standard';
      } else if (effectiveSpeed === 'nextDay' && !customQuantityPrices.isNextDayAvailable) {
        effectiveSpeed = 'standard';
      }
      return customQuantityPrices[effectiveSpeed];
    }
    const row = priceMatrix.find((r) => r.quantity === selectedQuantity) || priceMatrix[0];
    if (!row) return 19.89;
    let effectiveSpeed = selectedSpeed;
    if (effectiveSpeed === 'sameDay' && row.sameDay.isAvailable === false) {
      effectiveSpeed = row.nextDay.isAvailable !== false ? 'nextDay' : 'standard';
    } else if (effectiveSpeed === 'nextDay' && row.nextDay.isAvailable === false) {
      effectiveSpeed = 'standard';
    }
    return row[effectiveSpeed].price;
  }, [priceMatrix, selectedQuantity, selectedSpeed, customQuantityNumber, customQuantityPrices]);

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
    setCustomQuantityInput('');
  };

  const handleSelectCustomSpeed = (speed: 'sameDay' | 'nextDay' | 'standard') => {
    if (customQuantityNumber > 0 && customQuantityPrices) {
      let effectiveSpeed = speed;
      if (effectiveSpeed === 'sameDay' && !customQuantityPrices.isSameDayAvailable) {
        effectiveSpeed = customQuantityPrices.isNextDayAvailable ? 'nextDay' : 'standard';
      } else if (effectiveSpeed === 'nextDay' && !customQuantityPrices.isNextDayAvailable) {
        effectiveSpeed = 'standard';
      }
      setSelectedSpeed(effectiveSpeed);
    }
  };

  const handleConfirmOrder = () => {
    const finalQty = customQuantityNumber > 0 ? customQuantityNumber : selectedQuantity;
    const finalSpeedTitle = speedLabels[selectedSpeed].title;
    const context = `${product.title} - ${finalQty} units (${finalSpeedTitle}, £${currentSelectedPrice.toFixed(
      2
    )}${physicalNumberOfSets > 1 ? `, ${physicalNumberOfSets} sets` : ''})`;

    const cleanedActiveOptions: Record<string, string> = {};
    for (const [k, v] of Object.entries(activeOptions)) {
      cleanedActiveOptions[k] = cleanOptionDisplayName(v);
    }

    openCallMe(context, cleanedActiveOptions);
  };

  // Sliced matrix rows for clean UI height with "See More Quantities" expansion
  const visibleMatrixRows = showAllQuantities ? priceMatrix : priceMatrix.slice(0, 10);

  return (
    <div className="bg-[#fbfcfd] min-h-screen py-8 sm:py-12 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Breadcrumbs & Share */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href={product.category === 'Clothing' ? '/clothing' : '/'}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#012169] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {product.category} Catalog</span>
          </Link>

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
                <span>Share Product</span>
              </>
            )}
          </button>
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
                      {isCustomQuantityActive
                        ? `${customQuantityNumber.toLocaleString()} Units`
                        : `${selectedQuantity.toLocaleString()} Units`}{' '}
                      Selected
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

                {/* 2. CUSTOM QUANTITY INPUT ROW (Matching Image 1) */}
                <div
                  className={`grid grid-cols-4 border-b border-slate-300 text-xs transition-all ${
                    isCustomQuantityActive
                      ? 'bg-blue-50/90 border-l-4 border-l-[#102a43]'
                      : 'bg-slate-50/30'
                  }`}
                >
                  <div className="p-1.5 sm:p-2 border-r border-slate-300">
                    <input
                      type="number"
                      min={product?.minQuantity || 1}
                      max={effectiveMaxQty}
                      placeholder={`Custom Qty (max ${effectiveMaxQty.toLocaleString()})...`}
                      value={customQuantityInput}
                      onChange={(e) => setCustomQuantityInput(e.target.value)}
                      className={`w-full h-8 px-2 bg-white border rounded-sm text-[11px] sm:text-xs text-slate-900 placeholder:text-slate-500 focus:outline-hidden ${
                        isCustomQuantityExceedsMax
                          ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200'
                          : 'border-slate-300 focus:border-[#102a43]'
                      }`}
                    />
                    {isCustomQuantityExceedsMax && (
                      <div className="text-[10px] text-rose-600 font-bold mt-0.5">
                        Max limit: {effectiveMaxQty.toLocaleString()} units
                      </div>
                    )}
                  </div>

                  {/* Same Day Custom Cell */}
                  {isCustomQuantityExceedsMax ? (
                    <div className="p-1.5 sm:p-2 border-r border-slate-300 flex items-center justify-center text-[10px] text-rose-500 font-bold bg-rose-50/50">
                      Exceeds Max
                    </div>
                  ) : customQuantityPrices?.isSameDayAvailable !== false ? (
                    <button
                      type="button"
                      disabled={!customQuantityPrices}
                      onClick={() => handleSelectCustomSpeed('sameDay')}
                      className={`p-1.5 sm:p-2 border-r border-slate-300 flex items-center justify-center transition-colors cursor-pointer ${
                        isCustomQuantityActive && selectedSpeed === 'sameDay'
                          ? 'bg-[#102a43] text-white font-bold shadow-inner'
                          : isCustomQuantityActive
                          ? 'bg-blue-50/60 hover:bg-blue-100/70 text-slate-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {customQuantityPrices ? `£${customQuantityPrices.sameDay.toFixed(2)}` : '—'}
                    </button>
                  ) : (
                    <div
                      title="Exceeds same-day capacity limit"
                      className="p-1.5 sm:p-2 border-r border-slate-300 flex items-center justify-center bg-slate-100/70 text-slate-400 text-xs cursor-not-allowed select-none"
                    >
                      —
                    </div>
                  )}

                  {/* 1 Working Day Custom Cell */}
                  {isCustomQuantityExceedsMax ? (
                    <div className="p-1.5 sm:p-2 border-r border-slate-300 flex items-center justify-center text-[10px] text-rose-500 font-bold bg-rose-50/50">
                      Exceeds Max
                    </div>
                  ) : customQuantityPrices?.isNextDayAvailable !== false ? (
                    <button
                      type="button"
                      disabled={!customQuantityPrices}
                      onClick={() => handleSelectCustomSpeed('nextDay')}
                      className={`p-1.5 sm:p-2 border-r border-slate-300 flex items-center justify-center transition-colors cursor-pointer ${
                        isCustomQuantityActive && selectedSpeed === 'nextDay'
                          ? 'bg-[#102a43] text-white font-bold shadow-inner'
                          : isCustomQuantityActive
                          ? 'bg-blue-50/60 hover:bg-blue-100/70 text-slate-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {customQuantityPrices ? `£${customQuantityPrices.nextDay.toFixed(2)}` : '—'}
                    </button>
                  ) : (
                    <div
                      title="Exceeds 1-day capacity limit"
                      className="p-1.5 sm:p-2 border-r border-slate-300 flex items-center justify-center bg-slate-100/70 text-slate-400 text-xs cursor-not-allowed select-none"
                    >
                      —
                    </div>
                  )}

                  {/* 3-4 Working Days Custom Cell */}
                  {isCustomQuantityExceedsMax ? (
                    <div className="p-1.5 sm:p-2 flex items-center justify-center text-[10px] text-rose-500 font-bold bg-rose-50/50">
                      Exceeds Max
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!customQuantityPrices}
                      onClick={() => handleSelectCustomSpeed('standard')}
                      className={`p-1.5 sm:p-2 flex items-center justify-center transition-colors cursor-pointer ${
                        isCustomQuantityActive && selectedSpeed === 'standard'
                          ? 'bg-[#102a43] text-white font-bold shadow-inner'
                          : isCustomQuantityActive
                          ? 'bg-blue-50/60 hover:bg-blue-100/70 text-slate-800'
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {customQuantityPrices ? `£${customQuantityPrices.standard.toFixed(2)}` : '—'}
                    </button>
                  )}
                </div>

                {/* 3. SCROLLABLE QUANTITY MATRIX ROWS (Matching Image 1) */}
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
                    const isQtyActive =
                      !isCustomQuantityActive && selectedQuantity === row.quantity;

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
            </div>

            {/* ORDER SELECTION SUMMARY & ACTION BUTTONS */}
            <div className="pt-2 space-y-3">
              {/* Active Selection Summary Card */}
              <div className="p-3.5 rounded-md bg-slate-100 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {customQuantityNumber > 0 ? customQuantityNumber : selectedQuantity} ×{' '}
                    {product.title}
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
                      ((customQuantityNumber > 0 ? customQuantityNumber : selectedQuantity) *
                        physicalNumberOfSets)
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
                  href="https://wa.me/447969559746"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 h-10 rounded-md bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <ChatCircleDots weight="bold" className="h-4 w-4" />
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
                      `Free Artwork Proof for ${product.title} (${
                        customQuantityNumber > 0 ? customQuantityNumber : selectedQuantity
                      } units)`,
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
