import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { ProjectStack, type ProjectStackItem } from '@/components/layout/nuestro-trabajo/ProjectStack';
import { useLocale } from '@/hooks/useLocale';

const WASHAPP_ACCENT = '#3390ff';

const WASHAPP_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'PostgreSQL', icon: 'postgresql' },
];

function WashappSection({
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
              style={{ color: WASHAPP_ACCENT }}
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

export function WashappCasePage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const title = t('ourWork.projects.washapp.title');

  return (
    <article className="bg-background">
      <ProjectHero
        backHref={path('/nuestro-trabajo')}
        backLabel={t('nav.ourWork')}
        logoAlt={title}
        title={title}
        description={t('ourWork.projects.washapp.description')}
        heroImageSrc="/projects/zenQR/zenqr_hero.png"
        heroImageAlt={title}
        backgroundColor={WASHAPP_ACCENT}
      />

      <ProjectStack
        items={WASHAPP_STACK}
        variant="logos-row"
        accentColor={WASHAPP_ACCENT}
        label="Stack"
      />

      <WashappSection label="Caso de uso" title="El reto">
        <p>
          {title} es una app móvil de lavado de autos a domicilio que requería una experiencia
          sencilla para usuarios y operadores en campo.
        </p>
      </WashappSection>
    </article>
  );
}

