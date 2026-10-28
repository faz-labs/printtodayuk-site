'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductInput, CategoryConfig, CustomField, QuantityTier } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MultiImageUploader } from './MultiImageUploader';
import {
  Plus,
  Trash,
  Lightning,
  Sparkle,
  SlidersHorizontal,
  X,
  FloppyDisk,
  DotsSixVertical,
  PencilSimple,
  CaretUp,
  CaretDown,
  Check,
} from '@phosphor-icons/react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductInput, id?: string) => Promise<void>;
  initialProduct?: Product | null;
  categories: CategoryConfig[];
}

const TIER_PRESETS = {
  flyers: [
    { quantity: 25, price: 25.0 },
    { quantity: 50, percentIncrease: 40 },
    { quantity: 100, percentIncrease: 80 },
    { quantity: 250, percentIncrease: 150 },
    { quantity: 500, percentIncrease: 250 },
    { quantity: 1000, percentIncrease: 400 },
    { quantity: 2500, percentIncrease: 750 },
    { quantity: 5000, percentIncrease: 1200 },
  ],
  businessCards: [
    { quantity: 50, price: 18.0 },
    { quantity: 100, percentIncrease: 35 },
    { quantity: 250, percentIncrease: 85 },
    { quantity: 500, percentIncrease: 140 },
    { quantity: 1000, percentIncrease: 220 },
  ],
  banners: [
    { quantity: 1, price: 29.0 },
    { quantity: 2, percentIncrease: 70 },
    { quantity: 5, percentIncrease: 250 },
    { quantity: 10, percentIncrease: 550 },
    { quantity: 25, percentIncrease: 1300 },
  ],
  booklets: [
    { quantity: 25, price: 65.0 },
    { quantity: 50, percentIncrease: 45 },
    { quantity: 100, percentIncrease: 95 },
    { quantity: 200, percentIncrease: 175 },
    { quantity: 300, percentIncrease: 245 },
    { quantity: 500, percentIncrease: 380 },
  ],
};

