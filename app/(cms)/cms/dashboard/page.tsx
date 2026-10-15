'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Product, ProductInput, CategoryConfig, Inquiry } from '@/lib/types';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getLocalCategories,
  updateCategorySubcategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  seedDefaultCatalogToFirestore,
} from '@/lib/db';
import { CMSSidebar } from '@/components/cms/CMSSidebar';
import { ProductManager } from '@/components/cms/ProductManager';
import { CategoryManager } from '@/components/cms/CategoryManager';
import { InquiryInbox } from '@/components/cms/InquiryInbox';
import { HeroBannerManager } from '@/components/cms/HeroBannerManager';
import { Button } from '@/components/ui/Button';
import {
  Package,
  Stack,
  PhoneCall,
  Lightning,
  Printer,
  TShirt,
  List,
  Plus,
  ArrowSquareOut,
  Database,
  CheckCircle,
  FolderPlus,
  Images,
  Flame,
} from '@phosphor-icons/react';

export default function CMSDashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'categories' | 'inquiries' | 'banners'>('categories');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>(() =>
    typeof window !== 'undefined' ? getLocalCategories() : []
  );
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [selectedProductCategory, setSelectedProductCategory] = useState<string>('All');
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

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
      setProducts(prods || []);
      setCategories(cats || []);
      setInquiries(inqs || []);
      if (cats && cats.length > 0 && !selectedCategoryName) {
        setSelectedCategoryName(cats[0]?.name || '');
      }
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
    imageUrl?: string;
    subcategories?: string[];
    subcategoryImages?: Record<string, string>;
    isBestSeller?: boolean;
  }) => {
    const created = await createCategory(cat);
    setCategories((prev) => [...prev.filter((c) => c.name.toLowerCase() !== created.name.toLowerCase()), created]);
    setSelectedCategoryName(created.name);
  };

  const handleDeleteCategory = async (categoryName: string) => {
    await deleteCategory(categoryName);
    setCategories((prev) => {
      const remaining = prev.filter((c) => c.name.toLowerCase() !== categoryName.toLowerCase());
      if (selectedCategoryName.toLowerCase() === categoryName.toLowerCase()) {
        setSelectedCategoryName(remaining[0]?.name || '');
      }
      return remaining;
    });
  };

  const handleUpdateSubcategories = async (
    categoryName: string,
    subcategories: string[]
  ) => {
    const updated = await updateCategorySubcategories(categoryName, subcategories);
    setCategories([...updated]);
  };

  const handleUpdateCategory = async (
    categoryName: string,
    updates: Partial<CategoryConfig>
  ) => {
    const updated = await updateCategory(categoryName, updates);
    setCategories((prev) =>
      prev.map((c) => (c.name.toLowerCase() === categoryName.toLowerCase() ? updated : c))
    );
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

  const handleSyncFirestore = async () => {
    setIsSyncing(true);
    try {
      const res = await seedDefaultCatalogToFirestore();
      setSyncNotice(`Synced catalog to Firestore successfully! (${res.count} categories)`);
      await refreshData();
      setTimeout(() => setSyncNotice(null), 4000);
    } catch (err: any) {
      setSyncNotice(`Sync warning: ${err.message || 'Check Firestore credentials'}`);
      setTimeout(() => setSyncNotice(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  if (authLoading || (!user && typeof window !== 'undefined')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-['Open_Sans',sans-serif] p-4">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center bg-slate-800/80 p-8 rounded-3xl border border-slate-700/60 shadow-2xl">
          <div className="h-9 w-9 border-3 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
          <div>
            <h2 className="text-sm font-bold text-white">Connecting to CMS Dashboard...</h2>
            <p className="text-xs text-slate-400 mt-1">Verifying your administrative session credentials.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                logout();
                router.push('/cms/login');
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Sign Out / Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quick stats
  const printingCount = (products || []).filter((p) => p && p.category === 'Printing').length;
  const clothingCount = (products || []).filter((p) => p && p.category === 'Clothing').length;
  const sameDayCount = (products || []).filter((p) => p && p.isSameDayAvailable).length;
  const pendingInquiriesCount = (inquiries || []).filter(
    (i) => i && (i.status || 'pending') === 'pending'
  ).length;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-['Open_Sans',sans-serif]">
      {/* 1. Left Drawer Navigation (Generic Professional CMS Sidebar) */}
      <CMSSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        categories={categories}
        selectedCategoryName={selectedCategoryName}
        onSelectCategory={(name) => {
          setSelectedCategoryName(name);
          setActiveTab('categories');
        }}
        products={products}
        selectedProductCategory={selectedProductCategory}
        onSelectProductCategory={(cat) => {
          setSelectedProductCategory(cat);
          setActiveTab('products');
        }}
        onOpenAddCategoryModal={() => {
          setActiveTab('categories');
          setIsAddCatModalOpen(true);
        }}
        onOpenAddProductModal={() => {
          setActiveTab('products');
          setIsAddProductModalOpen(true);
        }}
        pendingInquiriesCount={pendingInquiriesCount}
        isOpenMobile={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header of Main Work Area */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Drawer Toggle */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              title="Open Navigation Drawer"
            >
              <List weight="bold" className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-400 hidden sm:inline">CMS Dashboard</span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <h1 className="text-sm font-black text-slate-900 capitalize">
                {activeTab === 'overview' && 'Dashboard Overview & Analytics'}
                {activeTab === 'categories' && (
                  <span>
                    Category Management{' '}
                    {selectedCategoryName && (
                      <span className="text-[#012169] font-bold">› {selectedCategoryName}</span>
                    )}
                  </span>
                )}
                {activeTab === 'products' && (
                  <span>
                    Product Catalog{' '}
                    {selectedProductCategory !== 'All' && (
                      <span className="text-[#012169] font-bold">› {selectedProductCategory}</span>
                    )}
                  </span>
                )}
                {activeTab === 'banners' && 'Hero Carousel Banners'}
                {activeTab === 'inquiries' && 'Leads & Callback Inquiries'}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            {syncNotice && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-fade-in hidden md:inline-flex items-center gap-1.5">
                <CheckCircle weight="fill" className="h-4 w-4" />
                <span>{syncNotice}</span>
              </span>
            )}

            {activeTab === 'categories' && (
              <Button
                variant="uk-blue"
                size="sm"
                onClick={() => setIsAddCatModalOpen(true)}
              >
                <FolderPlus weight="bold" className="h-3.5 w-3.5 mr-1" />
                <span>Add Category</span>
              </Button>
            )}

            {activeTab === 'products' && (
              <Button
                variant="uk-blue"
                size="sm"
                onClick={() => setIsAddProductModalOpen(true)}
              >
                <Plus weight="bold" className="h-3.5 w-3.5 mr-1" />
                <span>Add Product</span>
              </Button>
            )}

            <button
              onClick={handleSyncFirestore}
              disabled={isSyncing}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              title="Sync catalog to Firestore"
            >
              <Database weight="bold" className="h-3.5 w-3.5 text-[#012169]" />
              <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <span className="hidden sm:inline">Storefront</span>
              <ArrowSquareOut weight="bold" className="h-3.5 w-3.5" />
            </Link>
          </div>
        </header>

        {/* Scrollable Main Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {loadingData ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-xs">
              <div className="h-8 w-8 border-3 border-[#012169]/30 border-t-[#012169] rounded-full animate-spin mx-auto mb-3" />
              <span className="text-xs font-bold text-slate-500">Loading catalog data...</span>
            </div>
          ) : (
            <>
              {/* 1. Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Categories
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {categories.length}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Active in A-Z Menu</div>
                      </div>
                      <div className="h-11 w-11 rounded-xl bg-[#012169]/10 text-[#012169] flex items-center justify-center">
                        <Stack className="h-5 w-5" weight="bold" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Total Products
                        </div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {products.length}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">In Online Catalog</div>
                      </div>
                      <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Package className="h-5 w-5" weight="bold" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Same-Day Express
                        </div>
                        <div className="text-2xl font-black text-emerald-600 mt-1">
                          {sameDayCount}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">London Dispatch</div>
                      </div>
                      <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Lightning className="h-5 w-5" weight="fill" />
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

                  {/* Quick Jump Action Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setActiveTab('categories')}
                      className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#012169] transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-[#012169] text-white flex items-center justify-center">
                          <Stack weight="bold" className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-[#012169] transition-colors">
                            Manage Categories & Subcategories
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Organize your A to Z menu, upload S3 photos, and manage Best Sellers.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setActiveTab('products')}
                      className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#012169] transition-all cursor-pointer group shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                          <Package weight="bold" className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                            Manage Products & Pricing
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Add products, configure variants, turnaround times, and prices.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Categories Tab */}
              {activeTab === 'categories' && (
                <CategoryManager
                  categories={categories}
                  selectedCategoryName={selectedCategoryName}
                  onSelectCategory={(name) => setSelectedCategoryName(name)}
                  isAddModalOpen={isAddCatModalOpen}
                  onOpenAddModal={() => setIsAddCatModalOpen(true)}
                  onCloseAddModal={() => setIsAddCatModalOpen(false)}
                  onUpdateSubcategories={handleUpdateSubcategories}
                  onCreateCategory={handleCreateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onUpdateCategory={handleUpdateCategory}
                />
              )}

              {/* 3. Products Tab */}
              {activeTab === 'products' && (
                <ProductManager
                  products={products}
                  categories={categories}
                  selectedCategory={selectedProductCategory}
                  onSelectCategory={(cat) => setSelectedProductCategory(cat)}
                  isAddModalOpen={isAddProductModalOpen}
                  onOpenAddModal={() => setIsAddProductModalOpen(true)}
                  onCloseAddModal={() => setIsAddProductModalOpen(false)}
                  onCreateProduct={handleCreateProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onRefreshData={refreshData}
                />
              )}

              {/* 4. Hero Banners Tab */}
              {activeTab === 'banners' && <HeroBannerManager />}

              {/* 5. Leads / Inquiries Tab */}
              {activeTab === 'inquiries' && (
                <InquiryInbox
                  inquiries={inquiries}
                  onUpdateStatus={handleUpdateInquiryStatus}
                  onDeleteInquiry={handleDeleteInquiry}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
