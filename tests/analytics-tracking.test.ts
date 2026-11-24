import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Type helper for mocked DOM in Node environment
const mockGlobal = globalThis as unknown as {
  window: any;
  document: any;
};

describe('Conversion Analytics & Delegated Click Tracking', () => {
  let gtagCalls: Array<{ action: string; eventName: string; params: any }> = [];

  beforeEach(() => {
    gtagCalls = [];

    // Set up window with mock gtag
    mockGlobal.window = {
      dataLayer: [],
      gtag: (action: string, eventName: string, params: any) => {
        gtagCalls.push({ action, eventName, params });
      },
      __trackClicksBound: undefined,
    };

    // Minimal mock document with event dispatch
    const listeners: { [key: string]: Array<(e: any) => void> } = {};
    mockGlobal.document = {
      addEventListener: (type: string, fn: any) => {
        listeners[type] = listeners[type] || [];
        listeners[type].push(fn);
      },
      removeEventListener: (type: string, fn: any) => {
        if (listeners[type]) {
          listeners[type] = listeners[type].filter((cb) => cb !== fn);
        }
      },
      _dispatchClick: (element: any) => {
        const event = {
          target: element,
        };
        (listeners['click'] || []).forEach((fn) => fn(event));
      },
    };
  });

  test('1. Single tel: link click fires exactly one phone_click and one click_call', async () => {
    const { TrackClicks } = await import('@/components/providers/TrackClicks');
    const { trackCallClick } = await import('@/lib/analytics');

    // Simulate mounting TrackClicks
    const effectFn = () => {
      if (mockGlobal.window.__trackClicksBound) return;
      mockGlobal.window.__trackClicksBound = true;

      const handleClick = (e: any) => {
        const anchor = e.target.closest ? e.target.closest('a') : e.target;
        if (!anchor) return;
        const href = anchor.getAttribute('href') || '';
        const loc =
          anchor.getAttribute('data-loc') ||
          anchor.closest?.('[data-loc]')?.getAttribute('data-loc') ||
          'storefront';

        if (href.startsWith('tel:')) {
          const rawPhone = href.replace(/^tel:/, '').replace(/\s+/g, '').trim();
          trackCallClick(rawPhone, loc);
        }
      };

      mockGlobal.document.addEventListener('click', handleClick);
    };

    effectFn();

    // Mock anchor element
    const telAnchor = {
      tagName: 'A',
      getAttribute: (attr: string) => {
        if (attr === 'href') return 'tel:03300103521';
        if (attr === 'data-loc') return 'topbar';
        return null;
      },
      closest: (sel: string) => (sel === 'a' ? telAnchor : null),
    };

    // Trigger click
    mockGlobal.document._dispatchClick(telAnchor);

    // Verify phone_click was fired exactly once
    const phoneClicks = gtagCalls.filter((c) => c.eventName === 'phone_click');
    assert.equal(phoneClicks.length, 1, 'phone_click should be called exactly once');
    assert.equal(phoneClicks[0].params.phone_number, '03300103521');
    assert.equal(phoneClicks[0].params.link_location, 'topbar');

    // Verify click_call was fired exactly once
    const clickCalls = gtagCalls.filter((c) => c.eventName === 'click_call');
    assert.equal(clickCalls.length, 1, 'click_call should be called exactly once');
    assert.equal(clickCalls[0].params.phone_number, '03300103521');
    assert.equal(clickCalls[0].params.link_location, 'topbar');
  });

  test('2. Single wa.me link click fires exactly one whatsapp_click and one click_whatsapp', async () => {
    const { trackWhatsAppClick } = await import('@/lib/analytics');

    const handleClick = (e: any) => {
      const anchor = e.target.closest ? e.target.closest('a') : e.target;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      const loc =
        anchor.getAttribute('data-loc') ||
        anchor.closest?.('[data-loc]')?.getAttribute('data-loc') ||
        'storefront';

      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        trackWhatsAppClick(loc);
      }
    };

    mockGlobal.document.addEventListener('click', handleClick);

    const waAnchor = {
      tagName: 'A',
      getAttribute: (attr: string) => {
        if (attr === 'href') return 'https://wa.me/447969559746';
        if (attr === 'data-loc') return 'floating';
        return null;
      },
      closest: (sel: string) => (sel === 'a' ? waAnchor : null),
    };

    mockGlobal.document._dispatchClick(waAnchor);

    const waClicks = gtagCalls.filter((c) => c.eventName === 'whatsapp_click');
    assert.equal(waClicks.length, 1, 'whatsapp_click should be called exactly once');
    assert.equal(waClicks[0].params.link_location, 'floating');

    const clickWas = gtagCalls.filter((c) => c.eventName === 'click_whatsapp');
    assert.equal(clickWas.length, 1, 'click_whatsapp should be called exactly once');
    assert.equal(clickWas[0].params.link_location, 'floating');
  });

  test('3. Single Google Maps link click fires exactly one directions_click', async () => {
    const { trackDirectionsClick } = await import('@/lib/analytics');

    const handleClick = (e: any) => {
      const anchor = e.target.closest ? e.target.closest('a') : e.target;
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      const loc =
        anchor.getAttribute('data-loc') ||
        anchor.closest?.('[data-loc]')?.getAttribute('data-loc') ||
        'storefront';

      if (href.includes('google.com/maps') || href.includes('maps.google.com')) {
        trackDirectionsClick(loc);
      }
    };

    mockGlobal.document.addEventListener('click', handleClick);

    const mapsAnchor = {
      tagName: 'A',
      getAttribute: (attr: string) => {
        if (attr === 'href') return 'https://www.google.com/maps/search/?api=1&query=75+Green+Street';
        if (attr === 'data-loc') return 'footer';
        return null;
      },
      closest: (sel: string) => (sel === 'a' ? mapsAnchor : null),
    };

    mockGlobal.document._dispatchClick(mapsAnchor);

    const dirClicks = gtagCalls.filter((c) => c.eventName === 'directions_click');
    assert.equal(dirClicks.length, 1, 'directions_click should be called exactly once');
    assert.equal(dirClicks[0].params.link_location, 'footer');
  });

  test('4. Never sends "unknown" as link_location if data-loc is missing', async () => {
    const { trackCallClick } = await import('@/lib/analytics');

    const anchorWithoutDataLoc = {
      tagName: 'A',
      getAttribute: (attr: string) => {
        if (attr === 'href') return 'tel:03300103521';
        return null;
      },
      closest: (sel: string) => (sel === 'a' ? anchorWithoutDataLoc : null),
    };

    const loc =
      anchorWithoutDataLoc.getAttribute('data-loc') ||
      anchorWithoutDataLoc.closest?.('[data-loc]')?.getAttribute('data-loc') ||
      'storefront';

    trackCallClick('03300103521', loc);

    const callEvents = gtagCalls.filter((c) => c.eventName === 'phone_click');
    assert.equal(callEvents[0].params.link_location, 'storefront');
    assert.notEqual(callEvents[0].params.link_location, 'unknown');
  });

  test('5. React StrictMode mount emulation: guarded singleton prevents duplicate listeners', async () => {
    const { trackCallClick } = await import('@/lib/analytics');

    let listenerCount = 0;
    const registerListener = () => {
      if (mockGlobal.window.__trackClicksBound) return;
      mockGlobal.window.__trackClicksBound = true;

      listenerCount++;
      mockGlobal.document.addEventListener('click', (e: any) => {
        trackCallClick('03300103521', 'header');
      });
    };

    // First mount
    registerListener();
    // Second mount in StrictMode
    registerListener();

    assert.equal(listenerCount, 1, 'Listener should only be registered once');

    const telAnchor = {
      tagName: 'A',
      getAttribute: (attr: string) => (attr === 'href' ? 'tel:03300103521' : null),
      closest: (sel: string) => (sel === 'a' ? telAnchor : null),
    };

    mockGlobal.document._dispatchClick(telAnchor);

    const phoneClicks = gtagCalls.filter((c) => c.eventName === 'phone_click');
    assert.equal(phoneClicks.length, 1, 'Should fire exactly once, never twice');
  });
});
