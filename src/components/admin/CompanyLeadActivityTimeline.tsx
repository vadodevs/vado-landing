import { useMemo } from 'react';
import {
  CalendarDays,
  ExternalLink,
  FileText,
  MousePointerClick,
  StickyNote,
  UserPlus,
} from 'lucide-react';
import type { CompanyContact } from '@/lib/companyAdminContact';
import type { CompanyLeadUpdate } from '@/lib/companyLeadUpdates';
import {
  buildCompanyLeadActivityEvents,
  formatActivityWhen,
  getActivityTimezoneLabel,
  getCompanyLeadAttributionSummary,
  groupCompanyLeadActivityEvents,
  type CompanyLeadActivityEvent,
  type CompanyLeadActivityKind,
} from '@/lib/companyLeadActivity';
import { cn } from '@/lib/utils';

type Props = {
  contact: CompanyContact;
  updates: CompanyLeadUpdate[];
  isWidget: boolean;
};

const KIND_ICON: Record<
  CompanyLeadActivityKind,
  { icon: typeof UserPlus; className: string }
> = {
  contact_created: {
    icon: UserPlus,
    className: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  },
  form_submitted: {
    icon: FileText,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  page_visited: {
    icon: MousePointerClick,
    className: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300',
  },
  appointment_booked: {
    icon: CalendarDays,
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
  },
  note_added: {
    icon: StickyNote,
    className: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  },
};

function ActivityMetaPill({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-foreground">
      <span className="text-muted-foreground">{label}: </span>
      <span className="rounded bg-sky-50 px-1.5 py-0.5 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200">
        {value}
      </span>
    </p>
  );
}

function ActivityTimelineItem({ event }: { event: CompanyLeadActivityEvent }) {
  const { icon: Icon, className } = KIND_ICON[event.kind];

  return (
    <li className="relative flex gap-3 pb-8 last:pb-2">
      <div className="relative flex w-8 shrink-0 justify-center">
        <div
          className={cn(
            'relative z-10 flex size-8 items-center justify-center rounded-full border border-border/60',
            className,
          )}
        >
          <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="timeline-line absolute top-8 bottom-0 left-1/2 w-px -translate-x-1/2 bg-border/80" aria-hidden />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="text-sm font-semibold text-foreground">{event.title}</h4>
        <div className="mt-2 space-y-1.5 rounded-lg border border-border/70 bg-muted/10 p-3 dark:bg-muted/10">
          <ActivityMetaPill label="Fuente" value={event.source} />
          <ActivityMetaPill label="Campaña" value={event.campaign} />
          {event.detail ? (
            <p className="text-sm leading-snug text-muted-foreground">{event.detail}</p>
          ) : null}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          {event.path ? (
            <span className="inline-flex min-w-0 items-center gap-1 text-sky-700 dark:text-sky-300">
              <span className="truncate">{event.path}</span>
              <ExternalLink className="size-3 shrink-0" aria-hidden />
            </span>
          ) : (
            <span />
          )}
          <time className="shrink-0 tabular-nums">{formatActivityWhen(event.atMs)}</time>
        </div>
      </div>
    </li>
  );
}

export function CompanyLeadActivityTimeline({ contact, updates, isWidget }: Props) {
  const timezone = getActivityTimezoneLabel();
  const events = useMemo(
    () => buildCompanyLeadActivityEvents(contact, updates, { isWidget }),
    [contact, updates, isWidget],
  );
  const groups = useMemo(() => groupCompanyLeadActivityEvents(events), [events]);
  const attribution = useMemo(
    () => getCompanyLeadAttributionSummary(contact, isWidget),
    [contact, isWidget],
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/60 px-5 py-3">
        <h3 className="text-sm font-semibold text-foreground">Actividad ({timezone})</h3>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
        {groups.map((group) => (
          <section key={group.dayKey} className="mb-6 last:mb-0">
            <p className="mb-4 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">
              {group.dayLabel}
            </p>
            <ul className="[&>li:last-child_.timeline-line]:hidden">
              {group.events.map((event) => (
                <ActivityTimelineItem key={event.id} event={event} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="shrink-0 border-t border-border/60 bg-muted/5 px-5 py-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Primera fuente de atribución
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{attribution.first}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Última fuente de atribución
            </p>
            <p className="mt-1 text-sm font-semibold text-foreground">{attribution.latest}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
