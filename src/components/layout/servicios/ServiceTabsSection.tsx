import { useState } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion } from 'motion/react';
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
  /** URL del CTA (por defecto /contacto) */
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
  /** Oculta la barra indicadora bajo la tab activa */
  hideTabIndicator?: boolean;
};

export function ServiceTabsSection({
  tabs,
  ctaText,
  ctaHref = '/contacto',
  label,
  titlePart1,
  titlePart2,
  description,
  tabLabelWrap,
  hideTabIndicator,
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
                  {titlePart1}{' '}
                  {titlePart2 && (
                    <span className="text-primary">{titlePart2}</span>
                  )}
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
                ? 'border-border mb-6 flex w-full flex-nowrap justify-start gap-1 overflow-x-auto overflow-y-hidden border-b bg-transparent pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:items-stretch md:gap-3 md:overflow-visible'
                : 'border-border mb-6 flex w-full justify-start gap-1 overflow-x-auto overflow-y-hidden border-b bg-transparent pb-0 md:flex-wrap',
              hideTabIndicator &&
                '[&_[data-slot=tabs-trigger][data-state=active]:after:!opacity-0 [&_[data-slot=tabs-trigger][data-state=active]:after:!h-0 [&_[data-slot=tabs-trigger][data-state=active]:border-transparent [&_[data-slot=tabs-trigger][data-state=active]:border-b-0'
            )}
            style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}
          >
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={
                  tabLabelWrap
                    ? 'data-[state=active]:border-primary data-[state=active]:text-primary shrink-0 rounded-none border-0 border-transparent bg-transparent px-3 py-2 text-center text-sm font-medium whitespace-nowrap data-[state=active]:bg-transparent data-[state=active]:shadow-none md:h-auto md:flex md:flex-1 md:items-center md:justify-center md:whitespace-normal md:px-4 md:py-3 md:text-base md:leading-snug'
                    : 'data-[state=active]:border-primary data-[state=active]:text-primary shrink-0 rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium md:px-4 md:text-base'
                }
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 focus-visible:outline-none">
            <div className="relative mx-auto overflow-visible rounded-2xl bg-[#19314c] px-6 py-8 md:px-8 md:py-10 lg:max-w-6xl lg:px-10 lg:py-8">
              <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <img
                  src="/backgrounds/bg-card.svg"
                  alt=""
                  className="h-full w-full object-cover object-center opacity-60"
                  aria-hidden
                />
              </div>

              <div className="relative z-1 flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-8">
                <div className="order-1 flex flex-1 flex-col justify-center lg:max-w-[48%]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="flex flex-col"
                    >
                      <h3 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                        {tabs.find((t) => t.id === activeTab)?.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-white/90 md:text-lg">
                        {tabs.find((t) => t.id === activeTab)?.description}
                      </p>
                      <Link href={path(ctaHref)} className="mt-6 inline-block">
                        <Button
                          size="lg"
                          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-5 text-sm font-bold md:text-base"
                        >
                          {ctaText}
                        </Button>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="order-2 flex flex-1 justify-center lg:max-w-[52%] lg:items-end lg:justify-center">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.25, 0.46, 0.45, 0.94],
                      }}
                      className="flex justify-center lg:translate-y-[20%]"
                    >
                      <PhoneMockup className="w-[min(200px,65vw)] lg:w-[240px]" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CenterContainer>
    </section>
  );
}
