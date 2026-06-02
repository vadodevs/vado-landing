import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import {
  Bookmark,
  BriefcaseBusiness,
  ChevronDown,
  CircleUser,
  ClipboardList,
  Code2,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessagesSquare,
  PlusCircle,
  Settings,
  Sparkles,
  User,
  UserPlus,
  UserSearch,
  Users,
} from 'lucide-react';
import { VadoLogo } from '@/assets/vado-logo';
import { PageMeta } from '@/components/PageMeta';
import { useLocale } from '@/hooks/useLocale';
import { logoutAdmin } from '@/lib/adminAuth';
import { logoutCompany } from '@/lib/companyAuth';
import { logoutDeveloper } from '@/lib/devAuth';
import {
  RECRUITER_AUTH_CHANGE_EVENT,
  getRecruiterPermissions,
  logoutRecruiter,
} from '@/lib/recruiterAuth';
import { hasRecruiterPanelPermission } from '@/lib/recruiterPanel';
import { APP_THEME_CHANGE_EVENT, APP_THEME_STORAGE_KEY, getStoredAppTheme, type AppThemeMode } from '@/lib/appTheme';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AppSideChatDock } from '@/components/app/AppSideChat';
import { useAppNavBadges } from '@/contexts/AppNavBadgesContext';
import { AdminChannelNavIcon } from '@/components/admin/AdminChannelIcons';

export type AppShellProps = {
  pathWithoutLang: string;
  title: string;
  description: string;
  children: ReactNode;
  /** `hidden`: sin scroll en el cuerpo del panel (la página controla scroll interno, p. ej. tabla de leads). */
  contentOverflow?: 'scroll' | 'hidden';
  /** Sin padding en el área de contenido: la página ocupa todo el panel bajo el header (p. ej. inbox a ancho completo). */
  contentFlush?: boolean;
};

type AppSidebarChrome = {
  glassInner: string;
  mobileSheet: string;
  rowGhost: string;
  subRowBase: string;
  subRowMuted: string;
  subNavText: string;
  navActive: string;
  footerBtn: string;
  borderHeaderFooter: string;
  borderSubNav: string;
  borderSeparator: string;
  logoRing: string;
  iconMuted: string;
  unreadDotRing: string;
};

/**
 * Cristal tipo visionOS: blur + tinte oscuro translúcido (oscuro) o capa clara con cuerpo zinc (claro).
 * Importante: el inner del Sidebar ya no usa `bg-sidebar` (en app-dark seguía siendo casi blanco → texto blanco invisible).
 */
