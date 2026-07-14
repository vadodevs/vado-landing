import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { useAdminAssignedProjects } from '@/contexts/AdminAssignedProjectsContext';
import type { AdminSelectOption } from '@/components/app/AdminSelect';
import {
  CompanyLeadDetailPanel,
  type CompanyLeadDetailTab,
} from '@/components/admin/CompanyLeadDetailPanel';
import { EvolveLeadDetailDialog } from '@/components/admin/EvolveLeadDetailDialog';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchEvolveLeads, type EvolveLeadRow } from '@/lib/adminEvolveLeadsApi';
import {
  createCompanyLeadUpdateApi,
  fetchCompanyLeadStatuses,
  patchCompanyLeadStatusApi,
} from '@/lib/adminWorkspaceApi';
import {
  formatPipelineAmountUsd,
  type PipelineLeadEntry,
} from '@/lib/adminOpportunitiesPipeline';
import { chatWidgetDetailForAdmin } from '@/lib/chatWidgetLead';
import { fetchCompanySubmissions, type CompanyContact } from '@/lib/companyAdminContact';
import { requestOpenCompanyLead } from '@/lib/companyLeadDeepLink';
import {
  COMPANY_LEAD_STATUSES,
  COMPANY_LEAD_STATUS_LABELS,
  applyCompanyLeadStatusOverride,
  dispatchLeadStatusChanged,
  getCompanyLeadStatus,
  LEAD_STATUS_CHANGED_EVENT,
  type CompanyLeadStatus,
} from '@/lib/companyLeadStatus';
import {
  appendCompanyLeadUpdate,
  COMPANY_LEAD_UPDATES_CHANGE_EVENT,
  dispatchCompanyLeadUpdatesChange,
  formatCompanyLeadUpdateWhen,
  getNextReminderCode,
  loadCompanyLeadUpdates,
  type CompanyLeadUpdate,
} from '@/lib/companyLeadUpdates';
import { calificacionBadgeClass } from '@/lib/evolveLeadUi';
import { useLocale } from '@/hooks/useLocale';

type Props = {
  entry: PipelineLeadEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAmountChange: (amount: number | undefined) => void;
};

type LoadState = 'idle' | 'loading' | 'done' | 'error';

const LEAD_STATUS_OPTIONS: AdminSelectOption[] = COMPANY_LEAD_STATUSES.map((s) => ({
  value: s,
  label: COMPANY_LEAD_STATUS_LABELS[s],
}));

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

function leadInitials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

