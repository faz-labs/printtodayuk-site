'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { WhatsappLogo } from '@phosphor-icons/react';

export function FloatingWhatsApp() {
  const phoneNumber = '+44 7969 559746';
  const cleanNumber = '447969559746';
  const defaultMessage = encodeURIComponent(
    'Hello Print Today UK, I would like to inquire about same-day printing/clothing services.'
  );
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center group">
      {/* Tooltip Label on Hover */}
      <span className="hidden sm:inline-block mr-3 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-bold shadow-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-x-2 group-hover:translate-x-0">
        Chat on WhatsApp
      </span>

      {/* Floating Action Button */}
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with us on WhatsApp (${phoneNumber})`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl transition-shadow duration-300 shadow-[#25D366]/40 cursor-pointer"
      >
        {/* Pulse Ripple Effect */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-75 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <WhatsappLogo weight="fill" className="w-8 h-8 relative z-10 drop-shadow-md text-white" />
      </motion.a>
    </div>
  );
}
