import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  loadInboxContactAvatarUrl,
  releaseInboxContactAvatarUrl,
} from '@/lib/inboxContactAvatar';

type InboxContactAvatarProps = {
  conversationId: string;
  name: string;
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  channel?: 'whatsapp' | 'facebook' | 'instagram' | 'bot-test';
  className?: string;
};

const sizeClasses = {
  sm: 'size-8 text-[10px]',
  md: 'size-10 text-xs',
  lg: 'size-12 text-sm',
} as const;

const channelBg: Record<string, string> = {
  whatsapp: 'bg-[#128c7e] text-white',
  facebook: 'bg-[#1877F2] text-white',
  instagram: 'bg-gradient-to-br from-[#833AB4] to-[#F77737] text-white',
  'bot-test': 'bg-[#14d9ce] text-zinc-900',
};

export function InboxContactAvatar({
  conversationId,
  name,
  initials,
  size = 'lg',
  channel = 'whatsapp',
  className,
}: InboxContactAvatarProps) {
  const [src, setSrc] = useState<string | null>(null);

  const loadAvatar = useCallback(async (force = false) => {
    if (force) {
      releaseInboxContactAvatarUrl(conversationId);
      setSrc(null);
    }
    const url = await loadInboxContactAvatarUrl(conversationId);
    setSrc(url);
  }, [conversationId]);

  useEffect(() => {
    let cancelled = false;
    void loadInboxContactAvatarUrl(conversationId).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  const dim = sizeClasses[size];
  const bg = channelBg[channel] ?? channelBg.whatsapp;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => {
          void loadAvatar(true);
        }}
        className={cn(
          'shrink-0 rounded-full object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10',
          dim,
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold shadow-sm',
        dim,
        bg,
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
