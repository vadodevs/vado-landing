"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Loader2, PanelLeftClose, PanelLeftOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { HunterSearchResponse } from "@/components/lead-engine/hunter-types";
import type { LeadEngineV2SearchMeta } from "@/components/lead-engine-v2/LeadEngineV2SearchCard";
import {
  formatV2SearchHistoryDate,
  v2SearchHistoryGeoLine,
  type LeadEngineV2SearchHistoryListItem,
  type LeadEngineV2SearchHistoryPayload,
} from "@/lib/lead-engine-v2/v2-search-history-types";
import {
  mockDeleteHistory,
  mockGetHistorySnapshot,
  mockListHistory,
} from "@/lib/lead-engine-v2/mock-client-api";
import { cn } from "@/lib/utils";

export type LeadEngineV2SearchHistoryProps = {
  icpVersionId: string | null;
  icpReady: boolean;
  selectedRunId: string | null;
  onLoadSnapshot: (
    data: HunterSearchResponse,
    meta: LeadEngineV2SearchMeta,
    runId: string
  ) => void;
  onClearSelection: () => void;
  refreshToken?: number;
  open: boolean;
  onToggle: () => void;
  runCount?: number;
};

export function LeadEngineV2HistoryToggle({
  open,
  onToggle,
  count,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  count?: number;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-muted/20 px-2.5 py-1.5",
        "text-xs font-medium text-foreground hover:bg-muted/40",
        className
      )}
    >
      {open ? (
        <PanelLeftClose className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      ) : (
        <PanelLeftOpen className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      )}
      Historial
      {typeof count === "number" && count > 0 ? (
        <span className="rounded-full bg-[#3390FF]/20 px-1.5 py-px text-[0.6rem] font-semibold text-[#B8D9FF]">
          {count}
        </span>
      ) : null}
    </button>
  );
}

export function LeadEngineV2SearchHistoryPanel({
  icpVersionId,
  icpReady,
  selectedRunId,
  onLoadSnapshot,
  onClearSelection,
  refreshToken = 0,
  onToggle,
}: Omit<LeadEngineV2SearchHistoryProps, "open"> & { onToggle: () => void }) {
  const [runs, setRuns] = useState<LeadEngineV2SearchHistoryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [loadingSnapshotId, setLoadingSnapshotId] = useState<string | null>(null);
  const snapshotAbortRef = useRef<Map<string, AbortController>>(new Map());

  const refreshHistory = useCallback(async () => {
    if (!icpVersionId) {
      setRuns([]);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const runs = await mockListHistory(icpVersionId);
      setRuns(runs);
    } catch (e) {
      setRuns([]);
      setFetchError(e instanceof Error ? e.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }, [icpVersionId]);

  useEffect(() => {
    if (!icpReady || !icpVersionId) {
      setRuns([]);
      setFetchError(null);
      onClearSelection();
    }
  }, [icpReady, icpVersionId, onClearSelection]);

  useEffect(() => {
    if (!icpReady || !icpVersionId) return;
    void refreshHistory();
  }, [icpReady, icpVersionId, refreshToken, refreshHistory]);

  const loadSnapshot = useCallback(
    async (run: LeadEngineV2SearchHistoryListItem, opts?: { force?: boolean }) => {
      if (!icpVersionId) return;
      if (selectedRunId === run.id && !opts?.force) return;

      snapshotAbortRef.current.get(run.id)?.abort();
      const ac = new AbortController();
      snapshotAbortRef.current.set(run.id, ac);
      setLoadingSnapshotId(run.id);

      try {
        const payload = (await mockGetHistorySnapshot(
          icpVersionId,
          run.id
        )) as LeadEngineV2SearchHistoryPayload;
        if (!payload.searchMeta || !Array.isArray(payload.companies)) {
          toast.error("Snapshot inválido.");
          return;
        }
        onLoadSnapshot(
          { companies: payload.companies, meta: payload.meta },
          payload.searchMeta,
          run.id
        );
        toast.success(`${payload.companies.length} dominio(s) del historial`);
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        toast.error(e instanceof Error ? e.message : "Error de red");
      } finally {
        if (snapshotAbortRef.current.get(run.id) === ac) {
          snapshotAbortRef.current.delete(run.id);
        }
        setLoadingSnapshotId(null);
      }
    },
    [icpVersionId, onLoadSnapshot, selectedRunId]
  );

  const deleteSnapshot = async (id: string) => {
    if (!icpVersionId) return;
    snapshotAbortRef.current.get(id)?.abort();
    snapshotAbortRef.current.delete(id);

    try {
      await mockDeleteHistory(icpVersionId, id);
      if (selectedRunId === id) onClearSelection();
      setRuns((prev) => prev.filter((r) => r.id !== id));
      toast.success("Eliminado del historial");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error de red");
    }
  };

  return (
    <div className="flex h-full max-h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-muted/10">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/60 px-3 py-2.5">
        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          Historial
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void refreshHistory()}
            disabled={loading || !icpVersionId}
            className="rounded px-1.5 py-0.5 text-[0.65rem] text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            {loading ? "…" : "↻"}
          </button>
          <button
            type="button"
            onClick={onToggle}
            title="Ocultar historial"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/40 hover:text-foreground"
          >
            <PanelLeftClose className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-2 py-2 scrollbar-thin">
        {loading && runs.length === 0 ? (
          <p className="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
            Cargando…
          </p>
        ) : fetchError ? (
          <p className="px-1 py-2 text-xs text-destructive">{fetchError}</p>
        ) : runs.length === 0 ? (
          <p className="px-1 py-2 text-[0.7rem] leading-snug text-muted-foreground">
            Las búsquedas Hunter aparecerán aquí.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {runs.map((run) => {
              const isSelected = selectedRunId === run.id || loadingSnapshotId === run.id;
              return (
                <li key={run.id}>
                  <div
                    className={cn(
                      "rounded-md border text-left text-xs transition-colors",
                      isSelected
                        ? "border-[#3390FF]/40 bg-[#3390FF]/10"
                        : "border-border/50 bg-background/30 hover:border-border"
                    )}
                  >
                    <button
                      type="button"
                      disabled={loadingSnapshotId === run.id}
                      onClick={() => void loadSnapshot(run)}
                      className="w-full px-2 py-1.5 text-left"
                    >
                      <p className="text-[0.65rem] font-medium text-foreground/90">
                        {formatV2SearchHistoryDate(run.createdAt)}
                      </p>
                      <p className="mt-0.5 line-clamp-2 font-mono text-[0.62rem] leading-snug text-muted-foreground">
                        {run.query}
                      </p>
                      <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                        {v2SearchHistoryGeoLine(run)} · {run.companyCount}
                      </p>
                    </button>
                    <div className="flex border-t border-border/40">
                      <button
                        type="button"
                        disabled={loadingSnapshotId === run.id}
                        onClick={() => void deleteSnapshot(run.id)}
                        className="flex flex-1 items-center justify-center gap-0.5 py-1 text-[0.6rem] text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        <Trash2 className="h-2.5 w-2.5" aria-hidden />
                        Borrar
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Hook-friendly wrapper: exposes run count for header badge. */
export function useLeadEngineV2HistoryRunCount(
  icpVersionId: string | null,
  icpReady: boolean,
  refreshToken: number
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!icpReady || !icpVersionId) {
      setCount(0);
      return;
    }
    let cancelled = false;
    void mockListHistory(icpVersionId)
      .then((runs) => {
        if (!cancelled) setCount(runs.length);
      })
      .catch(() => {
        if (!cancelled) setCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [icpReady, icpVersionId, refreshToken]);

  return count;
}
