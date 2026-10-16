'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { WarningCircle, SignOut, ArrowCounterClockwise, Trash } from '@phosphor-icons/react';

export default function CMSErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    console.error('CMS Error Boundary caught an exception:', error);
  }, [error]);

  const handleSignOut = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('print_today_cms_user');
        document.cookie = 'cms_session=; path=/; max-age=0; SameSite=Lax';
      }
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      window.location.href = '/cms/login';
    }
  };

  const handleClearCacheAndReload = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('print_today_categories');
        localStorage.removeItem('print_today_categories_initialized');
        localStorage.removeItem('print_today_products');
        localStorage.removeItem('print_today_deleted_categories');
      } catch {}
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-950 via-[#011640] to-[#000d2b] text-white p-4 font-sans">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <WarningCircle weight="bold" className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-white">CMS Encountered an Issue</h1>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {error?.message || 'A temporary rendering or data sync exception occurred while loading the dashboard.'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 font-mono text-left max-h-28 overflow-y-auto break-all">
          {error?.stack?.slice(0, 300) || error?.message || 'Unknown error'}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
          >
            <ArrowCounterClockwise weight="bold" className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleClearCacheAndReload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Trash weight="bold" className="h-4 w-4 text-amber-400" />
            <span>Clear Local Cache</span>
          </button>

          <button
            onClick={handleSignOut}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-rose-600/30"
          >
            <SignOut weight="bold" className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
