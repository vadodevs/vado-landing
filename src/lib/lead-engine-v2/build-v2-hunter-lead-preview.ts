import type { HunterSearchCompany } from "@/components/lead-engine/hunter-types";
import type { LeadEngineV2SearchMeta } from "@/components/lead-engine-v2/LeadEngineV2SearchCard";
import type { HunterLeadDetailContact } from "@/components/hunter-leads/hunter-lead-detail-types";
import type { HunterLeadDetailInput } from "@/components/hunter-leads/hunter-lead-detail-types";
import type { TavilyV2StoredEnrichment } from "@/lib/lead-engine-v2/tavily-enrichment-types";
import {
  pickLeadDescriptionFromStructured,
  type TavilyStructuredContact,
} from "@/lib/lead-engine-v2/tavily-structured-lead";

const EXEC_TITLE_RE =
  /ceo|cfo|cto|coo|founder|director|president|owner|partner|chief|head|vp|socio|fundador|directora|gerente|presidente|dueño|propietario|managing|general manager/i;

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

function hasValidEmail(email?: string | null): email is string {
  return Boolean(email?.trim().includes("@"));
}

function structuredContactToRow(c: TavilyStructuredContact, index: number): HunterLeadDetailContact | null {
  const email = c.email?.trim().toLowerCase();
  const name = c.name?.trim();
  const title = c.title?.trim();
  const linkedin = c.linkedinUrl?.trim();
  const phone = c.phone?.trim();
  if (!hasValidEmail(email) && !name && !title && !linkedin) return null;

  const { firstName, lastName } = name ? splitName(name) : { firstName: "", lastName: "" };
  const idSuffix = hasValidEmail(email) ? email : linkedin || `person-${index}`;

  return {
    id: `tavily-contact-${index}-${idSuffix}`,
    email: hasValidEmail(email) ? email : "",
    firstName: firstName || null,
    lastName: lastName || null,
    position: title ?? null,
    phone: phone ?? null,
    linkedinUrl: linkedin ?? null,
    seniority: c.seniority ?? null,
    confidence: null,
  };
}

function contactRowKey(c: HunterLeadDetailContact): string | null {
  if (hasValidEmail(c.email)) return `email:${c.email.toLowerCase()}`;
  if (c.linkedinUrl?.trim()) return `li:${c.linkedinUrl.trim().toLowerCase()}`;
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim().toLowerCase();
  if (name) return `name:${name}`;
  return c.id;
}

function enrichContactRow(
  existing: HunterLeadDetailContact,
  incoming: HunterLeadDetailContact
): HunterLeadDetailContact {
  return {
    ...existing,
    email: hasValidEmail(existing.email) ? existing.email : hasValidEmail(incoming.email) ? incoming.email : "",
    firstName: existing.firstName || incoming.firstName,
    lastName: existing.lastName || incoming.lastName,
    position: existing.position || incoming.position,
    phone: existing.phone || incoming.phone,
    linkedinUrl: existing.linkedinUrl || incoming.linkedinUrl,
    seniority: existing.seniority || incoming.seniority,
    department: existing.department || incoming.department,
    confidence: existing.confidence ?? incoming.confidence,
  };
}

function mergeContacts(
  hunter: HunterLeadDetailContact[],
  structured: HunterLeadDetailContact[],
  siteEmails: HunterLeadDetailContact[]
): HunterLeadDetailContact[] {
  const byKey = new Map<string, HunterLeadDetailContact>();
  for (const c of [...hunter, ...structured, ...siteEmails]) {
    const key = contactRowKey(c);
    if (!key) continue;
    const prev = byKey.get(key);
    byKey.set(key, prev ? enrichContactRow(prev, c) : c);
  }
  return [...byKey.values()];
}

function contactRank(c: HunterLeadDetailContact): number {
  const title = `${c.position ?? ""} ${c.seniority ?? ""}`;
  if (EXEC_TITLE_RE.test(title)) return 0;
  if (c.position?.trim() || c.seniority?.trim()) return 1;
  if (hasValidEmail(c.email) && (c.firstName || c.lastName)) return 2;
  if (c.linkedinUrl?.trim()) return 3;
  return 4;
}

function pickPrimarySecondary(contacts: HunterLeadDetailContact[]): {
  primary: HunterLeadDetailContact | null;
  secondary: HunterLeadDetailContact | null;
} {
  const ranked = [...contacts]
    .filter(
      (c) =>
        c.position?.trim() ||
        c.seniority?.trim() ||
        c.linkedinUrl?.trim() ||
        (hasValidEmail(c.email) && (c.firstName || c.lastName))
    )
    .sort((a, b) => contactRank(a) - contactRank(b));
  return { primary: ranked[0] ?? null, secondary: ranked[1] ?? null };
}

