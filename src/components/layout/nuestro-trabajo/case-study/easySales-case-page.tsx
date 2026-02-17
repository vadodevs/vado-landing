import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { ProjectStack, type ProjectStackItem } from '@/components/layout/nuestro-trabajo/ProjectStack';
import { useLocale } from '@/hooks/useLocale';

const EASY_SALES_ACCENT = '#fd7113';

const EASY_SALES_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Stripe', icon: 'stripe' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'Google Cloud', icon: 'google-cloude' },
  { name: 'Figma', icon: 'figma' },
  { name: 'Digital Ocean', icon: 'digital-ocean' },
];

function EasySalesSection({
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
              style={{ color: EASY_SALES_ACCENT }}
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

export function EasySalesCasePage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const title = t('ourWork.projects.easySales.title');

  return (
    <article className="bg-background">
      <ProjectHero
        backHref={path('/nuestro-trabajo')}
        backLabel={t('nav.ourWork')}
        logoAlt={title}
        title={title}
        description={t('ourWork.projects.easySales.description')}
        heroImageSrc="/projects/zenQR/zenqr_hero.png"
        heroImageAlt={title}
        backgroundColor={EASY_SALES_ACCENT}
      />

      <ProjectStack
        items={EASY_SALES_STACK}
        variant="logos-row"
        accentColor={EASY_SALES_ACCENT}
        label="Stack"
      />

      <EasySalesSection label="Caso de uso" title="El reto">
        <p>
          El cliente {title} necesitaba una solución de e-commerce que conectara inventario, pagos y
          operación diaria en un solo flujo digital.
        </p>
      </EasySalesSection>
    </article>
  );
}

