import { useEffect } from 'react';

interface PageTitleProps {
  /** Título que se mostrará en la pestaña del navegador */
  title: string;
}

/**
 * Componente que actualiza el título de la pestaña del navegador.
 * Úsalo en cada página para mostrar un título descriptivo en las tabs.
 */
export function PageTitle({ title }: PageTitleProps) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return null;
}
