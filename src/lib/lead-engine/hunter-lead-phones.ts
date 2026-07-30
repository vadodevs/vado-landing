import { normalizePhonesFromCrawl } from "@/lib/lead-engine/merge-crawl-hunter-snapshot";

type PipelineCrawlMeta = {
  pipelineCrawl?: {
    phones?: string[];
    emails?: string[];
  };
};

/** Fila sintética solo para guardar un teléfono del crawl (no es un correo real). */
function isSyntheticPhoneRowEmail(email: string): boolean {
  return /^tel\.[\d-]+@/i.test(email.trim());
}

function normEmail(e: string): string {
  return e.trim().toLowerCase();
}

/** Todos los correos “reales” del lead (contactos + lista del crawl en meta), deduplicados. */
export function collectHunterLeadEmails(lead: {
  enrichmentMeta?: unknown;
  contacts?: { email?: string }[];
}): string[] {
  const raw: string[] = [];
  const meta = lead.enrichmentMeta as PipelineCrawlMeta | null | undefined;
  if (Array.isArray(meta?.pipelineCrawl?.emails)) {
    for (const e of meta.pipelineCrawl.emails) {
      if (typeof e === "string" && e.includes("@")) raw.push(e.trim());
    }
  }
  for (const c of lead.contacts ?? []) {
    const em = c.email?.trim();
    if (em?.includes("@") && !isSyntheticPhoneRowEmail(em)) raw.push(em);
  }
  const out: string[] = [];
  const seen = new Set<string>();
  for (const e of raw) {
    const k = normEmail(e);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(e.trim());
  }
  out.sort((a, b) => normEmail(a).localeCompare(normEmail(b)));
  return out;
}

/** Todos los teléfonos conocidos del lead (principal, contactos, crawl en enrichmentMeta), deduplicados. */
export function collectHunterLeadPhones(lead: {
  phone?: string | null;
  enrichmentMeta?: unknown;
  contacts?: { phone?: string | null }[];
}): string[] {
  const raw: string[] = [];
  if (lead.phone?.trim()) raw.push(lead.phone.trim());
  const meta = lead.enrichmentMeta as PipelineCrawlMeta | null | undefined;
  if (Array.isArray(meta?.pipelineCrawl?.phones)) {
    for (const p of meta.pipelineCrawl.phones) {
      if (typeof p === "string" && p.trim()) raw.push(p.trim());
    }
  }
  for (const c of lead.contacts ?? []) {
    if (c.phone?.trim()) raw.push(c.phone.trim());
  }
  return normalizePhonesFromCrawl(raw);
}
