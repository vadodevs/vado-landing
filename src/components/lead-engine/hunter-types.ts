export type HunterSearchCompany = {
  domain: string;
  organization: string | null;
  emailsCount: { personal?: number; generic?: number; total?: number } | null;
  /** Mensaje de Hunter cuando Domain Search falla (HTTP error). */
  domainSearchError?: string | null;
  contacts: Array<{
    email: string;
    firstName: string | null;
    lastName: string | null;
    position: string | null;
    type: string | null;
    confidence: number | null;
    verificationStatus: string | null;
    phone: string | null;
    seniority: string | null;
    department: string | null;
  }> | null;
};

export type HunterSearchResponse = {
  companies: HunterSearchCompany[];
  meta: {
    discover: unknown;
    returned: number;
    excludeAlreadySeen: boolean;
  };
};
