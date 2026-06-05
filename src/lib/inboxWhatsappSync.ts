import { WHATSAPP_INBOX_STALE_CACHE_MS } from '@/lib/inboxWhatsappSessionCache';

/** Intervalo mínimo entre sync completos con Evolution (importación pesada). */
export const WHATSAPP_EVOLUTION_SYNC_MIN_MS = 60_000;

/** Poll de sincronización desde el teléfono (lista + mensajes recientes). */
export const WHATSAPP_PHONE_POLL_MS = 5_000;

export function shouldRunWhatsappEvolutionSync(
  lastSyncAtMs: number,
  opts?: { force?: boolean },
): boolean {
  if (opts?.force) return true;
  if (!Number.isFinite(lastSyncAtMs) || lastSyncAtMs <= 0) return true;
  return Date.now() - lastSyncAtMs >= WHATSAPP_EVOLUTION_SYNC_MIN_MS;
}

export function whatsappInboxCacheIsStale(savedAtMs: number | undefined): boolean {
  if (!Number.isFinite(savedAtMs) || !savedAtMs) return true;
  return Date.now() - savedAtMs >= WHATSAPP_INBOX_STALE_CACHE_MS;
}
