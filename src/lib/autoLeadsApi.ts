import { adminWorkspaceRequest } from '@/lib/userAuthorizedFetch'
import type { AutoLeadContact, AutoLeadRun } from '@/lib/autoLeadsMock'

export type AutoLeadsSettings = {
  defaultAutoEnabled: boolean
  coldEmailLlmEnabled: boolean
  coldEmailPromptTemplate: string
}

export type ColdEmailPromptMeta = {
  placeholders: string[]
  defaultTemplate: string
}

export type AutoLeadsOutboundStatus = {
  gmailConnected: boolean
  calendarConnected: boolean
  queuedWaiting: number
  waitingForGmail: boolean
}

const DEFAULT_COLD_EMAIL_PROMPT_META: ColdEmailPromptMeta = {
  placeholders: [
    'contactName',
    'companyName',
    'companyContext',
    'locale',
    'country',
    'email',
  ],
  defaultTemplate: '',
}

function normalizeSettings(raw?: Partial<AutoLeadsSettings> | null): AutoLeadsSettings {
  return {
    defaultAutoEnabled: raw?.defaultAutoEnabled !== false,
    coldEmailLlmEnabled: raw?.coldEmailLlmEnabled !== false,
    coldEmailPromptTemplate:
      typeof raw?.coldEmailPromptTemplate === 'string' ? raw.coldEmailPromptTemplate : '',
  }
}

function normalizePromptMeta(
  raw?: Partial<ColdEmailPromptMeta> | null,
): ColdEmailPromptMeta {
  return {
    placeholders: Array.isArray(raw?.placeholders)
      ? raw.placeholders.filter((p): p is string => typeof p === 'string')
      : DEFAULT_COLD_EMAIL_PROMPT_META.placeholders,
    defaultTemplate:
      typeof raw?.defaultTemplate === 'string'
        ? raw.defaultTemplate
        : DEFAULT_COLD_EMAIL_PROMPT_META.defaultTemplate,
  }
}

export async function fetchAutoLeadsSettings(): Promise<{
  settings: AutoLeadsSettings
  coldEmailPromptMeta: ColdEmailPromptMeta
} | null> {
  const res = await adminWorkspaceRequest<{
    settings?: Partial<AutoLeadsSettings>
    coldEmailPromptMeta?: Partial<ColdEmailPromptMeta>
  }>('/admin/leads/auto/settings')
  if (!res.ok) return null
  return {
    settings: normalizeSettings(res.data.settings),
    coldEmailPromptMeta: normalizePromptMeta(res.data.coldEmailPromptMeta),
  }
}

export async function fetchAutoLeadRuns(): Promise<{
  runs: AutoLeadRun[]
  settings: AutoLeadsSettings
  outbound: AutoLeadsOutboundStatus
  coldEmailPromptMeta: ColdEmailPromptMeta
} | null> {
  const res = await adminWorkspaceRequest<{
    runs: AutoLeadRun[]
    settings?: Partial<AutoLeadsSettings>
    outbound?: Partial<AutoLeadsOutboundStatus>
    coldEmailPromptMeta?: Partial<ColdEmailPromptMeta>
  }>('/admin/leads/auto')
  if (!res.ok) return null
  const outbound = res.data.outbound
  return {
    runs: Array.isArray(res.data.runs) ? res.data.runs : [],
    settings: normalizeSettings(res.data.settings),
    outbound: {
      gmailConnected: outbound?.gmailConnected === true,
      calendarConnected: outbound?.calendarConnected === true,
      queuedWaiting: typeof outbound?.queuedWaiting === 'number' ? outbound.queuedWaiting : 0,
      waitingForGmail: outbound?.waitingForGmail === true,
    },
    coldEmailPromptMeta: normalizePromptMeta(res.data.coldEmailPromptMeta),
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
  patch: Partial<AutoLeadsSettings>,
): Promise<{ settings: AutoLeadsSettings; coldEmailPromptMeta: ColdEmailPromptMeta } | null> {
  const res = await adminWorkspaceRequest<{
    settings: Partial<AutoLeadsSettings>
    coldEmailPromptMeta?: Partial<ColdEmailPromptMeta>
  }>('/admin/leads/auto/settings', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  if (!res.ok) return null
  return {
    settings: normalizeSettings(res.data.settings),
    coldEmailPromptMeta: normalizePromptMeta(res.data.coldEmailPromptMeta),
  }
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
