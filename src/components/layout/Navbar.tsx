import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { VadoLogo } from '@/assets/vado-logo';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

const NavbarMobileBundle = lazy(() => import('@/components/layout/NavbarMobileBundle'));
const NavbarDesktopBundle = lazy(() => import('@/components/layout/NavbarDesktopBundle'));

const SCROLL_ELEVATE_PX = 8;
/** Cuánto se mueve el navbar respecto al delta de scroll (0–1): más bajo = más “poco a poco” */
const SCROLL_TO_NAV_FACTOR = 0.42;
/** Ignorar micro-ruidos del trackpad */
const SCROLL_DELTA_EPS = 1.5;
/** Bajar: ocultar de golpe solo si reduced motion — mismos umbrales que antes */
const SCROLL_DOWN_HIDE_PX = 12;
const SCROLL_UP_SHOW_PX = 4;
const DESKTOP_NAV_MQ = '(min-width: 1024px)';

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [elevated, setElevated] = useState(false);
  /** 0 = visible, negativo = subido (px) — solo desktop lg+ */
  const [navOffsetY, setNavOffsetY] = useState(0);
  /** Transición suave al subir scroll; sin transición al bajar para seguir el dedo */
  const [revealTransition, setRevealTransition] = useState(true);
  const [isDesktopNav, setIsDesktopNav] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_NAV_MQ).matches,
  );
  const [reducedMotion, setReducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [navHiddenReduced, setNavHiddenReduced] = useState(false);
  const [navHeaderHeight, setNavHeaderHeight] = useState(88);
  /** Synced with ResizeObserver; read during scroll/resize to avoid forced layout (offsetHeight). */
  const navHeaderHeightRef = useRef(88);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const { t } = useTranslation();
  const { path } = useLocale();
  const [location] = useLocation();
  const homePath = path('');

  const overlay = !elevated;

  useLayoutEffect(() => {
    const mqDesktop = window.matchMedia(DESKTOP_NAV_MQ);
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncDesktop = () => setIsDesktopNav(mqDesktop.matches);
    const syncReduce = () => setReducedMotion(mqReduce.matches);
    syncDesktop();
    syncReduce();
    mqDesktop.addEventListener('change', syncDesktop);
    mqReduce.addEventListener('change', syncReduce);
    return () => {
      mqDesktop.removeEventListener('change', syncDesktop);
      mqReduce.removeEventListener('change', syncReduce);
    };
  }, []);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const syncHeight = () => {
      const h = el.offsetHeight;
      navHeaderHeightRef.current = h;
      setNavHeaderHeight(h);
    };
    const ro = new ResizeObserver(syncHeight);
    ro.observe(el);
    syncHeight();
    return () => ro.disconnect();
  }, [location]);

  /* Reset de scroll-nav y suscripción: setState inicial al cambiar ruta / drawer / breakpoint es intencional */
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    lastScrollY.current = window.scrollY;
    setNavOffsetY(0);
    setNavHiddenReduced(false);
    setRevealTransition(true);
    if (typeof window !== 'undefined') {
      if (!isDesktopNav) {
        setElevated(window.scrollY > SCROLL_ELEVATE_PX);
      } else {
        setElevated(false);
      }
    }

    const onScroll = () => {
      const y = window.scrollY;
      const prev = lastScrollY.current;

      if (drawerOpen) {
        lastScrollY.current = y;
        if (!isDesktopNav) {
          setElevated(y > SCROLL_ELEVATE_PX);
        } else if (y <= SCROLL_ELEVATE_PX) {
          setElevated(false);
        }
        return;
      }

      if (!isDesktopNav) {
        lastScrollY.current = y;
        setElevated(y > SCROLL_ELEVATE_PX);
        setNavOffsetY(0);
        setNavHiddenReduced(false);
        return;
      }

      // Desktop: barra oscura en el hero (arriba del todo); más abajo solo blanca al subir scroll
      if (y <= SCROLL_ELEVATE_PX) {
        lastScrollY.current = y;
        setElevated(false);
        setNavOffsetY(0);
        setNavHiddenReduced(false);
        setRevealTransition(true);
        return;
      }

      const delta = y - prev;
      lastScrollY.current = y;

      if (Math.abs(delta) >= SCROLL_DELTA_EPS) {
        if (delta < 0) {
          setElevated(true);
        } else {
          setElevated(false);
        }
      }

      if (reducedMotion) {
        if (delta > SCROLL_DOWN_HIDE_PX) {
          setNavHiddenReduced(true);
        } else if (delta < -SCROLL_UP_SHOW_PX) {
          setNavHiddenReduced(false);
        }
        return;
      }

      if (Math.abs(delta) < SCROLL_DELTA_EPS) {
        return;
      }

      const h = navHeaderHeightRef.current;

      if (delta > 0) {
        setRevealTransition(false);
        setNavOffsetY((off) => Math.max(off - delta * SCROLL_TO_NAV_FACTOR, -h));
      } else {
        setRevealTransition(true);
        setNavOffsetY((off) => Math.min(off - delta * SCROLL_TO_NAV_FACTOR, 0));
      }
    };

    const onResize = () => {
      if (!isDesktopNav) {
        setNavOffsetY(0);
        setNavHiddenReduced(false);
        return;
      }
      const h = navHeaderHeightRef.current;
      setNavOffsetY((off) => Math.min(0, Math.max(off, -h)));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [location, drawerOpen, isDesktopNav, reducedMotion]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const navTransformResolved = !isDesktopNav
    ? 'translateY(0)'
    : reducedMotion
      ? navHiddenReduced
        ? 'translateY(-100%)'
        : 'translateY(0)'
      : `translateY(${navOffsetY}px)`;

  const navTransition = reducedMotion
    ? 'none'
    : [
        isDesktopNav
          ? revealTransition
            ? 'transform 450ms cubic-bezier(0.22, 1, 0.36, 1)'
            : 'transform 0ms linear 0s'
          : null,
        'background-color 500ms ease',
        'box-shadow 500ms ease',
        'border-color 500ms ease',
      ]
        .filter(Boolean)
        .join(', ');

  const navInert =
    isDesktopNav &&
    (reducedMotion ? navHiddenReduced : navOffsetY <= -navHeaderHeight + 6);

  return (
    <header
      ref={headerRef}
      inert={navInert ? true : undefined}
      style={{
        transform: navTransformResolved,
        transition: navTransition,
      }}
      className={cn(
        'fixed left-0 right-0 top-0 z-40 w-full p-3',
        'motion-reduce:transition-none',
        elevated
          ? 'bg-white shadow-sm'
          : 'border-transparent bg-black',
      )}
    >
      <CenterContainer className="flex h-14 items-center justify-between">
        <Link
          href={homePath}
          className="flex shrink-0 size-28 items-center"
          aria-label={t('nav.logoHome')}
        >
          <VadoLogo white={overlay} />
        </Link>

        {!isDesktopNav ? (
          <Suspense
            fallback={
              <div className="flex items-center gap-2" aria-hidden>
                <div className="bg-muted/30 h-8 w-16 shrink-0 rounded-md" />
                <div className="bg-muted/30 size-10 shrink-0 rounded-md" />
              </div>
            }
          >
            <NavbarMobileBundle
              overlay={overlay}
              drawerOpen={drawerOpen}
              onOpenChange={setDrawerOpen}
            />
          </Suspense>
        ) : null}

        {isDesktopNav ? (
          <Suspense
            fallback={
              <div className="ml-auto flex flex-1 items-center justify-end gap-2" aria-hidden>
                <div className="bg-muted/40 h-9 w-[min(16rem,42vw)] max-w-[50vw] rounded-lg" />
                <div className="bg-muted/40 h-8 w-14 rounded-md" />
                <div className="bg-muted/40 h-9 w-24 rounded-lg" />
              </div>
            }
          >
            <NavbarDesktopBundle overlay={overlay} elevated={elevated} />
          </Suspense>
        ) : null}
      </CenterContainer>
    </header>
  );
}
