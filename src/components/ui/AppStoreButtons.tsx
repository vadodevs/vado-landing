import { cn } from '@/lib/utils';

const STORE_ICONS = {
  googlePlay: '/store/google-play.svg',
  apple: '/store/apple.svg',
} as const;

function StoreIcon({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      className={cn('size-8 shrink-0 object-contain', className)}
    />
  );
}

export type AppStoreButtonsVariant = 'light' | 'dark';

export interface AppStoreButtonsProps {
  appStoreUrl?: string;
  playStoreUrl?: string;
  variant?: AppStoreButtonsVariant;
  /** Si true, el contenedor y cada botón ocupan el 100% del ancho (útil en sidebars/cards). */
  fullWidth?: boolean;
  className?: string;
}

/**
 * Componente reutilizable: botones oficiales de App Store y Google Play.
 * Úsalo en cualquier vista (hero, footer, cards) pasando las URLs.
 * Los dos botones se muestran siempre juntos.
 *
 * @example
 * // En un hero con fondo oscuro
 * <AppStoreButtons appStoreUrl="..." playStoreUrl="..." variant="dark" />
 *
 * @example
 * // En fondo claro (p. ej. sección o card)
 * <AppStoreButtons appStoreUrl="..." playStoreUrl="..." variant="light" />
 */
export function AppStoreButtons({
  appStoreUrl,
  playStoreUrl,
  variant = 'light',
  fullWidth = false,
  className,
}: AppStoreButtonsProps) {
  const hasAny = appStoreUrl || playStoreUrl;
  if (!hasAny) return null;

  const isLight = variant === 'light';
  const linkClass = cn(
    'inline-flex items-center justify-center gap-3 rounded-xl border px-4 py-2.5 transition-all',
    'hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    fullWidth && 'w-full',
    isLight
      ? 'border-black/20 bg-white text-black hover:border-black/30 hover:shadow-md focus-visible:ring-foreground/30'
      : 'border-white/30 bg-white/95 text-black hover:bg-white hover:border-white/50 hover:shadow-lg focus-visible:ring-white/50',
  );

  return (
    <div
      className={cn(
        fullWidth ? 'flex w-full flex-col gap-2' : 'inline-flex flex-nowrap items-stretch gap-3',
        className,
      )}
      role="group"
      aria-label="Descargar en las tiendas"
    >
      {playStoreUrl && (
        <a
          href={playStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label="Descargar en Google Play"
        >
          <StoreIcon src={STORE_ICONS.googlePlay} />
          <div className="flex flex-col items-center leading-tight">
            <span className="text-[10px] font-medium uppercase tracking-wide opacity-90">
              Get it on
            </span>
            <span className="text-sm font-semibold">Google Play</span>
          </div>
        </a>
      )}
      {appStoreUrl && (
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
          aria-label="Descargar en App Store"
        >
          <StoreIcon src={STORE_ICONS.apple} />
          <div className="flex flex-col items-center leading-tight">
            <span className="text-[10px] font-medium uppercase tracking-wide opacity-90">
              Download on the
            </span>
            <span className="text-sm font-semibold">App Store</span>
          </div>
        </a>
      )}
    </div>
  );
}
