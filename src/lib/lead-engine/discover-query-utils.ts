import {
  normalizeIcpSearchGeo,
  sanitizeDiscoverQueryText,
  type IcpSearchGeoInput,
} from "@/lib/lead-engine/icp-search-geo";

function hunterCountryEnglish(iso2: string): string {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" }).of(iso2) ?? iso2;
  } catch {
    return iso2;
  }
}

/** Frase en inglés para anclar sede en la query NL de Hunter (no usar al generar/guardar queries). */
export function buildDiscoverGeoAnchorPhrase(geo: IcpSearchGeoInput): string {
  const n = normalizeIcpSearchGeo(geo);
  const country = hunterCountryEnglish(n.country);
  if (n.city && n.state) {
    return `headquartered in ${n.city}, ${n.state}, ${country}`;
  }
  if (n.city) {
    return `headquartered in ${n.city}, ${country}`;
  }
  if (n.state) {
    return `headquartered in ${n.state}, ${country}`;
  }
  return `headquartered in ${country}`;
}

function queryAlreadyHasGeoAnchor(q: string, geo: IcpSearchGeoInput): boolean {
  const lower = q.toLowerCase();
  if (!/\b(headquartered|based)\s+in\b/i.test(lower)) return false;
  const n = normalizeIcpSearchGeo(geo);
  const country = hunterCountryEnglish(n.country).toLowerCase();
  if (!lower.includes(country)) return false;
  if (n.city && !lower.includes(n.city.toLowerCase())) return false;
  if (n.state && !lower.includes(n.state.toLowerCase())) return false;
  return true;
}

function appendDiscoverGeoAnchor(q: string, geo: IcpSearchGeoInput): string {
  const anchor = buildDiscoverGeoAnchorPhrase(geo);
  if (queryAlreadyHasGeoAnchor(q, geo)) return q;
  const base = q.replace(/\s*\.\s*$/, "").trim();
  return `${base} ${anchor}`;
}

export type DiscoverQueryVariant = {
  query: string;
  rationale?: string;
};

/** Clave normalizada para deduplicar (minúsculas, espacios colapsados). Seguro para cliente. */
export function discoverQueryKey(q: string): string {
  return sanitizeDiscoverQueryText(q).toLowerCase().replace(/\s+/g, " ");
}

export function cleanDiscoverQuery(q: string): string {
  return sanitizeDiscoverQueryText(q.trim()).slice(0, 500);
}

/** Hunter Discover AI espera frases completas, no fragmentos ni listas con "|". */
export function polishHunterDiscoverNatLangQuery(query: string, geo: IcpSearchGeoInput): string {
  let q = cleanDiscoverQuery(query)
    .replace(/\|/g, " and ")
    .replace(/\s+/g, " ")
    .trim();
  if (!q) return q;

  const looksLikeDiscoverSentence =
    /\b(companies|company|businesses|firms|organizations|organisations|providers|vendors|startups|agencies)\b/i.test(
      q
    ) || /^companies\b/i.test(q);

  if (!looksLikeDiscoverSentence) {
    q =
      q.length < 60
        ? `Companies that specialize in ${q}`
        : `Companies: ${q}`;
  }

  q = appendDiscoverGeoAnchor(q, geo);
  return q.slice(0, 500);
}

/** Filtra variantes que ya existen en la biblioteca del ICP (por queryKey). */
export function filterVariantsNotInLibrary(
  variants: DiscoverQueryVariant[],
  existingKeys: ReadonlySet<string>
): DiscoverQueryVariant[] {
  const seen = new Set(existingKeys);
  const out: DiscoverQueryVariant[] = [];
  for (const v of variants) {
    const cleaned = cleanDiscoverQuery(v.query);
    const key = discoverQueryKey(cleaned);
    if (key.length < 3 || seen.has(key)) continue;
    seen.add(key);
    out.push({
      query: cleaned,
      ...(v.rationale?.trim() ? { rationale: v.rationale.trim().slice(0, 500) } : {}),
    });
  }
  return out;
}
