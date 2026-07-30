import type { HunterSearchResponse } from "@/components/lead-engine/hunter-types";
import type { LeadEngineV2SearchMeta } from "@/components/lead-engine-v2/LeadEngineV2SearchCard";

export type LeadEngineV2SearchHistoryPayload = HunterSearchResponse & {
  searchMeta: LeadEngineV2SearchMeta;
};

export type LeadEngineV2SearchHistoryListItem = {
  id: string;
  createdAt: string;
  companyCount: number;
  query: string;
  country: string;
  state: string | null;
  city: string | null;
  limit: number;
  excludeAlreadySeen: boolean;
};

export function formatV2SearchHistoryDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function v2SearchHistoryGeoLine(run: Pick<
  LeadEngineV2SearchHistoryListItem,
  "country" | "state" | "city"
>): string {
  const place = [run.city, run.state].filter(Boolean).join(", ");
  return place ? `${run.country} · ${place}` : run.country;
}
