import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, FileText, Mail, Phone, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { fetchJobApplicants, fetchJobOffers as fetchAdminJobOffers, type JobApplicant, type JobOfferRecord } from '@/lib/adminJobsApi';
import { fetchRecruiterJobOffers } from '@/lib/recruiterJobsApi';
import { mapApiDeveloperToProfile, type ApiDeveloperPayload } from '@/lib/devDevelopers';

function normalizeEmail(s: string): string {
  return s.trim().toLowerCase();
}

function formatAppliedAt(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '—';
  return new Date(t).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function AppAdminOfertasCandidatoPerfilPage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [location, setLocation] = useLocation();

  const portalBase = location.includes('/app/recruiter/ofertas') ? '/app/recruiter' : '/app/admin';
  const ofertasBase = `${portalBase}/ofertas`;

  const routeMatch = useMemo(() => {
    const m = /\/app\/(?:admin|recruiter)\/ofertas\/([^/]+)\/candidatos\/([^/]+)/.exec(location);
    return {
      jobId: m ? decodeURIComponent(m[1]) : '',
      applicantId: m ? decodeURIComponent(m[2]) : '',
    };
  }, [location]);

  const [offer, setOffer] = useState<JobOfferRecord | null>(null);
  const [applicant, setApplicant] = useState<JobApplicant | null>(null);
  const [developer, setDeveloper] = useState<ReturnType<typeof mapApiDeveloperToProfile> | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  useEffect(() => {
    if (!routeMatch.jobId || !routeMatch.applicantId) {
      setLoadState('done');
      setError('Candidato no válido.');
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
        const [rows, apps, developersRes] = await Promise.all([
          portalBase === '/app/recruiter'
            ? fetchRecruiterJobOffers(apiBase)
            : fetchAdminJobOffers(apiBase),
          fetchJobApplicants(apiBase, routeMatch.jobId),
          fetch(`${apiBase}/users/developers`),
        ]);
        if (cancelled) return;

        const foundOffer = rows.find((o) => o.id === routeMatch.jobId) ?? null;
        const foundApplicant = apps.find((a) => a.id === routeMatch.applicantId) ?? null;
        setOffer(foundOffer);
        setApplicant(foundApplicant);

        if (!foundApplicant) {
          setError('No encontramos este candidato para la oferta seleccionada.');
          return;
        }

        if (!developersRes.ok) {
          setDeveloper(null);
          return;
        }
        const developersRaw = (await developersRes.json()) as unknown;
        if (!Array.isArray(developersRaw)) {
          setDeveloper(null);
          return;
        }
        const byEmail = developersRaw
          .map((row) => row as ApiDeveloperPayload)
          .find((d) => normalizeEmail(String(d.email ?? '')) === normalizeEmail(foundApplicant.email));
        setDeveloper(byEmail ? mapApiDeveloperToProfile(byEmail) : null);
      } catch {
        if (!cancelled) setError('No se pudo cargar el perfil del candidato. Comprueba la API y vuelve a intentar.');
      } finally {
        if (!cancelled) setLoadState('done');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, portalBase, routeMatch.applicantId, routeMatch.jobId]);

  const backToCandidates = () => {
    if (!routeMatch.jobId) return;
    setLocation(
      path(`${ofertasBase}/${encodeURIComponent(routeMatch.jobId)}/candidatos`),
    );
  };

  return (
    <AppShell
      pathWithoutLang={`${ofertasBase}/${routeMatch.jobId}/candidatos/${routeMatch.applicantId}`}
      title={t('sidebarDemo.navJobs')}
      description={t('seo.appAdminJobs')}
    >
      <section className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={backToCandidates}>
            <ArrowLeft className="size-4" />
            Volver a candidatos
          </Button>
        </div>

        <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          {loadState === 'loading' ? (
            <p className="text-sm text-muted-foreground">Cargando perfil…</p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-700 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          {!error && applicant ? (
            <div className="space-y-6">
              <header className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
                  Perfil del candidato
                </h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {offer ? `${offer.titulo} · ${offer.ubicacion}` : 'Oferta'}
                </p>
              </header>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Datos principales</p>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                      <UserRound className="size-4" />
                      {applicant.nombre}
                    </p>
                    <p className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
                      <Mail className="size-4" />
                      {applicant.email}
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Estado: <span className="font-medium">{applicant.status}</span>
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Postulado: <span className="font-medium">{formatAppliedAt(applicant.createdAt)}</span>
                    </p>
                    <p className="text-zinc-700 dark:text-zinc-300">
                      Salario deseado: <span className="font-medium">{applicant.desiredSalary || 'No especificado'}</span>
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Perfil dev</p>
                  {developer ? (
                    <div className="space-y-2 text-sm">
                      <p className="text-zinc-700 dark:text-zinc-300">
                        Rol: <span className="font-medium">{developer.rol || '—'}</span>
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        Disponibilidad: <span className="font-medium">{developer.disponibilidad || '—'}</span>
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        Expertis:{' '}
                        <span className="font-medium">
                          {developer.expertis.length > 0 ? developer.expertis.join(', ') : 'No especificado'}
                        </span>
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        Visa vigente: <span className="font-medium">{developer.visaVigente ? 'Sí' : 'No'}</span>
                      </p>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        Disponibilidad para viajar:{' '}
                        <span className="font-medium">{developer.disponibilidadViajar ? 'Sí' : 'No'}</span>
                      </p>
                      <p className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                        <Phone className="size-4" />
                        <span className="font-medium">{developer.telefono || 'No especificado'}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No encontramos un perfil developer completo para este correo.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 p-4 dark:border-zinc-800">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Cover letter</p>
                <p className="whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
                  {applicant.coverLetter || 'No dejó mensaje.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {developer?.resumeUrl ? (
                  <Button asChild className="rounded-xl">
                    <a href={developer.resumeUrl} target="_blank" rel="noreferrer">
                      <FileText className="size-4" />
                      Ver CV
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : (
                  <Button type="button" variant="outline" className="rounded-xl" disabled>
                    <FileText className="size-4" />
                    CV no disponible
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
