'use client';

import { useEffect } from 'react';
import { trackCallClick, trackWhatsAppClick, trackDirectionsClick } from '@/lib/analytics';

/**
 * P0-2: Conversion tracking for leads (Google Ads & GA4)
 * Attaches a delegated click handler to document.body to reliably capture:
 * - Phone clicks: any <a href="tel:...">
 * - WhatsApp clicks: any <a href="*wa.me*">
 * - Directions clicks: any <a href="*maps.google*"> or <a href="*google.com/maps*">
 */
export function TrackClicks() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href') || '';
      if (!href) return;

      // Determine link location / context
      const location =
        anchor.getAttribute('data-track-location') ||
        anchor.closest('header')?.tagName.toLowerCase() ||
        anchor.closest('footer')?.tagName.toLowerCase() ||
        anchor.closest('nav')?.tagName.toLowerCase() ||
        anchor.closest('[data-section]')?.getAttribute('data-section') ||
        (anchor.textContent?.trim().slice(0, 30)) ||
        'page_body';

      // 1. Phone link clicked
      if (href.startsWith('tel:')) {
        const rawPhone = href.replace(/^tel:/, '').trim();
        trackCallClick(rawPhone, location);
        return;
      }

      // 2. WhatsApp link clicked
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        trackWhatsAppClick(location);
        return;
      }

      // 3. Google Maps / Directions clicked
      if (
        href.includes('google.com/maps') ||
        href.includes('maps.google.com') ||
        href.includes('maps.app.goo.gl')
      ) {
        trackDirectionsClick(location);
        return;
      }
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleClick, { capture: true });
    };
  }, []);

  return null;
}
