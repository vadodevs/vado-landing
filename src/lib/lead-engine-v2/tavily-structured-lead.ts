import {
  goalsNeedContactDiscovery,
  type TavilyV2ExtractionGoal,
} from "@/lib/lead-engine-v2/tavily-v2-options";

export type TavilyStructuredContact = {
  name?: string;
  email?: string;
  title?: string;
  phone?: string;
  linkedinUrl?: string;
  seniority?: string;
};

/** CRM-shaped fields extracted via Tavily Research output_schema. */
export type TavilyLeadStructuredData = {
  companySummary?: string;
  specialty?: string;
  servicesOffering?: string;
  region?: string;
  city?: string;
  country?: string;
  phones: string[];
  emails: string[];
  linkedinCompanyUrl?: string;
  contacts: TavilyStructuredContact[];
  commercialNotes?: string;
};

const SPANISH_OUTPUT_RULES =
  "Todo el texto descriptivo en español (traducir si la fuente está en otro idioma). " +
  "Hechos verificables únicamente; dejar vacío si no hay evidencia. Sin hipótesis, ángulos comerciales, " +
  "«próximos pasos», bullets ni markdown.";

const SCHEMA_PROPERTIES: Record<
  string,
  { type: string; description: string; items?: Record<string, unknown> }
> = {
  company_summary: {
    type: "string",
    description:
      "Resumen factual breve en español (2–4 oraciones, ~450 caracteres máx.): sector, actividad principal, " +
      "clientes objetivo y ubicación si aplica. Pensado para comparar encaje con un perfil de cliente ideal (ICP). " +
      SPANISH_OUTPUT_RULES,
  },
  specialty: {
    type: "string",
    description:
      "Etiqueta corta en español del tipo de negocio (campo CRM «Especialidad»). Ej: «Distribuidor industrial B2B».",
  },
  services_offering: {
    type: "string",
    description: "Principales servicios, productos o líneas de negocio, en español y forma concisa.",
  },
  region: {
    type: "string",
    description: "Estado o provincia de la sede (ej. Nuevo León), en español.",
  },
  city: {
    type: "string",
    description: "Ciudad de la sede principal.",
  },
  country: {
    type: "string",
    description: "País de la sede (nombre común en español, ej. México, Estados Unidos).",
  },
  phones: {
    type: "array",
    description: "Teléfonos públicos publicados en el sitio web de la empresa.",
    items: { type: "string" },
  },
  emails: {
    type: "array",
    description: "Correos públicos publicados en el sitio web de la empresa.",
    items: { type: "string" },
  },
  linkedin_company_url: {
    type: "string",
    description: "URL de la página de empresa en LinkedIn si está enlazada o citada.",
  },
  contacts: {
    type: "array",
    description:
      "Personas clave con nombre y cargo en español. Incluir decisores aunque no tengan email público.",
    items: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre completo" },
        email: { type: "string", description: "Email laboral si es público" },
        title: { type: "string", description: "Cargo o rol en español (ej. Director general, CEO)" },
        phone: { type: "string", description: "Teléfono directo si figura" },
        linkedin_url: { type: "string", description: "URL de LinkedIn personal si figura" },
        seniority: { type: "string", description: "ej. ejecutivo, senior, gerente" },
      },
    },
  },
};

function contactsSchemaDescription(includeExternalSources: boolean): string {
  if (includeExternalSources) {
    return (
      "Decisores y contactos desde sitio web, LinkedIn (perfiles públicos y página de empresa), " +
      "directorios (Apollo, ZoomInfo snippets, registros), prensa y Google/Bing. " +
      "Nombre y cargo en español son obligatorios si identificás a la persona. " +
      "Incluir email/teléfono/LinkedIn cuando existan; incluir la persona aunque solo tengas nombre+cargo+LinkedIn."
    );
  }
  return "Personas del sitio web con nombre, cargo en español, email o teléfono cuando existan.";
}

function phonesSchemaDescription(includeExternalSources: boolean): string {
  return includeExternalSources
    ? "Teléfonos públicos de la empresa (sitio, LinkedIn, directorios, prensa)."
    : "Teléfonos públicos publicados en el sitio web de la empresa.";
}

function emailsSchemaDescription(includeExternalSources: boolean): string {
  return includeExternalSources
    ? "Emails públicos de la empresa (sitio, LinkedIn, directorios)."
    : "Correos públicos publicados en el sitio web de la empresa.";
}

function buildSchemaProperties(includeExternalSources: boolean): typeof SCHEMA_PROPERTIES {
  return {
    ...SCHEMA_PROPERTIES,
    phones: { ...SCHEMA_PROPERTIES.phones, description: phonesSchemaDescription(includeExternalSources) },
    emails: { ...SCHEMA_PROPERTIES.emails, description: emailsSchemaDescription(includeExternalSources) },
    contacts: { ...SCHEMA_PROPERTIES.contacts, description: contactsSchemaDescription(includeExternalSources) },
  };
}

