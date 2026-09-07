import React from 'react';
import { TopBar } from '@/components/storefront/TopBar';
import { Navbar } from '@/components/storefront/Navbar';
import { Footer } from '@/components/storefront/Footer';
import { CallMeProvider } from '@/components/storefront/CallMeContext';
import { CallMeModal } from '@/components/storefront/CallMeModal';
import { FloatingWhatsApp } from '@/components/storefront/FloatingWhatsApp';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CallMeProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 relative">
        <TopBar />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <CallMeModal />
        <FloatingWhatsApp />
      </div>
    </CallMeProvider>
  );
}
