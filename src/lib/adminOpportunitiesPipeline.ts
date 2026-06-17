const STORAGE_KEY = 'vado-opportunities-pipeline';

export type PipelineLeadSource = 'evolve' | 'company';

export const PIPELINE_STAGES = [
  'contactado',
  'en_reuniones',
  'tomando_decision',
  'negociacion',
  'ganado',
  'perdido',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const DEFAULT_PIPELINE_STAGE: PipelineStage = 'contactado';

export type PipelineLeadEntry = {
  id: string;
  source: PipelineLeadSource;
  nombre: string;
  email: string;
  empresa: string;
  telefono?: string;
  servicio?: string;
  addedAtMs: number;
  stage: PipelineStage;
  /** Valor estimado de la oportunidad en USD. */
  estimatedAmountUsd?: number;
};

export const PIPELINE_LEADS_CHANGE_EVENT = 'vado-pipeline-leads-change';

function isPipelineStage(v: unknown): v is PipelineStage {
  return typeof v === 'string' && (PIPELINE_STAGES as readonly string[]).includes(v);
}

function normalizePipelineLead(row: PipelineLeadEntry): PipelineLeadEntry {
  let stage = isPipelineStage(row.stage) ? row.stage : DEFAULT_PIPELINE_STAGE;
  // Migración: etapas renombradas
  if ((row.stage as string) === 'propuesta') stage = 'tomando_decision';
  if ((row.stage as string) === 'calificado') stage = 'en_reuniones';
  const amountRaw = row.estimatedAmountUsd;
  const estimatedAmountUsd =
    typeof amountRaw === 'number' && Number.isFinite(amountRaw) && amountRaw > 0
      ? Math.round(amountRaw * 100) / 100
      : undefined;
  return {
    ...row,
    stage,
    estimatedAmountUsd,
  };
}

function isPipelineLeadEntry(row: unknown): row is PipelineLeadEntry {
  return (
    typeof row === 'object' &&
    row !== null &&
    typeof (row as PipelineLeadEntry).id === 'string' &&
    ((row as PipelineLeadEntry).source === 'evolve' ||
      (row as PipelineLeadEntry).source === 'company') &&
    typeof (row as PipelineLeadEntry).nombre === 'string' &&
    typeof (row as PipelineLeadEntry).email === 'string' &&
    typeof (row as PipelineLeadEntry).empresa === 'string' &&
    typeof (row as PipelineLeadEntry).addedAtMs === 'number'
  );
}

export function loadPipelineLeads(): PipelineLeadEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPipelineLeadEntry).map(normalizePipelineLead);
  } catch {
    return [];
  }
}

export function persistPipelineLeads(entries: PipelineLeadEntry[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(PIPELINE_LEADS_CHANGE_EVENT));
}

export function pipelineLeadKey(source: PipelineLeadSource, id: string): string {
  return `${source}:${id}`;
}

export function pipelineCardDndId(source: PipelineLeadSource, id: string): string {
  return `card:${source}::${id}`;
}

export function pipelineColumnDndId(stage: PipelineStage): string {
  return `column:${stage}`;
}

export function parsePipelineCardDndId(
  dndId: string,
): { source: PipelineLeadSource; id: string } | null {
  if (!dndId.startsWith('card:')) return null;
  const rest = dndId.slice('card:'.length);
  const sep = rest.indexOf('::');
  if (sep <= 0) return null;
  const source = rest.slice(0, sep);
  const id = rest.slice(sep + 2);
  if (source !== 'evolve' && source !== 'company') return null;
  if (!id) return null;
  return { source, id };
}

export function parsePipelineColumnDndId(dndId: string): PipelineStage | null {
  if (!dndId.startsWith('column:')) return null;
  const stage = dndId.slice('column:'.length);
  return isPipelineStage(stage) ? stage : null;
}

export function isLeadInPipeline(
  entries: PipelineLeadEntry[],
  source: PipelineLeadSource,
  id: string,
): boolean {
  return entries.some((e) => e.source === source && e.id === id);
}

export function addPipelineLead(
  entry: Omit<PipelineLeadEntry, 'stage' | 'addedAtMs'> & {
    stage?: PipelineStage;
    addedAtMs?: number;
  },
): PipelineLeadEntry[] {
  const prev = loadPipelineLeads();
  if (isLeadInPipeline(prev, entry.source, entry.id)) return prev;
  const lead: PipelineLeadEntry = normalizePipelineLead({
    ...entry,
    stage: entry.stage ?? DEFAULT_PIPELINE_STAGE,
    addedAtMs: entry.addedAtMs ?? Date.now(),
  });
  const next = [lead, ...prev];
  persistPipelineLeads(next);
  return next;
}

export function movePipelineLeadToStage(
  source: PipelineLeadSource,
  id: string,
  stage: PipelineStage,
): PipelineLeadEntry[] {
  const next = loadPipelineLeads().map((e) =>
    e.source === source && e.id === id ? { ...e, stage } : e,
  );
  persistPipelineLeads(next);
  return next;
}

export function removePipelineLead(source: PipelineLeadSource, id: string): PipelineLeadEntry[] {
  const next = loadPipelineLeads().filter((e) => !(e.source === source && e.id === id));
  persistPipelineLeads(next);
  return next;
}

export function updatePipelineLeadEstimatedAmount(
  source: PipelineLeadSource,
  id: string,
  estimatedAmountUsd: number | undefined,
): PipelineLeadEntry[] {
  const normalized =
    estimatedAmountUsd != null && Number.isFinite(estimatedAmountUsd) && estimatedAmountUsd > 0
      ? Math.round(estimatedAmountUsd * 100) / 100
      : undefined;
  const next = loadPipelineLeads().map((e) =>
    e.source === source && e.id === id ? { ...e, estimatedAmountUsd: normalized } : e,
  );
  persistPipelineLeads(next);
  return next;
}

export function formatPipelineAmountUsd(amount: number | undefined, locale = 'es-MX'): string {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function sumPipelineAmountUsd(entries: PipelineLeadEntry[]): number {
  return entries.reduce((sum, e) => sum + (e.estimatedAmountUsd ?? 0), 0);
}
