import { adminWorkspaceRequest } from '@/lib/userAuthorizedFetch';

export type UtilityTaskStatus = 'todo' | 'done';

export type UtilityTask = {
  id: string;
  title: string;
  description: string;
  status: UtilityTaskStatus;
  completedAt: string | null;
};

export type UtilityReminderArchiveReason = 'manual' | 'due_date';

export type UtilityReminder = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  archivedAt: string | null;
  archiveReason: UtilityReminderArchiveReason | null;
};

export async function fetchUtilityTasks(): Promise<UtilityTask[]> {
  const res = await adminWorkspaceRequest<UtilityTask[]>('/admin/workspace/utilities/tasks');
  return res.ok ? res.data : [];
}

export async function createUtilityTaskApi(payload: {
  title: string;
  description?: string;
}): Promise<UtilityTask | null> {
  const res = await adminWorkspaceRequest<UtilityTask>('/admin/workspace/utilities/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.ok ? res.data : null;
}

export async function patchUtilityTaskApi(
  id: string,
  payload: {
    title?: string;
    description?: string;
    status?: UtilityTaskStatus;
  },
): Promise<UtilityTask | null> {
  const res = await adminWorkspaceRequest<UtilityTask>(
    `/admin/workspace/utilities/tasks/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify(payload) },
  );
  return res.ok ? res.data : null;
}

export async function deleteUtilityTaskApi(id: string): Promise<boolean> {
  const res = await adminWorkspaceRequest<{ deleted: boolean }>(
    `/admin/workspace/utilities/tasks/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
  return res.ok;
}

export async function fetchUtilityReminders(): Promise<UtilityReminder[]> {
  const res = await adminWorkspaceRequest<UtilityReminder[]>('/admin/workspace/utilities/reminders');
  return res.ok ? res.data : [];
}

export async function createUtilityReminderApi(payload: {
  title: string;
  description?: string;
  dueDate: string;
}): Promise<UtilityReminder | null> {
  const res = await adminWorkspaceRequest<UtilityReminder>('/admin/workspace/utilities/reminders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.ok ? res.data : null;
}

export async function archiveUtilityReminderApi(id: string): Promise<UtilityReminder | null> {
  const res = await adminWorkspaceRequest<UtilityReminder>(
    `/admin/workspace/utilities/reminders/${encodeURIComponent(id)}`,
    { method: 'PATCH', body: JSON.stringify({ archive: true }) },
  );
  return res.ok ? res.data : null;
}

export async function deleteUtilityReminderApi(id: string): Promise<boolean> {
  const res = await adminWorkspaceRequest<{ deleted: boolean }>(
    `/admin/workspace/utilities/reminders/${encodeURIComponent(id)}`,
    { method: 'DELETE' },
  );
  return res.ok;
}
