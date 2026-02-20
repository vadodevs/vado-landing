import { FaGlobe } from 'react-icons/fa';
import { SenderoLogo } from '@/assets/brands/sendero';
import { EbmLogo } from '@/assets/brands/ebm';
import { DigitalRanchLogo } from '@/assets/brands/digital-ranch';
import { EasySalesLogo } from '@/assets/brands/easy-sales';
import { CipresesLogo } from '@/assets/brands/cipreses';
import { OUR_WORK_PROJECTS } from '@/components/layout/nuestro-trabajo/ourWorkProjects';
import type {
  ProjectCaseStudyConfig,
  CaseStudySection,
} from '@/components/layout/nuestro-trabajo/ProjectCaseStudyTemplate';
import type { ProjectStackItem } from '@/components/layout/nuestro-trabajo/ProjectStack';
import type { TFunction } from 'i18next';

const ZENQR_LINKS = {
  website: 'https://www.zenqr.com',
  appStore: 'https://apps.apple.com/app/zenqr/id0000000000',
  playStore: 'https://play.google.com/store/apps/details?id=app.zenqr',
} as const;

const DEFAULT_STACK: ProjectStackItem[] = [
  { name: 'React', icon: 'react' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'Figma', icon: 'figma' },
];

const ACCENT_COLORS: Record<string, string> = {
  zenqr: '#10b981',
  sendero: '#27bfad',
  ebm: '#1e446f',
  digitalRanch: '#00681c',
  easySales: '#fd7113',
  cipreses: '#cc8b33',
  maggiore: '#205c76',
  washapp: '#3390ff',
};

/** Secciones placeholder para proyectos que aún no tienen contenido propio */
function placeholderSections(projectTitle: string): CaseStudySection[] {
  return [
    {
      label: 'Caso de uso',
      title: 'El reto',
      content: (Accent) => (
        <>
          <p>
            El cliente <Accent>{projectTitle}</Accent> llegó a Vado con un reto claro: necesitaba
            una solución digital que se adaptara a sus necesidades y las de sus usuarios.
          </p>
          <p>
            Trabajamos en estrecha colaboración para definir objetivos, alcance y una hoja de ruta
            que permitiera entregar valor de forma iterativa.
          </p>
        </>
      ),
    },
    {
      label: 'Estrategia',
      title: 'Nuestra estrategia',
      reverse: true,
      content: (Accent) => (
        <>
          <p>
            Analizamos el contexto del negocio y las oportunidades de mejora. Nuestra estrategia
            combinó <Accent>diseño centrado en el usuario</Accent> con un stack técnico adecuado
            para escalar.
          </p>
          <p>
            Definimos hitos y prioridades para ir validando cada entrega con el cliente y ajustar
            cuando fue necesario.
          </p>
        </>
      ),
    },
    {
      label: 'Solución',
      title: 'La solución',
      content: (_Accent) => (
        <>
          <p>
            Desarrollamos una solución a la medida que integra funcionalidad, usabilidad y
            mantenibilidad. El resultado refleja la visión del cliente y las mejores prácticas de la
            industria.
          </p>
          <p>
            La plataforma está preparada para crecer y evolucionar según las necesidades del
            negocio.
          </p>
        </>
      ),
    },
    {
      label: 'Impacto',
      title: 'Resultados',
      reverse: true,
      content: (Accent) => (
        <>
          <p>
            El proyecto <Accent>{projectTitle}</Accent> es hoy una solución en producción que aporta
            valor real. A lo largo del proceso priorizamos la comunicación, la calidad y la entrega
            iterativa.
          </p>
          <p>
            El cliente pudo validar cada fase y el resultado final refleja un trabajo en equipo
            alineado con sus objetivos.
          </p>
        </>
      ),
    },
  ];
}

