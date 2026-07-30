import { getLeadEngineSubdivisionOptions } from "@/lib/lead-engine/subdivision-options";

export type LeadEngineCountryIso = "MX" | "US";

export type IcpSearchGeo = {
  country: LeadEngineCountryIso;
  state?: string;
  city?: string;
};

/** Entrada con país en string (API, Prisma, formularios). */
export type IcpSearchGeoInput = {
  country: string;
  state?: string;
  city?: string;
};

/** Normaliza país del selector (MX | US). */
export function normalizeLeadEngineCountry(raw: string): LeadEngineCountryIso {
  return raw.trim().toUpperCase() === "US" ? "US" : "MX";
}

export function normalizeIcpSearchGeo(geo: IcpSearchGeoInput): IcpSearchGeo {
  const country = normalizeLeadEngineCountry(geo.country);
  const state = geo.state?.trim() || undefined;
  const city = geo.city?.trim() || undefined;
  return { country, state, city };
}

export function geoFilterKey(geo: IcpSearchGeoInput): string {
  const n = normalizeIcpSearchGeo(geo);
  return `${n.country}|${n.state ?? ""}|${n.city ?? ""}`;
}

export function countryDisplayName(iso2: LeadEngineCountryIso): string {
  try {
    return new Intl.DisplayNames(["es"], { type: "region" }).of(iso2) ?? iso2;
  } catch {
    return iso2;
  }
}

/** Etiqueta legible de los filtros activos (UI). */
export function formatGeoUiLabel(geo: IcpSearchGeoInput): string {
  const n = normalizeIcpSearchGeo(geo);
  const parts: string[] = [countryDisplayName(n.country)];
  if (n.state) parts.push(n.state);
  if (n.city) parts.push(n.city);
  return parts.join(" · ");
}

/** Bloque para prompts LLM: siempre refleja los filtros actuales, sin ejemplos fijos. */
export function formatGeoBlockForLlm(geo: IcpSearchGeoInput): string {
  const n = normalizeIcpSearchGeo(geo);
  const stateLine = n.state ?? "(sin estado/región en el filtro)";
  const cityLine = n.city ?? "(sin ciudad en el filtro)";
  const countryName = countryDisplayName(n.country);

  return `Filtros de ubicación activos en la UI (única fuente de verdad para geografía; prioridad sobre la descripción del ICP):
- País: ${countryName} (ISO-2: ${n.country})
- Estado / región: ${stateLine}
- Ciudad: ${cityLine}`;
}

/** Para criterios ICP en la rúbrica (evaluar encaje geográfico en el sitio). */
export function formatGeoForIcpCriteria(geo: IcpSearchGeoInput): string {
  const label = formatGeoUiLabel(geo);
  return `Para criterios de ubicación en la rúbrica, el encaje se evalúa respecto a los filtros activos (${label}). Si el ICP menciona otra región, prevalecen los filtros de la UI.`;
}

/** La región solo se aplica en Hunter al buscar; no va en el texto de la query. */
export function formatGeoAppliedOnlyAtSearchTime(geo: IcpSearchGeoInput): string {
  const label = formatGeoUiLabel(geo);
  return `Ubicación para la búsqueda en Hunter (automática, NO escribirla en las queries): ${label}. El backend añade país/estado/ciudad al llamar a Discover.`;
}

/** Reglas para generar texto de query Discover: solo ICP, sin geografía. */
export function formatDiscoverQueryIcpOnlyRules(): string {
  return `REGLAS OBLIGATORIAS (solo perfil ICP en el texto de la query):
- Cada query debe ser una frase completa en inglés que incluya la palabra "Companies" (ej. "Companies that provide X for Y", "Companies in the Z industry that …").
- Mínimo ~20 caracteres y al menos 6 palabras; PROHIBIDO fragmentos ("marketing agencies", "B2B model", solo cargos o tamaños).
- Describí únicamente tipo de empresa, industria, servicio, tamaño, modelo de negocio o ángulo del ICP.
- NO incluyas país, estado, ciudad, región, sede ni frases como "in Sonora", "Mexico", "United States", "Arizona", etc.
- Si el ICP menciona una zona geográfica, ignorala por completo al redactar la query.
- PROHIBIDO usar "|" o listas concatenadas en una sola query.
- En "rationale" explicá el ángulo de negocio; sin ubicación.
- Mal: "inbound marketing agencies in Sonora, Mexico". Bien: "Companies that provide inbound marketing services for B2B brands".`;
}

