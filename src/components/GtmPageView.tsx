import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { pushVirtualPageView } from '@/lib/gtm';


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
