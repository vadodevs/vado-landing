import { type ReactNode, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type ViewportLazySectionProps = {
  children: ReactNode;
  /** Reserve vertical space while the section chunk loads (reduces CLS). */
  skeletonClassName?: string;
  /** Start loading before the section enters the viewport (matches HomeBelowFold gate style). */
  rootMargin?: string;
};

/**
 * Mounts `children` only when the placeholder nears the viewport so dynamic-import chunks
 * fetch/parse off the critical path until the user scrolls.
 */
export function ViewportLazySection({
  children,
  skeletonClassName = 'min-h-[min(42vh,440px)] w-full bg-muted/10',
  rootMargin = '360px 0px 480px 0px',
}: ViewportLazySectionProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShow(true);
            io.disconnect();
            return;
          }
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className="[content-visibility:auto] [contain-intrinsic-block-size:auto_min(42vh,440px)]"
    >
      {show ? (
        children
      ) : (
        <div className={cn(skeletonClassName)} aria-hidden />
      )}
    </div>
  );
}
