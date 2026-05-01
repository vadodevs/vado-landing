import { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Copy,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Smartphone,
  User,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCompanyAccessToken } from '@/lib/companyAuth';
import { empresaInitials, getCompanySessionProfile } from '@/lib/companyProfile';
import { cn } from '@/lib/utils';

export default function AppCompanyProfilePage() {
  const { t, i18n } = useTranslation();
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
  const token = getCompanyAccessToken();
  const canLoadProfile = Boolean(apiBase && token);
  const [p, setP] = useState(() => getCompanySessionProfile());
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    if (!canLoadProfile || !token) return;
    void fetch(`${apiBase}/contact/company-submissions/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{
          firstName?: string;
          email?: string;
          phone?: string | null;
          company?: string;
          subject?: string | null;
          message?: string | null;
          createdAt?: string;
        } | null>;
      })
      .then((row) => {
        if (!row) return;
        setP((prev) => ({
          ...(() => {
            const created = row.createdAt ? new Date(row.createdAt) : new Date();
            const fechaSolicitud = Number.isFinite(created.getTime())
              ? `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, '0')}-${String(created.getDate()).padStart(2, '0')}`
              : prev.fechaSolicitud;
            return { fechaSolicitud };
          })(),
          ...prev,
          empresa: String(row.company ?? prev.empresa).trim() || prev.empresa,
          nombre: String(row.firstName ?? prev.nombre).trim() || prev.nombre,
          correo: String(row.email ?? prev.correo).trim() || prev.correo,
          telefono: String(row.phone ?? prev.telefono).trim() || prev.telefono,
          servicio: String(row.subject ?? prev.servicio).trim() || prev.servicio,
          mensaje: String(row.message ?? prev.mensaje).trim() || prev.mensaje,
        }));
      })
      .catch(() => {
        setLoadingError('No se pudo cargar la solicitud real de esta compañía.');
      });
  }, [apiBase, canLoadProfile, token]);

  const resolvedLoadingError =
    loadingError ??
    (!canLoadProfile ? 'No se pudo cargar el perfil real de la compañía.' : null);

  const subtitle = t('companyApp.profileSubtitle', {
    servicio: p.servicio,
    empresa: p.empresa,
  });

  const formattedRequestDate = useMemo(() => {
    const [y, m, d] = p.fechaSolicitud.split('-').map(Number);
    if (!y || !m || !d) return p.fechaSolicitud;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString(i18n.language, { dateStyle: 'long' });
  }, [p.fechaSolicitud, i18n.language]);

  const copyEmail = () => {
    void navigator.clipboard.writeText(p.correo).then(() => {
      setCopiedEmail(true);
      window.setTimeout(() => setCopiedEmail(false), 1500);
    });
  };

  const initials = empresaInitials(p.empresa);

  return (
    <AppShell
      pathWithoutLang="/app/company/profile"
      title={p.empresa}
      description={t('seo.appCompanyProfile')}
    >
      <div className="mx-auto w-full max-w-6xl space-y-8 pb-2">
        <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-8 p-6 md:p-8 lg:flex-row lg:items-start">
            <div className="relative mx-auto shrink-0 lg:mx-0">
              <div
                className={cn(
                  'relative flex size-36 items-center justify-center overflow-hidden rounded-2xl border-2 border-white shadow-lg ring-1 ring-zinc-200/80 md:size-40',
                  'bg-gradient-to-br from-indigo-700 via-slate-800 to-[#0f172a]',
                )}
              >
                <span className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {initials}
                </span>
                <span className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                  <Building2 className="size-4 text-white" aria-hidden />
                </span>
              </div>
              <span className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold tracking-wider text-white shadow-md uppercase">
                {t('companyApp.profileBadge')}
              </span>
            </div>

            <div className="min-w-0 flex-1 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-[#0f172a] dark:text-white md:text-4xl">
                {p.empresa}
              </h2>
              <p className="mt-1 text-base text-zinc-500 dark:text-zinc-400">{subtitle}</p>
              <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <User className="mb-0.5 mr-1 inline size-4 text-emerald-600" aria-hidden />
                {t('companyApp.primaryContact')}: {p.nombre}
              </p>
              {resolvedLoadingError ? (
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">{resolvedLoadingError}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                {p.sector.trim() ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    <Layers className="size-3.5 text-emerald-600" aria-hidden />
                    {p.sector}
                  </span>
                ) : null}
                {p.ciudad.trim() ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    <MapPin className="size-3.5 text-emerald-600" aria-hidden />
                    {p.ciudad}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  <Calendar className="size-3.5 text-emerald-600" aria-hidden />
                  {formattedRequestDate}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="border-zinc-200/80 shadow-sm lg:col-span-2 dark:border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                {t('companyApp.contactCardTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                  <Mail className="size-5 text-zinc-600 dark:text-zinc-400" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-zinc-500">{t('companyApp.emailLabel')}</p>
                  <p className="break-all text-sm font-semibold text-[#0f172a] dark:text-white">
                    {p.correo}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
                  <Smartphone className="size-5 text-zinc-600 dark:text-zinc-400" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-medium text-zinc-500">{t('companyApp.phoneLabel')}</p>
                  <p className="text-sm font-semibold text-[#0f172a] dark:text-white">
                    {p.telefono}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 border-t border-zinc-100 pt-4 dark:border-zinc-800">
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={copyEmail}>
                  <Copy className="size-3.5" />
                  {copiedEmail ? t('companyApp.copied') : t('companyApp.copyEmail')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 shadow-sm lg:col-span-3 dark:border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
                {t('companyApp.requestCardTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <Briefcase className="mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-500">
                      {t('companyApp.serviceLabel')}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{p.servicio}</p>
                  </div>
                </div>
                {p.sector.trim() ? (
                  <div className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <Layers className="mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-xs font-medium text-zinc-500">{t('companyApp.sectorLabel')}</p>
                      <p className="text-sm font-semibold text-foreground">{p.sector}</p>
                    </div>
                  </div>
                ) : null}
                {p.ciudad.trim() ? (
                  <div className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                    <MapPin className="mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <p className="text-xs font-medium text-zinc-500">{t('companyApp.cityLabel')}</p>
                      <p className="text-sm font-semibold text-foreground">{p.ciudad}</p>
                    </div>
                  </div>
                ) : null}
                <div className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3 dark:border-zinc-800 dark:bg-zinc-900/40">
                  <Calendar className="mt-0.5 size-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <p className="text-xs font-medium text-zinc-500">
                      {t('companyApp.requestDateLabel')}
                    </p>
                    <p className="text-sm font-semibold text-foreground">{formattedRequestDate}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                  <MessageSquare className="size-4 text-zinc-400" aria-hidden />
                  {t('companyApp.messageLabel')}
                </p>
                <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-700 shadow-inner dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                  {p.mensaje}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground">{t('companyApp.footerNote')}</p>
      </div>
    </AppShell>
  );
}
