import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { FaGlobe } from 'react-icons/fa';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { ProjectHero } from '@/components/layout/nuestro-trabajo/ProjectHero';
import {
  ProjectStack,
  type ProjectStackItem,
} from '@/components/layout/nuestro-trabajo/ProjectStack';
import {
  OUR_WORK_PROJECTS,
  BADGE_COLORS,
  type CategoryKey,
} from '@/components/layout/nuestro-trabajo/ourWorkProjects';
import { useLocale } from '@/hooks/useLocale';

const ZENQR_ACCENT = '#10b981';

const ZENQR_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'Figma', icon: 'figma' },
  { name: 'Digital Ocean', icon: 'digital-ocean' },
  { name: 'Stripe', icon: 'stripe' },
];

function ZenqrCaseSection({
  label,
  title,
  children,
  reverse,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <section className="py-12 md:py-16 lg:py-20">
      <CenterContainer className="lg:px-0">
        <div
          className={`flex w-full flex-col gap-10 lg:items-center lg:gap-16 ${
            reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'
          }`}
        >
          <div className="flex-1 space-y-4">
            <span
              className="text-sm font-semibold tracking-wider uppercase"
              style={{ color: ZENQR_ACCENT }}
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

function ZenqrOtherCases() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const otherProjects = OUR_WORK_PROJECTS.filter((p) => p.id !== 'zenqr');

  return (
    <section className="border-border bg-muted/30 border-t py-16 md:py-24">
      <CenterContainer>
        <div className="space-y-12 md:space-y-16">
          <header className="max-w-2xl">
            <span
              className="mb-2 block text-xs font-semibold tracking-[0.2em] uppercase"
              style={{ color: ZENQR_ACCENT }}
            >
              Más trabajo
            </span>
            <h2 className="text-foreground text-2xl font-bold tracking-tight md:text-3xl">
              Otros casos de uso
            </h2>
            <p className="text-muted-foreground mt-3 text-base leading-relaxed">
              Conoce otros proyectos que hemos desarrollado junto a nuestros clientes.
            </p>
          </header>

          <motion.ul
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              visible: {
                transition: { staggerChildren: 0.08, delayChildren: 0.1 },
              },
              hidden: {},
            }}
          >
            {otherProjects.map((project) => (
              <motion.li
                key={project.id}
                variants={{
                  visible: { opacity: 1, y: 0 },
                  hidden: { opacity: 0, y: 16 },
                }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <Link
                  href={path(`/nuestro-trabajo/${project.id}`)}
                  className="focus-visible:ring-primary group focus-visible:ring-offset-background block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  <motion.article
                    className="bg-background ring-border/50 overflow-hidden rounded-2xl shadow-sm ring-1"
                    whileHover={{
                      y: -4,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ type: 'tween', duration: 0.2 }}
                  >
                    <div className="bg-muted/40 relative aspect-4/3 overflow-hidden">
                      <motion.img
                        src={`/projects/${project.image}`}
                        alt=""
                        className="size-full object-contain object-center p-6"
                        loading="lazy"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.25 }}
                      />
                      <span
                        className={`absolute top-3 right-3 rounded-md px-2.5 py-1 text-xs font-medium tracking-wide text-white shadow-sm ${
                          project.badgeColor ? '' : BADGE_COLORS[project.categoryKey as CategoryKey]
                        }`}
                        style={
                          project.badgeColor ? { backgroundColor: project.badgeColor } : undefined
                        }
                      >
                        {t(`ourWork.projects.${project.id}.category`)}
                      </span>
                    </div>
                    <div className="border-border flex flex-col gap-0.5 border-x-0 border-t border-b-0 px-5 py-4">
                      <h3 className="text-foreground font-bold tracking-tight group-hover:underline">
                        {t(`ourWork.projects.${project.id}.title`)}
                        {t(`ourWork.projects.${project.id}.subtitle`) && (
                          <>
                            <span className="text-muted-foreground font-normal"> · </span>
                            <span className="text-foreground/90">
                              {t(`ourWork.projects.${project.id}.subtitle`)}
                            </span>
                          </>
                        )}
                      </h3>
                      <p className="text-muted-foreground mt-0.5 line-clamp-2 text-sm">
                        {t(`ourWork.projects.${project.id}.description`)}
                      </p>
                    </div>
                  </motion.article>
                </Link>
              </motion.li>
            ))}
          </motion.ul>

          <div className="flex justify-center pt-4">
            <Link
              href={path('/nuestro-trabajo')}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
            >
              <span aria-hidden>←</span> Volver a Nuestro trabajo
            </Link>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}

