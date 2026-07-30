import type { CrawlBundle } from "@/lib/lead-engine/smart-domain-crawl";
import type { TavilyV2Config } from "@/lib/lead-engine-v2/tavily-v2-options";
import type { TavilyLeadStructuredData } from "@/lib/lead-engine-v2/tavily-structured-lead";

export type EnrichmentCascadeMeta = {
  usedHunter: boolean;
  usedSite: boolean;
  usedTavilyPhone: boolean;
  usedTavilyFull: boolean;
  decisionMakersFound: number;
  skipReason?: string;
};

export type TavilyV2RawPayload = {
  operation: TavilyV2Config["operation"];
  primary: Record<string, unknown>;
  webSearch?: Record<string, unknown>;
  /** Tavily Research body with structured `content` (second pass or primary research). */
  structuredResearch?: Record<string, unknown>;
};

export type TavilyV2StoredEnrichment = {
  domain: string;
  operation: TavilyV2Config["operation"];
  analyzedAt: string;
  crawlPayload: CrawlBundle | null;
  /** Short research summary — not raw crawl markdown. */
  researchContent?: string;
  structured?: TavilyLeadStructuredData;
  error?: string;
  /** Cascada site/Hunter → Tavily (Lead Engine V2). */
  cascade?: EnrichmentCascadeMeta;
};

export type TavilyEnrichmentResult = {
  domain: string;
  ok: boolean;
  error?: string;
  operation: TavilyV2Config["operation"];
  pageCount?: number;
  payload?: TavilyV2RawPayload;
  stored?: TavilyV2StoredEnrichment;
};