/** Config completo para ZenQR (contenido real) */
function zenqrConfig(_t: TFunction): ProjectCaseStudyConfig {
  const accentColor = ACCENT_COLORS.zenqr ?? '#10b981';
  return {
    projectId: 'zenqr',
    accentColor,
    hero: {
      logoSrc: '/brands/zenqr.svg',
      logoAlt: 'ZenQR',
      title: 'Plataforma SaaS para gestión de códigos QR dinámicos',
      description:
        'ZenQR se construyó para convertir los códigos QR en una herramienta de negocio: personalizable, medible y administrable desde un panel. Conecta experiencias físicas (menús, empaques, carteles) con acciones digitales y analítica en tiempo real.',
      industry: 'Restaurantes, retail y eventos',
      solutionType: 'Plataforma SaaS de códigos QR dinámicos',
      cta: {
        href: ZENQR_LINKS.website,
        label: 'Visitar sitio web',
        ariaLabel: 'Visitar sitio web de ZenQR',
        icon: <FaGlobe className="size-4 shrink-0" />,
      },
      heroImageSrc: '/projects/zenQR/zenqr_hero.png',
      heroImageAlt: 'ZenQR - Dashboard y app',
      backgroundColor: accentColor,
    },
    stack: [
      { name: 'Vue', icon: 'vue' },
      { name: 'TypeScript', icon: 'typescript' },
      { name: 'Node.js', icon: 'node-js' },
      { name: 'NestJS', icon: 'nestjs' },
      { name: 'Figma', icon: 'figma' },
      { name: 'Digital Ocean', icon: 'digital-ocean' },
      { name: 'Stripe', icon: 'stripe' },
    ],
    sections: [
      {
        label: 'Overview',
        title: 'Plataforma SaaS para gestión de códigos QR dinámicos con analítica',
        content: (_Accent) => (
          <>
            <p>
              ZenQR se construyó para convertir los códigos QR en una herramienta de negocio:
              personalizable, medible y administrable desde un panel. Conecta experiencias físicas
              (menús, empaques, carteles) con acciones digitales y analítica en tiempo real.
            </p>
          </>
        ),
      },
      {
        label: 'Challenge',
        title: 'El reto',
        reverse: true,
        content: (_Accent) => (
          <>
            <p>
              El cliente quería ir mucho más allá de generar códigos básicos, buscaba:
            </p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>Personalización de códigos QR</li>
              <li>Soporte para distintos tipos de información</li>
              <li>Estadísticas de uso</li>
              <li>Integraciones con sistemas externos (pagos / boletaje)</li>
            </ul>
            <p>Todo con una experiencia visual clara, fluida y moderna.</p>
            <p>
              Además, el reto de fondo era transformar lo físico en digital medible y editable en
              tiempo real.
            </p>
          </>
        ),
      },
      {
        label: 'Solution',
        title: 'La solución',
        content: (_Accent) => (
          <>
            <p>
              El enfoque incluyó analizar a fondo herramientas existentes para detectar
              oportunidades y construir una hoja de ruta alineada a necesidades reales.
            </p>
            <p>
              Luego desarrollamos una plataforma con interfaz minimalista que permite empezar a
              crear códigos incluso sin registrarse y con navegación directa.
            </p>
            <p className="text-foreground font-medium">La plataforma incluye:</p>
            <ul className="list-inside list-disc space-y-2 pl-2">
              <li>Soporte para distintos tipos de contenido</li>
              <li>Personalización con colores, logos y plantillas</li>
              <li>Métricas en tiempo real</li>
              <li>QR estáticos y dinámicos</li>
              <li>Integración con herramientas externas para eventos y pagos</li>
            </ul>
          </>
        ),
      },
      {
        label: 'Results',
        title: 'Resultados',
        reverse: true,
        content: (_Accent) => (
          <>
            <p>
              El resultado fue una plataforma eficiente y fácil de usar, construida en colaboración
              estrecha con el cliente para validar, ajustar y entregar un producto con claridad,
              funcionalidad y diseño, listo para operar como alternativa competitiva en su mercado.
            </p>
          </>
        ),
      },
      {
        label: 'CTA',
        title: 'CTA',
        content: (_Accent) => (
          <>
            <p>
              Si estás construyendo un producto digital y necesitas que sea claro para el usuario y
              escalable para el negocio, podemos ayudarte a desarrollarlo a la medida.
            </p>
            <p>Contáctanos</p>
          </>
        ),
      },
    ],
  };
}

const SENDERO_STACK: ProjectStackItem[] = [
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Stripe', icon: 'stripe' },
  { name: 'React', icon: 'react' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'Figma', icon: 'figma' },
  { name: 'Digital Ocean', icon: 'digital-ocean' },
  { name: 'Meta', icon: 'meta' },
  { name: 'OpenAI', icon: 'openai' },
];

