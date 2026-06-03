import { useCallback, useEffect, useState } from 'react';
import { CircleUser } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  loadInboxAccountAvatarUrl,
  releaseInboxAccountAvatarUrl,
} from '@/lib/inboxAccountAvatar';

type InboxAccountAvatarProps = {
  alt?: string;
  enabled?: boolean;
  className?: string;
};

export function InboxAccountAvatar({
  alt = '',
  enabled = true,
  className,
}: InboxAccountAvatarProps) {
  const [src, setSrc] = useState<string | null>(null);

  const loadAvatar = useCallback(async (force = false) => {
    if (!enabled) {
      setSrc(null);
      return;
    }
    if (force) {
      releaseInboxAccountAvatarUrl();
      setSrc(null);
    }
    const url = await loadInboxAccountAvatarUrl();
    setSrc(url);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    void loadInboxAccountAvatarUrl().then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => {
          void loadAvatar(true);
        }}
        className={cn(
          'size-10 shrink-0 rounded-full object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10',
          className,
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 shadow-sm dark:bg-zinc-700 dark:text-zinc-400',
        className,
      )}
      aria-hidden={!alt}
      title={alt || undefined}
    >
      <CircleUser className="size-6" strokeWidth={1.5} />
    </div>
  );
}
