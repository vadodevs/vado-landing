import { useCallback, useEffect, useState } from 'react';
import {
  mockListDiscoverQueries,
  mockMarkDiscoverQueryUsed,
  mockSaveSearchSnapshot,
  mockSavedDomainsLookup,
} from '@/lib/lead-engine-v2/mock-client-api';

type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<{ data: T }>;
};

function useStaticQuery<T>(enabled: boolean, load: () => T): QueryResult<T> & {
  data: T | undefined;
} {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    const next = load();
    setData(next);
    setIsLoading(false);
    return { data: next };
  }, [load]);

  useEffect(() => {
    if (!enabled) {
      setData(undefined);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const next = load();
    setData(next);
    setIsLoading(false);
  }, [enabled, load]);

  return {
    data,
    isLoading,
    isError: false,
    error: null,
    refetch,
  };
}

function useMutation<TInput, TResult>(fn: (input: TInput) => Promise<TResult> | TResult) {
  const [isPending, setIsPending] = useState(false);
  const mutateAsync = useCallback(
    async (input: TInput) => {
      setIsPending(true);
      try {
        return await fn(input);
      } finally {
        setIsPending(false);
      }
    },
    [fn],
  );
  const mutate = useCallback(
    (input: TInput, opts?: { onSuccess?: (r: TResult) => void; onError?: (e: Error) => void }) => {
      void mutateAsync(input)
        .then((r) => opts?.onSuccess?.(r))
        .catch((e: Error) => opts?.onError?.(e));
    },
    [mutateAsync],
  );
  return { mutate, mutateAsync, isPending };
}

/** Stub tRPC mínimo para Lead Engine V2 en vado-landing (mock). */
export const trpc = {
  useUtils: () => ({
    hunterSavedLeads: {
      list: { invalidate: async () => undefined },
      savedDomainsLookup: { invalidate: async () => undefined },
      getById: { invalidate: async () => undefined },
      listReEnrichHistory: { invalidate: async () => undefined },
      reEnrichHistoryCount: { invalidate: async () => undefined },
    },
    icpDiscoverQueries: {
      list: { invalidate: async () => undefined },
    },
  }),
  icpVersions: {
    list: {
      useQuery: () =>
        useStaticQuery(true, () => [
          {
            id: 'icp-mock-1',
            name: 'SaaS B2B Mid-Market MX',
            description:
              'Empresas de software 20–200 empleados en México, con need de staff augmentation o producto a la medida.',
          },
        ]),
    },
  },
  icpDiscoverQueries: {
    list: {
      useQuery: (
        input: { icpVersionId: string },
        opts?: { enabled?: boolean },
      ) => {
        const enabled = opts?.enabled !== false && Boolean(input.icpVersionId);
        const load = useCallback(
          () => mockListDiscoverQueries(input.icpVersionId),
          [input.icpVersionId],
        );
        return useStaticQuery(enabled, load);
      },
    },
    markUsed: {
      useMutation: () =>
        useMutation(async (input: { icpVersionId: string; queries?: string[]; id?: string }) => {
          if (input.id) {
            return mockMarkDiscoverQueryUsed(input.icpVersionId, input.id);
          }
          const lib = mockListDiscoverQueries(input.icpVersionId);
          const keys = new Set((input.queries ?? []).map((q) => q.trim().toLowerCase()));
          for (const row of lib) {
            if (keys.has(row.query.toLowerCase()) || keys.has(row.queryKey)) {
              mockMarkDiscoverQueryUsed(input.icpVersionId, row.id);
            }
          }
          return { ok: true };
        }),
    },
  },
  hunterSavedLeads: {
    savedDomainsLookup: {
      useQuery: (
        input: { icpVersionId: string; domains: string[] },
        opts?: { enabled?: boolean },
      ) => {
        const enabled =
          opts?.enabled !== false && Boolean(input.icpVersionId) && input.domains.length > 0;
        const load = useCallback(
          () => mockSavedDomainsLookup(input.icpVersionId, input.domains),
          [input.icpVersionId, input.domains],
        );
        return useStaticQuery(enabled, load);
      },
    },
    saveSearchSnapshot: {
      useMutation: (opts?: {
        onSuccess?: (r: { savedDomains: number }) => void;
        onError?: (e: Error) => void;
        onSettled?: () => void;
      }) => {
        const mutation = useMutation(
          async (input: {
            icpVersionId: string;
            companies?: Array<{ domain: string }>;
            domains?: string[];
            query?: string;
            country?: string;
            state?: string;
            city?: string;
          }) => {
            const domains =
              input.domains ??
              (input.companies ?? []).map((c) => c.domain).filter(Boolean);
            return mockSaveSearchSnapshot(input.icpVersionId, domains);
          },
        );
        return {
          ...mutation,
          mutate: (
            input: {
              icpVersionId: string;
              companies?: Array<{ domain: string }>;
              domains?: string[];
              query?: string;
              country?: string;
              state?: string;
              city?: string;
            },
            localOpts?: {
              onSuccess?: (r: { savedDomains: number }) => void;
              onError?: (e: Error) => void;
              onSettled?: () => void;
            },
          ) => {
            void mutation
              .mutateAsync(input)
              .then((r) => {
                opts?.onSuccess?.(r);
                localOpts?.onSuccess?.(r);
              })
              .catch((e: Error) => {
                opts?.onError?.(e);
                localOpts?.onError?.(e);
              })
              .finally(() => {
                opts?.onSettled?.();
                localOpts?.onSettled?.();
              });
          },
        };
      },
    },
    applyTavilyEnrichment: {
      useMutation: () =>
        useMutation(async () => ({ ok: true })),
    },
    applyIcpMatchScore: {
      useMutation: () =>
        useMutation(async (input: { score: number }) => ({ score: input.score })),
    },
    reEnrich: {
      useMutation: () =>
        useMutation(async () => ({
          hasChanges: false,
          summary: 'Mock',
          hunterContactCount: 0,
          apolloPeopleCount: 0,
          webSnippetCount: 0,
          crawlPageCount: 0,
          needsManualReview: false,
          manualReviewLabel: null,
          changes: [],
        })),
    },
    list: {
      useQuery: () => useStaticQuery(false, () => []),
    },
    getById: {
      useQuery: () => useStaticQuery(false, () => null),
    },
  },
};
