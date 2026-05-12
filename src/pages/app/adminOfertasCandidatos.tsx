import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BriefcaseBusiness, Eye, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import {
  fetchJobApplicants,
  fetchJobOffers as fetchAdminJobOffers,
  updateJobApplicantStatus,
  type JobApplicant,
  type JobOfferRecord,
} from '@/lib/adminJobsApi';
import { fetchRecruiterJobOffers } from '@/lib/recruiterJobsApi';
import { ADMIN_ROW_ACTION_ICON_BUTTON_CLASS } from '@/lib/adminTableActionsUi';

function formatAppliedAt(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  return new Date(t).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function applicantStage(statusRaw: string): { label: string; className: string } {
  const s = statusRaw.trim().toLowerCase();
  if (s === 'short listed') {
    return {
      label: 'Vista',
      className:
        'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-200',
    };
  }
  if (s === 'accepted') {
    return {
      label: 'Finalista',
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200',
    };
  }
  if (s === 'verified' || s === 'tps requested' || s === 'client proposed') {
    return {
      label: 'Vista',
      className:
        'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-200',
    };
  }
  if (s === 'rejected' || s === 'mismatched' || s === 'withdrawn') {
    return {
      label: 'No seleccionado',
      className:
        'border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300',
    };
  }
  return {
    label: 'Sin actualización',
    className:
      'border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300',
  };
}

function selectableStatusFromRaw(statusRaw: string): '' | 'Short Listed' | 'Accepted' | 'Rejected' {
  const s = statusRaw.trim().toLowerCase();
  if (s === 'short listed') return 'Short Listed';
  if (s === 'accepted') return 'Accepted';
  if (s === 'rejected' || s === 'mismatched' || s === 'withdrawn') return 'Rejected';
  return '';
}

export default function AppAdminOfertasCandidatosPage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [location, setLocation] = useLocation();

  const portalBase = location.includes('/app/recruiter/ofertas') ? '/app/recruiter' : '/app/admin';
  const ofertasBase = `${portalBase}/ofertas`;

  const jobId = useMemo(() => {
    const m = /\/app\/(?:admin|recruiter)\/ofertas\/([^/]+)\/candidatos/.exec(location);
    return m ? decodeURIComponent(m[1]) : '';
  }, [location]);

  const [offer, setOffer] = useState<JobOfferRecord | null>(null);
  const [applicants, setApplicants] = useState<JobApplicant[]>([]);
  const [updatingByApplicantId, setUpdatingByApplicantId] = useState<Record<string, boolean>>({});
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  useEffect(() => {
    if (!jobId) {
      setLoadState('done');
      setError('Oferta no válida.');
      return;
    }
    if (!apiBase) {
      setLoadState('done');
      setError('Falta configurar VITE_API_BASE_URL.');
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadState('loading');
      setError(null);
      try {
        const [rows, apps] = await Promise.all([
          portalBase === '/app/recruiter'
            ? fetchRecruiterJobOffers(apiBase)
            : fetchAdminJobOffers(apiBase),
          fetchJobApplicants(apiBase, jobId),
        ]);
        if (cancelled) return;
        const found = rows.find((o) => o.id === jobId) ?? null;
        setOffer(found);
        setApplicants(apps);
        if (!found) {
          setError('No encontramos esa oferta. Puede haber sido eliminada o no tienes acceso.');
        }
      } catch {
        if (!cancelled) {
          setError('No se pudo cargar el listado. Comprueba la API y vuelve a intentar.');
        }
      } finally {
        if (!cancelled) setLoadState('done');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, jobId, portalBase]);

  const backToActive = () => setLocation(path(`${ofertasBase}/activas`));
  const goPreview = () => {
    if (!jobId) return;
    setLocation(path(`${ofertasBase}/preview/${encodeURIComponent(jobId)}`));
  };
  const goApplicantProfile = (applicantId: string) => {
    if (!jobId) return;
    setLocation(
      path(
        `${ofertasBase}/${encodeURIComponent(jobId)}/candidatos/${encodeURIComponent(applicantId)}`,
      ),
    );
  };
  const onChangeApplicantStage = async (
    applicantId: string,
    nextStatus: 'Short Listed' | 'Accepted' | 'Rejected',
  ) => {
    if (!apiBase) {
      setError('Falta configurar VITE_API_BASE_URL.');
      return;
    }
    setUpdatingByApplicantId((prev) => ({ ...prev, [applicantId]: true }));
    const row = applicants.find((a) => a.id === applicantId);
    if (!row?.jobId || !row?.userId) {
      setError('No se encontró el candidato completo para actualizar su estado.');
      setUpdatingByApplicantId((prev) => ({ ...prev, [applicantId]: false }));
      return;
    }
    const ok = await updateJobApplicantStatus(apiBase, applicantId, row.jobId, row.userId, nextStatus);
    if (!ok) {
      setError('No se pudo actualizar el estado del candidato.');
      setUpdatingByApplicantId((prev) => ({ ...prev, [applicantId]: false }));
      return;
    }
    setApplicants((prev) => prev.map((a) => (a.id === applicantId ? { ...a, status: nextStatus } : a)));
    setUpdatingByApplicantId((prev) => ({ ...prev, [applicantId]: false }));
  };

  return (
    <AppShell
      pathWithoutLang={`${ofertasBase}/${jobId}/candidatos`}
      title={t('sidebarDemo.navJobs')}
      description={t('seo.appAdminJobs')}
    >
      <section className="scroll-mt-24 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={backToActive}>
              <ArrowLeft className="size-4" />
              Volver a ofertas
            </Button>
            {offer ? (
              <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={goPreview}>
                <BriefcaseBusiness className="size-4" />
                Vista previa
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                Postulantes
              </h1>
              {offer ? (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {offer.titulo}
                  <span className="text-zinc-400"> · {offer.ubicacion}</span>
                </p>
              ) : loadState === 'loading' ? (
                <p className="mt-1 text-sm text-muted-foreground">Cargando oferta…</p>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">Oferta</p>
              )}
            </div>
            {offer ? (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100">
                <Users className="size-4 shrink-0" />
                <span className="text-sm font-semibold tabular-nums">
                  {applicants.length} postulación{applicants.length === 1 ? '' : 'es'}
                </span>
              </div>
            ) : null}
          </div>

          {loadState === 'loading' ? (
            <p className="mt-6 text-sm text-muted-foreground">Cargando postulantes…</p>
          ) : null}

          {error ? (
            <p className="mt-6 text-sm text-red-700 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {!error && offer && loadState === 'done' ? (
            <>
              {applicants.length === 0 ? (
                <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">Sin postulantes registrados para esta oferta.</p>
              ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead className="border-b border-zinc-200 bg-zinc-50/80 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <tr>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Correo</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Seguimiento</th>
                        <th className="px-4 py-3">Actualizar</th>
                        <th className="px-4 py-3 text-center font-semibold uppercase tracking-[0.12em]">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {applicants.map((a) => {
                        const stage = applicantStage(a.status);
                        return (
                        <tr key={a.id} className="bg-white dark:bg-zinc-950">
                          <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {a.nombre}
                          </td>
                          <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                            {a.email}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                            {stage.label}
                          </td>
                          <td className="px-4 py-3 text-zinc-600 tabular-nums dark:text-zinc-400">
                            {formatAppliedAt(a.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${stage.className}`}>
                              {stage.label}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={selectableStatusFromRaw(a.status)}
                              disabled={!!updatingByApplicantId[a.id]}
                              onChange={(e) =>
                                e.target.value
                                  ? void onChangeApplicantStage(
                                      a.id,
                                      e.target.value as 'Short Listed' | 'Accepted' | 'Rejected',
                                    )
                                  : undefined
                              }
                              className="h-8 rounded-lg border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700 outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                            >
                              <option value="">Sin actualización</option>
                              <option value="Short Listed">Vista</option>
                              <option value="Accepted">Finalista</option>
                              <option value="Rejected">No seleccionado</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
                              title="Ver perfil"
                              aria-label={`Ver perfil de ${a.nombre}`}
                              onClick={() => goApplicantProfile(a.id)}
                            >
                              <Eye className="size-4" strokeWidth={1.5} aria-hidden />
                            </Button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