const GOAL_TO_SCHEMA_PROP: Record<TavilyV2ExtractionGoal, string[]> = {
  company_summary: ["company_summary"],
  decision_makers: ["contacts"],
  contacts_roles: ["contacts"],
  phones_domain: ["phones"],
  emails_public: ["emails", "contacts"],
  services_offering: ["services_offering", "specialty"],
  hq_location: ["region", "city", "country"],
  linkedin_company: ["linkedin_company_url"],
};

export function buildTavilyResearchOutputSchema(
  goals: TavilyV2ExtractionGoal[],
  includeExternalSources = false
): Record<string, unknown> {
  const propNames = new Set<string>(["company_summary", "specialty"]);
  for (const goal of goals) {
    for (const p of GOAL_TO_SCHEMA_PROP[goal] ?? []) {
      propNames.add(p);
    }
  }

  const schemaProps = buildSchemaProperties(includeExternalSources);
  const properties: Record<string, unknown> = {};
  for (const name of propNames) {
    const def = schemaProps[name as keyof typeof schemaProps];
    if (def) properties[name] = def;
  }

  const required = ["company_summary", "specialty"];
  if (goalsNeedContactDiscovery(goals)) {
    required.push("contacts");
  }

  return { properties, required };
}

function asString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return [...new Set(v.map((x) => (typeof x === "string" ? x.trim() : "")).filter(Boolean))];
}

function parseContacts(raw: unknown): TavilyStructuredContact[] {
  if (!Array.isArray(raw)) return [];
  const out: TavilyStructuredContact[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const contact: TavilyStructuredContact = {
      name: asString(o.name),
      email: asString(o.email)?.toLowerCase(),
      title: asString(o.title),
      phone: asString(o.phone),
      linkedinUrl: asString(o.linkedin_url ?? o.linkedinUrl),
      seniority: asString(o.seniority),
    };
    if (contact.name || contact.email || contact.title || contact.phone || contact.linkedinUrl) {
      out.push(contact);
    }
  }
  return out;
}

/** Parse Tavily Research `content` (string report or structured object). */
export function parseTavilyStructuredData(content: unknown): TavilyLeadStructuredData | null {
  if (content == null) return null;

  let obj: Record<string, unknown>;
  if (typeof content === "string") {
    const trimmed = content.trim();
    if (!trimmed.startsWith("{")) return null;
    try {
      obj = JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      return null;
    }
  } else if (typeof content === "object" && !Array.isArray(content)) {
    obj = content as Record<string, unknown>;
  } else {
    return null;
  }

  const phones = asStringArray(obj.phones);
  const emails = asStringArray(obj.emails).map((e) => e.toLowerCase());
  const contacts = parseContacts(obj.contacts);
  const companySummary = asString(obj.company_summary);
  const specialty = asString(obj.specialty);
  const servicesOffering = asString(obj.services_offering);

  if (
    !companySummary &&
    !specialty &&
    !servicesOffering &&
    phones.length === 0 &&
    emails.length === 0 &&
    contacts.length === 0
  ) {
    return null;
  }

  return {
    companySummary,
    specialty,
    servicesOffering,
    region: asString(obj.region),
    city: asString(obj.city),
    country: asString(obj.country),
    phones,
    emails,
    linkedinCompanyUrl: asString(obj.linkedin_company_url),
    contacts,
    commercialNotes: asString(obj.commercial_notes),
  };
}

/** Resumen CRM en español para vista previa / comparación con ICP (sin notas comerciales). */
export function pickLeadDescriptionFromStructured(
  structured?: TavilyLeadStructuredData | null,
  researchFallback?: string | null
): string | null {
  const summary = structured?.companySummary?.trim();
  if (summary) return summary;

  const parts = [structured?.specialty?.trim(), structured?.servicesOffering?.trim()].filter(Boolean);
  if (parts.length > 0) return parts.join(" · ");

  const fallback = researchFallback?.trim();
  if (!fallback || fallback.startsWith("#") || fallback.length > 600) return null;
  return fallback;
}

function normalizePersonName(name?: string): string | null {
  const t = name?.trim().toLowerCase();
  return t || null;
}

function structuredContactsMatch(a: TavilyStructuredContact, b: TavilyStructuredContact): boolean {
  const nameA = normalizePersonName(a.name);
  const nameB = normalizePersonName(b.name);
  if (nameA && nameB && nameA === nameB) return true;
  if (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase()) return true;
  if (a.linkedinUrl && b.linkedinUrl && a.linkedinUrl.toLowerCase() === b.linkedinUrl.toLowerCase()) {
    return true;
  }
  return false;
}

function mergeStructuredContact(
  a: TavilyStructuredContact,
  b: TavilyStructuredContact
): TavilyStructuredContact {
  return {
    name: a.name ?? b.name,
    email: a.email ?? b.email,
    title: a.title ?? b.title,
    phone: a.phone ?? b.phone,
    linkedinUrl: a.linkedinUrl ?? b.linkedinUrl,
    seniority: a.seniority ?? b.seniority,
  };
}

