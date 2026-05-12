import { Link, useLocation } from 'wouter';

import { cn } from '@/lib/utils';
import { useLocale } from '@/hooks/useLocale';

export function NavbarLangSwitcher({
  className,
  overlay,
}: {
  className?: string;
  overlay?: boolean;
}) {
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
