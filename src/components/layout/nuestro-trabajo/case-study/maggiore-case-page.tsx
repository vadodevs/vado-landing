import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { ProjectStack, type ProjectStackItem } from '@/components/layout/nuestro-trabajo/ProjectStack';

const MAGGIORE_ACCENT = '#3390ff';

const MAGGIORE_STACK: ProjectStackItem[] = [
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'React', icon: 'react' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'PostgreSQL', icon: 'postgresql' },
];

function MaggioreSection({
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
              style={{ color: MAGGIORE_ACCENT }}
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

export function MaggioreCasePage() {
  const { t } = useTranslation();
  const title = t('ourWork.projects.maggiore.title');

  return (
    <article className="bg-background">
      <ProjectHero
        logoAlt={title}
        title={title}
        description={t('ourWork.projects.maggiore.description')}
        heroImageSrc="/projects/zenQR/zenqr_hero.png"
        heroImageAlt={title}
        backgroundColor={MAGGIORE_ACCENT}
      />

      <ProjectStack
        items={MAGGIORE_STACK}
        variant="logos-row"
        accentColor={MAGGIORE_ACCENT}
        label="Stack"
      />

      <MaggioreSection label="Caso de uso" title="El reto">
        <p>
          {title} es un sistema de tokens y gestión digital que requería una interfaz clara y una
          arquitectura robusta para administrar transacciones.
        </p>
      </MaggioreSection>
    </article>
  );
}

