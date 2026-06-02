import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import {
  configureWhatsappWebhook,
  disconnectWhatsapp,
  fetchWhatsappConnect,
  fetchWhatsappLinkStatus,
  type WhatsappConnectDto,
  type WhatsappLinkStatusDto,
} from '@/lib/adminInboxApi';

function formatPairingCode(code: string): string {
  const raw = code.replace(/\D/g, '');
  if (raw.length >= 8) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  }
  return code.trim();
}

function statusBadgeClass(state: WhatsappLinkStatusDto['state']): string {
  switch (state) {
    case 'open':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
    case 'connecting':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200';
    case 'close':
      return 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    default:
      return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400';
  }
}

export function AdminWhatsappLinkCard() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [linkStatus, setLinkStatus] = useState<WhatsappLinkStatusDto | null>(null);
  const [connectPayload, setConnectPayload] = useState<WhatsappConnectDto | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [linking, setLinking] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [syncingWebhook, setSyncingWebhook] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const managerUrl = String(import.meta.env.VITE_EVOLUTION_MANAGER_URL ?? '').trim();

  const refreshStatus = useCallback(async () => {
    const res = await fetchWhatsappLinkStatus();
    if (res.ok) {
      setLinkStatus(res.data);
      return res.data;
    }
    if (res.reason === 'no-auth') {
      setError(t('adminCanales.inboxAuthRequired'));
    } else if (res.reason === 'no-config') {
      setError(t('adminCanales.botErrorNoConfig'));
    } else {
      setError(t('adminSettings.whatsappStatusError'));
    }
    return null;
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingStatus(true);
      await refreshStatus();
      if (!cancelled) setLoadingStatus(false);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [refreshStatus]);

  useEffect(() => {
    if (!linking && !connectPayload) return;
    const interval = window.setInterval(() => {
      void refreshStatus().then((status) => {
        if (status?.linked) {
          setLinking(false);
          setConnectPayload(null);
        }
      });
    }, 3000);
    return () => window.clearInterval(interval);
  }, [linking, connectPayload, refreshStatus]);

  const handleLink = async () => {
    setLinking(true);
    setError(null);
    const res = await fetchWhatsappConnect();
    if (!res.ok) {
      setLinking(false);
      if (res.reason === 'no-auth') {
        setError(t('adminCanales.inboxAuthRequired'));
      } else {
        setError(t('adminSettings.whatsappConnectError'));
      }
      return;
    }
    setConnectPayload(res.data);
    await refreshStatus();
  };

  const handleSyncWebhook = async () => {
    setSyncingWebhook(true);
    setError(null);
    const res = await configureWhatsappWebhook();
    setSyncingWebhook(false);
    if (!res.ok) {
      setError(t('adminSettings.whatsappConnectError'));
      return;
    }
    await refreshStatus();
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError(null);
    const res = await disconnectWhatsapp();
    setDisconnecting(false);
    if (!res.ok) {
      setError(t('adminSettings.whatsappDisconnectError'));
      return;
    }
    setConnectPayload(null);
    setLinking(false);
    await refreshStatus();
  };

  const state = linkStatus?.state ?? 'unknown';
  const linked = linkStatus?.linked === true;
  const statusLabel = linked
    ? t('adminSettings.whatsappLinked')
    : state === 'connecting'
      ? t('adminSettings.whatsappConnecting')
      : t('adminSettings.whatsappDisconnected');

  return (
    <div
      id="whatsapp"
      className="scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6"
    >
      <h3 className="text-lg font-semibold text-foreground">{t('adminSettings.whatsappTitle')}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t('adminSettings.whatsappDescription')}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            statusBadgeClass(state),
          )}
        >
          {loadingStatus ? t('adminSettings.whatsappConnecting') : statusLabel}
        </span>
        {linkStatus?.instanceName ? (
          <span className="text-xs text-muted-foreground">{linkStatus.instanceName}</span>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {loadingStatus ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('adminSettings.whatsappConnecting')}
        </div>
      ) : linked ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-foreground">{t('adminSettings.whatsappLinkedSuccess')}</p>
          <p
            className={cn(
              'text-sm',
              linkStatus?.webhookConfigured
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-amber-800 dark:text-amber-200',
            )}
          >
            {linkStatus?.webhookConfigured
              ? t('adminSettings.whatsappWebhookOk')
              : t('adminSettings.whatsappWebhookPending')}
          </p>
          {linkStatus?.webhookCallbackUrl ? (
            <p className="break-all text-xs text-muted-foreground">
              {t('adminSettings.whatsappWebhookUrl')}: {linkStatus.webhookCallbackUrl}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={syncingWebhook}
              onClick={() => void handleSyncWebhook()}
            >
              {syncingWebhook ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  {t('adminSettings.whatsappSyncWebhook')}
                </>
              ) : (
                t('adminSettings.whatsappSyncWebhook')
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disconnecting}
              onClick={() => void handleDisconnect()}
            >
            {disconnecting ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                {t('adminSettings.whatsappDisconnect')}
              </>
            ) : (
              t('adminSettings.whatsappDisconnect')
            )}
          </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <Button type="button" onClick={() => void handleLink()} disabled={linking}>
            {linking ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                {t('adminSettings.whatsappConnecting')}
              </>
            ) : (
              t('adminSettings.whatsappLinkButton')
            )}
          </Button>

          {connectPayload?.qrcodeBase64 ? (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted-foreground">{t('adminSettings.whatsappQrHint')}</p>
              <img
                src={connectPayload.qrcodeBase64}
                alt=""
                className="max-w-[min(280px,100%)] rounded-lg border border-border bg-white p-2 shadow-sm"
              />
            </div>
          ) : null}

          {connectPayload?.pairingCode ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm font-medium text-foreground">{t('adminSettings.whatsappPairingHint')}</p>
              <p className="mt-2 font-mono text-2xl tracking-widest text-foreground">
                {formatPairingCode(connectPayload.pairingCode)}
              </p>
            </div>
          ) : null}

          {linking && !connectPayload?.qrcodeBase64 && !connectPayload?.pairingCode ? (
            <p className="text-sm text-muted-foreground">{t('adminSettings.whatsappWaitingScan')}</p>
          ) : null}
        </div>
      )}

      {managerUrl ? (
        <p className="mt-6 text-xs text-muted-foreground">
          <a
            href={managerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {t('adminSettings.whatsappManagerLink')}
          </a>
          {' · '}
          <Link href={path('/app/admin/canales/whatsapp')} className="underline underline-offset-2 hover:text-foreground">
            {t('adminSettings.whatsappOpenInbox')}
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-xs text-muted-foreground">
          <Link href={path('/app/admin/canales/whatsapp')} className="underline underline-offset-2 hover:text-foreground">
            {t('adminSettings.whatsappOpenInbox')}
          </Link>
        </p>
      )}
    </div>
  );
}
