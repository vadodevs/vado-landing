import type { EvolveMeetingEvent } from '@/lib/adminEvolveLeadsApi';
import { fetchCompanyLeadUpdatesMap } from '@/lib/adminWorkspaceApi';

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

export function dispatchCompanyLeadUpdatesChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(COMPANY_LEAD_UPDATES_CHANGE_EVENT));
}

export async function loadCompanyLeadUpdates(): Promise<Record<string, CompanyLeadUpdate[]>> {
  return fetchCompanyLeadUpdatesMap();
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
  update: CompanyLeadUpdate,
): Record<string, CompanyLeadUpdate[]> {
  if (!contactId.trim()) return prev;
  const list = prev[contactId] ?? [];
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

export async function loadCompanyLeadReminderCalendarEvents(opts: {
  startMs: number;
  endMs: number;
  contactDirectory?: Record<string, { name: string; email: string }>;
}): Promise<EvolveMeetingEvent[]> {
  const all = await loadCompanyLeadUpdates();
  const events: EvolveMeetingEvent[] = [];

  for (const [contactId, updates] of Object.entries(all)) {
    const directoryEntry = opts.contactDirectory?.[contactId];
    for (const update of updates) {
      if (!isCompanyLeadReminder(update)) continue;
      const ms = update.scheduledAtMs ?? 0;
      if (ms < opts.startMs || ms > opts.endMs) continue;

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