function buildAppSidebarChrome(isDark: boolean): AppSidebarChrome {
  const glassInner = isDark
    ? cn(
        '[&_[data-slot=sidebar-inner]]:!relative [&_[data-slot=sidebar-inner]]:!overflow-hidden [&_[data-slot=sidebar-inner]]:!rounded-3xl [&_[data-slot=sidebar-inner]]:!bg-transparent',
        '[&_[data-slot=sidebar-inner]]:!border [&_[data-slot=sidebar-inner]]:!border-white/[0.18]',
        '[&_[data-slot=sidebar-inner]]:!bg-gradient-to-br [&_[data-slot=sidebar-inner]]:!from-zinc-950/58 [&_[data-slot=sidebar-inner]]:!via-zinc-900/42 [&_[data-slot=sidebar-inner]]:!to-zinc-900/24',
        '[&_[data-slot=sidebar-inner]]:!backdrop-blur-[48px] [&_[data-slot=sidebar-inner]]:!backdrop-saturate-[1.85] [&_[data-slot=sidebar-inner]]:!backdrop-brightness-[1.08]',
        '[&_[data-slot=sidebar-inner]]:!text-zinc-100',
        '[&_[data-slot=sidebar-inner]]:!shadow-[0_26px_64px_-18px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-22px_52px_-26px_rgba(0,0,0,0.28)]',
        '[&_[data-slot=sidebar-inner]]:!ring-1 [&_[data-slot=sidebar-inner]]:!ring-inset [&_[data-slot=sidebar-inner]]:!ring-white/[0.07]',
      )
    : cn(
        '[&_[data-slot=sidebar-inner]]:!relative [&_[data-slot=sidebar-inner]]:!overflow-hidden [&_[data-slot=sidebar-inner]]:!rounded-3xl [&_[data-slot=sidebar-inner]]:!bg-transparent',
        '[&_[data-slot=sidebar-inner]]:!border [&_[data-slot=sidebar-inner]]:!border-white/[0.42]',
        '[&_[data-slot=sidebar-inner]]:!bg-gradient-to-br [&_[data-slot=sidebar-inner]]:!from-white/14 [&_[data-slot=sidebar-inner]]:!via-zinc-200/32 [&_[data-slot=sidebar-inner]]:!to-zinc-500/38',
        '[&_[data-slot=sidebar-inner]]:!backdrop-blur-[40px] [&_[data-slot=sidebar-inner]]:!backdrop-saturate-[1.35]',
        '[&_[data-slot=sidebar-inner]]:!text-zinc-900',
        '[&_[data-slot=sidebar-inner]]:!shadow-[0_14px_44px_-10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-14px_38px_-18px_rgba(0,0,0,0.07)]',
        '[&_[data-slot=sidebar-inner]]:!ring-1 [&_[data-slot=sidebar-inner]]:!ring-inset [&_[data-slot=sidebar-inner]]:!ring-zinc-900/[0.05]',
      );

  const mobileSheet = isDark
    ? cn(
        '!relative !overflow-hidden !rounded-3xl !border !border-white/[0.18] !bg-transparent !text-zinc-100 shadow-none',
        '!bg-gradient-to-br !from-zinc-950/58 !via-zinc-900/42 !to-zinc-900/24',
        '!backdrop-blur-[48px] !backdrop-saturate-[1.85] !backdrop-brightness-[1.08]',
        '!shadow-[0_26px_64px_-18px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.24)]',
        '!ring-1 !ring-inset !ring-white/[0.07]',
        'pt-[max(0.75rem,env(safe-area-inset-top,0px))]',
        'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
      )
    : cn(
        '!relative !overflow-hidden !rounded-3xl !border !border-white/[0.42] !bg-transparent !text-zinc-900 shadow-none',
        '!bg-gradient-to-br !from-white/14 !via-zinc-200/32 !to-zinc-500/38',
        '!backdrop-blur-[40px] !backdrop-saturate-[1.35]',
        '!shadow-[0_14px_44px_-10px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.65)]',
        '!ring-1 !ring-inset !ring-zinc-900/[0.05]',
        'pt-[max(0.75rem,env(safe-area-inset-top,0px))]',
        'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
      );

  const navHover = isDark
    ? 'hover:bg-white/[0.08] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
    : 'hover:bg-zinc-900/[0.06] hover:text-zinc-900 hover:shadow-[inset_0_0_0_1px_rgba(24,24,27,0.08)]';

  const navActive = isDark
    ? 'bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)]'
    : 'bg-zinc-900/[0.1] text-zinc-900 shadow-[inset_0_0_0_1px_rgba(24,24,27,0.12)]';

  const rowGhost = cn(
    'flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm transition-[background-color,box-shadow,color] duration-200',
    isDark ? 'text-white/85' : 'text-zinc-800',
    navHover,
  );

  const subRowBase = cn(
    'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug transition-[background-color,box-shadow,color] duration-200',
    navHover,
  );

  const subRowMuted = cn(subRowBase, isDark ? 'text-white/70' : 'text-zinc-600');

  const subNavText = isDark ? 'text-white/85' : 'text-zinc-800';

  const footerBtn = cn(
    'flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.99] group-data-[collapsible=icon]:px-2',
    isDark
      ? 'border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.1] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
      : 'border-zinc-500/18 bg-white/25 text-zinc-900 hover:bg-white/35 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]',
  );

  return {
    glassInner,
    mobileSheet,
    rowGhost,
    subRowBase,
    subRowMuted,
    subNavText,
    navActive,
    footerBtn,
    borderHeaderFooter: isDark ? 'border-b border-white/10' : 'border-b border-zinc-500/14',
    borderSubNav: isDark ? 'border-l border-white/12' : 'border-l border-zinc-500/16',
    borderSeparator: isDark ? 'border-t border-white/12' : 'border-t border-zinc-500/14',
    logoRing: isDark
      ? 'focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950'
      : 'focus-visible:ring-zinc-400/75 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    iconMuted: isDark ? 'text-white/70' : 'text-zinc-600',
    unreadDotRing: isDark ? 'ring-white/28' : 'ring-zinc-200',
  };
}

/** Solo desktop colapsado: tooltip al pasar el ratón por el icono */
function CollapsedIconTooltip({ label, children }: { label: string; children: React.ReactElement }) {
  const { state, isMobile } = useSidebar();
  if (state !== 'collapsed' || isMobile) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" align="center" className="max-w-[14rem]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/** Sublista colapsable con transición suave de altura. */
function SidebarAnimatedCollapse({
  show,
  className,
  children,
}: {
  show: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.33, 1, 0.68, 1)] motion-reduce:transition-none',
        show ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
      )}
    >
      <div className={cn('min-h-0 overflow-hidden', className)}>{children}</div>
    </div>
  );
}

function normalizePath(p: string) {
  const x = p.split('#')[0].split('?')[0].replace(/\/$/, '');
  return x === '' ? '/' : x;
}

