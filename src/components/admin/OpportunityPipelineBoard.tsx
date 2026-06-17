import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { GripVertical, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PIPELINE_STAGES,
  parsePipelineCardDndId,
  parsePipelineColumnDndId,
  pipelineCardDndId,
  pipelineColumnDndId,
  removePipelineLead,
  movePipelineLeadToStage,
  type PipelineLeadEntry,
  type PipelineStage,
} from '@/lib/adminOpportunitiesPipeline';
import { leadInitials } from '@/lib/evolveLeadUi';
import { cn } from '@/lib/utils';

const STAGE_HEADER_CLASS: Record<PipelineStage, string> = {
  contactado: 'border-sky-200/80 bg-sky-50/80 dark:border-sky-900/60 dark:bg-sky-950/35',
  en_reuniones: 'border-violet-200/80 bg-violet-50/80 dark:border-violet-900/60 dark:bg-violet-950/35',
  tomando_decision: 'border-amber-200/80 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/35',
  negociacion: 'border-orange-200/80 bg-orange-50/80 dark:border-orange-900/60 dark:bg-orange-950/35',
  ganado: 'border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/35',
  perdido: 'border-rose-200/80 bg-rose-50/80 dark:border-rose-900/60 dark:bg-rose-950/35',
};

const STAGE_DOT_CLASS: Record<PipelineStage, string> = {
  contactado: 'bg-sky-500',
  en_reuniones: 'bg-violet-500',
  tomando_decision: 'bg-amber-500',
  negociacion: 'bg-orange-500',
  ganado: 'bg-emerald-500',
  perdido: 'bg-rose-500',
};

type Props = {
  entries: PipelineLeadEntry[];
  onChange: (entries: PipelineLeadEntry[]) => void;
};

function sourceLabel(source: PipelineLeadEntry['source'], t: (key: string) => string): string {
  return source === 'evolve'
    ? t('adminOpportunities.sourceEvolve')
    : t('adminOpportunities.sourceCompany');
}

function stageLabel(stage: PipelineStage, t: (key: string) => string): string {
  return t(`adminOpportunities.stage.${stage}`);
}

function resolveDropStage(
  overId: string | null | undefined,
  entries: PipelineLeadEntry[],
): PipelineStage | null {
  if (!overId) return null;
  const column = parsePipelineColumnDndId(overId);
  if (column) return column;
  const card = parsePipelineCardDndId(overId);
  if (!card) return null;
  const target = entries.find((e) => e.source === card.source && e.id === card.id);
  return target?.stage ?? null;
}

const pipelineCollision: CollisionDetection = (args) => {
  const pointerHits = pointerWithin(args);
  if (pointerHits.length > 0) return pointerHits;
  return closestCorners(args);
};

type PipelineCardProps = {
  entry: PipelineLeadEntry;
  onRemove: () => void;
  t: (key: string, opts?: Record<string, string>) => string;
};

