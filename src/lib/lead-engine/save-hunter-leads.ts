/** Minimal type for V2 snapshot save (autosales Zod schema mirror). */
export type HunterSearchSnapshotSaveInput = {
  query: string;
  country: string;
  state?: string;
  city?: string;
  icpVersionId?: string;
  companies: Array<{
    domain: string;
    organization?: string | null;
    emailsCount?: { personal?: number; generic?: number; total?: number } | null;
    contacts?: Array<Record<string, unknown>> | null;
    icpScore?: number;
    description?: string | null;
    phone?: string | null;
    phoneSource?: string | null;
    enrichmentMeta?: unknown;
    agencyName?: string | null;
    estado?: string | null;
    especialidad?: string | null;
    primaryContactName?: string | null;
    primaryContactTitle?: string | null;
    primaryEmail?: string | null;
    secondaryContactName?: string | null;
    secondaryContactTitle?: string | null;
    secondaryEmail?: string | null;
  }>;
};