function PipelineAmountBar({
  amountDraft,
  onAmountDraftChange,
  onSave,
  onClear,
  hasAmount,
  amountLabel,
  t,
}: {
  amountDraft: string;
  onAmountDraftChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
  hasAmount: boolean;
  amountLabel: string | null;
  t: (key: string) => string;
}) {
  return (
    <div className="shrink-0 border-b border-border/60 bg-muted/15 px-5 py-3 dark:bg-muted/10">
      <Label htmlFor="pipeline-detail-amount" className="text-xs">
        {t('adminOpportunities.estimatedAmountLabel')}
        {amountLabel ? (
          <span className="ml-2 font-semibold tabular-nums text-emerald-700 dark:text-emerald-300">
            ({amountLabel})
          </span>
        ) : null}
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
              onSave();
            }
          }}
          className="h-9 max-w-[200px] text-sm"
        />
        <Button type="button" size="sm" className="h-9 text-xs" onClick={onSave}>
          {t('adminOpportunities.estimatedAmountSave')}
        </Button>
        {hasAmount ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-9 text-xs text-muted-foreground"
            onClick={onClear}
          >
            {t('adminOpportunities.estimatedAmountClear')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function PipelineLeadDetailDialog({ entry, open, onOpenChange, onAmountChange }: Props) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [, setLocation] = useLocation();
  const { assignedProjects, removeAssignedProjectByContactId } = useAdminAssignedProjects();

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [contact, setContact] = useState<CompanyContact | null>(null);
  const [evolveLead, setEvolveLead] = useState<EvolveLeadRow | null>(null);
  const [leadStatusOverrides, setLeadStatusOverrides] = useState<Record<string, CompanyLeadStatus>>(
    {},
  );
  const [leadUpdatesById, setLeadUpdatesById] = useState<Record<string, CompanyLeadUpdate[]>>({});
  const [leadUpdateDraft, setLeadUpdateDraft] = useState('');
  const [detailTab, setDetailTab] = useState<CompanyLeadDetailTab>('actividad');
  const [emailCopied, setEmailCopied] = useState(false);
  const [copiedEvolveEmail, setCopiedEvolveEmail] = useState<string | null>(null);
  const [amountDraft, setAmountDraft] = useState('');

  const refreshUpdates = useCallback(() => {
    void loadCompanyLeadUpdates().then(setLeadUpdatesById);
  }, []);

  const refreshStatuses = useCallback(() => {
    void fetchCompanyLeadStatuses().then(setLeadStatusOverrides);
  }, []);

  useEffect(() => {
    if (!open) return;
    refreshUpdates();
    refreshStatuses();
    window.addEventListener(COMPANY_LEAD_UPDATES_CHANGE_EVENT, refreshUpdates);
    window.addEventListener(LEAD_STATUS_CHANGED_EVENT, refreshStatuses);
    return () => {
      window.removeEventListener(COMPANY_LEAD_UPDATES_CHANGE_EVENT, refreshUpdates);
      window.removeEventListener(LEAD_STATUS_CHANGED_EVENT, refreshStatuses);
    };
  }, [open, refreshUpdates, refreshStatuses]);

  useEffect(() => {
    if (!open || !entry) {
      setLoadState('idle');
      setContact(null);
      setEvolveLead(null);
      return;
    }

    const currentEntry = entry;
    setDetailTab('actividad');
    setLeadUpdateDraft('');
    setEmailCopied(false);
    setAmountDraft(
      currentEntry.estimatedAmountUsd != null ? String(currentEntry.estimatedAmountUsd) : '',
    );
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

  const leadDetailWidget = useMemo(
    () =>
      contact
        ? chatWidgetDetailForAdmin(contact)
        : { isWidget: false as const, rows: [] as { label: string; value: string }[] },
    [contact],
  );

  const updates = useMemo(() => {
    if (!contact) return [];
    return leadUpdatesById[contact.id] ?? [];
  }, [contact, leadUpdatesById]);

  const assignedMemberCount = useMemo(() => {
    if (!contact) return 0;
    const project = assignedProjects.find((p) => p.contactId === contact.id);
    return project?.prospectos.length ?? 0;
  }, [assignedProjects, contact]);

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

  const updateLeadStatus = (id: string, next: CompanyLeadStatus) => {
    setLeadStatusOverrides((prev) => applyCompanyLeadStatusOverride(prev, id, next));
    void patchCompanyLeadStatusApi(id, next).then(() => dispatchLeadStatusChanged());
    if (next !== 'en_curso') {
      void removeAssignedProjectByContactId(id);
    }
  };

  const addLeadUpdate = () => {
    if (!contact) return;
    const body = leadUpdateDraft.trim();
    if (!body) return;
    void createCompanyLeadUpdateApi(contact.id, { body, kind: 'note' }).then((created) => {
      if (!created) return;
      setLeadUpdatesById((prev) => appendCompanyLeadUpdate(prev, contact.id, created));
      dispatchCompanyLeadUpdatesChange();
      setLeadUpdateDraft('');
      setDetailTab('actividad');
    });
  };

  const addLeadReminder = (scheduledAtMs: number, note?: string) => {
    if (!contact) return;
    const list = leadUpdatesById[contact.id] ?? [];
    const reminderCode = getNextReminderCode(list);
    const scheduledLabel = formatCompanyLeadUpdateWhen(scheduledAtMs);
    const trimmedNote = note?.trim();
    const body = trimmedNote || `Seguimiento ${reminderCode} agendado para ${scheduledLabel}`;
    void createCompanyLeadUpdateApi(contact.id, {
      body,
      kind: 'reminder',
      scheduledAtMs,
      contactName: contact.nombre,
      contactEmail: contact.correo,
    }).then((created) => {
      if (!created) return;
      setLeadUpdatesById((prev) => appendCompanyLeadUpdate(prev, contact.id, created));
      dispatchCompanyLeadUpdatesChange();
      setDetailTab('actividad');
    });
  };

  const copyEmail = (email: string) => {
    void navigator.clipboard.writeText(email).then(() => {
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1500);
    });
  };

  const copyEvolveEmail = (email: string) => {
    void navigator.clipboard.writeText(email).then(() => {
      setCopiedEvolveEmail(email);
      window.setTimeout(() => setCopiedEvolveEmail(null), 1500);
    });
  };

  const goAssignOnLeadsPage = () => {
    if (!contact) return;
    requestOpenCompanyLead(contact.id, 'cuestionario');
    onOpenChange(false);
    setLocation(path('/app/admin/company'));
  };

  if (!entry) return null;

  const amountLabel = formatPipelineAmountUsd(entry.estimatedAmountUsd);

  if (entry.source === 'evolve') {
    if (loadState === 'loading') {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent useAppDark showCloseButton className="sm:max-w-md">
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t('adminOpportunities.detailLoading')}
            </div>
          </DialogContent>
        </Dialog>
      );
    }
    if (loadState === 'error' || !evolveLead) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent useAppDark showCloseButton className="sm:max-w-md">
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t('adminOpportunities.detailLoadError')}
            </p>
          </DialogContent>
        </Dialog>
      );
    }
    return (
      <EvolveLeadDetailDialog
        lead={evolveLead}
        open={open}
        onOpenChange={onOpenChange}
        calificacionBadgeClass={calificacionBadgeClass}
        onCopyEmail={copyEvolveEmail}
        copiedEmail={copiedEvolveEmail}
        headerExtra={
          <PipelineAmountBar
            amountDraft={amountDraft}
            onAmountDraftChange={setAmountDraft}
            onSave={saveAmount}
            onClear={clearAmount}
            hasAmount={entry.estimatedAmountUsd != null}
            amountLabel={amountLabel}
            t={t}
          />
        }
      />
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          setDetailTab('actividad');
          setLeadUpdateDraft('');
        }
      }}
    >
      <DialogContent
        useAppDark
        showCloseButton
        className="flex h-[min(760px,calc(100vh-2rem))] max-h-[min(760px,calc(100vh-2rem))] w-[min(1200px,calc(100vw-2rem))] min-h-0 flex-col gap-0 overflow-hidden !p-0 sm:!max-w-[min(1200px,calc(100vw-2rem))]"
      >
        {loadState === 'loading' ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {t('adminOpportunities.detailLoading')}
          </div>
        ) : contact ? (
          <>
            <PipelineAmountBar
              amountDraft={amountDraft}
              onAmountDraftChange={setAmountDraft}
              onSave={saveAmount}
              onClear={clearAmount}
              hasAmount={entry.estimatedAmountUsd != null}
              amountLabel={amountLabel}
              t={t}
            />
            <div className="min-h-0 flex-1 overflow-hidden">
              <CompanyLeadDetailPanel
                contact={contact}
                leadEstado={getCompanyLeadStatus(leadStatusOverrides, contact.id)}
                leadDetailWidget={leadDetailWidget}
                detailTab={detailTab}
                onDetailTabChange={setDetailTab}
                updates={updates}
                updateDraft={leadUpdateDraft}
                onUpdateDraftChange={setLeadUpdateDraft}
                onAddUpdate={addLeadUpdate}
                onAddReminder={addLeadReminder}
                onStatusChange={(status) => updateLeadStatus(contact.id, status)}
                statusOptions={LEAD_STATUS_OPTIONS}
                onCopyEmail={copyEmail}
                emailCopied={emailCopied}
                assignedMemberCount={assignedMemberCount}
                onDiscard={() => updateLeadStatus(contact.id, 'descartado')}
                onAssignProject={goAssignOnLeadsPage}
                initials={leadInitials(contact.nombre)}
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
