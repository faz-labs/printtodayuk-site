'use client';

import React, { useState, useRef } from 'react';
import { DynamicSection, DynamicSectionInput, CategoryConfig, Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { convertAndOptimizeImage } from '@/lib/image-optimizer';
import {
  Layout,
  Plus,
  PencilSimple,
  Trash,
  CheckCircle,
  WarningCircle,
  SquaresFour,
  ArrowsHorizontal,
  Package,
  Stack,
  Eye,
  EyeSlash,
  UploadSimple,
  Images,
  ArrowRight,
  Tag,
  Palette,
} from '@phosphor-icons/react';

interface SectionManagerProps {
  sections: DynamicSection[];
  categories: CategoryConfig[];
  products: Product[];
  onCreateSection: (input: DynamicSectionInput) => Promise<void>;
  onUpdateSection: (id: string, updates: Partial<DynamicSection>) => Promise<void>;
  onDeleteSection: (id: string) => Promise<void>;
}

const PRESET_BG_COLORS = [
  { name: 'Deep UK Blue', hex: '#012169' },
  { name: 'Midnight Navy', hex: '#00143d' },
  { name: 'Vibrant Crimson', hex: '#C8102E' },
  { name: 'Dark Slate', hex: '#0F172A' },
  { name: 'Pure Charcoal', hex: '#1E293B' },
  { name: 'Clean Light Slate', hex: '#F8FAFC' },
  { name: 'Soft Pearl Grey', hex: '#F1F5F9' },
  { name: 'Forest Emerald', hex: '#064E3B' },
  { name: 'Royal Blue', hex: '#1E3A8A' },
  { name: 'Warm Amber', hex: '#78350F' },
];

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

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formType, setFormType] = useState<'horizontal_scroll' | 'grid_8_tiles' | 'split_banner'>('horizontal_scroll');
  const [formSourceType, setFormSourceType] = useState<'category' | 'products'>('category');
  const [formCategoryName, setFormCategoryName] = useState(categories[0]?.name || '');
  const [formProductIds, setFormProductIds] = useState<string[]>([]);
  const [formOrder, setFormOrder] = useState<number>(sections.length + 1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Split banner form states
  const [formBackgroundColor, setFormBackgroundColor] = useState('#012169');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formLayoutDirection, setFormLayoutDirection] = useState<'image_left' | 'image_right'>('image_left');
  const [formButtonText, setFormButtonText] = useState('Explore Range');
  const [formButtonUrl, setFormButtonUrl] = useState('/category/Printing');
  const [formBadgeText, setFormBadgeText] = useState('London In-House Production');

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessNotice(msg);
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormSubtitle('');
    setFormType('horizontal_scroll');
    setFormSourceType('category');
    setFormCategoryName(categories[0]?.name || '');
    setFormProductIds([]);
    setFormOrder(sections.length + 1);
    setFormIsActive(true);
    setFormBackgroundColor('#012169');
    setFormImageUrl('');
    setFormLayoutDirection('image_left');
    setFormButtonText('Explore Range');
    setFormButtonUrl('/category/Printing');
    setFormBadgeText('London In-House Production');
    setModalError('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (sec: DynamicSection) => {
    setEditingSection(sec);
    setFormTitle(sec.title);
    setFormSubtitle(sec.subtitle || '');
    setFormType(sec.type);
    setFormSourceType(sec.sourceType || 'category');
    setFormCategoryName(sec.categoryName || categories[0]?.name || '');
    setFormProductIds(sec.productIds || []);
    setFormOrder(sec.order || 1);
    setFormIsActive(sec.isActive);
    setFormBackgroundColor(sec.backgroundColor || '#012169');
    setFormImageUrl(sec.imageUrl || '');
    setFormLayoutDirection(sec.layoutDirection || 'image_left');
    setFormButtonText(sec.buttonText || 'Explore Range');
    setFormButtonUrl(sec.buttonUrl || '/category/Printing');
    setFormBadgeText(sec.badgeText || '');
    setModalError('');
    setIsEditModalOpen(true);
  };

  const handleToggleProduct = (prodId: string) => {
    setFormProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  // Upload S3 helper with automatic WebP conversion
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setModalError('');

    try {
      // Automatically optimize to .webp with preserved transparency
      const optimizedFile = await convertAndOptimizeImage(file);
      const formData = new FormData();
      formData.append('files', optimizedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image to S3.');
      }

      if (data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
        setFormImageUrl(data.urls[0]);
      }
    } catch (err: any) {
      setModalError(err.message || 'Image upload failed.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError('Section title is required.');
      return;
    }

    if (formType !== 'split_banner' && formSourceType === 'products' && formProductIds.length === 0) {
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
        sourceType: formType !== 'split_banner' ? formSourceType : undefined,
        categoryName: formType !== 'split_banner' && formSourceType === 'category' ? formCategoryName : undefined,
        productIds: formType !== 'split_banner' && formSourceType === 'products' ? formProductIds : undefined,
        backgroundColor: formType === 'split_banner' ? formBackgroundColor : undefined,
        imageUrl: formType === 'split_banner' ? formImageUrl.trim() : undefined,
        layoutDirection: formType === 'split_banner' ? formLayoutDirection : undefined,
        buttonText: formType === 'split_banner' ? formButtonText.trim() : undefined,
        buttonUrl: formType === 'split_banner' ? formButtonUrl.trim() : undefined,
        badgeText: formType === 'split_banner' ? formBadgeText.trim() : undefined,
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
        sourceType: formType !== 'split_banner' ? formSourceType : undefined,
        categoryName: formType !== 'split_banner' && formSourceType === 'category' ? formCategoryName : undefined,
        productIds: formType !== 'split_banner' && formSourceType === 'products' ? formProductIds : undefined,
        backgroundColor: formType === 'split_banner' ? formBackgroundColor : undefined,
        imageUrl: formType === 'split_banner' ? formImageUrl.trim() : undefined,
        layoutDirection: formType === 'split_banner' ? formLayoutDirection : undefined,
        buttonText: formType === 'split_banner' ? formButtonText.trim() : undefined,
        buttonUrl: formType === 'split_banner' ? formButtonUrl.trim() : undefined,
        badgeText: formType === 'split_banner' ? formBadgeText.trim() : undefined,
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
    <div className="space-y-6 font-sans">
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
            Create custom showcase rows on your landing page: auto-scrolling carousels, 8-tile grids, or split feature banners with transparent images.
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
              Add your first dynamic section above. You can showcase a category with auto-scroll, an 8-tile product grid, or a split feature banner.
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
                  <th className="py-3.5 px-4">Details / Content</th>
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
                        {sec.type === 'horizontal_scroll' && (
                          <Badge variant="uk-blue" className="inline-flex items-center gap-1 text-[11px]">
                            <ArrowsHorizontal weight="bold" className="h-3 w-3" />
                            <span>Auto-Scroll Row</span>
                          </Badge>
                        )}
                        {sec.type === 'grid_8_tiles' && (
                          <Badge variant="default" className="inline-flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 border-purple-200">
                            <SquaresFour weight="bold" className="h-3 w-3" />
                            <span>8-Tile Grid (2x4)</span>
                          </Badge>
                        )}
                        {sec.type === 'split_banner' && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-800">
                            <span
                              className="h-2.5 w-2.5 rounded-full border border-black/20 shrink-0"
                              style={{ backgroundColor: sec.backgroundColor || '#012169' }}
                            />
                            <span>Split Banner ({sec.layoutDirection === 'image_right' ? 'Right' : 'Left'})</span>
                          </div>
                        )}
                      </td>

                      {/* Source Content / Details */}
                      <td className="py-3.5 px-4">
                        {sec.type === 'split_banner' ? (
                          <div className="flex items-center gap-2">
                            {sec.imageUrl && (
                              <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                                <img
                                  src={sec.imageUrl}
                                  alt={sec.title}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                            )}
                            <span className="text-slate-600 font-medium truncate max-w-[200px]">
                              {sec.buttonText ? `CTA: "${sec.buttonText}"` : 'Feature Banner'}
                            </span>
                          </div>
                        ) : sec.sourceType === 'category' ? (
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

      {/* Hidden File Input for Image Upload with WebP conversion */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ADD / EDIT SECTION MODAL */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setEditingSection(null);
        }}
        title={isEditModalOpen ? 'Edit Landing Section' : 'Add New Landing Section'}
        description="Configure layout type, colors, transparent artwork, and positioning on the landing page."
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

          {/* Section Title & Subtitle */}
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
                placeholder="e.g. Same Day Best Sellers or London Studio Printing"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Subtitle / Description (Optional)
              </label>
              <input
                type="text"
                value={formSubtitle}
                onChange={(e) => setFormSubtitle(e.target.value)}
                placeholder="e.g. Fast 2-4h studio collection or courier dispatch"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>
          </div>

          {/* 3 Layout Type Options */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Section Layout Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Auto Scroll Row */}
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  formType === 'horizontal_scroll'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="sectionType"
                    value="horizontal_scroll"
                    checked={formType === 'horizontal_scroll'}
                    onChange={() => setFormType('horizontal_scroll')}
                    className="text-blue-600"
                  />
                  <ArrowsHorizontal className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">Auto-Scroll Row</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Single row with smooth auto-scroll & pause-on-hover.
                </p>
              </label>

              {/* Option 2: 8 Tiles Grid */}
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  formType === 'grid_8_tiles'
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="sectionType"
                    value="grid_8_tiles"
                    checked={formType === 'grid_8_tiles'}
                    onChange={() => setFormType('grid_8_tiles')}
                    className="text-blue-600"
                  />
                  <SquaresFour className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-900">8-Tile Grid</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Fixed 2 rows × 4 items per row.
                </p>
              </label>

              {/* Option 3: Split Feature Banner */}
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  formType === 'split_banner'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="sectionType"
                    value="split_banner"
                    checked={formType === 'split_banner'}
                    onChange={() => setFormType('split_banner')}
                    className="text-emerald-600"
                  />
                  <Palette className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">Split Banner</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Custom background color + transparent picture on left/right + text.
                </p>
              </label>
            </div>
          </div>

          {/* ======================================================== */}
          {/* CONDITIONAL: SPLIT BANNER CONFIGURATION                  */}
          {/* ======================================================== */}
          {formType === 'split_banner' && (
            <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Palette weight="bold" className="h-4 w-4 text-[#012169]" />
                <span>Split Banner Appearance & Styling</span>
              </h4>

              {/* Background Color Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Background Color
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {PRESET_BG_COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setFormBackgroundColor(color.hex)}
                      className={`h-7 px-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        formBackgroundColor.toLowerCase() === color.hex.toLowerCase()
                          ? 'border-black ring-2 ring-[#012169]'
                          : 'border-slate-200 hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: color.hex,
                        color: ['#f8fafc', '#f1f5f9'].includes(color.hex.toLowerCase()) ? '#000' : '#fff',
                      }}
                    >
                      <span>{color.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formBackgroundColor}
                    onChange={(e) => setFormBackgroundColor(e.target.value)}
                    className="h-10 w-12 rounded-xl border border-slate-200 cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={formBackgroundColor}
                    onChange={(e) => setFormBackgroundColor(e.target.value)}
                    placeholder="#012169"
                    className="h-10 px-3 w-36 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 uppercase"
                  />
                  <span className="text-[11px] text-slate-500">Pick any custom HEX color code</span>
                </div>
              </div>

              {/* Layout Direction (Left vs Right) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Layout Direction
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormLayoutDirection('image_left')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formLayoutDirection === 'image_left'
                        ? 'border-[#012169] bg-white ring-2 ring-[#012169]/10 text-[#012169]'
                        : 'border-slate-200 bg-white/50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>🖼️ Picture on Left • Text on Right</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormLayoutDirection('image_right')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      formLayoutDirection === 'image_right'
                        ? 'border-[#012169] bg-white ring-2 ring-[#012169]/10 text-[#012169]'
                        : 'border-slate-200 bg-white/50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    <span>Text on Left • 🖼️ Picture on Right</span>
                  </button>
                </div>
              </div>

              {/* Transparent Picture Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Transparent Picture (PNG or WebP)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... image URL or upload below"
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="h-10 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <UploadSimple weight="bold" className="h-4 w-4" />
                    <span>{isUploadingImage ? 'Converting to WebP...' : 'Upload Picture'}</span>
                  </button>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Transparent PNG or WebP recommended. Uploaded files are automatically optimized and converted to .webp before upload.
                </span>

                {formImageUrl && (
                  <div className="mt-2.5 p-3 rounded-xl bg-slate-200/50 border border-slate-300 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-lg bg-white/80 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 block truncate">Image loaded successfully</span>
                      <span className="text-[10px] text-slate-500 block truncate">{formImageUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Badge Tag */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Highlight Badge Tag (Optional)
                </label>
                <input
                  type="text"
                  value={formBadgeText}
                  onChange={(e) => setFormBadgeText(e.target.value)}
                  placeholder="e.g. Same-Day Dispatch Available"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                />
              </div>

              {/* CTA Button Text & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Button Label
                  </label>
                  <input
                    type="text"
                    value={formButtonText}
                    onChange={(e) => setFormButtonText(e.target.value)}
                    placeholder="e.g. Shop Collection"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Button Target Link
                  </label>
                  <input
                    type="text"
                    value={formButtonUrl}
                    onChange={(e) => setFormButtonUrl(e.target.value)}
                    placeholder="e.g. /category/Printing or /product/slug"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CONDITIONAL: PRODUCTS SOURCE (FOR AUTO-SCROLL & 8-TILES) */}
          {/* ======================================================== */}
          {formType !== 'split_banner' && (
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
          )}

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
