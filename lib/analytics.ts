// Google Analytics (GA4: G-0FWH5K8KNN) & Google Ads (AW-819537929) Conversion Tracking

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export type ConversionEventName =
  | 'generate_lead'
  | 'click_call'
  | 'click_whatsapp'
  | 'click_email'
  | 'purchase';

export interface ConversionEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  [key: string]: any;
}

/**
 * Fires a conversion event to GA4 and Google Ads dataLayer via gtag
 */
export function trackConversion(
  eventName: ConversionEventName,
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
 * Dedicated helper for WhatsApp click events
 */
export function trackWhatsAppClick(label: string = 'WhatsApp Urgent Order') {
  trackConversion('click_whatsapp', {
    event_category: 'contact',
    event_label: label,
  });
}

/**
 * Dedicated helper for Phone call click events
 */
export function trackCallClick(phoneNumber: string = '0330 010 3521') {
  trackConversion('click_call', {
    event_category: 'contact',
    event_label: phoneNumber,
  });
}

/**
 * Dedicated helper for Email mailto clicks
 */
export function trackEmailClick(email: string = 'artwork@printtodayuk.com') {
  trackConversion('click_email', {
    event_category: 'contact',
    event_label: email,
  });
}

/**
 * Dedicated helper for Form Lead Submissions
 */
export function trackFormSubmission(formName: string, details?: Record<string, any>) {
  trackConversion('generate_lead', {
    event_category: 'form',
    event_label: formName,
    ...details,
  });
}