/** Alterna el panel Vado Intelligence: icono IA y texto de marca. */
function VadoIntelligenceChatToggle({
  expanded,
  onToggle,
  isDark,
  controlsId,
}: {
  expanded: boolean;
  onToggle: () => void;
  isDark: boolean;
  controlsId: string;
}) {
  const [pressed, setPressed] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);

  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controlsId}
      aria-label={expanded ? 'Ocultar Vado Intelligence' : 'Abrir Vado Intelligence'}
      onClick={onToggle}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onPointerLeave={(e) => {
        if (e.buttons === 0) setPressed(false);
      }}
      onFocus={() => setFocusWithin(true)}
      onBlur={() => setFocusWithin(false)}
      className={cn(
        'group relative inline-flex w-max max-w-full shrink-0 items-center gap-2 overflow-hidden rounded-xl border py-1 pl-1.5 pr-2 text-left text-[13px] leading-none',
        'outline-none transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out',
        pressed && 'scale-[0.97]',
        focusWithin && 'ring-2 ring-offset-2',
        isDark
          ? cn(
              'border-zinc-600/60 bg-zinc-800/50 text-zinc-100 shadow-sm shadow-black/25',
              'hover:border-zinc-500 hover:bg-zinc-800/80',
              focusWithin && 'ring-emerald-400/75 ring-offset-zinc-900',
            )
          : cn(
              'border-zinc-200/95 bg-white/75 text-zinc-900 shadow-sm shadow-zinc-900/[0.06]',
              'hover:border-zinc-300 hover:bg-white',
              focusWithin && 'ring-zinc-400/80 ring-offset-white',
            ),
      )}
    >
      <span
        className={cn(
          'relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg',
          'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700',
          'ring-1 ring-inset ring-white/20 shadow-sm shadow-indigo-950/35',
          'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          (pressed || focusWithin) && 'scale-95',
          focusWithin && !pressed && 'scale-[1.06]',
        )}
        aria-hidden
      >
        <Sparkles
          className={cn(
            'relative size-3.5 text-white drop-shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] will-change-transform',
            pressed && 'rotate-12 scale-110',
            focusWithin && !pressed && 'scale-110',
          )}
          strokeWidth={2.25}
          aria-hidden
        />
      </span>
      <span className="min-w-0 whitespace-nowrap font-semibold tracking-tight">Vado Intelligence</span>
    </button>
  );
}

