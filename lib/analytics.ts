// Google Analytics (GA4: G-0FWH5K8KNN) & Google Ads (AW-819537929) Conversion Tracking

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type ConversionEventName =
  | 'generate_lead'
  | 'phone_click'
  | 'whatsapp_click'
  | 'directions_click'
  | 'click_call'
  | 'click_whatsapp'
  | 'click_email'
  | 'purchase';

export interface ConversionEventParams {
  event_category?: string;
  event_label?: string;
  form_name?: string;
  phone_number?: string;
  link_location?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  [key: string]: any;
}

/**
 * Fires a conversion event to GA4 and Google Ads dataLayer via gtag
 */
export function trackConversion(
  eventName: string,
  params: ConversionEventParams = {}
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return;
  }

  try {
    window.gtag('event', eventName, {
      send_to: ['G-0FWH5K8KNN', 'AW-819537929'],
      ...params,
    });
  } catch (err) {
    console.warn(`[Analytics] Failed to track ${eventName}:`, err);
  }
}

/**
 * P0-2: Dedicated helper for Lead Generation (Call Me callback or Upload order)
 */
export function trackGenerateLead(formName: 'callback' | 'upload_order' | string, extra?: Record<string, any>) {
  trackConversion('generate_lead', {
    form_name: formName,
    event_category: 'lead',
    event_label: formName,
    ...extra,
  });
}

/**
 * Dedicated helper for Phone call click events (delegated listener)
 */
export function trackCallClick(phoneNumber: string = '03300103521', linkLocation: string = 'storefront') {
  const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '') || '03300103521';
  const loc = linkLocation || 'storefront';
  trackConversion('phone_click', {
    phone_number: cleanPhone,
    link_location: loc,
  });
  trackConversion('click_call', {
    phone_number: cleanPhone,
    link_location: loc,
    event_category: 'contact',
    event_label: cleanPhone,
  });
}

/**
 * Dedicated helper for WhatsApp click events (delegated listener)
 */
export function trackWhatsAppClick(linkLocation: string = 'storefront') {
  const loc = linkLocation || 'storefront';
  trackConversion('whatsapp_click', {
    link_location: loc,
  });
  trackConversion('click_whatsapp', {
    link_location: loc,
    event_category: 'contact',
    event_label: loc,
  });
}

/**
 * Dedicated helper for Google Maps / Directions click events (delegated listener)
 */
export function trackDirectionsClick(linkLocation: string = 'contact_page') {
  const loc = linkLocation || 'contact_page';
  trackConversion('directions_click', {
    link_location: loc,
    event_category: 'navigation',
    event_label: loc,
  });
}

/**
 * Dedicated helper for Email mailto clicks
 */
export function trackEmailClick(email: string = 'artwork@printtodayuk.com', linkLocation: string = 'storefront') {
  const loc = linkLocation || 'storefront';
  trackConversion('click_email', {
    link_location: loc,
    event_category: 'contact',
    event_label: email,
  });
}

/**
 * Dedicated helper for Form Lead Submissions
 */
export function trackFormSubmission(formName: string, details?: Record<string, any>) {
  trackGenerateLead(formName, details);
}
