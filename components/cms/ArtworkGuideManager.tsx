'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Trash,
  PencilSimple,
  MagnifyingGlass,
  CheckCircle,
  Eye,
  EyeSlash,
  X,
  Sparkle,
  Image as ImageIcon,
  TextB,
  TextItalic,
  TextHTwo,
  TextHThree,
  ListBullets,
  ListNumbers,
  Quotes,
  LinkSimple,
  Code,
  ArrowSquareOut,
  Clock,
  Tag,
  Check,
} from '@phosphor-icons/react';
import { ArtworkGuide, ArtworkGuideInput } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  getArtworkGuides,
  createArtworkGuide,
  updateArtworkGuide,
  deleteArtworkGuide,
} from '@/lib/db';

const CATEGORY_OPTIONS = [
  'Artwork Setup',
  'Image Quality',
  'Color & Inks',
  'File Preparation',
  'Large Format',
  'Finishing & Binding',
  'General Guides',
];

interface ArtworkGuideManagerProps {
  initialGuides?: ArtworkGuide[];
  onRefreshData?: () => Promise<void>;
}

export function ArtworkGuideManager({ initialGuides = [], onRefreshData }: ArtworkGuideManagerProps) {
  const [guides, setGuides] = useState<ArtworkGuide[]>(initialGuides);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<ArtworkGuide | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [readingTime, setReadingTime] = useState('3 min read');
  const [order, setOrder] = useState<number>(1);
  const [isPublished, setIsPublished] = useState(true);
  const [contentHtml, setContentHtml] = useState('');

  // Rich Text Editor Mode: 'visual' | 'code' | 'preview'
  const [editorMode, setEditorMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const visualEditorRef = useRef<HTMLDivElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Load initial guides
  useEffect(() => {
    if (initialGuides && initialGuides.length > 0) {
      setGuides(initialGuides);
    } else {
      loadGuides();
    }
  }, [initialGuides]);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const data = await getArtworkGuides(true);
      setGuides(data || []);
    } catch (err) {
      console.error('Failed to load artwork guides:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Open Modal for Create or Edit
  const handleOpenCreateModal = () => {
    setEditingGuide(null);
    setTitle('');
    setSlug('');
    setCategory(CATEGORY_OPTIONS[0]);
    setShortDescription('');
    setImageUrl('https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=80');
    setReadingTime('3 min read');
    setOrder(guides.length + 1);
    setIsPublished(true);
    setContentHtml('<h2>Introduction</h2><p>Provide detailed artwork guidelines, specifications, and prepress instructions here...</p>');
    setEditorMode('visual');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (guide: ArtworkGuide) => {
    setEditingGuide(guide);
    setTitle(guide.title);
    setSlug(guide.slug);
    setCategory(guide.category || CATEGORY_OPTIONS[0]);
    setShortDescription(guide.shortDescription);
    setImageUrl(guide.imageUrl);
    setReadingTime(guide.readingTime || '3 min read');
    setOrder(guide.order || 1);
    setIsPublished(guide.isPublished !== false);
    setContentHtml(guide.content || '');
    setEditorMode('visual');
    setFormError('');
    setIsModalOpen(true);
  };

  // Sync contentHtml with contentEditable when opening or toggling modes
  useEffect(() => {
    if (editorMode === 'visual' && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== contentHtml) {
        visualEditorRef.current.innerHTML = contentHtml;
      }
    }
  }, [editorMode, isModalOpen]);

  // Formatting commands for Visual Editor
  const executeCommand = (command: string, value: string | undefined = undefined) => {
    if (editorMode !== 'visual') return;
    document.execCommand(command, false, value);
    if (visualEditorRef.current) {
      setContentHtml(visualEditorRef.current.innerHTML);
    }
  };

  const handleInsertHeading = (tag: 'h2' | 'h3' | 'p') => {
    if (editorMode !== 'visual') return;
    document.execCommand('formatBlock', false, `<${tag}>`);
    if (visualEditorRef.current) {
      setContentHtml(visualEditorRef.current.innerHTML);
    }
  };

  const handleInsertLink = () => {
    if (editorMode !== 'visual') return;
    const url = prompt('Enter web address or email link (e.g. https://... or mailto:...):');
    if (url) {
      document.execCommand('createLink', false, url);
      if (visualEditorRef.current) {
        setContentHtml(visualEditorRef.current.innerHTML);
      }
    }
  };

  const handleVisualInput = () => {
    if (visualEditorRef.current) {
      setContentHtml(visualEditorRef.current.innerHTML);
    }
  };

  // Toggle Live/Draft
  const handleTogglePublish = async (guide: ArtworkGuide) => {
    const updatedStatus = !(guide.isPublished !== false);
    try {
      await updateArtworkGuide(guide.id, { isPublished: updatedStatus });
      setGuides((prev) =>
        prev.map((g) => (g.id === guide.id ? { ...g, isPublished: updatedStatus } : g))
      );
      showNotification(`Guide "${guide.title}" is now ${updatedStatus ? 'LIVE on Storefront' : 'Hidden as Draft'}.`);
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Delete Guide
  const handleDelete = async (id: string) => {
    try {
      await deleteArtworkGuide(id);
      setGuides((prev) => prev.filter((g) => g.id !== id));
      setDeleteConfirmId(null);
      showNotification('Artwork guide successfully removed.');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      console.error('Failed to delete guide:', err);
    }
  };

  // Save Guide (Create or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a guide title.');
      return;
    }
    if (!shortDescription.trim()) {
      setFormError('Please provide a short description for the card overview.');
      return;
    }
    if (!imageUrl.trim()) {
      setFormError('Please provide a featured image URL.');
      return;
    }

    let finalHtml = contentHtml;
    if (editorMode === 'visual' && visualEditorRef.current) {
      finalHtml = visualEditorRef.current.innerHTML;
    }

    if (!finalHtml.trim() || finalHtml === '<p><br></p>') {
      setFormError('Please write some content for the artwork guide.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload: ArtworkGuideInput = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        category: category || 'Artwork Setup',
        shortDescription: shortDescription.trim(),
        imageUrl: imageUrl.trim(),
        readingTime: readingTime.trim() || '3 min read',
        order: Number(order) || 1,
        isPublished,
        content: finalHtml,
      };

      if (editingGuide) {
        const updated = await updateArtworkGuide(editingGuide.id, payload);
        if (updated) {
          setGuides((prev) => prev.map((g) => (g.id === editingGuide.id ? updated : g)));
        }
        showNotification(`Guide "${title}" successfully updated!`);
      } else {
        const created = await createArtworkGuide(payload);
        setGuides((prev) => [created, ...prev]);
        showNotification(`New Artwork Guide "${title}" successfully published!`);
      }

      setIsModalOpen(false);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save artwork guide.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered guides list
  const filteredGuides = useMemo(() => {
    return guides.filter((g) => {
      const matchesSearch =
        !searchQuery.trim() ||
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [guides, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Artwork Guides &amp; Specs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#012169]/10 text-[#012169]">
              {guides.length} {guides.length === 1 ? 'Guide' : 'Guides'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage public artwork preparation tutorials, bleed rules, resolution guidelines, and technical print specifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/artwork-guides"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
          >
            <span>View Hub on Site</span>
            <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
          </a>
          <Button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 bg-[#012169] hover:bg-[#00174c] text-white shadow-sm"
          >
            <Plus weight="bold" className="h-4 w-4" />
            <span>Add New Guide</span>
          </Button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between shadow-xs"
        >
          <div className="flex items-center gap-2">
            <CheckCircle weight="bold" className="h-4 w-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-500 hover:text-emerald-800"
          >
            <X weight="bold" className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides by title, category, or keyword..."
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#012169]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#012169]"
          >
            <option value="All">All Categories ({guides.length})</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Guides Grid */}
      {filteredGuides.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <BookOpen weight="duotone" className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No artwork guides found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            {searchQuery
              ? `No guides match your search "${searchQuery}". Try a different keyword.`
              : 'Get started by creating your first technical artwork or print guide.'}
          </p>
          <Button onClick={handleOpenCreateModal} className="bg-[#012169] text-white">
            <Plus weight="bold" className="h-4 w-4 mr-1.5" />
            <span>Create First Guide</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Image Header */}
                <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                  <img
                    src={guide.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80'}
                    alt={guide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#012169] text-white shadow-xs">
                      {guide.category || 'Artwork Setup'}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePublish(guide)}
                      title={guide.isPublished !== false ? 'Live on storefront - Click to hide' : 'Hidden draft - Click to publish'}
                      className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 shadow-xs transition-colors ${
                        guide.isPublished !== false
                          ? 'bg-emerald-600 text-white'
                          : 'bg-amber-500 text-white'
                      }`}
                    >
                      {guide.isPublished !== false ? (
                        <>
                          <Eye weight="bold" className="h-3 w-3" />
                          <span>LIVE</span>
                        </>
                      ) : (
                        <>
                          <EyeSlash weight="bold" className="h-3 w-3" />
                          <span>DRAFT</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                    <Clock weight="bold" className="h-3.5 w-3.5 text-slate-400" />
                    <span>{guide.readingTime || '3 min read'}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">/{guide.slug}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {guide.shortDescription}
                  </p>
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`/artwork-guides/${guide.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#012169] hover:text-[#0B2559]"
                >
                  <span>Preview Page</span>
                  <ArrowSquareOut weight="bold" className="h-3 w-3" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(guide)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#012169] hover:bg-slate-200 transition-colors"
                    title="Edit Guide"
                  >
                    <PencilSimple weight="bold" className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(guide.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Guide"
                  >
                    <Trash weight="bold" className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Artwork Guide"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this artwork guide? The public page and guide card will be removed immediately.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirmId)}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Guide
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Guide Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingGuide ? `Edit Guide: ${editingGuide.title}` : 'Add New Artwork Guide'}
          maxWidth="5xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
                <X weight="bold" className="h-4 w-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Top Row: Title, Category, Reading Time, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Guide Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingGuide) {
                      setSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="e.g. Bleed, Trim & Safe Zones Explained"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reading Time
                </label>
                <input
                  type="text"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="e.g. 3 min read"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#012169]"
                />
              </div>
            </div>

            {/* URL Slug & Image URL */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs text-slate-400 font-mono">/artwork-guides/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="bleed-trim-safe-zones"
                    className="w-full h-10 pl-32 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs font-mono text-slate-800 focus:outline-hidden focus:border-[#012169]"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Featured Image URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full h-10 pl-9 pr-3.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
                  />
                </div>
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Short Description (Card Summary) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A punchy 1-2 sentence overview shown on the artwork hub card..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>

            {/* Publication & Order */}
            <div className="flex items-center gap-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-[#012169] focus:ring-[#012169] h-4 w-4"
                />
                <span>Publish to Storefront (Visible to Customers)</span>
              </label>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-bold text-slate-700">Display Order:</span>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value, 10) || 1)}
                  className="w-16 h-8 px-2 rounded-lg border border-slate-300 text-xs font-bold text-center"
                />
              </div>
            </div>

            {/* Rich Text Editor Section */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              {/* Toolbar & View Switcher */}
              <div className="bg-slate-100 p-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                {/* Formatting Tools (Only active in Visual mode) */}
                <div className="flex items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleInsertHeading('h2')}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                    title="Heading 2"
                  >
                    <TextHTwo weight="bold" className="h-4 w-4" />
                    <span>H2</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertHeading('h3')}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                    title="Heading 3"
                  >
                    <TextHThree weight="bold" className="h-4 w-4" />
                    <span>H3</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertHeading('p')}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 text-xs font-bold disabled:opacity-40"
                    title="Normal Paragraph"
                  >
                    Paragraph
                  </button>

                  <div className="h-4 w-[1px] bg-slate-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => executeCommand('bold')}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40"
                    title="Bold (Ctrl+B)"
                  >
                    <TextB weight="bold" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => executeCommand('italic')}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40"
                    title="Italic (Ctrl+I)"
                  >
                    <TextItalic weight="bold" className="h-4 w-4" />
                  </button>

                  <div className="h-4 w-[1px] bg-slate-300 mx-1" />

                  <button
                    type="button"
                    onClick={() => executeCommand('insertUnorderedList')}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40"
                    title="Bullet Points"
                  >
                    <ListBullets weight="bold" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => executeCommand('insertOrderedList')}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40"
                    title="Numbered List"
                  >
                    <ListNumbers weight="bold" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInsertHeading('p')}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40"
                    title="Quote"
                  >
                    <Quotes weight="bold" className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertLink}
                    disabled={editorMode !== 'visual'}
                    className="p-1.5 rounded-md hover:bg-slate-200 text-slate-700 font-bold disabled:opacity-40"
                    title="Insert Link"
                  >
                    <LinkSimple weight="bold" className="h-4 w-4" />
                  </button>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditorMode('visual');
                    }}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                      editorMode === 'visual'
                        ? 'bg-[#012169] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Word Editor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (visualEditorRef.current) {
                        setContentHtml(visualEditorRef.current.innerHTML);
                      }
                      setEditorMode('code');
                    }}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1 ${
                      editorMode === 'code'
                        ? 'bg-[#012169] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Code weight="bold" className="h-3 w-3" />
                    <span>HTML Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (visualEditorRef.current) {
                        setContentHtml(visualEditorRef.current.innerHTML);
                      }
                      setEditorMode('preview');
                    }}
                    className={`px-2.5 py-1 rounded-md font-bold transition-colors flex items-center gap-1 ${
                      editorMode === 'preview'
                        ? 'bg-[#012169] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Eye weight="bold" className="h-3 w-3" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>

              {/* Editor Workspace Canvas */}
              <div className="p-4 bg-white min-h-[360px] max-h-[500px] overflow-y-auto">
                {editorMode === 'visual' && (
                  <div
                    ref={visualEditorRef}
                    contentEditable
                    onInput={handleVisualInput}
                    className="prose prose-slate max-w-none focus:outline-hidden min-h-[320px] text-sm text-slate-800 leading-relaxed"
                  />
                )}

                {editorMode === 'code' && (
                  <textarea
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    rows={16}
                    className="w-full font-mono text-xs text-slate-800 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-hidden focus:bg-white focus:border-[#012169]"
                    placeholder="<h2>Write raw HTML here...</h2>"
                  />
                )}

                {editorMode === 'preview' && (
                  <div className="prose prose-slate max-w-none text-sm leading-relaxed p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#012169] hover:bg-[#00174c] text-white font-bold px-6 shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Guide...</span>
                  </>
                ) : (
                  <>
                    <Check weight="bold" className="h-4 w-4" />
                    <span>{editingGuide ? 'Save Changes' : 'Create & Publish Guide'}</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
