import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import { ProjectStack, type ProjectStackItem } from '@/components/layout/nuestro-trabajo/ProjectStack';

const EBM_ACCENT = '#1e446f';

const EBM_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'Capacitor', icon: 'capacitor' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'Android Studio', icon: 'android' },
  { name: 'Swift', icon: 'swift' },
];

function EbmSection({
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
              style={{ color: EBM_ACCENT }}
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

export function EbmCasePage() {
  const { t } = useTranslation();
  const title = t('ourWork.projects.ebm.title');

  return (
    <article className="bg-background">
      <ProjectHero
        logoAlt={title}
        title={title}
        description={t('ourWork.projects.ebm.description')}
        heroImageSrc="/projects/zenQR/zenqr_hero.png"
        heroImageAlt={title}
        backgroundColor={EBM_ACCENT}
      />

      <ProjectStack items={EBM_STACK} variant="logos-row" accentColor={EBM_ACCENT} label="Stack" />

      <EbmSection label="Caso de uso" title="El reto">
        <p>
          El cliente {title} llegó a Vado con un reto claro: modernizar y digitalizar su operación
          náutica con una plataforma que centralizara la gestión.
        </p>
      </EbmSection>
    </article>
  );
}

