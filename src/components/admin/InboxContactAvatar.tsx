import { cn } from '@/lib/utils';

type InboxContactAvatarProps = {
  conversationId?: string;
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
  name,
  initials,
  size = 'lg',
  channel = 'whatsapp',
  className,
}: InboxContactAvatarProps) {
  const dim = sizeClasses[size];
  const bg = channelBg[channel] ?? channelBg.whatsapp;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        dim,
        bg,
        className,
      )}
      title={name}
      aria-hidden
    >
      {initials}
    </div>
  );
}
