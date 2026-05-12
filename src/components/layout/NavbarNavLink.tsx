import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';

import { cn } from '@/lib/utils';

export function NavbarNavLink({
  href,
  children,
  onClick,
  className,
  exact,
}: {
  href: string;
  children: ReactNode;
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
