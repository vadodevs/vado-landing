import { adminWorkspaceRequest } from '@/lib/userAuthorizedFetch'
import type {
  Campaign,
  CampaignAudienceLead,
  CampaignChannel,
  CampaignDayMetric,
  CampaignStatus,
} from '@/lib/campaignsMock'

export type CampaignDetail = Campaign & {
  audience: CampaignAudienceLead[]
  updatedAt?: string
}

type ApiCampaign = {
  id: string
  name: string
  status: CampaignStatus
  channel: CampaignChannel
  createdAt: string
  updatedAt?: string
  autoLeadRunId: string
  autoLeadRunName: string
  contacts: number
  opens: number
  clicks: number
  replies: number
  metricsByDay?: CampaignDayMetric[]
  audience?: CampaignAudienceLead[]
}

function mapCampaign(row: ApiCampaign): Campaign {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    channel: row.channel,
    createdAt: row.createdAt,
    autoLeadRunId: row.autoLeadRunId,
    autoLeadRunName: row.autoLeadRunName,
    contacts: row.contacts,
    opens: row.opens,
    clicks: row.clicks,
    replies: row.replies ?? 0,
    metricsByDay: Array.isArray(row.metricsByDay) ? row.metricsByDay : [],
  }
}

function mapDetail(row: ApiCampaign): CampaignDetail {
  return {
    ...mapCampaign(row),
    updatedAt: row.updatedAt,
    audience: Array.isArray(row.audience) ? row.audience : [],
  }
}

export async function fetchCampaigns(): Promise<Campaign[] | null> {
  const res = await adminWorkspaceRequest<{ campaigns: ApiCampaign[] }>('/admin/campaigns')
  if (!res.ok) return null
  return Array.isArray(res.data.campaigns) ? res.data.campaigns.map(mapCampaign) : []
}

export async function fetchCampaign(id: string): Promise<CampaignDetail | null> {
  const res = await adminWorkspaceRequest<{ campaign: ApiCampaign }>(
    `/admin/campaigns/${encodeURIComponent(id)}`,
  )
  if (!res.ok) return null
  return res.data.campaign ? mapDetail(res.data.campaign) : null
}

export async function createCampaign(input: {
  name: string
  autoLeadRunId: string
  channel?: CampaignChannel
  status?: CampaignStatus
}): Promise<CampaignDetail | null> {
  const res = await adminWorkspaceRequest<{ campaign: ApiCampaign }>('/admin/campaigns', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  if (!res.ok) return null
  return res.data.campaign ? mapDetail(res.data.campaign) : null
}

export async function patchCampaign(
  id: string,
  patch: Partial<Pick<Campaign, 'name' | 'status' | 'channel'>>,
): Promise<CampaignDetail | null> {
  const res = await adminWorkspaceRequest<{ campaign: ApiCampaign }>(
    `/admin/campaigns/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(patch),
    },
  )
  if (!res.ok) return null
  return res.data.campaign ? mapDetail(res.data.campaign) : null
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const res = await adminWorkspaceRequest<{ deleted?: boolean }>(
    `/admin/campaigns/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  )
  return res.ok
}
