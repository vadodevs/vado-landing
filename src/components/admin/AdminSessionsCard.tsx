import { useCallback, useEffect, useState } from 'react';
import { Loader2, MonitorSmartphone, ShieldOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  SettingsSectionCard,
  SettingsSectionHeader,
} from '@/components/settings/settings-ui';
import { adminAuthorizedFetch } from '@/lib/adminAuth';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

type SessionRow = {
  id: string;
  ip: string | null;
  locationLabel: string | null;
  userAgent: string | null;
  deviceLabel: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

function formatWhen(iso: string, locale: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return iso;
  return d.toLocaleString(locale === 'en' ? 'en-US' : 'es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function AdminSessionsCard() {
  const { t, i18n } = useTranslation();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const base = getApiBaseUrl();
    if (!base) {
      setError(t('adminSettings.sessionsErrorNoConfig'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await adminAuthorizedFetch(`${base}/auth/sessions`);
      if (!res?.ok) {
        setError(t('adminSettings.sessionsErrorLoad'));
        setSessions([]);
        return;
      }
      const data = (await res.json()) as unknown;
      setSessions(Array.isArray(data) ? (data as SessionRow[]) : []);
    } catch {
      setError(t('adminSettings.sessionsErrorLoad'));
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const revokeOne = async (id: string) => {
    const base = getApiBaseUrl();
    if (!base) return;
    setBusyId(id);
    try {
      const res = await adminAuthorizedFetch(`${base}/auth/sessions/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res?.ok) await load();
      else setError(t('adminSettings.sessionsErrorRevoke'));
    } catch {
      setError(t('adminSettings.sessionsErrorRevoke'));
    } finally {
      setBusyId(null);
    }
  };

  const revokeOthers = async () => {
    const base = getApiBaseUrl();
    if (!base) return;
    setBusyId('others');
    try {
      const res = await adminAuthorizedFetch(`${base}/auth/sessions/others`, {
        method: 'DELETE',
      });
      if (res?.ok) await load();
      else setError(t('adminSettings.sessionsErrorRevoke'));
    } catch {
      setError(t('adminSettings.sessionsErrorRevoke'));
    } finally {
      setBusyId(null);
    }
  };

  const otherCount = sessions.filter((s) => !s.isCurrent).length;

  return (
    <SettingsSectionCard id="sessions">
      <SettingsSectionHeader
        icon={MonitorSmartphone}
        title={t('adminSettings.sessionsTitle')}
        description={t('adminSettings.sessionsDescription')}
        className="mb-3"
      />

      {loading ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('adminSettings.sessionsLoading')}
        </p>
      ) : error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('adminSettings.sessionsEmpty')}</p>
      ) : (
        <>
          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex flex-col gap-2 rounded-xl border border-border/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {s.deviceLabel || t('adminSettings.sessionsUnknownDevice')}
                    {s.isCurrent ? (
                      <span className="ml-2 text-xs font-normal text-primary">
                        {t('adminSettings.sessionsCurrent')}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.locationLabel
                      ? t('adminSettings.sessionsLocationIp', {
                          location: s.locationLabel,
                          ip: s.ip || '—',
                        })
                      : t('adminSettings.sessionsIp', { ip: s.ip || '—' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('adminSettings.sessionsLastSeen', {
                      when: formatWhen(s.lastSeenAt, i18n.language),
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('adminSettings.sessionsCreated', {
                      when: formatWhen(s.createdAt, i18n.language),
                    })}
                  </p>
                </div>
                {!s.isCurrent ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={busyId != null}
                    onClick={() => void revokeOne(s.id)}
                  >
                    {busyId === s.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <ShieldOff className="size-4" aria-hidden />
                    )}
                    {t('adminSettings.sessionsRevoke')}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>

          {otherCount > 0 ? (
            <div className="mt-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busyId != null}
                onClick={() => void revokeOthers()}
              >
                {busyId === 'others' ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
                ) : null}
                {t('adminSettings.sessionsRevokeOthers', { count: otherCount })}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <p className="mt-3 text-xs text-muted-foreground">{t('adminSettings.sessionsHint')}</p>
    </SettingsSectionCard>
  );
}
