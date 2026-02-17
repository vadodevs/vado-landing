import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { ProjectStack, type ProjectStackItem } from '@/components/layout/nuestro-trabajo/ProjectStack';
import { useLocale } from '@/hooks/useLocale';

const DIGITAL_RANCH_ACCENT = '#00681c';

const DIGITAL_RANCH_STACK: ProjectStackItem[] = [
  { name: 'Capacitor', icon: 'capacitor' },
  { name: 'Vue', icon: 'vue' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Swift', icon: 'swift' },
  { name: 'Android Studio', icon: 'android' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'Figma', icon: 'figma' },
];

function DigitalRanchSection({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <CenterContainer className="lg:px-0">
        <div className="flex w-full flex-col gap-10 lg:gap-16 lg:items-center">
          <div className="flex-1 space-y-4">
            <span
              className="text-sm font-semibold tracking-wider uppercase"
              style={{ color: DIGITAL_RANCH_ACCENT }}
            >
              {label}
            </span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl lg:text-[1.75rem]">
              {title}
            </h2>
            <div className="text-muted-foreground space-y-4 text-base leading-relaxed md:text-lg">
              {children}
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}

export function DigitalRanchCasePage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const title = t('ourWork.projects.digitalRanch.title');

  return (
    <article className="bg-background">
      <ProjectHero
        backHref={path('/nuestro-trabajo')}
        backLabel={t('nav.ourWork')}
        logoAlt={title}
        title={title}
        description={t('ourWork.projects.digitalRanch.description')}
        heroImageSrc="/projects/zenQR/zenqr_hero.png"
        heroImageAlt={title}
        backgroundColor={DIGITAL_RANCH_ACCENT}
      />

      <ProjectStack
        items={DIGITAL_RANCH_STACK}
        variant="logos-row"
        accentColor={DIGITAL_RANCH_ACCENT}
        label="Stack"
      />

      <DigitalRanchSection label="Caso de uso" title="El reto">
        <p>
          El cliente {title} buscaba una aplicación móvil que conectara la operación en campo con el
          registro digital, simplificando la gestión y el seguimiento.
        </p>
      </DigitalRanchSection>
    </article>
  );
}