/** Une datos estructurados de varias pasadas Tavily (p. ej. research principal + contactos). */
export function mergeStructuredLeadData(
  base: TavilyLeadStructuredData | null | undefined,
  extra: TavilyLeadStructuredData | null | undefined
): TavilyLeadStructuredData | null {
  if (!base && !extra) return null;
  if (!base) return extra ?? null;
  if (!extra) return base;

  const mergedContacts: TavilyStructuredContact[] = [];
  for (const c of [...base.contacts, ...extra.contacts]) {
    const idx = mergedContacts.findIndex((m) => structuredContactsMatch(m, c));
    if (idx >= 0) {
      mergedContacts[idx] = mergeStructuredContact(mergedContacts[idx]!, c);
    } else {
      mergedContacts.push(c);
    }
  }

  return {
    companySummary: base.companySummary ?? extra.companySummary,
    specialty: base.specialty ?? extra.specialty,
    servicesOffering: base.servicesOffering ?? extra.servicesOffering,
    region: base.region ?? extra.region,
    city: base.city ?? extra.city,
    country: base.country ?? extra.country,
    phones: [...new Set([...base.phones, ...extra.phones])],
    emails: [...new Set([...base.emails, ...extra.emails])],
    linkedinCompanyUrl: base.linkedinCompanyUrl ?? extra.linkedinCompanyUrl,
    contacts: mergedContacts,
    commercialNotes: base.commercialNotes ?? extra.commercialNotes,
  };
}

export function countContactsWithRole(structured?: TavilyLeadStructuredData | null): number {
  return (structured?.contacts ?? []).filter((c) => c.title?.trim() || c.seniority?.trim()).length;
}

function contactDiscoveryFocus(goals: TavilyV2ExtractionGoal[]): string {
  if (!goalsNeedContactDiscovery(goals)) return "";
  return (
    " PRIORIDAD MÁXIMA — decisores y contactos: identificá CEO, director general, fundador, gerente, VP, " +
    "socio y otros cargos directivos. Buscá en LinkedIn (página de empresa y perfiles públicos), " +
    "páginas team/about/leadership del sitio, directorios, prensa y cualquier fuente pública indexable. " +
    "Cada contacto debe tener nombre y cargo en español; agregá linkedin_url, email o teléfono si existen. " +
    "Incluí personas aunque no tengan email público."
  );
}

export function buildStructuredResearchInput(
  domain: string,
  goals: TavilyV2ExtractionGoal[],
  instructions?: string,
  includeExternalSources = false
): string {
  const host = domain.replace(/^https?:\/\//, "").split("/")[0];
  const focus =
    instructions?.trim() ||
    "Priorizá páginas sobre nosotros, servicios, equipo, liderazgo y contacto del sitio oficial.";

  const outputRules =
    "Salida: datos CRM estructurados en español (traducir si el sitio está en inglés u otro idioma). " +
    "company_summary debe ser un resumen factual breve para evaluar encaje con un ICP — sin hipótesis, " +
    "ideas comerciales ni «próximos pasos». No devolver markdown ni informes largos.";

  const contactFocus = contactDiscoveryFocus(goals);

  if (includeExternalSources) {
    return (
      `Investigá la empresa detrás de ${host}. Usá el sitio oficial (${host}) Y todo el alcance web de Tavily: ` +
      `LinkedIn, Google/Bing, directorios empresariales, prensa, registros y listados públicos. ${focus}${contactFocus} ` +
      `Buscá teléfonos, emails, decisores con cargo, sede y LinkedIn. ${outputRules} ` +
      `Dejá vacío lo que no encuentres; no inventes.`
    );
  }

  return (
    `Investigá la empresa en ${host} usando su sitio web y páginas de ese dominio. ${focus}${contactFocus} ` +
    `${outputRules} Completá cada campo del schema solo con evidencia en ${host}; ` +
    `cadena vacía o array vacío si no hay datos.`
  );
}

/** Segunda pasada enfocada solo en decisores cuando la primera no devolvió cargos. */
export function buildContactDiscoveryResearchInput(domain: string, organization?: string): string {
  const host = domain.replace(/^https?:\/\//, "").split("/")[0];
  const label = organization?.trim() || host;
  return (
    `Encontrá decisores y contactos clave de «${label}» (${host}) usando LinkedIn, el sitio web, directorios, ` +
    `prensa y cualquier fuente pública disponible vía Tavily. ` +
    `Devolvé el array contacts con nombre y cargo en español para cada persona identificable ` +
    `(CEO, director, fundador, gerente general, VP, socio). ` +
    `Incluí linkedin_url cuando exista. Incluí email/teléfono solo si son públicos. ` +
    `No omitas personas por falta de email. No inventes datos.`
  );
}

export function buildContactDiscoveryOutputSchema(includeExternalSources: boolean): Record<string, unknown> {
  const schemaProps = buildSchemaProperties(includeExternalSources);
  return {
    properties: {
      contacts: schemaProps.contacts,
      linkedin_company_url: schemaProps.linkedin_company_url,
    },
    required: ["contacts"],
  };
}

/** Goals that benefit from the structured research pass after crawl/extract. */
export function goalsNeedStructuredFill(goals: TavilyV2ExtractionGoal[]): boolean {
  return goals.length > 0;
}
