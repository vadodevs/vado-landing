import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { VadoLogo } from '@/assets/vado-logo';
import { Button } from '@/components/ui/button';
import { CenterContainer } from '@/components/layout/CenterContainer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

const serviciosPaths = [
  { path: '/services/custom-software', labelKey: 'nav.customSoftware' as const },
  { path: '/services/ai-solutions', labelKey: 'nav.aiSolutions' as const },
  { path: '/services/staff-augmentation', labelKey: 'nav.staffAugmentation' as const },
];

const companiaPaths = [
  { path: '/company/vado-insights', labelKey: 'nav.vadoInsights' as const },
  { path: '/company/culture-and-talent', labelKey: 'nav.cultureAndTalent' as const },
];

function NavLink({
  href,
  children,
  onClick,
  className,
  exact,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  exact?: boolean;
}) {
  const [location] = useLocation();
  const base = href.replace(/\/$/, '') || '/';
  const locationNorm = location.replace(/\/$/, '') || '/';
  const isActiveRoute = exact
    ? locationNorm === base
    : locationNorm === base || (base !== '/' && locationNorm.startsWith(base + '/'));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'text-foreground hover:text-primary text-lg font-medium transition-colors',
        isActiveRoute && 'text-primary',
        className,
      )}
    >
      {children}
    </Link>
  );
}

function LangSwitcher({ className, overlay }: { className?: string; overlay?: boolean }) {
  const { locale } = useLocale();
  const [location] = useLocation();
  const enPath = location.replace(/^\/[^/]+/, '/en');
  const esPath = location.replace(/^\/[^/]+/, '/es');

  const inactive = overlay
    ? 'text-white/75 hover:text-white'
    : 'text-muted-foreground hover:text-foreground';

  return (
    <div className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        href={enPath}
        className={cn(
          'rounded px-2 py-1 font-medium transition-colors',
          locale === 'en' ? 'text-primary font-semibold' : inactive,
        )}
      >
        EN
      </Link>
      <span className={cn(overlay ? 'text-white/35' : 'text-muted-foreground')}>|</span>
      <Link
        href={esPath}
        className={cn(
          'rounded px-2 py-1 font-medium transition-colors',
          locale === 'es' ? 'text-primary font-semibold' : inactive,
        )}
      >
        ES
      </Link>
    </div>
  );
}

function MobileMenuContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [location] = useLocation();
  const loc = location.replace(/\/$/, '') || '/';
  const isServiciosActive = loc.startsWith(path('/services'));
  const isCompaniaActive = loc.startsWith(path('/company'));

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto">
      <div className="space-y-0 px-4 py-2">
        <NavLink
          href={path('')}
          onClick={onLinkClick}
          exact
          className="block rounded-lg py-3.5 text-base font-medium"
        >
          {t('nav.home')}
        </NavLink>

        <Accordion type="single" collapsible className="w-full px-0">
          <AccordionItem value="servicios" className="border-border border-b">
            <AccordionTrigger
              className={cn(
                'text-foreground hover:text-primary data-[state=open]:text-primary py-3.5 text-base font-medium hover:no-underline',
                isServiciosActive && 'text-primary font-semibold',
              )}
            >
              {t('nav.services')}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-0.5 pb-2">
                {serviciosPaths.map(({ path: p, labelKey }) => (
                  <li key={p}>
                    <NavLink
                      href={path(p)}
                      onClick={onLinkClick}
                      className="block rounded-lg py-2.5 pl-3 text-[15px]"
                    >
                      {t(labelKey)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="border-border border-b">
          <NavLink
            href={path('/our-work')}
            onClick={onLinkClick}
            className="block rounded-lg py-3.5 text-base font-medium"
          >
            {t('nav.ourWork')}
          </NavLink>
        </div>

        <Accordion type="single" collapsible className="w-full px-0">
          <AccordionItem value="compania" className="border-border border-b">
            <AccordionTrigger
              className={cn(
                'text-foreground hover:text-primary data-[state=open]:text-primary py-3.5 text-base font-medium hover:no-underline',
                isCompaniaActive && 'text-primary font-semibold',
              )}
            >
              {t('nav.company')}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-0.5 pb-2">
                {companiaPaths.map(({ path: p, labelKey }) => (
                  <li key={p}>
                    <NavLink
                      href={path(p)}
                      onClick={onLinkClick}
                      className="block rounded-lg py-2.5 pl-3 text-[15px]"
                    >
                      {t(labelKey)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="border-border mt-auto border-t p-4">
        <Link href={path('/contact')} onClick={onLinkClick} className="block">
          <Button className="h-12 w-full rounded-xl text-base font-semibold" size="lg">
            {t('nav.contactUs')}
          </Button>
        </Link>
      </div>
    </nav>
  );
}

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
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollY = useRef(0);
  const { t } = useTranslation();
  const { path } = useLocale();
  const [location] = useLocation();
  const loc = location.replace(/\/$/, '') || '/';
  const homePath = path('');
  const isHomeActive = loc === homePath.replace(/\/$/, '') || loc === '/';
  const nuestroTrabajoPath = path('/our-work');
  const isNuestroTrabajoActive =
    loc === nuestroTrabajoPath || loc.startsWith(nuestroTrabajoPath + '/');
  const serviciosBase = path('/services');
  const isServiciosActive = loc.startsWith(serviciosBase);
  const companiaBase = path('/company');
  const isCompaniaActive = loc.startsWith(companiaBase);
  const contactoPath = path('/contact');
  const isContactoActive = loc === contactoPath;

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
    const ro = new ResizeObserver(() => setNavHeaderHeight(el.offsetHeight));
    ro.observe(el);
    setNavHeaderHeight(el.offsetHeight);
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

    const headerHeight = () => headerRef.current?.offsetHeight ?? 80;

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

      const h = headerHeight();

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
      const h = headerHeight();
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
        <Link href={homePath} className="flex shrink-0 size-28 items-center">
          <VadoLogo white={overlay} />
        </Link>

        <div className="flex items-center gap-2 lg:hidden">
          <LangSwitcher className="shrink-0" overlay={overlay} />
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t('nav.openMenu')}
                className={cn(
                  overlay &&
                    'text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40',
                )}
              >
                <Menu className="size-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="border-border bg-background flex h-full max-h-dvh w-[min(85vw,320px)] flex-col rounded-none border-l shadow-xl [&>div:first-child]:hidden">
              <DrawerHeader className="flex shrink-0 flex-row items-center justify-between gap-4 px-5 py-4">
                <DrawerTitle className="sr-only">{t('nav.menu')}</DrawerTitle>
                <Link
                  href={homePath}
                  onClick={() => setDrawerOpen(false)}
                  className="flex shrink-0 items-center"
                >
                  <VadoLogo />
                </Link>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('nav.closeMenu')}
                    className="rounded-full"
                  >
                    <X className="size-5" />
                  </Button>
                </DrawerClose>
              </DrawerHeader>
              <MobileMenuContent onLinkClick={() => setDrawerOpen(false)} />
            </DrawerContent>
          </Drawer>
        </div>

        <div className="hidden flex-1 items-center justify-end gap-1 lg:flex">
          <NavigationMenu viewport={false} className="max-w-none justify-end">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href={homePath}
                    className={cn(
                      'inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      overlay
                        ? 'text-white hover:text-white/90 focus:text-white focus-visible:ring-white/40 focus-visible:ring-offset-transparent'
                        : 'text-foreground hover:text-primary focus:text-primary focus-visible:ring-ring/50',
                      isHomeActive && 'text-primary font-semibold',
                    )}
                  >
                    {t('nav.home')}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    'hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent',
                    overlay &&
                      'text-white hover:text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white data-[state=open]:text-white data-[state=open]:bg-white/10 [&_svg]:text-white',
                    !overlay &&
                      'data-[state=open]:text-primary data-[state=open]:bg-transparent',
                    isServiciosActive && 'text-primary font-semibold',
                  )}
                >
                  {t('nav.services')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid min-w-56 gap-0.5 px-2 py-1">
                    {serviciosPaths.map(({ path: p, labelKey }) => {
                      const href = path(p);
                      const isActive = loc === href || loc.startsWith(href + '/');
                      return (
                        <li key={p}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={href}
                              className={cn(
                                'text-foreground hover:text-primary focus:text-primary block rounded-lg px-3 py-2 text-sm no-underline transition-colors outline-none select-none focus:outline-none',
                                isActive && 'text-primary font-semibold',
                              )}
                            >
                              {t(labelKey)}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href={path('/our-work')}
                    className={cn(
                      'inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                      overlay
                        ? 'text-white hover:text-white/90 focus:text-white focus-visible:ring-white/40 focus-visible:ring-offset-transparent'
                        : 'text-foreground hover:text-primary focus:text-primary focus-visible:ring-ring/50',
                      isNuestroTrabajoActive && 'text-primary font-semibold',
                    )}
                  >
                    {t('nav.ourWork')}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn(
                    'hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent',
                    overlay &&
                      'text-white hover:text-white/90 hover:bg-white/10 focus:bg-white/10 focus:text-white data-[state=open]:text-white data-[state=open]:bg-white/10 [&_svg]:text-white',
                    !overlay &&
                      'data-[state=open]:text-primary data-[state=open]:bg-transparent',
                    isCompaniaActive && 'text-primary font-semibold',
                  )}
                >
                  {t('nav.company')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid min-w-52 gap-1 px-3 py-2">
                    {companiaPaths.map(({ path: p, labelKey }) => {
                      const href = path(p);
                      const isActive = loc === href || loc.startsWith(href + '/');
                      return (
                        <li key={p}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={href}
                              className={cn(
                                'text-foreground hover:text-primary focus:text-primary block rounded-lg px-4 py-2.5 text-sm no-underline transition-colors outline-none select-none focus:outline-none',
                                isActive && 'text-primary font-semibold',
                              )}
                            >
                              {t(labelKey)}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      );
                    })}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <LangSwitcher className="ml-1 shrink-0" overlay={overlay} />
          <Button
            asChild
            size="default"
            variant={overlay || isContactoActive ? 'outline' : 'default'}
            className={cn(
              'ml-2 shrink-0',
              overlay &&
                'border-white bg-transparent text-white hover:bg-white/15 hover:text-white',
              elevated && isContactoActive && 'border-primary text-primary',
            )}
          >
            <Link href={path('/contact')}>{t('nav.contactUs')}</Link>
          </Button>
        </div>
      </CenterContainer>
    </header>
  );
}
