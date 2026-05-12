/** Misma longitud que `message` en CreateContactDto (adminvado). */
export const CHAT_WIDGET_MESSAGE_MAX = 1024;

export const CHAT_WIDGET_MESSAGE_PREFIX = '[Chat widget]';

const STEP_LABELS = [
  'Empresa',
  'Correo',
  'Teléfono',
  'Nombre',
  'Rol',
  'Problema a resolver',
  'Tipo de desarrollo',
  'Urgencia',
  'Presupuesto (¿dentro de $5k USD/mes?)',
  'Monto mensual dispuesto (USD)',
  'Madurez del proyecto',
] as const;

export type ChatWidgetContactBody = {
  firstName: string;
  email: string;
  phone?: string;
  company: string;
  role?: string;
  campaignID: string;
  agreement: boolean;
  emailAgreement?: boolean;
  message: string;
};

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/** Construye el cuerpo de `message` con todas las respuestas del chat (orden fijo). */
export function buildChatWidgetMessage(answers: Record<number, string>): string {
  const lines: string[] = [CHAT_WIDGET_MESSAGE_PREFIX];
  for (let i = 0; i < STEP_LABELS.length; i++) {
    const raw = answers[i];
    if (raw == null || String(raw).trim() === '') continue;
    lines.push(`${STEP_LABELS[i]}: ${String(raw).trim()}`);
  }
  let body = lines.join('\n');
  if (body.length > CHAT_WIDGET_MESSAGE_MAX) {
    body = `${body.slice(0, CHAT_WIDGET_MESSAGE_MAX - 1)}…`;
  }
  return body;
}

/** Payload para POST /contact (CreateContactDto + role opcional en adminvado). */
export function answersToContactPayload(answers: Record<number, string>): ChatWidgetContactBody {
  const phoneRaw = String(answers[2] ?? '').trim();
  const phone =
    phoneHasMinDigits(phoneRaw) ? truncate(phoneRaw.replace(/\s+/g, ' '), 25) : undefined;

  return {
    firstName: truncate(answers[3] ?? '', 100),
    email: truncate(String(answers[1] ?? '').trim().toLowerCase(), 255),
    phone,
    company: truncate(answers[0] ?? '', 100),
    role: truncate(answers[4] ?? '', 50) || undefined,
    campaignID: 'Companies',
    agreement: true,
    emailAgreement: false,
    message: buildChatWidgetMessage(answers),
  };
}

export function phoneHasMinDigits(raw: string, min = 10): boolean {
  return raw.replace(/\D/g, '').length >= min;
}

export async function submitChatWidgetLead(
  apiBase: string,
  body: ChatWidgetContactBody,
): Promise<{ ok: true } | { ok: false; status: number; detail?: string }> {
  const base = apiBase.replace(/\/$/, '');
  const res = await fetch(`${base}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.ok) return { ok: true };
  let detail: string | undefined;
  try {
    const j = (await res.json()) as { message?: unknown };
    if (Array.isArray(j?.message)) {
      detail = j.message.map(String).join(' ');
    } else if (typeof j?.message === 'string') {
      detail = j.message;
    }
  } catch {
    /* ignore */
  }
  return { ok: false, status: res.status, detail };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isChatWidgetLeadMessage(message: string): boolean {
  return message.trim().toLowerCase().startsWith(CHAT_WIDGET_MESSAGE_PREFIX.toLowerCase());
}

/**
 * Parsea el cuerpo guardado en `message` para la vista admin.
 * Soporta saltos de línea y versiones en una sola línea (p. ej. HTML colapsó `\n`).
 */
export function parseChatWidgetDetailRows(message: string): { label: string; value: string }[] {
  const trimmed = message.trim();
  if (!isChatWidgetLeadMessage(trimmed)) return [];

  let body = trimmed.replace(/^\[[^\]]+\]\s*/i, '').trim();
  if (!body) return [];

  if (!body.includes('\n')) {
    const sorted = [...STEP_LABELS].sort((a, b) => b.length - a.length);
    for (const lab of sorted) {
      const esc = escapeRegExp(lab);
      body = body.replace(new RegExp(`\\s+(${esc}):`, 'g'), '\n$1:');
    }
  }

  const rows: { label: string; value: string }[] = [];
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    const colon = line.indexOf(':');
    if (colon <= 0) continue;
    const label = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (!label) continue;
    rows.push({ label, value });
  }
  return rows;
}

export type ChatWidgetBudgetQualification = 'qualified' | 'unqualified' | 'unknown';

function fold(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Respuesta al paso «¿dentro de $5k USD/mes?» (Sí / No o variantes). */
function parseBudgetRangeAnswer(raw: string): 'yes' | 'no' | null {
  const t = fold(raw);
  if (!t) return null;
  const first = t.split(/[\s,:;.]+/).find(Boolean) ?? '';
  if (first === 'no' || first === 'nop') return 'no';
  if (first === 'si' || first === 'sí' || first === 'yes' || first === 'y' || first === 'ok') return 'yes';
  return null;
}

/**
 * Calificación por presupuesto (widget en sitio).
 * **No calificado:** respondió «No» al rango desde $5,000 USD/mes e indicó un monto en el paso siguiente.
 * **Calificado:** respondió «Sí» (u equivalente) a esa pregunta.
 * **Desconocido:** formulario clásico, mensaje sin esas líneas, o respuesta no reconocible.
 */
export function getChatWidgetBudgetQualification(message: string): ChatWidgetBudgetQualification {
  if (!isChatWidgetLeadMessage(message)) return 'unknown';

  const rows = parseChatWidgetDetailRows(message);
  const budgetLabel = STEP_LABELS[8];
  const amountLabel = STEP_LABELS[9];

  const budgetRow =
    rows.find((r) => r.label === budgetLabel) ??
    rows.find((r) => /presupuesto.*\$5k|dentro.*\$5k/i.test(r.label));
  const amountRow =
    rows.find((r) => r.label === amountLabel) ??
    rows.find((r) => /monto mensual.*usd/i.test(r.label));

  const budgetVal = budgetRow?.value ?? '';
  const amountVal = (amountRow?.value ?? '').trim();

  const yn = parseBudgetRangeAnswer(budgetVal);
  if (yn === 'yes') return 'qualified';
  if (yn === 'no' && amountVal.length > 0) return 'unqualified';
  return 'unknown';
}
