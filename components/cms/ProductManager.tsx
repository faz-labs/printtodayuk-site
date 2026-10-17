'use client';

import React, { useState, useMemo } from 'react';
import { Product, ProductInput, CategoryConfig } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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
  onUpdateProduct: (id: string, input: ProductInput) => Promise<void>;
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
    </div>
  );
}
