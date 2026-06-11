import { useCallback, useEffect, useState } from 'react';
import { CircleUser } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  clearInboxAccountAvatarBlob,
  loadInboxAccountAvatarUrl,
  setInboxAccountAvatarCacheKey,
} from '@/lib/inboxAccountAvatar';

type InboxAccountAvatarProps = {
  alt?: string;
  enabled?: boolean;
  /** ownerJid u otro id estable de la cuenta vinculada; al cambiar se recarga la foto */
  cacheKey?: string;
  className?: string;
};

export function InboxAccountAvatar({
  alt = '',
  enabled = true,
  cacheKey = '',
  className,
}: InboxAccountAvatarProps) {
  const [src, setSrc] = useState<string | null>(null);

  const loadAvatar = useCallback(
    async (force = false): Promise<string | null> => {
      const key = cacheKey.trim();
      if (!enabled || !key) {
        return null;
      }
      if (force) clearInboxAccountAvatarBlob(key);
      setInboxAccountAvatarCacheKey(key);
      return loadInboxAccountAvatarUrl(key);
    },
    [cacheKey, enabled],
  );

  useEffect(() => {
    if (!enabled || !cacheKey.trim()) {
      setSrc(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      const url = await loadAvatar();
      if (!cancelled) setSrc(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, cacheKey, loadAvatar]);

  useEffect(() => {
    const onAccountChanged = () => {
      setSrc(null);
      if (enabled && cacheKey.trim()) {
        void loadAvatar(true).then((url) => setSrc(url));
      }
    };
    window.addEventListener('inbox:whatsapp-account-changed', onAccountChanged);
    return () => window.removeEventListener('inbox:whatsapp-account-changed', onAccountChanged);
  }, [enabled, cacheKey, loadAvatar]);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        onError={() => {
          void loadAvatar(true).then((url) => setSrc(url));
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
