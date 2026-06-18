import { FolderKanban } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getDevAccessToken } from '@/lib/devAuth';
import { devProjectsSignature } from '@/lib/appNavBadges';
import { persistDevProjectsSignatureSeen } from '@/lib/userPreferencesSync';

type DevAssignedProject = {
  id: string;
  contactId?: string;
  titulo: string;
  empresa: string;
  contactoNombre: string;
  servicio: string;
  descripcion?: string;
  createdAt: string;
  unreadNotification?: boolean;
};

export default function AppDevProjectsPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<DevAssignedProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<DevAssignedProject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');
  const token = getDevAccessToken() ?? '';

  const enrichWithClientMessage = async (
    rows: DevAssignedProject[],
    base: string,
  ): Promise<DevAssignedProject[]> => {
    const needsMessage = rows.some((r) => !r.descripcion?.trim() && r.contactId?.trim());
    if (!needsMessage) return rows;
    try {
      const res = await fetch(`${base}/contact/company-submissions`);
      if (!res.ok) return rows;
      const submissions = (await res.json()) as Array<{ id?: unknown; message?: unknown }>;
      const byId = new Map<string, string>();
      for (const s of submissions) {
        const id = typeof s.id === 'string' ? s.id.trim() : '';
        const msg = typeof s.message === 'string' ? s.message.trim() : '';
        if (id && msg) byId.set(id, msg);
      }
      return rows.map((r) => {
        if (r.descripcion?.trim()) return r;
        const cid = r.contactId?.trim() ?? '';
        const message = cid ? byId.get(cid) : undefined;
        return message ? { ...r, descripcion: message } : r;
      });
    } catch {
      return rows;
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (!apiBase || !token) {
        if (!cancelled) {
          setError('No se pudo autenticar la cuenta developer.');
          setLoading(false);
        }
        return;
      }
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
      void fetch(`${apiBase}/projects/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error(String(res.status));
          return res.json() as Promise<DevAssignedProject[]>;
        })
        .then(async (rows) => {
          if (!Array.isArray(rows)) return [];
          return await enrichWithClientMessage(rows, apiBase);
        })
        .then((rows) => {
          if (!cancelled) setProjects(Array.isArray(rows) ? rows : []);
        })
        .catch(() => {
          if (!cancelled) setError('No se pudieron cargar tus proyectos asignados.');
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
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
  }, [apiBase, token]);

  const unreadCount = useMemo(
    () => projects.filter((p) => p.unreadNotification === true).length,
    [projects],
  );

  useEffect(() => {
    if (loading) return;
    void persistDevProjectsSignatureSeen(devProjectsSignature(projects));
  }, [loading, projects]);

  const markAsRead = (id: string) => {
    if (!apiBase || !token) return;
    void fetch(`${apiBase}/projects/${id}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, unreadNotification: false } : p)),
      );
    });
  };

  return (
    <AppShell
      pathWithoutLang="/app/dev/projects"
      title={
        unreadCount > 0
          ? `${t('sidebarDemo.navProjects')} • ${unreadCount} sin leer`
          : t('sidebarDemo.navProjects')
      }
      description={t('seo.appProjects')}
    >
      {loading ? (
        <section className="rounded-2xl border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
          Cargando proyectos asignados...
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </section>
      ) : projects.length === 0 ? (
        <section
          className="flex min-h-[min(24rem,calc(100vh-12rem))] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300/90 bg-zinc-50/80 px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950/40"
          aria-labelledby="dev-projects-empty-title"
        >
          <span className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-800">
            <FolderKanban className="size-7 text-zinc-400 dark:text-zinc-500" aria-hidden />
          </span>
          <h2
            id="dev-projects-empty-title"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            {t('sidebarDemo.appDevProjectsEmptyTitle')}
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {t('sidebarDemo.appDevProjectsEmptyDescription')}
          </p>
        </section>
      ) : (
        <section className="mx-auto grid w-full max-w-3xl gap-4">
          {projects.map((project) => (
            <article
              key={project.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {project.titulo}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {project.empresa} · {project.servicio}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    Contacto: {project.contactoNombre}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-300">
                    {project.descripcion?.trim() || 'Sin descripción del proyecto.'}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedProject(project)}>
                    Ver detalles
                  </Button>
                  {project.unreadNotification ? (
                    <Button size="sm" variant="outline" onClick={() => markAsRead(project.id)}>
                      Marcar como leído
                    </Button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
      <Dialog open={selectedProject !== null} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del proyecto</DialogTitle>
          </DialogHeader>
          {selectedProject ? (
            <div className="space-y-3 text-sm">
              <DetailRow label="Proyecto" value={selectedProject.titulo} />
              <DetailRow label="Empresa" value={selectedProject.empresa} />
              <DetailRow label="Servicio" value={selectedProject.servicio} />
              <DetailRow
                label="Descripción"
                value={selectedProject.descripcion?.trim() || 'Sin descripción del proyecto.'}
              />
              <DetailRow label="Contacto" value={selectedProject.contactoNombre} />
              <DetailRow
                label="Asignado"
                value={new Date(selectedProject.createdAt).toLocaleString()}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function DetailRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3">
      <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{label}</p>
      <p className={mono ? 'break-all font-mono text-zinc-900 dark:text-zinc-100' : 'text-zinc-900 dark:text-zinc-100'}>
        {value}
      </p>
    </div>
  );
}
