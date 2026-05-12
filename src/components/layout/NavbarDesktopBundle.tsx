import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
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
import { NavbarLangSwitcher } from '@/components/layout/NavbarLangSwitcher';
import { companiaPaths, serviciosPaths } from '@/components/layout/navConfig';

export type NavbarDesktopBundleProps = {
  overlay: boolean;
  elevated: boolean;
};

/**
 * Menú desktop (Radix NavigationMenu). Solo se monta cuando `isDesktopNav` en Navbar
 * para no parsear este JS en viewport móvil (Lighthouse móvil / TBT).
 */
export default function NavbarDesktopBundle({ overlay, elevated }: NavbarDesktopBundleProps) {
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

  return (
    <div className="flex flex-1 items-center justify-end gap-1">
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
      <NavbarLangSwitcher className="ml-1 shrink-0" overlay={overlay} />
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
  );
}