/** @deprecated Usar formatDiscoverQueryIcpOnlyRules */
export function formatDiscoverQueryMustExcludeGeoText(): string {
  return formatDiscoverQueryIcpOnlyRules();
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const COMMON_GEO_PHRASES = [
  "méxico",
  "mexico",
  "estados unidos",
  "united states",
  "usa",
  "u.s.a.",
  "u.s.",
  "mx",
];

function appendCountryPhrases(phrases: string[], country: LeadEngineCountryIso): void {
  try {
    phrases.push(countryDisplayName(country).toLowerCase());
    const en = new Intl.DisplayNames(["en"], { type: "region" }).of(country);
    if (en) phrases.push(en.toLowerCase());
  } catch {
    /* noop */
  }
}

function appendSubdivisionPhrases(phrases: string[], country: LeadEngineCountryIso): void {
  for (const opt of getLeadEngineSubdivisionOptions(country)) {
    if (opt.label.length >= 2) phrases.push(opt.label.toLowerCase());
    if (opt.value.length >= 2) phrases.push(opt.value.toLowerCase());
  }
}

/** Frases geográficas conocidas (MX/US) para limpiar queries generadas por IA. */
export function buildAllKnownGeoPhrasesToStrip(): string[] {
  const phrases = [...COMMON_GEO_PHRASES];
  appendCountryPhrases(phrases, "MX");
  appendCountryPhrases(phrases, "US");
  appendSubdivisionPhrases(phrases, "MX");
  appendSubdivisionPhrases(phrases, "US");
  return [...new Set(phrases.filter((p) => p.length >= 2))].sort((a, b) => b.length - a.length);
}

function buildGeoPhrasesToStrip(geo: IcpSearchGeoInput): string[] {
  const n = normalizeIcpSearchGeo(geo);
  const phrases = [...buildAllKnownGeoPhrasesToStrip()];
  if (n.state) {
    phrases.push(n.state.toLowerCase());
    for (const opt of getLeadEngineSubdivisionOptions(n.country)) {
      if (opt.value === n.state) {
        phrases.push(opt.label.toLowerCase());
        phrases.push(opt.value.toLowerCase());
      }
    }
  }
  if (n.city) phrases.push(n.city.toLowerCase());
  return [...new Set(phrases)].sort((a, b) => b.length - a.length);
}

/** Quita menciones geográficas coladas por el modelo. Sin geo, usa listado MX/US completo. */
export function sanitizeDiscoverQueryText(query: string, geo?: IcpSearchGeoInput): string {
  let s = query.trim();
  if (!s) return s;

  const phrases = geo ? buildGeoPhrasesToStrip(geo) : buildAllKnownGeoPhrasesToStrip();
  for (const phrase of phrases) {
    const re = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, "gi");
    s = s.replace(re, " ");
  }

  s = s
    .replace(/\s+in\s+[\w\s]{2,40}$/gi, "")
    .replace(/\s*,\s*[\w\s]{2,30}$/gi, "")
    .replace(/\s+located\s+in\s+[\w\s,]+$/gi, "")
    .replace(/\s+based\s+in\s+[\w\s,]+$/gi, "")
    .replace(/\s+headquartered\s+in\s+[\w\s,]+$/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^[,.\s-]+|[,.\s-]+$/g, "");

  return s;
}

/** Al cambiar país, descarta estado que no pertenezca al nuevo listado. */
export function coerceStateForCountry(country: string, state: string): string {
  const iso = normalizeLeadEngineCountry(country);
  const trimmed = state.trim();
  if (!trimmed) return "";
  const options = getLeadEngineSubdivisionOptions(iso);
  return options.some((o) => o.value === trimmed) ? trimmed : "";
}
