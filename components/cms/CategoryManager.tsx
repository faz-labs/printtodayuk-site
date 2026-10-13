'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { CategoryConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Trash,
  FolderPlus,
  Check,
  Stack,
  UploadSimple,
  ImageSquare,
  CircleNotch,
  ArrowSquareOut,
  PencilSimple,
} from '@phosphor-icons/react';

interface CategoryManagerProps {
  categories: CategoryConfig[];
  onUpdateSubcategories: (
    categoryName: string,
    subcategories: string[]
  ) => Promise<void>;
  onCreateCategory?: (category: {
    name: string;
    description?: string;
    imageUrl?: string;
    subcategories?: string[];
    subcategoryImages?: Record<string, string>;
  }) => Promise<void>;
  onDeleteCategory?: (categoryName: string) => Promise<void>;
  onUpdateCategory?: (
    categoryName: string,
    updates: Partial<CategoryConfig>
  ) => Promise<void>;
}

export function CategoryManager({
  categories,
  onUpdateSubcategories,
  onCreateCategory,
  onDeleteCategory,
  onUpdateCategory,
}: CategoryManagerProps) {
  const [activeCategoryName, setActiveCategoryName] = useState<string>(
    categories[0]?.name || 'Gift Items'
  );
  const [newSubcatInput, setNewSubcatInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);

  // Hidden file inputs
  const categoryImageInputRef = useRef<HTMLInputElement>(null);
  const subcatImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Add category modal state
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatImageUrl, setNewCatImageUrl] = useState('');
  const [newCatSubcats, setNewCatSubcats] = useState('');
  const [catModalError, setCatModalError] = useState('');
  const [isModalUploading, setIsModalUploading] = useState(false);

  const currentCategory =
    categories.find(
      (c) => c.name.toLowerCase() === activeCategoryName.toLowerCase()
    ) ||
    categories[0] || {
      name: 'Gift Items',
      subcategories: [],
      subcategoryImages: {},
    };

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

  const handleCategoryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget('category_cover');
    try {
      const url = await uploadFileToS3(file);
      if (onUpdateCategory) {
        await onUpdateCategory(currentCategory.name, { imageUrl: url });
      }
      showSuccess(`Updated cover image for ${currentCategory.name}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to upload category image.');
    } finally {
      setUploadingTarget(null);
      if (categoryImageInputRef.current) categoryImageInputRef.current.value = '';
    }
  };

  const handleRemoveCategoryImage = async () => {
    if (!window.confirm(`Remove cover image for ${currentCategory.name}?`)) return;
    setIsSaving(true);
    try {
      if (onUpdateCategory) {
        await onUpdateCategory(currentCategory.name, { imageUrl: '' });
      }
      showSuccess(`Removed cover image for ${currentCategory.name}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to remove image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubcategoryImageUpload = async (subcat: string, file: File) => {
    setUploadingTarget(`subcat_${subcat}`);
    try {
      const url = await uploadFileToS3(file);
      const updatedImages = {
        ...(currentCategory.subcategoryImages || {}),
        [subcat]: url,
      };

      if (onUpdateCategory) {
        await onUpdateCategory(currentCategory.name, {
          subcategoryImages: updatedImages,
        });
      }
      showSuccess(`Updated photo for "${subcat}".`);
    } catch (err: any) {
      alert(err.message || `Failed to upload image for ${subcat}.`);
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleRemoveSubcategoryImage = async (subcat: string) => {
    if (!window.confirm(`Remove picture for "${subcat}"?`)) return;
    setIsSaving(true);
    try {
      const updatedImages = { ...(currentCategory.subcategoryImages || {}) };
      delete updatedImages[subcat];

      if (onUpdateCategory) {
        await onUpdateCategory(currentCategory.name, {
          subcategoryImages: updatedImages,
        });
      }
      showSuccess(`Removed photo for "${subcat}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to remove image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubcatInput.trim()) return;

    const trimmed = newSubcatInput.trim();
    if (currentCategory.subcategories.includes(trimmed)) {
      alert('This subcategory already exists in this category.');
      return;
    }

    const updated = [...currentCategory.subcategories, trimmed];
    setIsSaving(true);
    try {
      await onUpdateSubcategories(currentCategory.name, updated);
      setNewSubcatInput('');
      showSuccess(`Added "${trimmed}" to ${currentCategory.name}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to add subcategory');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveSubcategory = async (subcatToRemove: string) => {
    if (
      !window.confirm(
        `Remove "${subcatToRemove}" from ${currentCategory.name}? Products in this subcategory will remain in the catalog.`
      )
    ) {
      return;
    }

    const updated = currentCategory.subcategories.filter((s) => s !== subcatToRemove);
    const updatedImages = { ...(currentCategory.subcategoryImages || {}) };
    delete updatedImages[subcatToRemove];

    setIsSaving(true);
    try {
      await onUpdateSubcategories(currentCategory.name, updated);
      if (onUpdateCategory) {
        await onUpdateCategory(currentCategory.name, {
          subcategoryImages: updatedImages,
        });
      }
      showSuccess(`Removed "${subcatToRemove}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to remove subcategory');
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsModalUploading(true);
    try {
      const url = await uploadFileToS3(file);
      setNewCatImageUrl(url);
    } catch (err: any) {
      setCatModalError(err.message || 'Failed to upload category image.');
    } finally {
      setIsModalUploading(false);
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatModalError('');

    if (!newCatName.trim()) {
      setCatModalError('Category name is required.');
      return;
    }

    const exists = categories.some(
      (c) => c.name.toLowerCase() === newCatName.trim().toLowerCase()
    );
    if (exists) {
      setCatModalError('A category with this name already exists.');
      return;
    }

    const subcats = newCatSubcats
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setIsSaving(true);
    try {
      if (onCreateCategory) {
        await onCreateCategory({
          name: newCatName.trim(),
          description: newCatDescription.trim() || undefined,
          imageUrl: newCatImageUrl.trim() || undefined,
          subcategories: subcats,
        });
        setActiveCategoryName(newCatName.trim());
        setIsAddCatModalOpen(false);
        setNewCatName('');
        setNewCatDescription('');
        setNewCatImageUrl('');
        setNewCatSubcats('');
        showSuccess(`Category "${newCatName.trim()}" created successfully!`);
      } else {
        alert('Category creation not configured on this host.');
      }
    } catch (err: any) {
      setCatModalError(err.message || 'Failed to create category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (catName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the entire category "${catName}"? This will remove its navigation tabs and filters.`
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      if (onDeleteCategory) {
        await onDeleteCategory(catName);
        const remaining = categories.filter((c) => c.name !== catName);
        if (remaining.length > 0) {
          setActiveCategoryName(remaining[0].name);
        }
        showSuccess(`Deleted category "${catName}".`);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    } finally {
      setIsSaving(false);
    }
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Title & Add Category Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Category & Subcategory Hierarchy (with S3 Images)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload pictures for categories and subcategories (e.g. Mugs, Pens) to display on the storefront landing page.
          </p>
        </div>

        <Button
          variant="uk-blue"
          size="md"
          onClick={() => setIsAddCatModalOpen(true)}
        >
          <FolderPlus weight="bold" className="h-4 w-4 mr-1.5" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isSelected =
            cat.name.toLowerCase() === currentCategory.name.toLowerCase();

          return (
            <div
              key={cat.name}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs transition-all border shrink-0 ${
                isSelected
                  ? 'bg-[#012169] text-white border-[#012169] shadow-md shadow-[#012169]/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <button
                onClick={() => setActiveCategoryName(cat.name)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Stack weight="bold" className="h-3.5 w-3.5" />
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.subcategories?.length || 0}
                </span>
              </button>

              {categories.length > 1 && (
                <button
                  onClick={() => handleDeleteCategory(cat.name)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ml-1 ${
                    isSelected
                      ? 'text-blue-200 hover:text-white hover:bg-white/10'
                      : 'text-slate-400 hover:text-rose-600 hover:bg-slate-100'
                  }`}
                  title={`Delete ${cat.name} category`}
                >
                  <Trash weight="bold" className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Category Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Header with Category Name, Description & Category Cover Picture */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">
                {currentCategory.name}
              </h3>
              <Badge variant="uk-blue" className="text-[10px]">
                {currentCategory.subcategories.length} Subcategories
              </Badge>
            </div>
            {currentCategory.description && (
              <p className="text-xs text-slate-600 max-w-xl">
                {currentCategory.description}
              </p>
            )}
          </div>

          {/* Category Cover Picture Upload / Preview */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {currentCategory.imageUrl ? (
                <Image
                  src={currentCategory.imageUrl}
                  alt={currentCategory.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <ImageSquare className="w-6 h-6 text-slate-400" />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold text-slate-700">
                Category Cover Picture
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="file"
                  accept="image/*"
                  ref={categoryImageInputRef}
                  onChange={handleCategoryImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => categoryImageInputRef.current?.click()}
                  isLoading={uploadingTarget === 'category_cover'}
                  className="text-[11px] h-7 px-2.5"
                >
                  <UploadSimple weight="bold" className="w-3 h-3 mr-1" />
                  <span>{currentCategory.imageUrl ? 'Change' : 'Upload S3'}</span>
                </Button>

                {currentCategory.imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveCategoryImage}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Remove category picture"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <Check weight="bold" className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Add new subcategory form */}
        <form onSubmit={handleAddSubcategory} className="flex gap-2 max-w-lg">
          <input
            type="text"
            value={newSubcatInput}
            onChange={(e) => setNewSubcatInput(e.target.value)}
            placeholder={`Add subcategory to ${currentCategory.name} (e.g. Mugs, Pens, Keyrings)...`}
            className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#012169]"
          />
          <Button type="submit" variant="uk-blue" size="md" isLoading={isSaving}>
            <Plus weight="bold" className="h-4 w-4 mr-1" />
            <span>Add</span>
          </Button>
        </form>

        {/* Subcategories list with Image Upload for each */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Subcategories & Landing Page Images ({currentCategory.subcategories.length})
          </div>

          {currentCategory.subcategories.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
              No subcategories added yet. Type a name above (e.g. Mugs or Pens) and click Add.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentCategory.subcategories.map((subcat) => {
                const imgUrl = currentCategory.subcategoryImages?.[subcat];
                const isUploadingThis = uploadingTarget === `subcat_${subcat}`;

                return (
                  <div
                    key={subcat}
                    className="flex flex-col justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:bg-slate-100/60 transition-colors space-y-3"
                  >
                    {/* Picture Preview and Subcategory Name */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={subcat}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ImageSquare className="w-5 h-5 text-slate-300" />
                        )}
                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <CircleNotch className="w-4 h-4 text-white animate-spin" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {subcat}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                          {imgUrl ? 'Image uploaded' : 'Default image'}
                        </span>
                      </div>

                      {/* Delete Subcategory Button */}
                      <button
                        onClick={() => handleRemoveSubcategory(subcat)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                        title={`Delete ${subcat}`}
                      >
                        <Trash weight="bold" className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Actions: Upload Picture file input */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        ref={(el) => {
                          subcatImageInputRefs.current[subcat] = el;
                        }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleSubcategoryImageUpload(subcat, file);
                          if (e.target) e.target.value = '';
                        }}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => subcatImageInputRefs.current[subcat]?.click()}
                        disabled={isUploadingThis}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#012169] hover:text-[#0A358C] hover:underline cursor-pointer"
                      >
                        <UploadSimple weight="bold" className="w-3 h-3" />
                        <span>{imgUrl ? 'Change Picture' : 'Upload Picture'}</span>
                      </button>

                      {imgUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategoryImage(subcat)}
                          className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add New Category Modal */}
      <Modal
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        title="Create New Category"
        description="Add a new high-level catalog category (e.g. Gift Items, Signs, Packaging)."
        maxWidth="md"
      >
        <form onSubmit={handleCreateCategorySubmit} className="space-y-4 pt-2">
          {catModalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              {catModalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Gift Items, Signs & Banners, Packaging"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category Cover Image (Upload to S3 or Paste URL)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatImageUrl}
                onChange={(e) => setNewCatImageUrl(e.target.value)}
                placeholder="https://... or click Upload file"
                className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
              <label className="h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shrink-0">
                <UploadSimple className="w-3.5 h-3.5" />
                <span>{isModalUploading ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleModalImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Short Description (Optional)
            </label>
            <input
              type="text"
              value={newCatDescription}
              onChange={(e) => setNewCatDescription(e.target.value)}
              placeholder="e.g. Personalized mugs, pens, bottles and custom merchandise"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Initial Subcategories (Comma-separated)
            </label>
            <textarea
              rows={2}
              value={newCatSubcats}
              onChange={(e) => setNewCatSubcats(e.target.value)}
              placeholder="e.g. Mugs, Pens, Water Bottles, Notebooks"
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169] resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddCatModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="uk-blue"
              size="md"
              isLoading={isSaving || isModalUploading}
            >
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
