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
 * P0-2: Dedicated helper for Phone call click events
 */
export function trackCallClick(phoneNumber: string = '03300103521', linkLocation: string = 'unknown') {
  trackConversion('phone_click', {
    phone_number: phoneNumber.replace(/[^0-9]/g, ''),
    link_location: linkLocation,
    event_category: 'contact',
    event_label: phoneNumber,
  });
  // Also keep backward-compatible legacy event
  trackConversion('click_call', {
    event_category: 'contact',
    event_label: phoneNumber,
  });
}

/**
 * P0-2: Dedicated helper for WhatsApp click events
 */
export function trackWhatsAppClick(linkLocation: string = 'unknown') {
  trackConversion('whatsapp_click', {
    link_location: linkLocation,
    event_category: 'contact',
    event_label: linkLocation,
  });
  // Also keep backward-compatible legacy event
  trackConversion('click_whatsapp', {
    event_category: 'contact',
    event_label: linkLocation,
  });
}

/**
 * P0-2: Dedicated helper for Google Maps / Directions click events
 */
export function trackDirectionsClick(linkLocation: string = 'unknown') {
  trackConversion('directions_click', {
    link_location: linkLocation,
    event_category: 'navigation',
    event_label: linkLocation,
  });
}

/**
 * Dedicated helper for Email mailto clicks
 */
export function trackEmailClick(email: string = 'artwork@printtodayuk.com', linkLocation: string = 'unknown') {
  trackConversion('click_email', {
    link_location: linkLocation,
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
