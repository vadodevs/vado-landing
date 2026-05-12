import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import { useLocale } from '@/hooks/useLocale';
import { Hero } from '@/components/layout/home/hero/Hero';
import MainLayout from '@/components/layout/MainLayout';
const HomeBelowFold = lazy(() =>
  import('@/components/layout/home/HomeBelowFold').then((m) => ({ default: m.HomeBelowFold })),
);

function HomeBelowFoldSkeleton() {
  return <div className="bg-muted/15 min-h-[50vh] w-full" aria-hidden />;
}

/**
 * Carga el chunk de secciones bajo el hero tras idle o al acercarse por scroll,
 * para liberar el hilo principal en el primer paint (Lighthouse / mobile).
 */
function HomeBelowFoldGate() {
  const [show, setShow] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const fire = () => {
      if (cancelled) return;
      setShow(true);
    };

    const el = sentinelRef.current;
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) fire();
          }
        },
        { rootMargin: '280px 0px 400px 0px', threshold: 0 },
      );
      io.observe(el);
    }

    let useIdleCallback = false;
    let idleOrTimerId = 0;
    if (typeof requestIdleCallback !== 'undefined') {
      useIdleCallback = true;
      idleOrTimerId = requestIdleCallback(fire, { timeout: 1600 });
    } else {
      idleOrTimerId = window.setTimeout(fire, 450) as unknown as number;
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (useIdleCallback) {
        cancelIdleCallback(idleOrTimerId);
      } else {
        window.clearTimeout(idleOrTimerId);
      }
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      {show ? (
        <Suspense fallback={<HomeBelowFoldSkeleton />}>
          <HomeBelowFold />
        </Suspense>
      ) : null}
    </>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <>
      <PageMeta
        title={t('home.title')}
        description={t('seo.home')}
        canonicalPath={path('')}
        pathWithoutLang=""
      />
      <MainLayout>
        <Hero />
        <HomeBelowFoldGate />
      </MainLayout>
    </>
  );
}
