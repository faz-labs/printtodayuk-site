'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function ScrollHandler() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Disable automatic browser scroll restoration so pages don't stay at previous scroll offset
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch {}

    const forceScrollToTop = () => {
      // 1. Native DOM window & document reset
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 2. Lenis smooth scroll engine reset (if active)
      if ((window as any).__lenis) {
        try {
          (window as any).__lenis.scrollTo(0, { immediate: true });
        } catch {}
      }
    };

    // Execute immediately
    forceScrollToTop();

    // Execute in next animation frame
    const rAfId = requestAnimationFrame(forceScrollToTop);

    // Safety timeout to handle asynchronous content hydration / rendering
    const t1 = setTimeout(forceScrollToTop, 50);
    const t2 = setTimeout(forceScrollToTop, 150);

    return () => {
      cancelAnimationFrame(rAfId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, searchParams]);

  return null;
}

export function ScrollToTop() {
  return (
    <Suspense fallback={null}>
      <ScrollHandler />
    </Suspense>
  );
}
