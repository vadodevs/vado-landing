import type { CompanyContact } from '@/lib/companyAdminContact';
import { isCompanyLeadReminder, type CompanyLeadUpdate } from '@/lib/companyLeadUpdates';
import { isChatWidgetLeadMessage } from '@/lib/chatWidgetLead';

export type CompanyLeadActivityKind =
  | 'page_visited'
  | 'form_submitted'
  | 'contact_created'
  | 'appointment_booked'
  | 'note_added';

export type CompanyLeadActivityEvent = {
  id: string;
  kind: CompanyLeadActivityKind;
  atMs: number;
  title: string;
  source: string;
  campaign: string;
  detail?: string;
  path?: string;
};

export type CompanyLeadActivityGroup = {
  dayKey: string;
  dayLabel: string;
  events: CompanyLeadActivityEvent[];
};

function activitySource(contact: CompanyContact, isWidget: boolean): string {
  if (isWidget) return 'Widget web';
  if (contact.servicio.trim() && contact.servicio !== 'Selecciona uno...') {
    return 'Formulario de contacto';
  }
  return 'Sitio web';
}

function activityCampaign(contact: CompanyContact, isWidget: boolean): string {
  if (isWidget) return 'Companies';
  const subject = contact.servicio.trim();
  if (subject && subject !== 'Selecciona uno...') return subject;
  return 'Contacto general';
}

function dayKeyLocal(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function formatActivityDayLabel(ms: number, now = Date.now()): string {
  const d = new Date(ms);
  const today = new Date(now);
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startEvent = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diffDays = Math.round((startToday - startEvent) / 86_400_000);

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  }).format(d);
}

export function formatActivityWhen(ms: number, now = Date.now()): string {
  const day = formatActivityDayLabel(ms, now);
  const time = new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(ms));

  if (day === 'Hoy') return `Hoy a las ${time}`;
  if (day === 'Ayer') return `Ayer a las ${time}`;
  return `${day} a las ${time}`;
}

export function getActivityTimezoneLabel(): string {
  try {
    const parts = new Intl.DateTimeFormat('es-MX', { timeZoneName: 'short' }).formatToParts(new Date());
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? 'local';
  } catch {
    return 'local';
  }
}

export function buildCompanyLeadActivityEvents(
  contact: CompanyContact,
  updates: CompanyLeadUpdate[],
  opts?: { isWidget?: boolean },
): CompanyLeadActivityEvent[] {
  const isWidget =
    opts?.isWidget === true || isChatWidgetLeadMessage(contact.mensaje);
  const source = activitySource(contact, isWidget);
  const campaign = activityCampaign(contact, isWidget);
  const createdAt = Number.isFinite(contact.createdAtMs) ? contact.createdAtMs : Date.now();
  const events: CompanyLeadActivityEvent[] = [];

  events.push({
    id: `${contact.id}:created`,
    kind: 'contact_created',
    atMs: createdAt,
    title: 'Contacto creado',
    source,
    campaign,
    path: '/es/app/admin/company',
  });

  events.push({
    id: `${contact.id}:form`,
    kind: 'form_submitted',
    atMs: createdAt - 60_000,
    title: isWidget ? 'Formulario del chat enviado' : 'Formulario de contacto enviado',
    source,
    campaign,
    detail: isWidget ? 'Captura desde el widget en el sitio' : contact.servicio,
    path: isWidget ? '/es' : '/es/contacto',
  });

  events.push({
    id: `${contact.id}:visit`,
    kind: 'page_visited',
    atMs: createdAt - 4 * 60_000,
    title: 'Página visitada',
    source,
    campaign,
    path: isWidget ? '/es' : '/es/contacto',
  });

  for (const update of updates) {
    if (isCompanyLeadReminder(update)) {
      const at = update.scheduledAtMs ?? update.createdAtMs;
      events.push({
        id: update.id,
        kind: 'appointment_booked',
        atMs: at,
        title: 'Seguimiento agendado',
        source: 'Panel admin',
        campaign: update.reminderCode ?? 'Recordatorio',
        detail: update.body,
        path: '/es/app/admin/leads/calendar',
      });
      continue;
    }
    events.push({
      id: update.id,
      kind: 'note_added',
      atMs: update.createdAtMs,
      title: 'Nota agregada',
      source: 'Panel admin',
      campaign: 'Seguimiento interno',
      detail: update.body,
    });
  }

  return events.sort((a, b) => b.atMs - a.atMs);
}

export function groupCompanyLeadActivityEvents(
  events: CompanyLeadActivityEvent[],
  now = Date.now(),
): CompanyLeadActivityGroup[] {
  const map = new Map<string, CompanyLeadActivityEvent[]>();
  for (const event of events) {
    const key = dayKeyLocal(event.atMs);
    const bucket = map.get(key);
    if (bucket) bucket.push(event);
    else map.set(key, [event]);
  }

  return [...map.entries()]
    .map(([dayKey, bucket]) => {
      const sorted = [...bucket].sort((a, b) => b.atMs - a.atMs);
      return {
        dayKey,
        dayLabel: formatActivityDayLabel(sorted[0]?.atMs ?? now, now).toUpperCase(),
        events: sorted,
      };
    })
    .sort((a, b) => (b.events[0]?.atMs ?? 0) - (a.events[0]?.atMs ?? 0));
}

export function getCompanyLeadAttributionSummary(
  contact: CompanyContact,
  isWidget: boolean,
): { first: string; latest: string } {
  const source = activitySource(contact, isWidget);
  return { first: source, latest: source };
}