const EBM_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'Capacitor', icon: 'capacitor' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'Android Studio', icon: 'android' },
];

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

const CIPRESES_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'Figma', icon: 'figma' },
  { name: 'Digital Ocean', icon: 'digital-ocean' },
];

/** Config para Sendero: logo componente blanco, hero zenqr_hero, stack propio */
function senderoConfig(t: TFunction): ProjectCaseStudyConfig {
  const accentColor = ACCENT_COLORS.sendero ?? '#27bfad';
  const title = t('ourWork.projects.sendero.title');
  return {
    projectId: 'sendero',
    accentColor,
    hero: {
      logoAlt: title,
      logoNode: <SenderoLogo color="white" className="h-full w-full object-contain object-left" />,
      title,
      description: t('ourWork.projects.sendero.description'),
      heroImageSrc: '/projects/zenQR/zenqr_hero.png',
      heroImageAlt: title,
      backgroundColor: accentColor,
    },
    stack: SENDERO_STACK,
    sections: placeholderSections(title),
  };
}

/** Config para EBM: logo componente blanco, color #1e446f, stack propio. Hero: zenqr_hero por ahora. */
function ebmConfig(t: TFunction): ProjectCaseStudyConfig {
  const accentColor = ACCENT_COLORS.ebm ?? '#1e446f';
  const title = t('ourWork.projects.ebm.title');
  return {
    projectId: 'ebm',
    accentColor,
    hero: {
      logoAlt: title,
      logoNode: <EbmLogo color="white" className="h-full w-full object-contain object-left" />,
      title,
      description: t('ourWork.projects.ebm.description'),
      heroImageSrc: '/projects/zenQR/zenqr_hero.png',
      heroImageAlt: title,
      backgroundColor: accentColor,
    },
    stack: EBM_STACK,
    sections: placeholderSections(title),
  };
}

/** Config para Digital Ranch: logo componente blanco, hero zenqr_hero, color #00681c, stack propio */
function digitalRanchConfig(t: TFunction): ProjectCaseStudyConfig {
  const accentColor = ACCENT_COLORS.digitalRanch ?? '#00681c';
  const title = t('ourWork.projects.digitalRanch.title');
  return {
    projectId: 'digitalRanch',
    accentColor,
    hero: {
      logoAlt: title,
      logoNode: (
        <DigitalRanchLogo color="white" className="h-full w-full object-contain object-left" />
      ),
      title,
      description: t('ourWork.projects.digitalRanch.description'),
      heroImageSrc: '/projects/zenQR/zenqr_hero.png',
      heroImageAlt: title,
      backgroundColor: accentColor,
    },
    stack: DIGITAL_RANCH_STACK,
    sections: placeholderSections(title),
  };
}

/** Config para Easy Sales: logo easy-sales en blanco, hero zenqr_hero, color #fd7113, stack propio */
function easySalesConfig(t: TFunction): ProjectCaseStudyConfig {
  const accentColor = ACCENT_COLORS.easySales ?? '#fd7113';
  const title = t('ourWork.projects.easySales.title');
  return {
    projectId: 'easySales',
    accentColor,
    hero: {
      logoAlt: title,
      logoNode: (
        <EasySalesLogo color="white" className="h-full w-full object-contain object-left" />
      ),
      title,
      description: t('ourWork.projects.easySales.description'),
      heroImageSrc: '/projects/zenQR/zenqr_hero.png',
      heroImageAlt: title,
      backgroundColor: accentColor,
    },
    stack: EASY_SALES_STACK,
    sections: placeholderSections(title),
  };
}

/** Config para Cipreses: logo cipreses en blanco, hero zenqr_hero, color #cc8b33, stack propio */
function cipresesConfig(t: TFunction): ProjectCaseStudyConfig {
  const accentColor = ACCENT_COLORS.cipreses ?? '#cc8b33';
  const title = t('ourWork.projects.cipreses.title');
  return {
    projectId: 'cipreses',
    accentColor,
    hero: {
      logoAlt: title,
      logoNode: <CipresesLogo color="white" className="h-full w-full object-contain object-left" />,
      title,
      description: t('ourWork.projects.cipreses.description'),
      heroImageSrc: '/projects/zenQR/zenqr_hero.png',
      heroImageAlt: title,
      backgroundColor: accentColor,
    },
    stack: CIPRESES_STACK,
    sections: placeholderSections(title),
  };
}

