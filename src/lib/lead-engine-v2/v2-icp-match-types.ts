/** Lead snapshot for ICP match — `description` (resumen Tavily) is the main signal. */
export type V2LeadIcpMatchInput = {
  domain: string;
  description?: string | null;
  organization?: string | null;
  especialidad?: string | null;
  estado?: string | null;
};

export type V2IcpMatchResult = {
  score: number;
  summary: string;
  icpName: string;
  computedAt: string;
};
