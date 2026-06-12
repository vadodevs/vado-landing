import { useEffect } from 'react';

/** Intervalo de auto-refresh en Leads Evolve (panel abierto). */
export const EVOLVE_LEADS_AUTO_SYNC_MS = 20 * 60 * 1000;

export function formatEvolveLastSync(at: Date, locale: string): string {
  const lang = locale.startsWith('en') ? 'en-US' : 'es-MX';
  return new Intl.DateTimeFormat(lang, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(at);
}

/** Dispara `onSync` cada 20 min mientras el componente está montado. */
export function useEvolveLeadsAutoSync(onSync: () => void | Promise<void>): void {
  useEffect(() => {
    const tick = () => void onSync();
    const id = window.setInterval(tick, EVOLVE_LEADS_AUTO_SYNC_MS);
    return () => window.clearInterval(id);
  }, [onSync]);
}
