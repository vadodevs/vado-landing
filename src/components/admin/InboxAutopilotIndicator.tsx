import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isInboxAiAutoReplyActiveNow } from '@/lib/inboxAiAutoReply';
import { INBOX_AUTOPILOT_CONFIG_CHANGE_EVENT } from '@/lib/inboxAutopilotConfig';
import { INBOX_BOT_CONFIG_CHANGE_EVENT } from '@/lib/inboxBotConfig';
import { cn } from '@/lib/utils';

export function useInboxAutopilotLive(): boolean {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === 'vado.admin.inboxBot.v1' ||
        e.key === 'vado.admin.inboxAutopilot.v1'
      ) {
        bump();
      }
    };
    window.addEventListener(INBOX_BOT_CONFIG_CHANGE_EVENT, bump);
    window.addEventListener(INBOX_AUTOPILOT_CONFIG_CHANGE_EVENT, bump);
    window.addEventListener('storage', onStorage);
    const timer = window.setInterval(bump, 30_000);
    return () => {
      window.removeEventListener(INBOX_BOT_CONFIG_CHANGE_EVENT, bump);
      window.removeEventListener(INBOX_AUTOPILOT_CONFIG_CHANGE_EVENT, bump);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(timer);
    };
  }, []);

  return useMemo(() => isInboxAiAutoReplyActiveNow(), [tick]); // tick: periodic + event-driven refresh
}

type InboxAutopilotStatusLineProps = {
  className?: string;
};


export function InboxAutopilotStatusLine({ className }: InboxAutopilotStatusLineProps) {
  const { t } = useTranslation();
  const live = useInboxAutopilotLive();

  if (!live) return null;

  return (
    <span
      className={cn(
        'mt-1 inline-flex max-w-full items-center gap-1.5 rounded-full',
        'border border-[#25d366]/25 bg-[#25d366]/10 px-2 py-0.5',
        'text-[10px] font-semibold leading-none tracking-wide text-[#25d366]',
        className,
      )}
    >
      <span className="relative flex size-1.5 shrink-0" aria-hidden>
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#25d366] opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-[#25d366]" />
      </span>
      <span className="truncate">{t('adminCanales.inboxAutopilotActive')}</span>
    </span>
  );
}
