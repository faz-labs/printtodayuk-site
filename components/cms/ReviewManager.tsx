'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  CheckCircle,
  Plus,
  Trash,
  PencilSimple,
  MagnifyingGlass,
  ArrowClockwise,
  SlidersHorizontal,
  X,
  Buildings,
  MapPin,
  Tag,
  Lightning,
  Sparkle,
  Globe,
  Check,
} from '@phosphor-icons/react';
import { ReviewItem, ReviewInput, ReviewPlatform } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { saveDeletedReviewId } from '@/lib/db';

interface ReviewManagerProps {
  initialReviews?: ReviewItem[];
  onRefreshData?: () => Promise<void>;
}

export function ReviewManager({ initialReviews = [], onRefreshData }: ReviewManagerProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);

  React.useEffect(() => {
    if (Array.isArray(initialReviews)) {
      setReviews(initialReviews);
    }
  }, [initialReviews]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<
    'all' | 'google' | 'trustpilot' | 'direct' | 'featured'
  >('all');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [isGoogleSyncModalOpen, setIsGoogleSyncModalOpen] = useState(false);
  const [isTrustpilotSyncModalOpen, setIsTrustpilotSyncModalOpen] = useState(false);

  // Sync Form States
  const [googlePlaceId, setGooglePlaceId] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [trustpilotDomain, setTrustpilotDomain] = useState('printtoday.co.uk');
  const [isSyncing, setIsSyncing] = useState(false);

  // Notifications
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 5000);
  };

  // Form Field States
  const [formAuthor, setFormAuthor] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('London, UK');
  const [formRating, setFormRating] = useState(5);
  const [formReview, setFormReview] = useState('');
  const [formProduct, setFormProduct] = useState('Commercial Print');
  const [formPlatform, setFormPlatform] = useState<ReviewPlatform>('google');
  const [formDate, setFormDate] = useState('Recently');
  const [formIsVerified, setFormIsVerified] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Computed Metrics
  const metrics = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / total).toFixed(1)
        : '5.0';
    const googleCount = reviews.filter((r) => r.platform === 'google').length;
    const trustpilotCount = reviews.filter((r) => r.platform === 'trustpilot').length;
    const featuredCount = reviews.filter((r) => r.isFeatured).length;

    return { total, avg, googleCount, trustpilotCount, featuredCount };
  }, [reviews]);

  // Filtered List
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.author.toLowerCase().includes(q) ||
        (r.company || '').toLowerCase().includes(q) ||
        r.review.toLowerCase().includes(q) ||
        (r.product || '').toLowerCase().includes(q) ||
        (r.location || '').toLowerCase().includes(q);

      const matchFilter =
        filterPlatform === 'all'
          ? true
          : filterPlatform === 'featured'
          ? r.isFeatured
          : r.platform === filterPlatform;

      return matchSearch && matchFilter;
    });
  }, [reviews, searchQuery, filterPlatform]);

  const handleOpenCreate = () => {
    setEditingReview(null);
    setFormAuthor('');
    setFormCompany('');
    setFormLocation('London, UK');
    setFormRating(5);
    setFormReview('');
    setFormProduct('Commercial Print');
    setFormPlatform('google');
    setFormDate('Recently');
    setFormIsVerified(true);
    setFormIsFeatured(true);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (rev: ReviewItem) => {
    setEditingReview(rev);
    setFormAuthor(rev.author);
    setFormCompany(rev.company || '');
    setFormLocation(rev.location || 'London, UK');
    setFormRating(rev.rating);
    setFormReview(rev.review);
    setFormProduct(rev.product || 'Commercial Print');
    setFormPlatform(rev.platform);
    setFormDate(rev.date || 'Recently');
    setFormIsVerified(rev.isVerified ?? true);
    setFormIsFeatured(rev.isFeatured ?? true);
    setIsFormModalOpen(true);
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAuthor.trim() || !formReview.trim()) {
      showNotification('error', 'Please provide both author name and review content.');
      return;
    }

    setIsSubmitting(true);
    const payload: ReviewInput = {
      author: formAuthor.trim(),
      company: formCompany.trim() || undefined,
      location: formLocation.trim() || 'London, UK',
      rating: formRating,
      review: formReview.trim(),
      product: formProduct.trim() || 'Commercial Print',
      platform: formPlatform,
      date: formDate.trim() || 'Recently',
      isVerified: formIsVerified,
      isFeatured: formIsFeatured,
    };

    try {
      if (editingReview?.id) {
        const res = await fetch('/api/reviews', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingReview.id, ...payload }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update review');

        setReviews((prev) =>
          prev.map((r) => (r.id === editingReview.id ? { ...r, ...payload } : r))
        );
        showNotification('success', `Review by "${payload.author}" updated successfully.`);
      } else {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create review');

        setReviews((prev) => [data.review, ...prev]);
        showNotification('success', `Review by "${payload.author}" added successfully.`);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFeatured = async (rev: ReviewItem) => {
    if (!rev.id) return;
    const nextState = !rev.isFeatured;

    // Optimistic UI update
    setReviews((prev) =>
      prev.map((r) => (r.id === rev.id ? { ...r, isFeatured: nextState } : r))
    );

    try {
      const res = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rev.id, isFeatured: nextState }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      showNotification(
        'success',
        nextState
          ? `Review by ${rev.author} is now featured on the storefront.`
          : `Review by ${rev.author} removed from featured storefront list.`
      );
    } catch (err: any) {
      // Revert on error
      setReviews((prev) =>
        prev.map((r) => (r.id === rev.id ? { ...r, isFeatured: !nextState } : r))
      );
      showNotification('error', 'Could not update review status.');
    }
  };

  const handleDelete = async (rev: ReviewItem) => {
    if (!rev.id) return;
    if (!window.confirm(`Are you sure you want to delete the review by "${rev.author}"?`)) {
      return;
    }

    // Immediately record deletion locally and update state optimistically
    saveDeletedReviewId(rev.id);
    setReviews((prev) => prev.filter((r) => r.id !== rev.id));

    try {
      const res = await fetch(`/api/reviews?id=${encodeURIComponent(rev.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.warn('Server delete note:', data.error);
      }
      showNotification('success', `Review by "${rev.author}" deleted.`);
      if (onRefreshData) onRefreshData();
    } catch (err: any) {
      showNotification('success', `Review by "${rev.author}" deleted.`);
    }
  };

  const handleClearDemoReviews = async () => {
    const demoIds = ['rev-1', 'rev-2', 'rev-3', 'rev-4', 'rev-5', 'rev-6'];
    const presentDemos = reviews.filter((r) => demoIds.includes(r.id));
    if (presentDemos.length === 0) {
      showNotification('error', 'No demo reviews found.');
      return;
    }
    if (!window.confirm(`Permanently delete all ${presentDemos.length} demo sample reviews? Any real reviews you added will remain.`)) {
      return;
    }

    presentDemos.forEach((d) => saveDeletedReviewId(d.id));
    setReviews((prev) => prev.filter((r) => !demoIds.includes(r.id)));

    await Promise.allSettled(
      presentDemos.map((d) => fetch(`/api/reviews?id=${encodeURIComponent(d.id)}`, { method: 'DELETE' }))
    );

    showNotification('success', 'All sample demo reviews permanently deleted.');
    if (onRefreshData) onRefreshData();
  };

  const handleSyncGoogle = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/reviews/sync-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeId: googlePlaceId.trim() || undefined,
          apiKey: googleApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync Google reviews');

      showNotification('success', data.message || 'Google reviews synced successfully!');
      setIsGoogleSyncModalOpen(false);

      // Refresh reviews list
      const freshRes = await fetch('/api/reviews');
      if (freshRes.ok) {
        const freshData = await freshRes.json();
        if (freshData.reviews) setReviews(freshData.reviews);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to sync Google reviews');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncTrustpilot = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/reviews/sync-trustpilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: trustpilotDomain.trim() || 'printtoday.co.uk' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync Trustpilot reviews');

      showNotification('success', data.message || 'Trustpilot reviews synced successfully!');
      setIsTrustpilotSyncModalOpen(false);

      // Refresh reviews list
      const freshRes = await fetch('/api/reviews');
      if (freshRes.ok) {
        const freshData = await freshRes.json();
        if (freshData.reviews) setReviews(freshData.reviews);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to sync Trustpilot reviews');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-md ${
              notice.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            <span>{notice.message}</span>
            <button
              onClick={() => setNotice(null)}
              className="p-1 hover:opacity-75 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Quick Action Buttons */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Reviews &amp; Testimonials</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200/80">
              {metrics.total} Reviews
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage reviews from Google Business, Trustpilot, and direct in-studio testimonials featured on your storefront.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGoogleSyncModalOpen(true)}
            className="border-slate-300 hover:bg-slate-50 font-bold text-xs"
          >
            <span className="text-[#4285F4] font-black mr-1.5">G</span>
            <span>Sync Google</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsTrustpilotSyncModalOpen(true)}
            className="border-slate-300 hover:bg-slate-50 font-bold text-xs"
          >
            <Star weight="fill" className="h-3.5 w-3.5 text-[#00b67a] mr-1.5" />
            <span>Sync Trustpilot</span>
          </Button>

          {reviews.some((r) => ['rev-1', 'rev-2', 'rev-3', 'rev-4', 'rev-5', 'rev-6'].includes(r.id)) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearDemoReviews}
              className="border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs cursor-pointer"
              title="Permanently delete all default demo sample reviews"
            >
              <Trash className="h-3.5 w-3.5 mr-1.5" />
              <span>Clear Demo Reviews</span>
            </Button>
          )}

          <Button
            variant="uk-blue"
            size="sm"
            onClick={handleOpenCreate}
            className="font-bold text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            <span>Add Review</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Average Score
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{metrics.avg}</span>
            <span className="text-xs text-amber-500 font-bold flex items-center">
              <Star weight="fill" className="h-3.5 w-3.5 fill-current" />
              <span>/ 5.0</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Reviews
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">{metrics.total}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
            <span>Google</span>
          </div>
          <div className="mt-1 text-2xl font-black text-blue-700">{metrics.googleCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
            <span>Trustpilot</span>
          </div>
          <div className="mt-1 text-2xl font-black text-emerald-700">{metrics.trustpilotCount}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
            Featured on Storefront
          </div>
          <div className="mt-1 text-2xl font-black text-indigo-700">{metrics.featuredCount}</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews by customer, company, product, or keyword..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#012169]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all', label: `All (${metrics.total})` },
              { id: 'google', label: `Google (${metrics.googleCount})` },
              { id: 'trustpilot', label: `Trustpilot (${metrics.trustpilotCount})` },
              { id: 'featured', label: `★ Featured (${metrics.featuredCount})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterPlatform(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                filterPlatform === tab.id
                  ? 'bg-[#012169] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Star className="h-6 w-6" />
            </div>
            <div className="font-bold text-slate-700 text-base">No reviews match your filter</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, or click &quot;Sync Google&quot; / &quot;Add Review&quot; to add customer testimonials.
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id || rev.author}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                rev.isFeatured ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div>
                {/* Top Meta Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {/* Platform Badge */}
                  {rev.platform === 'google' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200">
                      <span className="text-[#4285F4] font-black">G</span>
                      <span>Google Review</span>
                    </span>
                  ) : rev.platform === 'trustpilot' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                      <Star weight="fill" className="h-3 w-3 text-[#00b67a]" />
                      <span>Trustpilot Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 text-[11px] font-bold border border-purple-200">
                      <Sparkle weight="fill" className="h-3 w-3 text-purple-600" />
                      <span>Direct In-Studio</span>
                    </span>
                  )}

                  {/* Featured Status Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(rev)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      rev.isFeatured
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs'
                        : 'bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200'
                    }`}
                    title={rev.isFeatured ? 'Click to hide from storefront' : 'Click to feature on storefront'}
                  >
                    <Star weight={rev.isFeatured ? 'fill' : 'regular'} className="h-3 w-3 text-amber-500" />
                    <span>{rev.isFeatured ? 'Featured' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Stars Rating */}
                <div className="flex items-center gap-0.5 text-amber-400 mb-2.5">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} weight="fill" className="h-3.5 w-3.5" />
                  ))}
                  <span className="text-xs font-black text-slate-700 ml-1.5">
                    {rev.rating}.0
                  </span>
                  {rev.date && (
                    <span className="text-[10px] text-slate-400 font-medium ml-2">
                      • {rev.date}
                    </span>
                  )}
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-700 leading-relaxed italic mb-4">
                  &ldquo;{rev.review}&rdquo;
                </p>
              </div>

              {/* Author & Product Footer */}
              <div className="pt-3.5 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{rev.author}</span>
                      {rev.isVerified && (
                        <CheckCircle weight="fill" className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                    </div>
                    {(rev.company || rev.location) && (
                      <div className="text-[11px] text-slate-500">
                        {rev.company} {rev.company && rev.location && '•'} {rev.location}
                      </div>
                    )}
                  </div>

                  {rev.product && (
                    <span className="text-[10px] font-bold text-[#012169] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[120px]">
                      {rev.product}
                    </span>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(rev)}
                    className="p-1.5 text-slate-500 hover:text-[#012169] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit review"
                  >
                    <PencilSimple className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(rev)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete review"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Review Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingReview ? 'Edit Customer Review' : 'Add New Customer Review'}
        description="Fill in the customer testimonial details to feature on your storefront."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveReview} className="space-y-4">
          {/* Platform Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Review Source Platform
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'google', label: 'Google Review', icon: 'G' },
                { id: 'trustpilot', label: 'Trustpilot', icon: '★' },
                { id: 'direct', label: 'Direct Client', icon: '✍️' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setFormPlatform(p.id as ReviewPlatform)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    formPlatform === p.id
                      ? 'bg-[#012169] text-white border-[#012169] shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span>{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formAuthor}
                onChange={(e) => setFormAuthor(e.target.value)}
                placeholder="e.g. Marcus Sterling"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Company / Organisation
              </label>
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                placeholder="e.g. Tech Summit London"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g. Canary Wharf, London"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product / Service Printed
              </label>
              <input
                type="text"
                value={formProduct}
                onChange={(e) => setFormProduct(e.target.value)}
                placeholder="e.g. Folded Booklets & Name Badges"
                className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
              />
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Star Rating (1 - 5 Stars)
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormRating(s)}
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    weight="fill"
                    className={`h-6 w-6 ${
                      s <= formRating ? 'text-amber-400' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">
                {formRating} Star{formRating > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Review Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formReview}
              onChange={(e) => setFormReview(e.target.value)}
              placeholder="Paste or write the customer testimonial..."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169] resize-none"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={formIsVerified}
                onChange={(e) => setFormIsVerified(e.target.checked)}
                className="rounded text-[#012169] focus:ring-[#012169]"
              />
              <span>Verified Customer</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={formIsFeatured}
                onChange={(e) => setFormIsFeatured(e.target.checked)}
                className="rounded text-[#012169] focus:ring-[#012169]"
              />
              <span>Feature on Storefront Homepage</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="uk-blue" size="sm" isLoading={isSubmitting}>
              <span>{editingReview ? 'Update Review' : 'Create Review'}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Google Reviews Sync Modal */}
      <Modal
        isOpen={isGoogleSyncModalOpen}
        onClose={() => setIsGoogleSyncModalOpen(false)}
        title="Sync Google Business Reviews"
        description="Fetch verified customer reviews directly from your Google Business Profile."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <span className="text-[#4285F4] font-black">G</span>
              <span>Google Places API Integration</span>
            </div>
            <p className="text-[11px] text-blue-700 leading-relaxed">
              Enter your Google Place ID to sync live reviews. If left empty, it will import verified sample reviews curated for London printing businesses.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Place ID (Optional)
            </label>
            <input
              type="text"
              value={googlePlaceId}
              onChange={(e) => setGooglePlaceId(e.target.value)}
              placeholder="e.g. ChIJN1t_tDeuEmsRUsoyG83frY4"
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Places API Key (Optional)
            </label>
            <input
              type="password"
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGoogleSyncModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="uk-blue"
              size="sm"
              isLoading={isSyncing}
              onClick={handleSyncGoogle}
            >
              <ArrowClockwise className="h-3.5 w-3.5 mr-1.5" />
              <span>Fetch &amp; Sync Google</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trustpilot Sync Modal */}
      <Modal
        isOpen={isTrustpilotSyncModalOpen}
        onClose={() => setIsTrustpilotSyncModalOpen(false)}
        title="Sync Trustpilot Reviews"
        description="Fetch verified Trustpilot reviews for your business domain."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Star weight="fill" className="h-3.5 w-3.5 text-[#00b67a]" />
              <span>Trustpilot Profile Integration</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              Enter your Trustpilot business domain to pull your 5-star customer ratings and reviews directly into the database.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Business Website Domain
            </label>
            <input
              type="text"
              value={trustpilotDomain}
              onChange={(e) => setTrustpilotDomain(e.target.value)}
              placeholder="printtoday.co.uk"
              className="w-full h-9 px-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-[#012169]"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTrustpilotSyncModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              isLoading={isSyncing}
              onClick={handleSyncTrustpilot}
              className="bg-[#00b67a] hover:bg-[#009e6a] text-white font-bold"
            >
              <ArrowClockwise className="h-3.5 w-3.5 mr-1.5" />
              <span>Fetch &amp; Sync Trustpilot</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

