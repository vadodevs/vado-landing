import { adminWorkspaceRequest } from '@/lib/userAuthorizedFetch'
import type { AutoLeadRun } from '@/lib/autoLeadsMock'

export async function fetchAutoLeadRuns(): Promise<AutoLeadRun[] | null> {
  const res = await adminWorkspaceRequest<{ runs: AutoLeadRun[] }>('/admin/leads/auto')
  if (!res.ok) return null
  return Array.isArray(res.data.runs) ? res.data.runs : []
}

export async function fetchAutoLeadRun(id: string): Promise<AutoLeadRun | null> {
  const res = await adminWorkspaceRequest<{ run: AutoLeadRun }>(
    `/admin/leads/auto/${encodeURIComponent(id)}`,
  )
  if (!res.ok) return null
  return res.data.run ?? null
}
