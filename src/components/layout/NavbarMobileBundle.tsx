import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

import { VadoLogo } from '@/assets/vado-logo';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';
import { NavbarLangSwitcher } from '@/components/layout/NavbarLangSwitcher';
import { NavbarNavLink } from '@/components/layout/NavbarNavLink';
import { companiaPaths, serviciosPaths } from '@/components/layout/navConfig';

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
        <NavbarNavLink
          href={path('')}
          onClick={onLinkClick}
          exact
          className="block rounded-lg py-3.5 text-base font-medium"
        >
          {t('nav.home')}
        </NavbarNavLink>

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
                    <NavbarNavLink
                      href={path(p)}
                      onClick={onLinkClick}
                      className="block rounded-lg py-2.5 pl-3 text-[15px]"
                    >
                      {t(labelKey)}
                    </NavbarNavLink>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="border-border border-b">
          <NavbarNavLink
            href={path('/our-work')}
            onClick={onLinkClick}
            className="block rounded-lg py-3.5 text-base font-medium"
          >
            {t('nav.ourWork')}
          </NavbarNavLink>
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
                    <NavbarNavLink
                      href={path(p)}
                      onClick={onLinkClick}
                      className="block rounded-lg py-2.5 pl-3 text-[15px]"
                    >
                      {t(labelKey)}
                    </NavbarNavLink>
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

export type NavbarMobileBundleProps = {
  overlay: boolean;
  drawerOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Drawer + acordeón móvil (Vaul/Radix). Solo se monta cuando `!isDesktopNav` en Navbar
 * para no descargar ni parsear este JS en viewport desktop (mejora móvil vs emulación y TBT).
 */
export default function NavbarMobileBundle({
  overlay,
  drawerOpen,
  onOpenChange,
}: NavbarMobileBundleProps) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const homePath = path('');

  return (
    <div className="flex items-center gap-2">
      <NavbarLangSwitcher className="shrink-0" overlay={overlay} />
      <Drawer open={drawerOpen} onOpenChange={onOpenChange} direction="right">
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
            <Link href={homePath} onClick={() => onOpenChange(false)} className="flex shrink-0 items-center">
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
          <MobileMenuContent onLinkClick={() => onOpenChange(false)} />
        </DrawerContent>
      </Drawer>
    </div>
  );
}
