export function dayKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function monthRangeMs(year: number, month: number): { startMs: number; endMs: number } {
  const start = new Date(year, month, 1, 0, 0, 0, 0);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { startMs: start.getTime(), endMs: end.getTime() };
}

/** Lunes 00:00 → domingo 23:59 de la semana que contiene `ref`. */
export function weekRangeMs(ref = new Date()): { startMs: number; endMs: number } {
  const d = new Date(ref);
  const mondayOffset = (d.getDay() + 6) % 7;
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - mondayOffset, 0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { startMs: start.getTime(), endMs: end.getTime() };
}

export function todayRangeMs(ref = new Date()): { startMs: number; endMs: number } {
  const start = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 0, 0, 0, 0);
  const end = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 23, 59, 59, 999);
  return { startMs: start.getTime(), endMs: end.getTime() };
}

/** Rango mínimo que cubre la semana y el mes actuales (para stats del dashboard). */
export function dashboardFetchRange(ref = new Date()): { startMs: number; endMs: number } {
  const month = monthRangeMs(ref.getFullYear(), ref.getMonth());
  const week = weekRangeMs(ref);
  return {
    startMs: Math.min(month.startMs, week.startMs),
    endMs: Math.max(month.endMs, week.endMs),
  };
}

export type MeetingDashboardStats = {
  today: number;
  week: number;
  month: number;
  upcoming: number;
};

export function computeMeetingStats(
  meetings: Array<{ startTimeMs: number }>,
  ref = new Date(),
): MeetingDashboardStats {
  const todayKey = dayKeyFromDate(ref);
  const { startMs: weekStart, endMs: weekEnd } = weekRangeMs(ref);
  const { startMs: monthStart, endMs: monthEnd } = monthRangeMs(ref.getFullYear(), ref.getMonth());
  const nowMs = ref.getTime();

  let today = 0;
  let week = 0;
  let month = 0;
  let upcoming = 0;

  for (const meeting of meetings) {
    const key = dayKeyFromDate(new Date(meeting.startTimeMs));
    if (key === todayKey) today += 1;
    if (meeting.startTimeMs >= weekStart && meeting.startTimeMs <= weekEnd) week += 1;
    if (meeting.startTimeMs >= monthStart && meeting.startTimeMs <= monthEnd) month += 1;
    if (meeting.startTimeMs >= nowMs) upcoming += 1;
  }

  return { today, week, month, upcoming };
}

export type CalendarDayCell = {
  date: Date;
  key: string;
  inMonth: boolean;
};

export function buildMonthGrid(year: number, month: number): CalendarDayCell[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const padStart = (first.getDay() + 6) % 7;
  const cells: CalendarDayCell[] = [];

  for (let i = padStart; i > 0; i -= 1) {
    const date = new Date(year, month, 1 - i);
    cells.push({ date, key: dayKeyFromDate(date), inMonth: false });
  }

  for (let day = 1; day <= last.getDate(); day += 1) {
    const date = new Date(year, month, day);
    cells.push({ date, key: dayKeyFromDate(date), inMonth: true });
  }

  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - padStart - last.getDate() + 1;
    const date = new Date(year, month + 1, nextDay);
    cells.push({ date, key: dayKeyFromDate(date), inMonth: false });
  }

  return cells;
}

export function formatMeetingTime(ms: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms));
}

export function formatMonthLabel(year: number, month: number, locale: string): string {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(year, month, 1),
  );
}

export function formatDayLabel(key: string, locale: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(y, m - 1, d));
}
