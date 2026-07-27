import { Megaphone, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS } from '@/lib/adminFilterUi';
import { cn } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  createdAt: string;
  contacts: number;
  opens: number;
  clicks: number;
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Campaña de Bienvenida Q3',
    status: 'active',
    createdAt: '2024-07-01',
    contacts: 245,
    opens: 89,
    clicks: 34,
  },
  {
    id: '2',
    name: 'Oferta de Desarrolladores Junior',
    status: 'active',
    createdAt: '2024-07-10',
    contacts: 156,
    opens: 67,
    clicks: 28,
  },
  {
    id: '3',
    name: 'Follow-up Leads Inactivos',
    status: 'completed',
    createdAt: '2024-06-15',
    contacts: 312,
    opens: 142,
    clicks: 56,
  },
  {
    id: '4',
    name: 'Prueba A/B Asunto Email',
    status: 'draft',
    createdAt: '2024-07-20',
    contacts: 0,
    opens: 0,
    clicks: 0,
  },
  {
    id: '5',
    name: 'Reactivación de Clientes',
    status: 'paused',
    createdAt: '2024-07-05',
    contacts: 423,
    opens: 198,
    clicks: 82,
  },
];

function getStatusBadgeColor(status: Campaign['status']) {
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

function getStatusLabel(status: Campaign['status'], t: TFunction) {
  const labels: Record<Campaign['status'], string> = {
    active: t('campaigns.statusActive'),
    completed: t('campaigns.statusCompleted'),
    draft: t('campaigns.statusDraft'),
    paused: t('campaigns.statusPaused'),
  };
  return labels[status];
}

export default function AppAdminCampanias() {
  const { t } = useTranslation();

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
          <Button type="button" variant="outline" size="sm" className={ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS}>
            <Plus className="size-3.5 shrink-0" aria-hidden />
            <span className="text-[11px] font-semibold">{t('campaigns.createCampaign')}</span>
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">
                    {t('campaigns.columnName')}
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
                </tr>
              </thead>
              <tbody>
                {mockCampaigns.map((campaign, idx) => (
                  <tr
                    key={campaign.id}
                    className={cn(
                      'border-b border-border/50 transition-colors hover:bg-muted/30',
                      idx === mockCampaigns.length - 1 && 'border-b-0',
                    )}
                  >
                    <td className="px-4 py-3">
                      <a
                        href="#"
                        className="font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {campaign.name}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                          getStatusBadgeColor(campaign.status),
                        )}
                      >
                        {getStatusLabel(campaign.status, t)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(campaign.createdAt).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-medium">{campaign.contacts}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {campaign.opens > 0 ? (
                        <span className="font-medium">
                          {campaign.opens}{' '}
                          <span className="text-xs text-muted-foreground">
                            ({Math.round((campaign.opens / campaign.contacts) * 100)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {campaign.clicks > 0 ? (
                        <span className="font-medium">
                          {campaign.clicks}{' '}
                          <span className="text-xs text-muted-foreground">
                            ({Math.round((campaign.clicks / campaign.contacts) * 100)}%)
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('campaigns.statTotalCampaigns')}
            </p>
            <p className="mt-2 text-2xl font-bold">{mockCampaigns.length}</p>
          </div>
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('campaigns.statActiveCampaigns')}
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {mockCampaigns.filter((c) => c.status === 'active').length}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('campaigns.statTotalContacts')}
            </p>
            <p className="mt-2 text-2xl font-bold">
              {mockCampaigns.reduce((sum, c) => sum + c.contacts, 0)}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('campaigns.statAvgOpenRate')}
            </p>
            <p className="mt-2 text-2xl font-bold">
              {mockCampaigns.length > 0
                ? Math.round(
                    (mockCampaigns.reduce((sum, c) => sum + c.opens, 0) /
                      mockCampaigns.reduce((sum, c) => sum + c.contacts, 0)) *
                      100,
                  )
                : 0}
              %
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
