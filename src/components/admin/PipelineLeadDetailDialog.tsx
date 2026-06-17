import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Calendar,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CompanyLeadActivityTimeline } from '@/components/admin/CompanyLeadActivityTimeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchEvolveLeads, type EvolveLeadRow } from '@/lib/adminEvolveLeadsApi';
import {
  formatPipelineAmountUsd,
  type PipelineLeadEntry,
  type PipelineStage,
} from '@/lib/adminOpportunitiesPipeline';
import { chatWidgetDetailForAdmin } from '@/lib/chatWidgetLead';
import { fetchCompanySubmissions, type CompanyContact } from '@/lib/companyAdminContact';
import {
  COMPANY_LEAD_UPDATES_CHANGE_EVENT,
  loadCompanyLeadUpdates,
  type CompanyLeadUpdate,
} from '@/lib/companyLeadUpdates';
import { calificacionBadgeClass } from '@/lib/evolveLeadUi';
import { cn } from '@/lib/utils';

type DetailTab = 'datos' | 'actividad';

type Props = {
  entry: PipelineLeadEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAmountChange: (amount: number | undefined) => void;
};

type LoadState = 'idle' | 'loading' | 'done' | 'error';

function pipelineEntryToFallbackContact(entry: PipelineLeadEntry): CompanyContact {
  return {
    id: entry.id,
    nombre: entry.nombre,
    correo: entry.email,
    empresa: entry.empresa,
    telefono: entry.telefono?.trim() || '—',
    servicio: entry.servicio?.trim() || 'Selecciona uno...',
    mensaje: '',
    sector: '',
    ciudad: '',
    fechaSolicitud: '—',
    createdAtMs: entry.addedAtMs,
  };
}

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-muted/25 p-2.5', className)}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{value || '—'}</p>
    </div>
  );
}

