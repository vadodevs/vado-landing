import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchEvolveLeads, type EvolveLeadRow } from '@/lib/adminEvolveLeadsApi';
import {
  addPipelineLead,
  isLeadInPipeline,
  type PipelineLeadEntry,
  type PipelineLeadSource,
} from '@/lib/adminOpportunitiesPipeline';
import { ADMIN_FILTER_PILL_CLASS, ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS } from '@/lib/adminFilterUi';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import { fetchCompanySubmissions, type CompanyContact } from '@/lib/companyAdminContact';
import { calificacionBadgeClass, leadInitials } from '@/lib/evolveLeadUi';
import { cn } from '@/lib/utils';

type TabKey = PipelineLeadSource;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineEntries: PipelineLeadEntry[];
  onAdded: (entries: PipelineLeadEntry[]) => void;
};

type LoadState = 'idle' | 'loading' | 'done' | 'error';

function searchFold(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchesSearch(haystack: string[], q: string): boolean {
  const folded = searchFold(q);
  if (!folded) return true;
  return haystack.some((part) => searchFold(part).includes(folded));
}

type LeadPickerRowProps = {
  initials: string;
  nombre: string;
  empresa: string;
  email: string;
  meta?: string;
  badge?: string;
  badgeClass?: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

function LeadPickerRow({
  initials,
  nombre,
  empresa,
  email,
  meta,
  badge,
  badgeClass,
  selected,
  disabled,
  onSelect,
}: LeadPickerRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
        disabled && 'cursor-not-allowed opacity-50',
        selected
          ? 'border-violet-400 bg-violet-50 ring-2 ring-violet-400/30 dark:border-violet-600 dark:bg-violet-950/40'
          : 'border-border/70 bg-card hover:border-border hover:bg-muted/30 dark:bg-muted/15',
      )}
    >
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold',
          selected
            ? 'bg-violet-200 text-violet-900 dark:bg-violet-900 dark:text-violet-100'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-foreground">{nombre}</p>
          {badge ? (
            <span
              className={cn(
                'inline-flex max-w-[140px] truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                badgeClass ?? 'bg-muted text-muted-foreground',
              )}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <p className="truncate text-xs text-muted-foreground">{empresa}</p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
      {meta ? <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">{meta}</span> : null}
    </button>
  );
}

export function AddToPipelineDialog({ open, onOpenChange, pipelineEntries, onAdded }: Props) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>('evolve');
  const [searchEvolve, setSearchEvolve] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [evolveLoad, setEvolveLoad] = useState<LoadState>('idle');
  const [companyLoad, setCompanyLoad] = useState<LoadState>('idle');
  const [evolveError, setEvolveError] = useState<string | null>(null);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [evolveRows, setEvolveRows] = useState<EvolveLeadRow[]>([]);
  const [companyRows, setCompanyRows] = useState<CompanyContact[]>([]);
  const [selectedEvolveId, setSelectedEvolveId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const resetSelection = useCallback(() => {
    setSelectedEvolveId(null);
    setSelectedCompanyId(null);
    setSearchEvolve('');
    setSearchCompany('');
  }, []);

  const loadEvolve = useCallback(async () => {
    setEvolveLoad('loading');
    setEvolveError(null);
    const res = await fetchEvolveLeads({ includeMeetings: false });
    if (!res.ok) {
      setEvolveLoad('error');
      setEvolveRows([]);
      if (res.reason === 'no-config') {
        setEvolveError(t('adminLeads.evolveErrorNoConfig'));
      } else if (res.reason === 'no-auth') {
        setEvolveError(t('adminLeads.evolveErrorNoAuth'));
      } else {
        setEvolveError(res.message?.trim() || t('adminLeads.evolveErrorGeneric'));
      }
      return;
    }
    setEvolveRows(res.data.contacts);
    setEvolveLoad('done');
  }, [t]);

  const loadCompany = useCallback(async () => {
    setCompanyLoad('loading');
    setCompanyError(null);
    const res = await fetchCompanySubmissions();
    if (!res.ok) {
      setCompanyLoad('error');
      setCompanyRows([]);
      setCompanyError(
        res.reason === 'no-config'
          ? t('adminOpportunities.companyErrorNoConfig')
          : t('adminOpportunities.companyErrorGeneric'),
      );
      return;
    }
    setCompanyRows(res.contacts);
    setCompanyLoad('done');
  }, [t]);

  useEffect(() => {
    if (!open) {
      resetSelection();
      return;
    }
    void loadEvolve();
    void loadCompany();
  }, [open, loadEvolve, loadCompany, resetSelection]);

  const filteredEvolve = useMemo(() => {
    const q = searchEvolve.trim();
    return [...evolveRows]
      .filter((row) =>
        matchesSearch(
          [row.nombre, row.empresa, row.email, row.telefono, row.calificacion, row.fuente],
          q,
        ),
      )
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [evolveRows, searchEvolve]);

  const filteredCompany = useMemo(() => {
    const q = searchCompany.trim();
    return [...companyRows]
      .filter((row) =>
        matchesSearch(
          [row.nombre, row.empresa, row.correo, row.telefono, row.servicio, row.mensaje],
          q,
        ),
      )
      .sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [companyRows, searchCompany]);

  const selectedEntry = useMemo(():
    | Omit<PipelineLeadEntry, 'addedAtMs' | 'stage'> & { stage?: PipelineLeadEntry['stage'] }
    | null => {
    if (activeTab === 'evolve' && selectedEvolveId) {
      const row = evolveRows.find((r) => r.id === selectedEvolveId);
      if (!row) return null;
      return {
        id: row.id,
        source: 'evolve',
        nombre: row.nombre,
        email: row.email,
        empresa: row.empresa,
        telefono: row.telefono,
      };
    }
    if (activeTab === 'company' && selectedCompanyId) {
      const row = companyRows.find((r) => r.id === selectedCompanyId);
      if (!row) return null;
      return {
        id: row.id,
        source: 'company',
        nombre: row.nombre,
        email: row.correo,
        empresa: row.empresa,
        telefono: row.telefono,
        servicio: row.servicio,
      };
    }
    return null;
  }, [activeTab, selectedEvolveId, selectedCompanyId, evolveRows, companyRows]);

  const handleConfirm = () => {
    if (!selectedEntry) return;
    if (isLeadInPipeline(pipelineEntries, selectedEntry.source, selectedEntry.id)) {
      toast.info(t('adminOpportunities.alreadyInPipeline'));
      onOpenChange(false);
      return;
    }
    const next = addPipelineLead({ ...selectedEntry, addedAtMs: Date.now() });
    onAdded(next);
    toast.success(t('adminOpportunities.addedToPipeline', { name: selectedEntry.nombre }));
    onOpenChange(false);
  };

  const renderListState = (load: LoadState, error: string | null, empty: boolean, emptyLabel: string) => {
    if (load === 'loading' || load === 'idle') {
      return (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('adminOpportunities.loadingLeads')}
        </div>
      );
    }
    if (load === 'error') {
      return (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-6 text-center text-sm text-destructive">
          {error}
        </p>
      );
    }
    if (empty) {
      return (
        <p className="rounded-lg border border-dashed border-border px-3 py-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent useAppDark className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border/60 px-5 py-4">
          <DialogTitle>{t('adminOpportunities.pickerTitle')}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabKey)}
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="border-b border-border/60 px-5 pt-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="evolve">{t('adminOpportunities.tabEvolve')}</TabsTrigger>
              <TabsTrigger value="company">{t('adminOpportunities.tabCompany')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="evolve" className="mt-0 flex min-h-0 flex-1 flex-col gap-3 px-5 py-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={searchEvolve}
                onChange={(e) => setSearchEvolve(e.target.value)}
                placeholder={t('adminLeads.evolveSearchPlaceholder')}
                className={cn(ADMIN_FILTER_PILL_CLASS, 'h-9 pl-9')}
              />
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {renderListState(
                evolveLoad,
                evolveError,
                filteredEvolve.length === 0,
                t('adminLeads.evolveEmpty'),
              )}
              {evolveLoad === 'done' &&
                filteredEvolve.map((row) => {
                  const inPipeline = isLeadInPipeline(pipelineEntries, 'evolve', row.id);
                  return (
                    <LeadPickerRow
                      key={row.id}
                      initials={leadInitials(row.nombre)}
                      nombre={row.nombre}
                      empresa={row.empresa}
                      email={row.email}
                      meta={row.fechaAlta}
                      badge={row.calificacion}
                      badgeClass={calificacionBadgeClass(row.calificacion)}
                      selected={selectedEvolveId === row.id}
                      disabled={inPipeline}
                      onSelect={() => setSelectedEvolveId(row.id)}
                    />
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="company" className="mt-0 flex min-h-0 flex-1 flex-col gap-3 px-5 py-4">
            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                placeholder={t('adminOpportunities.companySearchPlaceholder')}
                className={cn(ADMIN_FILTER_PILL_CLASS, 'h-9 pl-9')}
              />
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {renderListState(
                companyLoad,
                companyError,
                filteredCompany.length === 0,
                t('adminOpportunities.companyEmpty'),
              )}
              {companyLoad === 'done' &&
                filteredCompany.map((row) => {
                  const inPipeline = isLeadInPipeline(pipelineEntries, 'company', row.id);
                  return (
                    <LeadPickerRow
                      key={row.id}
                      initials={leadInitials(row.nombre)}
                      nombre={row.nombre}
                      empresa={row.empresa}
                      email={row.correo}
                      meta={row.fechaSolicitud}
                      badge={row.servicio !== 'Selecciona uno...' ? row.servicio : undefined}
                      selected={selectedCompanyId === row.id}
                      disabled={inPipeline}
                      onSelect={() => setSelectedCompanyId(row.id)}
                    />
                  );
                })}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t border-border/60 px-5 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('adminOpportunities.cancel')}
          </Button>
          <Button
            type="button"
            className={cn(ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS, ADMIN_PRIMARY_BTN_CLASS)}
            disabled={!selectedEntry}
            onClick={handleConfirm}
          >
            {t('adminOpportunities.confirmAdd')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
