
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'wouter';
import { isLocale } from '@/app/i18n';
import { useAdminAssignedProjects } from '@/contexts/AdminAssignedProjectsContext';
import { adminAuthorizedFetch, isAdminAuthenticated, ADMIN_AUTH_CHANGE_EVENT } from '@/lib/adminAuth';
import {
  APP_NAV_BADGES_REFRESH_EVENT,
  companyProjectsSignature,
  devProjectsSignature,
  getAdminCompaniesSeenMax,
  getAdminDevelopersSeenMax,
  getAdminProjectsSeenMax,
  getCompanyProjectsSignatureSeen,
  getDevProjectsSignatureSeen,
} from '@/lib/appNavBadges';
import {
  mapApiCompanySubmission,
  type ApiCompanySubmissionRow,
} from '@/lib/companyAdminContact';
import {
  LEAD_STATUS_CHANGED_EVENT,
} from '@/lib/companyLeadStatus';
import { getCompanyAccessToken } from '@/lib/companyAuth';
import { getDevAccessToken } from '@/lib/devAuth';
import { mapApiProjectRow } from '@/lib/adminProjectsApi';
import type { AssignedProjectRecord } from '@/lib/adminProjectRecord';
import { mapApiDeveloperToProfile, type ApiDeveloperPayload } from '@/lib/devDevelopers';

function pathWithoutLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length >= 1 && isLocale(parts[0])) {
    const rest = parts.slice(1).join('/');
    return rest ? `/${rest}` : '/';
  }
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

type DevProjectRow = { id?: string | null; createdAt?: string | null };

type Ctx = {
  
  devProjectsUnread: boolean;
  
  companyProjectsUnread: boolean;
  
  adminDevelopersUnread: boolean;
  
  adminCompaniesUnread: boolean;
  
  adminProjectsUnread: boolean;
};

const AppNavBadgesContext = createContext<Ctx | null>(null);

