import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GmailLogo } from '@/components/admin/integrationBrandLogos';
import { cn } from '@/lib/utils';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import {
  disconnectGoogleIntegration,
  fetchGoogleIntegrationStatus,
  startGoogleConnect,
} from '@/lib/adminGoogleApi';

export function AdminGmailIntegrationCard() {
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
      setConnected(res.data.gmail.connected);
      setEmail(res.data.gmail.email);
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

    if (connectedService === 'gmail') {
      toast.success(t('adminSettings.gmailConnectedSuccess'));
      params.delete('connected');
      params.delete('google_error');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', next);
      void loadStatus();
    } else if (googleError) {
      toast.error(t('adminSettings.gmailConnectError'));
      params.delete('google_error');
      params.delete('connected');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', next);
    }
  }, [loadStatus, t]);

  const handleConnect = async () => {
    if (connected || connecting) return;
    setConnecting(true);
    const res = await startGoogleConnect('gmail');
    setConnecting(false);
    if (!res.ok) {
      if (res.reason === 'no-config') {
        toast.error(t('adminSettings.gmailErrorNoConfig'));
      } else if (res.reason === 'no-auth') {
        toast.error(t('adminSettings.gmailErrorNoAuth'));
      } else {
        toast.error(res.message ?? t('adminSettings.gmailConnectError'));
      }
      return;
    }
    window.location.href = res.data.url;
  };

  const handleDisconnect = async () => {
    if (!connected || disconnecting) return;
    setDisconnecting(true);
    const res = await disconnectGoogleIntegration('gmail');
    setDisconnecting(false);
    if (!res.ok) {
      toast.error(t('adminSettings.gmailDisconnectError'));
      return;
    }
    setConnected(false);
    setEmail(null);
    toast.success(t('adminSettings.gmailDisconnectedSuccess'));
  };

  return (
    <article className="scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white p-2 shadow-sm dark:bg-zinc-950">
          <GmailLogo className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{t('adminSettings.gmailTitle')}</h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
              )}
            >
              {loading
                ? t('adminSettings.gmailConnecting')
                : connected
                  ? t('adminSettings.gmailConnected')
                  : t('adminSettings.gmailDisconnected')}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('adminSettings.gmailDescription')}</p>
          {connected && email ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {t('adminSettings.gmailConnectedAs', { email })}
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
                ? t('adminSettings.gmailDisconnecting')
                : t('adminSettings.gmailDisconnect')}
            </Button>
          ) : (
            <Button
              type="button"
              className={cn(ADMIN_PRIMARY_BTN_CLASS)}
              disabled={connected || connecting || loading}
              onClick={() => void handleConnect()}
            >
              {connecting
                ? t('adminSettings.gmailConnecting')
                : t('adminSettings.gmailConnect')}
            </Button>
          )}
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{t('adminSettings.gmailConnectNote')}</p>
    </article>
  );
}
