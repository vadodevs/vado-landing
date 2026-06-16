import type { EvolveMeetingEvent } from '@/lib/adminEvolveLeadsApi';

const STORAGE_KEY = 'vado-company-lead-updates';

export const COMPANY_LEAD_UPDATES_CHANGE_EVENT = 'vado-company-lead-updates-change';

export type CompanyLeadUpdateKind = 'note' | 'reminder';

export type CompanyLeadUpdate = {
  id: string;
  body: string;
  createdAtMs: number;
  kind?: CompanyLeadUpdateKind;
  reminderCode?: string;
  scheduledAtMs?: number;
  contactName?: string;
  contactEmail?: string;
};

function normalizeUpdate(row: CompanyLeadUpdate): CompanyLeadUpdate | null {
  const body = row.body.trim();
  if (!body) return null;
  const kind = row.kind === 'reminder' ? 'reminder' : 'note';
  if (kind === 'reminder') {
    if (typeof row.scheduledAtMs !== 'number' || !Number.isFinite(row.scheduledAtMs)) return null;
    return {
      id: row.id,
      body,
      createdAtMs: row.createdAtMs,
      kind: 'reminder',
      reminderCode: row.reminderCode?.trim() || undefined,
      scheduledAtMs: row.scheduledAtMs,
      contactName: row.contactName?.trim() || undefined,
      contactEmail: row.contactEmail?.trim() || undefined,
    };
  }
  return {
    id: row.id,
    body,
    createdAtMs: row.createdAtMs,
    kind: 'note',
  };
}

function isStoredUpdate(row: unknown): row is CompanyLeadUpdate {
  return (
    typeof row === 'object' &&
    row !== null &&
    typeof (row as CompanyLeadUpdate).id === 'string' &&
    typeof (row as CompanyLeadUpdate).body === 'string' &&
    typeof (row as CompanyLeadUpdate).createdAtMs === 'number'
  );
}

export function loadCompanyLeadUpdates(): Record<string, CompanyLeadUpdate[]> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const out: Record<string, CompanyLeadUpdate[]> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!Array.isArray(value)) continue;
      const rows = value
        .filter(isStoredUpdate)
        .map((row) => normalizeUpdate(row))
        .filter((row): row is CompanyLeadUpdate => row !== null);
      if (rows.length > 0) out[key] = rows;
    }
    return out;
  } catch {
    return {};
  }
}

export function persistCompanyLeadUpdates(updates: Record<string, CompanyLeadUpdate[]>): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
    window.dispatchEvent(new Event(COMPANY_LEAD_UPDATES_CHANGE_EVENT));
  } catch {
    /* ignore quota / private mode */
  }
}

export function isCompanyLeadReminder(update: CompanyLeadUpdate): boolean {
  return update.kind === 'reminder' && typeof update.scheduledAtMs === 'number';
}

export function getNextReminderCode(updates: CompanyLeadUpdate[]): string {
  const count = updates.filter(isCompanyLeadReminder).length;
  return `R${count + 1}`;
}

export function getUpcomingReminder(updates: CompanyLeadUpdate[]): CompanyLeadUpdate | null {
  const now = Date.now();
  const upcoming = updates
    .filter(isCompanyLeadReminder)
    .filter((u) => (u.scheduledAtMs ?? 0) >= now)
    .sort((a, b) => (a.scheduledAtMs ?? 0) - (b.scheduledAtMs ?? 0));
  if (upcoming[0]) return upcoming[0];
  return updates.find(isCompanyLeadReminder) ?? null;
}

export function appendCompanyLeadUpdate(
  prev: Record<string, CompanyLeadUpdate[]>,
  contactId: string,
  body: string,
): Record<string, CompanyLeadUpdate[]> {
  const trimmed = body.trim();
  if (!contactId.trim() || !trimmed) return prev;
  const update: CompanyLeadUpdate = {
    id: `upd-${Date.now()}`,
    body: trimmed,
    createdAtMs: Date.now(),
    kind: 'note',
  };
  const list = prev[contactId] ?? [];
  return { ...prev, [contactId]: [update, ...list] };
}

export function appendCompanyLeadReminder(
  prev: Record<string, CompanyLeadUpdate[]>,
  contactId: string,
  scheduledAtMs: number,
  note?: string,
  contact?: { name?: string; email?: string },
): Record<string, CompanyLeadUpdate[]> {
  if (!contactId.trim() || !Number.isFinite(scheduledAtMs)) return prev;
  const list = prev[contactId] ?? [];
  const reminderCode = getNextReminderCode(list);
  const scheduledLabel = formatCompanyLeadUpdateWhen(scheduledAtMs);
  const trimmedNote = note?.trim();
  const update: CompanyLeadUpdate = {
    id: `rem-${Date.now()}`,
    kind: 'reminder',
    reminderCode,
    scheduledAtMs,
    body: trimmedNote || `Seguimiento ${reminderCode} agendado para ${scheduledLabel}`,
    createdAtMs: Date.now(),
    contactName: contact?.name?.trim() || undefined,
    contactEmail: contact?.email?.trim() || undefined,
  };
  return { ...prev, [contactId]: [update, ...list] };
}

export function formatCompanyLeadUpdateWhen(ms: number): string {
  const d = new Date(ms);
  if (!Number.isFinite(d.getTime())) return '—';
  return d.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
}

export function defaultReminderScheduleFields(): { date: string; time: string } {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return { date: `${yyyy}-${mm}-${dd}`, time: '10:00' };
}

export function loadCompanyLeadReminderCalendarEvents(opts: {
  startMs: number;
  endMs: number;
  contactDirectory?: Record<string, { name: string; email: string }>;
}): EvolveMeetingEvent[] {
  const all = loadCompanyLeadUpdates();
  const events: EvolveMeetingEvent[] = [];

  for (const [contactId, updates] of Object.entries(all)) {
    const directoryEntry = opts.contactDirectory?.[contactId];
    for (const update of updates) {
      if (!isCompanyLeadReminder(update)) continue;
      const ms = update.scheduledAtMs ?? 0;
      if (ms < opts.startMs || ms >= opts.endMs) continue;

      const contactName =
        update.contactName?.trim() || directoryEntry?.name?.trim() || 'Sin nombre';
      const contactEmail =
        update.contactEmail?.trim() || directoryEntry?.email?.trim() || '—';
      const code = update.reminderCode ?? 'R?';

      events.push({
        id: update.id,
        contactId,
        contactName,
        contactEmail,
        title: `${code} · ${update.body}`,
        startTime: new Date(ms).toISOString(),
        startTimeMs: ms,
        endTime: null,
        meetingLink: null,
        status: 'scheduled',
        source: 'company',
        reminderCode: code,
      });
    }
  }

  return events.sort((a, b) => a.startTimeMs - b.startTimeMs);
}
