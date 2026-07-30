import { useCallback, useMemo, useState } from 'react';

const STORAGE_KEY = 'autosales_active_icp_version_id';

const MOCK_VERSIONS = [
  {
    id: 'icp-mock-1',
    name: 'SaaS B2B Mid-Market MX',
    description:
      'Empresas de software 20–200 empleados en México, con need de staff augmentation o producto a la medida.',
  },
];

export const icpVersionStorageKey = STORAGE_KEY;

/** Stub del hook de autosales: un ICP mock siempre activo. */
export function useActiveIcpVersion() {
  const [activeId, setActiveIdState] = useState(() => {
    if (typeof window === 'undefined') return MOCK_VERSIONS[0]!.id;
    return localStorage.getItem(STORAGE_KEY)?.trim() || MOCK_VERSIONS[0]!.id;
  });

  const setActiveId = useCallback((id: string) => {
    const trimmed = id.trim();
    if (!MOCK_VERSIONS.some((v) => v.id === trimmed)) return;
    setActiveIdState(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, trimmed);
      window.dispatchEvent(
        new CustomEvent('autosales:icp-version-changed', { detail: { id: trimmed } }),
      );
    }
  }, []);

  const active = useMemo(
    () => MOCK_VERSIONS.find((v) => v.id === activeId) ?? MOCK_VERSIONS[0]!,
    [activeId],
  );

  return {
    versions: MOCK_VERSIONS,
    active,
    activeId: active.id,
    isReady: true,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: async () => ({ data: MOCK_VERSIONS }),
    setActiveId,
  };
}
