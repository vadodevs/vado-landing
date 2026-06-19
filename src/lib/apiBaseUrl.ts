
export function getApiBaseUrl(): string {
  const primary = String(import.meta.env.VITE_API_BASE_URL ?? '').trim();
  const fallback = String(import.meta.env.VITE_ADMIN_API_BASE_URL ?? '').trim();
  const configured = primary || fallback;
  if (!configured) return '';
  if (configured.startsWith('/')) return configured.replace(/\/$/, '');
  return configured.replace(/\/$/, '');
}

export function isApiBaseConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}