/** Config genérico para proyectos con placeholder */
function genericProjectConfig(projectId: string, t: TFunction): ProjectCaseStudyConfig {
  const project = OUR_WORK_PROJECTS.find((p) => p.id === projectId);
  const title = project ? t(`ourWork.projects.${projectId}.title`) : projectId;
  const description = project ? t(`ourWork.projects.${projectId}.description`) : '';
  const image = project?.image ?? 'sendero.png';
  const accentColor = ACCENT_COLORS[projectId] ?? '#153559';

  return {
    projectId,
    accentColor,
    hero: {
      logoSrc: `/projects/${image}`,
      logoAlt: title,
      title,
      description,
      heroImageSrc: `/projects/${image}`,
      heroImageAlt: title,
      backgroundColor: accentColor,
    },
    stack: DEFAULT_STACK,
    sections: placeholderSections(title),
  };
}

const CASE_STUDY_SLUGS = [
  'zenqr',
  'sendero',
  'ebm',
  'digitalRanch',
  'easySales',
  'cipreses',
  'maggiore',
  'washapp',
] as const;

export const getCaseStudyConfig = (slug: string, t: TFunction): ProjectCaseStudyConfig | null => {
  if (!CASE_STUDY_SLUGS.includes(slug as (typeof CASE_STUDY_SLUGS)[number])) {
    return null;
  }
  if (slug === 'zenqr') {
    return zenqrConfig(t);
  }
  if (slug === 'sendero') {
    return senderoConfig(t);
  }
  if (slug === 'ebm') {
    return ebmConfig(t);
  }
  if (slug === 'digitalRanch') {
    return digitalRanchConfig(t);
  }
  if (slug === 'easySales') {
    return easySalesConfig(t);
  }
  if (slug === 'cipreses') {
    return cipresesConfig(t);
  }
  return genericProjectConfig(slug, t);
};

/**
 * Estructura para iniciar un nuevo caso de uso.
 * Copia este objeto y rellena con los datos del proyecto.
 * Luego regístralo en getCaseStudyConfig y en CASE_STUDY_SLUGS.
 */
export const CASE_STUDY_CONFIG_TEMPLATE = (
  projectId: string,
  t: TFunction,
): ProjectCaseStudyConfig => ({
  projectId,
  accentColor: ACCENT_COLORS[projectId] ?? '#153559',
  hero: {
    logoSrc: `/projects/${OUR_WORK_PROJECTS.find((p) => p.id === projectId)?.image ?? 'sendero.png'}`,
    logoAlt: t(`ourWork.projects.${projectId}.title`),
    title: t(`ourWork.projects.${projectId}.title`),
    description: t(`ourWork.projects.${projectId}.description`),
    heroImageSrc: `/projects/${OUR_WORK_PROJECTS.find((p) => p.id === projectId)?.image ?? 'sendero.png'}`,
    heroImageAlt: t(`ourWork.projects.${projectId}.title`),
    backgroundColor: ACCENT_COLORS[projectId] ?? '#153559',
  },
  stack: DEFAULT_STACK,
  sections: [
    {
      label: 'Caso de uso',
      title: 'El reto',
      content: (Accent) => (
        <>
          <p>
            <Accent>Escribe aquí</Accent> el contexto y el reto del cliente.
          </p>
          <p>Segundo párrafo opcional.</p>
        </>
      ),
    },
    {
      label: 'Estrategia',
      title: 'Nuestra estrategia',
      reverse: true,
      content: (_Accent) => (
        <>
          <p>Describe la estrategia y el enfoque.</p>
        </>
      ),
    },
    {
      label: 'Solución',
      title: 'La solución',
      content: (_Accent) => (
        <>
          <p>Qué se construyó y cómo.</p>
        </>
      ),
    },
    {
      label: 'Impacto',
      title: 'Resultados',
      reverse: true,
      content: (_Accent) => (
        <>
          <p>Resultados e impacto del proyecto.</p>
        </>
      ),
    },
  ],
});
