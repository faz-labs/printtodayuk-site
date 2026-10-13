'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductInput, CategoryConfig, CustomField } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MultiImageUploader } from './MultiImageUploader';
import { Plus, Trash, Lightning, Sparkle, SlidersHorizontal, X, FloppyDisk } from '@phosphor-icons/react';

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
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState<string>('25.00');
  const [discountedPrice, setDiscountedPrice] = useState<string>('');
  const [category, setCategory] = useState<string>('Printing');
  const [subcategory, setSubcategory] = useState('');
  const [isSameDayAvailable, setIsSameDayAvailable] = useState(true);
  const [minQuantity, setMinQuantity] = useState<string>('1');
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [activeNewOptionText, setActiveNewOptionText] = useState<{ [fieldId: string]: string }>({});
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
      const prodImages =
        initialProduct.images && initialProduct.images.length > 0
          ? initialProduct.images
          : initialProduct.imageUrl
          ? [initialProduct.imageUrl]
          : [];
      setImages(prodImages);
      setImageUrl(prodImages[0] || initialProduct.imageUrl || '');
      setPrice(initialProduct.price.toString());
      setDiscountedPrice(
        initialProduct.discountedPrice ? initialProduct.discountedPrice.toString() : ''
      );
      setCategory(initialProduct.category);
      setSubcategory(initialProduct.subcategory);
      setIsSameDayAvailable(initialProduct.isSameDayAvailable);
      setMinQuantity(initialProduct.minQuantity ? initialProduct.minQuantity.toString() : '1');
      setFeatures(initialProduct.features || []);
      setCustomFields(initialProduct.customFields || []);
    } else {
      // Default reset
      setTitle('');
      setSlug('');
      setDescription('');
      setImages([]);
      setImageUrl('');
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
      setCustomFields([]);
    }
    setActiveNewOptionText({});
    setError('');
  }, [initialProduct, isOpen]);

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    if (newImages.length > 0) {
      setImageUrl(newImages[0]);
    } else {
      setImageUrl('');
    }
  };

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

  // Custom Fields Handler
  const handleAddCustomField = () => {
    const newField: CustomField = {
      id: `fld-${Date.now()}`,
      name: '',
      options: [],
      required: true,
    };
    setCustomFields([...customFields, newField]);
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

  const handleAddPreset = (type: 'size' | 'finish' | 'apparelSize' | 'paperWeight') => {
    let newField: CustomField;
    const uniqueId = `fld-${Date.now()}`;
    if (type === 'size') {
      newField = {
        id: uniqueId,
        name: 'Choose A Size',
        options: ['85x55mm (Standard UK)', '66x55mm (Mini)', 'Custom Dimensions'],
        required: true,
      };
    } else if (type === 'finish') {
      newField = {
        id: uniqueId,
        name: 'Choose A Finish',
        options: ['Velvet Soft-Touch Matt', 'High Gloss Lamination', 'Uncoated Natural', 'Spot UV Finish'],
        required: true,
      };
    } else if (type === 'apparelSize') {
      newField = {
        id: uniqueId,
        name: 'Select Size',
        options: ['Small (S)', 'Medium (M)', 'Large (L)', 'XL', '2XL', '3XL'],
        required: true,
      };
    } else {
      newField = {
        id: uniqueId,
        name: 'Paper Weight / Stock',
        options: ['450gsm Premium Silk Board', '350gsm Classic Silk', '170gsm Gloss Paper', '220gsm Photo Satin'],
        required: true,
      };
    }
    setCustomFields([...customFields, newField]);
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

    setIsSubmitting(true);
    try {
      const payload: ProductInput = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim(),
        imageUrl: finalImages[0],
        images: finalImages,
        price: parsedPrice,
        discountedPrice: parsedDiscount,
        category,
        subcategory: subcategory || availableSubcategories[0] || 'General',
        isSameDayAvailable,
        minQuantity: parseInt(minQuantity, 10) || 1,
        features: features.length > 0 ? features : undefined,
        customFields: validCustomFields.length > 0 ? validCustomFields : undefined,
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
      description="Update product information, custom dropdown fields, pricing, and category filters."
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
              placeholder="e.g. Luxury Business Cards"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15"
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
              placeholder="e.g. luxury-business-cards"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15"
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
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
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
              className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
            >
              {availableSubcategories.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Multi-Image S3 Uploader */}
        <MultiImageUploader images={images} onImagesChange={handleImagesChange} />

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
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
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
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
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
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>
        </div>

        {/* Same Day Toggle */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightning weight="fill" className="h-4 w-4 text-emerald-600" />
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
            className="h-5 w-5 rounded-md text-[#012169] focus:ring-[#012169] cursor-pointer"
          />
        </div>

        {/* Custom Fields & Dropdown Options Section */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal weight="bold" className="h-4 w-4 text-[#012169]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Custom Dropdowns & Options
                </h4>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Add customizable option selectors (e.g. &ldquo;Choose A Size&rdquo;, &ldquo;Choose A Finish&rdquo;) for customers on the product page.
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

          {/* Quick 1-Click Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Quick Presets:
            </span>
            <button
              type="button"
              onClick={() => handleAddPreset('size')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              + Choose A Size
            </button>
            <button
              type="button"
              onClick={() => handleAddPreset('finish')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              + Choose A Finish
            </button>
            <button
              type="button"
              onClick={() => handleAddPreset('paperWeight')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              + Paper Stock
            </button>
            <button
              type="button"
              onClick={() => handleAddPreset('apparelSize')}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:text-rose-600 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              + Apparel Sizes (S-3XL)
            </button>
          </div>

          {/* Render Active Custom Fields */}
          {customFields.length === 0 ? (
            <div className="p-4 rounded-xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-400">
              No custom dropdowns yet. Click &ldquo;Add Dropdown&rdquo; or pick a Quick Preset above.
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              {customFields.map((field, fIndex) => (
                <div
                  key={field.id}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Dropdown Label / Field Title
                      </label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleUpdateFieldName(field.id, e.target.value)}
                        placeholder="e.g. Choose A Size, Choose A Finish..."
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomField(field.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer self-end mb-0.5"
                      title="Remove field"
                    >
                      <Trash weight="bold" className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Dropdown Options (Values) list */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Selectable Dropdown Options (Values)
                    </label>

                    {/* Add option input */}
                    <div className="flex gap-2 mb-2">
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
                        placeholder={`Add option (e.g. 66x55mm, Matt Laminate)...`}
                        className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddOptionToField(field.id)}
                        className="px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    {/* Options list chips */}
                    {field.options.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {field.options.map((opt, optIdx) => (
                          <span
                            key={optIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#012169]/10 border border-[#012169]/20 text-[#012169] text-xs font-semibold"
                          >
                            <span>{opt}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOptionFromField(field.id, optIdx)}
                              className="text-[#012169]/60 hover:text-rose-600 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        ⚠️ Add at least one option value for this dropdown.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169] resize-none"
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
              className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
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
            <div className="space-y-1.5">
              {features.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                >
                  <span className="truncate">{feat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
