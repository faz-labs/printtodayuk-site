'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import {
  Printer,
  Lock,
  Envelope,
  Eye,
  EyeSlash,
  ArrowRight,
  WarningCircle,
} from '@phosphor-icons/react';

export default function CMSLoginPage() {
  const router = useRouter();
  const { user, login, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // If authenticated, redirect to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/cms/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      router.push('/cms/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-b from-slate-950 via-[#011640] to-[#000d2b] text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C8102E]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white text-slate-900 rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-[#012169] to-[#0B2559] flex items-center justify-center text-white shadow-lg shadow-[#012169]/30 mb-4">
            <Printer className="h-7 w-7 text-red-300" />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            PRINT<span className="text-[#012169]">TODAY</span> CMS
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Administrative portal for catalog management, pricing, and customer inquiries.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-start gap-2">
            <WarningCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" weight="bold" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourdomain.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all"
              />
              <Envelope className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" weight="bold" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-11 pl-10 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" weight="bold" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <EyeSlash className="h-4 w-4" weight="bold" />
                ) : (
                  <Eye className="h-4 w-4" weight="bold" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="uk-blue"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        {/* Back to storefront link */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-center">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
