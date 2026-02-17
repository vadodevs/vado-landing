import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Hace scroll al inicio de la página cuando cambia la ruta.
 */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location]);

  return null;
}
