import { useState } from 'react';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PhoneMockup } from '@/components/ui/phone-mockup';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';

export type TabItem = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export type ServiceTabsSectionProps = {
  /** Tabs con id, label (para el trigger), title y description (para el contenido) */
  tabs: TabItem[];
  /** Texto del botón CTA */
  ctaText: string;
  /** URL del CTA (por defecto /contact) */
  ctaHref?: string;
  /** Label pequeño encima del título (ej. NUESTRAS SOLUCIONES DE IA) */
  label?: string;
  /** Primera parte del título (ej. Impulsamos tu negocio) */
  titlePart1?: string;
  /** Segunda parte del título en azul (ej. con soluciones inteligentes) */
  titlePart2?: string;
  /** Párrafo descriptivo debajo del título */
  description?: string;
  /** Permite que el texto de las tabs haga salto de línea (ej. para Soluciones IA) */
  tabLabelWrap?: boolean;
  /** Desactiva la selección de texto en las tabs */
  disableTabTextSelection?: boolean;
  /** Variante visual del contenedor principal */
  variant?: 'default' | 'imageHero';
  /** Imagen de fondo cuando se usa la variante imageHero */
  backgroundImageSrc?: string;
  /** Ratio intrínseco para CLS (Lighthouse); obligatorio si hay `backgroundImageSrc`. */
  backgroundImageWidth?: number;
  backgroundImageHeight?: number;
};

export function ServiceTabsSection({
  tabs,
  ctaText,
  ctaHref = '/contact',
  label,
  titlePart1,
  titlePart2,
  description,
  tabLabelWrap,
  disableTabTextSelection,
  variant = 'default',
  backgroundImageSrc,
  backgroundImageWidth,
  backgroundImageHeight,
}: ServiceTabsSectionProps) {
  const { path } = useLocale();
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? '');

  const hasHeader = Boolean(label || titlePart1 || titlePart2 || description);

  return (
    <section className="overflow-x-hidden bg-white py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {hasHeader && (
            <div className="mb-10 flex flex-col gap-2 text-left">
              {label && (
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase md:text-sm">
                  {label}
                </p>
              )}
              {(titlePart1 || titlePart2) && (
                <h2 className="text-2xl leading-tight font-bold text-[#19314c] sm:text-3xl md:text-4xl lg:text-4xl">
                  {titlePart1} {titlePart2 && <span className="text-primary">{titlePart2}</span>}
                </h2>
              )}
              {description && (
                <p className="text-muted-foreground mt-2 max-w-3xl text-base leading-relaxed md:text-lg">
                  {description}
                </p>
              )}
            </div>
          )}

          <TabsList
            variant="line"
            className={cn(
              tabLabelWrap
                ? 'mb-6 flex w-full flex-nowrap justify-start gap-1 overflow-x-auto overflow-y-hidden bg-transparent pb-0 [scrollbar-width:none] md:flex-wrap md:items-stretch md:gap-3 md:overflow-visible [&::-webkit-scrollbar]:hidden'
                : 'mb-6 flex w-full justify-start gap-1 overflow-x-auto overflow-y-hidden bg-transparent pb-0',
              // Sin borde en el contenedor ni línea del pseudo-elemento; solo el borde azul del trigger activo.
              '[&_[data-slot=tabs-trigger]:after:h-0] [&_[data-slot=tabs-trigger]:after:bg-transparent]',
            )}
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={
                  tabLabelWrap
                    ? cn(
                        'data-[state=active]:border-b-primary data-[state=active]:text-primary shrink-0 rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent bg-transparent px-3 py-2 text-center text-sm font-medium whitespace-nowrap data-[state=active]:bg-transparent data-[state=active]:shadow-none md:flex md:h-auto md:flex-1 md:items-center md:justify-center md:px-4 md:py-3 md:text-base md:leading-snug md:whitespace-normal',
                        disableTabTextSelection && 'select-none',
                      )
                    : cn(
                        'data-[state=active]:border-b-primary data-[state=active]:text-primary shrink-0 rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent bg-transparent px-3 py-2 text-sm font-medium md:px-4 md:text-base',
                        disableTabTextSelection && 'select-none',
                      )
                }
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
            {variant === 'imageHero' ? (
              <div className="relative mx-auto overflow-visible rounded-2xl px-6 py-10 md:px-10 md:py-12 lg:max-w-7xl lg:px-12 lg:py-10">
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
                  {backgroundImageSrc && (
                    <img
                      src={backgroundImageSrc}
                      alt=""
                      width={backgroundImageWidth}
                      height={backgroundImageHeight}
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      className="h-full w-full object-cover object-center"
                      aria-hidden
                    />
                  )}
                  <div className="absolute inset-0 w-full bg-black/60 lg:inset-y-0 lg:left-0 lg:w-full lg:bg-transparent lg:bg-linear-to-r lg:from-black/90 lg:via-black/55 lg:to-transparent" />
                </div>

                <div className="relative z-10 flex min-h-[300px] flex-col gap-8 lg:min-h-[380px] lg:flex-row lg:items-center lg:gap-12">
                  <div className="order-2 flex flex-1 flex-col justify-center lg:order-1 lg:max-w-[55%]">
                    <div className="flex flex-col text-white">
                      <h3 className="text-2xl font-bold md:text-3xl lg:text-4xl">
                        {tabs.find((t) => t.id === activeTab)?.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-white/90 md:text-lg">
                        {tabs.find((t) => t.id === activeTab)?.description}
                      </p>
                      <Link
                        href={path(ctaHref)}
                        className="mt-6 inline-block"
                        aria-label={ctaText}
                      >
                        <Button
                          size="lg"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-5 text-sm font-bold md:text-base"
                        >
                          {ctaText}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="order-1 hidden flex-1 lg:order-2 lg:block" aria-hidden="true" />
                </div>
              </div>
            ) : (
              <div className="relative mx-auto overflow-visible rounded-2xl bg-[#19314c] px-6 py-8 md:px-8 md:py-10 lg:max-w-6xl lg:px-10 lg:py-8">
                <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
                  <img
                    src="/backgrounds/bg-card.webp"
                    alt=""
                    className="h-full w-full object-cover object-center opacity-60"
                    aria-hidden
                  />
                </div>

                <div className="relative z-1 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-8">
                  <div className="order-1 flex flex-1 flex-col justify-center lg:max-w-[48%]">
                    <div className="flex flex-col">
                      <h3 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                        {tabs.find((t) => t.id === activeTab)?.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-white/90 md:text-lg">
                        {tabs.find((t) => t.id === activeTab)?.description}
                      </p>
                      <Link
                        href={path(ctaHref)}
                        className="mt-6 inline-block"
                        aria-label={ctaText}
                      >
                        <Button
                          size="lg"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-5 text-sm font-bold md:text-base"
                        >
                          {ctaText}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="order-2 flex flex-1 justify-center lg:max-w-[52%] lg:items-end lg:justify-center">
                    <div className="flex justify-center lg:translate-y-[20%]">
                      <PhoneMockup className="w-[min(200px,65vw)] lg:w-[240px]" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CenterContainer>
    </section>
  );
}
