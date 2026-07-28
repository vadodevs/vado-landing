import type { AutoLeadChannel } from '@/lib/autoLeadsMock'
import { AUTO_LEADS_MOCK_RUNS, getAutoLeadRunById } from '@/lib/autoLeadsMock'

export type CampaignStatus = 'draft' | 'active' | 'completed' | 'paused'
export type CampaignChannel = AutoLeadChannel | 'instagram'

export type CampaignDayMetric = {
  date: string
  opens: number
  clicks: number
  replies: number
}

export type Campaign = {
  id: string
  name: string
  status: CampaignStatus
  createdAt: string
  contacts: number
  opens: number
  clicks: number
  replies?: number
  /** Auto Leads (autosales) run id used as workflow source. */
  autoLeadRunId?: string
  autoLeadRunName?: string
  channel?: CampaignChannel
  metricsByDay?: CampaignDayMetric[]
}

export type CampaignAudienceLead = {
  id: string
  nombre: string
  empresa: string
  email: string
  phone?: string | null
  channel?: AutoLeadChannel
  status?: string
}

function series(
  start: string,
  days: Array<[opens: number, clicks: number, replies: number]>,
): CampaignDayMetric[] {
  const base = new Date(`${start}T12:00:00.000Z`)
  return days.map(([opens, clicks, replies], i) => {
    const d = new Date(base)
    d.setUTCDate(base.getUTCDate() + i)
    return {
      date: d.toISOString().slice(0, 10),
      opens,
      clicks,
      replies,
    }
  })
}

const METRICS_1 = series('2024-07-01', [
  [4, 1, 0],
  [7, 2, 1],
  [9, 3, 0],
  [11, 3, 1],
  [8, 2, 1],
  [14, 5, 2],
  [16, 6, 1],
  [12, 4, 2],
  [18, 7, 3],
  [15, 5, 2],
  [20, 8, 3],
  [17, 6, 2],
  [22, 9, 4],
  [24, 10, 3],
])

const METRICS_2 = series('2024-07-10', [
  [3, 1, 0],
  [5, 2, 1],
  [8, 3, 1],
  [6, 2, 0],
  [10, 4, 2],
  [12, 5, 1],
  [9, 3, 2],
  [14, 6, 2],
])

const METRICS_3 = series('2024-06-15', [
  [6, 2, 0],
  [10, 3, 1],
  [14, 5, 2],
  [18, 7, 2],
  [16, 6, 3],
  [20, 8, 3],
  [22, 9, 4],
  [19, 7, 3],
  [15, 5, 2],
  [12, 4, 2],
  [10, 3, 1],
  [8, 2, 1],
  [6, 2, 0],
  [4, 1, 0],
])

const METRICS_5 = series('2024-07-05', [
  [8, 3, 1],
  [12, 4, 1],
  [15, 6, 2],
  [18, 7, 3],
  [21, 9, 3],
  [19, 8, 2],
  [24, 10, 4],
  [27, 11, 4],
  [23, 9, 3],
  [26, 12, 5],
  [22, 8, 3],
  [20, 7, 2],
])

function totalsFromSeries(days: CampaignDayMetric[]) {
  return days.reduce(
    (acc, d) => ({
      opens: acc.opens + d.opens,
      clicks: acc.clicks + d.clicks,
      replies: acc.replies + d.replies,
    }),
    { opens: 0, clicks: 0, replies: 0 },
  )
}

const t1 = totalsFromSeries(METRICS_1)
const t2 = totalsFromSeries(METRICS_2)
const t3 = totalsFromSeries(METRICS_3)
const t5 = totalsFromSeries(METRICS_5)

export const INITIAL_MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Campaña de Bienvenida Q3',
    status: 'active',
    createdAt: '2024-07-01',
    contacts: 245,
    opens: t1.opens,
    clicks: t1.clicks,
    replies: t1.replies,
    autoLeadRunId: 'run-saas-latam',
    autoLeadRunName: 'SaaS LatAm · outbound',
    channel: 'email',
    metricsByDay: METRICS_1,
  },
  {
    id: '2',
    name: 'Oferta de Desarrolladores Junior',
    status: 'active',
    createdAt: '2024-07-10',
    contacts: 156,
    opens: t2.opens,
    clicks: t2.clicks,
    replies: t2.replies,
    autoLeadRunId: 'run-clinicas',
    autoLeadRunName: 'Clínicas privadas MX',
    channel: 'whatsapp',
    metricsByDay: METRICS_2,
  },
  {
    id: '3',
    name: 'Follow-up Leads Inactivos',
    status: 'completed',
    createdAt: '2024-06-15',
    contacts: 312,
    opens: t3.opens,
    clicks: t3.clicks,
    replies: t3.replies,
    autoLeadRunId: 'run-fintech-us',
    autoLeadRunName: 'Fintech SW USA',
    channel: 'email',
    metricsByDay: METRICS_3,
  },
  {
    id: '4',
    name: 'Prueba A/B Asunto Email',
    status: 'draft',
    createdAt: '2024-07-20',
    contacts: 0,
    opens: 0,
    clicks: 0,
    replies: 0,
    autoLeadRunId: 'run-saas-latam',
    autoLeadRunName: 'SaaS LatAm · outbound',
    channel: 'email',
    metricsByDay: [],
  },
  {
    id: '5',
    name: 'Reactivación de Clientes',
    status: 'paused',
    createdAt: '2024-07-05',
    contacts: 423,
    opens: t5.opens,
    clicks: t5.clicks,
    replies: t5.replies,
    autoLeadRunId: 'run-clinicas',
    autoLeadRunName: 'Clínicas privadas MX',
    channel: 'instagram',
    metricsByDay: METRICS_5,
  },
]

let campaignStore: Campaign[] = [...INITIAL_MOCK_CAMPAIGNS]

export function listCampaigns(): Campaign[] {
  return campaignStore
}

export function getCampaignById(id: string): Campaign | undefined {
  return campaignStore.find((c) => c.id === id)
}

export function addCampaign(campaign: Campaign): void {
  campaignStore = [campaign, ...campaignStore]
}

export function audienceFromAutoLeadRun(
  run: (typeof AUTO_LEADS_MOCK_RUNS)[number],
): CampaignAudienceLead[] {
  return run.contacts
    .filter((c) => !c.archivedAt)
    .map((c) => ({
      id: c.id,
      nombre: c.contactName,
      empresa: c.company,
      email: c.email ?? '—',
      phone: c.phone,
      channel: c.channel,
      status: c.status,
    }))
}

export function getCampaignAudience(campaign: Campaign): CampaignAudienceLead[] {
  if (!campaign.autoLeadRunId) return []
  const run = getAutoLeadRunById(campaign.autoLeadRunId)
  if (!run) return []
  return audienceFromAutoLeadRun(run)
}

export function createCampaignId(): string {
  return `camp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function campaignOpenRate(campaign: Campaign): number | null {
  if (campaign.contacts <= 0 || campaign.opens <= 0) return null
  return Math.round((campaign.opens / campaign.contacts) * 100)
}

export function campaignClickRate(campaign: Campaign): number | null {
  if (campaign.contacts <= 0 || campaign.clicks <= 0) return null
  return Math.round((campaign.clicks / campaign.contacts) * 100)
}