export function AppShell({
  pathWithoutLang,
  title,
  description,
  children,
  contentOverflow = 'scroll',
  contentFlush = false,
}: AppShellProps) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const {
    devProjectsUnread,
    companyProjectsUnread,
    adminDevelopersUnread,
    adminCompaniesUnread,
    adminProjectsUnread,
  } = useAppNavBadges();
  const [offersOpen, setOffersOpen] = useState(false);
  const [recruitersOpen, setRecruitersOpen] = useState(false);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [trabajoOpen, setTrabajoOpen] = useState(false);
  const [appThemeMode, setAppThemeMode] = useState<AppThemeMode>(() => getStoredAppTheme());
  const [sideChatExpanded, setSideChatExpanded] = useState(true);
  const vadoIntelPanelId = useId();
  const canonicalPath = path(pathWithoutLang);

  const currentAppPath = normalizePath(pathWithoutLang);
  const isAdminSection = currentAppPath.startsWith('/app/admin');
  const isRecruiterPortal = currentAppPath.startsWith('/app/recruiter');
  const isDevSection = currentAppPath.startsWith('/app/dev');
  const isCompanySection = currentAppPath.startsWith('/app/company');
  const hrefDevDashboard = path('/app/dev');
  const hrefDevOverview = path('/app/dev/overview');
  const hrefProfile = path('/app/dev/profile');
  const hrefProjects = path('/app/dev/projects');
  const hrefEmpleosOfertas = path('/app/dev/empleos/ofertas');
  const hrefEmpleosGuardadas = path('/app/dev/empleos/guardadas');
  const hrefEmpleosPostulacion = path('/app/dev/empleos/postulacion');
  const hrefDevSettings = path('/app/dev/settings');
  const hrefDevelopers = path('/app/admin/desarrolladores');
  const hrefAdminRecruitersList = path('/app/admin/reclutadores');
  const hrefAdminCreateRecruiter = path('/app/admin/reclutadores/crear');
  const hrefAdminJobs = path('/app/admin/ofertas');
  const hrefAdminCreateJob = path('/app/admin/ofertas/crear');
  const hrefAdminActiveJobs = path('/app/admin/ofertas/activas');
  const hrefAdminProjects = path('/app/admin/proyectos');
  const hrefAdminCompanies = path('/app/admin/company');
  const hrefAdminCanalesFacebook = path('/app/admin/canales/facebook');
  const hrefAdminCanalesWhatsApp = path('/app/admin/canales/whatsapp');
  const hrefAdminCanalesInstagram = path('/app/admin/canales/instagram');
  const hrefAdminCanalesBotTest = path('/app/admin/canales/bot-test');
  const hrefAdminSettings = path('/app/admin/settings');
  const hrefCompanyProfile = path('/app/company/profile');
  const hrefCompanyProjects = path('/app/company/proyectos');
  const hrefCompanySettings = path('/app/company/settings');

  const hrefRecruiterDevelopers = path('/app/recruiter/desarrolladores');
  const hrefRecruiterJobs = path('/app/recruiter/ofertas');
  const hrefRecruiterCreateJob = path('/app/recruiter/ofertas/crear');
  const hrefRecruiterActiveJobs = path('/app/recruiter/ofertas/activas');
  const hrefRecruiterProjects = path('/app/recruiter/proyectos');
  const hrefRecruiterCompanies = path('/app/recruiter/company');
  const hrefRecruiterProfile = path('/app/recruiter/profile');
  const hrefRecruiterSettings = path('/app/recruiter/settings');

  const [recruiterPermBump, setRecruiterPermBump] = useState(0);

  const isActive = (href: string) => {
    return normalizePath(location) === normalizePath(href);
  };

  const offersActive =
    isActive(hrefAdminJobs) ||
    isActive(hrefAdminCreateJob) ||
    isActive(hrefAdminActiveJobs) ||
    currentAppPath.startsWith('/app/admin/ofertas/') ||
    isActive(hrefRecruiterJobs) ||
    isActive(hrefRecruiterCreateJob) ||
    isActive(hrefRecruiterActiveJobs) ||
    currentAppPath.startsWith('/app/recruiter/ofertas/');

  const recruitersActive = currentAppPath.startsWith('/app/admin/reclutadores');

  const channelsActive = currentAppPath.startsWith('/app/admin/canales');

  const nuevasAperturasActive = isActive(hrefDevDashboard) || isActive(hrefDevOverview);
  const empleosOfertasActive = isActive(hrefEmpleosOfertas);
  const guardadasActive = isActive(hrefEmpleosGuardadas);
  const trabajoGroupActive = nuevasAperturasActive || empleosOfertasActive || guardadasActive;

  useEffect(() => {
    if (offersActive) queueMicrotask(() => setOffersOpen(true));
  }, [offersActive]);

  useEffect(() => {
    if (recruitersActive) queueMicrotask(() => setRecruitersOpen(true));
  }, [recruitersActive]);

  useEffect(() => {
    if (channelsActive) queueMicrotask(() => setChannelsOpen(true));
  }, [channelsActive]);

  useEffect(() => {
    if (trabajoGroupActive) queueMicrotask(() => setTrabajoOpen(true));
  }, [trabajoGroupActive]);

  useEffect(() => {
    const sync = () => setAppThemeMode(getStoredAppTheme());
    sync();
    window.addEventListener(APP_THEME_CHANGE_EVENT, sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === APP_THEME_STORAGE_KEY) sync();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(APP_THEME_CHANGE_EVENT, sync);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    const bump = () => setRecruiterPermBump((x) => x + 1);
    window.addEventListener(RECRUITER_AUTH_CHANGE_EVENT, bump);
    return () => window.removeEventListener(RECRUITER_AUTH_CHANGE_EVENT, bump);
  }, []);

  void recruiterPermBump;
  const recruiterPerms = getRecruiterPermissions();
  const canRecruiterPanel = (
    key: 'panel:developers' | 'panel:jobs' | 'panel:projects' | 'panel:companies',
  ) => hasRecruiterPanelPermission(recruiterPerms, key);

  const isAppDark = appThemeMode === 'dark';
  const sb = useMemo(() => buildAppSidebarChrome(isAppDark), [isAppDark]);

  const sidebarNavSectionShell = cn(
    'mb-3 space-y-1 rounded-2xl p-2 last:mb-0',
    isAppDark
      ? 'bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-white/[0.08]'
      : 'bg-black/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] ring-1 ring-inset ring-black/[0.07]',
    'group-data-[collapsible=icon]:mb-2 group-data-[collapsible=icon]:rounded-xl group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:ring-0',
  );

  const sidebarNavSectionTitle = cn(
    'select-none px-2 pb-1.5 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]',
    isAppDark ? 'text-zinc-500' : 'text-zinc-500',
    'group-data-[collapsible=icon]:hidden',
  );

  const chevronNavClass =
    'size-4 shrink-0 transition-transform duration-300 ease-out group-data-[collapsible=icon]:hidden motion-reduce:transition-none';

  const navItem = (href: string, label: string, icon?: ReactNode, showUnreadDot?: boolean) => (
    <CollapsedIconTooltip label={label}>
      <Link
        href={href}
        className={cn(
          sb.rowGhost,
          'group-data-[collapsible=icon]:justify-center',
          isActive(href) && sb.navActive,
        )}
      >
        {icon ? (
          <span className={cn('relative flex shrink-0 [&_svg]:size-4', sb.iconMuted)}>
            {icon}
            {showUnreadDot ? (
              <span
                className={cn('absolute -right-0.5 -top-0.5 size-2 rounded-full bg-rose-500 ring-2', sb.unreadDotRing)}
                aria-hidden
              />
            ) : null}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:hidden">{label}</span>
      </Link>
    </CollapsedIconTooltip>
  );

  return (
    <>
      <PageMeta
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        pathWithoutLang={pathWithoutLang}
      />
      <SidebarProvider
        className={cn(
          sb.glassInner,
          'min-h-svh font-sans antialiased',
          /* Marco exterior tipo ventana de Preferencias del sistema */
          appThemeMode === 'dark'
            ? 'app-dark bg-black text-zinc-100'
            : 'bg-[#d1d1d6] text-zinc-900',
          /* Panel Vado Intelligence (md+): hueco cuando está expandido */
          sideChatExpanded &&
            'md:pr-[calc(400px+0.5rem)] md:transition-[padding] md:duration-200 md:ease-out',
        )}
      >
        <Sidebar collapsible="icon" variant="floating" sheetClassName={sb.mobileSheet}>
          <SidebarHeader className={cn('px-3 py-4', sb.borderHeaderFooter)}>
            <Link
              href={path('')}
              className={cn(
                'flex w-full justify-center rounded-lg outline-none focus-visible:ring-2 group-data-[collapsible=icon]:py-2',
                sb.logoRing,
              )}
              aria-label={t('nav.home')}
            >
              <span className="flex max-w-[10.5rem] items-center justify-center [&_svg]:h-8 [&_svg]:w-auto [&_svg]:max-w-full group-data-[collapsible=icon]:max-w-10 group-data-[collapsible=icon]:[&_svg]:h-7">
                {isAppDark ? <VadoLogo white /> : <VadoLogo />}
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="gap-0 px-2 pb-2">
            <nav className="flex flex-col py-3" aria-label={t('sidebarDemo.appAreaNav')}>
              {isAdminSection ? (
                <>
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-general">
                    <h2 id="nav-admin-general" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionGeneral')}
                    </h2>
                    {navItem(hrefDevelopers, t('sidebarDemo.navDevelopers'), <Code2 />, adminDevelopersUnread)}
                  </section>

                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-talent">
                    <h2 id="nav-admin-talent" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionTalent')}
                    </h2>
                    <CollapsedIconTooltip label={t('sidebarDemo.navRecruiters')}>
                      <button
                        type="button"
                        aria-expanded={recruitersOpen}
                        onClick={() => setRecruitersOpen((v) => !v)}
                        className={cn(
                          sb.rowGhost,
                          'min-h-10 w-full group-data-[collapsible=icon]:justify-center',
                          recruitersActive && sb.navActive,
                        )}
                      >
                        <span className={cn('relative flex shrink-0 [&_svg]:size-4', sb.iconMuted)}>
                          <UserSearch />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                          {t('sidebarDemo.navRecruiters')}
                        </span>
                        <ChevronDown
                          className={cn(chevronNavClass, recruitersOpen && 'rotate-180')}
                          aria-hidden
                        />
                      </button>
                    </CollapsedIconTooltip>
                    <SidebarAnimatedCollapse
                      show={recruitersOpen}
                      className="group-data-[collapsible=icon]:hidden"
                    >
                      <div className={cn('ml-2 space-y-1 border-l pl-2.5', sb.borderSubNav)}>
                        <Link
                          href={hrefAdminCreateRecruiter}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminCreateRecruiter) && sb.navActive,
                          )}
                        >
                          <UserPlus className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navCreateRecruiter')}</span>
                        </Link>
                        <Link
                          href={hrefAdminRecruitersList}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminRecruitersList) &&
                              !isActive(hrefAdminCreateRecruiter) &&
                              sb.navActive,
                          )}
                        >
                          <Users className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navRecruiterList')}</span>
                        </Link>
                      </div>
                    </SidebarAnimatedCollapse>

                    <CollapsedIconTooltip label={t('sidebarDemo.navJobs')}>
                      <button
                        type="button"
                        aria-expanded={offersOpen}
                        onClick={() => setOffersOpen((v) => !v)}
                        className={cn(
                          sb.rowGhost,
                          'min-h-10 w-full group-data-[collapsible=icon]:justify-center',
                          offersActive && sb.navActive,
                        )}
                      >
                        <span className={cn('relative flex shrink-0 [&_svg]:size-4', sb.iconMuted)}>
                          <BriefcaseBusiness />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                          {t('sidebarDemo.navJobs')}
                        </span>
                        <ChevronDown className={cn(chevronNavClass, offersOpen && 'rotate-180')} aria-hidden />
                      </button>
                    </CollapsedIconTooltip>
                    <SidebarAnimatedCollapse show={offersOpen} className="group-data-[collapsible=icon]:hidden">
                      <div className={cn('ml-2 space-y-1 border-l pl-2.5', sb.borderSubNav)}>
                        <Link
                          href={hrefAdminCreateJob}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminCreateJob) && sb.navActive,
                          )}
                        >
                          <PlusCircle className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navCreateJob')}</span>
                        </Link>
                        <Link
                          href={hrefAdminActiveJobs}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminActiveJobs) && sb.navActive,
                          )}
                        >
                          <ListChecks className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navActiveJobs')}</span>
                        </Link>
                      </div>
                    </SidebarAnimatedCollapse>

                    {navItem(hrefAdminProjects, t('sidebarDemo.navProjects'), <FolderKanban />, adminProjectsUnread)}
                    {navItem(hrefAdminCompanies, t('sidebarDemo.navCompanies'), <User />, adminCompaniesUnread)}
                  </section>

                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-channels">
                    <h2 id="nav-admin-channels" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionChannels')}
                    </h2>
                    <CollapsedIconTooltip label={t('sidebarDemo.navChannels')}>
                      <button
                        type="button"
                        aria-expanded={channelsOpen}
                        onClick={() => setChannelsOpen((v) => !v)}
                        className={cn(
                          sb.rowGhost,
                          'min-h-10 w-full group-data-[collapsible=icon]:justify-center',
                          channelsActive && sb.navActive,
                        )}
                      >
                        <span className={cn('relative flex shrink-0 [&_svg]:size-4', sb.iconMuted)}>
                          <MessagesSquare />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                          {t('sidebarDemo.navChannels')}
                        </span>
                        <ChevronDown className={cn(chevronNavClass, channelsOpen && 'rotate-180')} aria-hidden />
                      </button>
                    </CollapsedIconTooltip>
                    <SidebarAnimatedCollapse show={channelsOpen} className="group-data-[collapsible=icon]:hidden">
                      <div className={cn('ml-2 space-y-1 border-l pl-2.5', sb.borderSubNav)}>
                        <Link
                          href={hrefAdminCanalesFacebook}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'flex items-center gap-2.5',
                            isActive(hrefAdminCanalesFacebook) && sb.navActive,
                          )}
                        >
                          <AdminChannelNavIcon channel="facebook" />
                          <span className="truncate">{t('sidebarDemo.navChannelFacebook')}</span>
                        </Link>
                        <Link
                          href={hrefAdminCanalesWhatsApp}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'flex items-center gap-2.5',
                            isActive(hrefAdminCanalesWhatsApp) && sb.navActive,
                          )}
                        >
                          <AdminChannelNavIcon channel="whatsapp" />
                          <span className="truncate">{t('sidebarDemo.navChannelWhatsApp')}</span>
                        </Link>
                        <Link
                          href={hrefAdminCanalesInstagram}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'flex items-center gap-2.5',
                            isActive(hrefAdminCanalesInstagram) && sb.navActive,
                          )}
                        >
                          <AdminChannelNavIcon channel="instagram" />
                          <span className="truncate">{t('sidebarDemo.navChannelInstagram')}</span>
                        </Link>
                        <Link
                          href={hrefAdminCanalesBotTest}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'flex items-center gap-2.5',
                            isActive(hrefAdminCanalesBotTest) && sb.navActive,
                          )}
                        >
                          <AdminChannelNavIcon channel="bot-test" />
                          <span className="truncate">{t('sidebarDemo.navChannelBotTest')}</span>
                        </Link>
                      </div>
                    </SidebarAnimatedCollapse>
                  </section>

                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-account">
                    <h2 id="nav-admin-account" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionAccount')}
                    </h2>
                    {navItem(hrefAdminSettings, t('sidebarDemo.navSettings'), <Settings />)}
                  </section>
                </>
              ) : isRecruiterPortal ? (
                <>
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-rec-personal">
                    <h2 id="nav-rec-personal" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionPersonal')}
                    </h2>
                    {navItem(hrefRecruiterProfile, t('sidebarDemo.navProfile'), <CircleUser />)}
                  </section>

                  {canRecruiterPanel('panel:developers') ||
                  canRecruiterPanel('panel:jobs') ||
                  canRecruiterPanel('panel:projects') ||
                  canRecruiterPanel('panel:companies') ? (
                    <section className={sidebarNavSectionShell} aria-labelledby="nav-rec-talent">
                      <h2 id="nav-rec-talent" className={sidebarNavSectionTitle}>
                        {t('sidebarDemo.navSectionTalent')}
                      </h2>
                      {canRecruiterPanel('panel:developers')
                        ? navItem(
                            hrefRecruiterDevelopers,
                            t('sidebarDemo.navDevelopers'),
                            <Code2 />,
                            adminDevelopersUnread,
                          )
                        : null}
                      {canRecruiterPanel('panel:jobs') ? (
                        <>
                          <CollapsedIconTooltip label={t('sidebarDemo.navJobs')}>
                            <button
                              type="button"
                              aria-expanded={offersOpen}
                              onClick={() => setOffersOpen((v) => !v)}
                              className={cn(
                                sb.rowGhost,
                                'min-h-10 w-full group-data-[collapsible=icon]:justify-center',
                                offersActive && sb.navActive,
                              )}
                            >
                              <span className={cn('relative flex shrink-0 [&_svg]:size-4', sb.iconMuted)}>
                                <BriefcaseBusiness />
                              </span>
                              <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                                {t('sidebarDemo.navJobs')}
                              </span>
                              <ChevronDown className={cn(chevronNavClass, offersOpen && 'rotate-180')} aria-hidden />
                            </button>
                          </CollapsedIconTooltip>
                          <SidebarAnimatedCollapse show={offersOpen} className="group-data-[collapsible=icon]:hidden">
                            <div className={cn('ml-2 space-y-1 border-l pl-2.5', sb.borderSubNav)}>
                              <Link
                                href={hrefRecruiterCreateJob}
                                className={cn(
                                  sb.subRowBase,
                                  sb.subNavText,
                                  'gap-2',
                                  isActive(hrefRecruiterCreateJob) && sb.navActive,
                                )}
                              >
                                <PlusCircle
                                  className={cn('size-4 shrink-0', sb.iconMuted)}
                                  strokeWidth={2}
                                  aria-hidden
                                />
                                <span className="truncate">{t('sidebarDemo.navCreateJob')}</span>
                              </Link>
                              <Link
                                href={hrefRecruiterActiveJobs}
                                className={cn(
                                  sb.subRowBase,
                                  sb.subNavText,
                                  'gap-2',
                                  isActive(hrefRecruiterActiveJobs) && sb.navActive,
                                )}
                              >
                                <ListChecks
                                  className={cn('size-4 shrink-0', sb.iconMuted)}
                                  strokeWidth={2}
                                  aria-hidden
                                />
                                <span className="truncate">{t('sidebarDemo.navActiveJobs')}</span>
                              </Link>
                            </div>
                          </SidebarAnimatedCollapse>
                        </>
                      ) : null}
                      {canRecruiterPanel('panel:projects')
                        ? navItem(
                            hrefRecruiterProjects,
                            t('sidebarDemo.navProjects'),
                            <FolderKanban />,
                            adminProjectsUnread,
                          )
                        : null}
                      {canRecruiterPanel('panel:companies')
                        ? navItem(
                            hrefRecruiterCompanies,
                            t('sidebarDemo.navCompanies'),
                            <User />,
                            adminCompaniesUnread,
                          )
                        : null}
                    </section>
                  ) : null}

                  <section className={sidebarNavSectionShell} aria-labelledby="nav-rec-account">
                    <h2 id="nav-rec-account" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionAccount')}
                    </h2>
                    {navItem(hrefRecruiterSettings, t('sidebarDemo.navSettings'), <Settings />)}
                  </section>
                </>
              ) : isCompanySection ? (
                <>
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-co-general">
                    <h2 id="nav-co-general" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionGeneral')}
                    </h2>
                    {navItem(hrefCompanyProfile, t('sidebarDemo.navProfile'), <User />)}
                    {navItem(hrefCompanyProjects, t('sidebarDemo.navProjects'), <FolderKanban />, companyProjectsUnread)}
                  </section>
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-co-account">
                    <h2 id="nav-co-account" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionAccount')}
                    </h2>
                    {navItem(hrefCompanySettings, t('sidebarDemo.navSettings'), <Settings />)}
                  </section>
                </>
              ) : isDevSection ? (
                <>
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-dev-overview">
                    <h2 id="nav-dev-overview" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionOverview')}
                    </h2>
                    {navItem(hrefDevDashboard, t('sidebarDemo.navDashboard'), <LayoutDashboard />)}
                  </section>
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-dev-personal">
                    <h2 id="nav-dev-personal" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionPersonal')}
                    </h2>
                    {navItem(hrefProfile, t('sidebarDemo.navProfile'), <User />)}
                  </section>
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-dev-work">
                    <h2 id="nav-dev-work" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionWorkBlock')}
                    </h2>
                    <CollapsedIconTooltip label={t('sidebarDemo.navWork')}>
                      <button
                        type="button"
                        aria-expanded={trabajoOpen}
                        onClick={() => setTrabajoOpen((v) => !v)}
                        className={cn(
                          sb.rowGhost,
                          'min-h-10 w-full group-data-[collapsible=icon]:justify-center',
                          trabajoGroupActive && sb.navActive,
                        )}
                      >
                        <span className={cn('relative flex shrink-0 [&_svg]:size-4', sb.iconMuted)}>
                          <BriefcaseBusiness />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                          {t('sidebarDemo.navWork')}
                        </span>
                        <ChevronDown className={cn(chevronNavClass, trabajoOpen && 'rotate-180')} aria-hidden />
                      </button>
                    </CollapsedIconTooltip>
                    <SidebarAnimatedCollapse show={trabajoOpen} className="group-data-[collapsible=icon]:hidden">
                      <div className={cn('ml-2 space-y-1 border-l pl-2.5', sb.borderSubNav)}>
                        <Link
                          href={hrefDevDashboard}
                          className={cn(sb.subRowMuted, 'gap-2', nuevasAperturasActive && sb.navActive)}
                        >
                          <LayoutDashboard
                            className={cn('size-4 shrink-0', sb.iconMuted)}
                            strokeWidth={2}
                            aria-hidden
                          />
                          <span className="truncate">{t('sidebarDemo.navNuevasAperturas')}</span>
                        </Link>
                        <Link
                          href={hrefEmpleosOfertas}
                          className={cn(sb.subRowMuted, 'gap-2', empleosOfertasActive && sb.navActive)}
                        >
                          <BriefcaseBusiness
                            className={cn('size-4 shrink-0', sb.iconMuted)}
                            strokeWidth={2}
                            aria-hidden
                          />
                          <span className="truncate">{t('sidebarDemo.navEmpleos')}</span>
                        </Link>
                        <Link
                          href={hrefEmpleosGuardadas}
                          className={cn(sb.subRowMuted, 'gap-2', guardadasActive && sb.navActive)}
                        >
                          <Bookmark className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('devDashboard.tabSavedJobs')}</span>
                        </Link>
                      </div>
                    </SidebarAnimatedCollapse>

                    {navItem(hrefProjects, t('sidebarDemo.navProjects'), <FolderKanban />, devProjectsUnread)}
                    {navItem(hrefEmpleosPostulacion, t('sidebarDemo.navApplications'), <ClipboardList />)}
                  </section>
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-dev-account">
                    <h2 id="nav-dev-account" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionAccount')}
                    </h2>
                    {navItem(hrefDevSettings, t('sidebarDemo.navSettings'), <Settings />)}
                  </section>
                </>
              ) : null}
            </nav>
          </SidebarContent>

          <SidebarFooter className={cn('p-2', sb.borderSeparator)}>
            <CollapsedIconTooltip label={t('sidebarDemo.logOut')}>
              {isAdminSection ? (
                <button
                  type="button"
                  className={sb.footerBtn}
                  onClick={() => {
                    logoutAdmin();
                    setLocation(path(''));
                  }}
                >
                  <LogOut className="size-4 shrink-0" aria-hidden />
                  <span className="group-data-[collapsible=icon]:hidden">{t('sidebarDemo.logOut')}</span>
                </button>
              ) : isRecruiterPortal ? (
                <button
                  type="button"
                  className={sb.footerBtn}
                  onClick={() => {
                    logoutRecruiter();
                    setLocation(path(''));
                  }}
                >
                  <LogOut className="size-4 shrink-0" aria-hidden />
                  <span className="group-data-[collapsible=icon]:hidden">{t('sidebarDemo.logOut')}</span>
                </button>
              ) : isDevSection ? (
                <button
                  type="button"
                  className={sb.footerBtn}
                  onClick={() => {
                    logoutDeveloper();
                    setLocation(path(''));
                  }}
                >
                  <LogOut className="size-4 shrink-0" aria-hidden />
                  <span className="group-data-[collapsible=icon]:hidden">{t('sidebarDemo.logOut')}</span>
                </button>
              ) : isCompanySection ? (
                <button
                  type="button"
                  className={sb.footerBtn}
                  onClick={() => {
                    logoutCompany();
                    setLocation(path(''));
                  }}
                >
                  <LogOut className="size-4 shrink-0" aria-hidden />
                  <span className="group-data-[collapsible=icon]:hidden">{t('sidebarDemo.logOut')}</span>
                </button>
              ) : (
                <Link
                  href={path('')}
                  className={sb.footerBtn}
                >
                  <LogOut className="size-4 shrink-0" aria-hidden />
                  <span className="group-data-[collapsible=icon]:hidden">{t('sidebarDemo.logOut')}</span>
                </Link>
              )}
            </CollapsedIconTooltip>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset
          className={cn(
            'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-lg',
            appThemeMode === 'dark'
              ? 'border-zinc-700/55 bg-zinc-900 shadow-black/50'
              : 'border-white/90 bg-white shadow-md shadow-zinc-900/10',
            'm-2 max-md:mx-2.5 max-md:mt-2 max-md:mb-[max(0.5rem,env(safe-area-inset-bottom,0px))]',
            'max-md:min-h-0 max-md:flex-1',
          )}
        >
          <header
            className={cn(
              'flex h-[52px] max-md:h-12 shrink-0 items-center gap-2 border-b px-5 max-md:gap-1.5 max-md:px-3',
              appThemeMode === 'dark'
                ? 'border-white/[0.07] bg-zinc-900'
                : 'border-black/[0.06] bg-white',
            )}
          >
            <SidebarTrigger className="-ml-1 max-md:size-8" />
            <Separator orientation="vertical" className="mr-1 hidden data-[orientation=vertical]:h-4 md:block" />
            <h1 className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-tight max-md:text-sm md:text-[17px]">
              {title}
            </h1>
            <div className="ml-auto flex w-max max-w-[min(100%,18rem)] shrink-0 items-center justify-end">
              <VadoIntelligenceChatToggle
                expanded={sideChatExpanded}
                onToggle={() => setSideChatExpanded((v) => !v)}
                isDark={appThemeMode === 'dark'}
                controlsId={vadoIntelPanelId}
              />
            </div>
          </header>
          <div
            className={cn(
              'flex min-h-0 min-w-0 flex-1 flex-col',
              contentFlush
                ? cn(
                    'overflow-hidden overscroll-none p-0 pb-[max(0px,env(safe-area-inset-bottom,0px))]',
                    appThemeMode === 'dark' ? 'bg-zinc-950' : 'bg-[#f2f2f7]',
                  )
                : cn(
                    'px-5 py-5 max-md:px-4 max-md:py-4 max-md:pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
                    contentOverflow === 'hidden'
                      ? 'gap-0 overflow-hidden overscroll-none'
                      : 'gap-6 overflow-y-auto max-md:gap-5',
                    appThemeMode === 'dark' ? 'bg-zinc-950' : 'bg-[#f2f2f7]',
                  ),
            )}
          >
            {children}
          </div>
        </SidebarInset>

        <AppSideChatDock
          theme={appThemeMode}
          open={sideChatExpanded}
          onOpenChange={setSideChatExpanded}
          regionId={vadoIntelPanelId}
        />
      </SidebarProvider>
    </>
  );
}
