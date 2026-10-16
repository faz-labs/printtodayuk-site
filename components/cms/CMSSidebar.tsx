'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  Printer,
  Package,
  Stack,
  PhoneCall,
  SignOut,
  ArrowSquareOut,
  Images,
  SquaresFour,
  X,
  Layout,
  House,
} from '@phosphor-icons/react';

export type CMSTab = 'overview' | 'categories' | 'products' | 'sections' | 'banners' | 'inquiries';

interface CMSSidebarProps {
  activeTab: CMSTab;
  onTabChange: (tab: CMSTab) => void;
  categoriesCount?: number;
  productsCount?: number;
  sectionsCount?: number;
  pendingInquiriesCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function CMSSidebar({
  activeTab,
  onTabChange,
  categoriesCount = 0,
  productsCount = 0,
  sectionsCount = 0,
  pendingInquiriesCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}: CMSSidebarProps) {
  const { user, logout } = useAuth();

  const navItems = [
    {
      id: 'overview' as const,
      label: 'Overview & Metrics',
      icon: SquaresFour,
      badge: null,
    },
    {
      id: 'categories' as const,
      label: 'Categories',
      icon: Stack,
      badge: categoriesCount,
    },
    {
      id: 'products' as const,
      label: 'Products Catalog',
      icon: Package,
      badge: productsCount,
    },
    {
      id: 'sections' as const,
      label: 'Landing Sections',
      icon: Layout,
      badge: sectionsCount > 0 ? sectionsCount : null,
    },
    {
      id: 'banners' as const,
      label: 'Hero Banners',
      icon: Images,
      badge: null,
    },
    {
      id: 'inquiries' as const,
      label: 'Leads & Inquiries',
      icon: PhoneCall,
      badge: pendingInquiriesCount,
      badgeColor: 'bg-[#C8102E] text-white',
    },
  ];

  const handleSelectTab = (tab: CMSTab) => {
    onTabChange(tab);
    if (onCloseMobile) onCloseMobile();
  };

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
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#00143d] text-slate-100 border-r border-[#002266] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 font-sans ${
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
                CMS Dashboard
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              title="Close drawer"
            >
              <X weight="bold" className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Page Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 text-[10px] font-black uppercase tracking-wider text-blue-300/50 mb-2">
            Navigation Pages
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    weight={isActive ? 'fill' : 'bold'}
                    className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-300'}`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 text-blue-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Storefront Link */}
          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/"
              target="_blank"
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-blue-200 hover:text-white hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <ArrowSquareOut weight="bold" className="h-4.5 w-4.5 text-blue-400" />
                <span>View Storefront</span>
              </div>
              <span className="text-xs text-blue-300/60 font-mono">↗</span>
            </Link>
          </div>
        </div>

        {/* User Profile & Sign Out Footer */}
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
                  <span>Admin Session</span>
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