function CompanyDatosTab({
  contact,
  widgetDetail,
  stageLabel,
  amountDraft,
  onAmountDraftChange,
  onAmountSave,
  onAmountClear,
  hasAmount,
  t,
}: {
  contact: CompanyContact;
  widgetDetail: ReturnType<typeof chatWidgetDetailForAdmin>;
  stageLabel: string;
  amountDraft: string;
  onAmountDraftChange: (value: string) => void;
  onAmountSave: () => void;
  onAmountClear: () => void;
  hasAmount: boolean;
  t: (key: string, opts?: Record<string, string>) => string;
}) {
  const questionnaireRows = widgetDetail.rows;
  const longRows = questionnaireRows.filter((row) => row.value.length > 80);
  const shortRows = questionnaireRows.filter((row) => row.value.length <= 80);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5 sm:col-span-2">
          <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{t('adminOpportunities.detailEmail')}</p>
            <p className="truncate text-sm font-medium text-foreground" title={contact.correo}>
              {contact.correo || '—'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5">
          <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{t('adminOpportunities.detailPhone')}</p>
            <p className="text-sm font-medium text-foreground">{contact.telefono || '—'}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5">
          <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{t('adminOpportunities.detailCompany')}</p>
            <p className="text-sm font-medium text-foreground">{contact.empresa || '—'}</p>
          </div>
        </div>
        <DetailField label={t('adminOpportunities.detailInterest')} value={contact.servicio} />
        <DetailField label={t('adminOpportunities.detailRequestDate')} value={contact.fechaSolicitud} />
        <DetailField label={t('adminOpportunities.detailPipelineStage')} value={stageLabel} className="sm:col-span-2" />
        {shortRows.map((row, idx) => (
          <DetailField key={`${idx}-${row.label}`} label={row.label} value={row.value} />
        ))}
        {longRows.map((row, idx) => (
          <DetailField
            key={`long-${idx}-${row.label}`}
            label={row.label}
            value={row.value}
            className="sm:col-span-2"
          />
        ))}
        {!widgetDetail.isWidget && contact.mensaje.trim() ? (
          <DetailField
            label={t('adminOpportunities.detailMessage')}
            value={contact.mensaje.trim()}
            className="sm:col-span-2"
          />
        ) : null}
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/15 p-3 dark:bg-muted/10">
        <Label htmlFor="pipeline-detail-amount" className="text-xs">
          {t('adminOpportunities.estimatedAmountLabel')}
        </Label>
        <div className="mt-2 flex flex-wrap gap-2">
          <Input
            id="pipeline-detail-amount"
            type="number"
            min={0}
            step={100}
            inputMode="decimal"
            placeholder={t('adminOpportunities.estimatedAmountPlaceholder')}
            value={amountDraft}
            onChange={(e) => onAmountDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAmountSave();
              }
            }}
            className="h-9 max-w-[200px] text-sm"
          />
          <Button type="button" size="sm" className="h-9 text-xs" onClick={onAmountSave}>
            {t('adminOpportunities.estimatedAmountSave')}
          </Button>
          {hasAmount ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 text-xs text-muted-foreground"
              onClick={onAmountClear}
            >
              {t('adminOpportunities.estimatedAmountClear')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EvolveDatosTab({
  lead,
  stageLabel,
  amountDraft,
  onAmountDraftChange,
  onAmountSave,
  onAmountClear,
  hasAmount,
  t,
}: {
  lead: EvolveLeadRow;
  stageLabel: string;
  amountDraft: string;
  onAmountDraftChange: (value: string) => void;
  onAmountSave: () => void;
  onAmountClear: () => void;
  hasAmount: boolean;
  t: (key: string, opts?: Record<string, string>) => string;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5 sm:col-span-2">
          <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{t('adminLeads.evolveColContacto')}</p>
            <p className="truncate text-sm font-medium text-foreground" title={lead.email}>
              {lead.email}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5">
          <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{t('adminLeads.evolveDetailPhone')}</p>
            <p className="text-sm font-medium text-foreground">{lead.telefono}</p>
          </div>
        </div>
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5">
          <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">{t('adminLeads.evolveColEmpresa')}</p>
            <p className="text-sm font-medium text-foreground">{lead.empresa}</p>
          </div>
        </div>
        <DetailField label={t('adminLeads.evolveColFuente')} value={lead.fuente} />
        <DetailField label={t('adminLeads.evolveColUrgencia')} value={lead.urgencia} />
        <DetailField label={t('adminLeads.evolveColEtapa')} value={lead.etapaNegocio} />
        <DetailField label={t('adminLeads.evolveDetailClaridad')} value={lead.claridad} />
        <DetailField label={t('adminLeads.evolveColAnuncio')} value={lead.anuncio} />
        <DetailField
          label={t('adminLeads.evolveColPipeline')}
          value={lead.pipelineStatus}
          className="capitalize"
        />
        <DetailField label={t('adminLeads.evolveColFecha')} value={lead.fechaAlta} />
        <DetailField label={t('adminOpportunities.detailPipelineStage')} value={stageLabel} />
        {lead.meetingLink ? (
          <div className="rounded-lg border border-border bg-muted/25 p-2.5 sm:col-span-2">
            <div className="flex items-center gap-2">
              <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {t('adminLeads.evolveColCita')}
              </p>
            </div>
            {lead.meetingTitle ? (
              <p className="mt-2 text-sm font-medium text-foreground">{lead.meetingTitle}</p>
            ) : null}
            {lead.meetingStart ? (
              <p className="text-xs text-muted-foreground">{lead.meetingStart}</p>
            ) : null}
            <Button asChild variant="outline" size="sm" className="mt-2 h-8 gap-1.5">
              <a href={lead.meetingLink} target="_blank" rel="noopener noreferrer">
                {t('adminLeads.evolveMeetingLink')}
                <ExternalLink className="size-3" aria-hidden />
              </a>
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/15 p-3 dark:bg-muted/10">
        <Label htmlFor="pipeline-detail-amount-evolve" className="text-xs">
          {t('adminOpportunities.estimatedAmountLabel')}
        </Label>
        <div className="mt-2 flex flex-wrap gap-2">
          <Input
            id="pipeline-detail-amount-evolve"
            type="number"
            min={0}
            step={100}
            inputMode="decimal"
            placeholder={t('adminOpportunities.estimatedAmountPlaceholder')}
            value={amountDraft}
            onChange={(e) => onAmountDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onAmountSave();
              }
            }}
            className="h-9 max-w-[200px] text-sm"
          />
          <Button type="button" size="sm" className="h-9 text-xs" onClick={onAmountSave}>
            {t('adminOpportunities.estimatedAmountSave')}
          </Button>
          {hasAmount ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 text-xs text-muted-foreground"
              onClick={onAmountClear}
            >
              {t('adminOpportunities.estimatedAmountClear')}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EvolveActivityTab({ lead, t }: { lead: EvolveLeadRow; t: (key: string) => string }) {
  if (!lead.meetingStart && !lead.meetingLink) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        {t('adminOpportunities.evolveActivityEmpty')}
      </p>
    );
  }

  return (
    <div className="px-5 py-4">
      <div className="rounded-xl border border-border/70 bg-muted/10 p-4">
        <p className="text-sm font-semibold text-foreground">{t('adminLeads.evolveColCita')}</p>
        {lead.meetingTitle ? (
          <p className="mt-1 text-sm text-foreground">{lead.meetingTitle}</p>
        ) : null}
        {lead.meetingStart ? (
          <p className="mt-1 text-xs text-muted-foreground">{lead.meetingStart}</p>
        ) : null}
        {lead.meetingLink ? (
          <Button asChild variant="outline" size="sm" className="mt-3 h-8 gap-1.5">
            <a href={lead.meetingLink} target="_blank" rel="noopener noreferrer">
              {t('adminLeads.evolveMeetingLink')}
              <ExternalLink className="size-3" aria-hidden />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function PipelineLeadDetailDialog({ entry, open, onOpenChange, onAmountChange }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<DetailTab>('datos');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [contact, setContact] = useState<CompanyContact | null>(null);
  const [evolveLead, setEvolveLead] = useState<EvolveLeadRow | null>(null);
  const [updatesMap, setUpdatesMap] = useState<Record<string, CompanyLeadUpdate[]>>(() =>
    loadCompanyLeadUpdates(),
  );
  const [amountDraft, setAmountDraft] = useState('');

  const stageLabel = entry
    ? t(`adminOpportunities.stage.${entry.stage as PipelineStage}`)
    : '';

  const refreshUpdates = useCallback(() => {
    setUpdatesMap(loadCompanyLeadUpdates());
  }, []);

  useEffect(() => {
    if (!open) return;
    refreshUpdates();
    window.addEventListener(COMPANY_LEAD_UPDATES_CHANGE_EVENT, refreshUpdates);
    return () => window.removeEventListener(COMPANY_LEAD_UPDATES_CHANGE_EVENT, refreshUpdates);
  }, [open, refreshUpdates]);

  useEffect(() => {
    if (!open || !entry) {
      setLoadState('idle');
      return;
    }

    const currentEntry = entry;
    setTab('datos');
    setAmountDraft(currentEntry.estimatedAmountUsd != null ? String(currentEntry.estimatedAmountUsd) : '');
    let cancelled = false;

    async function load() {
      setLoadState('loading');
      if (currentEntry.source === 'company') {
        const result = await fetchCompanySubmissions();
        if (cancelled) return;
        const found = result.ok ? result.contacts.find((c) => c.id === currentEntry.id) : null;
        setContact(found ?? pipelineEntryToFallbackContact(currentEntry));
        setEvolveLead(null);
        setLoadState('done');
        return;
      }

      const result = await fetchEvolveLeads();
      if (cancelled) return;
      const found = result.ok ? result.data.contacts.find((c) => c.id === currentEntry.id) : null;
      setEvolveLead(found ?? null);
      setContact(null);
      setLoadState(found ? 'done' : 'error');
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open, entry]);

  const widgetDetail = useMemo(
    () => (contact ? chatWidgetDetailForAdmin(contact) : { isWidget: false, rows: [] }),
    [contact],
  );

  const updates = useMemo(() => {
    if (!entry || !contact) return [];
    return updatesMap[entry.id] ?? [];
  }, [entry, contact, updatesMap]);

  const saveAmount = () => {
    const trimmed = amountDraft.trim().replace(/,/g, '');
    if (!trimmed) {
      onAmountChange(undefined);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    onAmountChange(parsed);
  };

  const clearAmount = () => {
    setAmountDraft('');
    onAmountChange(undefined);
  };

  if (!entry) return null;

  const sourceBadge =
    entry.source === 'evolve'
      ? t('adminOpportunities.sourceEvolve')
      : t('adminOpportunities.sourceCompany');

  const amountLabel = formatPipelineAmountUsd(entry.estimatedAmountUsd);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        useAppDark
        showCloseButton
        className="flex max-h-[min(92svh,880px)] min-h-0 flex-col gap-0 overflow-hidden !p-0 sm:!max-w-2xl"
      >
        <DialogHeader className="shrink-0 space-y-2 border-b border-border/60 px-5 py-4 pr-12 text-left">
          <div className="flex flex-wrap items-start gap-2">
            <DialogTitle className="text-lg leading-tight">{entry.nombre}</DialogTitle>
            <Badge variant="secondary" className="text-[10px]">
              {sourceBadge}
            </Badge>
            {evolveLead ? (
              <Badge
                variant="secondary"
                className={cn('text-[10px] font-medium', calificacionBadgeClass(evolveLead.calificacion))}
              >
                {evolveLead.calificacion}
              </Badge>
            ) : null}
          </div>
          <DialogDescription className="line-clamp-2">
            {entry.empresa}
            {amountLabel ? (
              <span className="ml-2 font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
                · {amountLabel}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {loadState === 'loading' ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('adminOpportunities.detailLoading')}
          </div>
        ) : loadState === 'error' && entry.source === 'evolve' ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            {t('adminOpportunities.detailLoadError')}
          </p>
        ) : (
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as DetailTab)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <TabsList className="mx-5 mt-3 h-9 w-full shrink-0 justify-start rounded-lg bg-muted/40 p-1">
              <TabsTrigger value="datos" className="flex-1 text-xs sm:flex-none sm:px-4">
                {t('adminOpportunities.detailTabDatos')}
              </TabsTrigger>
              <TabsTrigger value="actividad" className="flex-1 text-xs sm:flex-none sm:px-4">
                {t('adminOpportunities.detailTabActividad')}
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="datos"
              className="mt-0 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 focus-visible:outline-none"
            >
              {entry.source === 'company' && contact ? (
                <CompanyDatosTab
                  contact={contact}
                  widgetDetail={widgetDetail}
                  stageLabel={stageLabel}
                  amountDraft={amountDraft}
                  onAmountDraftChange={setAmountDraft}
                  onAmountSave={saveAmount}
                  onAmountClear={clearAmount}
                  hasAmount={entry.estimatedAmountUsd != null}
                  t={t}
                />
              ) : evolveLead ? (
                <EvolveDatosTab
                  lead={evolveLead}
                  stageLabel={stageLabel}
                  amountDraft={amountDraft}
                  onAmountDraftChange={setAmountDraft}
                  onAmountSave={saveAmount}
                  onAmountClear={clearAmount}
                  hasAmount={entry.estimatedAmountUsd != null}
                  t={t}
                />
              ) : null}
            </TabsContent>

            <TabsContent
              value="actividad"
              className="mt-0 min-h-0 flex-1 overflow-hidden focus-visible:outline-none"
            >
              {entry.source === 'company' && contact ? (
                <CompanyLeadActivityTimeline
                  contact={contact}
                  updates={updates}
                  isWidget={widgetDetail.isWidget}
                />
              ) : evolveLead ? (
                <EvolveActivityTab lead={evolveLead} t={t} />
              ) : null}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
