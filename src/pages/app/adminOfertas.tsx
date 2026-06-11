import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlignJustify,
  AlertTriangle,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLocale } from '@/hooks/useLocale';
import { JobOverviewRichEditor } from '@/components/admin/JobOverviewRichEditor';
import { JobOverviewBody } from '@/components/app/JobOfferCreateStylePreview';
import {
  ensureEditorHtml,
  htmlToSearchPlain,
  isOverviewHtmlEmpty,
} from '@/lib/jobOverviewHtml';
import {
  createJobOffer as createAdminJobOffer,
  fetchJobApplicants,
  deleteJobOffer as deleteAdminJobOffer,
  fetchJobOffers as fetchAdminJobOffers,
  setJobOfferStatus as setAdminJobOfferStatus,
  updateJobOffer as updateAdminJobOffer,
  type JobApplicant,
  type JobOfferRecord,
} from '@/lib/adminJobsApi';
import {
  createRecruiterJobOffer,
  deleteRecruiterJobOffer,
  fetchRecruiterJobOffers,
  setRecruiterJobOfferStatus,
  updateRecruiterJobOffer,
} from '@/lib/recruiterJobsApi';
import { ADMIN_FIELD_INPUT_CLASS, ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';

type Draft = Omit<JobOfferRecord, 'id' | 'status' | 'createdAt' | 'applicationsCount' | 'expiresAt'>;

const initialDraft: Draft = {
  titulo: '',
  ubicacion: '',
  industria: '',
  overview: '',
};

type ExpiryBucket = 'activa' | 'por_vencer' | 'expirada';

const EXPIRY_DAYS = 30;
const EXPIRY_SOON_DAYS = 7;
const MS_DAY = 24 * 60 * 60 * 1000;

function expiryEndMs(offer: JobOfferRecord): number {
  const exp = offer.expiresAt?.trim();
  if (exp) {
    const t = Date.parse(exp);
    if (Number.isFinite(t)) return t;
  }
  const createdMs = Date.parse(offer.createdAt);
  if (!Number.isFinite(createdMs)) return Date.now() + EXPIRY_DAYS * MS_DAY;
  return createdMs + EXPIRY_DAYS * MS_DAY;
}

function expiryBucketForOffer(offer: JobOfferRecord): ExpiryBucket {
  const expiresMs = expiryEndMs(offer);
  const msLeft = expiresMs - Date.now();
  if (msLeft <= 0) return 'expirada';
  if (msLeft <= EXPIRY_SOON_DAYS * MS_DAY) return 'por_vencer';
  return 'activa';
}

function toYyyyMmDd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function dateInputToExpiresAtIso(yyyyMmDd: string): string {
  const parts = yyyyMmDd.split('-').map((v) => Number(v));
  const y = parts[0];
  const m = parts[1];
  const d = parts[2];
  if (!y || !m || !d) return '';
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

function searchFold(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export default function AppAdminOfertasPage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [location, setLocation] = useLocation();
  const isRecruiterPortal = location.includes('/app/recruiter/ofertas');
  const portalBase = isRecruiterPortal ? '/app/recruiter' : '/app/admin';
  const ofertasBase = `${portalBase}/ofertas`;
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [offers, setOffers] = useState<JobOfferRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [busyById, setBusyById] = useState<Record<string, boolean>>({});
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'activa' | 'pausada' | 'borrador'>('all');
  const [bucketFilter, setBucketFilter] = useState<'all' | ExpiryBucket>('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<JobOfferRecord | null>(null);
  const [detailTitulo, setDetailTitulo] = useState('');
  const [detailUbicacion, setDetailUbicacion] = useState('');
  const [detailIndustria, setDetailIndustria] = useState('');
  const [detailOverview, setDetailOverview] = useState('');
  const [detailExpiration, setDetailExpiration] = useState('');
  const [createExpiresAt, setCreateExpiresAt] = useState('');
  const [detailApplicants, setDetailApplicants] = useState<JobApplicant[]>([]);
  const [detailBusy, setDetailBusy] = useState(false);
  /** Fuerza remontar el editor Tiptap al reabrir el modal o cambiar de oferta. */
  const [detailEditorSession, setDetailEditorSession] = useState(0);
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  const setDetailExpirationPreset = (mode: 'activa' | 'por_vencer' | 'expirada') => {
    const now = Date.now();
    if (mode === 'expirada') {
      setDetailExpiration(toYyyyMmDd(new Date(now - MS_DAY)));
    } else if (mode === 'por_vencer') {
      setDetailExpiration(toYyyyMmDd(new Date(now + 3 * MS_DAY)));
    } else {
      setDetailExpiration(toYyyyMmDd(new Date(now + EXPIRY_DAYS * MS_DAY)));
    }
  };

  const reloadOffers = useCallback(async (silent = false) => {
    if (!apiBase) {
      setLoadState('done');
      setError('Falta configurar VITE_API_BASE_URL.');
      return;
    }
    if (!silent) {
      setLoadState('loading');
    }
    const rows = isRecruiterPortal
      ? await fetchRecruiterJobOffers(apiBase)
      : await fetchAdminJobOffers(apiBase);
    setOffers(rows);
    if (!silent) {
      setLoadState('done');
    }
  }, [apiBase, isRecruiterPortal]);

  useEffect(() => {
    if (!location.includes(ofertasBase)) return;
    if (location.includes('/candidatos')) return;
    if (location.includes('/crear')) return;
    if (location.includes('/preview/')) return;
    queueMicrotask(() => {
      void reloadOffers(false);
    });
  }, [location, reloadOffers, ofertasBase]);

  useEffect(() => {
    if (!location.includes(ofertasBase)) return;
    if (location.includes('/candidatos') || location.includes('/crear') || location.includes('/preview/')) {
      return;
    }
    let timeoutId: number;
    const scheduleReload = () => {
      if (document.visibilityState !== 'visible') return;
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        void reloadOffers(true);
      }, 400);
    };
    document.addEventListener('visibilitychange', scheduleReload);
    window.addEventListener('focus', scheduleReload);
    return () => {
      document.removeEventListener('visibilitychange', scheduleReload);
      window.removeEventListener('focus', scheduleReload);
      window.clearTimeout(timeoutId);
    };
  }, [location, reloadOffers, ofertasBase]);

  const isCreateRoute = location.endsWith(`${ofertasBase}/crear`);
  const previewMatch = location.match(/\/app\/(?:admin|recruiter)\/ofertas\/preview\/([^/?#]+)/);
  const previewOfferId = previewMatch ? decodeURIComponent(previewMatch[1]) : '';
  const isPreviewRoute = !!previewMatch;
  const isActiveRoute =
    location.endsWith(`${ofertasBase}/activas`) || location.endsWith(ofertasBase);
  const previewOffer = useMemo(
    () => offers.find((o) => o.id === previewOfferId) ?? null,
    [offers, previewOfferId],
  );

  const offersFiltered = useMemo(() => {
    const q = searchFold(search);
    return offers.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (bucketFilter !== 'all' && o.status === 'borrador') {
        return false;
      }
      if (bucketFilter !== 'all') {
        if (expiryBucketForOffer(o) !== bucketFilter) return false;
      }
      if (!q) return true;
      const hay = searchFold(
        [o.titulo, o.ubicacion, o.industria, htmlToSearchPlain(o.overview)].join(' '),
      );
      const tokens = q.split(' ').filter(Boolean);
      return tokens.every((tok) => hay.includes(tok));
    });
  }, [offers, search, statusFilter, bucketFilter]);

  const dashboard = useMemo(() => {
    let activas = 0;
    let porVencer = 0;
    let expiradas = 0;
    for (const o of offers) {
      if (o.status !== 'activa') continue;
      const b = expiryBucketForOffer(o);
      if (b === 'activa') activas += 1;
      if (b === 'por_vencer') porVencer += 1;
      if (b === 'expirada') expiradas += 1;
    }
    return { activas, porVencer, expiradas };
  }, [offers]);

  const canCreate = useMemo(
    () =>
      draft.titulo.trim() !== '' &&
      draft.ubicacion.trim() !== '' &&
      draft.industria.trim() !== '' &&
      !isOverviewHtmlEmpty(draft.overview),
    [draft],
  );

  const createOffer = async () => {
    if (!canCreate) {
      setError('Completa título, ubicación, industria y overview.');
      return;
    }
    if (!apiBase) {
      setError('Falta configurar VITE_API_BASE_URL.');
      return;
    }
    setCreating(true);
    let createExpiresIso: string | null | undefined;
    if (createExpiresAt.trim() !== '') {
      const iso = dateInputToExpiresAtIso(createExpiresAt.trim());
      if (!iso) {
        setError('Fecha de expiración no válida.');
        setCreating(false);
        return;
      }
      createExpiresIso = iso;
    }
    const ok = isRecruiterPortal
      ? await createRecruiterJobOffer(apiBase, {
          titulo: draft.titulo.trim(),
          ubicacion: draft.ubicacion.trim(),
          industria: draft.industria.trim(),
          overview: draft.overview,
          status: 'activa',
          expiresAt: createExpiresIso,
        })
      : await createAdminJobOffer(apiBase, {
          titulo: draft.titulo.trim(),
          ubicacion: draft.ubicacion.trim(),
          industria: draft.industria.trim(),
          overview: draft.overview,
          status: 'activa',
          expiresAt: createExpiresIso,
        });
    setCreating(false);
    if (!ok) {
      setError('No se pudo guardar la oferta en adminvado.');
      return;
    }
    await reloadOffers();
    setDraft(initialDraft);
    setCreateExpiresAt('');
    setError(null);
  };

  const toggleStatus = async (id: string) => {
    if (!apiBase) {
      setError('Falta configurar VITE_API_BASE_URL.');
      return;
    }
    const row = offers.find((x) => x.id === id);
    if (!row) return;
    setBusyById((prev) => ({ ...prev, [id]: true }));
    const nextStatus = row.status === 'activa' ? 'pausada' : 'activa';
    const ok = isRecruiterPortal
      ? await setRecruiterJobOfferStatus(apiBase, id, nextStatus)
      : await setAdminJobOfferStatus(apiBase, id, nextStatus);
    setBusyById((prev) => ({ ...prev, [id]: false }));
    if (!ok) {
      setError('No se pudo actualizar el estado.');
      return;
    }
    await reloadOffers();
  };

  const removeOffer = async (id: string) => {
    if (!apiBase) {
      setError('Falta configurar VITE_API_BASE_URL.');
      return;
    }
    setBusyById((prev) => ({ ...prev, [id]: true }));
    const ok = isRecruiterPortal
      ? await deleteRecruiterJobOffer(apiBase, id)
      : await deleteAdminJobOffer(apiBase, id);
    setBusyById((prev) => ({ ...prev, [id]: false }));
    if (!ok) {
      setError('No se pudo eliminar la oferta.');
      return;
    }
    await reloadOffers();
  };

  const openDetails = async (offer: JobOfferRecord) => {
    setSelectedOffer(offer);
    setDetailTitulo(offer.titulo);
    setDetailUbicacion(offer.ubicacion);
    setDetailIndustria(offer.industria);
    setDetailOverview(ensureEditorHtml(offer.overview));
    setDetailEditorSession((n) => n + 1);
    const end = new Date(expiryEndMs(offer));
    setDetailExpiration(Number.isFinite(end.getTime()) ? toYyyyMmDd(end) : '');
    setDetailOpen(true);
    if (!apiBase) {
      setDetailApplicants([]);
      return;
    }
    const applicants = await fetchJobApplicants(apiBase, offer.id);
    setDetailApplicants(applicants);
  };

  const saveDetails = async () => {
    if (!apiBase || !selectedOffer) return;
    setDetailBusy(true);
    let expiresAtPayload: string | null = null;
    if (detailExpiration.trim() !== '') {
      const iso = dateInputToExpiresAtIso(detailExpiration.trim());
      if (!iso) {
        setError('Fecha de expiración no válida.');
        setDetailBusy(false);
        return;
      }
      expiresAtPayload = iso;
    }
    const ok = isRecruiterPortal
      ? await updateRecruiterJobOffer(apiBase, selectedOffer.id, {
          titulo: detailTitulo.trim(),
          overview: detailOverview,
          ubicacion: detailUbicacion.trim(),
          industria: detailIndustria.trim(),
          expiresAt: expiresAtPayload,
        })
      : await updateAdminJobOffer(apiBase, selectedOffer.id, {
          titulo: detailTitulo.trim(),
          overview: detailOverview,
          ubicacion: detailUbicacion.trim(),
          industria: detailIndustria.trim(),
          expiresAt: expiresAtPayload,
        });
    setDetailBusy(false);
    if (!ok) {
      setError(
        'No se pudo guardar. Nota: en adminvado algunas ofertas publicadas solo permiten cambio de estado.',
      );
      return;
    }
    await reloadOffers();
    setDetailOpen(false);
  };

  return (
    <AppShell
      pathWithoutLang={
        isCreateRoute
          ? `${ofertasBase}/crear`
          : isPreviewRoute
            ? `${ofertasBase}/preview/${previewOfferId}`
            : `${ofertasBase}/activas`
      }
      title={t('sidebarDemo.navJobs')}
      description={t('seo.appAdminJobs')}
    >
      <section className="scroll-mt-24 space-y-4">
        {isPreviewRoute ? (
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Vista previa</h2>
              <div className="flex flex-wrap items-center gap-2">
                {previewOffer ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-xl"
                    title="Editar oferta"
                    aria-label="Editar oferta"
                    onClick={() => void openDetails(previewOffer)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation(location.replace(/\/preview\/[^/]+$/, '/activas'))}
                >
                  Volver a ofertas activas
                </Button>
              </div>
            </div>
            {!previewOffer ? (
              <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
                No encontramos la oferta para vista previa.
              </p>
            ) : (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
                <h1 className="text-3xl font-black tracking-tight text-[#0f172a] dark:text-white">
                  {previewOffer.titulo || 'LLM Engineer (AI Engineer)'}
                </h1>
                <div className="mt-8 flex flex-col gap-8 lg:flex-row">
                  <aside className="w-full lg:w-[220px]">
                    <div>
                      <h5 className="text-[18px] font-bold text-[#262835] dark:text-zinc-100">Location</h5>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                        {previewOffer.ubicacion.trim() || 'Mexico / Remote'}
                      </p>
                    </div>
                    <div className="my-5 h-px bg-zinc-200 dark:bg-zinc-700" />
                    <div>
                      <h5 className="text-[18px] font-bold text-[#262835] dark:text-zinc-100">Industry</h5>
                      <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                        {previewOffer.industria.trim() || 'Data and Analytics'}
                      </p>
                    </div>
                  </aside>
                  <section className="min-w-0 flex-1">
                    <div className="border-b border-zinc-200 pb-3 text-[18px] font-bold text-[#262835] dark:border-zinc-700 dark:text-zinc-100">
                      Overview
                    </div>
                    <div className="pt-5">
                      <JobOverviewBody
                        overview={ensureEditorHtml(previewOffer.overview)}
                        emptyMessage="Sin contenido."
                      />
                    </div>
                  </section>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {!isPreviewRoute ? (
        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="min-w-0">
            <h2 className="text-4xl font-black tracking-tight text-[#0f172a] dark:text-white">
              {t('sidebarDemo.navJobs')}
            </h2>
            {isActiveRoute ? (
              <>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Gestiona tus procesos de selección activos y finalizados.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('activa');
                      setBucketFilter('all');
                    }}
                    className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-emerald-50/85 hover:shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/25 dark:hover:bg-emerald-950/35"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                        Ofertas activas
                      </p>
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-emerald-100/85 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <CheckCircle2 className="size-4" />
                      </span>
                    </div>
                    <p className="mt-2 text-5xl font-black leading-none text-zinc-900 dark:text-zinc-100">{dashboard.activas}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('activa');
                      setBucketFilter('por_vencer');
                    }}
                    className="rounded-2xl border border-amber-200/70 bg-amber-50/70 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-amber-50/85 hover:shadow-sm dark:border-amber-900/60 dark:bg-amber-950/25 dark:hover:bg-amber-950/35"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                        Por vencer
                      </p>
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-amber-100/85 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        <AlertTriangle className="size-4" />
                      </span>
                    </div>
                    <p className="mt-2 text-5xl font-black leading-none text-zinc-900 dark:text-zinc-100">{dashboard.porVencer}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('activa');
                      setBucketFilter('expirada');
                    }}
                    className="rounded-2xl border border-rose-200/70 bg-rose-50/70 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-rose-50/85 hover:shadow-sm dark:border-rose-900/60 dark:bg-rose-950/25 dark:hover:bg-rose-950/35"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                        Expiradas
                      </p>
                      <span className="inline-flex size-8 items-center justify-center rounded-full bg-rose-100/85 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                        <XCircle className="size-4" />
                      </span>
                    </div>
                    <p className="mt-2 text-5xl font-black leading-none text-zinc-900 dark:text-zinc-100">{dashboard.expiradas}</p>
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <BriefcaseBusiness className="size-4" />
                Crea una oferta laboral y publícala en el sistema.
              </div>
            )}
          </div>
        </div>
        ) : null}

        {isCreateRoute && !isPreviewRoute ? (
          <div
            className="scroll-mt-24 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <h3 className="text-base font-semibold text-foreground">Crear oferta laboral (formato job post)</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input
                value={draft.titulo}
                onChange={(e) => setDraft((p) => ({ ...p, titulo: e.target.value }))}
                placeholder="Título (ej. LLM Engineer (AI Engineer))"
                className={ADMIN_FIELD_INPUT_CLASS}
              />
              <input
                value={draft.ubicacion}
                onChange={(e) => setDraft((p) => ({ ...p, ubicacion: e.target.value }))}
                placeholder="Ubicación (ej. Mexico / Remote)"
                className={ADMIN_FIELD_INPUT_CLASS}
              />
              <input
                value={draft.industria}
                onChange={(e) => setDraft((p) => ({ ...p, industria: e.target.value }))}
                placeholder="Industria (ej. Data and Analytics)"
                className={ADMIN_FIELD_INPUT_CLASS}
              />
              <div className="md:col-span-2">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Overview</span>
                <div className="mt-1">
                  <JobOverviewRichEditor
                    id="crear-oferta"
                    value={draft.overview || '<p></p>'}
                    onChange={(html) => setDraft((p) => ({ ...p, overview: html }))}
                    placeholder="Describe el puesto, responsabilidades, requisitos…"
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm sm:max-w-xs">
                <span className="text-zinc-600 dark:text-zinc-400">Fecha de expiración (opcional)</span>
                <input
                  type="date"
                  value={createExpiresAt}
                  onChange={(e) => setCreateExpiresAt(e.target.value)}
                  className={ADMIN_FIELD_INPUT_CLASS}
                />
              </label>
              <div className="flex flex-1 flex-wrap items-center gap-2 sm:flex-none">
                <Button
                  type="button"
                  onClick={() => void createOffer()}
                  disabled={creating}
                  className={ADMIN_PRIMARY_BTN_CLASS}
                >
                  <Plus className="size-4" />
                  {creating ? 'Guardando...' : 'Publicar oferta'}
                </Button>
                {error ? <p className="text-sm text-red-700 dark:text-red-400">{error}</p> : null}
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
              <h4 className="mb-3 text-sm font-semibold text-zinc-700 uppercase dark:text-zinc-300">Vista previa</h4>
              <h1 className="text-3xl font-black tracking-tight text-[#0f172a] dark:text-white">
                {draft.titulo.trim() || 'LLM Engineer (AI Engineer)'}
              </h1>
              <div className="mt-8 flex flex-col gap-8 lg:flex-row">
                <aside className="w-full lg:w-[220px]">
                  <div>
                    <h5 className="text-[18px] font-bold text-[#262835] dark:text-zinc-100">Location</h5>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {draft.ubicacion.trim() || 'Mexico / Remote'}
                    </p>
                  </div>
                  <div className="my-5 h-px bg-zinc-200 dark:bg-zinc-700" />
                  <div>
                    <h5 className="text-[18px] font-bold text-[#262835] dark:text-zinc-100">Industry</h5>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
                      {draft.industria.trim() || 'Data and Analytics'}
                    </p>
                  </div>
                </aside>

                <section className="min-w-0 flex-1">
                  <div className="border-b border-zinc-200 pb-3 text-[18px] font-bold text-[#262835] dark:border-zinc-700 dark:text-zinc-100">
                    Overview
                  </div>
                  <div className="pt-5">
                    <JobOverviewBody
                      overview={ensureEditorHtml(draft.overview)}
                      emptyMessage="Sin contenido."
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : null}

        {isActiveRoute && !isPreviewRoute ? (
          <div className="scroll-mt-24 space-y-3">
          <div className="rounded-2xl border border-zinc-100 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
              <label className="flex h-11 min-w-[320px] flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 dark:border-zinc-700 dark:bg-zinc-900/70">
                <Search className="size-4 text-zinc-500 dark:text-zinc-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por cargo o tecnología..."
                  className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
              </label>
              <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200">
                <span className="text-zinc-500 dark:text-zinc-400">Estado:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="bg-transparent pr-4 outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="activa">Activa (publicada)</option>
                  <option value="pausada">Pausada</option>
                  <option value="borrador">Borrador</option>
                </select>
              </label>
              <label className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200">
                <CalendarDays className="size-4 text-zinc-500 dark:text-zinc-400" />
                <select
                  value={bucketFilter}
                  onChange={(e) => setBucketFilter(e.target.value as typeof bucketFilter)}
                  className="bg-transparent pr-4 outline-none"
                >
                  <option value="all">Vencimiento</option>
                  <option value="activa">Activa</option>
                  <option value="por_vencer">Por vencer</option>
                  <option value="expirada">Expirada</option>
                </select>
              </label>
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-11 rounded-xl"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                    setBucketFilter('all');
                  }}
                >
                  Limpiar
                </Button>
                <div className="inline-flex h-11 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    title="Vista lista"
                    aria-label="Vista lista"
                    className={`inline-flex items-center justify-center px-3 ${
                      viewMode === 'list'
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        : 'bg-white text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400'
                    }`}
                  >
                    <AlignJustify className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    title="Vista cards"
                    aria-label="Vista cards"
                    className={`inline-flex items-center justify-center border-l border-zinc-200 px-3 dark:border-zinc-700 ${
                      viewMode === 'cards'
                        ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                        : 'bg-white text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400'
                    }`}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          {loadState === 'loading' ? (
            <p className="mt-3 text-sm text-muted-foreground">Cargando ofertas desde adminvado...</p>
          ) : null}
          {offersFiltered.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              {loadState === 'loading'
                ? ' '
                : 'No hay ofertas que coincidan con los filtros.'}
            </p>
          ) : (
            <div className={viewMode === 'cards' ? 'grid gap-3 md:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
              {offersFiltered.map((offer) => {
                const bucket = expiryBucketForOffer(offer);
                const bucketLabel = bucket === 'por_vencer' ? 'Por vencer' : bucket === 'expirada' ? 'Expirada' : 'Activa';
                const bucketDotClass = bucket === 'por_vencer' ? 'bg-amber-500' : bucket === 'expirada' ? 'bg-rose-500' : 'bg-emerald-500';
                const bucketPillClass =
                  bucket === 'por_vencer'
                    ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-200/80 dark:bg-amber-950/45 dark:text-amber-200 dark:ring-amber-800/40'
                    : bucket === 'expirada'
                      ? 'bg-rose-100 text-rose-800 ring-1 ring-rose-200/80 dark:bg-rose-950/45 dark:text-rose-200 dark:ring-rose-800/40'
                      : 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80 dark:bg-emerald-950/45 dark:text-emerald-200 dark:ring-emerald-800/40';

                const administrarMenu = (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" size="sm" variant="outline" className="shrink-0 rounded-xl">
                        Administrar
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={!!busyById[offer.id]}
                        onClick={() => void toggleStatus(offer.id)}
                      >
                        {offer.status === 'activa' ? 'Pausar' : 'Publicar o activar'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          setLocation(path(`${ofertasBase}/preview/${encodeURIComponent(offer.id)}`))
                        }
                      >
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!!busyById[offer.id]}
                        onClick={() => void removeOffer(offer.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                );

                return (
                  <article
                    key={offer.id}
                    className={`border border-zinc-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${
                      viewMode === 'cards' ? 'flex h-fit flex-col rounded-3xl p-4' : 'relative rounded-2xl px-4 py-3'
                    }`}
                  >
                    {viewMode === 'cards' ? (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${bucketPillClass}`}>
                              <span className={`size-2 rounded-full ${bucketDotClass}`} />
                              {bucketLabel}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 truncate text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                          {offer.titulo}
                        </p>
                        <div className="mt-2 max-h-40 overflow-y-auto pr-0.5 text-left text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
                          <JobOverviewBody
                            overview={ensureEditorHtml(offer.overview)}
                            emptyMessage="—"
                          />
                        </div>
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          {offer.ubicacion} · {offer.industria}
                        </p>
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={() =>
                              setLocation(
                                path(
                                  `${ofertasBase}/${encodeURIComponent(offer.id)}/candidatos`,
                                ),
                              )
                            }
                            className="inline-flex h-11 min-w-[2.75rem] max-w-[9rem] items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-100 px-3 text-base font-bold tabular-nums text-sky-800 shadow-sm transition hover:bg-sky-200/80 hover:ring-2 hover:ring-sky-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100 dark:hover:bg-sky-900/60 dark:hover:ring-sky-500/30"
                            title="Ver postulantes"
                            aria-label={`${offer.applicationsCount} postulantes, ver lista`}
                          >
                            <Users className="size-4" />
                            {offer.applicationsCount}
                          </button>
                          {administrarMenu}
                        </div>
                      </>
                    ) : (
                      <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-base font-semibold text-zinc-900 dark:text-zinc-100">{offer.titulo}</p>
                          <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {offer.ubicacion} · {offer.industria}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 md:justify-end">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${bucketPillClass}`}>
                            <span className={`size-2 rounded-full ${bucketDotClass}`} />
                            {bucketLabel}
                          </span>
                        </div>
                        <div className="md:justify-self-end">
                          <button
                            type="button"
                            onClick={() =>
                              setLocation(
                                path(
                                  `${ofertasBase}/${encodeURIComponent(offer.id)}/candidatos`,
                                ),
                              )
                            }
                            className="inline-flex h-10 min-w-[2.5rem] max-w-[9rem] items-center justify-center gap-1.5 rounded-xl border border-sky-200 bg-sky-100 px-3 text-sm font-bold tabular-nums text-sky-800 shadow-sm transition hover:bg-sky-200/80 hover:ring-2 hover:ring-sky-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100 dark:hover:bg-sky-900/60 dark:hover:ring-sky-500/30"
                            title="Ver postulantes"
                            aria-label={`${offer.applicationsCount} postulantes, ver lista`}
                          >
                            <Users className="size-4" />
                            {offer.applicationsCount}
                          </button>
                        </div>
                        <div className="md:justify-self-end">{administrarMenu}</div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
          </div>
        ) : null}
      </section>
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle de oferta</DialogTitle>
          </DialogHeader>
          {selectedOffer ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-1">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Nombre</span>
                  <input
                    value={detailTitulo}
                    onChange={(e) => setDetailTitulo(e.target.value)}
                    className={ADMIN_FIELD_INPUT_CLASS}
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Ubicación</span>
                    <input
                      value={detailUbicacion}
                      onChange={(e) => setDetailUbicacion(e.target.value)}
                      placeholder="Ej. Mexico / Remote"
                      className={ADMIN_FIELD_INPUT_CLASS}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">Industria</span>
                    <input
                      value={detailIndustria}
                      onChange={(e) => setDetailIndustria(e.target.value)}
                      placeholder="Ej. Data and Analytics"
                      className={ADMIN_FIELD_INPUT_CLASS}
                    />
                  </label>
                </div>
              </div>
              <div>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Overview</span>
                <div className="mt-1">
                  <JobOverviewRichEditor
                    key={`${selectedOffer.id}-${detailEditorSession}`}
                    id={selectedOffer.id}
                    value={detailOverview || '<p></p>'}
                    onChange={setDetailOverview}
                    placeholder="Describe el puesto, responsabilidades, requisitos…"
                  />
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700 dark:bg-zinc-900/30">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                  Aplicaciones ({detailApplicants.length})
                </p>
                {detailApplicants.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Sin aplicaciones registradas.</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {detailApplicants.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-lg bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-900/60"
                      >
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{a.nombre}</p>
                        <p className="text-zinc-600 dark:text-zinc-400">{a.email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-900/40">
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Acciones de publicación</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Ajusta la vigencia. Si dejas la fecha vacía, se calcula a partir de la fecha de creación (
                  {EXPIRY_DAYS} días).
                </p>
                <label className="mt-3 flex max-w-sm flex-col gap-1 text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">Fecha de expiración</span>
                  <input
                    type="date"
                    value={detailExpiration}
                    onChange={(e) => setDetailExpiration(e.target.value)}
                    className={ADMIN_FIELD_INPUT_CLASS}
                  />
                </label>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    onClick={() => setDetailExpirationPreset('activa')}
                  >
                    Activa
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/60"
                    onClick={() => setDetailExpirationPreset('por_vencer')}
                  >
                    Por vencer
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-lg border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
                    onClick={() => setDetailExpirationPreset('expirada')}
                  >
                    Expirada
                  </Button>
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium">Activa</span> y <span className="font-medium">Por vencer</span> fijan
                  fechas con margen. <span className="font-medium">Expirada</span> fija un vencimiento en el pasado.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>
                  Cerrar
                </Button>
                <Button type="button" onClick={() => void saveDetails()} disabled={detailBusy} className={ADMIN_PRIMARY_BTN_CLASS}>
                  {detailBusy ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
