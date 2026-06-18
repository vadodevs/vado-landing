
export async function postDeveloperApplication(
  apiBase: string,
  token: string,
  jobId: string,
  options?: { coverLetter?: string; desiredSalary?: number },
): Promise<void> {
  const base = apiBase.replace(/\/$/, '');
  const res = await fetch(`${base}/developer/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ jobId, ...options }),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const j = (await res.json()) as { message?: unknown; errors?: unknown[] };
      if (typeof j.message === 'string') {
        detail = j.message;
      } else if (Array.isArray(j.errors) && j.errors.length) {
        detail = JSON.stringify(j.errors);
      }
    } catch {}
    throw new Error(detail || `HTTP ${res.status}`);
  }
}
