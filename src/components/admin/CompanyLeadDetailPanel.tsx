import {
  Building2,
  CalendarClock,
  CalendarDays,
  Copy,
  Globe,
  Mail,
  MapPin,
  Phone,
  StickyNote,
  UserCircle2,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { AdminSelect, type AdminSelectOption } from '@/components/app/AdminSelect';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import type { CompanyContact } from '@/lib/companyAdminContact';
import {
  COMPANY_LEAD_STATUS_DOT_CLASS,
  COMPANY_LEAD_STATUS_LABELS,
  type CompanyLeadStatus,
} from '@/lib/companyLeadStatus';
import {
  defaultReminderScheduleFields,
  formatCompanyLeadUpdateWhen,
  getNextReminderCode,
  getUpcomingReminder,
  isCompanyLeadReminder,
  type CompanyLeadUpdate,
} from '@/lib/companyLeadUpdates';
import { CompanyLeadActivityTimeline } from '@/components/admin/CompanyLeadActivityTimeline';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import { cn } from '@/lib/utils';

export type CompanyLeadDetailTab = 'cuestionario' | 'actividad' | 'notas';

type LeadDetailWidget = {
  isWidget: boolean;
  rows: { label: string; value: string }[];
};

type Props = {
  contact: CompanyContact;
  leadEstado: CompanyLeadStatus;
  leadDetailWidget: LeadDetailWidget;
  detailTab: CompanyLeadDetailTab;
  onDetailTabChange: (tab: CompanyLeadDetailTab) => void;
  updates: CompanyLeadUpdate[];
  updateDraft: string;
  onUpdateDraftChange: (value: string) => void;
  onAddUpdate: () => void;
  onAddReminder: (scheduledAtMs: number, note?: string) => void;
  onStatusChange: (status: CompanyLeadStatus) => void;
  statusOptions: AdminSelectOption[];
  onCopyEmail: (email: string) => void;
  emailCopied: boolean;
  assignedMemberCount: number;
  onDiscard: () => void;
  initials: string;
};

function formatLeadRegisteredAgo(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return 'Fecha no disponible';
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Registrado hace un momento';
  if (mins < 60) return `Registrado hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `Registrado hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Registrado hace ${days} d`;
  return `Registrado el ${new Date(ms).toLocaleDateString('es-MX', { dateStyle: 'medium' })}`;
}

function SidebarContactCard({
  label,
  value,
  icon: Icon,
  headerAction,
  truncateValue = false,
}: {
  label: string;
  value: string;
  icon: typeof Phone;
  headerAction?: ReactNode;
  truncateValue?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-3 dark:bg-muted/15">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
          <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            {label}
          </p>
        </div>
        {headerAction}
      </div>
      <p
        className={cn(
          'mt-1.5 text-sm font-medium leading-snug text-foreground',
          truncateValue ? 'truncate' : 'break-words',
        )}
        title={truncateValue && value ? value : undefined}
      >
        {value || '—'}
      </p>
    </div>
  );
}

function DetailInfoCard({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border/70 bg-muted/20 p-4 dark:bg-muted/15',
        fullWidth ? 'col-span-full' : '',
      )}
    >
      <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-relaxed break-words text-foreground">{value || '—'}</p>
    </div>
  );
}

function LeadUpdateItem({ update }: { update: CompanyLeadUpdate }) {
  const isReminder = isCompanyLeadReminder(update);

  return (
    <article className="rounded-xl border border-border/60 bg-card/80 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {isReminder ? (
          <Badge variant="secondary" className="text-[10px] font-bold tracking-wide">
            {update.reminderCode ?? 'R?'}
          </Badge>
        ) : (
          <StickyNote className="size-3.5 text-muted-foreground" aria-hidden />
        )}
        <p className="text-xs font-medium tabular-nums text-muted-foreground">
          {isReminder && update.scheduledAtMs
            ? formatCompanyLeadUpdateWhen(update.scheduledAtMs)
            : formatCompanyLeadUpdateWhen(update.createdAtMs)}
        </p>
        {isReminder ? (
          <span className="text-[10px] text-muted-foreground">· Agendado</span>
        ) : null}
      </div>
      <p className="mt-1.5 text-sm leading-snug break-words text-foreground">{update.body}</p>
    </article>
  );
}

function LeadReminderScheduleButton({
  nextCode,
  onSchedule,
}: {
  nextCode: string;
  onSchedule: (scheduledAtMs: number, note?: string) => void;
}) {
  const defaults = defaultReminderScheduleFields();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(defaults.date);
  const [time, setTime] = useState(defaults.time);
  const [note, setNote] = useState('');

  const resetFields = () => {
    const next = defaultReminderScheduleFields();
    setDate(next.date);
    setTime(next.time);
    setNote('');
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) resetFields();
  };

  const handleSchedule = () => {
    if (!date || !time) return;
    const scheduledAtMs = new Date(`${date}T${time}`).getTime();
    if (!Number.isFinite(scheduledAtMs)) return;
    onSchedule(scheduledAtMs, note.trim() || undefined);
    setOpen(false);
    resetFields();
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          aria-label={`Agendar seguimiento ${nextCode}`}
        >
          <CalendarDays className="size-3.5" strokeWidth={1.5} aria-hidden />
          {nextCode}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Agendar seguimiento {nextCode}</PopoverTitle>
          <PopoverDescription>Elige fecha y hora para el recordatorio.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="lead-reminder-date" className="text-xs">
                Fecha
              </Label>
              <input
                id="lead-reminder-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lead-reminder-time" className="text-xs">
                Hora
              </Label>
              <input
                id="lead-reminder-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lead-reminder-note" className="text-xs">
              Nota (opcional)
            </Label>
            <input
              id="lead-reminder-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Llamada de seguimiento"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSchedule();
                }
              }}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className={cn(ADMIN_PRIMARY_BTN_CLASS, 'h-9 w-full text-sm')}
            disabled={!date || !time}
            onClick={handleSchedule}
          >
            Guardar {nextCode}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const DETAIL_TABS: { id: CompanyLeadDetailTab; label: string }[] = [
  { id: 'cuestionario', label: 'Cuestionario' },
  { id: 'actividad', label: 'Actividad' },
  { id: 'notas', label: 'Notas' },
];

function isLongFieldLabel(label: string): boolean {
  const lower = label.toLowerCase();
  return (
    lower.includes('problema') ||
    lower.includes('mensaje') ||
    lower.includes('objetivo') ||
    lower.includes('descripción') ||
    lower.includes('descripcion')
  );
}

export function CompanyLeadDetailPanel({
  contact,
  leadEstado,
  leadDetailWidget,
  detailTab,
  onDetailTabChange,
  updates,
  updateDraft,
  onUpdateDraftChange,
  onAddUpdate,
  onAddReminder,
  onStatusChange,
  statusOptions,
  onCopyEmail,
  emailCopied,
  assignedMemberCount,
  onDiscard,
  initials,
}: Props) {
  const locationLabel =
    contact.ciudad.trim() !== ''
      ? contact.ciudad.trim()
      : contact.empresa.trim() !== '' && contact.empresa !== '—'
        ? contact.empresa.trim()
        : 'Sin ubicación';

  const sourceLabel = leadDetailWidget.isWidget
    ? 'Widget de contacto (web)'
    : contact.servicio.trim() !== '' && contact.servicio !== 'Selecciona uno...'
      ? contact.servicio.trim()
      : 'Formulario de contacto';

  const latestUpdate = updates[0];
  const upcomingReminder = getUpcomingReminder(updates);
  const nextReminderCode = getNextReminderCode(updates);
  const questionnaireRows =
    leadDetailWidget.isWidget && leadDetailWidget.rows.length > 0
      ? leadDetailWidget.rows
      : contact.mensaje.trim() !== ''
        ? [{ label: 'Mensaje', value: contact.mensaje.trim() }]
        : [];

  const shortRows = questionnaireRows.filter((row) => !isLongFieldLabel(row.label));
  const longRows = questionnaireRows.filter((row) => isLongFieldLabel(row.label));

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-500 dark:bg-sky-500/20">
          <UserCircle2 className="size-5" strokeWidth={1.5} aria-hidden />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">Detalle del Lead</h2>
          <p className="text-xs text-muted-foreground">
            {formatLeadRegisteredAgo(contact.createdAtMs)}
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-[280px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-border/60 bg-muted/5 p-4">
          <div className="text-center">
            <div className="relative mx-auto mb-3 w-fit">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-indigo-100 text-xl font-semibold text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200">
                {initials}
              </div>
              <span
                className="absolute -right-0.5 -bottom-0.5 size-3.5 rounded-full border-2 border-background bg-emerald-500"
                aria-hidden
              />
            </div>
            <p className="text-base font-semibold text-foreground">{contact.nombre}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {leadDetailWidget.isWidget ? (
                <Badge variant="outline" className="text-[10px] font-semibold uppercase">
                  Chat en sitio
                </Badge>
              ) : null}
              <Badge variant="secondary" className="gap-1.5 text-[10px] font-semibold uppercase">
                <span
                  className={cn('size-1.5 rounded-full', COMPANY_LEAD_STATUS_DOT_CLASS[leadEstado])}
                  aria-hidden
                />
                {COMPANY_LEAD_STATUS_LABELS[leadEstado]}
              </Badge>
            </div>
          </div>

          <SidebarContactCard label="Teléfono" value={contact.telefono} icon={Phone} />
          <SidebarContactCard
            label="Email"
            value={contact.correo}
            icon={Mail}
            truncateValue
            headerAction={
              contact.correo.trim() ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 shrink-0 gap-1 px-1.5 text-[10px] text-sky-500 hover:text-sky-600"
                  onClick={() => onCopyEmail(contact.correo)}
                  title={emailCopied ? 'Email copiado' : 'Copiar email'}
                >
                  <Copy className="size-3" />
                  {emailCopied ? 'Copiado' : 'Copiar'}
                </Button>
              ) : null
            }
          />
          <SidebarContactCard label="Ubicación" value={locationLabel} icon={MapPin} />

          <div className="rounded-xl border border-border/70 bg-muted/20 p-3 dark:bg-muted/15">
            <Label
              htmlFor="lead-estado-detalle"
              className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
            >
              Estado
            </Label>
            <div className="mt-2 flex items-center gap-2">
              <span
                className={cn('size-2 shrink-0 rounded-full', COMPANY_LEAD_STATUS_DOT_CLASS[leadEstado])}
                aria-hidden
              />
              <AdminSelect
                id="lead-estado-detalle"
                value={leadEstado}
                onValueChange={(v) => onStatusChange(v as CompanyLeadStatus)}
                options={statusOptions}
                aria-label="Estado del lead"
                triggerClassName="h-9 min-w-0 flex-1 text-xs"
                contentMatchTriggerWidth={false}
                contentClassName="min-w-[12rem]"
              />
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 dark:bg-sky-500/10">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.08em] text-sky-600 uppercase dark:text-sky-400">
              <CalendarClock className="size-3.5 shrink-0" aria-hidden />
              Próxima acción
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/90">
              {upcomingReminder
                ? `${upcomingReminder.reminderCode ?? 'R?'} · ${
                    upcomingReminder.scheduledAtMs
                      ? formatCompanyLeadUpdateWhen(upcomingReminder.scheduledAtMs)
                      : upcomingReminder.body
                  }`
                : latestUpdate
                  ? latestUpdate.body
                  : 'Sin seguimiento programado. Agrega una nota o agenda un recordatorio.'}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="mt-3 h-9 w-full rounded-lg bg-sky-500/15 text-xs font-medium text-sky-700 hover:bg-sky-500/25 dark:text-sky-300"
              onClick={() => onDetailTabChange('notas')}
            >
              Ver Agenda
            </Button>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            className="flex shrink-0 gap-1 border-b border-border/60 px-5"
            role="tablist"
            aria-label="Secciones del lead"
          >
            {DETAIL_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={detailTab === tab.id}
                className={cn(
                  'border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                  detailTab === tab.id
                    ? 'border-sky-500 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
                onClick={() => onDetailTabChange(tab.id)}
              >
                {tab.label}
                {tab.id === 'notas' && updates.length > 0 ? (
                  <span className="ml-1.5 text-xs text-muted-foreground">({updates.length})</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div
              className={cn(
                'absolute inset-0 overflow-y-auto overscroll-contain p-5',
                detailTab !== 'cuestionario' && 'hidden',
              )}
              role="tabpanel"
              aria-hidden={detailTab !== 'cuestionario'}
            >
              <div className="grid grid-cols-2 gap-3">
                <DetailInfoCard label="Interés principal" value={contact.servicio} />
                <DetailInfoCard label="Empresa" value={contact.empresa} />
                {contact.sector.trim() ? <DetailInfoCard label="Sector" value={contact.sector} /> : null}
                <DetailInfoCard label="Fecha de solicitud" value={contact.fechaSolicitud} />
                {shortRows.map((row, idx) => (
                  <DetailInfoCard key={`${idx}-${row.label}`} label={row.label} value={row.value} />
                ))}
                {longRows.map((row, idx) => (
                  <DetailInfoCard
                    key={`long-${idx}-${row.label}`}
                    label={row.label}
                    value={row.value}
                    fullWidth
                  />
                ))}
              </div>

              {questionnaireRows.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
                  No hay respuestas de cuestionario ni mensaje enviado.
                </p>
              ) : null}

              <div className="mt-3 flex items-start gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 dark:bg-muted/15">
                <Globe className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Fuente del lead
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-foreground">{sourceLabel}</p>
                </div>
              </div>
            </div>

            <div
              className={cn(
                'absolute inset-0 overflow-hidden',
                detailTab !== 'actividad' && 'hidden',
              )}
              role="tabpanel"
              aria-hidden={detailTab !== 'actividad'}
            >
              <CompanyLeadActivityTimeline
                contact={contact}
                updates={updates}
                isWidget={leadDetailWidget.isWidget}
              />
            </div>

            <div
              className={cn(
                'absolute inset-0 overflow-y-auto overscroll-contain p-5',
                detailTab !== 'notas' && 'hidden',
              )}
              role="tabpanel"
              aria-hidden={detailTab !== 'notas'}
            >
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 dark:bg-muted/15">
                <div className="flex items-center justify-between gap-2">
                  <Label
                    htmlFor="lead-update-draft"
                    className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
                  >
                    Nueva nota
                  </Label>
                  <LeadReminderScheduleButton nextCode={nextReminderCode} onSchedule={onAddReminder} />
                </div>
                <textarea
                  id="lead-update-draft"
                  value={updateDraft}
                  onChange={(e) => onUpdateDraftChange(e.target.value)}
                  placeholder="Ej: Llamada de seguimiento agendada para mañana a las 10:00 AM…"
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      onAddUpdate();
                    }
                  }}
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">Ctrl+Enter para guardar</p>
                  <Button
                    type="button"
                    size="sm"
                    className={cn(ADMIN_PRIMARY_BTN_CLASS, 'h-9 px-4 text-sm')}
                    disabled={!updateDraft.trim()}
                    onClick={onAddUpdate}
                  >
                    Agregar nota
                  </Button>
                </div>
              </div>

              {updates.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {updates.map((update) => (
                    <LeadUpdateItem key={update.id} update={update} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-4 border-t border-border/60 px-5 py-4">
        <div className="flex min-w-0 items-center gap-2.5 text-sm text-muted-foreground">
          <div className="flex -space-x-2">
            {assignedMemberCount > 0 ? (
              Array.from({ length: Math.min(assignedMemberCount, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-indigo-100 text-xs font-semibold text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200"
                >
                  {i + 1}
                </div>
              ))
            ) : (
              <div className="flex size-8 items-center justify-center rounded-full border border-dashed border-border bg-muted/30">
                <Building2 className="size-4" aria-hidden />
              </div>
            )}
          </div>
          <span className="truncate">
            {assignedMemberCount === 0
              ? 'Sin miembros asignados'
              : `${assignedMemberCount} miembro${assignedMemberCount === 1 ? '' : 's'} asignado${assignedMemberCount === 1 ? '' : 's'}`}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9 px-4" onClick={onDiscard}>
            Descartar
          </Button>
        </div>
      </footer>
    </div>
  );
}
