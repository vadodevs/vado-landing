import { Link } from 'wouter';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';

export type CardFeatureSectionButton = {
  label: string;
  href: string;
  variant?: 'default' | 'outline';
  className?: string;
};

export type CardFeatureSectionProps = {
  /** Etiqueta pequeña arriba del título (ej. "SOLUCIONES DE IA") */
  label: string;
  /** Título principal */
  title: string;
  /** Párrafo descriptivo */
  description: string;
  /** Botón principal (relleno) */
  primaryButton: CardFeatureSectionButton;
  /** Botón secundario (outline) */
  secondaryButton: CardFeatureSectionButton;
  /** Contenido de la columna derecha (ej. mockup, imagen, etc.) */
  rightContent: React.ReactNode;
  /** URL de la imagen de fondo. Por defecto: /backgrounds/bg-card.svg */
  backgroundSrc?: string;
  /** Alt de la imagen de fondo (accesibilidad) */
  backgroundAlt?: string;
  /** Clase adicional para el contenedor de la sección */
  className?: string;
};

export function CardFeatureSection({
  label,
  title,
  description,
  primaryButton,
  secondaryButton,
  rightContent,
  backgroundSrc = '/backgrounds/bg-card.svg',
  backgroundAlt = '',
  className,
}: CardFeatureSectionProps) {
  return (
    <CenterContainer className={className}>
      <section className="relative w-full max-w-full overflow-hidden rounded-2xl">
        <img
          src={backgroundSrc}
          alt={backgroundAlt}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
          aria-hidden={!backgroundAlt}
        />
        <div className="relative flex flex-col gap-10 px-6 py-12 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:px-12 lg:py-16">
          <div className="flex min-w-0 flex-1 flex-col lg:max-w-[52%]">
            <p className="mb-2 text-xs font-medium tracking-wider text-white/70 uppercase md:text-sm">
              {label}
            </p>
            <h2 className="mb-4 text-3xl leading-tight font-bold text-white md:text-4xl">
              {title}
            </h2>
            <p className="mb-6 text-base leading-relaxed text-white md:text-lg">
              {description}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant={secondaryButton.variant ?? 'outline'}
                className={`w-full sm:w-auto ${secondaryButton.className ?? 'border-white bg-transparent text-white'}`}
                asChild
              >
                <Link href={secondaryButton.href}>{secondaryButton.label}</Link>
              </Button>
              <Button
                variant={primaryButton.variant ?? 'default'}
                className={`w-full sm:w-auto ${primaryButton.className ?? ''}`}
                asChild
              >
                <Link href={primaryButton.href}>{primaryButton.label}</Link>
              </Button>
            </div>
          </div>
          <div className="flex w-full justify-center md:max-w-[480px] lg:block lg:w-auto lg:min-w-[380px] lg:flex-1 lg:items-center lg:justify-center xl:min-w-[420px]">
            <div className="flex w-full justify-center overflow-hidden" aria-hidden>
              {rightContent}
            </div>
          </div>
        </div>
      </section>
    </CenterContainer>
  );
}
