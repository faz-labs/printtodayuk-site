'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { CategoryConfig, Product } from '@/lib/types';
import {
  Printer,
  Package,
  Stack,
  PhoneCall,
  SignOut,
  ArrowSquareOut,
  ShieldCheck,
  Images,
  Plus,
  Flame,
  Lightning,
  SquaresFour,
  CaretRight,
  CaretDown,
  X,
  MagnifyingGlass,
} from '@phosphor-icons/react';

interface CMSSidebarProps {
  activeTab: 'overview' | 'products' | 'categories' | 'inquiries' | 'banners';
  onTabChange: (tab: 'overview' | 'products' | 'categories' | 'inquiries' | 'banners') => void;
  categories: CategoryConfig[];
  selectedCategoryName?: string;
  onSelectCategory: (name: string) => void;
  products: Product[];
  selectedProductCategory?: string;
  onSelectProductCategory: (category: string) => void;
  onOpenAddCategoryModal: () => void;
  onOpenAddProductModal: () => void;
  pendingInquiriesCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function CMSSidebar({
  activeTab,
  onTabChange,
  categories,
  selectedCategoryName,
  onSelectCategory,
  products,
  selectedProductCategory = 'All',
  onSelectProductCategory,
  onOpenAddCategoryModal,
  onOpenAddProductModal,
  pendingInquiriesCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}: CMSSidebarProps) {
  const { user, logout } = useAuth();
  const [categoriesExpanded, setCategoriesExpanded] = useState(true);
  const [productsExpanded, setProductsExpanded] = useState(true);
  const [categorySearch, setCategorySearch] = useState('');

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const sameDayProductsCount = products.filter((p) => p.isSameDayAvailable).length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#00143d] text-slate-100 border-r border-[#002266] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:static lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#002266] bg-[#000f30]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <Printer weight="bold" className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-white leading-none">
                PRINT<span className="text-[#C8102E]">TODAY</span>
              </span>
              <span className="text-[10px] font-bold text-blue-300/80 tracking-widest uppercase mt-0.5">
                Generic CMS Admin
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              title="Close drawer"
            >
              <X weight="bold" className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {/* Main Group */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-blue-300/50 mb-1.5">
              Dashboard
            </div>
            <button
              onClick={() => {
                onTabChange('overview');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <SquaresFour weight="bold" className="h-4 w-4 shrink-0 text-blue-400" />
              <span>Overview & Metrics</span>
            </button>
          </div>

          {/* Categories List Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-3 mb-1">
              <button
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-300/50 hover:text-blue-200 transition-colors cursor-pointer"
              >
                {categoriesExpanded ? (
                  <CaretDown weight="bold" className="h-3 w-3" />
                ) : (
                  <CaretRight weight="bold" className="h-3 w-3" />
                )}
                <span>Categories</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/10 text-white text-[9px]">
                  {categories.length}
                </span>
              </button>

              <button
                onClick={() => {
                  onTabChange('categories');
                  onOpenAddCategoryModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:text-white bg-white/5 hover:bg-blue-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                title="Add New Category"
              >
                <Plus weight="bold" className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>

            {categoriesExpanded && (
              <div className="space-y-1 pl-1">
                {/* View All Categories Tab */}
                <button
                  onClick={() => {
                    onTabChange('categories');
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'categories' && !selectedCategoryName
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Stack weight="bold" className="h-3.5 w-3.5 text-blue-300" />
                    <span>All Categories</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {categories.length}
                  </span>
                </button>

                {/* Filter input if many categories */}
                {categories.length > 6 && (
                  <div className="px-2 py-1">
                    <div className="relative">
                      <MagnifyingGlass
                        weight="bold"
                        className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400"
                      />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search category list..."
                        className="w-full h-7 pl-7 pr-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-400"
                      />
                    </div>
                  </div>
                )}

                {/* Categories Scrollable List in Drawer */}
                <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                  {filteredCategories.map((cat) => {
                    const isSelected =
                      activeTab === 'categories' &&
                      selectedCategoryName?.toLowerCase() === cat.name.toLowerCase();

                    return (
                      <button
                        key={cat.name}
                        onClick={() => {
                          onTabChange('categories');
                          onSelectCategory(cat.name);
                          if (onCloseMobile) onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer group text-left ${
                          isSelected
                            ? 'bg-[#012169] text-white font-bold border-l-3 border-[#C8102E] pl-2 shadow-xs'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {cat.isBestSeller ? (
                            <Flame weight="fill" className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400/60 shrink-0" />
                          )}
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 group-hover:text-slate-200 shrink-0 ml-1.5">
                          {cat.subcategories?.length || 0}
                        </span>
                      </button>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div className="px-3 py-2 text-[11px] text-slate-400 italic">
                      No categories match search.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Products List Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-3 mb-1">
              <button
                onClick={() => setProductsExpanded(!productsExpanded)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-300/50 hover:text-blue-200 transition-colors cursor-pointer"
              >
                {productsExpanded ? (
                  <CaretDown weight="bold" className="h-3 w-3" />
                ) : (
                  <CaretRight weight="bold" className="h-3 w-3" />
                )}
                <span>Products</span>
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/10 text-white text-[9px]">
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => {
                  onTabChange('products');
                  onOpenAddProductModal();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-300 hover:text-white bg-white/5 hover:bg-blue-600 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                title="Add New Product"
              >
                <Plus weight="bold" className="h-3 w-3" />
                <span>Add</span>
              </button>
            </div>

            {productsExpanded && (
              <div className="space-y-0.5 pl-1">
                {/* All Products Item */}
                <button
                  onClick={() => {
                    onTabChange('products');
                    onSelectProductCategory('All');
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'products' && selectedProductCategory === 'All'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package weight="bold" className="h-3.5 w-3.5 text-blue-300" />
                    <span>All Products</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {products.length}
                  </span>
                </button>

                {/* Same-Day Filter Item */}
                <button
                  onClick={() => {
                    onTabChange('products');
                    onSelectProductCategory('All');
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Lightning weight="fill" className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Same-Day Express</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold">
                    {sameDayProductsCount}
                  </span>
                </button>

                {/* Product Categories Quick Filter List */}
                <div className="pt-1.5">
                  <div className="px-2.5 pb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Filter by Category
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {categories.slice(0, 8).map((cat) => {
                      const count = products.filter(
                        (p) =>
                          p.category.toLowerCase() === cat.name.toLowerCase() ||
                          p.subcategory.toLowerCase() === cat.name.toLowerCase()
                      ).length;
                      const isFilterActive =
                        activeTab === 'products' &&
                        selectedProductCategory.toLowerCase() === cat.name.toLowerCase();

                      return (
                        <button
                          key={cat.name}
                          onClick={() => {
                            onTabChange('products');
                            onSelectProductCategory(cat.name);
                            if (onCloseMobile) onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer text-left ${
                            isFilterActive
                              ? 'bg-blue-900/60 text-blue-200 font-bold'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Marketing & Store Modules */}
          <div className="space-y-1">
            <div className="px-3 text-[10px] font-black uppercase tracking-wider text-blue-300/50 mb-1.5">
              Marketing & Store
            </div>

            <button
              onClick={() => {
                onTabChange('banners');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'banners'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Images weight="bold" className="h-4 w-4 text-purple-300" />
              <span>Hero Banners</span>
            </button>

            <button
              onClick={() => {
                onTabChange('inquiries');
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PhoneCall weight="bold" className="h-4 w-4 text-rose-300" />
                <span>Leads & Inquiries</span>
              </div>
              {pendingInquiriesCount > 0 && (
                <span className="h-4.5 min-w-[18px] px-1 rounded-full bg-[#C8102E] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {pendingInquiriesCount}
                </span>
              )}
            </button>
          </div>

          {/* External Links */}
          <div className="space-y-1 pt-2 border-t border-white/10">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-blue-200 hover:text-white hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-2">
                <ArrowSquareOut weight="bold" className="h-4 w-4" />
                <span>View Storefront</span>
              </div>
              <span className="text-[10px] text-blue-300/60">↗</span>
            </Link>
          </div>
        </div>

        {/* User Card & Sign Out (Sticky Bottom) */}
        <div className="p-3 border-t border-[#002266] bg-[#000f30]/90">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 truncate">
              <div className="h-8 w-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate leading-tight">
                  {user?.email || 'admin@printtodayuk.com'}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Master Admin</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-rose-600 transition-colors cursor-pointer shrink-0 ml-1"
              title="Sign Out"
            >
              <SignOut weight="bold" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
