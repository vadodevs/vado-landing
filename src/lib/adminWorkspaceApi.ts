import type { CompanyLeadStatus } from '@/lib/companyLeadStatus';
import type { CompanyLeadUpdate } from '@/lib/companyLeadUpdates';
import type { PipelineLeadEntry, PipelineLeadSource, PipelineStage } from '@/lib/adminOpportunitiesPipeline';
import type { ApiCompanySubmissionRow } from '@/lib/companyAdminContact';
import { adminAuthorizedFetch, getAdminAccessToken } from '@/lib/adminAuth';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';
import { adminWorkspaceRequest } from '@/lib/userAuthorizedFetch';

export async function fetchCompanyLeadStatuses(): Promise<Record<string, CompanyLeadStatus>> {
  const res = await adminWorkspaceRequest<Record<string, string>>(
    '/admin/workspace/crm/company-lead-statuses',
  );
  if (!res.ok) return {};
  const out: Record<string, CompanyLeadStatus> = {};
  for (const [id, status] of Object.entries(res.data)) {
    if (typeof status === 'string') out[id] = status as CompanyLeadStatus;
  }
  return out;
}

export async function patchCompanyLeadStatusApi(
  contactId: string,
  status: CompanyLeadStatus,
): Promise<boolean> {
  const res = await adminWorkspaceRequest<{ contactId: string; status: string }>(
    `/admin/workspace/crm/company-leads/${encodeURIComponent(contactId)}/status`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
  );
  return res.ok;
}

export async function fetchCompanyLeadUpdatesMap(): Promise<Record<string, CompanyLeadUpdate[]>> {
  const res = await adminWorkspaceRequest<Record<string, CompanyLeadUpdate[]>>(
    '/admin/workspace/crm/company-lead-updates',
  );
  return res.ok ? res.data : {};
}

export async function createCompanyLeadUpdateApi(
  contactId: string,
  payload: {
    body: string;
    kind?: 'note' | 'reminder';
    scheduledAtMs?: number;
    contactName?: string;
    contactEmail?: string;
  },
): Promise<CompanyLeadUpdate | null> {
  const res = await adminWorkspaceRequest<CompanyLeadUpdate>(
    `/admin/workspace/crm/company-leads/${encodeURIComponent(contactId)}/updates`,
    { method: 'POST', body: JSON.stringify(payload) },
  );
  return res.ok ? res.data : null;
}

export async function fetchPipelineEntries(): Promise<PipelineLeadEntry[]> {
  const res = await adminWorkspaceRequest<PipelineLeadEntry[]>('/admin/workspace/pipeline');
  return res.ok ? res.data : [];
}

export async function createPipelineEntryApi(
  entry: Omit<PipelineLeadEntry, 'stage' | 'addedAtMs'> & {
    stage?: PipelineStage;
    addedAtMs?: number;
  },
): Promise<PipelineLeadEntry | null> {
  const res = await adminWorkspaceRequest<PipelineLeadEntry>('/admin/workspace/pipeline', {
    method: 'POST',
    body: JSON.stringify({
      source: entry.source,
      id: entry.id,
      nombre: entry.nombre,
      email: entry.email,
      empresa: entry.empresa,
      telefono: entry.telefono,
      servicio: entry.servicio,
      stage: entry.stage,
      estimatedAmountUsd: entry.estimatedAmountUsd,
      addedAtMs: entry.addedAtMs,
    }),
  });
  return res.ok ? res.data : null;
}

