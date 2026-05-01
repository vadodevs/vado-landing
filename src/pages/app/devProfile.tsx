import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import {
  Calendar,
  Check,
  CircleUser,
  Eye,
  ExternalLink,
  HelpCircle,
  Mail,
  Pencil,
  Phone,
  Plane,
  ShieldCheck,
  Tag,
  Upload,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  cloneDeveloperProfile,
  mapApiDeveloperToProfile,
  type ApiDeveloperPayload,
  type DeveloperProfile,
} from '@/lib/devDevelopers';
import { devAuthorizedFetch, getDevAccessToken } from '@/lib/devAuth';
import {
  labelForStartVado,
  matchStartKeyFromStored,
  START_VADO_KEYS,
  type StartVadoKey,
} from '@/lib/devApplicationSelects';
import { normalizeExpertiseTag } from '@/lib/expertiseFormat';
import { cn } from '@/lib/utils';

const MAX_CV_BYTES = 10 * 1024 * 1024;

const selectFieldClass = cn(
  'border-input h-10 w-full flex-1 rounded-lg border bg-transparent px-3 py-2 text-base',
  'focus:border-primary focus:ring-primary/50 focus:ring-2 focus:outline-none md:text-sm',
);

function boolLabel(v: boolean) {
  return v ? 'Sí' : 'No';
}

