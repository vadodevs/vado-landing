import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import {
  SettingsCollapsibleCard,
} from '@/components/settings/settings-ui';
import {
  configureWhatsappWebhook,
  importWhatsappHistoryAfterLink,
  relinkWhatsappForHistory,
  resyncWhatsappHistory,
  disconnectWhatsapp,
  adminInboxErrorMessage,
  fetchWhatsappConnect,
  fetchWhatsappLinkStatus,
  type WhatsappConnectDto,
  type WhatsappLinkStatusDto,
} from '@/lib/adminInboxApi';
import { notifyInboxAccountAvatarChanged } from '@/lib/inboxAccountAvatar';
import {
  notifyWhatsappLinkChanged,
  purgeWhatsappInboxLocalState,
  shouldKickoffWhatsappHistoryImport,
} from '@/lib/inboxWhatsappLink';

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
  const [historyImportMessage, setHistoryImportMessage] = useState<string | null>(null);
  const syncInFlightRef = useRef(false);
  const pendingHistoryImportRef = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const managerUrl = String(import.meta.env.VITE_EVOLUTION_MANAGER_URL ?? '').trim();

  const refreshStatus = useCallback(async (): Promise<WhatsappLinkStatusDto | null> => {
    const res = await fetchWhatsappLinkStatus();
    if (res.ok) {
      setLinkStatus(res.data);
      const ownerKey = res.data.linked ? (res.data.ownerJid?.trim() || '') : '';
      notifyInboxAccountAvatarChanged(ownerKey);
      return res.data;
    }
    notifyInboxAccountAvatarChanged('');
    if (res.reason === 'no-auth') {
      setError(t('adminCanales.inboxAuthRequired'));
    } else if (res.reason === 'no-config') {
      setError(t('adminCanales.botErrorNoConfig'));
    } else {
      setError(adminInboxErrorMessage(res, t, 'adminSettings.whatsappStatusError'));
    }
    return null;
  }, [t]);

  const kickoffHistoryImport = useCallback(
    (ownerJid: string) => {
      pendingHistoryImportRef.current = false;
      setConnectPayload(null);
      setHistoryImportMessage(t('adminSettings.whatsappHistoryImportingBackground'));
      notifyWhatsappLinkChanged({ linked: true, ownerJid, importHistory: true });
      if (!shouldKickoffWhatsappHistoryImport(ownerJid)) return;
      void importWhatsappHistoryAfterLink().then((res) => {
        if (!res.ok) {
          setError(adminInboxErrorMessage(res, t, 'adminSettings.whatsappConnectError'));
          setHistoryImportMessage(null);
        }
      });
    },
    [t],
  );

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingStatus(true);
      await refreshStatus();
      if (!cancelled) setLoadingStatus(false);
    };
    void run();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refreshStatus();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [refreshStatus]);

  useEffect(() => {
    if (!linking && !connectPayload) return;
    const interval = window.setInterval(() => {
      void refreshStatus().then((status) => {
        if (status?.linked) {
          setLinking(false);
          if (pendingHistoryImportRef.current) {
            const ownerJid = status.ownerJid?.trim() || '';
            kickoffHistoryImport(ownerJid);
          } else {
            setConnectPayload(null);
          }
        }
      });
    }, 3000);
    return () => window.clearInterval(interval);
  }, [linking, connectPayload, refreshStatus, kickoffHistoryImport]);

  const handleLink = async () => {
    pendingHistoryImportRef.current = true;
    setLinking(true);
    setError(null);
    setHistoryImportMessage(null);
    const res = await fetchWhatsappConnect();
    if (!res.ok) {
      setLinking(false);
      setError(adminInboxErrorMessage(res, t, 'adminSettings.whatsappConnectError'));
      return;
    }
    setConnectPayload(res.data);
    await refreshStatus();
  };

  const handleRelinkForHistory = async () => {
    if (syncInFlightRef.current) return;
    const ok = window.confirm(t('adminSettings.whatsappRelinkConfirm'));
    if (!ok) return;

    syncInFlightRef.current = true;
    setLinking(true);
    setError(null);
    setHistoryImportMessage(null);
    pendingHistoryImportRef.current = true;

    try {
      const res = await relinkWhatsappForHistory();
      if (!res.ok) {
        setError(adminInboxErrorMessage(res, t, 'adminSettings.whatsappConnectError'));
        pendingHistoryImportRef.current = false;
        setLinking(false);
        return;
      }
      setConnectPayload({
        state: res.data.state,
        qrcodeBase64: res.data.qrcodeBase64,
        pairingCode: res.data.pairingCode,
        message: res.data.message,
      });
      setLinkStatus((prev) =>
        prev
          ? { ...prev, linked: false, state: res.data.state === 'open' ? 'open' : 'connecting' }
          : prev,
      );
      await refreshStatus();
    } finally {
      syncInFlightRef.current = false;
    }
  };

  const handleSyncWebhook = async () => {
    if (syncInFlightRef.current) return;
    syncInFlightRef.current = true;
    setSyncingWebhook(true);
    setError(null);
    try {
      const webhookRes = await configureWhatsappWebhook();
      if (!webhookRes.ok) {
        setError(adminInboxErrorMessage(webhookRes, t, 'adminSettings.whatsappConnectError'));
        return;
      }
      setHistoryImportMessage(t('adminSettings.whatsappHistoryImportingBackground'));
      const resyncRes = await resyncWhatsappHistory();
      if (!resyncRes.ok) {
        setError(adminInboxErrorMessage(resyncRes, t, 'adminSettings.whatsappConnectError'));
        setHistoryImportMessage(null);
        return;
      }
      const ownerJid = linkStatus?.ownerJid?.trim() || '';
      notifyWhatsappLinkChanged({ linked: true, ownerJid, reloadInbox: true });
      await refreshStatus();
    } finally {
      syncInFlightRef.current = false;
      setSyncingWebhook(false);
    }
  };

  const handleDisconnect = async () => {
    pendingHistoryImportRef.current = false;
    setDisconnecting(true);
    setError(null);
    const res = await disconnectWhatsapp();
    setDisconnecting(false);
    if (!res.ok) {
      setError(adminInboxErrorMessage(res, t, 'adminSettings.whatsappDisconnectError'));
      return;
    }
    purgeWhatsappInboxLocalState(linkStatus?.ownerJid ?? '');
    notifyWhatsappLinkChanged({ linked: false });
    setConnectPayload(null);
    setLinking(false);
    setHistoryImportMessage(null);
    await refreshStatus();
  };

  const state = linkStatus?.state ?? 'unknown';
  const linked = linkStatus?.linked === true && state === 'open';
  const statusLabel = linked
    ? t('adminSettings.whatsappLinked')
    : state === 'connecting'
      ? t('adminSettings.whatsappConnecting')
      : t('adminSettings.whatsappDisconnected');

  const showQrPanel = linking || !!connectPayload?.qrcodeBase64 || !!connectPayload?.pairingCode;

  useEffect(() => {
    if (linked || linking || connectPayload) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refreshStatus();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [linked, linking, connectPayload, refreshStatus]);

  return (
    <SettingsCollapsibleCard
      id="whatsapp"
      icon={MessageCircle}
      title={t('adminSettings.whatsappTitle')}
      badge={
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium',
            statusBadgeClass(state),
          )}
        >
          {loadingStatus ? t('adminSettings.whatsappChecking') : statusLabel}
        </span>
      }
      description={linkStatus?.instanceName ?? undefined}
    >
      {error ? (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {historyImportMessage ? (
        <p className="mb-2 text-sm text-emerald-700 dark:text-emerald-300">{historyImportMessage}</p>
      ) : null}

      {loadingStatus ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('adminSettings.whatsappChecking')}
        </div>
      ) : linked && !showQrPanel ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm text-foreground">{t('adminSettings.whatsappLinkedSuccess')}</p>
            {linkStatus?.ownerPhone ? (
              <p className="text-sm font-medium text-foreground">{linkStatus.ownerPhone}</p>
            ) : null}
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t('adminSettings.whatsappHistoryHint')}
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full sm:w-auto"
            disabled={syncingWebhook || disconnecting}
            onClick={() => void handleRelinkForHistory()}
          >
            {t('adminSettings.whatsappResyncHistory')}
          </Button>
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
      ) : showQrPanel ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{t('adminSettings.whatsappRelinkScanHint')}</p>
          {connectPayload?.qrcodeBase64 ? (
            <div className="flex flex-col items-start gap-3">
              <img
                src={connectPayload.qrcodeBase64}
                alt=""
                className="max-w-[min(280px,100%)] rounded-lg border border-border bg-white p-2 shadow-sm"
              />
            </div>
          ) : null}
          {connectPayload?.pairingCode ? (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
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
      ) : (
        <div>
          <Button type="button" size="sm" onClick={() => void handleLink()} disabled={linking}>
            {linking ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                {t('adminSettings.whatsappConnecting')}
              </>
            ) : (
              t('adminSettings.whatsappLinkButton')
            )}
          </Button>
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1 border-t border-border pt-2">
        <Link
          href={path('/app/admin/canales/whatsapp')}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {t('adminSettings.whatsappOpenInbox')}
        </Link>
        {managerUrl ? (
          <a
            href={managerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t('adminSettings.whatsappManagerLink')}
          </a>
        ) : null}
      </div>
    </SettingsCollapsibleCard>
  );
}
