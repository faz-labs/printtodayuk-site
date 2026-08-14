'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Printer,
  Package,
  Layers,
  PhoneCall,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface CMSNavbarProps {
  activeTab: 'products' | 'categories' | 'inquiries';
  onTabChange: (tab: 'products' | 'categories' | 'inquiries') => void;
  pendingInquiriesCount?: number;
}

export function CMSNavbar({
  activeTab,
  onTabChange,
  pendingInquiriesCount = 0,
}: CMSNavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-[#4a0e35] text-white border-b border-[#360826] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-rose-300">
                <Printer className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-tight text-white leading-none">
                  PRINT<span className="text-rose-400">TODAY</span>
                </span>
                <span className="text-[10px] font-bold text-rose-200/70 tracking-widest uppercase mt-0.5">
                  CMS Administration
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-500/30">
              <Shield className="h-3 w-3" />
              <span>Admin Portal</span>
            </span>
          </div>

          {/* Center Tabs */}
          <nav className="flex items-center gap-1 bg-[#360826]/70 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => onTabChange('products')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-white text-[#4a0e35] shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              <span>Products</span>
            </button>

            <button
              onClick={() => onTabChange('categories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-white text-[#4a0e35] shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Categories</span>
            </button>

            <button
              onClick={() => onTabChange('inquiries')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'inquiries'
                  ? 'bg-white text-[#4a0e35] shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Leads</span>
              {pendingInquiriesCount > 0 && (
                <span className="h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {pendingInquiriesCount}
                </span>
              )}
            </button>
          </nav>

          {/* User profile & Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1 text-xs font-semibold text-rose-200 hover:text-white transition-colors"
            >
              <span>View Storefront</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <div className="h-4 w-px bg-white/20 hidden md:block" />

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 hidden lg:inline-block truncate max-w-[160px]">
                {user?.email || 'admin@printtodayuk.com'}
              </span>

              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white text-xs font-bold transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
