import { adminAuthorizedFetch, getAdminAccessToken } from '@/lib/adminAuth';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

export type GoogleServiceId = 'gmail' | 'calendar';

export type GoogleIntegrationStatus = {
  configured: boolean;
  gmail: { connected: boolean; email: string | null };
  calendar: { connected: boolean; email: string | null };
};

export type AdminGoogleResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: 'no-config' | 'no-auth' | 'http'; message?: string };

async function adminGoogleRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<AdminGoogleResult<T>> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  if (!getAdminAccessToken()) return { ok: false, reason: 'no-auth' };

  try {
    const res = await adminAuthorizedFetch(`${base}${path}`, init);
    if (!res) return { ok: false, reason: 'no-auth' };
    if (!res.ok) {
      let message: string | undefined;
      try {
        const err = (await res.json()) as { message?: string };
        message = err.message;
      } catch {
        message = undefined;
      }
      return { ok: false, reason: 'http', message };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, reason: 'http' };
  }
}

export async function fetchGoogleIntegrationStatus(): Promise<
  AdminGoogleResult<GoogleIntegrationStatus>
> {
  return adminGoogleRequest<GoogleIntegrationStatus>('/integrations/google/status');
}

export async function startGoogleConnect(
  service: GoogleServiceId,
): Promise<AdminGoogleResult<{ url: string }>> {
  return adminGoogleRequest<{ url: string }>(
    `/integrations/google/auth-url?service=${encodeURIComponent(service)}`,
  );
}

export async function disconnectGoogleIntegration(
  service: GoogleServiceId,
): Promise<AdminGoogleResult<{ disconnected: boolean }>> {
  return adminGoogleRequest<{ disconnected: boolean }>(
    `/integrations/google/disconnect?service=${encodeURIComponent(service)}`,
    { method: 'POST' },
  );
}

export type CalendarEventSummary = {
  id: string;
  summary: string | null;
  description: string | null;
  start: string | null;
  end: string | null;
  htmlLink: string | null;
  status: string | null;
};

export async function fetchCalendarEvents(params?: {
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
}): Promise<AdminGoogleResult<{ events: CalendarEventSummary[] }>> {
  const search = new URLSearchParams();
  if (params?.timeMin) search.set('timeMin', params.timeMin);
  if (params?.timeMax) search.set('timeMax', params.timeMax);
  if (params?.maxResults != null) search.set('maxResults', String(params.maxResults));
  const qs = search.toString();
  return adminGoogleRequest<{ events: CalendarEventSummary[] }>(
    `/integrations/google/calendar/events${qs ? `?${qs}` : ''}`,
  );
}

export async function createCalendarEvent(body: {
  summary: string;
  description?: string;
  start: string;
  end: string;
  timeZone?: string;
}): Promise<AdminGoogleResult<{ ok: boolean; id: string | null; htmlLink: string | null }>> {
  return adminGoogleRequest<{ ok: boolean; id: string | null; htmlLink: string | null }>(
    '/integrations/google/calendar/events',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
}
