'use client';

import React, { useState, useMemo } from 'react';
import { Product, ProductInput, CategoryConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ProductForm } from './ProductForm';
import { ImageWithFallback } from '@/components/storefront/ImageWithFallback';
import { formatCurrency, calculateDiscount } from '@/lib/utils';
import {
  Plus,
  MagnifyingGlass,
  PencilSimple,
  Trash,
  ArrowSquareOut,
  Lightning,
  Sparkle,
  ArrowClockwise,
  CheckCircle,
  WarningCircle,
  Percent,
  TrendUp,
  TrendDown,
} from '@phosphor-icons/react';
import Link from 'next/link';

interface ProductManagerProps {
  products: Product[];
  categories: CategoryConfig[];
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  isAddModalOpen?: boolean;
  onOpenAddModal?: () => void;
  onCloseAddModal?: () => void;
  onCreateProduct: (input: ProductInput) => Promise<void>;
  onUpdateProduct: (id: string, input: Partial<Product> | ProductInput) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
  onRefreshData?: () => Promise<void>;
}

export function ProductManager({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  isAddModalOpen: controlledAddModalOpen,
  onOpenAddModal,
  onCloseAddModal,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onRefreshData,
}: ProductManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>(selectedCategory || 'All');
  const [internalFormOpen, setInternalFormOpen] = useState(false);

  const isFormOpen = controlledAddModalOpen !== undefined ? controlledAddModalOpen : internalFormOpen;
  const setIsFormOpen = (open: boolean) => {
    setInternalFormOpen(open);
    if (!open && onCloseAddModal) onCloseAddModal();
    if (open && onOpenAddModal) onOpenAddModal();
  };

  React.useEffect(() => {
    if (selectedCategory !== undefined) {
      setFilterCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Bulk Price Adjustment state
  const [isBulkPriceModalOpen, setIsBulkPriceModalOpen] = useState(false);
  const [bulkScope, setBulkScope] = useState<'all' | 'category' | 'product'>('all');
  const [bulkCategory, setBulkCategory] = useState<string>(categories?.[0]?.name || 'Printing');
  const [bulkProductId, setBulkProductId] = useState<string>('');
  const [bulkDirection, setBulkDirection] = useState<'increase' | 'decrease'>('increase');
  const [bulkPercent, setBulkPercent] = useState<string>('10');
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);

  React.useEffect(() => {
    if (categories?.length && !bulkCategory) {
      setBulkCategory(categories[0].name);
    }
  }, [categories, bulkCategory]);

  React.useEffect(() => {
    if (products?.length && !bulkProductId) {
      setBulkProductId(products[0].id || products[0].slug || '');
    }
  }, [products, bulkProductId]);

  const targetBulkProducts = useMemo(() => {
    if (bulkScope === 'all') {
      return products;
    }
    if (bulkScope === 'product') {
      const match = products.find((p) => (p.id || p.slug) === bulkProductId);
      return match ? [match] : (products.length > 0 ? [products[0]] : []);
    }
    return products.filter((p) => {
      const cat = p.category?.toLowerCase() || '';
      const sub = p.subcategory?.toLowerCase() || '';
      const target = bulkCategory.toLowerCase();
      return cat === target || sub === target;
    });
  }, [products, bulkScope, bulkCategory, bulkProductId]);

  const parsedPercent = Math.max(0, parseFloat(bulkPercent) || 0);
  const effectivePct = bulkDirection === 'decrease' ? Math.min(95, parsedPercent) : parsedPercent;
  const adjustmentFactor =
    bulkDirection === 'increase'
      ? 1 + effectivePct / 100
      : Math.max(0.01, 1 - effectivePct / 100);

  const bulkPreviewItems = useMemo(() => {
    return targetBulkProducts.map((p) => {
      const oldPrice = p.price || 0;
      const newPrice = Math.max(0.5, Number((oldPrice * adjustmentFactor).toFixed(2)));
      const priceDiff = Number((newPrice - oldPrice).toFixed(2));

      let oldDiscounted: number | undefined = undefined;
      let newDiscounted: number | undefined = undefined;
      if (p.discountedPrice && p.discountedPrice > 0) {
        oldDiscounted = p.discountedPrice;
        newDiscounted = Math.max(0.5, Number((oldDiscounted * adjustmentFactor).toFixed(2)));
      }

      return {
        product: p,
        oldPrice,
        newPrice,
        priceDiff,
        oldDiscounted,
        newDiscounted,
      };
    });
  }, [targetBulkProducts, adjustmentFactor]);

  const handleApplyBulkPrices = async () => {
    if (parsedPercent <= 0) {
      showNotification('error', 'Please enter a percentage greater than 0.');
      return;
    }
    if (bulkPreviewItems.length === 0) {
      showNotification('error', 'No products found in the selected scope.');
      return;
    }

    const actionText = bulkDirection === 'increase' ? 'increase' : 'decrease';
    const scopeText =
      bulkScope === 'all'
        ? 'ALL products'
        : bulkScope === 'product'
        ? `product "${bulkPreviewItems[0]?.product.title || 'Selected'}"`
        : `category "${bulkCategory}"`;
    const confirmPrompt = `Are you sure you want to ${actionText} prices by ${parsedPercent}% for ${bulkPreviewItems.length} product(s) in ${scopeText}?`;
    if (!window.confirm(confirmPrompt)) return;

    setIsApplyingBulk(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      for (const item of bulkPreviewItems) {
        const targetId = item.product.id || item.product.slug;
        if (!targetId) continue;

        const updates: Partial<Product> = {
          price: item.newPrice,
          ...(item.newDiscounted !== undefined ? { discountedPrice: item.newDiscounted } : {}),
        };

        try {
          await onUpdateProduct(targetId, updates);
          successCount++;
        } catch (err) {
          console.error(`Failed to update ${item.product.title}:`, err);
          failedCount++;
        }
      }

      if (onRefreshData) {
        try {
          await onRefreshData();
        } catch (e) {
          console.warn('Failed to refresh data after bulk update:', e);
        }
      }

      if (failedCount === 0) {
        showNotification(
          'success',
          `Successfully ${actionText}d prices by ${parsedPercent}% across ${successCount} products.`
        );
        setIsBulkPriceModalOpen(false);
      } else {
        showNotification(
          'error',
          `Updated ${successCount} products, but ${failedCount} products failed.`
        );
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Bulk adjustment failed.');
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (!product) return false;
      const title = product.title || '';
      const cat = product.category || '';
      const subcat = product.subcategory || '';
      const q = searchQuery.toLowerCase().trim();

      const matchSearch =
        !q ||
        title.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q) ||
        subcat.toLowerCase().includes(q);

      const matchCategory =
        filterCategory === 'All'
          ? true
          : cat.toLowerCase() === filterCategory.toLowerCase() ||
            subcat.toLowerCase() === filterCategory.toLowerCase();

      return matchSearch && matchCategory;
    });
  }, [products, searchQuery, filterCategory]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: ProductInput, id?: string) => {
    try {
      if (id) {
        await onUpdateProduct(id, data);
        showNotification('success', `Product "${data.title}" updated successfully.`);
      } else {
        await onCreateProduct(data);
        showNotification('success', `Product "${data.title}" created successfully.`);
      }
      setIsFormOpen(false);
      setEditingProduct(null);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save product.');
      throw err;
    }
  };

  const handleDelete = async (product: Product) => {
    const targetId = product.id || product.slug;
    if (!targetId) return;

    if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
      setDeletingId(targetId);
      try {
        await onDeleteProduct(targetId);
        showNotification('success', `Deleted "${product.title}".`);
      } catch (err: any) {
        showNotification('error', err.message || 'Failed to delete product.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Notice Toast */}
      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' ? (
              <CheckCircle weight="fill" className="h-4 w-4 text-emerald-600" />
            ) : (
              <WarningCircle weight="fill" className="h-4 w-4 text-rose-600" />
            )}
            <span>{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-slate-400 hover:text-slate-700 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by title or category..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#012169]"
            />
          </div>

          {/* Dynamic Category Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 px-3 py-1.5 focus:outline-hidden cursor-pointer rounded-lg hover:bg-white"
            >
              <option value="All">All Categories ({products.length})</option>
              {(categories || []).filter((c) => c && c.name).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsBulkPriceModalOpen(true)}
            className="flex items-center gap-1.5 border-slate-300 text-slate-700 hover:text-[#012169] hover:border-[#012169] hover:bg-blue-50/50"
          >
            <Percent weight="bold" className="h-4 w-4 text-[#012169]" />
            <span>Adjust Prices (%)</span>
          </Button>

          <Button variant="uk-blue" size="md" onClick={handleOpenCreate}>
            <Plus weight="bold" className="h-4 w-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Product List Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700">
            Total Products: <span className="text-[#012169]">{filteredProducts.length}</span>
          </div>

          {onRefreshData && (
            <button
              onClick={() => onRefreshData()}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#012169] font-semibold transition-colors cursor-pointer"
              title="Refresh product list"
            >
              <ArrowClockwise weight="bold" className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Sparkle weight="fill" className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-900">No products found</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Your catalog is currently empty or no items match your search. Add a new product above to publish items to your storefront.
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Button variant="uk-blue" size="sm" onClick={handleOpenCreate}>
                <Plus weight="bold" className="h-3.5 w-3.5 mr-1" />
                <span>Create First Product</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Same-Day</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredProducts.map((product, index) => {
                  const discount = calculateDiscount(product.price, product.discountedPrice);
                  const activePrice = product.discountedPrice || product.price;
                  const itemKey = product.id ? `p-${product.id}` : `p-${product.slug}-${index}`;

                  return (
                    <tr key={itemKey} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <ImageWithFallback
                              src={product.imageUrl}
                              alt={product.title}
                              fallbackText={product.title}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                              {product.title}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={product.category === 'Printing' ? 'uk-blue' : 'default'}
                          className="font-bold"
                        >
                          {product.category}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-black text-slate-900">
                          {formatCurrency(activePrice)}
                        </div>
                        {product.discountedPrice && (
                          <div className="text-[10px] text-[#C8102E] font-semibold">
                            -{discount}% OFF
                          </div>
                        )}
                      </td>

                      {/* Same Day */}
                      <td className="py-3.5 px-4">
                        {product.isSameDayAvailable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <Lightning weight="fill" className="h-3 w-3 text-amber-400" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Standard</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/product/${product.slug || product.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="View on Storefront"
                          >
                            <ArrowSquareOut weight="bold" className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg text-[#012169] hover:bg-[#012169]/10 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <PencilSimple weight="bold" className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(product)}
                            disabled={deletingId === (product.id || product.slug)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Product"
                          >
                            <Trash weight="bold" className="h-4 w-4" />
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

      {/* Form Modal */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialProduct={editingProduct}
        categories={categories}
      />

      {/* Bulk Price Adjustment Modal */}
      <Modal
        isOpen={isBulkPriceModalOpen}
        onClose={() => !isApplyingBulk && setIsBulkPriceModalOpen(false)}
        title="Bulk Price Adjustment (%)"
        description="Quickly adjust product base prices by a percentage across all products or within a specific category."
        maxWidth="3xl"
      >
        <div className="space-y-6 pt-2">
          {/* 1. Scope Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Select Target Scope
            </label>
            {/* Target Scope */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBulkScope('all')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  bulkScope === 'all'
                    ? 'bg-blue-50/80 border-[#012169] text-[#012169] ring-2 ring-[#012169]/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">All Products</div>
                  <div className="text-[10px] text-slate-500">Entire catalog</div>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs">
                  {products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulkScope('category')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  bulkScope === 'category'
                    ? 'bg-blue-50/80 border-[#012169] text-[#012169] ring-2 ring-[#012169]/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Category-wise</div>
                  <div className="text-[10px] text-slate-500">Category only</div>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs">
                  {products.filter(
                    (p) =>
                      p.category?.toLowerCase() === bulkCategory.toLowerCase() ||
                      p.subcategory?.toLowerCase() === bulkCategory.toLowerCase()
                  ).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBulkScope('product')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  bulkScope === 'product'
                    ? 'bg-blue-50/80 border-[#012169] text-[#012169] ring-2 ring-[#012169]/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">Single Product</div>
                  <div className="text-[10px] text-slate-500">Specific item</div>
                </div>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-white border border-slate-200 shadow-xs">
                  1
                </span>
              </button>
            </div>

            {/* Category Dropdown if Scope is Category */}
            {bulkScope === 'category' && (
              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Choose Category:
                </label>
                <select
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#012169] cursor-pointer"
                >
                  {(categories || []).filter((c) => c && c.name).map((c) => {
                    const count = products.filter(
                      (p) =>
                        p.category?.toLowerCase() === c.name.toLowerCase() ||
                        p.subcategory?.toLowerCase() === c.name.toLowerCase()
                    ).length;
                    return (
                      <option key={c.name} value={c.name}>
                        {c.name} ({count} product{count === 1 ? '' : 's'})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Product Dropdown if Scope is Single Product */}
            {bulkScope === 'product' && (
              <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                  Choose Specific Product:
                </label>
                <select
                  value={bulkProductId || (products[0]?.id || products[0]?.slug || '')}
                  onChange={(e) => setBulkProductId(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#012169] cursor-pointer"
                >
                  {products.map((p) => {
                    const pKey = p.id || p.slug;
                    const activePrice = p.discountedPrice || p.price;
                    return (
                      <option key={pKey} value={pKey}>
                        {p.title} ({p.category}) — £{activePrice.toFixed(2)}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* 2. Direction & Percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Direction */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                2. Adjustment Direction
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBulkDirection('increase')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    bulkDirection === 'increase'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <TrendUp weight="bold" className="h-4 w-4 text-emerald-600" />
                  <span>Increase (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBulkDirection('decrease')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    bulkDirection === 'decrease'
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <TrendDown weight="bold" className="h-4 w-4 text-rose-600" />
                  <span>Decrease (-)</span>
                </button>
              </div>
            </div>

            {/* Percentage Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Percentage (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.1"
                  max={bulkDirection === 'decrease' ? '95' : '500'}
                  step="0.5"
                  value={bulkPercent}
                  onChange={(e) => setBulkPercent(e.target.value)}
                  placeholder="10"
                  className="w-full h-10 pl-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-900 focus:outline-hidden focus:border-[#012169]"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  %
                </span>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {[5, 10, 15, 20, 25, 50].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setBulkPercent(val.toString())}
                    className={`text-[11px] px-2.5 py-0.5 rounded-lg border font-bold transition-all cursor-pointer ${
                      bulkPercent === val.toString()
                        ? 'bg-[#012169] text-white border-[#012169]'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {bulkDirection === 'increase' ? `+${val}%` : `-${val}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Live Price Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Live Price Preview ({bulkPreviewItems.length} Products Affected)
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Rounded to 2 decimals · min £0.50
              </span>
            </div>

            {bulkPreviewItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No products match the selected target scope.
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-slate-50/50">
                {bulkPreviewItems.map(
                  ({ product, oldPrice, newPrice, priceDiff, oldDiscounted, newDiscounted }) => (
                    <div
                      key={product.id || product.slug}
                      className="p-3 flex items-center justify-between text-xs bg-white hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="font-bold text-slate-900 truncate max-w-sm">
                          {product.title}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {product.category}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-slate-400 line-through font-mono text-[11px]">
                            {formatCurrency(oldPrice)}
                          </span>
                          <span className="font-black text-slate-900 font-mono">
                            → {formatCurrency(newPrice)}
                          </span>
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                              priceDiff > 0
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : priceDiff < 0
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {priceDiff > 0 ? `+${formatCurrency(priceDiff)}` : formatCurrency(priceDiff)}
                          </span>
                        </div>
                        {oldDiscounted !== undefined && newDiscounted !== undefined && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Sale: {formatCurrency(oldDiscounted)} → {formatCurrency(newDiscounted)}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Will update base price for{' '}
              <strong className="text-slate-900">{bulkPreviewItems.length}</strong> product
              {bulkPreviewItems.length === 1 ? '' : 's'}.
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isApplyingBulk}
                onClick={() => setIsBulkPriceModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="uk-blue"
                size="sm"
                disabled={isApplyingBulk || bulkPreviewItems.length === 0 || parsedPercent <= 0}
                onClick={handleApplyBulkPrices}
              >
                {isApplyingBulk ? (
                  <span className="flex items-center gap-2">
                    <ArrowClockwise className="h-3.5 w-3.5 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span>
                    Apply {bulkDirection === 'increase' ? `+${parsedPercent}%` : `-${parsedPercent}%`} ({bulkPreviewItems.length})
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
