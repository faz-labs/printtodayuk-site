'use client';

import React, { useState } from 'react';
import { DynamicSection, DynamicSectionInput, CategoryConfig, Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  Layout,
  Plus,
  PencilSimple,
  Trash,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  WarningCircle,
  SquaresFour,
  ArrowsHorizontal,
  Package,
  Stack,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';

interface SectionManagerProps {
  sections: DynamicSection[];
  categories: CategoryConfig[];
  products: Product[];
  onCreateSection: (input: DynamicSectionInput) => Promise<void>;
  onUpdateSection: (id: string, updates: Partial<DynamicSection>) => Promise<void>;
  onDeleteSection: (id: string) => Promise<void>;
}

export function SectionManager({
  sections,
  categories,
  products,
  onCreateSection,
  onUpdateSection,
  onDeleteSection,
}: SectionManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<DynamicSection | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formType, setFormType] = useState<'horizontal_scroll' | 'grid_8_tiles'>('horizontal_scroll');
  const [formSourceType, setFormSourceType] = useState<'category' | 'products'>('category');
  const [formCategoryName, setFormCategoryName] = useState(categories[0]?.name || '');
  const [formProductIds, setFormProductIds] = useState<string[]>([]);
  const [formOrder, setFormOrder] = useState<number>(sections.length + 1);
  const [formIsActive, setFormIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormSubtitle('');
    setFormType('horizontal_scroll');
    setFormSourceType('category');
    setFormCategoryName(categories[0]?.name || '');
    setFormProductIds([]);
    setFormOrder(sections.length + 1);
    setFormIsActive(true);
    setModalError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sec: DynamicSection) => {
    setEditingSection(sec);
    setFormTitle(sec.title);
    setFormSubtitle(sec.subtitle || '');
    setFormType(sec.type);
    setFormSourceType(sec.sourceType);
    setFormCategoryName(sec.categoryName || categories[0]?.name || '');
    setFormProductIds(sec.productIds || []);
    setFormOrder(sec.order || 1);
    setFormIsActive(sec.isActive);
    setModalError('');
    setIsEditModalOpen(true);
  };

  const handleToggleProduct = (prodId: string) => {
    setFormProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError('Section title is required.');
      return;
    }

    if (formSourceType === 'products' && formProductIds.length === 0) {
      setModalError('Please select at least one product for this section.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      await onCreateSection({
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || undefined,
        type: formType,
        sourceType: formSourceType,
        categoryName: formSourceType === 'category' ? formCategoryName : undefined,
        productIds: formSourceType === 'products' ? formProductIds : undefined,
        order: Number(formOrder) || 1,
        isActive: formIsActive,
      });
      showSuccess(`Created landing section "${formTitle.trim()}".`);
      setIsAddModalOpen(false);
    } catch (err: any) {
      setModalError(err.message || 'Failed to create section.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection || !editingSection.id) return;
    if (!formTitle.trim()) {
      setModalError('Section title is required.');
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      await onUpdateSection(editingSection.id, {
        title: formTitle.trim(),
        subtitle: formSubtitle.trim() || undefined,
        type: formType,
        sourceType: formSourceType,
        categoryName: formSourceType === 'category' ? formCategoryName : undefined,
        productIds: formSourceType === 'products' ? formProductIds : undefined,
        order: Number(formOrder) || 1,
        isActive: formIsActive,
      });
      showSuccess(`Updated section "${formTitle.trim()}".`);
      setIsEditModalOpen(false);
      setEditingSection(null);
    } catch (err: any) {
      setModalError(err.message || 'Failed to update section.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (sec: DynamicSection) => {
    if (!sec.id) return;
    if (!window.confirm(`Delete landing section "${sec.title}"?`)) return;

    try {
      await onDeleteSection(sec.id);
      showSuccess(`Deleted section "${sec.title}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete section.');
    }
  };

  const handleToggleActive = async (sec: DynamicSection) => {
    if (!sec.id) return;
    try {
      await onUpdateSection(sec.id, { isActive: !sec.isActive });
      showSuccess(`Section is now ${!sec.isActive ? 'Active on Storefront' : 'Hidden'}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-6 font-['Open_Sans',sans-serif]">
      {/* Top Banner Notice */}
      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs animate-fade-in">
          <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Dynamic Landing Page Sections</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {sections.length} Sections
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Create custom showcase rows on your landing page. Choose between auto-scrolling horizontal product carousels or fixed 8-tile grids.
          </p>
        </div>

        <Button variant="uk-blue" size="md" onClick={handleOpenAdd}>
          <Plus weight="bold" className="h-4 w-4 mr-1.5" />
          <span>Add Section</span>
        </Button>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {sortedSections.length === 0 ? (
          <div className="p-12 text-center">
            <Layout weight="fill" className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-900">No landing sections created yet</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Add your first dynamic section above. You can showcase a category with auto-scroll or an 8-tile product grid.
            </p>
            <div className="mt-4 flex justify-center">
              <Button variant="uk-blue" size="sm" onClick={handleOpenAdd}>
                <Plus weight="bold" className="h-3.5 w-3.5 mr-1" />
                <span>Create Section</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4 text-center">Position</th>
                  <th className="py-3.5 px-4">Section Title</th>
                  <th className="py-3.5 px-4">Layout Type</th>
                  <th className="py-3.5 px-4">Source Content</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedSections.map((sec) => {
                  return (
                    <tr key={sec.id || sec.title} className="hover:bg-slate-50/70 transition-colors">
                      {/* Order Position */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="h-7 w-7 rounded-lg bg-slate-100 text-slate-800 font-black text-xs inline-flex items-center justify-center">
                          #{sec.order}
                        </span>
                      </td>

                      {/* Section Title & Subtitle */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{sec.title}</div>
                        {sec.subtitle && (
                          <div className="text-[11px] text-slate-400 line-clamp-1">{sec.subtitle}</div>
                        )}
                      </td>

                      {/* Layout Type */}
                      <td className="py-3.5 px-4">
                        {sec.type === 'horizontal_scroll' ? (
                          <Badge variant="uk-blue" className="inline-flex items-center gap-1 text-[11px]">
                            <ArrowsHorizontal weight="bold" className="h-3 w-3" />
                            <span>Horizontal Auto-Scroll Row</span>
                          </Badge>
                        ) : (
                          <Badge variant="default" className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 border-purple-200">
                            <SquaresFour weight="bold" className="h-3 w-3" />
                            <span>Fixed 8-Tile Grid (2x4)</span>
                          </Badge>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        {sec.sourceType === 'category' ? (
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Stack weight="bold" className="h-3.5 w-3.5 text-blue-600" />
                            <span>Category: {sec.categoryName || 'All'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                            <Package weight="bold" className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Custom: {sec.productIds?.length || 0} Products</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(sec)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            sec.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {sec.isActive ? (
                            <>
                              <Eye weight="bold" className="h-3 w-3 text-emerald-600" />
                              <span>Live</span>
                            </>
                          ) : (
                            <>
                              <EyeSlash weight="bold" className="h-3 w-3 text-slate-400" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(sec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <PencilSimple weight="bold" className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => handleDelete(sec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
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

      {/* ADD / EDIT SECTION MODAL */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingSection(null);
        }}
        title={isEditModalOpen ? 'Edit Landing Section' : 'Add New Landing Section'}
        description="Configure layout type, source products, and display position on the homepage."
        maxWidth="2xl"
      >
        <form
          onSubmit={isEditModalOpen ? handleSubmitEdit : handleSubmitAdd}
          className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
        >
          {modalError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600 font-semibold flex items-center gap-2">
              <WarningCircle weight="bold" className="h-4 w-4 shrink-0" />
              <span>{modalError}</span>
            </div>
          )}

          {/* Title & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Section Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Same Day Best Sellers"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="e.g. London Studio Quality Guaranteed"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>
          </div>

          {/* Layout Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Section Layout Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formType === 'horizontal_scroll'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="sectionType"
                  value="horizontal_scroll"
                  checked={formType === 'horizontal_scroll'}
                  onChange={() => setFormType('horizontal_scroll')}
                  className="mt-1 text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ArrowsHorizontal className="h-4 w-4 text-blue-600" />
                    <span>Horizontal Auto-Scroll Row</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Single row of multiple product cards with smooth horizontal auto-scroll and pause-on-hover.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formType === 'grid_8_tiles'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="sectionType"
                  value="grid_8_tiles"
                  checked={formType === 'grid_8_tiles'}
                  onChange={() => setFormType('grid_8_tiles')}
                  className="mt-1 text-blue-600"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <SquaresFour className="h-4 w-4 text-purple-600" />
                    <span>Fixed 8-Tile Grid (2 Rows x 4)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    A clean 2-row grid with 4 items per row, ideal for curated highlights.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Source Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              Products Source <span className="text-rose-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="sourceType"
                  value="category"
                  checked={formSourceType === 'category'}
                  onChange={() => setFormSourceType('category')}
                  className="text-blue-600"
                />
                <span>By Category</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="sourceType"
                  value="products"
                  checked={formSourceType === 'products'}
                  onChange={() => setFormSourceType('products')}
                  className="text-blue-600"
                />
                <span>Pick Specific Products</span>
              </label>
            </div>

            {formSourceType === 'category' ? (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Select Category
                </label>
                <select
                  value={formCategoryName}
                  onChange={(e) => setFormCategoryName(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Select Products ({formProductIds.length} selected{formType === 'grid_8_tiles' ? ' — recommended 8 for 2x4' : ''})
                </label>
                <div className="max-h-48 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  {products.map((p) => {
                    const isChecked = formProductIds.includes(p.id || p.slug);
                    const prodKey = p.id || p.slug;

                    return (
                      <label
                        key={prodKey}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' : 'bg-white hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleProduct(prodKey)}
                            className="rounded border-slate-300 text-blue-600"
                          />
                          <span className="truncate">{p.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-mono">
                          £{p.price} • {p.category}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Position Order & Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Display Order Position
              </label>
              <input
                type="number"
                min={1}
                value={formOrder}
                onChange={(e) => setFormOrder(parseInt(e.target.value, 10) || 1)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Lower numbers appear higher on the homepage.
              </span>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-blue-600"
                />
                <span>Active (Display on Homepage)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" variant="uk-blue" size="sm" isLoading={isSubmitting}>
              {isEditModalOpen ? 'Save Changes' : 'Create Section'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