export function AppNavBadgesProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const appPath = pathWithoutLocale(location);
  const isAdminSection = appPath.startsWith('/app/admin');
  const isDevSection = appPath.startsWith('/app/dev');
  const isCompanySection = appPath.startsWith('/app/company');

  const { assignedProjects } = useAdminAssignedProjects();
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  const [storageTick, setStorageTick] = useState(0);
  const [devSigCurrent, setDevSigCurrent] = useState<string | null>(null);
  const [companySigCurrent, setCompanySigCurrent] = useState<string | null>(null);
  const [adminDevelopersMaxTs, setAdminDevelopersMaxTs] = useState(0);
  const [adminCompaniesMaxTs, setAdminCompaniesMaxTs] = useState(0);

  useEffect(() => {
    const bump = () => setStorageTick((n) => n + 1);
    window.addEventListener(APP_NAV_BADGES_REFRESH_EVENT, bump);
    return () => {
      window.removeEventListener(APP_NAV_BADGES_REFRESH_EVENT, bump);
    };
  }, []);

  const adminProjectsMaxTs = useMemo(() => {
    if (!assignedProjects.length) return 0;
    return Math.max(
      0,
      ...assignedProjects.map((p) => {
        const t = new Date(p.createdAt).getTime();
        return Number.isFinite(t) ? t : 0;
      }),
    );
  }, [assignedProjects]);

  const adminProjectsLastSeen = useMemo(() => {
    void storageTick;
    return getAdminProjectsSeenMax();
  }, [storageTick]);

  const adminProjectsUnread = isAdminSection && adminProjectsMaxTs > adminProjectsLastSeen;

  useEffect(() => {
    if (!isDevSection || !apiBase) return;
    const token = getDevAccessToken();
    if (!token) return;
    let cancelled = false;
    const load = () => {
      void fetch(`${apiBase}/projects/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<unknown>;
        })
        .then((data) => {
          if (cancelled || !Array.isArray(data)) return;
          const rows = data as DevProjectRow[];
          setDevSigCurrent(devProjectsSignature(rows));
        })
        .catch(() => {
          if (!cancelled) setDevSigCurrent(null);
        });
    };
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(load, 15000);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [apiBase, isDevSection, location]);

  const devProjectsUnread = useMemo(() => {
    if (!isDevSection || devSigCurrent === null) return false;
    void storageTick;
    const lastSeen = getDevProjectsSignatureSeen();
    return devSigCurrent !== '' && devSigCurrent !== lastSeen;
  }, [isDevSection, devSigCurrent, storageTick]);

  useEffect(() => {
    if (!isCompanySection || !apiBase) return;
    const token = getCompanyAccessToken();
    if (!token) return;
    let cancelled = false;
    const load = () => {
      void fetch(`${apiBase}/contact/company-submissions/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<{ id?: string } | null>;
        })
        .then((row) => {
          if (cancelled || !row?.id) {
            if (!cancelled) setCompanySigCurrent('');
            return;
          }
          const cid = row.id.trim();
          return fetch(`${apiBase}/projects`)
            .then((res) => {
              if (!res.ok) throw new Error(String(res.status));
              return res.json() as Promise<unknown>;
            })
            .then((rows) => {
              if (cancelled || !Array.isArray(rows)) return;
              const mapped = rows
                .map((r) => mapApiProjectRow(r))
                .filter((x): x is AssignedProjectRecord => x != null)
                .filter((p) => p.contactId.trim() === cid);
              if (!cancelled) setCompanySigCurrent(companyProjectsSignature(mapped));
            });
        })
        .catch(() => {
          if (!cancelled) setCompanySigCurrent(null);
        });
    };
    load();
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, [apiBase, isCompanySection, location]);

  const companyProjectsUnread = useMemo(() => {
    if (!isCompanySection || companySigCurrent === null) return false;
    void storageTick;
    const lastSeen = getCompanyProjectsSignatureSeen();
    return companySigCurrent !== '' && companySigCurrent !== lastSeen;
  }, [isCompanySection, companySigCurrent, storageTick]);

  const refreshAdminNav = useCallback(() => {
    if (!apiBase || !isAdminAuthenticated()) {
      setAdminDevelopersMaxTs(0);
      setAdminCompaniesMaxTs(0);
      return;
    }
    void Promise.all([
      adminAuthorizedFetch(`${apiBase}/users/developers`).then((res) => {
        if (!res?.ok) throw new Error(String(res?.status ?? 'no-auth'));
        return res.json() as Promise<unknown>;
      }),
      adminAuthorizedFetch(`${apiBase}/contact/company-submissions`).then((res) => {
        if (!res?.ok) throw new Error(String(res?.status ?? 'no-auth'));
        return res.json() as Promise<unknown>;
      }),
    ])
      .then(([developersData, companiesData]) => {
        const developersMax = Array.isArray(developersData)
          ? Math.max(
              0,
              ...developersData.map((row) => {
                const d = mapApiDeveloperToProfile(row as ApiDeveloperPayload);
                return Number.isFinite(d.createdAtMs) ? d.createdAtMs : 0;
              }),
            )
          : 0;
        const companiesMax = Array.isArray(companiesData)
          ? Math.max(
              0,
              ...companiesData.map((row) => {
                const c = mapApiCompanySubmission(row as ApiCompanySubmissionRow);
                return Number.isFinite(c.createdAtMs) ? c.createdAtMs : 0;
              }),
            )
          : 0;
        setAdminDevelopersMaxTs(developersMax);
        setAdminCompaniesMaxTs(companiesMax);
      })
      .catch(() => {
        setAdminDevelopersMaxTs(0);
        setAdminCompaniesMaxTs(0);
      });
  }, [apiBase]);

  useEffect(() => {
    if (!isAdminSection) return;
    refreshAdminNav();
    const onLead = () => refreshAdminNav();
    const onAuth = () => refreshAdminNav();
    window.addEventListener(LEAD_STATUS_CHANGED_EVENT, onLead);
    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, onAuth);
    const timer = window.setInterval(refreshAdminNav, 60000);
    return () => {
      window.removeEventListener(LEAD_STATUS_CHANGED_EVENT, onLead);
      window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, onAuth);
      window.clearInterval(timer);
    };
  }, [isAdminSection, refreshAdminNav, location]);

  const adminDevelopersUnread = useMemo(() => {
    if (!isAdminSection) return false;
    void storageTick;
    const seen = getAdminDevelopersSeenMax();
    return adminDevelopersMaxTs > seen;
  }, [isAdminSection, adminDevelopersMaxTs, storageTick]);

  const adminCompaniesUnread = useMemo(() => {
    if (!isAdminSection) return false;
    void storageTick;
    const seen = getAdminCompaniesSeenMax();
    return adminCompaniesMaxTs > seen;
  }, [isAdminSection, adminCompaniesMaxTs, storageTick]);

  const value = useMemo(
    () => ({
      devProjectsUnread,
      companyProjectsUnread,
      adminDevelopersUnread,
      adminCompaniesUnread,
      adminProjectsUnread,
    }),
    [
      devProjectsUnread,
      companyProjectsUnread,
      adminDevelopersUnread,
      adminCompaniesUnread,
      adminProjectsUnread,
    ],
  );

  return <AppNavBadgesContext.Provider value={value}>{children}</AppNavBadgesContext.Provider>;
}

export function useAppNavBadges(): Ctx {
  const ctx = useContext(AppNavBadgesContext);
  if (!ctx) {
    throw new Error('useAppNavBadges must be used within AppNavBadgesProvider');
  }
  return ctx;
}
