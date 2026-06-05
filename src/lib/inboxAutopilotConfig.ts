import {
  DEFAULT_INBOX_APPOINTMENT_TOPICS,
  parseInboxAppointmentTopics,
  type InboxAppointmentTopics,
} from '@/lib/inboxAppointmentTopics';

export type AutopilotWeekdayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type InboxAutopilotConfig = {
  enabled: boolean;
  channels: { whatsapp: boolean };
  timezone: string;
  days: AutopilotWeekdayId[];
  startTime: string;
  endTime: string;
  replyDelaySeconds: number;
  maxRepliesPerHour: number;
  /** Acciones de citas que el autopilot puede atender en el inbox. */
  appointmentTopics: InboxAppointmentTopics;
};

const STORAGE_KEY = 'vado.admin.inboxAutopilot.v1';

export const AUTOPILOT_WEEKDAYS: AutopilotWeekdayId[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

export const AUTOPILOT_TIMEZONE_OPTIONS = [
  'America/Hermosillo',
  'America/Mazatlan',
  'America/Mexico_City',
  'America/Tijuana',
  'America/Cancun',
  'America/New_York',
  'UTC',
] as const;

export const DEFAULT_INBOX_AUTOPILOT_CONFIG: InboxAutopilotConfig = {
  enabled: false,
  channels: { whatsapp: true },
  timezone: 'America/Mexico_City',
  days: ['mon', 'tue', 'wed', 'thu', 'fri'],
  startTime: '09:00',
  endTime: '18:00',
  replyDelaySeconds: 8,
  maxRepliesPerHour: 30,
  appointmentTopics: { ...DEFAULT_INBOX_APPOINTMENT_TOPICS },
};

const BOT_STORAGE_KEY = 'vado.admin.inboxBot.v1';

function migrateAppointmentTopicsFromBotConfig(): InboxAppointmentTopics | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BOT_STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { appointmentTopics?: unknown };
    if (o.appointmentTopics) return parseInboxAppointmentTopics(o.appointmentTopics);
  } catch {
    /* ignore */
  }
  return null;
}

function isWeekdayId(x: unknown): x is AutopilotWeekdayId {
  return typeof x === 'string' && (AUTOPILOT_WEEKDAYS as readonly string[]).includes(x);
}

function parseConfig(raw: unknown): InboxAutopilotConfig {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_INBOX_AUTOPILOT_CONFIG };
  const o = raw as Record<string, unknown>;
  const days = Array.isArray(o.days) ? o.days.filter(isWeekdayId) : DEFAULT_INBOX_AUTOPILOT_CONFIG.days;
  const channels =
    o.channels && typeof o.channels === 'object'
      ? { whatsapp: (o.channels as { whatsapp?: boolean }).whatsapp !== false }
      : DEFAULT_INBOX_AUTOPILOT_CONFIG.channels;

  return {
    enabled: o.enabled === true,
    channels,
    timezone:
      typeof o.timezone === 'string' && o.timezone.trim()
        ? o.timezone.trim()
        : DEFAULT_INBOX_AUTOPILOT_CONFIG.timezone,
    days: days.length > 0 ? days : DEFAULT_INBOX_AUTOPILOT_CONFIG.days,
    startTime:
      typeof o.startTime === 'string' && /^\d{2}:\d{2}$/.test(o.startTime)
        ? o.startTime
        : DEFAULT_INBOX_AUTOPILOT_CONFIG.startTime,
    endTime:
      typeof o.endTime === 'string' && /^\d{2}:\d{2}$/.test(o.endTime)
        ? o.endTime
        : DEFAULT_INBOX_AUTOPILOT_CONFIG.endTime,
    replyDelaySeconds:
      typeof o.replyDelaySeconds === 'number' && o.replyDelaySeconds >= 0
        ? Math.min(120, Math.round(o.replyDelaySeconds))
        : DEFAULT_INBOX_AUTOPILOT_CONFIG.replyDelaySeconds,
    maxRepliesPerHour:
      typeof o.maxRepliesPerHour === 'number' && o.maxRepliesPerHour > 0
        ? Math.min(200, Math.round(o.maxRepliesPerHour))
        : DEFAULT_INBOX_AUTOPILOT_CONFIG.maxRepliesPerHour,
    appointmentTopics: o.appointmentTopics
      ? parseInboxAppointmentTopics(o.appointmentTopics)
      : (migrateAppointmentTopicsFromBotConfig() ?? { ...DEFAULT_INBOX_APPOINTMENT_TOPICS }),
  };
}

export function loadInboxAutopilotConfig(): InboxAutopilotConfig {
  if (typeof window === 'undefined') return { ...DEFAULT_INBOX_AUTOPILOT_CONFIG };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_INBOX_AUTOPILOT_CONFIG };
    return parseConfig(JSON.parse(raw) as unknown);
  } catch {
    return { ...DEFAULT_INBOX_AUTOPILOT_CONFIG };
  }
}

export function saveInboxAutopilotConfig(config: InboxAutopilotConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* quota / private mode */
  }
}

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map((x) => Number(x));
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
}

const WEEKDAY_TO_ID: Record<string, AutopilotWeekdayId> = {
  Mon: 'mon',
  Tue: 'tue',
  Wed: 'wed',
  Thu: 'thu',
  Fri: 'fri',
  Sat: 'sat',
  Sun: 'sun',
};

function zonedParts(date: Date, timeZone: string): { weekday: string; minutes: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? 'Mon';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return { weekday, minutes: hour * 60 + minute };
}

/** Si el autopilot mock estaría activo en este momento (para el inbox más adelante). */
export function isInboxAutopilotActiveNow(
  config: InboxAutopilotConfig,
  at: Date = new Date(),
): boolean {
  if (!config.enabled || !config.channels.whatsapp || config.days.length === 0) return false;

  const { weekday, minutes } = zonedParts(at, config.timezone);
  const dayId = WEEKDAY_TO_ID[weekday];
  if (!dayId || !config.days.includes(dayId)) return false;

  const start = parseTimeToMinutes(config.startTime);
  const end = parseTimeToMinutes(config.endTime);
  if (start === end) return false;
  if (start < end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
}
