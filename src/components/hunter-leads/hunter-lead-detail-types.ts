export type HunterLeadDetailContact = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  position?: string | null;
  linkedinUrl?: string | null;
  phone?: string | null;
  seniority?: string | null;
  department?: string | null;
  confidence?: number | null;
};

/** Shape consumed by HunterLeadDetailContent (saved lead or V2 preview). */
export type HunterLeadDetailInput = {
  id?: string;
  agencyName?: string | null;
  organization?: string | null;
  domain: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  priority?: string | null;
  estado?: string | null;
  especialidad?: string | null;
  icpScore?: number | null;
  rowNumber?: number | null;
  companyLinkedinUrl?: string | null;
  updatedAt?: Date | string;
  sourceQuery?: string | null;
  sourceCountry?: string | null;
  sourceCity?: string | null;
  emailsPersonal?: number | null;
  emailsGeneric?: number | null;
  emailsTotal?: number | null;
  phone?: string | null;
  phoneSource?: string | null;
  description?: string | null;
  primaryContactName?: string | null;
  primaryContactTitle?: string | null;
  primaryEmail?: string | null;
  secondaryContactName?: string | null;
  secondaryContactTitle?: string | null;
  secondaryEmail?: string | null;
  contacts: HunterLeadDetailContact[];
  enrichmentMeta?: unknown;
};
