'use client';

import React, { useState, useRef } from 'react';
import { CategoryConfig, Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { slugify } from '@/lib/utils';
import {
  FolderPlus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  UploadSimple,
  Flame,
  CheckCircle,
  WarningCircle,
  Images,
  Globe,
  Tag,
  Package,
  Broom,
} from '@phosphor-icons/react';

interface CategoryManagerProps {
  categories: CategoryConfig[];
  products?: Product[];
  onCreateCategory: (cat: {
    name: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    isBestSeller?: boolean;
  }) => Promise<void>;
  onDeleteCategory: (categoryName: string) => Promise<void>;
  onUpdateCategory: (categoryName: string, updates: Partial<CategoryConfig>) => Promise<void>;
  onPurgeMockData?: () => Promise<{ categoriesDeleted: number; productsDeleted: number }>;
  isAddModalOpen?: boolean;
  onOpenAddModal?: () => void;
  onCloseAddModal?: () => void;
}

export function CategoryManager({
  categories,
  products = [],
  onCreateCategory,
  onDeleteCategory,
  onUpdateCategory,
  onPurgeMockData,
  isAddModalOpen: controlledAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
}: CategoryManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [internalAddModalOpen, setInternalAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Form states for Add/Edit
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMetaTitle, setFormMetaTitle] = useState('');
  const [formMetaDescription, setFormMetaDescription] = useState('');
  const [formIsBestSeller, setFormIsBestSeller] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAddOpen = controlledAddModalOpen !== undefined ? controlledAddModalOpen : internalAddModalOpen;
  const setAddOpen = (open: boolean) => {
    setInternalAddModalOpen(open);
    if (!open && onCloseAddModal) onCloseAddModal();
    if (open && onOpenAddModal) onOpenAddModal();
  };

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  // Filter categories
  const filteredCategories = categories.filter((c) => {
    if (!c || !c.name) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.slug || '').toLowerCase().includes(q)
    );
  });

  // Upload S3 helper
  const uploadFileToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image to S3.');
    }

    if (data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
      return data.urls[0];
    }
    throw new Error('No upload URL returned from S3.');
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setModalError('');
    try {
      const url = await uploadFileToS3(file);
      setFormImageUrl(url);
    } catch (err: any) {
      setModalError(err.message || 'Image upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormImageUrl('');
    setFormMetaTitle('');
    setFormMetaDescription('');
    setFormIsBestSeller(false);
    setModalError('');
    setAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: CategoryConfig) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug || slugify(cat.name));
    setFormDescription(cat.description || '');
    setFormImageUrl(cat.imageUrl || '');
    setFormMetaTitle(cat.metaTitle || `${cat.name} | Print Today UK`);
    setFormMetaDescription(cat.metaDescription || cat.description || '');
    setFormIsBestSeller(Boolean(cat.isBestSeller));
    setModalError('');
    setIsEditModalOpen(true);
  };

  // Submit Add Category
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setModalError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      await onCreateCategory({
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName),
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim(),
        metaTitle: formMetaTitle.trim(),
        metaDescription: formMetaDescription.trim(),
        isBestSeller: formIsBestSeller,
      });
      showSuccess(`Created category "${formName.trim()}".`);
      setAddOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Category
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!formName.trim()) {
      setModalError('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      await onUpdateCategory(editingCategory.name, {
        name: formName.trim(),
        slug: formSlug.trim() || slugify(formName),
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim(),
        metaTitle: formMetaTitle.trim(),
        metaDescription: formMetaDescription.trim(),
        isBestSeller: formIsBestSeller,
      });
      showSuccess(`Updated category "${formName.trim()}".`);
      setIsEditModalOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Category
  const handleDelete = async (categoryName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${categoryName}"? All products in this category will remain, but will need to be reassigned.`)) {
      return;
    }

    try {
      await onDeleteCategory(categoryName);
      showSuccess(`Deleted category "${categoryName}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete category.');
    }
  };

  // Quick toggle Best Seller
  const handleToggleBestSeller = async (cat: CategoryConfig) => {
    const newVal = !cat.isBestSeller;
    try {
      await onUpdateCategory(cat.name, { isBestSeller: newVal });
      showSuccess(`${cat.name} ${newVal ? 'enlisted in Best Sellers & Mega Menu' : 'removed from Best Sellers'}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update Best Seller status.');
    }
  };

  const handlePurgeMockData = async () => {
    if (!onPurgeMockData) return;
    if (
      !window.confirm(
        'Are you sure you want to permanently delete all mock / seed dummy data from Firestore? This will remove all dummy test categories (e.g. brochures, mugs, flyers, hoodies, pens) and keep only your genuine custom items.'
      )
    ) {
      return;
    }
    setIsPurging(true);
    try {
      const res = await onPurgeMockData();
      showSuccess(`Cleaned up ${res.categoriesDeleted} dummy categories and ${res.productsDeleted} dummy products from Firestore!`);
    } catch (err: any) {
      alert(err.message || 'Failed to purge mock data.');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6 font-['Open_Sans',sans-serif]">
      {/* Top Banner Notice */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Category Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {categories.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your online store categories, cover pictures, and SEO meta tags. Products are added directly under each category.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onPurgeMockData && (
            <button
              onClick={handlePurgeMockData}
              disabled={isPurging}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Permanently remove all dummy/mock seed categories from Firestore"
            >
              <Broom weight="bold" className="h-4 w-4" />
              <span>{isPurging ? 'Purging...' : 'Purge Mock Data'}</span>
            </button>
          )}

          <Button variant="uk-blue" size="md" onClick={handleOpenAdd}>
            <FolderPlus weight="bold" className="h-4 w-4 mr-1.5" />
            <span>Add Category</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#012169]"
          />
        </div>

        <div className="text-xs font-semibold text-slate-500 hidden sm:block">
          Showing <span className="font-bold text-slate-900">{filteredCategories.length}</span> categories
        </div>
      </div>

      {/* Categories List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center">
            <Tag weight="fill" className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-900">No categories found</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? 'No categories match your search term.' : 'Click "Add Category" above to create your first catalog category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4 text-center">Products</th>
                  <th className="py-3.5 px-4 text-center">Best Seller / Menu</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCategories.map((cat) => {
                  const prodCount = products.filter(
                    (p) => p && p.category && p.category.toLowerCase() === cat.name.toLowerCase()
                  ).length;

                  return (
                    <tr key={cat.name} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Cover Image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            {cat.imageUrl ? (
                              <img
                                src={cat.imageUrl}
                                alt={cat.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-300">
                                <Images className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {cat.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              /{cat.slug || slugify(cat.name)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-600 text-xs line-clamp-2">
                          {cat.description || <span className="text-slate-400 italic">No description set</span>}
                        </p>
                      </td>

                      {/* Product Count */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                          <Package className="h-3 w-3 text-slate-500" />
                          <span>{prodCount}</span>
                        </span>
                      </td>

                      {/* Enlist in Best Sellers / Mega Menu Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleBestSeller(cat)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            cat.isBestSeller
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                          title="Toggle enlisting in A-Z Mega Menu & Best Sellers"
                        >
                          <Flame weight={cat.isBestSeller ? 'fill' : 'bold'} className={`h-3.5 w-3.5 ${cat.isBestSeller ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span>{cat.isBestSeller ? 'Enlisted' : 'Standard'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(cat)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <PencilSimple weight="bold" className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(cat.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash weight="bold" className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* ADD CATEGORY MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Category"
        description="Create a category with a cover picture, description, and SEO metadata."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitAdd} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold flex items-center gap-2">
              <WarningCircle weight="bold" className="h-4 w-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => {
                setFormName(e.target.value);
                setFormSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Signs & Signage"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              placeholder="e.g. signs-signage"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Brief description of this category for landing page cards and SEO..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cover Image (S3 Picture)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                {formImageUrl ? (
                  <img src={formImageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    <Images className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                  >
                    <UploadSimple weight="bold" className="h-3.5 w-3.5 mr-1" />
                    <span>{formImageUrl ? 'Replace Picture' : 'Upload to S3'}</span>
                  </Button>

                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Or paste external image URL..."
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-700 focus:outline-hidden focus:border-[#012169]"
                />
              </div>
            </div>
          </div>

          {/* SEO Meta Fields */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-blue-600" />
              <span>SEO & Meta Data (Google Ranking)</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={formMetaTitle}
                onChange={(e) => setFormMetaTitle(e.target.value)}
                placeholder={`${formName || 'Category'} | Same Day London Print Today UK`}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={formMetaDescription}
                onChange={(e) => setFormMetaDescription(e.target.value)}
                placeholder="Meta description for search engine previews..."
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>
          </div>

          {/* Enlist in Best Sellers */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="addIsBestSeller"
              checked={formIsBestSeller}
              onChange={(e) => setFormIsBestSeller(e.target.checked)}
              className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="addIsBestSeller" className="text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1">
              <Flame weight="fill" className="h-3.5 w-3.5 text-amber-500" />
              <span>Enlist in A-Z Mega Menu Best Sellers section</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="uk-blue" size="sm" isLoading={isSubmitting}>
              Create Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* EDIT CATEGORY MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Category: ${editingCategory?.name}`}
        description="Update category name, cover picture, and SEO tags."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitEdit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold flex items-center gap-2">
              <WarningCircle weight="bold" className="h-4 w-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Cover Image (S3 Picture)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                {formImageUrl ? (
                  <img src={formImageUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    <Images className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    isLoading={isUploading}
                  >
                    <UploadSimple weight="bold" className="h-3.5 w-3.5 mr-1" />
                    <span>{formImageUrl ? 'Replace Picture' : 'Upload to S3'}</span>
                  </Button>

                  {formImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="Or paste external image URL..."
                  className="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] text-slate-700 focus:outline-hidden focus:border-[#012169]"
                />
              </div>
            </div>
          </div>

          {/* SEO Meta Fields */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-blue-600" />
              <span>SEO & Meta Data (Google Ranking)</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Meta Title
              </label>
              <input
                type="text"
                value={formMetaTitle}
                onChange={(e) => setFormMetaTitle(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Meta Description
              </label>
              <textarea
                rows={2}
                value={formMetaDescription}
                onChange={(e) => setFormMetaDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>
          </div>

          {/* Enlist in Best Sellers */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              type="checkbox"
              id="editIsBestSeller"
              checked={formIsBestSeller}
              onChange={(e) => setFormIsBestSeller(e.target.checked)}
              className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="editIsBestSeller" className="text-xs font-semibold text-slate-800 cursor-pointer flex items-center gap-1">
              <Flame weight="fill" className="h-3.5 w-3.5 text-amber-500" />
              <span>Enlist in A-Z Mega Menu Best Sellers section</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="uk-blue" size="sm" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
