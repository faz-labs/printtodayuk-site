'use client';

import React, { useState, useEffect } from 'react';
import { HeroSlide } from '@/lib/types';
import { getHeroSlides, saveHeroSlides } from '@/lib/db';
import {
  Images,
  Plus,
  Trash,
  CheckCircle,
  FloppyDisk,
  Link as LinkIcon,
  UploadSimple,
  DeviceMobile,
  Monitor,
} from '@phosphor-icons/react';
import { convertAndOptimizeImage } from '@/lib/image-optimizer';

export function HeroBannerManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingTarget, setUploadingTarget] = useState<{ index: number; target: 'desktop' | 'mobile' } | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await getHeroSlides();
        setSlides(data);
      } catch (err) {
        console.error('Failed to load hero slides:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-slide-${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1800&auto=format&fit=crop',
      title: 'New Promotional Banner',
      linkUrl: '',
      order: 1,
    };
    // Add new slide to the TOP as requested
    setSlides((prev) => [newSlide, ...prev.map((s, idx) => ({ ...s, order: idx + 2 }))]);
  };

  const handleUpdateSlide = (index: number, updates: Partial<HeroSlide>) => {
    setSlides((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleDeleteSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  // Direct file upload to S3 for a slide with automatic WebP conversion
  const handleFileUpload = async (index: number, file: File, target: 'desktop' | 'mobile' = 'desktop') => {
    setUploadingTarget({ index, target });
    try {
      const optimized = await convertAndOptimizeImage(file);
      const formData = new FormData();
      formData.append('file', optimized);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      const uploadedUrl = data.urls?.[0] || data.files?.[0]?.url || data.url;
      if (!uploadedUrl) {
        throw new Error('Upload succeeded but no image URL was returned.');
      }

      if (target === 'mobile') {
        handleUpdateSlide(index, { mobileImageUrl: uploadedUrl });
      } else {
        handleUpdateSlide(index, { imageUrl: uploadedUrl });
      }
    } catch (err: any) {
      alert(`Image upload failed: ${err.message || err}`);
    } finally {
      setUploadingTarget(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const reordered = slides.map((s, idx) => ({ ...s, order: idx + 1 }));
      await saveHeroSlides(reordered);
      setSlides(reordered);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save slides:', err);
      alert('Failed to save hero banner slides. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500">
        Loading hero banner slides...
      </div>
    );
  }

  return (
    <div className="space-y-6" data-lenis-prevent>
      {/* Header & Guidelines */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
              <Images weight="bold" className="h-6 w-6 text-[#012169]" />
              <h2>Hero Sliding Banners (Desktop & Mobile Optimized)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Manage the auto-sliding banners displayed on the storefront home page. You can now provide separate images for Desktop and Mobile to avoid cutoff and unreadable text.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleAddSlide}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Plus weight="bold" className="h-4 w-4" />
              <span>Add Slide</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#012169] hover:bg-[#082b7d] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : saveSuccess ? (
                <>
                  <CheckCircle weight="fill" className="h-4 w-4 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <FloppyDisk weight="bold" className="h-4 w-4" />
                  <span>Save Banners</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dimension Cheat Sheet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-start gap-2.5 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
            <Monitor weight="bold" className="h-5 w-5 text-[#012169] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#012169]">Desktop (PC) Banner Specs</p>
              <p className="text-slate-600 mt-0.5">
                <strong>1920 × 600 px</strong> (or 1800 × 500 px, ~16:5 ratio). Landscape layout with text on left/center and product visuals on right.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 bg-purple-50/60 p-3 rounded-xl border border-purple-100">
            <DeviceMobile weight="bold" className="h-5 w-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-purple-900">Mobile Banner Specs (Recommended)</p>
              <p className="text-slate-600 mt-0.5">
                <strong>800 × 800 px</strong> (Square 1:1) or <strong>750 × 900 px</strong> (Portrait). Single-column stack with large, bold text.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Cards List */}
      <div className="grid grid-cols-1 gap-6">
        {slides.map((slide, index) => {
          const isUploadingDesktop = uploadingTarget?.index === index && uploadingTarget?.target === 'desktop';
          const isUploadingMobile = uploadingTarget?.index === index && uploadingTarget?.target === 'mobile';

          return (
            <div
              key={slide.id || index}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#012169]/40 transition-all flex flex-col gap-5"
            >
              {/* Top row: Previews (Desktop + Mobile) and Badges */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                {/* Desktop Preview */}
                <div className="flex-1 relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group h-44 sm:h-48">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title || `Desktop Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://placehold.co/1920x600/012169/ffffff?text=Desktop+Banner+(1920x600)';
                    }}
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <Monitor weight="bold" className="h-3.5 w-3.5 text-blue-400" />
                    <span>Desktop (PC)</span>
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                    Slide #{index + 1}
                  </div>

                  {/* Direct upload overlay */}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer p-4 text-center">
                    <UploadSimple weight="bold" className="h-6 w-6 mb-1 text-white" />
                    <span className="text-xs font-bold">
                      {isUploadingDesktop ? 'Uploading Desktop...' : 'Replace Desktop Banner (1920x600)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(index, f, 'desktop');
                      }}
                      disabled={isUploadingDesktop}
                    />
                  </label>
                </div>

                {/* Mobile Preview */}
                <div className="w-full sm:w-48 lg:w-44 shrink-0 relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group h-44 sm:h-48">
                  {slide.mobileImageUrl ? (
                    <img
                      src={slide.mobileImageUrl}
                      alt={slide.title ? `${slide.title} Mobile` : `Mobile Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://placehold.co/800x800/4f46e5/ffffff?text=Mobile+Banner+(800x800)';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-slate-50 text-slate-400">
                      <DeviceMobile weight="duotone" className="h-8 w-8 mb-1 text-slate-300" />
                      <span className="text-[11px] font-semibold">No mobile image</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">(Falls back to desktop)</span>
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5">
                    <DeviceMobile weight="bold" className="h-3.5 w-3.5 text-purple-400" />
                    <span>Mobile</span>
                  </div>

                  {/* Direct upload overlay for mobile */}
                  <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer p-3 text-center">
                    <UploadSimple weight="bold" className="h-6 w-6 mb-1 text-white" />
                    <span className="text-xs font-bold">
                      {isUploadingMobile ? 'Uploading Mobile...' : 'Upload Mobile Banner (800x800)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(index, f, 'mobile');
                      }}
                      disabled={isUploadingMobile}
                    />
                  </label>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Desktop Image URL & Upload Button */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Monitor weight="bold" className="h-3.5 w-3.5 text-[#012169]" />
                      <span>Desktop Image URL (1920 × 600 px)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={slide.imageUrl}
                        onChange={(e) => handleUpdateSlide(index, { imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#012169]"
                      />
                      <label className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0">
                        <UploadSimple weight="bold" className="h-3.5 w-3.5" />
                        <span>{isUploadingDesktop ? '...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(index, f, 'desktop');
                          }}
                          disabled={isUploadingDesktop}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Mobile Image URL & Upload Button */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <DeviceMobile weight="bold" className="h-3.5 w-3.5 text-purple-600" />
                      <span>Mobile Image URL (800 × 800 px square / portrait)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={slide.mobileImageUrl || ''}
                        onChange={(e) => handleUpdateSlide(index, { mobileImageUrl: e.target.value })}
                        placeholder="Optional (falls back to desktop banner)"
                        className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#012169]"
                      />
                      <label className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0 border border-purple-200/60">
                        <UploadSimple weight="bold" className="h-3.5 w-3.5" />
                        <span>{isUploadingMobile ? '...' : 'Upload Mobile'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFileUpload(index, f, 'mobile');
                          }}
                          disabled={isUploadingMobile}
                        />
                      </label>
                      {slide.mobileImageUrl && (
                        <button
                          type="button"
                          onClick={() => handleUpdateSlide(index, { mobileImageUrl: '' })}
                          title="Clear mobile image"
                          className="px-2 py-1 text-slate-400 hover:text-red-500 text-xs font-bold rounded-lg border border-slate-200 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Title (for Admin reference / alt tag) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Banner Label / Reference
                    </label>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={(e) => handleUpdateSlide(index, { title: e.target.value })}
                      placeholder="e.g. Summer Promo, DTF Apparel"
                      className="w-full h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#012169]"
                    />
                  </div>

                  {/* Destination Click Link */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Click Redirect URL (Optional)
                    </label>
                    <div className="relative">
                      <LinkIcon weight="bold" className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={slide.linkUrl || ''}
                        onChange={(e) => handleUpdateSlide(index, { linkUrl: e.target.value })}
                        placeholder="/category/Printing or https://..."
                        className="w-full h-9 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#012169]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Storefront automatically serves mobile image on screen widths ≤ 640px
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(index)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash weight="bold" className="h-3.5 w-3.5" />
                  <span>Remove Slide</span>
                </button>
              </div>
            </div>
          );
        })}

        {slides.length === 0 && (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Images weight="duotone" className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Hero Banners Added</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add your first 450px auto-sliding banner image for the storefront home page.
            </p>
            <button
              onClick={handleAddSlide}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#012169] text-white text-xs font-bold rounded-xl"
            >
              <Plus weight="bold" className="h-4 w-4" />
              <span>Add First Slide</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
