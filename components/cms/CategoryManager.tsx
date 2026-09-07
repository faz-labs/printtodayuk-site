'use client';

import React, { useState } from 'react';
import { CategoryConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Trash,
  FolderPlus,
  Sparkle,
  Check,
  Stack,
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
    subcategories?: string[];
  }) => Promise<void>;
  onDeleteCategory?: (categoryName: string) => Promise<void>;
}

export function CategoryManager({
  categories,
  onUpdateSubcategories,
  onCreateCategory,
  onDeleteCategory,
}: CategoryManagerProps) {
  const [activeCategoryName, setActiveCategoryName] = useState<string>(
    categories[0]?.name || 'Printing'
  );
  const [newSubcatInput, setNewSubcatInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add category modal state
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatSubcats, setNewCatSubcats] = useState('');
  const [catModalError, setCatModalError] = useState('');

  const currentCategory =
    categories.find(
      (c) => c.name.toLowerCase() === activeCategoryName.toLowerCase()
    ) ||
    categories[0] || {
      name: 'Printing',
      subcategories: [],
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
    setIsSaving(true);
    try {
      await onUpdateSubcategories(currentCategory.name, updated);
      showSuccess(`Removed "${subcatToRemove}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to remove subcategory');
    } finally {
      setIsSaving(false);
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
          subcategories: subcats,
        });
        setActiveCategoryName(newCatName.trim());
        setIsAddCatModalOpen(false);
        setNewCatName('');
        setNewCatDescription('');
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Category & Subcategory Hierarchy
          </h2>
          <p className="text-xs text-slate-500">
            Create custom categories and organize subcategories for the storefront navigation.
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

              {/* Allow deleting category if there are multiple categories */}
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

      {/* Subcategory Manager Box for Active Category */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">
                {currentCategory.name}
              </h3>
              <Badge variant="uk-blue" className="text-[10px]">
                {currentCategory.subcategories.length} Subcategories
              </Badge>
            </div>
            {currentCategory.description && (
              <p className="text-xs text-slate-500 mt-1">
                {currentCategory.description}
              </p>
            )}
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
            placeholder={`Add subcategory to ${currentCategory.name} (e.g. Roll-Up Banners)...`}
            className="flex-1 h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#012169]"
          />
          <Button type="submit" variant="uk-blue" size="md" isLoading={isSaving}>
            <Plus weight="bold" className="h-4 w-4 mr-1" />
            <span>Add</span>
          </Button>
        </form>

        {/* Subcategories list grid */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Active Subcategories in {currentCategory.name}
          </div>

          {currentCategory.subcategories.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400">
              No subcategories added yet. Type a name above and click Add.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {currentCategory.subcategories.map((subcat) => (
                <div
                  key={subcat}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {subcat}
                  </span>
                  <button
                    onClick={() => handleRemoveSubcategory(subcat)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
                    title={`Delete ${subcat}`}
                  >
                    <Trash weight="bold" className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add New Category Modal */}
      <Modal
        isOpen={isAddCatModalOpen}
        onClose={() => setIsAddCatModalOpen(false)}
        title="Create New Category"
        description="Add a new high-level catalog category (e.g. Signs, Packaging, Merchandise)."
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
              placeholder="e.g. Signs & Banners, Packaging, Merchandise"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Short Description (Optional)
            </label>
            <input
              type="text"
              value={newCatDescription}
              onChange={(e) => setNewCatDescription(e.target.value)}
              placeholder="e.g. Outdoor and indoor commercial signage in London"
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
              placeholder="e.g. A-Boards, Window Graphics, Lightboxes, Metal Signs"
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
              isLoading={isSaving}
            >
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
