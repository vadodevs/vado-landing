/* eslint-disable react-refresh/only-export-components -- hook and type re-exports share module with Provider */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { type AssignedProjectRecord } from '@/lib/adminProjectRecord';
import {
  deleteRemoteProjectsByContactId,
  fetchRemoteProjects,
  upsertRemoteProject,
} from '@/lib/adminProjectsApi';

export type { AssignedProjectRecord } from '@/lib/adminProjectRecord';

export type ProjectsLoadState = 'idle' | 'loading' | 'done';

const projectsRemoteEnabled =
  typeof import.meta.env.VITE_API_BASE_URL === 'string' &&
  import.meta.env.VITE_API_BASE_URL.trim() !== '';

type Ctx = {
  assignedProjects: AssignedProjectRecord[];
  projectsLoad: ProjectsLoadState;
  /** `true` si `VITE_API_BASE_URL` está definido (la lista intenta salir solo de GET /projects). */
  projectsRemoteEnabled: boolean;
  /** Último GET /projects falló o respondió inválido. Solo aplica con `projectsRemoteEnabled`. */
  projectsRemoteFetchFailed: boolean;
  refreshProjects: () => Promise<void>;
  addAssignedProject: (input: Omit<AssignedProjectRecord, 'id' | 'createdAt'>) => void;
  removeAssignedProjectByContactId: (contactId: string) => Promise<void>;
};

const AdminAssignedProjectsContext = createContext<Ctx | null>(null);

export function AdminAssignedProjectsProvider({ children }: { children: ReactNode }) {
  const [assignedProjects, setAssignedProjects] = useState<AssignedProjectRecord[]>([]);
  const [projectsLoad, setProjectsLoad] = useState<ProjectsLoadState>('loading');
  const [projectsRemoteFetchFailed, setProjectsRemoteFetchFailed] = useState(false);

  const refreshProjects = useCallback(async () => {
    if (!projectsRemoteEnabled) {
      setAssignedProjects([]);
      setProjectsRemoteFetchFailed(false);
      setProjectsLoad('done');
      return;
    }
    const base = import.meta.env.VITE_API_BASE_URL as string;
    setProjectsLoad('loading');
    const { ok, projects } = await fetchRemoteProjects(base);
    setAssignedProjects(ok ? projects : []);
    setProjectsRemoteFetchFailed(!ok);
    setProjectsLoad('done');
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshProjects();
    });
  }, [refreshProjects]);

  const addAssignedProject = useCallback((input: Omit<AssignedProjectRecord, 'id' | 'createdAt'>) => {
    if (!projectsRemoteEnabled) return;

    const base = import.meta.env.VITE_API_BASE_URL as string;
    void (async () => {
      const { ok: listOk, projects: current } = await fetchRemoteProjects(base);
      if (!listOk) {
        setProjectsRemoteFetchFailed(true);
        return;
      }
      const existing = current.find((p) => p.contactId.trim() === input.contactId.trim());
      const record: AssignedProjectRecord = {
        ...input,
        id: existing?.id ?? `ap-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        /** Siempre la hora del guardado: la deduplicación por contactId elige la fila más reciente. */
        createdAt: new Date().toISOString(),
      };
      const saved = await upsertRemoteProject(base, record, Boolean(existing));
      if (!saved) {
        setProjectsRemoteFetchFailed(true);
        return;
      }
      const { ok, projects } = await fetchRemoteProjects(base);
      if (ok) {
        setAssignedProjects(projects);
        setProjectsRemoteFetchFailed(false);
      } else {
        setProjectsRemoteFetchFailed(true);
      }
    })();
  }, []);

  const removeAssignedProjectByContactId = useCallback(async (contactId: string) => {
    if (!projectsRemoteEnabled) return;
    const cid = contactId.trim();
    if (!cid) return;
    const base = import.meta.env.VITE_API_BASE_URL as string;
    const ok = await deleteRemoteProjectsByContactId(base, cid);
    if (!ok) {
      setProjectsRemoteFetchFailed(true);
      return;
    }
    await refreshProjects();
  }, [refreshProjects]);

  const value = useMemo(
    () => ({
      assignedProjects,
      projectsLoad,
      projectsRemoteEnabled,
      projectsRemoteFetchFailed,
      refreshProjects,
      addAssignedProject,
      removeAssignedProjectByContactId,
    }),
    [
      assignedProjects,
      projectsLoad,
      projectsRemoteFetchFailed,
      refreshProjects,
      addAssignedProject,
      removeAssignedProjectByContactId,
    ],
  );

  return (
    <AdminAssignedProjectsContext.Provider value={value}>
      {children}
    </AdminAssignedProjectsContext.Provider>
  );
}

export function useAdminAssignedProjects() {
  const ctx = useContext(AdminAssignedProjectsContext);
  if (!ctx) {
    throw new Error('useAdminAssignedProjects must be used within AdminAssignedProjectsProvider');
  }
  return ctx;
}
