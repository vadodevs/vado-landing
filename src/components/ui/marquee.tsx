import { cn } from '@/lib/utils';

type MarqueeProps = {
  children: React.ReactNode;
  className?: string;
  gap?: string;
  duration?: number;
  pauseOnHover?: boolean;
};

export function Marquee({
  children,
  className,
  gap = 'gap-12',
  duration = 45,
  pauseOnHover = true,
}: MarqueeProps) {
  return (
    <div
      className={cn('overflow-hidden', pauseOnHover && 'group/marquee', className)}
      role="marquee"
      aria-hidden
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
      }}
    >
      <div
        className={cn('flex w-max', gap, pauseOnHover && 'marquee-track')}
        style={
          {
            animation: `marquee ${duration}s linear infinite`,
          } as React.CSSProperties
        }
      >
        {children}
        {children}
      </div>
    </div>
  );
}
