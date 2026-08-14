'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductInput, CategoryConfig } from '@/lib/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ImagePreviewer } from './ImagePreviewer';
import { slugify } from '@/lib/utils';
import { Plus, Trash2, Zap, Sparkles } from 'lucide-react';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProductInput, id?: string) => Promise<void>;
  initialProduct?: Product | null;
  categories: CategoryConfig[];
}

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
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState<string>('25.00');
  const [discountedPrice, setDiscountedPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('Printing');
  const [subcategory, setSubcategory] = useState('');
  const [isSameDayAvailable, setIsSameDayAvailable] = useState(true);
  const [minQuantity, setMinQuantity] = useState<string>('1');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Available subcategories based on chosen category
  const activeCategoryConfig = categories.find((c) => c.name === category);
  const availableSubcategories = activeCategoryConfig?.subcategories || [];

  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title);
      setSlug(initialProduct.slug);
      setDescription(initialProduct.description);
      setImageUrl(initialProduct.imageUrl);
      setPrice(initialProduct.price.toString());
      setDiscountedPrice(
        initialProduct.discountedPrice ? initialProduct.discountedPrice.toString() : ''
      );
      setCategory(initialProduct.category);
      setSubcategory(initialProduct.subcategory);
      setIsSameDayAvailable(initialProduct.isSameDayAvailable);
      setMinQuantity(initialProduct.minQuantity ? initialProduct.minQuantity.toString() : '1');
      setFeatures(initialProduct.features || []);
    } else {
      // Default reset
      setTitle('');
      setSlug('');
      setDescription('');
      setImageUrl('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=1000&auto=format&fit=crop');
      setPrice('29.00');
      setDiscountedPrice('');
      setCategory('Printing');
      setSubcategory(availableSubcategories[0] || 'Business Cards');
      setIsSameDayAvailable(true);
      setMinQuantity('100');
      setFeatures([
        'Premium High Definition Print Quality',
        'Same-day London Dispatch Available',
      ]);
    }
    setError('');
  }, [initialProduct, isOpen]);

  // When category changes, auto-adjust subcategory if not in list
  useEffect(() => {
    if (!availableSubcategories.includes(subcategory) && availableSubcategories.length > 0) {
      setSubcategory(availableSubcategories[0]);
    }
  }, [category, availableSubcategories]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please provide a valid price greater than 0.');
      return;
    }

    const parsedDiscount = discountedPrice ? parseFloat(discountedPrice) : undefined;
    if (parsedDiscount !== undefined && (isNaN(parsedDiscount) || parsedDiscount <= 0)) {
      setError('Discounted price must be greater than 0.');
      return;
    }

    if (!imageUrl.trim()) {
      setError('Please provide a valid product image URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ProductInput = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        price: parsedPrice,
        discountedPrice: parsedDiscount,
        category,
        subcategory: subcategory || availableSubcategories[0] || 'General',
        isSameDayAvailable,
        minQuantity: parseInt(minQuantity, 10) || 1,
        features: features.length > 0 ? features : undefined,
      };

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
      description="Update product information, image link, pricing, and category filters."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold">
            {error}
          </div>
        )}

        {/* Title & Slug */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Product Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Silk Finish Folded Flyers"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35] focus:ring-2 focus:ring-[#4a0e35]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. silk-finish-folded-flyers"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35] focus:ring-2 focus:ring-[#4a0e35]/15"
            />
          </div>
        </div>

        {/* Category & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#4a0e35]"
            >
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Subcategory <span className="text-rose-500">*</span>
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#4a0e35]"
            >
              {availableSubcategories.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Previewer */}
        <ImagePreviewer url={imageUrl} onUrlChange={setImageUrl} />

        {/* Pricing & Min Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Base Price (£) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="35.00"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Discounted Price (£) (Optional)
            </label>
            <input
              type="number"
              step="0.01"
              value={discountedPrice}
              onChange={(e) => setDiscountedPrice(e.target.value)}
              placeholder="28.00"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Min Order Units
            </label>
            <input
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              placeholder="100"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35]"
            />
          </div>
        </div>

        {/* Same Day Toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-600" />
            <div>
              <div className="text-xs font-bold text-slate-900">Same-Day London Dispatch</div>
              <div className="text-[11px] text-slate-500">
                Show &ldquo;⚡ Same Day Available&rdquo; badge across storefront
              </div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={isSameDayAvailable}
            onChange={(e) => setIsSameDayAvailable(e.target.checked)}
            className="h-5 w-5 rounded-md text-[#4a0e35] focus:ring-[#4a0e35] cursor-pointer"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the product material, finish, dimensions, and turnaround..."
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#4a0e35] resize-none"
          />
        </div>

        {/* Features Checklist */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#4a0e35]"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>

          {features.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <span className="truncate">{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="plum" size="md" isLoading={isSubmitting}>
            {initialProduct ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
