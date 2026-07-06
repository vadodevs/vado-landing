import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GoogleCalendarLogo } from '@/components/admin/integrationBrandLogos';
import { cn } from '@/lib/utils';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import {
  disconnectGoogleIntegration,
  fetchGoogleIntegrationStatus,
  startGoogleConnect,
} from '@/lib/adminGoogleApi';

export function AdminGoogleCalendarIntegrationCard() {
  const { t } = useTranslation();
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    const res = await fetchGoogleIntegrationStatus();
    setLoading(false);
    if (res.ok) {
      setConnected(res.data.calendar.connected);
      setEmail(res.data.calendar.email);
      return;
    }
    setConnected(false);
    setEmail(null);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connectedService = params.get('connected');
    const googleError = params.get('google_error');

    if (connectedService === 'calendar') {
      toast.success(t('adminSettings.googleCalendarConnectedSuccess'));
      params.delete('connected');
      params.delete('google_error');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', next);
      void loadStatus();
    } else if (googleError) {
      toast.error(t('adminSettings.googleCalendarConnectError'));
      params.delete('google_error');
      params.delete('connected');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', next);
    }
  }, [loadStatus, t]);

  const handleConnect = async () => {
    if (connected || connecting) return;
    setConnecting(true);
    const res = await startGoogleConnect('calendar');
    setConnecting(false);
    if (!res.ok) {
      if (res.reason === 'no-config') {
        toast.error(t('adminSettings.googleCalendarErrorNoConfig'));
      } else if (res.reason === 'no-auth') {
        toast.error(t('adminSettings.googleCalendarErrorNoAuth'));
      } else {
        toast.error(res.message ?? t('adminSettings.googleCalendarConnectError'));
      }
      return;
    }
    window.location.href = res.data.url;
  };

  const handleDisconnect = async () => {
    if (!connected || disconnecting) return;
    setDisconnecting(true);
    const res = await disconnectGoogleIntegration('calendar');
    setDisconnecting(false);
    if (!res.ok) {
      toast.error(t('adminSettings.googleCalendarDisconnectError'));
      return;
    }
    setConnected(false);
    setEmail(null);
    toast.success(t('adminSettings.googleCalendarDisconnectedSuccess'));
  };

  return (
    <article className="scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white p-2 shadow-sm dark:bg-zinc-950">
          <GoogleCalendarLogo className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {t('adminSettings.googleCalendarTitle')}
            </h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
              )}
            >
              {loading
                ? t('adminSettings.googleCalendarConnecting')
                : connected
                  ? t('adminSettings.googleCalendarConnected')
                  : t('adminSettings.googleCalendarDisconnected')}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('adminSettings.googleCalendarDescription')}
          </p>
          {connected && email ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t('adminSettings.googleCalendarConnectedAs', { email })}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {connected ? (
            <Button
              type="button"
              variant="outline"
              disabled={disconnecting || loading}
              onClick={() => void handleDisconnect()}
            >
              {disconnecting
                ? t('adminSettings.googleCalendarDisconnecting')
                : t('adminSettings.googleCalendarDisconnect')}
            </Button>
          ) : (
            <Button
              type="button"
              className={cn(ADMIN_PRIMARY_BTN_CLASS)}
              disabled={connected || connecting || loading}
              onClick={() => void handleConnect()}
            >
              {connecting
                ? t('adminSettings.googleCalendarConnecting')
                : t('adminSettings.googleCalendarConnect')}
            </Button>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{t('adminSettings.googleCalendarConnectNote')}</p>
    </article>
  );
}
