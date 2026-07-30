"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { HunterSearchResponse } from "@/components/lead-engine/hunter-types";
import { normalizeDomain } from "@/lib/hunter/client";
import { useActiveIcpVersion } from "@/hooks/useActiveIcpVersion";
import { usePersistedSidebarOpen } from "@/hooks/usePersistedSidebarOpen";
import {
  LeadEngineV2SearchCard,
  type LeadEngineV2SearchMeta,
} from "@/components/lead-engine-v2/LeadEngineV2SearchCard";
import {
  LeadEngineV2HistoryToggle,
  LeadEngineV2SearchHistoryPanel,
  useLeadEngineV2HistoryRunCount,
} from "@/components/lead-engine-v2/LeadEngineV2SearchHistory";
import {
  LeadEngineV2TavilyCard,
  TAVILY_V2_DEFAULT_CONFIG,
} from "@/components/lead-engine-v2/LeadEngineV2TavilyCard";
import { LeadEngineV2DomainsPanel } from "@/components/lead-engine-v2/LeadEngineV2DomainsPanel";
import {
  LeadEngineV2FlowShell,
  LeadEngineV2FlowStepper,
  type V2FlowStepStatus,
} from "@/components/lead-engine-v2/LeadEngineV2FlowShell";
import type { TavilyV2Config } from "@/lib/lead-engine-v2/tavily-v2-options";
import type { TavilyV2StoredEnrichment } from "@/lib/lead-engine-v2/tavily-enrichment-types";
import type { V2IcpMatchResult } from "@/lib/lead-engine-v2/v2-icp-match-types";
import type { LeadEngineV2SearchHistoryPayload } from "@/lib/lead-engine-v2/v2-search-history-types";
import {
  clearV2ActiveSession,
  fetchV2SearchSnapshot,
  loadV2PersistedEnrichments,
  readV2ActiveSession,
  saveV2DomainEnrichment,
  saveV2DomainIcpMatch,
  writeV2ActiveSession,
} from "@/lib/lead-engine-v2/v2-session-persistence";

function applyPersistedRows(
  rows: Awaited<ReturnType<typeof loadV2PersistedEnrichments>>
): {
  enrichments: Map<string, TavilyV2StoredEnrichment>;
  icpMatches: Map<string, V2IcpMatchResult>;
  analyzed: Set<string>;
} {
  const enrichments = new Map<string, TavilyV2StoredEnrichment>();
  const icpMatches = new Map<string, V2IcpMatchResult>();
  const analyzed = new Set<string>();

  for (const row of rows) {
    const key = normalizeDomain(row.domain) || row.domain.trim().toLowerCase();
    enrichments.set(key, row.enrichment as TavilyV2StoredEnrichment);
    analyzed.add(key);
    if (row.icpMatch) {
      icpMatches.set(key, row.icpMatch as V2IcpMatchResult);
    }
  }

  return { enrichments, icpMatches, analyzed };
}

