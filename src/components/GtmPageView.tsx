import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { pushVirtualPageView } from '@/lib/gtm';

/**
 * Pushes a GTM dataLayer event on client-side route changes.
 * Mount after the route tree so PageMeta can update document.title first.
 * Initial full-page load is handled by GTM; subsequent navigations use virtual_pageview.
 */
export function GtmPageView() {
  const [location] = useLocation();
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    pushVirtualPageView(location);
  }, [location]);

  return null;
}