function PipelineCard({ entry, onRemove, t }: PipelineCardProps) {
  const dndId = pipelineCardDndId(entry.source, entry.id);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: dndId });

  return (
    <article
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab touch-none rounded-xl border border-border/70 bg-card p-3 shadow-sm active:cursor-grabbing dark:bg-muted/20',
        isDragging && 'opacity-35 ring-2 ring-violet-400/40',
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
          {leadInitials(entry.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 pr-6">
            <p className="truncate text-sm font-semibold text-foreground">{entry.nombre}</p>
            <Badge variant="secondary" className="text-[10px]">
              {sourceLabel(entry.source, t)}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{entry.empresa}</p>
          <p className="truncate text-xs text-muted-foreground">{entry.email}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={t('adminOpportunities.removeFromPipeline', { name: entry.nombre })}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="size-3.5" aria-hidden />
        </Button>
      </div>
    </article>
  );
}

function PipelineCardPreview({ entry, t }: { entry: PipelineLeadEntry; t: PipelineCardProps['t'] }) {
  return (
    <article className="w-[248px] cursor-grabbing rounded-xl border border-violet-400/50 bg-card p-3 shadow-xl ring-2 ring-violet-400/30 dark:bg-muted/20">
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[10px] font-semibold text-muted-foreground">
          {leadInitials(entry.nombre)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-foreground">{entry.nombre}</p>
            <Badge variant="secondary" className="text-[10px]">
              {sourceLabel(entry.source, t)}
            </Badge>
          </div>
          <p className="truncate text-xs text-muted-foreground">{entry.empresa}</p>
        </div>
      </div>
    </article>
  );
}

type PipelineColumnProps = {
  stage: PipelineStage;
  entries: PipelineLeadEntry[];
  isOver: boolean;
  onRemove: (entry: PipelineLeadEntry) => void;
  t: PipelineCardProps['t'];
};

function PipelineColumn({ stage, entries, isOver, onRemove, t }: PipelineColumnProps) {
  const { setNodeRef } = useDroppable({ id: pipelineColumnDndId(stage) });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-full min-h-0 w-[272px] shrink-0 flex-col rounded-xl border border-transparent p-1 transition-colors',
        isOver && 'border-violet-400/50 bg-violet-50/30 dark:bg-violet-950/15',
      )}
    >
      <div
        className={cn(
          'mb-2 flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2',
          STAGE_HEADER_CLASS[stage],
        )}
      >
        <span className={cn('size-2 shrink-0 rounded-full', STAGE_DOT_CLASS[stage])} aria-hidden />
        <h3 className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
          {stageLabel(stage, t)}
        </h3>
        <span className="shrink-0 rounded-md bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
          {entries.length}
        </span>
      </div>
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto overscroll-y-contain rounded-xl border border-dashed border-border/60 bg-muted/15 p-2 dark:bg-muted/10',
          entries.length === 0 && 'min-h-[min(280px,40vh)]',
          isOver && 'border-violet-400/70 bg-violet-50/40 dark:bg-violet-950/20',
        )}
      >
        {entries.length === 0 ? (
          <p className="flex flex-1 items-center justify-center px-2 py-6 text-center text-[11px] text-muted-foreground">
            {t('adminOpportunities.columnEmpty')}
          </p>
        ) : (
          entries.map((entry) => (
            <PipelineCard
              key={pipelineCardDndId(entry.source, entry.id)}
              entry={entry}
              onRemove={() => onRemove(entry)}
              t={t}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function OpportunityPipelineBoard({ entries, onChange }: Props) {
  const { t } = useTranslation();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<PipelineStage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
  );

  const byStage = useMemo(() => {
    const map = Object.fromEntries(PIPELINE_STAGES.map((s) => [s, [] as PipelineLeadEntry[]])) as Record<
      PipelineStage,
      PipelineLeadEntry[]
    >;
    for (const entry of entries) {
      const stage = PIPELINE_STAGES.includes(entry.stage) ? entry.stage : 'contactado';
      map[stage].push(entry);
    }
    for (const stage of PIPELINE_STAGES) {
      map[stage].sort((a, b) => b.addedAtMs - a.addedAtMs);
    }
    return map;
  }, [entries]);

  const activeEntry = useMemo(() => {
    if (!activeCardId) return null;
    const parsed = parsePipelineCardDndId(activeCardId);
    if (!parsed) return null;
    return entries.find((e) => e.source === parsed.source && e.id === parsed.id) ?? null;
  }, [activeCardId, entries]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverStage(resolveDropStage(event.over ? String(event.over.id) : null, entries));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    setOverStage(null);
    const parsed = parsePipelineCardDndId(String(event.active.id));
    if (!parsed) return;
    const nextStage = resolveDropStage(event.over ? String(event.over.id) : null, entries);
    if (!nextStage) return;
    const current = entries.find((e) => e.source === parsed.source && e.id === parsed.id);
    if (!current || current.stage === nextStage) return;
    onChange(movePipelineLeadToStage(parsed.source, parsed.id, nextStage));
  };

  const handleDragCancel = () => {
    setActiveCardId(null);
    setOverStage(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={pipelineCollision}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto overflow-y-hidden pb-2">
          {PIPELINE_STAGES.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              entries={byStage[stage]}
              isOver={overStage === stage}
              onRemove={(entry) => onChange(removePipelineLead(entry.source, entry.id))}
              t={t}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
          {activeEntry ? <PipelineCardPreview entry={activeEntry} t={t} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
