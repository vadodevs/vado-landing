import { cn } from '@/lib/utils';

type TabletMockupProps = {
  src?: string;
  alt?: string;
  children?: React.ReactNode;
  className?: string;
};

export function TabletMockup({ src, alt = '', children, className }: TabletMockupProps) {
  return (
    <div className={cn('relative mx-auto w-[min(320px,85vw)]', className)} aria-hidden>
      <div className="relative rounded-[1.25rem] bg-neutral-800 p-2 shadow-xl shadow-black/25">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[0.75rem] bg-white">
          {src ? (
            <img src={src} alt={alt} className="h-full w-full object-cover object-top" />
          ) : (
            children ?? (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <svg className="h-16 w-16 text-muted-foreground/35" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