export default function AppDevProfilePage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [profileLoadError, setProfileLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DeveloperProfile | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);
  const [cvUploadSuccess, setCvUploadSuccess] = useState<string | null>(null);
  const cvInputRef = useRef<HTMLInputElement | null>(null);

  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
  const token = getDevAccessToken();
  const canLoadProfile = Boolean(apiBase && token);

  const p = editing && draft ? draft : profile;
  const nombreCompleto = profile ? `${profile.nombre} ${profile.apellido}`.trim() : 'Perfil';

  useEffect(() => {
    if (!canLoadProfile || !token) return;
    void devAuthorizedFetch(`${apiBase}/users/developers/me`)
      .then((res) => {
        if (!res || !res.ok) throw new Error(String(res?.status ?? 0));
        return res.json() as Promise<ApiDeveloperPayload>;
      })
      .then((data) => {
        setProfile(mapApiDeveloperToProfile(data));
      })
      .catch(() => {
        setProfileLoadError('No fue posible cargar tu perfil desde la base de datos.');
      });
  }, [apiBase, canLoadProfile, token]);

  const resolvedProfileLoadError =
    profileLoadError ?? (!canLoadProfile ? 'No fue posible cargar tu perfil.' : null);

  const startEdit = () => {
    if (!profile) return;
    setDraft(cloneDeveloperProfile(profile));
    setTagInput('');
    setEditing(true);
    setSaveError(null);
  };

  const cancelEdit = () => {
    setDraft(null);
    setTagInput('');
    setEditing(false);
  };

  const saveEdit = useCallback(() => {
    if (!draft || !profile) return;
    if (!apiBase || !getDevAccessToken()) {
      setSaveError('No se pudo guardar: API no disponible.');
      return;
    }
    setSaving(true);
    setSaveError(null);
    const body: Record<string, unknown> = {
      startVado: draft.disponibilidad,
      validVisa: draft.visaVigente,
      availabilityToTravel: draft.disponibilidadViajar,
      currentlyEmployed: draft.currentlyEmployed,
      expertiseJson: JSON.stringify(draft.expertis),
    };
    void devAuthorizedFetch(`${apiBase}/users/developers/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res || !res.ok) throw new Error(String(res?.status ?? 0));
        return res.json() as Promise<ApiDeveloperPayload>;
      })
      .then((data) => {
        setProfile(mapApiDeveloperToProfile(data));
        setDraft(null);
        setTagInput('');
        setEditing(false);
      })
      .catch(() => {
        setSaveError('No se pudo guardar el perfil. Intenta nuevamente.');
      })
      .finally(() => setSaving(false));
  }, [apiBase, draft, profile]);

  const uploadCv = useCallback(
    (file: File) => {
      if (!apiBase || !getDevAccessToken()) {
        setCvUploadError('No se pudo actualizar el CV: API no disponible.');
        return;
      }
      if (file.type !== 'application/pdf' || file.size > MAX_CV_BYTES) {
        setCvUploadError('El CV debe ser PDF y no superar 10 MB.');
        return;
      }

      setUploadingCv(true);
      setCvUploadError(null);
      setCvUploadSuccess(null);
      const tryUpload = async () => {
        try {
          const fd = new FormData();
          fd.append('cv', file);
          const res = await devAuthorizedFetch(`${apiBase}/users/developers/me/cv`, {
            method: 'PUT',
            body: fd,
          });
          if (!res || !res.ok) {
            setCvUploadError(`No se pudo actualizar el CV (${res?.status ?? 0}).`);
            return;
          }
          const data = (await res.json()) as ApiDeveloperPayload;
          setProfile(mapApiDeveloperToProfile(data));
          setCvUploadSuccess('CV actualizado correctamente.');
          window.setTimeout(() => setCvUploadSuccess(null), 3000);
        } catch {
          setCvUploadError('No se pudo actualizar el CV. Verifica tu conexión.');
        }
      };

      void tryUpload().finally(() => {
        setUploadingCv(false);
      });
    },
    [apiBase],
  );

  const addExpertiseTag = () => {
    if (!draft) return;
    const normalized = normalizeExpertiseTag(tagInput);
    if (!normalized) return;
    if (draft.expertis.includes(normalized)) {
      setTagInput('');
      return;
    }
    setDraft({ ...draft, expertis: [...draft.expertis, normalized] });
    setTagInput('');
  };

  const removeExpertiseTag = (tag: string) => {
    if (!draft) return;
    setDraft({ ...draft, expertis: draft.expertis.filter((x) => x !== tag) });
  };

  const startSelectValue = useMemo(
    () => (draft ? matchStartKeyFromStored(draft.disponibilidad, t) : ''),
    [draft, t],
  );

  if (!profile) {
    return (
      <AppShell pathWithoutLang="/app/dev/profile" title={t('sidebarDemo.navProfile')} description={t('seo.appDevProfile')}>
        <div className="mx-auto w-full max-w-3xl">
          <Card className="border-zinc-200/80 shadow-sm dark:border-zinc-800">
            <CardContent className="py-8 text-sm text-zinc-600 dark:text-zinc-300">
              {resolvedProfileLoadError ?? 'Cargando perfil...'}
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const resolvedProfile: DeveloperProfile = profile;
  const resolvedViewProfile: DeveloperProfile = p ?? profile;
  return (
    <AppShell
      pathWithoutLang="/app/dev/profile"
      title={nombreCompleto}
      description={t('seo.appDevProfile')}
    >
      <div className="mx-auto w-full max-w-6xl space-y-8 pb-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1628] via-[#0f172a] to-[#132038] shadow-xl ring-1 ring-white/10">
          <div
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-teal-400/15 blur-3xl"
            aria-hidden
          />
          <div className="pointer-events-none absolute -bottom-16 left-1/4 size-48 rounded-full bg-sky-500/10 blur-2xl" aria-hidden />

          <div className="relative z-10 flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="flex min-w-0 flex-1 flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
              <div
                className={cn(
                  'mx-auto flex size-24 shrink-0 items-center justify-center rounded-2xl border-2 border-white/20 bg-gradient-to-br from-slate-600/90 to-[#0f172a] shadow-lg sm:mx-0 sm:size-28',
                )}
              >
                <span className="text-3xl font-bold tracking-tight text-white">
                  {profile.nombre[0]}
                  {profile.apellido[0]}
                </span>
              </div>
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-300/95">
                  {profile.rol?.trim() ? profile.rol : 'Perfil'}{profile.seniority ? ` · ${profile.seniority}` : ''}
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-[2rem] sm:leading-tight">
                  {nombreCompleto}
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-zinc-300">
                  {editing
                    ? 'Los datos de identidad y contacto no se editan desde aquí. Guardá los cambios de disponibilidad, expertise y cuenta.'
                    : 'Resumen de lo que registraste en tu postulación. Actualizá expertise, visa y CV cuando quieras.'}
                </p>
                {saveError ? (
                  <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-100">{saveError}</p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              {editing ? (
                <div className="flex w-full flex-wrap justify-center gap-2 sm:justify-end">
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 min-w-[10rem] rounded-xl bg-white font-semibold text-[#0f172a] shadow-md hover:bg-zinc-100"
                    onClick={saveEdit}
                    disabled={saving}
                  >
                    <Check className="mr-2 size-4" />
                    {saving ? 'Guardando…' : 'Guardar cambios'}
                  </Button>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-xl border-white/30 bg-white/5 text-white hover:bg-white/10"
                    onClick={cancelEdit}
                  >
                    <X className="mr-2 size-4" />
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex w-full flex-wrap justify-center gap-3 sm:justify-end">
                  {resolvedProfile.resumeUrl ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 gap-2 rounded-xl border-white/35 bg-white/10 font-semibold text-white hover:bg-white/15"
                      asChild
                    >
                      <a href={resolvedProfile.resumeUrl ?? '#'} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4" />
                        Ver CV
                      </a>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="lg"
                    className="h-12 min-w-[11rem] gap-2 rounded-xl bg-white font-semibold text-[#0f172a] shadow-md hover:bg-zinc-100"
                    onClick={startEdit}
                  >
                    <Pencil className="size-4" />
                    Editar perfil
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="space-y-6 lg:col-span-5">
          <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold tracking-tight text-[#0f172a] dark:text-white">
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProfileRow label="Correo" icon={Mail} value={profile.correo} mono />
              <ProfileRow
                label="Teléfono"
                icon={Phone}
                value={profile.telefono?.trim() ? profile.telefono : '—'}
              />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold tracking-tight text-[#0f172a] dark:text-white">
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing && draft ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="dev-profile-start" className="text-xs text-zinc-500">
                      {t('home.ctaContact.applyForm.startDate')}
                    </Label>
                    <div className="flex gap-2">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                        <Calendar className="size-4 text-zinc-600 dark:text-zinc-400" aria-hidden />
                      </span>
                      <select
                        id="dev-profile-start"
                        className={selectFieldClass}
                        value={startSelectValue}
                        onChange={(e) => {
                          const v = e.target.value as StartVadoKey | '';
                          if (!v || !draft) return;
                          setDraft({
                            ...draft,
                            disponibilidad: labelForStartVado(v, t),
                          });
                        }}
                        autoComplete="off"
                      >
                        <option value="">{t('home.ctaContact.subjectPlaceholder')}</option>
                        {START_VADO_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {labelForStartVado(key, t)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                      <CircleUser className="size-4 text-zinc-600 dark:text-zinc-400" aria-hidden />
                    </span>
                    <div className="flex flex-1 items-center gap-2 pt-0.5">
                      <Checkbox
                        id="dev-profile-employed"
                        checked={draft.currentlyEmployed}
                        onCheckedChange={(c) =>
                          setDraft({ ...draft, currentlyEmployed: c === true })
                        }
                      />
                      <Label htmlFor="dev-profile-employed" className="text-sm font-normal">
                        {t('home.ctaContact.applyForm.currentlyWorking')}
                      </Label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-teal-200/70 bg-gradient-to-br from-teal-50/95 to-white p-4 shadow-sm dark:border-teal-800/40 dark:from-teal-950/35 dark:to-zinc-950">
                    <div className="flex items-start gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 shadow-inner dark:bg-teal-900/50 dark:text-teal-200">
                        <Calendar className="size-5" strokeWidth={2} aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-teal-700 dark:text-teal-300/90">
                          {t('home.ctaContact.applyForm.startDate')}
                        </p>
                        <p className="mt-1.5 text-base font-semibold leading-snug text-teal-950 dark:text-teal-50">
                          {resolvedViewProfile.disponibilidad.trim() !== ''
                            ? resolvedViewProfile.disponibilidad
                            : '—'}
                        </p>
                        <div className="mt-3 border-t border-teal-200/60 pt-3 text-sm text-teal-900/95 dark:border-teal-800/60 dark:text-teal-100/90">
                          <span className="font-medium text-teal-800/80 dark:text-teal-300/90">
                            {t('home.ctaContact.applyForm.currentlyWorking')}:{' '}
                          </span>
                          <span>{boolLabel(resolvedViewProfile.currentlyEmployed)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold tracking-tight text-[#0f172a] dark:text-white">
                Origen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileRow
                label={t('home.ctaContact.applyForm.heardAbout')}
                icon={HelpCircle}
                value={
                  resolvedProfile.procedencia.trim() !== '' ? resolvedProfile.procedencia : '—'
                }
              />
            </CardContent>
          </Card>
          </div>

          <div className="space-y-6 lg:col-span-7">
          <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-base font-bold tracking-tight text-[#0f172a] dark:text-white">
                Expertise técnico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editing && draft ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {draft.expertis.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full border border-teal-200/80 bg-teal-50/90 pl-3 pr-1.5 py-1.5 text-sm font-medium text-teal-900 shadow-sm dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-100"
                      >
                        {tag}
                        <button
                          type="button"
                          className="rounded p-0.5 hover:bg-teal-200/60 dark:hover:bg-teal-900/50"
                          onClick={() => removeExpertiseTag(tag)}
                          aria-label={`Quitar ${tag}`}
                        >
                          <X className="size-3.5 opacity-70" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <Label htmlFor="dev-profile-tag" className="text-xs text-zinc-500">
                        Añadir tecnología
                      </Label>
                      <Input
                        id="dev-profile-tag"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addExpertiseTag();
                          }
                        }}
                        placeholder="p. ej. TypeScript"
                        autoComplete="off"
                      />
                    </div>
                    <Button type="button" variant="secondary" size="sm" onClick={addExpertiseTag}>
                      Añadir
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900">
                    <Tag className="size-4 text-zinc-600 dark:text-zinc-400" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    {resolvedViewProfile.expertis.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {resolvedViewProfile.expertis.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-teal-200/80 bg-teal-50/90 px-3 py-1.5 text-sm font-medium text-teal-900 shadow-sm dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-700 dark:text-zinc-300">—</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2">
          <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold tracking-tight text-[#0f172a] dark:text-white">
                Visa y viajes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing && draft ? (
                <>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="dev-profile-visa"
                      checked={draft.visaVigente}
                      onCheckedChange={(c) => setDraft({ ...draft, visaVigente: c === true })}
                    />
                    <Label htmlFor="dev-profile-visa" className="text-sm font-normal">
                      Visa vigente
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="dev-profile-travel"
                      checked={draft.disponibilidadViajar}
                      onCheckedChange={(c) =>
                        setDraft({ ...draft, disponibilidadViajar: c === true })
                      }
                    />
                    <Label htmlFor="dev-profile-travel" className="text-sm font-normal">
                      Disponibilidad para viajar
                    </Label>
                  </div>
                </>
              ) : (
                <>
                  <ProfileRow label="Visa vigente" icon={ShieldCheck} value={boolLabel(resolvedViewProfile.visaVigente)} />
                  <ProfileRow
                    label="Disponibilidad para viajar"
                    icon={Plane}
                    value={boolLabel(resolvedViewProfile.disponibilidadViajar)}
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold tracking-tight text-[#0f172a] dark:text-white">
                CV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {resolvedProfile.resumeUrl ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-auto min-h-[4.5rem] flex-col gap-1.5 rounded-xl border-zinc-200 bg-zinc-50/50 py-3 font-semibold hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/50"
                    asChild
                  >
                    <a href={resolvedProfile.resumeUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="size-5 text-[#0f172a] dark:text-white" />
                      Ver PDF
                    </a>
                  </Button>
                ) : (
                  <div className="flex min-h-[4.5rem] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 px-2 text-center text-xs text-zinc-500 dark:border-zinc-700">
                    Sin CV aún
                  </div>
                )}
                <input
                  ref={cvInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    uploadCv(file);
                    e.currentTarget.value = '';
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-auto min-h-[4.5rem] flex-col gap-1.5 rounded-xl border-zinc-200 bg-zinc-50/50 py-3 font-semibold hover:bg-white dark:border-zinc-700 dark:bg-zinc-900/50"
                  onClick={() => cvInputRef.current?.click()}
                  disabled={uploadingCv}
                >
                  <Upload className="size-5 text-[#0f172a] dark:text-white" />
                  {uploadingCv ? 'Subiendo…' : 'Subir PDF'}
                </Button>
              </div>
              {cvUploadError ? <p className="text-xs text-red-700">{cvUploadError}</p> : null}
              {cvUploadSuccess ? <p className="text-xs text-emerald-700">{cvUploadSuccess}</p> : null}
            </CardContent>
          </Card>
          </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileRow({
  label,
  value,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
  mono?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-700">
        <Icon className="size-[18px] text-zinc-600 dark:text-zinc-400" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p
          className={cn(
            'mt-0.5 text-sm font-medium text-[#0f172a] dark:text-white',
            mono && 'break-all',
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
