/** Tavily API operations exposed in Lead Engine V2 UI. */
export type TavilyV2Operation = "crawl" | "extract" | "research" | "search" | "map";

export type TavilyExtractDepth = "basic" | "advanced";

export type TavilyResearchModel = "mini" | "pro" | "auto";

/** What to pull from each Hunter domain (maps to prompts / output_schema). */
export type TavilyV2ExtractionGoal =
  | "company_summary"
  | "decision_makers"
  | "contacts_roles"
  | "phones_domain"
  | "emails_public"
  | "services_offering"
  | "hq_location"
  | "linkedin_company";

export type TavilyV2Config = {
  operation: TavilyV2Operation;
  goals: TavilyV2ExtractionGoal[];
  /** Natural-language focus (crawl instructions, extract query, research input). */
  instructions: string;
  extractDepth: TavilyExtractDepth;
  crawlMaxPages: number;
  extractChunksPerSource: number;
  researchModel: TavilyResearchModel;
  /** POST /search — optional extra web context per company. */
  includeWebSearch: boolean;
  /** Research/Search across LinkedIn, directories, news — not only the company site. */
  includeExternalSources: boolean;
};

export const TAVILY_V2_DEFAULT_CONFIG: TavilyV2Config = {
  operation: "crawl",
  goals: ["company_summary", "decision_makers", "contacts_roles", "phones_domain"],
  instructions:
    "Priorizá páginas sobre nosotros, servicios, equipo, liderazgo y contacto. Extraé decisores y datos de contacto públicos.",
  extractDepth: "basic",
  crawlMaxPages: 12,
  extractChunksPerSource: 3,
  researchModel: "mini",
  includeWebSearch: false,
  includeExternalSources: true,
};

export const TAVILY_V2_OPERATIONS: Array<{
  id: TavilyV2Operation;
  label: string;
  api: string;
  description: string;
}> = [
  {
    id: "crawl",
    label: "Crawl",
    api: "POST /crawl",
    description: "Recorre el sitio desde el dominio y devuelve markdown por página.",
  },
  {
    id: "extract",
    label: "Extract",
    api: "POST /extract",
    description: "Extrae contenido limpio de URLs concretas (homepage, contacto, equipo).",
  },
  {
    id: "research",
    label: "Research",
    api: "POST /research + GET /research/{id}",
    description: "Agente asíncrono: informe en content + sources (poll hasta completed).",
  },
  {
    id: "map",
    label: "Map",
    api: "POST /map",
    description: "Descubre URLs internas del dominio (results: lista de URLs).",
  },
  {
    id: "search",
    label: "Search",
    api: "POST /search",
    description: "Búsqueda web sobre la empresa (snippets; complemento opcional).",
  },
];

export const TAVILY_V2_EXTRACTION_GOALS: Array<{
  id: TavilyV2ExtractionGoal;
  label: string;
  hint: string;
}> = [
  {
    id: "company_summary",
    label: "Resumen de la empresa",
    hint: "Resumen breve en español para comparar con tu ICP (sector, actividad, clientes).",
  },
  {
    id: "decision_makers",
    label: "Decision makers / C-level",
    hint: "CEO, director, fundador, socio — desde sitio, LinkedIn y directorios.",
  },
  {
    id: "contacts_roles",
    label: "Contactos y cargos",
    hint: "Nombre y cargo en español; incluye LinkedIn aunque no haya email.",
  },
  {
    id: "phones_domain",
    label: "Teléfonos (solo dominio)",
    hint: "Números publicados en páginas del sitio del lead.",
  },
  {
    id: "emails_public",
    label: "Emails públicos",
    hint: "Correos visibles en web (no sustituye Hunter).",
  },
  {
    id: "services_offering",
    label: "Servicios / oferta",
    hint: "Líneas de negocio, productos, industrias atendidas.",
  },
  {
    id: "hq_location",
    label: "Sede / ubicación",
    hint: "País, estado, ciudad si consta en el sitio.",
  },
  {
    id: "linkedin_company",
    label: "LinkedIn empresa",
    hint: "URL de company page si está enlazada o citada.",
  },
];

export function goalsNeedContactDiscovery(goals: TavilyV2ExtractionGoal[] | undefined): boolean {
  if (!Array.isArray(goals)) return false;
  return goals.some(
    (g) => g === "decision_makers" || g === "contacts_roles" || g === "linkedin_company"
  );
}

/** Contact / LinkedIn goals need web-wide search even if the UI toggle is off. */
export function effectiveIncludeExternalSources(config: TavilyV2Config): boolean {
  return config.includeExternalSources || goalsNeedContactDiscovery(config.goals);
}

export function buildTavilyInstructionsFromGoals(
  goals: TavilyV2ExtractionGoal[],
  extra?: string
): string {
  const labels = TAVILY_V2_EXTRACTION_GOALS.filter((g) => goals.includes(g.id)).map((g) => g.label);
  const base =
    labels.length > 0
      ? `Extraé y estructurá en español: ${labels.join("; ")}.`
      : "Extraé información relevante de la empresa desde el sitio web, en español.";
  const tail = extra?.trim();
  return tail ? `${base} ${tail}` : base;
}
