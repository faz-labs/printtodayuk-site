'use client';

import React, { useState, useRef, useMemo } from 'react';
import { DynamicSection, DynamicSectionInput, DynamicSectionType, CategoryConfig, Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { moveArrayItem } from '@/lib/utils';
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
  MagnifyingGlass,
  X,
  Check,
  DotsSixVertical,
  CaretUp,
  CaretDown,
  CaretDoubleUp,
  CaretDoubleDown,
  ImageSquare,
  DeviceMobile,
  Monitor,
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
  const [formType, setFormType] = useState<DynamicSectionType>('horizontal_scroll');
  const [formSourceType, setFormSourceType] = useState<'category' | 'products'>('category');
  const [formCategoryName, setFormCategoryName] = useState(categories[0]?.name || '');
  const [formCategoryNames, setFormCategoryNames] = useState<string[]>([]);
  const [formProductIds, setFormProductIds] = useState<string[]>([]);
  const [formOrder, setFormOrder] = useState<number>(sections.length + 1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Search & filter states within modal
  const [categorySearch, setCategorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Split banner & single image form states
  const [formBackgroundColor, setFormBackgroundColor] = useState('#012169');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formMobileImageUrl, setFormMobileImageUrl] = useState('');
  const [formImageWidth, setFormImageWidth] = useState<'contained' | 'full_width'>('contained');
  const [formShowSectionHeader, setFormShowSectionHeader] = useState(false);
  const [formLayoutDirection, setFormLayoutDirection] = useState<'image_left' | 'image_right'>('image_left');
  const [formButtonText, setFormButtonText] = useState('Explore Range');
  const [formButtonUrl, setFormButtonUrl] = useState('/category/Printing');
  const [formBadgeText, setFormBadgeText] = useState('London In-House Production');

  // Reordering states
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [optimisticOrderIds, setOptimisticOrderIds] = useState<string[] | null>(null);

  const [uploadingTarget, setUploadingTarget] = useState<'desktop' | 'mobile' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileFileInputRef = useRef<HTMLInputElement | null>(null);

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
    setFormCategoryNames(categories.length > 0 ? [categories[0].name] : []);
    setFormProductIds([]);
    setFormOrder(sections.length + 1);
    setFormIsActive(true);
    setCategorySearch('');
    setProductSearch('');
    setProductCategoryFilter('All');
    setFormBackgroundColor('#012169');
    setFormImageUrl('');
    setFormMobileImageUrl('');
    setFormImageWidth('contained');
    setFormShowSectionHeader(false);
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
    const initialCats = (sec.categoryNames && sec.categoryNames.length > 0)
      ? sec.categoryNames
      : sec.categoryName
      ? [sec.categoryName]
      : categories.length > 0
      ? [categories[0].name]
      : [];
    setFormCategoryNames(initialCats);
    setFormProductIds(sec.productIds || []);
    setFormOrder(sec.order || 1);
    setFormIsActive(sec.isActive);
    setCategorySearch('');
    setProductSearch('');
    setProductCategoryFilter('All');
    setFormBackgroundColor(sec.backgroundColor || '#012169');
    setFormImageUrl(sec.imageUrl || '');
    setFormMobileImageUrl(sec.mobileImageUrl || '');
    setFormImageWidth(sec.imageWidth || 'contained');
    setFormShowSectionHeader(Boolean(sec.showSectionHeader));
    setFormLayoutDirection(sec.layoutDirection || 'image_left');
    setFormButtonText(sec.buttonText || 'Explore Range');
    setFormButtonUrl(sec.buttonUrl || '');
    setFormBadgeText(sec.badgeText || '');
    setModalError('');
    setIsEditModalOpen(true);
  };

  const handleToggleCategory = (catName: string) => {
    setFormCategoryNames((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const handleSelectAllCategories = () => {
    setFormCategoryNames(categories.map((c) => c.name));
  };

  const handleClearCategories = () => {
    setFormCategoryNames([]);
  };

  const handleToggleProduct = (prodId: string) => {
    setFormProductIds((prev) =>
      prev.includes(prodId) ? prev.filter((id) => id !== prodId) : [...prev, prodId]
    );
  };

  const handleSelectAllFilteredProducts = (filteredIds: string[]) => {
    setFormProductIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleClearProductSelection = () => {
    setFormProductIds([]);
  };

  // Shared S3 image upload helper with automatic WebP conversion
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'desktop' | 'mobile' = 'desktop'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTarget(target);
    setModalError('');

    try {
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
        if (target === 'mobile') {
          setFormMobileImageUrl(data.urls[0]);
        } else {
          setFormImageUrl(data.urls[0]);
        }
      }
    } catch (err: any) {
      setModalError(err.message || 'Image upload failed.');
    } finally {
      setUploadingTarget(null);
      if (target === 'mobile' && mobileFileInputRef.current) {
        mobileFileInputRef.current.value = '';
      } else if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const buildSectionPayload = () => {
    const isMediaBanner = formType === 'split_banner' || formType === 'single_image';
    return {
      title: formTitle.trim(),
      subtitle: formSubtitle.trim() || undefined,
      type: formType,
      sourceType: !isMediaBanner ? formSourceType : undefined,
      categoryName: !isMediaBanner && formSourceType === 'category' ? (formCategoryNames[0] || formCategoryName) : undefined,
      categoryNames: !isMediaBanner && formSourceType === 'category' ? formCategoryNames : undefined,
      productIds: !isMediaBanner && formSourceType === 'products' ? formProductIds : undefined,
      backgroundColor: formType === 'split_banner' ? formBackgroundColor : undefined,
      imageUrl: isMediaBanner ? (formImageUrl.trim() || undefined) : undefined,
      mobileImageUrl: formType === 'single_image' ? (formMobileImageUrl.trim() || undefined) : undefined,
      imageWidth: formType === 'single_image' ? formImageWidth : undefined,
      showSectionHeader: formType === 'single_image' ? formShowSectionHeader : undefined,
      layoutDirection: formType === 'split_banner' ? formLayoutDirection : undefined,
      buttonText: formType === 'split_banner' ? (formButtonText.trim() || undefined) : undefined,
      buttonUrl: isMediaBanner ? (formButtonUrl.trim() || undefined) : undefined,
      badgeText: formType === 'split_banner' ? (formBadgeText.trim() || undefined) : undefined,
      order: Number(formOrder) || 1,
      isActive: formIsActive,
    };
  };

  const validateSectionForm = (): string | null => {
    if (!formTitle.trim()) return 'Section title is required.';
    if (formType === 'single_image' && !formImageUrl.trim()) {
      return 'Please upload or provide an image URL for the Single Image section.';
    }
    if (formType !== 'split_banner' && formType !== 'single_image') {
      if (formSourceType === 'category' && formCategoryNames.length === 0) {
        return 'Please select at least one category for this section.';
      }
      if (formSourceType === 'products' && formProductIds.length === 0) {
        return 'Please select at least one product for this section.';
      }
    }
    return null;
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validateSectionForm();
    if (validationErr) {
      setModalError(validationErr);
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      await onCreateSection(buildSectionPayload());
      fetch('/api/landing-data', { method: 'POST' }).catch(() => {});
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
    const validationErr = validateSectionForm();
    if (validationErr) {
      setModalError(validationErr);
      return;
    }

    setIsSubmitting(true);
    setModalError('');
    try {
      await onUpdateSection(editingSection.id, buildSectionPayload());
      fetch('/api/landing-data', { method: 'POST' }).catch(() => {});
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
      fetch('/api/landing-data', { method: 'POST' }).catch(() => {});
      showSuccess(`Deleted section "${sec.title}".`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete section.');
    }
  };

  const handleToggleActive = async (sec: DynamicSection) => {
    if (!sec.id) return;
    try {
      await onUpdateSection(sec.id, { isActive: !sec.isActive });
      fetch('/api/landing-data', { method: 'POST' }).catch(() => {});
      showSuccess(`Section is now ${!sec.isActive ? 'Active on Storefront' : 'Hidden'}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const sortedSections = useMemo(() => {
    const base = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!optimisticOrderIds) return base;
    const orderMap = new Map(optimisticOrderIds.map((id, idx) => [id, idx]));
    return [...base].sort((a, b) => {
      const idxA = a.id && orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
      const idxB = b.id && orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
      return idxA - idxB;
    });
  }, [sections, optimisticOrderIds]);

  const handleReorderSections = async (fromIndex: number, toIndex: number) => {
    if (isReordering || fromIndex === toIndex) return;
    const reordered = moveArrayItem(sortedSections, fromIndex, toIndex);
    const ids = reordered.map((s) => s.id || '').filter(Boolean);
    setOptimisticOrderIds(ids);
    setIsReordering(true);

    try {
      for (let idx = 0; idx < reordered.length; idx++) {
        const sec = reordered[idx];
        const nextOrder = idx + 1;
        if (sec.id && sec.order !== nextOrder) {
          await onUpdateSection(sec.id, { order: nextOrder });
        }
      }
      fetch('/api/landing-data', { method: 'POST' }).catch(() => {});
      showSuccess(`Moved "${reordered[toIndex]?.title}" to position #${toIndex + 1}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to save section order.');
    } finally {
      setOptimisticOrderIds(null);
      setIsReordering(false);
    }
  };

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
            Drag rows (or click Top/Up/Down/Bottom arrows) to reorder homepage sections. Supports auto-scrolling rows, 8-tile grids, split banners, or single images.
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
              Add your first dynamic section above. You can showcase a category with auto-scroll, an 8-tile product grid, a split feature banner, or a single promotional image.
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
                  <th className="py-3.5 px-4 text-left w-44">Order / Drag</th>
                  <th className="py-3.5 px-4">Section Title</th>
                  <th className="py-3.5 px-4">Layout Type</th>
                  <th className="py-3.5 px-4">Details / Content</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedSections.map((sec, index) => {
                  const isDraggingThis = draggedIdx === index;
                  const isDragTarget = dragOverIdx === index && draggedIdx !== null && draggedIdx !== index;

                  return (
                    <tr
                      key={sec.id || sec.title}
                      draggable={!isReordering}
                      onDragStart={(e) => {
                        const target = e.target as HTMLElement;
                        if (['INPUT', 'BUTTON', 'A', 'SELECT'].includes(target.tagName)) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedIdx(index);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedIdx !== null && draggedIdx !== index && dragOverIdx !== index) {
                          setDragOverIdx(index);
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIdx === index) setDragOverIdx(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedIdx !== null && draggedIdx !== index) {
                          handleReorderSections(draggedIdx, index);
                        }
                        setDraggedIdx(null);
                        setDragOverIdx(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIdx(null);
                        setDragOverIdx(null);
                      }}
                      className={`transition-colors ${
                        isDraggingThis
                          ? 'opacity-45 bg-blue-50/60'
                          : isDragTarget
                          ? 'bg-blue-50/70 ring-2 ring-inset ring-[#012169]'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Drag Handle, Order Position & Top/Up/Down/Bottom Quick Controls */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="p-1 rounded-md text-slate-400 hover:text-[#012169] hover:bg-slate-100 cursor-grab active:cursor-grabbing shrink-0"
                            title="Drag row to reorder"
                          >
                            <DotsSixVertical weight="bold" className="h-4 w-4" />
                          </div>
                          <span className="h-7 min-w-[28px] px-1.5 rounded-lg bg-slate-100 text-slate-800 font-black text-xs inline-flex items-center justify-center shrink-0">
                            #{index + 1}
                          </span>
                          {sortedSections.length > 1 && (
                            <div className="flex items-center gap-0.5 ml-1">
                              <button
                                type="button"
                                onClick={() => handleReorderSections(index, 0)}
                                disabled={index === 0 || isReordering}
                                title="Move to Top"
                                className="p-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#012169] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <CaretDoubleUp weight="bold" className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReorderSections(index, index - 1)}
                                disabled={index === 0 || isReordering}
                                title="Move Up"
                                className="p-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#012169] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <CaretUp weight="bold" className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReorderSections(index, index + 1)}
                                disabled={index === sortedSections.length - 1 || isReordering}
                                title="Move Down"
                                className="p-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#012169] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <CaretDown weight="bold" className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReorderSections(index, sortedSections.length - 1)}
                                disabled={index === sortedSections.length - 1 || isReordering}
                                title="Move to Bottom"
                                className="p-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#012169] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <CaretDoubleDown weight="bold" className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
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
                        {sec.type === 'single_image' && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200 bg-amber-50 text-amber-800">
                            <ImageSquare weight="bold" className="h-3.5 w-3.5 text-amber-700" />
                            <span>Single Image ({sec.imageWidth === 'full_width' ? 'Full' : 'Framed'})</span>
                          </div>
                        )}
                      </td>

                      {/* Source Content / Details */}
                      <td className="py-3.5 px-4">
                        {sec.type === 'split_banner' || sec.type === 'single_image' ? (
                          <div className="flex items-center gap-2">
                            {sec.imageUrl && (
                              <div className="h-8 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                                <img
                                  src={sec.imageUrl}
                                  alt={sec.title}
                                  className="h-full w-full object-cover rounded-sm"
                                />
                              </div>
                            )}
                            <span className="text-slate-600 font-medium truncate max-w-[200px]">
                              {sec.type === 'single_image'
                                ? sec.buttonUrl
                                  ? `Link: ${sec.buttonUrl}`
                                  : 'Standalone Image'
                                : sec.buttonText
                                ? `CTA: "${sec.buttonText}"`
                                : 'Feature Banner'}
                            </span>
                          </div>
                        ) : sec.sourceType === 'category' ? (
                          <div className="flex flex-col gap-0.5 text-slate-700">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Stack weight="bold" className="h-3.5 w-3.5 text-blue-600" />
                              <span>
                                {sec.categoryNames && sec.categoryNames.length > 1
                                  ? `${sec.categoryNames.length} Categories Selected`
                                  : `Category: ${sec.categoryName || sec.categoryNames?.[0] || 'All'}`}
                              </span>
                            </div>
                            {sec.categoryNames && sec.categoryNames.length > 1 && (
                              <span className="text-[10px] text-slate-400 truncate max-w-[220px]">
                                {sec.categoryNames.join(', ')}
                              </span>
                            )}
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

      {/* Hidden File Inputs for Desktop & Mobile Image Uploads with WebP conversion */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleImageUpload(e, 'desktop')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={mobileFileInputRef}
        onChange={(e) => handleImageUpload(e, 'mobile')}
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

          {/* 4 Layout Type Options */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Section Layout Type <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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
                  <ArrowsHorizontal className="h-4 w-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Auto-Scroll Row</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Single row with smooth auto-scroll &amp; pause-on-hover.
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
                  <SquaresFour className="h-4 w-4 text-purple-600 shrink-0" />
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
                  <Palette className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Split Banner</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Colored banner + cutout image on left/right + CTA.
                </p>
              </label>

              {/* Option 4: Single Image Banner */}
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                  formType === 'single_image'
                    ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/10'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="sectionType"
                    value="single_image"
                    checked={formType === 'single_image'}
                    onChange={() => setFormType('single_image')}
                    className="text-amber-600"
                  />
                  <ImageSquare className="h-4 w-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900">Single Image</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Standalone clickable promo or feature image.
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
                    disabled={uploadingTarget === 'desktop'}
                    className="h-10 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <UploadSimple weight="bold" className="h-4 w-4" />
                    <span>{uploadingTarget === 'desktop' ? 'Converting to WebP...' : 'Upload Picture'}</span>
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
          {/* CONDITIONAL: SINGLE IMAGE CONFIGURATION                  */}
          {/* ======================================================== */}
          {formType === 'single_image' && (
            <div className="space-y-4 p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ImageSquare weight="bold" className="h-4 w-4 text-amber-700" />
                <span>Single Image Settings</span>
              </h4>

              {/* Desktop / Primary Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Monitor weight="bold" className="h-3.5 w-3.5 text-[#012169]" />
                  <span>Primary / Desktop Image <span className="text-rose-500">*</span></span>
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
                    disabled={uploadingTarget === 'desktop'}
                    className="h-10 px-3.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <UploadSimple weight="bold" className="h-4 w-4" />
                    <span>{uploadingTarget === 'desktop' ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                </div>
                {formImageUrl && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-3">
                    <div className="h-14 w-24 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={formImageUrl}
                        alt="Single image preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 block">Primary image ready</span>
                      <span className="text-[10px] text-slate-500 block truncate">{formImageUrl}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Mobile Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DeviceMobile weight="bold" className="h-3.5 w-3.5 text-purple-600" />
                  <span>Mobile Image (Optional — falls back to desktop image)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formMobileImageUrl}
                    onChange={(e) => setFormMobileImageUrl(e.target.value)}
                    placeholder="Optional mobile version URL"
                    className="flex-1 h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                  <button
                    type="button"
                    onClick={() => mobileFileInputRef.current?.click()}
                    disabled={uploadingTarget === 'mobile'}
                    className="h-10 px-3.5 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    <UploadSimple weight="bold" className="h-4 w-4" />
                    <span>{uploadingTarget === 'mobile' ? 'Uploading...' : 'Upload Mobile'}</span>
                  </button>
                  {formMobileImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormMobileImageUrl('')}
                      className="h-10 px-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 text-xs font-bold cursor-pointer"
                      title="Clear mobile image"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Display Width & Click Target Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Width Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormImageWidth('contained')}
                      className={`h-10 px-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formImageWidth === 'contained'
                          ? 'border-[#012169] bg-white text-[#012169] ring-2 ring-[#012169]/10'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      Framed (Rounded)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormImageWidth('full_width')}
                      className={`h-10 px-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        formImageWidth === 'full_width'
                          ? 'border-[#012169] bg-white text-[#012169] ring-2 ring-[#012169]/10'
                          : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      Full Width
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Click Link URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formButtonUrl}
                    onChange={(e) => setFormButtonUrl(e.target.value)}
                    placeholder="e.g. /category/Flyers or https://..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                </div>
              </div>

              {/* Optional Header Toggle */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formShowSectionHeader}
                  onChange={(e) => setFormShowSectionHeader(e.target.checked)}
                  className="h-4 w-4 rounded-md border-slate-300 text-[#012169]"
                />
                <span>Display Section Title &amp; Subtitle Header above image</span>
              </label>
            </div>
          )}

          {/* ======================================================== */}
          {/* CONDITIONAL: PRODUCTS SOURCE (FOR AUTO-SCROLL & 8-TILES) */}
          {/* ======================================================== */}
          {formType !== 'split_banner' && formType !== 'single_image' && (
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
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Select Categories ({formCategoryNames.length} selected)
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllCategories}
                        className="text-[11px] font-bold text-[#012169] hover:underline cursor-pointer"
                      >
                        Select All ({categories.length})
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleClearCategories}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Selected Categories Badge Chips */}
                  {formCategoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-100/70 rounded-xl border border-slate-200">
                      {formCategoryNames.map((catName) => (
                        <span
                          key={catName}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
                        >
                          <span>{catName}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleCategory(catName)}
                            className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X weight="bold" className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Category Search Filter */}
                  {categories.length > 5 && (
                    <div className="relative">
                      <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#012169]"
                      />
                    </div>
                  )}

                  {/* Category Selection Checklist - Existing Categories Only */}
                  <div className="max-h-56 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
                    {categories
                      .filter((c) => c && c.name && (!categorySearch.trim() || c.name.toLowerCase().includes(categorySearch.toLowerCase().trim())))
                      .map((c) => {
                        const isChecked = formCategoryNames.includes(c.name);
                        const prodCount = products.filter(
                          (p) => p.category && p.category.toLowerCase().trim() === c.name.toLowerCase().trim()
                        ).length;

                        return (
                          <label
                            key={c.name}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCategory(c.name)}
                                className="rounded border-slate-300 text-blue-600 h-4 w-4 shrink-0"
                              />
                              {/* Category Cover Image Preview */}
                              <div className="h-8 w-8 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                                {c.imageUrl ? (
                                  <img
                                    src={c.imageUrl}
                                    alt={c.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <SquaresFour weight="bold" className="h-4 w-4 text-slate-400" />
                                )}
                              </div>
                              <span className="truncate">{c.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-medium">
                              {prodCount} products
                            </span>
                          </label>
                        );
                      })}
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Selected categories with their cover images will be showcased in this section on the landing page.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Select Products ({formProductIds.length} selected{formType === 'grid_8_tiles' ? ' — recommended 8 for 2x4' : ''})
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = products
                            .filter((p) => {
                              const matchesSearch = !productSearch.trim() ||
                                p.title.toLowerCase().includes(productSearch.toLowerCase().trim()) ||
                                (p.slug && p.slug.toLowerCase().includes(productSearch.toLowerCase().trim()));
                              const matchesCat = productCategoryFilter === 'All' ||
                                (p.category && p.category.toLowerCase().trim() === productCategoryFilter.toLowerCase().trim());
                              return matchesSearch && matchesCat;
                            })
                            .map((p) => p.id || p.slug);
                          handleSelectAllFilteredProducts(filtered);
                        }}
                        className="text-[11px] font-bold text-[#012169] hover:underline cursor-pointer"
                      >
                        Select All Filtered
                      </button>
                      <span className="text-slate-300">•</span>
                      <button
                        type="button"
                        onClick={handleClearProductSelection}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Search and Category Filter Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="relative">
                      <MagnifyingGlass weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search products by title..."
                        className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#012169]"
                      />
                    </div>

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="w-full h-8 px-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#012169]"
                    >
                      <option value="All">All Categories ({products.length} products)</option>
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Product Checklist */}
                  <div className="max-h-56 overflow-y-auto p-2 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                    {products
                      .filter((p) => {
                        const matchesSearch = !productSearch.trim() ||
                          p.title.toLowerCase().includes(productSearch.toLowerCase().trim()) ||
                          (p.slug && p.slug.toLowerCase().includes(productSearch.toLowerCase().trim()));
                        const matchesCat = productCategoryFilter === 'All' ||
                          (p.category && p.category.toLowerCase().trim() === productCategoryFilter.toLowerCase().trim());
                        return matchesSearch && matchesCat;
                      })
                      .map((p) => {
                        const prodKey = p.id || p.slug;
                        const isChecked = formProductIds.includes(prodKey);

                        return (
                          <label
                            key={prodKey}
                            className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                              isChecked
                                ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                                : 'bg-white hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleProduct(prodKey)}
                                className="rounded border-slate-300 text-blue-600 h-4 w-4"
                              />
                              {p.images && p.images[0] && (
                                <img
                                  src={p.images[0]}
                                  alt=""
                                  className="h-6 w-6 rounded object-cover border border-slate-200 shrink-0"
                                />
                              )}
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
