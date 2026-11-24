'use client';

import { useEffect } from 'react';
import { trackCallClick, trackWhatsAppClick, trackDirectionsClick } from '@/lib/analytics';

declare global {
  interface Window {
    __trackClicksBound?: boolean;
  }
}

/**
 * Delegated click listener for phone, WhatsApp, and Google Maps clicks.
 * Registered only once across the entire application (guarded against React StrictMode & multiple mounts).
 *
 * Each click fires:
 * - tel: -> exactly one 'phone_click' and one 'click_call'
 * - wa.me/ -> exactly one 'whatsapp_click' and one 'click_whatsapp'
 * - maps -> exactly one 'directions_click'
 *
 * Reads link location from `data-loc` attribute on the link or closest ancestor. Never sends 'unknown'.
 */
export function TrackClicks() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Singleton guard: ensure listener is bound exactly once
    if (window.__trackClicksBound) return;
    window.__trackClicksBound = true;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href') || '';
      if (!href) return;

      // Extract location from data-loc (or intelligent contextual fallback) - never 'unknown'
      const loc =
        anchor.getAttribute('data-loc') ||
        anchor.getAttribute('data-track-location') ||
        anchor.closest('[data-loc]')?.getAttribute('data-loc') ||
        (anchor.closest('header') ? 'header' : '') ||
        (anchor.closest('footer') ? 'footer' : '') ||
        (anchor.closest('nav') ? 'navbar' : '') ||
        'storefront';

      // 1. Phone link clicked
      if (href.startsWith('tel:')) {
        const rawPhone = href.replace(/^tel:/, '').replace(/\s+/g, '').trim();
        trackCallClick(rawPhone, loc);
        return;
      }

      // 2. WhatsApp link clicked
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        trackWhatsAppClick(loc);
        return;
      }

      // 3. Google Maps / Directions clicked
      if (
        href.includes('google.com/maps') ||
        href.includes('maps.google.com') ||
        href.includes('maps.app.goo.gl')
      ) {
        trackDirectionsClick(loc);
        return;
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
  }, []);

  return null;
}
