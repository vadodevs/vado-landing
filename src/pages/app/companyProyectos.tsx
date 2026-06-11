import { useEffect, useState } from 'react';
import {
  BellDot,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Eye,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { getCompanyAccessToken } from '@/lib/companyAuth';
import { mapApiProjectRow } from '@/lib/adminProjectsApi';
import type { AssignedProjectRecord } from '@/lib/adminProjectRecord';
import {
  companyProjectsSignature,
  setCompanyProjectsSignatureSeen,
} from '@/lib/appNavBadges';

type CompanySubmissionMe = {
  id: string;
  firstName: string;
  email: string;
  company: string;
  subject?: string | null;
  message?: string | null;
  createdAt?: string;
};

export default function AppCompanyProyectosPage() {
  const { t, i18n } = useTranslation();
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
  const token = getCompanyAccessToken();
  const canLoadProjects = Boolean(apiBase && token);
  const [submission, setSubmission] = useState<CompanySubmissionMe | null>(null);
  const [assignedProjects, setAssignedProjects] = useState<AssignedProjectRecord[]>([]);
  const [loading, setLoading] = useState(canLoadProjects);
  const [errorKey, setErrorKey] = useState<string | null>(
    canLoadProjects ? null : 'sidebarDemo.companyProjectsAuthError',
  );

  useEffect(() => {
    if (!canLoadProjects || !token) return;
    queueMicrotask(() => {
      setLoading(true);
      setErrorKey(null);
    });
    void fetch(`${apiBase}/contact/company-submissions/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<CompanySubmissionMe | null>;
      })
      .then((row) => {
        setSubmission(row);
        if (!row?.id) {
          setAssignedProjects([]);
          return null;
        }
        return fetch(`${apiBase}/projects`)
          .then((res) => {
            if (!res.ok) throw new Error(String(res.status));
            return res.json() as Promise<unknown>;
          })
          .then((rows) => {
            if (!Array.isArray(rows)) return;
            const mapped = rows
              .map((r) => mapApiProjectRow(r))
              .filter((x): x is AssignedProjectRecord => x != null)
              .filter((p) => p.contactId.trim() === row.id);
            setAssignedProjects(mapped);
          });
      })
      .catch(() => {
        setErrorKey('sidebarDemo.companyProjectsLoadError');
      })
      .finally(() => setLoading(false));
  }, [apiBase, canLoadProjects, token]);

  useEffect(() => {
    if (loading) return;
    setCompanyProjectsSignatureSeen(companyProjectsSignature(assignedProjects));
  }, [loading, assignedProjects]);

  const requestDate = (() => {
    if (!submission?.createdAt) return '—';
    const d = new Date(submission.createdAt);
    return Number.isFinite(d.getTime()) ? d.toLocaleString(i18n.language) : '—';
  })();

  return (
    <AppShell
      pathWithoutLang="/app/company/proyectos"
      title={t('sidebarDemo.navProjects')}
      description={t('seo.appProjects')}
    >
      <section className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold text-foreground">{t('sidebarDemo.navProjects')}</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">{t('sidebarDemo.companyProjectsLoading')}</p>
        ) : errorKey ? (
          <p className="text-sm text-red-700">{t(errorKey)}</p>
        ) : !submission ? (
          <p className="text-sm text-muted-foreground">
            {t('sidebarDemo.companyProjectsNoSubmission')}
          </p>
        ) : (
          <div className="mx-auto grid w-full max-w-3xl gap-4">
            {assignedProjects.length === 0 ? (
              <article className="rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <p className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <BellDot className="size-3.5" />
                  {t('sidebarDemo.companyProjectsPending')}
                </p>
                <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {submission.subject?.trim() || t('sidebarDemo.companyProjectsRequestFallback')}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-300">
                  {t('sidebarDemo.companyProjectsCompanyLabel')}: {submission.company}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                  {t('sidebarDemo.companyProjectsDateLabel')}: {requestDate}
                </p>
                <p className="mt-2 line-clamp-2 text-xs text-zinc-700 dark:text-zinc-200">
                  {submission.message?.trim() || t('sidebarDemo.companyProjectsNoMessage')}
                </p>
                <p className="mt-2 text-xs text-zinc-700 dark:text-zinc-300">
                  {t('sidebarDemo.companyProjectsUnderReview')}
                </p>
                <div className="mt-2.5 rounded-xl border border-zinc-100 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/30">
                  <TrackingProgress t={t} stage={2} projectTitle={null} team={null} compact />
                </div>
              </article>
            ) : (
              assignedProjects.map((project) => (
                <article
                  key={project.id}
                  className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-300">
                    <span className="rounded bg-violet-100 px-2 py-1 dark:bg-violet-900/40">
                      {t('sidebarDemo.companyProjectsActiveProject')}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {t('sidebarDemo.companyProjectsIdLabel')}: {project.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>

                  <h3 className="mt-2 text-xl leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {project.titulo}
                  </h3>
                  <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-300">
                    {project.empresa} · {project.servicio}
                  </p>
                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-200">
                    <ShieldCheck className="size-3.5 text-violet-600" />
                    {t('sidebarDemo.companyProjectsProjectAssigned')}
                  </p>

                  <div className="mt-2.5 rounded-xl border border-zinc-100 bg-zinc-50/70 p-2.5 dark:border-zinc-800 dark:bg-zinc-900/30">
                    <TrackingProgress t={t} stage={3} projectTitle={project.titulo} team={null} compact />
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <div className="flex items-center">
                        {project.prospectos.slice(0, 4).map((p, idx) => (
                          <span
                            key={p.id}
                            className="-ml-2 inline-flex h-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-indigo-500 to-violet-600 px-2.5 text-[10px] font-semibold text-white first:ml-0 dark:border-zinc-950"
                            style={{ zIndex: 10 - idx }}
                          >
                            {firstName(p.nombre)}
                          </span>
                        ))}
                        {project.prospectos.length > 4 ? (
                          <span className="-ml-2 inline-flex size-7 items-center justify-center rounded-full border-2 border-white bg-violet-100 text-[10px] font-semibold text-violet-700 dark:border-zinc-950 dark:bg-violet-900/30 dark:text-violet-300">
                            +{project.prospectos.length - 4}
                          </span>
                        ) : null}
                        <p className="ml-2 text-[11px] text-zinc-700 dark:text-zinc-200">
                          <span className="font-semibold">{project.prospectos.length}</span>{' '}
                          {project.prospectos.length === 1
                            ? t('sidebarDemo.companyProjectsExpertAssignedSingle')
                            : t('sidebarDemo.companyProjectsExpertsAssigned')}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function TrackingProgress({
  t,
  stage,
  projectTitle,
  team,
  compact,
}: {
  t: (key: string) => string;
  stage: 1 | 2 | 3;
  projectTitle: string | null;
  team: string | null;
  compact?: boolean;
}) {
  const steps = [
    { key: 'sent', label: t('sidebarDemo.companyProjectsProgressRequestSent'), icon: ClipboardCheck },
    { key: 'review', label: t('sidebarDemo.companyProjectsProgressUnderRevision'), icon: Eye },
    { key: 'team', label: t('sidebarDemo.companyProjectsProgressTeamAssigned'), icon: Truck },
  ];

  return (
    <div>
      <div className="relative mb-3 grid grid-cols-3">
        <div className="absolute top-3.5 right-6 left-6 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
        <div
          className="absolute top-3.5 left-6 h-1 rounded-full bg-indigo-600 transition-all"
          style={{ width: `calc(${((stage - 1) / (steps.length - 1)) * 100}% - 3rem)` }}
        />
        {steps.map((step, idx) => {
          const done = idx + 1 <= stage;
          const Icon = step.icon;
          return (
            <div key={step.key} className="relative z-10 flex justify-center">
              <span
                className={
                  done
                    ? 'flex size-7 items-center justify-center rounded-full bg-indigo-600 text-white'
                    : 'flex size-7 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }
              >
                {done ? <CheckCircle2 className="size-3.5" /> : <Circle className="size-3.5" />}
              </span>
              <Icon className="sr-only" />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {steps.map((step) => (
          <p key={step.key} className="text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
            {step.label}
          </p>
        ))}
      </div>
      {!compact ? (
        <div className="mt-4 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
          <p>
            {projectTitle
              ? `${t('sidebarDemo.companyProjectsProjectLabel')}: ${projectTitle}`
              : `${t('sidebarDemo.companyProjectsProjectLabel')}: ${t('sidebarDemo.companyProjectsPendingAssignment')}`}
          </p>
          <p>
            {team
              ? `${t('sidebarDemo.companyProjectsTeamLabel')}: ${team}`
              : `${t('sidebarDemo.companyProjectsTeamLabel')}: ${t('sidebarDemo.companyProjectsPendingAssignment')}`}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function firstName(fullName: string): string {
  const clean = fullName.trim();
  if (!clean) return '—';
  const [first] = clean.split(/\s+/);
  return first || clean;
}
