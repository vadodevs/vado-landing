import { useState } from 'react';
import { ChevronRight, LayoutGrid, LayoutList, Megaphone, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Link, useLocation } from 'wouter';
import { CreateCampaignFromWorkflowDialog } from '@/components/admin/CreateCampaignFromWorkflowDialog';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS } from '@/lib/adminFilterUi';
import {
  addCampaign,
  listCampaigns,
  type Campaign,
  type CampaignStatus,
} from '@/lib/campaignsMock';
import { cn } from '@/lib/utils';

type CampaignView = 'list' | 'cards';

function getStatusBadgeColor(status: CampaignStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400';
    case 'completed':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-400';
    case 'draft':
      return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400';
    case 'paused':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-400';
    default:
      return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400';
  }
}

function getStatusLabel(status: CampaignStatus, t: TFunction) {
  const labels: Record<CampaignStatus, string> = {
    active: t('campaigns.statusActive'),
    completed: t('campaigns.statusCompleted'),
    draft: t('campaigns.statusDraft'),
    paused: t('campaigns.statusPaused'),
  };
  return labels[status];
}

function formatMetricRate(value: number, total: number) {
  if (value <= 0 || total <= 0) return null;
  return Math.round((value / total) * 100);
}

function CampaignStatusBadge({ status, t }: { status: CampaignStatus; t: TFunction }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
        getStatusBadgeColor(status),
      )}
    >
      {getStatusLabel(status, t)}
    </span>
  );
}

function CampaignMetricCell({ value, total }: { value: number; total: number }) {
  const rate = formatMetricRate(value, total);
  if (rate === null) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <span className="font-medium">
      {value} <span className="text-xs text-muted-foreground">({rate}%)</span>
    </span>
  );
}

function CampaignWorkflowMeta({ campaign, t }: { campaign: Campaign; t: TFunction }) {
  if (!campaign.autoLeadRunName && !campaign.channel) return null;
  return (
    <p className="mt-0.5 text-[11px] text-muted-foreground">
      {campaign.autoLeadRunName ?? null}
      {campaign.autoLeadRunName && campaign.channel ? ' · ' : null}
      {campaign.channel ? t(`campaigns.channel.${campaign.channel}`) : null}
    </p>
  );
}

export default function AppAdminCampanias() {
  const { t, i18n } = useTranslation();
  const { path } = useLocale();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<CampaignView>('list');
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => listCampaigns());
  const [wizardOpen, setWizardOpen] = useState(false);
  const dateLocale = i18n.language?.startsWith('en') ? 'en-US' : 'es-ES';

  const totalContacts = campaigns.reduce((sum, c) => sum + c.contacts, 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + c.opens, 0);

  const openCampaign = (id: string) => {
    setLocation(path(`/app/admin/campanas/${id}`));
  };

  return (
    <AppShell
      pathWithoutLang="/app/admin/campanas"
      title={t('sidebarDemo.navCampanias')}
      description={t('seo.appAdminCampaigns')}
    >
      <section className="flex flex-col gap-4">
        <div className="flex shrink-0 flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
              <Megaphone className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">{t('campaigns.title')}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{t('campaigns.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex items-center rounded-md border border-border/60 bg-background p-0.5"
              role="group"
              aria-label={t('campaigns.viewToggleAria')}
            >
              <button
                type="button"
                aria-pressed={view === 'list'}
                aria-label={t('campaigns.viewList')}
                onClick={() => setView('list')}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-sm transition-colors',
                  view === 'list'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <LayoutList className="size-3.5" strokeWidth={2} aria-hidden />
              </button>
              <button
                type="button"
                aria-pressed={view === 'cards'}
                aria-label={t('campaigns.viewCards')}
                onClick={() => setView('cards')}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-sm transition-colors',
                  view === 'cards'
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <LayoutGrid className="size-3.5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS}
              onClick={() => setWizardOpen(true)}
            >
              <Plus className="size-3.5 shrink-0" aria-hidden />
              <span className="text-[11px] font-semibold">{t('campaigns.createCampaign')}</span>
            </Button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="overflow-hidden rounded-lg border border-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      {t('campaigns.columnName')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      {t('campaigns.columnWorkflow')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      {t('campaigns.columnStatus')}
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                      {t('campaigns.columnDate')}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {t('campaigns.columnContacts')}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {t('campaigns.columnOpens')}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      {t('campaigns.columnClicks')}
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">
                      <span className="sr-only">{t('campaigns.viewDetail')}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign, idx) => (
                    <tr
                      key={campaign.id}
                      role="link"
                      tabIndex={0}
                      onClick={() => openCampaign(campaign.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openCampaign(campaign.id);
                        }
                      }}
                      className={cn(
                        'cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/40',
                        idx === campaigns.length - 1 && 'border-b-0',
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-foreground underline-offset-2 group-hover:underline">
                          {campaign.name}
                        </span>
                        {campaign.channel ? (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {t(`campaigns.channel.${campaign.channel}`)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {campaign.autoLeadRunName ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <CampaignStatusBadge status={campaign.status} t={t} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(campaign.createdAt).toLocaleDateString(dateLocale)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium">{campaign.contacts}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CampaignMetricCell value={campaign.opens} total={campaign.contacts} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <CampaignMetricCell value={campaign.clicks} total={campaign.contacts} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                          {t('campaigns.viewDetail')}
                          <ChevronRight className="size-3.5" aria-hidden />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => {
              const openRate = formatMetricRate(campaign.opens, campaign.contacts);
              const clickRate = formatMetricRate(campaign.clicks, campaign.contacts);
              return (
                <Link
                  key={campaign.id}
                  href={path(`/app/admin/campanas/${campaign.id}`)}
                  className="flex flex-col gap-3 rounded-lg border border-border/50 bg-background p-4 transition-colors hover:border-primary/30 hover:bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{campaign.name}</p>
                      <CampaignWorkflowMeta campaign={campaign} t={t} />
                    </div>
                    <CampaignStatusBadge status={campaign.status} t={t} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(campaign.createdAt).toLocaleDateString(dateLocale)}
                  </p>
                  <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border/50 pt-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('campaigns.columnContacts')}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{campaign.contacts}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('campaigns.columnOpens')}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {openRate === null ? '-' : `${campaign.opens}`}
                        {openRate !== null ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            ({openRate}%)
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('campaigns.columnClicks')}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {clickRate === null ? '-' : `${campaign.clicks}`}
                        {clickRate !== null ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            ({clickRate}%)
                          </span>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    {t('campaigns.viewDetail')}
                    <ChevronRight className="size-3.5" aria-hidden />
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('campaigns.statTotalCampaigns')}
            </p>
            <p className="mt-2 text-2xl font-bold">{campaigns.length}</p>
          </div>
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('campaigns.statActiveCampaigns')}
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {campaigns.filter((c) => c.status === 'active').length}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('campaigns.statTotalContacts')}
            </p>
            <p className="mt-2 text-2xl font-bold">{totalContacts}</p>
          </div>
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('campaigns.statAvgOpenRate')}
            </p>
            <p className="mt-2 text-2xl font-bold">
              {totalContacts > 0 ? Math.round((totalOpens / totalContacts) * 100) : 0}%
            </p>
          </div>
        </div>
      </section>

      <CreateCampaignFromWorkflowDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onCreated={(campaign) => {
          addCampaign(campaign);
          setCampaigns(listCampaigns());
        }}
      />
    </AppShell>
  );
}
