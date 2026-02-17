import { useState } from 'react';
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
  { path: '/servicios/software-a-la-medida', labelKey: 'nav.customSoftware' as const },
  { path: '/servicios/soluciones-ia', labelKey: 'nav.aiSolutions' as const },
  { path: '/servicios/ampliacion-de-personal', labelKey: 'nav.staffAugmentation' as const },
];

const companiaPaths = [
  { path: '/compania/vado-insights', labelKey: 'nav.vadoInsights' as const },
  { path: '/compania/cultura-y-talento', labelKey: 'nav.cultureAndTalent' as const },
];

function NavLink({
  href,
  children,
  onClick,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [location] = useLocation();
  const base = href.replace(/\/$/, '') || '/';
  const locationNorm = location.replace(/\/$/, '') || '/';
  const isActiveRoute =
    locationNorm === base || (base !== '/' && locationNorm.startsWith(base + '/'));

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

function LangSwitcher({ className }: { className?: string }) {
  const { locale } = useLocale();
  const [location] = useLocation();
  const enPath = location.replace(/^\/[^/]+/, '/en');
  const esPath = location.replace(/^\/[^/]+/, '/es');

  return (
    <div className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        href={enPath}
        className={cn(
          'rounded px-2 py-1 font-medium transition-colors',
          locale === 'en'
            ? 'text-primary font-semibold'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        EN
      </Link>
      <span className="text-muted-foreground">|</span>
      <Link
        href={esPath}
        className={cn(
          'rounded px-2 py-1 font-medium transition-colors',
          locale === 'es'
            ? 'text-primary font-semibold'
            : 'text-muted-foreground hover:text-foreground',
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
  const isServiciosActive = loc.startsWith(path('/servicios'));
  const isCompaniaActive = loc.startsWith(path('/compania'));

  return (
    <nav className="flex flex-1 flex-col overflow-y-auto">
      <div className="space-y-0 px-4 py-2">
        <NavLink
          href={path('')}
          onClick={onLinkClick}
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
            href={path('/nuestro-trabajo')}
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
        <Link href={path('/contacto')} onClick={onLinkClick} className="block">
          <Button className="h-12 w-full rounded-xl text-base font-semibold" size="lg">
            {t('nav.contactUs')}
          </Button>
        </Link>
      </div>
    </nav>
  );
}

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const { path } = useLocale();
  const [location] = useLocation();
  const loc = location.replace(/\/$/, '') || '/';
  const homePath = path('');
  const isHomeActive = loc === homePath.replace(/\/$/, '') || loc === '/';
  const nuestroTrabajoPath = path('/nuestro-trabajo');
  const isNuestroTrabajoActive =
    loc === nuestroTrabajoPath || loc.startsWith(nuestroTrabajoPath + '/');
  const serviciosBase = path('/servicios');
  const isServiciosActive = loc.startsWith(serviciosBase);
  const companiaBase = path('/compania');
  const isCompaniaActive = loc.startsWith(companiaBase);
  const contactoPath = path('/contacto');
  const isContactoActive = loc === contactoPath;

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b p-3">
      <CenterContainer className="flex h-14 items-center justify-between">
        <Link href={homePath} className="flex shrink-0 items-center">
          <VadoLogo className="h-10 w-auto" />
        </Link>

        <div className="flex items-center gap-2 lg:hidden">
          <LangSwitcher className="shrink-0" />
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} direction="right">
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('nav.openMenu')}>
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
                  <VadoLogo className="h-8 w-auto" />
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
                      'text-foreground hover:text-primary focus:text-primary focus-visible:ring-ring/50 inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
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
                    'hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary',
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
                    href={path('/nuestro-trabajo')}
                    className={cn(
                      'text-foreground hover:text-primary focus:text-primary focus-visible:ring-ring/50 inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
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
                    'hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary',
                    isCompaniaActive && 'text-primary font-semibold',
                  )}
                >
                  {t('nav.company')}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid min-w-40 gap-0.5 px-2 py-1">
                    {companiaPaths.map(({ path: p, labelKey }) => {
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
            </NavigationMenuList>
          </NavigationMenu>
          <LangSwitcher className="ml-1 shrink-0" />
          <Button
            asChild
            size="default"
            variant={isContactoActive ? 'outline' : 'default'}
            className={cn('ml-2 shrink-0', isContactoActive && 'border-primary text-primary')}
          >
            <Link href={path('/contacto')}>{t('nav.contactUs')}</Link>
          </Button>
        </div>
      </CenterContainer>
    </header>
  );
}