export async function patchPipelineEntryApi(
  source: PipelineLeadSource,
  id: string,
  patch: { stage?: PipelineStage; estimatedAmountUsd?: number | null },
): Promise<PipelineLeadEntry | null> {
  const res = await adminWorkspaceRequest<PipelineLeadEntry>(
    `/admin/workspace/pipeline/${encodeURIComponent(source)}/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
  );
  return res.ok ? res.data : null;
}

export async function deletePipelineEntryApi(
  source: PipelineLeadSource,
  id: string,
): Promise<boolean> {
  const res = await adminWorkspaceRequest<{ deleted: boolean }>(
    `/admin/workspace/pipeline/${encodeURIComponent(source)}/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
  return res.ok;
}

export async function fetchFavoriteIds(
  entityType: 'company_lead' | 'developer',
): Promise<string[]> {
  const res = await adminWorkspaceRequest<string[]>(
    `/admin/workspace/favorites/${encodeURIComponent(entityType)}`,
  );
  return res.ok ? res.data : [];
}

export async function toggleFavoriteApi(
  entityType: 'company_lead' | 'developer',
  entityId: string,
): Promise<string[]> {
  const res = await adminWorkspaceRequest<{ favorited: boolean; ids: string[] }>(
    `/admin/workspace/favorites/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
    { method: 'PUT' },
  );
  return res.ok ? res.data.ids : [];
}

export type InboxReadCursors = Record<string, number>;

export async function fetchInboxReadCursors(ownerJid: string): Promise<InboxReadCursors> {
  const res = await adminWorkspaceRequest<InboxReadCursors>(
    `/admin/workspace/inbox-read-cursors?ownerJid=${encodeURIComponent(ownerJid)}`,
  );
  return res.ok ? res.data : {};
}

export async function markInboxReadCursorApi(
  ownerJid: string,
  conversationId: string,
  lastMessageAtMs: number,
): Promise<void> {
  await adminWorkspaceRequest('/admin/workspace/inbox-read-cursors', {
    method: 'POST',
    body: JSON.stringify({ ownerJid, conversationId, lastMessageAtMs }),
  });
}

export async function clearInboxReadCursorsApi(ownerJid: string): Promise<void> {
  await adminWorkspaceRequest(
    `/admin/workspace/inbox-read-cursors?ownerJid=${encodeURIComponent(ownerJid)}`,
    { method: 'DELETE' },
  );
}

export type MigrateBrowserPayload = {
  pipeline?: unknown[];
  companyLeadUpdates?: Record<string, unknown[]>;
  companyLeadStatuses?: Record<string, string>;
  companyLeadFavorites?: string[];
  developerFavorites?: string[];
  inboxReadState?: Record<string, Record<string, { lastMessageAtMs?: number }>>;
  theme?: string;
  navBadges?: Record<string, unknown>;
};

export async function migrateBrowserWorkspaceData(
  payload: MigrateBrowserPayload,
): Promise<boolean> {
  const res = await adminWorkspaceRequest<{ imported: Record<string, number> }>(
    '/admin/workspace/migrate-browser-data',
    { method: 'POST', body: JSON.stringify(payload) },
  );
  return res.ok;
}

export type CreateManualCompanyLeadApiPayload = {
  firstName: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
};

export type CreateManualCompanyLeadApiResult =
  | { ok: true; data: ApiCompanySubmissionRow }
  | { ok: false; reason: 'no-config' | 'unauthorized' | 'fail'; detail?: string };

export async function createManualCompanyLeadApi(
  payload: CreateManualCompanyLeadApiPayload,
): Promise<CreateManualCompanyLeadApiResult> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, reason: 'no-config' };
  if (!getAdminAccessToken()) return { ok: false, reason: 'unauthorized' };

  try {
    const res = await adminAuthorizedFetch(`${base}/admin/workspace/crm/company-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res?.ok) {
      let detail: string | undefined;
      try {
        const j = (await res?.json()) as { message?: unknown; error?: unknown };
        if (Array.isArray(j?.message)) {
          detail = j.message.map(String).join(' ');
        } else if (typeof j?.message === 'string') {
          detail = j.message;
        } else if (typeof j?.error === 'string') {
          detail = j.error;
        }
      } catch {
        /* ignore */
      }
      return { ok: false, reason: 'fail', detail };
    }
    const data = (await res.json()) as ApiCompanySubmissionRow;
    return { ok: true, data };
  } catch {
    return { ok: false, reason: 'fail' };
  }
}
