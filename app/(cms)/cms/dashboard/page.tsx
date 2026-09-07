'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Product, ProductInput, CategoryConfig, Inquiry } from '@/lib/types';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  updateCategorySubcategories,
  createCategory,
  deleteCategory,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} from '@/lib/db';
import { CMSNavbar } from '@/components/cms/CMSNavbar';
import { ProductManager } from '@/components/cms/ProductManager';
import { CategoryManager } from '@/components/cms/CategoryManager';
import { InquiryInbox } from '@/components/cms/InquiryInbox';
import {
  Package,
  Stack,
  PhoneCall,
  Lightning,
  TrendUp,
  Printer,
  TShirt,
} from '@phosphor-icons/react';

export default function CMSDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'inquiries'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Auth guard redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/cms/login');
    }
  }, [user, authLoading, router]);

  // Load all initial data
  const refreshData = async () => {
    setLoadingData(true);
    try {
      const [prods, cats, inqs] = await Promise.all([
        getProducts(),
        getCategories(),
        getInquiries(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setInquiries(inqs);
    } catch (err) {
      console.error('Failed to load CMS data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  // Product CRUD Handlers
  const handleCreateProduct = async (input: ProductInput) => {
    const created = await createProduct(input);
    setProducts((prev) => [created, ...prev]);
  };

  const handleUpdateProduct = async (id: string, updates: Partial<Product>) => {
    const updated = await updateProduct(id, updates);
    if (updated) {
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Category CRUD Handlers
  const handleCreateCategory = async (cat: {
    name: string;
    description?: string;
    subcategories?: string[];
  }) => {
    const created = await createCategory(cat);
    setCategories((prev) => [...prev.filter((c) => c.name.toLowerCase() !== created.name.toLowerCase()), created]);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    await deleteCategory(categoryName);
    setCategories((prev) => prev.filter((c) => c.name.toLowerCase() !== categoryName.toLowerCase()));
  };

  const handleUpdateSubcategories = async (
    categoryName: string,
    subcategories: string[]
  ) => {
    const updated = await updateCategorySubcategories(categoryName, subcategories);
    setCategories([...updated]);
  };

  // Inquiry CRUD Handlers
  const handleUpdateInquiryStatus = async (
    id: string,
    status: 'pending' | 'contacted' | 'resolved'
  ) => {
    await updateInquiryStatus(id, status);
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
    );
  };

  const handleDeleteInquiry = async (id: string) => {
    await deleteInquiry(id);
    setInquiries((prev) => prev.filter((inq) => inq.id !== id));
  };

  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-400">Loading CMS...</span>
        </div>
      </div>
    );
  }

  // Quick stats
  const printingCount = products.filter((p) => p.category === 'Printing').length;
  const clothingCount = products.filter((p) => p.category === 'Clothing').length;
  const sameDayCount = products.filter((p) => p.isSameDayAvailable).length;
  const pendingInquiriesCount = inquiries.filter(
    (i) => (i.status || 'pending') === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <CMSNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingInquiriesCount={pendingInquiriesCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Printing Catalog
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {printingCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Active Products</div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#012169]/10 text-[#012169] flex items-center justify-center">
              <Printer className="h-5 w-5" weight="bold" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Clothing Catalog
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {clothingCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Custom Apparels</div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TShirt className="h-5 w-5" weight="bold" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Same-Day Ready
              </div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {sameDayCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">London Express Dispatch</div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Lightning className="h-5 w-5 text-emerald-600" weight="fill" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Pending Leads
              </div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {pendingInquiriesCount}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Awaiting Callback</div>
            </div>
            <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <PhoneCall className="h-5 w-5" weight="bold" />
            </div>
          </div>
        </div>

        {/* Tab Views */}
        {loadingData ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
            <div className="h-8 w-8 border-3 border-[#012169]/30 border-t-[#012169] rounded-full animate-spin mx-auto mb-3" />
            <span className="text-xs font-bold text-slate-500">Syncing database...</span>
          </div>
        ) : (
          <div>
            {activeTab === 'products' && (
              <ProductManager
                products={products}
                categories={categories}
                onCreateProduct={handleCreateProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onRefreshData={refreshData}
              />
            )}

            {activeTab === 'categories' && (
              <CategoryManager
                categories={categories}
                onUpdateSubcategories={handleUpdateSubcategories}
                onCreateCategory={handleCreateCategory}
                onDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === 'inquiries' && (
              <InquiryInbox
                inquiries={inquiries}
                onUpdateStatus={handleUpdateInquiryStatus}
                onDeleteInquiry={handleDeleteInquiry}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