export function LeadEngineV2PageContent() {
  const { activeId, isReady } = useActiveIcpVersion();
  const { open: historyOpen, toggle: toggleHistory } = usePersistedSidebarOpen(
    "lead-engine-v2-history-sidebar",
    false
  );

  const [loading, setLoading] = useState(false);
  const [hunterSearched, setHunterSearched] = useState(false);
  const [data, setData] = useState<HunterSearchResponse | null>(null);
  const [meta, setMeta] = useState<LeadEngineV2SearchMeta | null>(null);
  const [activeSearchRunId, setActiveSearchRunId] = useState<string | null>(null);
  const [selectedHistoryRunId, setSelectedHistoryRunId] = useState<string | null>(null);
  const [historyRefreshToken, setHistoryRefreshToken] = useState(0);
  const [tavilyConfig, setTavilyConfig] = useState<TavilyV2Config>(TAVILY_V2_DEFAULT_CONFIG);
  const [tavilyAnalyzedDomains, setTavilyAnalyzedDomains] = useState<Set<string>>(() => new Set());
  const [tavilyEnrichments, setTavilyEnrichments] = useState<Map<string, TavilyV2StoredEnrichment>>(
    () => new Map()
  );
  const [tavilyRunning, setTavilyRunning] = useState(false);
  const [tavilyRunningDomain, setTavilyRunningDomain] = useState<string | null>(null);
  const [icpMatches, setIcpMatches] = useState<Map<string, V2IcpMatchResult>>(() => new Map());
  const [restoringSession, setRestoringSession] = useState(false);
  const sessionRestoredRef = useRef(false);

  const historyRunCount = useLeadEngineV2HistoryRunCount(activeId || null, isReady, historyRefreshToken);

  const clearTavilyState = useCallback(() => {
    setTavilyAnalyzedDomains(new Set());
    setTavilyEnrichments(new Map());
    setTavilyRunningDomain(null);
    setIcpMatches(new Map());
  }, []);

  const resetTavilyForNewSearch = useCallback(() => {
    clearTavilyState();
    setSelectedHistoryRunId(null);
    setActiveSearchRunId(null);
    clearV2ActiveSession();
  }, [clearTavilyState]);

  const hydratePersistedForRun = useCallback(
    async (icpVersionId: string, searchRunId: string) => {
      const rows = await loadV2PersistedEnrichments(icpVersionId, searchRunId);
      const applied = applyPersistedRows(rows);
      setTavilyEnrichments(applied.enrichments);
      setTavilyAnalyzedDomains(applied.analyzed);
      setIcpMatches(applied.icpMatches);
    },
    []
  );

  const restoreSearchRun = useCallback(
    async (icpVersionId: string, searchRunId: string, fromHistory = false) => {
      setRestoringSession(true);
      try {
        const payload = (await fetchV2SearchSnapshot(
          icpVersionId,
          searchRunId
        )) as LeadEngineV2SearchHistoryPayload;
        setData({ companies: payload.companies as HunterSearchResponse["companies"], meta: payload.meta as HunterSearchResponse["meta"] });
        setMeta(payload.searchMeta);
        setHunterSearched(true);
        setActiveSearchRunId(searchRunId);
        setSelectedHistoryRunId(fromHistory ? searchRunId : null);
        writeV2ActiveSession({ icpVersionId, searchRunId });
        await hydratePersistedForRun(icpVersionId, searchRunId);
      } catch {
        clearV2ActiveSession();
      } finally {
        setRestoringSession(false);
      }
    },
    [hydratePersistedForRun]
  );

  useEffect(() => {
    if (!isReady || !activeId || sessionRestoredRef.current) return;
    sessionRestoredRef.current = true;
    const session = readV2ActiveSession();
    if (session?.icpVersionId === activeId && session.searchRunId) {
      void restoreSearchRun(activeId, session.searchRunId, false);
    }
  }, [isReady, activeId, restoreSearchRun]);

  useEffect(() => {
    sessionRestoredRef.current = false;
  }, [activeId]);

  const markDomainAnalyzed = useCallback((domain: string) => {
    const key = normalizeDomain(domain) || domain.trim().toLowerCase();
    setTavilyAnalyzedDomains((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const storeDomainEnrichment = useCallback(
    (enrichment: TavilyV2StoredEnrichment) => {
      const key = normalizeDomain(enrichment.domain) || enrichment.domain.trim().toLowerCase();
      setTavilyEnrichments((prev) => {
        const next = new Map(prev);
        next.set(key, { ...enrichment, domain: key });
        return next;
      });
      markDomainAnalyzed(key);

      if (!activeSearchRunId) {
        toast.warning("Los datos Tavily no persistirán: la búsqueda no quedó guardada en historial.");
        return;
      }

      if (activeId) {
        void saveV2DomainEnrichment({
          icpVersionId: activeId,
          searchRunId: activeSearchRunId,
          enrichment: { ...enrichment, domain: key },
        }).catch(() => {
          /* persist best-effort */
        });
      }
    },
    [markDomainAnalyzed, activeId, activeSearchRunId]
  );

  const storeIcpMatch = useCallback(
    (domain: string, match: V2IcpMatchResult) => {
      const key = normalizeDomain(domain) || domain.trim().toLowerCase();
      setIcpMatches((prev) => {
        const next = new Map(prev);
        next.set(key, match);
        return next;
      });

      if (activeId && activeSearchRunId) {
        void saveV2DomainIcpMatch({
          icpVersionId: activeId,
          searchRunId: activeSearchRunId,
          domain: key,
          icpMatch: match,
        }).catch(() => {
          /* persist best-effort */
        });
      }
    },
    [activeId, activeSearchRunId]
  );

  const handleLoadHistorySnapshot = useCallback(
    async (nextData: HunterSearchResponse, nextMeta: LeadEngineV2SearchMeta, runId: string) => {
      if (!activeId) return;
      clearTavilyState();
      setData(nextData);
      setMeta(nextMeta);
      setHunterSearched(true);
      setActiveSearchRunId(runId);
      setSelectedHistoryRunId(runId);
      writeV2ActiveSession({ icpVersionId: activeId, searchRunId: runId });
      try {
        await hydratePersistedForRun(activeId, runId);
      } catch {
        /* ignore */
      }
    },
    [activeId, clearTavilyState, hydratePersistedForRun]
  );

  const handleClearHistorySelection = useCallback(() => {
    setSelectedHistoryRunId(null);
  }, []);

  const domainRows = useMemo(
    () =>
      (data?.companies ?? []).map((c) => ({
        domain: c.domain,
        organization: c.organization,
        contacts: c.contacts,
      })),
    [data?.companies]
  );

  const hunterStatus: V2FlowStepStatus =
    loading || restoringSession ? "active" : hunterSearched ? "done" : "idle";
  const tavilyStatus: V2FlowStepStatus = !hunterSearched
    ? "locked"
    : tavilyRunning
      ? "active"
      : tavilyAnalyzedDomains.size > 0
        ? "done"
        : "idle";
  const classifyStatus: V2FlowStepStatus = "locked";
  const resultsStatus: V2FlowStepStatus = loading || restoringSession
    ? "active"
    : hunterSearched
      ? domainRows.length > 0
        ? "done"
        : "idle"
      : "idle";

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold leading-tight text-foreground sm:text-2xl">
            Lead Engine V2
          </h1>
          {selectedHistoryRunId || restoringSession ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {selectedHistoryRunId ? (
                <span className="text-[#9EC5FF]">Historial</span>
              ) : null}
              {selectedHistoryRunId && restoringSession ? (
                <span className="text-muted-foreground"> · </span>
              ) : null}
              {restoringSession ? (
                <span className="text-[#9EC5FF]">Restaurando sesión…</span>
              ) : null}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <LeadEngineV2FlowStepper
            hunterStatus={hunterStatus}
            tavilyStatus={tavilyStatus}
            classifyStatus={classifyStatus}
            resultsStatus={resultsStatus}
          />
          <LeadEngineV2HistoryToggle
            open={historyOpen}
            onToggle={toggleHistory}
            count={historyRunCount}
          />
        </div>
      </header>

      <LeadEngineV2FlowShell
        historyOpen={historyOpen}
        historyPanel={
          <LeadEngineV2SearchHistoryPanel
            icpVersionId={activeId || null}
            icpReady={isReady}
            selectedRunId={selectedHistoryRunId}
            onLoadSnapshot={(d, m, runId) => void handleLoadHistorySnapshot(d, m, runId)}
            onClearSelection={handleClearHistorySelection}
            refreshToken={historyRefreshToken}
            onToggle={toggleHistory}
          />
        }
        hunterCard={
          <LeadEngineV2SearchCard
            loading={loading}
            setLoading={setLoading}
            onSearchStart={() => {
              setHunterSearched(false);
              resetTavilyForNewSearch();
              setData(null);
              setMeta(null);
            }}
            onHistorySaved={() => setHistoryRefreshToken((t) => t + 1)}
            onResults={(nextData, nextMeta, searchRunId) => {
              setData(nextData);
              setMeta(nextMeta);
              setHunterSearched(true);
              setSelectedHistoryRunId(null);
              clearTavilyState();
              if (searchRunId && activeId) {
                setActiveSearchRunId(searchRunId);
                writeV2ActiveSession({ icpVersionId: activeId, searchRunId });
              } else {
                setActiveSearchRunId(null);
                clearV2ActiveSession();
              }
            }}
          />
        }
        tavilyCard={
          <LeadEngineV2TavilyCard
            domains={domainRows}
            config={tavilyConfig}
            onConfigChange={setTavilyConfig}
            unlocked={hunterSearched}
            hunterLoading={loading}
            analyzedDomains={tavilyAnalyzedDomains}
            onDomainAnalyzed={markDomainAnalyzed}
            onDomainEnriched={storeDomainEnrichment}
            onRunningChange={setTavilyRunning}
            onRunningDomainChange={setTavilyRunningDomain}
          />
        }
        resultsPanel={
          <LeadEngineV2DomainsPanel
            data={data}
            meta={meta}
            loading={loading || restoringSession}
            tavilyConfig={tavilyConfig}
            tavilyAnalyzedDomains={tavilyAnalyzedDomains}
            tavilyEnrichments={tavilyEnrichments}
            tavilyRunningDomain={tavilyRunningDomain}
            icpVersionId={activeId || null}
            icpMatches={icpMatches}
            onIcpMatch={storeIcpMatch}
            onDomainEnriched={storeDomainEnrichment}
            onTavilyFeedStart={setTavilyRunningDomain}
            onTavilyFeedEnd={() => setTavilyRunningDomain(null)}
          />
        }
      />
    </div>
  );
}
