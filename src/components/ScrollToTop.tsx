import { useEffect } from 'react';
import { useLocation } from 'wouter';

export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Repeat after drawer / overlay animations that may restore scroll position
    const timer = setTimeout(() => window.scrollTo(0, 0), 350);
    return () => clearTimeout(timer);
  }, [location]);

  return null;
}