export function ZenqurCasePage() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <article className="bg-background">
      <ProjectHero
        backHref={path('/nuestro-trabajo')}
        backLabel={t('nav.ourWork')}
        logoSrc="/brands/zenqr.svg"
        logoAlt="ZenQR"
        title="Una nueva forma de crear códigos QR"
        description="Plataforma de códigos QR con personalización, métricas en tiempo real e integraciones para eventos y pagos."
        cta={{
          href: 'https://zenqr.app',
          label: 'Visitar sitio web',
          ariaLabel: 'Visitar sitio web de ZenQR',
          icon: <FaGlobe className="size-4 shrink-0" />,
        }}
        heroImageSrc="/projects/zenQR/zenqr_hero.png"
        heroImageAlt="ZenQR - Dashboard y app"
        backgroundColor={ZENQR_ACCENT}
      />

      <ProjectStack
        items={ZENQR_STACK}
        variant="logos-row"
        accentColor={ZENQR_ACCENT}
        label="Stack"
      />

      <ZenqrCaseSection
        label="Overview"
        title="Plataforma SaaS para gestión de códigos QR dinámicos con analítica"
      >
        <p>
          ZenQR se construyó para convertir los códigos QR en una herramienta de negocio:
          personalizable, medible y administrable desde un panel. Conecta experiencias físicas
          (menús, empaques, carteles) con acciones digitales y analítica en tiempo real.
        </p>
      </ZenqrCaseSection>

      <ZenqrCaseSection label="Challenge" title="El reto" reverse>
        <p>El cliente quería ir mucho más allá de generar códigos básicos, buscaba:</p>
        <ul className="list-inside list-disc space-y-2 pl-2">
          <li>Personalización de códigos QR</li>
          <li>Soporte para distintos tipos de información</li>
          <li>Estadísticas de uso</li>
          <li>Integraciones con sistemas externos (pagos / boletaje)</li>
        </ul>
        <p>Todo con una experiencia visual clara, fluida y moderna.</p>
        <p>
          Además, el reto de fondo era transformar lo físico en digital medible y editable en tiempo
          real.
        </p>
      </ZenqrCaseSection>

      <ZenqrCaseSection label="Solution" title="La solución">
        <p>
          El enfoque incluyó analizar a fondo herramientas existentes para detectar oportunidades y
          construir una hoja de ruta alineada a necesidades reales.
        </p>
        <p>
          Luego desarrollamos una plataforma con interfaz minimalista que permite empezar a crear
          códigos incluso sin registrarse y con navegación directa.
        </p>
        <p className="text-foreground font-medium">La plataforma incluye:</p>
        <ul className="list-inside list-disc space-y-2 pl-2">
          <li>Soporte para distintos tipos de contenido</li>
          <li>Personalización con colores, logos y plantillas</li>
          <li>Métricas en tiempo real</li>
          <li>QR estáticos y dinámicos</li>
          <li>Integración con herramientas externas para eventos y pagos</li>
        </ul>
      </ZenqrCaseSection>

      <ZenqrCaseSection label="Results" title="Resultados" reverse>
        <p>
          El resultado fue una plataforma eficiente y fácil de usar, construida en colaboración
          estrecha con el cliente para validar, ajustar y entregar un producto con claridad,
          funcionalidad y diseño, lista para operar como alternativa competitiva en su mercado.
        </p>
      </ZenqrCaseSection>

      <ZenqrOtherCases />
    </article>
  );
}
