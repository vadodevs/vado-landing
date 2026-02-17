import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type FeatureCardPanelButton = {
  label: string;
  href: string;
  variant?: 'default' | 'outline';
};

type BasePanelProps = {
  iconSrc: string;
  iconAlt: string;
  className?: string;
};

type SubPanelProps = BasePanelProps & {
  variant: 'sub';
  description: string;
  /** Solo en servicios: fondo #435c78 y texto claro */
  appearance?: 'default' | 'darkSub';
};

type MainPanelProps = BasePanelProps & {
  variant: 'main';
  preHeading?: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  /** Párrafo adicional opcional (ej. para AI Why Vado) */
  descriptionPart2?: string;
  primaryButton: FeatureCardPanelButton;
  secondaryButton?: FeatureCardPanelButton;
  /** Solo en servicios: fondo #263e59 y texto claro */
  appearance?: 'default' | 'darkMain';
};

export type FeatureCardPanelProps = SubPanelProps | MainPanelProps;

const panelBaseClasses =
  'flex flex-col rounded-2xl bg-primary/5 px-6 py-6 text-[#19314c] md:px-8 md:py-8';

export function FeatureCardPanel(props: FeatureCardPanelProps) {
  const { iconSrc, iconAlt, className } = props;

  if (props.variant === 'sub') {
    const isDark = props.appearance === 'darkSub';
    return (
      <div
        className={cn(
          'flex flex-col gap-4 rounded-2xl px-6 py-6 md:px-8 md:py-8',
          isDark ? 'bg-[#435c78] text-white' : panelBaseClasses,
          className
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-center md:h-16">
          <img
            src={iconSrc}
            alt={iconAlt}
            className={cn(
              'size-10 object-contain md:size-12',
              isDark ? 'opacity-90' : 'text-primary'
            )}
            aria-hidden
          />
        </div>
        <p
          className={cn(
            'text-sm leading-relaxed md:text-base',
            isDark ? 'text-white/95' : 'text-[#19314c]'
          )}
        >
          {props.description}
        </p>
      </div>
    );
  }

  const {
    preHeading,
    titlePart1,
    titlePart2,
    description,
    descriptionPart2,
    primaryButton,
    secondaryButton,
    appearance = 'default',
  } = props;

  const isDark = appearance === 'darkMain';

  const paragraphClasses = cn(
    'text-base leading-relaxed md:text-lg',
    isDark ? 'text-white/95' : 'text-[#19314c]'
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl px-6 py-6 md:px-8 md:py-8',
        isDark ? 'bg-[#263e59] text-white' : panelBaseClasses,
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-center md:h-16">
        <img
          src={iconSrc}
          alt={iconAlt}
          className={cn(
            'size-12 object-contain md:size-14',
            isDark ? 'opacity-90' : 'text-primary'
          )}
          aria-hidden
        />
      </div>
      {preHeading && (
        <p
          className={cn(
            'shrink-0 text-xs font-medium uppercase tracking-wider md:text-sm',
            isDark ? 'text-white/80' : 'text-[#19314c]/80'
          )}
        >
          {preHeading}
        </p>
      )}
      <h2
        className={cn(
          'shrink-0 text-2xl font-bold leading-tight md:text-3xl',
          isDark ? 'text-white' : 'text-[#19314c]'
        )}
      >
        <span>{titlePart1} </span>
        <span className={isDark ? 'text-primary-foreground' : 'text-primary'}>
          {titlePart2}
        </span>
      </h2>
      <div className="min-h-0 flex-1 flex flex-col gap-3">
        <p className={paragraphClasses}>{description}</p>
        {descriptionPart2 && <p className={paragraphClasses}>{descriptionPart2}</p>}
      </div>
      <div className="mt-2 flex shrink-0 flex-col gap-3 sm:flex-row">
        {secondaryButton && (
          <Button
            variant="outline"
            className={
              isDark
                ? 'w-full border-white text-white hover:bg-white/10 sm:w-auto'
                : 'w-full border-primary text-primary sm:w-auto'
            }
            asChild
          >
            <Link href={secondaryButton.href}>{secondaryButton.label}</Link>
          </Button>
        )}
        <Button className="w-full sm:w-auto" asChild>
          <Link href={primaryButton.href}>{primaryButton.label}</Link>
        </Button>
      </div>
    </div>
  );
}
