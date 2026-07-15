import { adminWorkspaceRequest } from '@/lib/userAuthorizedFetch'
import type { AutoLeadContact, AutoLeadRun } from '@/lib/autoLeadsMock'

export type AutoLeadsSettings = {
  defaultAutoEnabled: boolean
}

export type AutoLeadsOutboundStatus = {
  gmailConnected: boolean
  calendarConnected: boolean
  queuedWaiting: number
  waitingForGmail: boolean
}

export async function fetchAutoLeadRuns(): Promise<{
  runs: AutoLeadRun[]
  settings: AutoLeadsSettings
  outbound: AutoLeadsOutboundStatus
} | null> {
  const res = await adminWorkspaceRequest<{
    runs: AutoLeadRun[]
    settings?: AutoLeadsSettings
    outbound?: Partial<AutoLeadsOutboundStatus>
  }>('/admin/leads/auto')
  if (!res.ok) return null
  const outbound = res.data.outbound
  return {
    runs: Array.isArray(res.data.runs) ? res.data.runs : [],
    settings: {
      defaultAutoEnabled: res.data.settings?.defaultAutoEnabled !== false,
    },
    outbound: {
      gmailConnected: outbound?.gmailConnected === true,
      calendarConnected: outbound?.calendarConnected === true,
      queuedWaiting: typeof outbound?.queuedWaiting === 'number' ? outbound.queuedWaiting : 0,
      waitingForGmail: outbound?.waitingForGmail === true,
    },
  }
}

export async function fetchAutoLeadRun(id: string): Promise<AutoLeadRun | null> {
  const res = await adminWorkspaceRequest<{ run: AutoLeadRun }>(
    `/admin/leads/auto/${encodeURIComponent(id)}`,
  )
  if (!res.ok) return null
  return res.data.run ?? null
}

export async function patchAutoLeadsSettings(
  defaultAutoEnabled: boolean,
): Promise<AutoLeadsSettings | null> {
  const res = await adminWorkspaceRequest<{ settings: AutoLeadsSettings }>(
    '/admin/leads/auto/settings',
    {
      method: 'PATCH',
      body: JSON.stringify({ defaultAutoEnabled }),
    },
  )
  if (!res.ok) return null
  return res.data.settings ?? null
}

export async function patchAutoLeadRunStatus(
  id: string,
  status: 'active' | 'paused',
): Promise<AutoLeadRun | null> {
  const res = await adminWorkspaceRequest<{ run: AutoLeadRun }>(
    `/admin/leads/auto/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  )
  if (!res.ok) return null
  return res.data.run ?? null
}

export async function patchAutoLeadContactAuto(
  id: string,
  autoEnabled: boolean,
): Promise<AutoLeadContact | null> {
  const res = await adminWorkspaceRequest<{ contact: AutoLeadContact }>(
    `/admin/leads/auto/contacts/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ autoEnabled }),
    },
  )
  if (!res.ok) return null
  return res.data.contact ?? null
}
