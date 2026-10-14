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
} from '@phosphor-icons/react';

export function HeroBannerManager() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

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
      linkUrl: '/category/Printing',
      order: slides.length + 1,
    };
    setSlides((prev) => [...prev, newSlide]);
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

  // Direct file upload to S3 for a slide
  const handleFileUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      const uploadedUrl = data.url;

      handleUpdateSlide(index, { imageUrl: uploadedUrl });
    } catch (err: any) {
      alert(`Image upload failed: ${err.message || err}`);
    } finally {
      setUploadingIndex(null);
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
    <div className="space-y-6">
      {/* Header & Guidelines */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-lg">
            <Images weight="bold" className="h-6 w-6 text-[#012169]" />
            <h2>Hero Sliding Banners (450px Height)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage the auto-sliding banners displayed on the storefront home page. Banners render at an exact fixed height of <strong>450px</strong> without video or overlay titles. Recommended aspect ratio: <strong>16:9</strong> or <strong>1800x450px</strong>.
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

      {/* Slide Cards List */}
      <div className="grid grid-cols-1 gap-6">
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#012169]/40 transition-all flex flex-col md:flex-row gap-6 items-stretch"
          >
            {/* Slide Preview (Fixed 450px ratio preview) */}
            <div className="w-full md:w-80 shrink-0 relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 group h-44 sm:h-52">
              <img
                src={slide.imageUrl}
                alt={slide.title || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/800x450/012169/ffffff?text=Banner+Image';
                }}
              />
              <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                Slide #{index + 1}
              </div>

              {/* Direct file upload overlay */}
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer p-4 text-center">
                <UploadSimple weight="bold" className="h-7 w-7 mb-1 text-white" />
                <span className="text-xs font-bold">
                  {uploadingIndex === index ? 'Uploading...' : 'Click to Upload S3 Image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(index, f);
                  }}
                  disabled={uploadingIndex === index}
                />
              </label>
            </div>

            {/* Slide Configuration Fields */}
            <div className="flex-1 space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Image URL with direct file upload button */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Banner Image URL (S3 / CDN or Web)
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
                      <span>{uploadingIndex === index ? '...' : 'Upload File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleFileUpload(index, f);
                        }}
                        disabled={uploadingIndex === index}
                      />
                    </label>
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
                  Fixed height: 450px on storefront
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
          </div>
        ))}

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
