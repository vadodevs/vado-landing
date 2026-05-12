import { getAdminAccessToken } from '@/lib/adminAuth';
import { getCompanyAccessToken } from '@/lib/companyAuth';
import { getDevAccessToken } from '@/lib/devAuth';
import { getRecruiterAccessToken } from '@/lib/recruiterAuth';

export type AssistantChatMessage = { role: 'user' | 'assistant'; content: string };

function getApiBaseUrl(): string {
  const primary = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const fallback = String(import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').trim();
  return (primary || fallback).replace(/\/$/, '');
}

/** Orden de preferencia según la zona del panel (evita token admin caducado tapando al reclutador activo, etc.). */
function getBearerCandidatesForAssistant(): string[] {
  if (typeof window === 'undefined') return [];
  const path = window.location.pathname;
  const admin = getAdminAccessToken();
  const rec = getRecruiterAccessToken();
  const dev = getDevAccessToken();
  const comp = getCompanyAccessToken();
  const order: Array<string | null | undefined> = path.includes('/app/recruiter')
    ? [rec, admin, dev, comp]
    : path.includes('/app/dev')
      ? [dev, admin, rec, comp]
      : path.includes('/app/company')
        ? [comp, admin, rec, dev]
        : [admin, rec, dev, comp];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of order) {
    if (typeof t !== 'string' || !t.trim()) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

/** Primer Bearer del panel según la ruta actual (compatibilidad). */
export function getAnyPanelAccessToken(): string | null {
  const c = getBearerCandidatesForAssistant();
  return c[0] ?? null;
}

export type PostAssistantChatResult =
  | { ok: true; reply: string }
  | { ok: false; reason: 'no-config' | 'no-auth' | 'http'; status?: number; message?: string };

export type InboxLeadChannel = 'whatsapp' | 'facebook' | 'instagram' | 'bot-test';

/** Bot de inbox (solo leads + registro); requiere JWT admin. */
export async function postInboxLeadAssistantChat(
  messages: AssistantChatMessage[],
  channel: InboxLeadChannel,
): Promise<PostAssistantChatResult> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  const tokens = getBearerCandidatesForAssistant();
  if (tokens.length === 0) return { ok: false, reason: 'no-auth' };
  const body = JSON.stringify({ messages, channel });
  try {
    let lastStatus = 0;
    let lastMessage = '';
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;
      const res = await fetch(`${base}/admin/assistant/inbox-lead-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; message?: string; name?: string };
      if (res.ok) {
        const reply = typeof data.reply === 'string' ? data.reply : '';
        if (!reply) return { ok: false, reason: 'http', status: res.status, message: 'Respuesta vacía' };
        return { ok: true, reply };
      }
      const fromJson =
        typeof data.message === 'string' && data.message.trim().length > 0 ? data.message.trim() : '';
      lastStatus = res.status;
      lastMessage = fromJson || res.statusText;
      if (res.status === 401 && i < tokens.length - 1) {
        continue;
      }
      let message = lastMessage;
      if (res.status === 404) {
        message =
          'No existe POST /admin/assistant/inbox-lead-chat en el servidor (404). Actualiza adminvado y revisa VITE_API_BASE_URL.';
      }
      if (res.status === 401) {
        message =
          'Sesión no válida o expirada (401). El bot de inbox solo funciona con usuario administrador del panel.';
      }
      if (res.status === 403) {
        message = 'Solo administradores pueden usar el bot de leads (403).';
      }
      return {
        ok: false,
        reason: 'http',
        status: lastStatus,
        message,
      };
    }
    return { ok: false, reason: 'http', status: lastStatus || 401, message: lastMessage || 'No autorizado' };
  } catch {
    return { ok: false, reason: 'http', message: 'Error de red' };
  }
}

export async function postAssistantChat(messages: AssistantChatMessage[]): Promise<PostAssistantChatResult> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  const tokens = getBearerCandidatesForAssistant();
  if (tokens.length === 0) return { ok: false, reason: 'no-auth' };
  const body = JSON.stringify({ messages });
  try {
    let lastStatus = 0;
    let lastMessage = '';
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]!;
      const res = await fetch(`${base}/admin/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; message?: string; name?: string };
      if (res.ok) {
        const reply = typeof data.reply === 'string' ? data.reply : '';
        if (!reply) return { ok: false, reason: 'http', status: res.status, message: 'Respuesta vacía' };
        return { ok: true, reply };
      }
      const fromJson =
        typeof data.message === 'string' && data.message.trim().length > 0 ? data.message.trim() : '';
      lastStatus = res.status;
      lastMessage = fromJson || res.statusText;
      if (res.status === 401 && i < tokens.length - 1) {
        continue;
      }
      let message = lastMessage;
      if (res.status === 404) {
        message =
          'No existe POST /admin/assistant/chat en el servidor (404). Comprueba que adminvado esté actualizado y reiniciado, y que VITE_API_BASE_URL o VITE_ADMIN_API_BASE_URL apunten al backend (p. ej. http://localhost:8000), no al puerto del front.';
      }
      if (res.status === 401) {
        message =
          'Sesión no válida o expirada para el asistente (401). Inicia sesión de nuevo en el panel (admin, reclutador, etc.). Si la lista de desarrolladores carga sin login, el asistente sí requiere JWT: entra con tu usuario del panel.';
      }
      return {
        ok: false,
        reason: 'http',
        status: lastStatus,
        message,
      };
    }
    return { ok: false, reason: 'http', status: lastStatus || 401, message: lastMessage || 'No autorizado' };
  } catch {
    return { ok: false, reason: 'http', message: 'Error de red' };
  }
}
