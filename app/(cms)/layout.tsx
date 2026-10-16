import React from 'react';
import { AuthProvider } from '@/lib/auth-context';

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans text-[16px]">
        {children}
      </div>
    </AuthProvider>
  );
}
