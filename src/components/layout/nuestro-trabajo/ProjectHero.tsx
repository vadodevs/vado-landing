import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { AppStoreButtons } from '@/components/ui/AppStoreButtons';

const DIAGONAL_CLIP = 'polygon(0 0, 100% 0, 100% 82%, 0 100%)';
const EASING: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 0.08 * i, ease: EASING },
  }),
};

export type ProjectHeroCta = {
  href: string;
  label: string;
  ariaLabel?: string;
  icon?: React.ReactNode;
};

export type ProjectHeroStoreLinks = {
  appStoreUrl?: string;
  playStoreUrl?: string;
};

export type ProjectHeroProps = {
  /** Enlace y texto del breadcrumb (ej: "← Nuestro trabajo"). Omitir para no mostrar. */
  backHref?: string;
  backLabel?: React.ReactNode;
  /** Logo del proyecto como imagen (se muestra en blanco con invert). Omitir si usas logoNode. */
  logoSrc?: string;
  logoAlt: string;
  /** Logo del proyecto como componente (ej: <SenderoLogo color="white" />). Omitir si usas logoSrc. */
  logoNode?: React.ReactNode;
  title: string;
  description: string;
  /** Detalle opcional del tipo de industria (ej. "Restaurantes, retail y eventos") */
  industry?: string;
  /** Detalle opcional del tipo de solución (ej. "Plataforma SaaS") */
  solutionType?: string;
  /** CTA opcional (ej: "Visitar sitio web") */
  cta?: ProjectHeroCta;
  /** Links a App Store y/o Google Play (opcional) */
  storeLinks?: ProjectHeroStoreLinks;
  /** Imagen principal del hero (lado derecho, no se corta con el diagonal) */
  heroImageSrc: string;
  heroImageAlt: string;
  /** Color principal del proyecto para fondo y acentos (ej: #10b981) */
  backgroundColor: string;
};

export function ProjectHero({
  backHref,
  backLabel,
  logoSrc,
  logoAlt,
  logoNode,
  title,
  description,
  industry,
  solutionType,
  cta,
  storeLinks,
  heroImageSrc,
  heroImageAlt,
  backgroundColor,
}: ProjectHeroProps) {
  const { t } = useTranslation();
  return (
    <motion.header
      className="relative overflow-visible py-10 md:py-12 lg:py-14"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Fondo con corte diagonal (solo estos layers se cortan) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor,
          clipPath: DIAGONAL_CLIP,
        }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${backgroundColor}26, transparent)`,
          clipPath: DIAGONAL_CLIP,
        }}
      />
      <div
        className="absolute right-0 bottom-0 left-0 z-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent"
        style={{ clipPath: DIAGONAL_CLIP }}
      />
      <CenterContainer className="relative z-10">
        {backHref != null && backLabel != null && (
          <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
            <Link
              href={backHref}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              <span aria-hidden>←</span> {backLabel}
            </Link>
          </motion.div>
        )}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          {/* Texto a la izquierda */}
          <div className="flex-1 space-y-4 text-left">
            <motion.div
              className="flex h-16 w-auto max-w-[180px] items-center md:h-20 md:max-w-[200px]"
              aria-hidden={!!logoNode}
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {logoNode ? (
                <div className="h-full w-full [&_svg]:h-full [&_svg]:w-full [&_svg]:object-contain [&_svg]:object-left">
                  {logoNode}
                </div>
              ) : logoSrc ? (
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="h-full w-full object-contain object-left brightness-0 invert"
                />
              ) : null}
            </motion.div>
            <motion.div
              className="space-y-3"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
                {title}
              </h1>
              <p className="max-w-xl text-base text-white/90 md:text-lg">{description}</p>
              {(industry || solutionType) && (
                <div className="mt-2 flex flex-wrap gap-2 text-sm text-white/90">
                  {industry && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-white/95">
                      <span className="font-semibold">{t('ourWork.heroBadge.industry')}:</span>{' '}
                      {industry}
                    </span>
                  )}
                  {solutionType && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/10 px-3 py-1 text-white/95">
                      <span className="font-semibold">{t('ourWork.heroBadge.solutionType')}:</span>{' '}
                      {solutionType}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
            <motion.div
              className="flex flex-wrap items-center gap-4"
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {cta && (
                <a
                  href={cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/50 bg-transparent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/70 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:outline-none"
                  style={
                    {
                      ['--tw-ring-offset-color' as string]: backgroundColor,
                    } as React.CSSProperties
                  }
                  aria-label={cta.ariaLabel ?? cta.label}
                >
                  {cta.icon}
                  {cta.label}
                </a>
              )}
              {storeLinks && (storeLinks.appStoreUrl || storeLinks.playStoreUrl) && (
                <AppStoreButtons
                  appStoreUrl={storeLinks.appStoreUrl}
                  playStoreUrl={storeLinks.playStoreUrl}
                  variant="dark"
                />
              )}
            </motion.div>
          </div>
          {/* Imagen a la derecha (sin clip, se ve completa) */}
          <motion.div
            className="flex flex-1 justify-center lg:justify-end"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <img
              src={heroImageSrc}
              alt={heroImageAlt}
              className="h-auto max-h-[240px] w-full max-w-lg object-contain object-right md:max-h-[280px] lg:max-h-[320px]"
            />
          </motion.div>
        </div>
      </CenterContainer>
    </motion.header>
  );
}
