import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { WhatsAppGlyph } from '@/components/admin/AdminChannelIcons';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { logoutAdmin } from '@/lib/adminAuth';
import {
  fetchWhatsappConnect,
  fetchWhatsappLinkStatus,
  type WhatsappConnectDto,
} from '@/lib/adminInboxApi';
import { notifyInboxAccountAvatarChanged } from '@/lib/inboxAccountAvatar';
import { notifyWhatsappLinkChanged } from '@/lib/inboxWhatsappLink';

export type WhatsappGate = 'loading' | 'linked' | 'connecting' | 'not-linked' | 'no-auth' | 'error';

type Props = {
  gate: WhatsappGate;
  onRefreshLink: () => Promise<WhatsappGate>;
};

function formatPairingCode(code: string): string {
  const raw = code.replace(/\D/g, '');
  if (raw.length >= 8) {
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
  }
  return code.trim();
}

export function WhatsappInboxLinkGate({ gate, onRefreshLink }: Props) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [, setLocation] = useLocation();
  const [linking, setLinking] = useState(false);
  const [connectPayload, setConnectPayload] = useState<WhatsappConnectDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const linkingRef = useRef(linking);
  linkingRef.current = linking;

  const goToAdminLogin = () => {
    logoutAdmin();
    setLocation(path('/login?next=admin'));
  };

  const handleLink = useCallback(async () => {
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
    await onRefreshLink();
  }, [onRefreshLink, t]);

  useEffect(() => {
    if (gate === 'linked' || gate === 'no-auth') return;
    const poll = () => {
      void onRefreshLink().then((nextGate) => {
        if (nextGate !== 'linked') return;
        setLinking(false);
        setConnectPayload(null);
        setError(null);
        void fetchWhatsappLinkStatus().then((res) => {
          if (!res.ok) return;
          const ownerJid = res.data.ownerJid?.trim() || '';
          notifyInboxAccountAvatarChanged(ownerJid);
          notifyWhatsappLinkChanged({ linked: true, ownerJid });
        });
      });
    };
    poll();
    const interval = window.setInterval(poll, gate === 'connecting' || linkingRef.current ? 3000 : 8000);
    return () => window.clearInterval(interval);
  }, [gate, onRefreshLink]);

  useEffect(() => {
    if (!linking && !connectPayload) return;
    const interval = window.setInterval(() => {
      void onRefreshLink().then((nextGate) => {
        if (nextGate !== 'linked') return;
        setLinking(false);
        setConnectPayload(null);
        void fetchWhatsappLinkStatus().then((res) => {
          if (!res.ok) return;
          const ownerJid = res.data.ownerJid?.trim() || '';
          notifyInboxAccountAvatarChanged(ownerJid);
          notifyWhatsappLinkChanged({ linked: true, ownerJid });
        });
      });
    }, 3000);
    return () => window.clearInterval(interval);
  }, [linking, connectPayload, onRefreshLink]);

  const showQrPanel = linking || !!connectPayload?.qrcodeBase64 || !!connectPayload?.pairingCode;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-[#f0f2f5] px-6 py-12 text-center dark:bg-[#111b21]">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#128c7e] text-white shadow-md">
        <WhatsAppGlyph className="size-8" />
      </div>

      {gate === 'loading' ? (
        <>
          <h2 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('adminCanales.whatsappCheckingTitle')}
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            {t('adminCanales.whatsappLoadingChats')}
          </p>
          <Loader2 className="mt-6 size-6 animate-spin text-[#128c7e]" aria-hidden />
        </>
      ) : gate === 'connecting' || showQrPanel ? (
        <>
          <h2 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('adminCanales.whatsappConnectingTitle')}
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            {t('adminCanales.whatsappConnectingBody')}
          </p>
          {error ? (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          {connectPayload?.qrcodeBase64 ? (
            <img
              src={connectPayload.qrcodeBase64}
              alt=""
              className="mt-6 max-w-[min(280px,100%)] rounded-lg border border-black/10 bg-white p-2 shadow-sm dark:border-white/10"
            />
          ) : null}
          {connectPayload?.pairingCode ? (
            <div className="mt-6 rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-zinc-900/60">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {t('adminSettings.whatsappPairingHint')}
              </p>
              <p className="mt-2 font-mono text-2xl tracking-widest text-zinc-900 dark:text-zinc-50">
                {formatPairingCode(connectPayload.pairingCode)}
              </p>
            </div>
          ) : null}
          {showQrPanel ? (
            linking && !connectPayload?.qrcodeBase64 && !connectPayload?.pairingCode ? (
              <div className="mt-6 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {t('adminSettings.whatsappWaitingScan')}
              </div>
            ) : null
          ) : (
            <>
              <Loader2 className="mt-6 size-6 animate-spin text-[#128c7e]" aria-hidden />
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                disabled={linking}
                onClick={() => void handleLink()}
              >
                {t('adminCanales.whatsappLinkButton')}
              </Button>
            </>
          )}
        </>
      ) : gate === 'no-auth' ? (
        <>
          <h2 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('adminCanales.inboxAuthRequired')}
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            {t('adminCanales.inboxAuthRequiredBody')}
          </p>
          <Button
            type="button"
            className="mt-6 bg-[#128c7e] hover:bg-[#0f7669]"
            onClick={goToAdminLogin}
          >
            {t('adminCanales.inboxAuthLogin')}
          </Button>
        </>
      ) : (
        <>
          <h2 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('adminCanales.whatsappNotLinkedTitle')}
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            {t('adminCanales.whatsappNotLinkedBody')}
          </p>
          {error ? (
            <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              type="button"
              className="bg-[#128c7e] hover:bg-[#0f7669]"
              disabled={linking}
              onClick={() => void handleLink()}
            >
              {linking ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                  {t('adminSettings.whatsappConnecting')}
                </>
              ) : (
                t('adminCanales.whatsappLinkButton')
              )}
            </Button>
            <Button asChild variant="outline">
              <Link href={path('/app/admin/settings#whatsapp')}>
                {t('adminCanales.whatsappGoToSettings')}
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