function displayContactName(c: HunterLeadDetailContact | null): string | null {
  if (!c) return null;
  const name = [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  return name || null;
}

export function buildV2HunterLeadPreviewModel(input: {
  company: HunterSearchCompany;
  searchMeta?: LeadEngineV2SearchMeta | null;
  enrichment?: TavilyV2StoredEnrichment | null;
}): HunterLeadDetailInput {
  const { company, searchMeta, enrichment } = input;
  const structured = enrichment?.structured;
  const crawl = enrichment?.crawlPayload;

  const hunterContacts = (company.contacts ?? []).map((c, i) => ({
    id: `hunter-${i}-${c.email}`,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    position: c.position,
    phone: c.phone,
    seniority: c.seniority,
    department: c.department,
    confidence: c.confidence,
  }));

  const structuredRows = (structured?.contacts ?? [])
    .map((c, i) => structuredContactToRow(c, i))
    .filter((c): c is HunterLeadDetailContact => c != null);

  const existingEmails = new Set([
    ...hunterContacts.filter((c) => hasValidEmail(c.email)).map((c) => c.email.toLowerCase()),
    ...structuredRows.filter((c) => hasValidEmail(c.email)).map((c) => c.email.toLowerCase()),
  ]);

  const crawlEmails = crawl?.extractedEmails ?? [];
  const structuredEmails = structured?.emails ?? [];
  const allSiteEmails = [...new Set([...structuredEmails, ...crawlEmails].map((e) => e.toLowerCase()))];

  const siteContacts = allSiteEmails
    .filter((email) => !existingEmails.has(email))
    .map((email, i) => ({
      id: `site-email-${i}-${email}`,
      email,
      position: "Detectado en sitio (Tavily)",
    }));

  const allContacts = mergeContacts(hunterContacts, structuredRows, siteContacts);

  const { primary, secondary } = pickPrimarySecondary(
    structuredRows.length > 0
      ? mergeContacts(structuredRows, hunterContacts, [])
      : mergeContacts(hunterContacts, [], siteContacts)
  );

  const phones = [
    ...(structured?.phones ?? []),
    ...(crawl?.extractedPhones ?? []),
    ...(structuredRows.map((c) => c.phone).filter(Boolean) as string[]),
    ...(hunterContacts.map((c) => c.phone).filter(Boolean) as string[]),
  ];
  const uniquePhones = [...new Set(phones.map((p) => p.trim()).filter(Boolean))];
  const phone = uniquePhones[0] ?? null;
  const phoneSource = phone ? `https://${company.domain}` : null;

  const especialidad =
    structured?.specialty?.trim() ||
    structured?.servicesOffering?.trim() ||
    null;

  const regionParts = [
    structured?.city,
    structured?.region,
    structured?.country,
  ].filter(Boolean);
  const estado =
    regionParts.length > 0
      ? regionParts.join(", ")
      : [searchMeta?.city, searchMeta?.state, searchMeta?.country].filter(Boolean).join(" · ") || null;

  const description = pickLeadDescriptionFromStructured(structured, enrichment?.researchContent);

  const crawlEmailList = [...new Set([...allSiteEmails, ...structuredRows.filter((c) => hasValidEmail(c.email)).map((c) => c.email.toLowerCase())])];
  const crawlPhoneList = uniquePhones;

  const enrichmentMeta =
    crawl || structured
      ? {
          pipelineCrawl: {
            phones: crawlPhoneList,
            emails: crawlEmailList,
          },
          crawlPageCount: crawl?.pages.length ?? 0,
        }
      : undefined;

  const geoCity = [searchMeta?.city, searchMeta?.state].filter(Boolean).join(" · ") || null;

  return {
    domain: company.domain,
    organization: company.organization,
    agencyName: company.organization,
    sourceQuery: searchMeta?.query ?? null,
    sourceCountry: structured?.country ?? searchMeta?.country ?? null,
    sourceCity: structured?.city ?? geoCity,
    emailsPersonal: company.emailsCount?.personal ?? null,
    emailsGeneric: company.emailsCount?.generic ?? null,
    emailsTotal: company.emailsCount?.total ?? null,
    phone,
    phoneSource,
    description,
    especialidad,
    estado,
    companyLinkedinUrl: structured?.linkedinCompanyUrl ?? null,
    primaryContactName: displayContactName(primary),
    primaryContactTitle: primary?.position ?? null,
    primaryEmail: hasValidEmail(primary?.email) ? primary.email : null,
    secondaryContactName: displayContactName(secondary),
    secondaryContactTitle: secondary?.position ?? null,
    secondaryEmail: hasValidEmail(secondary?.email) ? secondary.email : null,
    contacts: allContacts,
    enrichmentMeta,
    updatedAt: enrichment?.analyzedAt ?? new Date().toISOString(),
  };
}
