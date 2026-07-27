import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { ArrowLeft, Megaphone, MousePointerClick, Reply, Users, Eye } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'wouter'
import { AppShell } from '@/components/layout/app/AppShell'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useLocale } from '@/hooks/useLocale'
import {
  campaignClickRate,
  campaignOpenRate,
  getCampaignAudience,
  getCampaignById,
  type CampaignStatus,
} from '@/lib/campaignsMock'
import { cn } from '@/lib/utils'

function statusBadgeClass(status: CampaignStatus) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
    case 'completed':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-400'
    case 'draft':
      return 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400'
    case 'paused':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
  }
}

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string
  value: string
  hint?: string
  icon: typeof Users
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-background p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function ChartEmpty({ message }: { message: string }) {
  return <p className="px-2 py-10 text-center text-sm text-muted-foreground">{message}</p>
}

export default function AppAdminCampaniaDetalle({ campaignId }: { campaignId?: string }) {
  const { t, i18n } = useTranslation()
  const { path } = useLocale()
  const params = useParams<{ id?: string }>()
  const id = campaignId || params.id || ''
  const campaign = id ? getCampaignById(id) : undefined
  const dateLocale = i18n.language?.startsWith('en') ? 'en-US' : 'es-ES'
  const listHref = path('/app/admin/campanas')

  const activityConfig = useMemo(
    () =>
      ({
        opens: {
          label: t('campaigns.metricOpens'),
          color: 'hsl(215 70% 28%)',
        },
        clicks: {
          label: t('campaigns.metricClicks'),
          color: 'hsl(199 89% 48%)',
        },
      }) satisfies ChartConfig,
    [t],
  )

  const repliesConfig = useMemo(
    () =>
      ({
        replies: {
          label: t('campaigns.metricReplies'),
          color: 'hsl(160 70% 40%)',
        },
      }) satisfies ChartConfig,
    [t],
  )

  const funnelConfig = useMemo(
    () =>
      ({
        contacts: {
          label: t('campaigns.columnContacts'),
          color: 'hsl(215 20% 55%)',
        },
        opens: {
          label: t('campaigns.metricOpens'),
          color: 'hsl(215 70% 28%)',
        },
        clicks: {
          label: t('campaigns.metricClicks'),
          color: 'hsl(199 89% 48%)',
        },
        replies: {
          label: t('campaigns.metricReplies'),
          color: 'hsl(160 70% 40%)',
        },
      }) satisfies ChartConfig,
    [t],
  )

  const mixConfig = useMemo(
    () =>
      ({
        opens: {
          label: t('campaigns.metricOpens'),
          color: 'hsl(215 70% 28%)',
        },
        clicks: {
          label: t('campaigns.metricClicks'),
          color: 'hsl(199 89% 48%)',
        },
        replies: {
          label: t('campaigns.metricReplies'),
          color: 'hsl(160 70% 40%)',
        },
      }) satisfies ChartConfig,
    [t],
  )

  const chartData = useMemo(() => {
    const days = campaign?.metricsByDay ?? []
    return days.map((d) => ({
      ...d,
      label: new Date(`${d.date}T12:00:00`).toLocaleDateString(dateLocale, {
        month: 'short',
        day: 'numeric',
      }),
    }))
  }, [campaign?.metricsByDay, dateLocale])

  const funnelData = useMemo(() => {
    if (!campaign) return []
    return [
      { key: 'contacts', stage: t('campaigns.columnContacts'), value: campaign.contacts },
      { key: 'opens', stage: t('campaigns.metricOpens'), value: campaign.opens },
      { key: 'clicks', stage: t('campaigns.metricClicks'), value: campaign.clicks },
      { key: 'replies', stage: t('campaigns.metricReplies'), value: campaign.replies ?? 0 },
    ]
  }, [campaign, t])

  const mixData = useMemo(() => {
    if (!campaign) return []
    const rows = [
      { key: 'opens', name: t('campaigns.metricOpens'), value: campaign.opens, fill: 'var(--color-opens)' },
      { key: 'clicks', name: t('campaigns.metricClicks'), value: campaign.clicks, fill: 'var(--color-clicks)' },
      {
        key: 'replies',
        name: t('campaigns.metricReplies'),
        value: campaign.replies ?? 0,
        fill: 'var(--color-replies)',
      },
    ]
    return rows.filter((r) => r.value > 0)
  }, [campaign, t])

  const mixTotal = useMemo(() => mixData.reduce((sum, r) => sum + r.value, 0), [mixData])

  const audience = campaign ? getCampaignAudience(campaign) : []
  const openRate = campaign ? campaignOpenRate(campaign) : null
  const clickRate = campaign ? campaignClickRate(campaign) : null
  const hasMetrics = chartData.length > 0

  if (!campaign) {
    return (
      <AppShell
        pathWithoutLang="/app/admin/campanas"
        title={t('sidebarDemo.navCampanias')}
        description={t('seo.appAdminCampaigns')}
      >
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border/70 px-4 py-10">
          <p className="text-sm text-muted-foreground">{t('campaigns.detailNotFound')}</p>
          <Button asChild variant="outline" size="sm">
            <Link href={listHref}>
              <ArrowLeft className="size-3.5" aria-hidden />
              {t('campaigns.detailBack')}
            </Link>
          </Button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      pathWithoutLang={`/app/admin/campanas/${campaign.id}`}
      title={campaign.name}
      description={t('seo.appAdminCampaignDetail')}
    >
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-2">
            <Button asChild variant="ghost" size="icon" className="mt-0.5 size-8 shrink-0">
              <Link href={listHref} aria-label={t('campaigns.detailBack')}>
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
              <Megaphone className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-foreground">{campaign.name}</h2>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    statusBadgeClass(campaign.status),
                  )}
                >
                  {campaign.status === 'active'
                    ? t('campaigns.statusActive')
                    : campaign.status === 'completed'
                      ? t('campaigns.statusCompleted')
                      : campaign.status === 'draft'
                        ? t('campaigns.statusDraft')
                        : t('campaigns.statusPaused')}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {campaign.autoLeadRunName ?? t('campaigns.detailNoRun')}
                {campaign.channel ? ` · ${t(`campaigns.channel.${campaign.channel}`)}` : ''}
                {` · ${new Date(campaign.createdAt).toLocaleDateString(dateLocale)}`}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <KpiCard
            label={t('campaigns.columnContacts')}
            value={String(campaign.contacts)}
            icon={Users}
          />
          <KpiCard
            label={t('campaigns.metricOpens')}
            value={String(campaign.opens)}
            hint={openRate !== null ? t('campaigns.detailRateHint', { rate: openRate }) : undefined}
            icon={Eye}
          />
          <KpiCard
            label={t('campaigns.metricClicks')}
            value={String(campaign.clicks)}
            hint={
              clickRate !== null ? t('campaigns.detailRateHint', { rate: clickRate }) : undefined
            }
            icon={MousePointerClick}
          />
          <KpiCard
            label={t('campaigns.metricReplies')}
            value={String(campaign.replies ?? 0)}
            icon={Reply}
          />
          <KpiCard
            label={t('campaigns.statAvgOpenRate')}
            value={openRate !== null ? `${openRate}%` : '—'}
            icon={Eye}
          />
        </div>

        {/* Area: activity over time */}
        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b border-border/50 px-4 py-3 [.border-b]:pb-3">
            <CardTitle className="text-sm">{t('campaigns.detailChartTitle')}</CardTitle>
            <CardDescription className="text-xs">
              {t('campaigns.detailChartSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-2 pb-3 sm:px-4">
            {!hasMetrics ? (
              <ChartEmpty message={t('campaigns.detailChartEmpty')} />
            ) : (
              <ChartContainer config={activityConfig} className="aspect-auto h-[260px] w-full">
                <AreaChart data={chartData} accessibilityLayer>
                  <defs>
                    <linearGradient id="fillOpens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-opens)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-opens)" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={24}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Area
                    dataKey="opens"
                    type="natural"
                    fill="url(#fillOpens)"
                    stroke="var(--color-opens)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <Area
                    dataKey="clicks"
                    type="natural"
                    fill="url(#fillClicks)"
                    stroke="var(--color-clicks)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Bar: replies by day */}
          <Card className="gap-0 py-0 shadow-none">
            <CardHeader className="border-b border-border/50 px-4 py-3 [.border-b]:pb-3">
              <CardTitle className="text-sm">{t('campaigns.detailRepliesChartTitle')}</CardTitle>
              <CardDescription className="text-xs">
                {t('campaigns.detailRepliesChartSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-2 pb-3 sm:px-4">
              {!hasMetrics ? (
                <ChartEmpty message={t('campaigns.detailChartEmpty')} />
              ) : (
                <ChartContainer config={repliesConfig} className="aspect-auto h-[240px] w-full">
                  <BarChart data={chartData} accessibilityLayer>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={24}
                    />
                    <YAxis tickLine={false} axisLine={false} width={28} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="replies" fill="var(--color-replies)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Horizontal bar: conversion funnel */}
          <Card className="gap-0 py-0 shadow-none">
            <CardHeader className="border-b border-border/50 px-4 py-3 [.border-b]:pb-3">
              <CardTitle className="text-sm">{t('campaigns.detailFunnelChartTitle')}</CardTitle>
              <CardDescription className="text-xs">
                {t('campaigns.detailFunnelChartSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 pt-2 pb-3 sm:px-4">
              {!hasMetrics && campaign.contacts === 0 ? (
                <ChartEmpty message={t('campaigns.detailChartEmpty')} />
              ) : (
                <ChartContainer config={funnelConfig} className="aspect-auto h-[240px] w-full">
                  <BarChart data={funnelData} layout="vertical" accessibilityLayer margin={{ left: 8 }}>
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      dataKey="stage"
                      type="category"
                      tickLine={false}
                      axisLine={false}
                      width={88}
                      tick={{ fontSize: 11 }}
                    />
                    <XAxis type="number" tickLine={false} axisLine={false} hide />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {funnelData.map((row) => (
                        <Cell key={row.key} fill={`var(--color-${row.key})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Donut: engagement mix */}
        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b border-border/50 px-4 py-3 [.border-b]:pb-3">
            <CardTitle className="text-sm">{t('campaigns.detailMixChartTitle')}</CardTitle>
            <CardDescription className="text-xs">{t('campaigns.detailMixChartSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-2 pb-3 sm:px-4">
            {mixData.length === 0 ? (
              <ChartEmpty message={t('campaigns.detailChartEmpty')} />
            ) : (
              <ChartContainer config={mixConfig} className="mx-auto aspect-square h-[240px] w-full max-w-[280px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={mixData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={86}
                    strokeWidth={2}
                  >
                    {mixData.map((row) => (
                      <Cell key={row.key} fill={row.fill} />
                    ))}
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {mixTotal.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 18}
                                className="fill-muted-foreground text-[10px]"
                              >
                                {t('campaigns.detailMixTotal')}
                              </tspan>
                            </text>
                          )
                        }
                        return null
                      }}
                    />
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-1" />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0 shadow-none">
          <CardHeader className="border-b border-border/50 px-4 py-3 [.border-b]:pb-3">
            <CardTitle className="text-sm">{t('campaigns.detailAudienceTitle')}</CardTitle>
            <CardDescription className="text-xs">
              {t('campaigns.detailAudienceSubtitle', { count: audience.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 py-0">
            {audience.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                {t('campaigns.detailAudienceEmpty')}
              </p>
            ) : (
              <ul className="divide-y divide-border/50">
                {audience.map((lead) => (
                  <li key={lead.id} className="flex items-start gap-3 px-4 py-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                      {lead.nombre
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((p) => p[0]?.toUpperCase() ?? '')
                        .join('')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {lead.nombre}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {lead.empresa}
                        {lead.email !== '—' ? ` · ${lead.email}` : ''}
                      </span>
                    </span>
                    {lead.status ? (
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                        {t(`adminAutoLeads.contactStatus.${lead.status}`)}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  )
}
