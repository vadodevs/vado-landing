import { useEffect, useState } from 'react';
import { GitBranch, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AddToPipelineDialog } from '@/components/admin/AddToPipelineDialog';
import { OpportunityPipelineBoard } from '@/components/admin/OpportunityPipelineBoard';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS } from '@/lib/adminFilterUi';
import {
  loadPipelineLeads,
  PIPELINE_LEADS_CHANGE_EVENT,
  type PipelineLeadEntry,
} from '@/lib/adminOpportunitiesPipeline';
import { cn } from '@/lib/utils';

export default function AppAdminOportunidades() {
  const { t } = useTranslation();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pipelineEntries, setPipelineEntries] = useState<PipelineLeadEntry[]>(() =>
    loadPipelineLeads(),
  );

  useEffect(() => {
    const sync = () => setPipelineEntries(loadPipelineLeads());
    window.addEventListener(PIPELINE_LEADS_CHANGE_EVENT, sync);
    return () => window.removeEventListener(PIPELINE_LEADS_CHANGE_EVENT, sync);
  }, []);

  return (
    <AppShell
      pathWithoutLang="/app/admin/oportunidades"
      title={t('sidebarDemo.navOpportunities')}
      description={t('seo.appAdminOpportunities')}
      contentOverflow="hidden"
    >
      <section className="flex min-h-0 flex-1 flex-col gap-4">
        <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              <Target className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">{t('adminOpportunities.title')}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{t('adminOpportunities.subtitle')}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS}
            onClick={() => setPickerOpen(true)}
          >
            <GitBranch className="size-3.5 shrink-0" aria-hidden />
            <span className="text-[11px] font-semibold">{t('adminOpportunities.addToPipeline')}</span>
          </Button>
        </div>

        {pipelineEntries.length > 0 ? (
          <div className="flex min-h-0 flex-1 flex-col gap-2">
            <h3 className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t('adminOpportunities.pipelineSection', { count: pipelineEntries.length })}
            </h3>
            <p className="shrink-0 text-[11px] text-muted-foreground">{t('adminOpportunities.dragHint')}</p>
            <OpportunityPipelineBoard entries={pipelineEntries} onChange={setPipelineEntries} />
          </div>
        ) : (
          <p
            className={cn(
              'rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground',
            )}
          >
            {t('adminOpportunities.pipelineEmpty')}
          </p>
        )}
      </section>

      <AddToPipelineDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        pipelineEntries={pipelineEntries}
        onAdded={setPipelineEntries}
      />
    </AppShell>
  );
}