export function ProductForm({
  isOpen,
  onClose,
  onSubmit,
  initialProduct,
  categories,
}: ProductFormProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [quantityTiers, setQuantityTiers] = useState<QuantityTier[]>([
    { quantity: 25, price: 25.0 },
    { quantity: 50, percentIncrease: 40 },
    { quantity: 100, percentIncrease: 80 },
    { quantity: 250, percentIncrease: 150 },
    { quantity: 500, percentIncrease: 250 },
    { quantity: 1000, percentIncrease: 400 },
  ]);
  const [sameDayIncreasePercent, setSameDayIncreasePercent] = useState<string>('35.4');
  const [nextDayIncreasePercent, setNextDayIncreasePercent] = useState<string>('10');
  const [discountedPrice, setDiscountedPrice] = useState<string>('');
  const [category, setCategory] = useState<string>(categories[0]?.name || '');
  const [isSameDayAvailable, setIsSameDayAvailable] = useState(true);
  const [maxSameDayQuantity, setMaxSameDayQuantity] = useState<string>('');
  const [maxNextDayQuantity, setMaxNextDayQuantity] = useState<string>('');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [activeNewOptionText, setActiveNewOptionText] = useState<{ [fieldId: string]: string }>({});
  const [draggedFieldIndex, setDraggedFieldIndex] = useState<number | null>(null);
  const [draggedOption, setDraggedOption] = useState<{ fieldId: string; index: number } | null>(null);
  const [editingOption, setEditingOption] = useState<{
    fieldId: string;
    optionIndex: number;
    value: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title);
      setSlug(initialProduct.slug);
      setDescription(initialProduct.description);
      const prodImages =
        initialProduct.images && initialProduct.images.length > 0
          ? initialProduct.images
          : initialProduct.imageUrl
          ? [initialProduct.imageUrl]
          : [];
      setImages(prodImages);
      setImageUrl(prodImages[0] || initialProduct.imageUrl || '');
      setDiscountedPrice(
        initialProduct.discountedPrice ? initialProduct.discountedPrice.toString() : ''
      );
      setCategory(initialProduct.category || categories[0]?.name || '');
      setIsSameDayAvailable(initialProduct.isSameDayAvailable);
      setMaxSameDayQuantity(
        initialProduct.maxSameDayQuantity !== undefined && initialProduct.maxSameDayQuantity !== null
          ? initialProduct.maxSameDayQuantity.toString()
          : ''
      );
      setMaxNextDayQuantity(
        initialProduct.maxNextDayQuantity !== undefined && initialProduct.maxNextDayQuantity !== null
          ? initialProduct.maxNextDayQuantity.toString()
          : ''
      );
      setSameDayIncreasePercent(
        initialProduct.sameDayIncreasePercent !== undefined && initialProduct.sameDayIncreasePercent !== null
          ? initialProduct.sameDayIncreasePercent.toString()
          : '35.4'
      );
      setNextDayIncreasePercent(
        initialProduct.nextDayIncreasePercent !== undefined && initialProduct.nextDayIncreasePercent !== null
          ? initialProduct.nextDayIncreasePercent.toString()
          : '10'
      );
      if (initialProduct.quantityTiers && initialProduct.quantityTiers.length > 0) {
        setQuantityTiers(initialProduct.quantityTiers);
      } else {
        const firstQty = initialProduct.minQuantity || 25;
        const firstPrice = initialProduct.price || 14.69;
        setQuantityTiers([
          { quantity: firstQty, price: firstPrice },
          { quantity: Math.max(firstQty * 2, 50), percentIncrease: 40 },
          { quantity: Math.max(firstQty * 4, 100), percentIncrease: 80 },
          { quantity: Math.max(firstQty * 10, 250), percentIncrease: 150 },
          { quantity: Math.max(firstQty * 20, 500), percentIncrease: 250 },
          { quantity: Math.max(firstQty * 40, 1000), percentIncrease: 400 },
        ]);
      }
      setFeatures(initialProduct.features || []);
      setCustomFields(initialProduct.customFields || []);
    } else {
      // Default reset
      setTitle('');
      setSlug('');
      setDescription('');
      setImages([]);
      setImageUrl('');
      setDiscountedPrice('');
      setCategory(categories[0]?.name || '');
      setIsSameDayAvailable(true);
      setMaxSameDayQuantity('');
      setMaxNextDayQuantity('');
      setSameDayIncreasePercent('35.4');
      setNextDayIncreasePercent('10');
      setQuantityTiers([
        { quantity: 25, price: 25.0 },
        { quantity: 50, percentIncrease: 40 },
        { quantity: 100, percentIncrease: 80 },
        { quantity: 250, percentIncrease: 150 },
        { quantity: 500, percentIncrease: 250 },
        { quantity: 1000, percentIncrease: 400 },
      ]);
      setFeatures([
        'Premium High Definition Print Quality',
        'Same-day London Dispatch Available',
      ]);
      setCustomFields([]);
    }
    setActiveNewOptionText({});
    setError('');
  }, [initialProduct, isOpen, categories]);

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    if (newImages.length > 0) {
      setImageUrl(newImages[0]);
    } else {
      setImageUrl('');
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialProduct) {
      setSlug(slugify(val));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Custom Fields Handler
  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `fld-${Date.now()}`,
      name: '',
      options: [],
      required: true,
    };
    setCustomFields([newField, ...customFields]);
  };

  const handleUpdateFieldName = (fieldId: string, name: string) => {
    setCustomFields(
      customFields.map((f) => (f.id === fieldId ? { ...f, name } : f))
    );
  };

  const handleAddOptionToField = (fieldId: string) => {
    const text = (activeNewOptionText[fieldId] || '').trim();
    if (!text) return;
    setCustomFields(
      customFields.map((f) => {
        if (f.id === fieldId) {
          if (f.options.includes(text)) return f;
          return { ...f, options: [...f.options, text] };
        }
        return f;
      })
    );
    setActiveNewOptionText({ ...activeNewOptionText, [fieldId]: '' });
  };

  const handleRemoveOptionFromField = (fieldId: string, optIndex: number) => {
    setCustomFields(
      customFields.map((f) => {
        if (f.id === fieldId) {
          return { ...f, options: f.options.filter((_, i) => i !== optIndex) };
        }
        return f;
      })
    );
  };

  const handleDeleteCustomField = (fieldId: string) => {
    setCustomFields(customFields.filter((f) => f.id !== fieldId));
  };

  const handleMoveField = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= customFields.length || toIdx >= customFields.length) return;
    const updated = [...customFields];
    const [removed] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, removed);
    setCustomFields(updated);
  };

  const handleMoveOption = (fieldId: string, fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    setCustomFields(
      customFields.map((f) => {
        if (f.id === fieldId) {
          const updatedOptions = [...f.options];
          const [removed] = updatedOptions.splice(fromIdx, 1);
          updatedOptions.splice(toIdx, 0, removed);
          return { ...f, options: updatedOptions };
        }
        return f;
      })
    );
  };

  const handleSaveOptionEdit = () => {
    if (!editingOption) return;
    const trimmed = editingOption.value.trim();
    if (trimmed) {
      setCustomFields(
        customFields.map((f) => {
          if (f.id === editingOption.fieldId) {
            const updatedOptions = [...f.options];
            updatedOptions[editingOption.optionIndex] = trimmed;
            return { ...f, options: updatedOptions };
          }
          return f;
        })
      );
    }
    setEditingOption(null);
  };

  const handleAddPreset = (
    type: 'size' | 'flyerSize' | 'sides' | 'finish' | 'apparelSize' | 'paperWeight' | 'sets'
  ) => {
    let newField: CustomField;
    const uniqueId = `fld-${Date.now()}`;
    if (type === 'flyerSize') {
      newField = {
        id: uniqueId,
        name: 'Finished Size',
        options: [
          'A5 (148 × 210 mm)',
          'A6 (105 × 148 mm) -20%',
          'DL (99 × 210 mm) -10%',
          'A4 (210 × 297 mm) +35%',
          'A3 (297 × 420 mm) +80%',
        ],
        required: true,
      };
    } else if (type === 'sides') {
      newField = {
        id: uniqueId,
        name: 'Printed Sides',
        options: ['Single Sided', 'Double Sided (+10%)'],
        required: true,
      };
    } else if (type === 'size') {
      newField = {
        id: uniqueId,
        name: 'Card Size',
        options: ['85x55mm (Standard UK)', '66x55mm (Mini)', '55x55mm (Square)'],
        required: true,
      };
    } else if (type === 'finish') {
      newField = {
        id: uniqueId,
        name: 'Lamination Finish',
        options: ['No Lamination', 'Matt Lamination +15%', 'High Gloss Lamination +15%', 'Velvet Soft-Touch +25%'],
        required: true,
      };
    } else if (type === 'apparelSize') {
      newField = {
        id: uniqueId,
        name: 'Select Size',
        options: ['Small (S)', 'Medium (M)', 'Large (L)', 'XL', '2XL', '3XL'],
        required: true,
      };
    } else if (type === 'sets') {
      newField = {
        id: uniqueId,
        name: 'Number of Sets',
        options: ['1 Set', '2 Sets', '3 Sets', '4 Sets', '5 Sets', '10 Sets'],
        required: true,
      };
    } else {
      newField = {
        id: uniqueId,
        name: 'Paper Weight / Stock',
        options: [
          '130gsm Gloss (Economy)',
          '170gsm Silk (Standard) +10%',
          '250gsm Silk (Premium) +20%',
          '350gsm Silk (Card Stock) +35%',
          '400gsm Matt (Luxury) +50%',
        ],
        required: true,
      };
    }
    setCustomFields([newField, ...customFields]);
  };

  const handleApplyTierPreset = (presetKey: keyof typeof TIER_PRESETS) => {
    const preset = TIER_PRESETS[presetKey];
    const currentBasePrice = quantityTiers[0]?.price || preset[0].price;
    const newTiers: QuantityTier[] = preset.map((t, idx) => {
      if (idx === 0) {
        return { quantity: t.quantity, price: currentBasePrice };
      }
      return { quantity: t.quantity, percentIncrease: t.percentIncrease };
    });
    setQuantityTiers(newTiers);
  };

  const handleAddTier = () => {
    const lastTier = quantityTiers[quantityTiers.length - 1];
    const nextQty = lastTier ? Math.round(lastTier.quantity * 2) : 25;
    const nextPct =
      lastTier && lastTier.percentIncrease !== undefined
        ? Math.round(lastTier.percentIncrease * 1.5 + 20)
        : 40;
    setQuantityTiers([
      ...quantityTiers,
      { quantity: nextQty, percentIncrease: nextPct },
    ]);
  };

  const handleUpdateTier = (
    index: number,
    field: 'quantity' | 'price' | 'percentIncrease',
    val: string
  ) => {
    const num = val === '' ? undefined : parseFloat(val);
    setQuantityTiers((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t;
        if (field === 'quantity') {
          return { ...t, quantity: num !== undefined ? Math.max(1, Math.round(num)) : 1 };
        }
        if (field === 'price') {
          return { ...t, price: num };
        }
        if (field === 'percentIncrease') {
          return { ...t, percentIncrease: num };
        }
        return t;
      })
    );
  };

  const handleRemoveTier = (index: number) => {
    if (quantityTiers.length <= 1) return;
    setQuantityTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const baseTierPrice = quantityTiers[0]?.price || 0;
  const computedStandardPrice = (tier: QuantityTier, index: number): number => {
    if (index === 0) return tier.price || 0;
    const pct = tier.percentIncrease || 0;
    return baseTierPrice * (1 + pct / 100);
  };

  const computedUnitPrice = (tier: QuantityTier, index: number): number => {
    const total = computedStandardPrice(tier, index);
    return tier.quantity > 0 ? total / tier.quantity : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!quantityTiers || quantityTiers.length === 0) {
      setError('Please configure at least one quantity tier.');
      return;
    }

    const firstTier = quantityTiers[0];
    if (!firstTier.quantity || firstTier.quantity <= 0) {
      setError('Base quantity (Tier 1) must be greater than 0.');
      return;
    }
    if (typeof firstTier.price !== 'number' || isNaN(firstTier.price) || firstTier.price <= 0) {
      setError('Please provide a valid Base Price (£) greater than 0 for Tier 1.');
      return;
    }

    const finalImages = images.length > 0 ? images : imageUrl.trim() ? [imageUrl.trim()] : [];
    if (finalImages.length === 0) {
      setError('Please upload at least one product picture.');
      return;
    }

    // Filter valid custom fields (must have a name and at least one option)
    const validCustomFields = customFields
      .filter((f) => f.name.trim().length > 0 && f.options.length > 0)
      .map((f) => ({
        ...f,
        name: f.name.trim(),
      }));

    // Sort tiers by quantity ascending to prevent order issues
    const sortedTiers = [...quantityTiers].sort((a, b) => a.quantity - b.quantity);
    const derivedBasePrice = sortedTiers[0].price || 14.69;
    const derivedMinQty = sortedTiers[0].quantity;
    const derivedMaxQty = sortedTiers[sortedTiers.length - 1].quantity;

    const parsedSameDayPct = parseFloat(sameDayIncreasePercent);
    const parsedNextDayPct = parseFloat(nextDayIncreasePercent);

    setIsSubmitting(true);
    try {
      const payload: ProductInput = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim(),
        imageUrl: finalImages[0],
        images: finalImages,
        price: Number(derivedBasePrice.toFixed(2)),
        category: category || categories[0]?.name || 'General',
        isSameDayAvailable,
        minQuantity: derivedMinQty,
        maxQuantity: derivedMaxQty,
        maxSameDayQuantity: maxSameDayQuantity.trim() !== '' ? parseInt(maxSameDayQuantity, 10) : undefined,
        maxNextDayQuantity: maxNextDayQuantity.trim() !== '' ? parseInt(maxNextDayQuantity, 10) : undefined,
        sameDayIncreasePercent: !isNaN(parsedSameDayPct) ? parsedSameDayPct : 35.4,
        nextDayIncreasePercent: !isNaN(parsedNextDayPct) ? parsedNextDayPct : 10,
        quantityTiers: sortedTiers,
        features: features.length > 0 ? features : [],
        customFields: validCustomFields.length > 0 ? validCustomFields : [],
      };

      if (discountedPrice.trim() !== '') {
        const parsedDiscount = parseFloat(discountedPrice);
        if (isNaN(parsedDiscount) || parsedDiscount <= 0) {
          setError('Discounted price must be greater than 0.');
          setIsSubmitting(false);
          return;
        }
        payload.discountedPrice = parsedDiscount;
      }

      await onSubmit(payload, initialProduct?.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? 'Edit Product' : 'Add New Product'}
      description="Update product information, custom dropdown fields, pricing, and category filters."
      maxWidth="7xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[82vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ================= LEFT COLUMN: General Info, Pricing Rules, Description ================= */}
          <div className="space-y-4">
            {/* Title & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Luxury Business Cards"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. luxury-business-cards"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
              >
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Turnaround Speeds & Surcharge Rules */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  Turnaround Speeds & Cutoff Rules
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Percentage surcharges over standard delivery
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Same-Day +%
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={sameDayIncreasePercent}
                      onChange={(e) => setSameDayIncreasePercent(e.target.value)}
                      placeholder="35.4"
                      className="w-full h-9 pl-2.5 pr-6 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                    />
                    <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">e.g. 35.4% or 40%</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1-Day +%
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={nextDayIncreasePercent}
                      onChange={(e) => setNextDayIncreasePercent(e.target.value)}
                      placeholder="10"
                      className="w-full h-9 pl-2.5 pr-6 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                    />
                    <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">
                      %
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">e.g. 10% or 15%</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Same-Day Cutoff
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxSameDayQuantity}
                    onChange={(e) => setMaxSameDayQuantity(e.target.value)}
                    placeholder="0 or 1000"
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">0 = disabled</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1-Day Cutoff
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={maxNextDayQuantity}
                    onChange={(e) => setMaxNextDayQuantity(e.target.value)}
                    placeholder="0 or 5000"
                    className="w-full h-9 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">0 = disabled</p>
                </div>
              </div>

              {/* Optional Discounted Reference Price */}
              <div className="pt-1 border-t border-slate-200/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Promotional Strike-Through Price (£) (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountedPrice}
                    onChange={(e) => setDiscountedPrice(e.target.value)}
                    placeholder="e.g. 19.99"
                    className="w-36 h-8 px-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Quantity Tiers & Base Price Engine Matrix */}
            <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>Quantity Tiers & Pricing Engine</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#012169] text-[10px] font-bold">
                      {quantityTiers.length} Steps
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Tier 1 sets the initial Base Price (£). Tier 2+ set the % increase over base price.
                  </p>
                </div>

                {/* Presets Button Bar */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-0.5">Preset:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyTierPreset('flyers')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Flyers
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTierPreset('businessCards')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTierPreset('banners')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Banners
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTierPreset('booklets')}
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                  >
                    Booklets
                  </button>
                </div>
              </div>

              {/* Quantity Tiers Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3 w-14">Tier</th>
                        <th className="py-2.5 px-3 min-w-[100px]">Quantity</th>
                        <th className="py-2.5 px-3 min-w-[150px]">Base £ / % Increase</th>
                        <th className="py-2.5 px-3 min-w-[110px]">Calculated Price</th>
                        <th className="py-2.5 px-3 min-w-[90px]">Unit Price</th>
                        <th className="py-2.5 px-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {quantityTiers.map((tier, idx) => {
                        const isBaseTier = idx === 0;
                        const standardTotal = computedStandardPrice(tier, idx);
                        const unitPrice = computedUnitPrice(tier, idx);

                        return (
                          <tr key={idx} className={isBaseTier ? 'bg-blue-50/25' : 'hover:bg-slate-50/50'}>
                            {/* Step # */}
                            <td className="py-2 px-3">
                              <span
                                className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded text-[10px] ${
                                  isBaseTier
                                    ? 'bg-[#012169] text-white font-black'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {isBaseTier ? 'Base' : `#${idx + 1}`}
                              </span>
                            </td>

                            {/* Quantity Input */}
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={tier.quantity}
                                onChange={(e) => handleUpdateTier(idx, 'quantity', e.target.value)}
                                placeholder={isBaseTier ? '25' : '50'}
                                className="w-full h-8 px-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#012169]"
                              />
                            </td>

                            {/* Price (Tier 1) or % Increase (Tier 2+) */}
                            <td className="py-2 px-3">
                              {isBaseTier ? (
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-slate-400 pointer-events-none">
                                    £
                                  </span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={tier.price ?? ''}
                                    onChange={(e) => handleUpdateTier(idx, 'price', e.target.value)}
                                    placeholder="25.00"
                                    className="w-full h-8 pl-6 pr-2 rounded-lg border border-blue-300 text-xs font-bold text-[#012169] bg-white focus:outline-hidden focus:border-[#012169] focus:ring-1 focus:ring-[#012169]"
                                  />
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={tier.percentIncrease ?? ''}
                                    onChange={(e) => handleUpdateTier(idx, 'percentIncrease', e.target.value)}
                                    placeholder="40"
                                    className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-[#012169]"
                                  />
                                  <span className="absolute right-2.5 top-1.5 text-xs font-bold text-slate-400 pointer-events-none">
                                    %
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Computed Standard Total (£) */}
                            <td className="py-2 px-3 font-bold text-xs text-slate-900">
                              <span>£{standardTotal.toFixed(2)}</span>
                              {isBaseTier ? (
                                <span className="block text-[9px] text-slate-400 font-normal">
                                  Starting base
                                </span>
                              ) : tier.percentIncrease !== undefined ? (
                                <span className="block text-[9px] text-emerald-600 font-semibold">
                                  +{tier.percentIncrease}% over base
                                </span>
                              ) : null}
                            </td>

                            {/* Computed Unit Price (£/ea) */}
                            <td className="py-2 px-3 font-semibold text-xs text-slate-600">
                              <span>£{unitPrice.toFixed(3)}</span>
                              <span className="text-[10px] text-slate-400 font-normal"> / ea</span>
                            </td>

                            {/* Delete button */}
                            <td className="py-2 px-2 text-center">
                              {!isBaseTier && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTier(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                                  title="Remove this tier"
                                >
                                  <Trash className="h-4 w-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Add Step Button Bar */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddTier}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#012169] text-white text-xs font-bold rounded-lg hover:bg-[#0A358C] transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus weight="bold" className="h-3.5 w-3.5" />
                    <span>Add Quantity Step</span>
                  </button>

                  <span className="text-[11px] text-slate-500">
                    Standard 3-5 days delivery base price
                  </span>
                </div>
              </div>
            </div>

            {/* Same Day Toggle */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightning weight="fill" className="h-4 w-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Same-Day London Dispatch</div>
                  <div className="text-[10px] text-slate-500">
                    Enable express same-day rush turnaround option
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isSameDayAvailable}
                onChange={(e) => setIsSameDayAvailable(e.target.checked)}
                className="h-5 w-5 rounded-md text-[#012169] focus:ring-[#012169] cursor-pointer"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the product material, finish, dimensions, and turnaround..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169] resize-none"
              />
            </div>

            {/* Features Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Key Specifications & Features
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                  placeholder="e.g. 450gsm Matt Laminated Silk Board"
                  className="flex-1 h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {features.length > 0 && (
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                    >
                      <span className="truncate">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Media & Custom Dropdowns ================= */}
          <div className="space-y-4">
            {/* Multi-Image S3 Uploader */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Product Gallery & Images <span className="text-rose-500">*</span>
              </label>
              <MultiImageUploader images={images} onImagesChange={handleImagesChange} />
            </div>

            {/* Custom Fields & Dropdown Options Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal weight="bold" className="h-4 w-4 text-[#012169]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Custom Dropdowns & Options
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Dynamic dropdown options for size, finish, paper, apparel, etc.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomField}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#012169] text-white text-xs font-bold hover:bg-[#0A358C] shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Dropdown</span>
                </button>
              </div>

              {/* Dynamic Pricing Engine Tip Banner */}
              <div className="p-3 bg-blue-50/90 border border-blue-200/90 rounded-xl text-xs text-blue-950 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-[#012169] text-xs">
                  <Sparkle weight="fill" className="h-4 w-4 text-amber-500" />
                  <span>Dynamic Pricing Engine & Custom Dropdowns</span>
                </div>
                <div className="text-[11px] text-slate-600 leading-relaxed space-y-1">
                  <p>
                    • <strong>Base Price Anchor:</strong> The product price above is set for the <strong>Minimum Quantity on 3-5 Working Days</strong> (Standard Turnaround).
                  </p>
                  <p>
                    • <strong>Dropdown Price Modifiers:</strong> Add percentage adjustments such as <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-[#012169]">+30%</code>, <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-[#012169]">-30%</code>, or <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-bold text-[#012169]">+£12</code> to any option (e.g. <em>A4 +30%</em>, <em>A6 -30%</em>).
                  </p>
                  <p>
                    • <strong>Customer View:</strong> The percentage/surcharge text is <strong>never visible</strong> to storefront customers — they only see clean labels (e.g. <em>A4</em>, <em>Matt Lamination</em>).
                  </p>
                </div>
              </div>

              {/* Quick 1-Click Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Solopress Presets:
                </span>
                <button
                  type="button"
                  onClick={() => handleAddPreset('flyerSize')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Flyer Sizes (A5/A6/DL/A4/A3)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('sides')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Printed Sides (Single/Double)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('paperWeight')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Paper Stock (130-400gsm)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('finish')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Lamination (Matt/Gloss/Velvet)
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('sets')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Number of Sets
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('size')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Card Sizes
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset('apparelSize')}
                  className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 hover:border-[#012169] hover:text-[#012169] text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  + Apparel
                </button>
              </div>

              {/* Render Active Custom Fields */}
              {customFields.length === 0 ? (
                <div className="p-4 rounded-xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-400">
                  No custom dropdowns yet. Click &ldquo;Add Dropdown&rdquo; or pick a Preset above.
                </div>
              ) : (
                <div className="space-y-3 pt-1 max-h-[520px] overflow-y-auto pr-1">
                  {customFields.map((field, fieldIdx) => (
                    <div
                      key={field.id}
                      draggable={editingOption === null}
                      onDragStart={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.tagName === 'INPUT' || target.closest('.no-field-drag')) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedFieldIndex(fieldIdx);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedFieldIndex !== null) {
                          handleMoveField(draggedFieldIndex, fieldIdx);
                          setDraggedFieldIndex(null);
                        }
                      }}
                      className={`p-3 rounded-xl bg-white border shadow-2xs space-y-2.5 transition-all ${
                        draggedFieldIndex === fieldIdx
                          ? 'border-[#012169] ring-2 ring-[#012169]/20 opacity-70'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Field Header with Drag Grip, Up/Down, Title Input, and Delete */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1">
                          <div
                            className="p-1 text-slate-400 hover:text-[#012169] cursor-grab active:cursor-grabbing shrink-0"
                            title="Drag card to reorder dropdown"
                          >
                            <DotsSixVertical weight="bold" className="h-4 w-4" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="block text-[10px] font-bold text-slate-700">
                                Dropdown #{fieldIdx + 1} Title
                              </label>
                              <span className="text-[9px] text-slate-400 font-medium hidden sm:inline">
                                Drag grip or use arrows to sort
                              </span>
                            </div>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => handleUpdateFieldName(field.id, e.target.value)}
                              placeholder="e.g. Finished Size, Printed Sides, Paper Stock..."
                              className="w-full h-8 px-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                            />
                          </div>
                        </div>

                        {/* Controls: Up, Down, Delete */}
                        <div className="flex items-center gap-0.5 self-end mb-0.5 no-field-drag">
                          <button
                            type="button"
                            disabled={fieldIdx === 0}
                            onClick={() => handleMoveField(fieldIdx, fieldIdx - 1)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 disabled:cursor-not-allowed rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Move up"
                          >
                            <CaretUp weight="bold" className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            disabled={fieldIdx === customFields.length - 1}
                            onClick={() => handleMoveField(fieldIdx, fieldIdx + 1)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-20 disabled:cursor-not-allowed rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Move down"
                          >
                            <CaretDown weight="bold" className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomField(field.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer ml-1"
                            title="Delete this dropdown"
                          >
                            <Trash weight="bold" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Options (Values) list */}
                      <div className="no-field-drag">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-slate-600">
                            Selectable Dropdown Options (Values)
                          </label>
                          <span className="text-[9px] text-slate-400 font-medium">
                            💡 Double-click any value to edit · Drag to reorder
                          </span>
                        </div>

                        {/* Add option input */}
                        <div className="flex gap-1.5 mb-2">
                          <input
                            type="text"
                            value={activeNewOptionText[field.id] || ''}
                            onChange={(e) =>
                              setActiveNewOptionText({
                                ...activeNewOptionText,
                                [field.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddOptionToField(field.id);
                              }
                            }}
                            placeholder="Add option (e.g. A4 +35%, Double Sided +10%, Matt Lamination +£12)..."
                            className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddOptionToField(field.id)}
                            className="px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Add</span>
                          </button>
                        </div>

                        {/* Options list chips */}
                        {field.options.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {field.options.map((opt, optIdx) => {
                              const isEditingThisOption =
                                editingOption?.fieldId === field.id &&
                                editingOption?.optionIndex === optIdx;

                              if (isEditingThisOption) {
                                return (
                                  <div
                                    key={`edit-${optIdx}`}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-white border border-[#012169] ring-2 ring-[#012169]/20 shadow-xs"
                                  >
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingOption.value}
                                      onChange={(e) =>
                                        setEditingOption({
                                          ...editingOption,
                                          value: e.target.value,
                                        })
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleSaveOptionEdit();
                                        } else if (e.key === 'Escape') {
                                          setEditingOption(null);
                                        }
                                      }}
                                      onBlur={handleSaveOptionEdit}
                                      className="h-6 px-1 text-xs font-semibold text-slate-900 focus:outline-hidden min-w-[130px] max-w-[240px]"
                                    />
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSaveOptionEdit();
                                      }}
                                      className="text-emerald-600 hover:text-emerald-700 p-0.5 cursor-pointer"
                                      title="Save (Enter)"
                                    >
                                      <Check weight="bold" className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setEditingOption(null);
                                      }}
                                      className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                                      title="Cancel (Esc)"
                                    >
                                      <X weight="bold" className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                );
                              }

                              const isBeingDragged =
                                draggedOption?.fieldId === field.id &&
                                draggedOption?.index === optIdx;

                              return (
                                <span
                                  key={optIdx}
                                  draggable={editingOption === null}
                                  onDragStart={(e) => {
                                    e.stopPropagation();
                                    setDraggedOption({ fieldId: field.id, index: optIdx });
                                  }}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (draggedOption && draggedOption.fieldId === field.id) {
                                      handleMoveOption(field.id, draggedOption.index, optIdx);
                                      setDraggedOption(null);
                                    }
                                  }}
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    setEditingOption({
                                      fieldId: field.id,
                                      optionIndex: optIdx,
                                      value: opt,
                                    });
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs font-semibold transition-all group select-none cursor-grab active:cursor-grabbing ${
                                    isBeingDragged
                                      ? 'bg-[#012169]/20 border-[#012169] opacity-60'
                                      : 'bg-[#012169]/10 hover:bg-[#012169]/15 border-[#012169]/20 text-[#012169]'
                                  }`}
                                  title="Double-click to edit · Drag to reorder"
                                >
                                  <DotsSixVertical
                                    weight="bold"
                                    className="h-2.5 w-2.5 text-[#012169]/40 group-hover:text-[#012169] shrink-0"
                                  />
                                  <span>{opt}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingOption({
                                        fieldId: field.id,
                                        optionIndex: optIdx,
                                        value: opt,
                                      });
                                    }}
                                    className="text-[#012169]/40 hover:text-[#012169] p-0.5 rounded cursor-pointer"
                                    title="Edit value"
                                  >
                                    <PencilSimple weight="bold" className="h-2.5 w-2.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveOptionFromField(field.id, optIdx);
                                    }}
                                    className="text-[#012169]/60 hover:text-rose-600 transition-colors p-0.5 rounded cursor-pointer"
                                    title="Remove option"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                            ⚠️ Add at least one option value for this dropdown.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#012169] hover:bg-white text-xs font-bold text-slate-600 hover:text-[#012169] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Another Dropdown</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticky Form Actions Bar */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-xs py-2 z-20">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="uk-blue" size="md" isLoading={isSubmitting}>
            <FloppyDisk weight="bold" className="h-4 w-4 mr-1.5" />
            <span>{initialProduct ? 'Update Product' : 'Create Product'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
