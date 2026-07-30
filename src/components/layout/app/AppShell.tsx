import { useEffect, useId, useMemo, useRef, useState, useCallback, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import {
  Bookmark,
  Bell,
  Bot,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleUser,
  ClipboardList,
  Code2,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Megaphone,
  MessagesSquare,
  Plug,
  PlusCircle,
  Search,
  Settings,
  Settings2,
  Sparkles,
  User,
  UserPlus,
  UserSearch,
  Users,
  Target,
} from 'lucide-react';
import { VadoLogo } from '@/assets/vado-logo';
import { PageMeta } from '@/components/PageMeta';
import { useLocale } from '@/hooks/useLocale';
import {
  readAdminChannelsNavOpen,
  readAdminSettingsNavOpen,
  readAdminSidebarScrollTop,
  readAdminUtilitiesNavOpen,
  writeAdminChannelsNavOpen,
  writeAdminSettingsNavOpen,
  writeAdminSidebarScrollTop,
  writeAdminUtilitiesNavOpen,
} from '@/lib/adminSidebarNavState';
import {
  ADMIN_SIDEBAR_VISIBILITY_CHANGE_EVENT,
  isAdminSidebarSectionVisible,
  readAdminSidebarVisibility,
  type AdminSidebarVisibility,
} from '@/lib/adminSidebarVisibility';
import { ADMIN_AUTH_CHANGE_EVENT, logoutAdmin } from '@/lib/adminAuth';
import { COMPANY_AUTH_CHANGE_EVENT, logoutCompany } from '@/lib/companyAuth';
import { DEV_AUTH_CHANGE_EVENT, logoutDeveloper } from '@/lib/devAuth';
import {
  RECRUITER_AUTH_CHANGE_EVENT,
  getRecruiterPermissions,
  logoutRecruiter,
} from '@/lib/recruiterAuth';
import { hasRecruiterPanelPermission } from '@/lib/recruiterPanel';
import { APP_THEME_CHANGE_EVENT, getStoredAppTheme, type AppThemeMode } from '@/lib/appTheme';
import { hydrateThemeFromServer, hydrateUserPreferences } from '@/lib/userPreferencesSync';
import { migrateLegacyWorkspaceStorageOnce } from '@/lib/workspaceBrowserMigrate';
import { isUserAuthenticated } from '@/lib/userAuthorizedFetch';
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
import {
  resolveInitialSideChatOpen,
  writeSideChatOpen,
} from '@/lib/appSideChatUiState';

export type AppShellProps = {
  pathWithoutLang: string;
  title: string;
  description: string;
  children: ReactNode;
  
  contentOverflow?: 'scroll' | 'hidden';
  
  contentFlush?: boolean;
  
  hidePageTitle?: boolean;
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


function buildAppSidebarChrome(isDark: boolean): AppSidebarChrome {
  const glassInner = isDark
    ? cn(
        '[&_[data-slot=sidebar-inner]]:!relative [&_[data-slot=sidebar-inner]]:!overflow-hidden [&_[data-slot=sidebar-inner]]:!rounded-xl [&_[data-slot=sidebar-inner]]:!bg-transparent',
        'group-data-[collapsible=icon]:[&_[data-slot=sidebar-inner]]:!rounded-lg',
        '[&_[data-slot=sidebar-inner]]:!border [&_[data-slot=sidebar-inner]]:!border-white/[0.18]',
        '[&_[data-slot=sidebar-inner]]:!bg-gradient-to-br [&_[data-slot=sidebar-inner]]:!from-zinc-950/58 [&_[data-slot=sidebar-inner]]:!via-zinc-900/42 [&_[data-slot=sidebar-inner]]:!to-zinc-900/24',
        '[&_[data-slot=sidebar-inner]]:!backdrop-blur-[48px] [&_[data-slot=sidebar-inner]]:!backdrop-saturate-[1.85] [&_[data-slot=sidebar-inner]]:!backdrop-brightness-[1.08]',
        '[&_[data-slot=sidebar-inner]]:!text-zinc-100',
        '[&_[data-slot=sidebar-inner]]:!shadow-[0_26px_64px_-18px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.26),inset_0_-22px_52px_-26px_rgba(0,0,0,0.28)]',
        '[&_[data-slot=sidebar-inner]]:!ring-1 [&_[data-slot=sidebar-inner]]:!ring-inset [&_[data-slot=sidebar-inner]]:!ring-white/[0.07]',
      )
    : cn(
        '[&_[data-slot=sidebar-inner]]:!relative [&_[data-slot=sidebar-inner]]:!overflow-hidden [&_[data-slot=sidebar-inner]]:!rounded-xl [&_[data-slot=sidebar-inner]]:!bg-transparent',
        'group-data-[collapsible=icon]:[&_[data-slot=sidebar-inner]]:!rounded-lg',
        '[&_[data-slot=sidebar-inner]]:!border [&_[data-slot=sidebar-inner]]:!border-white/[0.42]',
        '[&_[data-slot=sidebar-inner]]:!bg-gradient-to-br [&_[data-slot=sidebar-inner]]:!from-white/14 [&_[data-slot=sidebar-inner]]:!via-zinc-200/32 [&_[data-slot=sidebar-inner]]:!to-zinc-500/38',
        '[&_[data-slot=sidebar-inner]]:!backdrop-blur-[40px] [&_[data-slot=sidebar-inner]]:!backdrop-saturate-[1.35]',
        '[&_[data-slot=sidebar-inner]]:!text-zinc-900',
        '[&_[data-slot=sidebar-inner]]:!shadow-[0_14px_44px_-10px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.72),inset_0_-14px_38px_-18px_rgba(0,0,0,0.07)]',
        '[&_[data-slot=sidebar-inner]]:!ring-1 [&_[data-slot=sidebar-inner]]:!ring-inset [&_[data-slot=sidebar-inner]]:!ring-zinc-900/[0.05]',
      );

  const mobileSheet = isDark
    ? cn(
        '!relative !overflow-hidden !rounded-xl !border !border-white/[0.18] !bg-transparent !text-zinc-100 shadow-none',
        '!bg-gradient-to-br !from-zinc-950/58 !via-zinc-900/42 !to-zinc-900/24',
        '!backdrop-blur-[48px] !backdrop-saturate-[1.85] !backdrop-brightness-[1.08]',
        '!shadow-[0_26px_64px_-18px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.24)]',
        '!ring-1 !ring-inset !ring-white/[0.07]',
        'pt-[max(0.75rem,env(safe-area-inset-top,0px))]',
        'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
      )
    : cn(
        '!relative !overflow-hidden !rounded-xl !border !border-white/[0.42] !bg-transparent !text-zinc-900 shadow-none',
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
    'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left text-sm transition-[background-color,box-shadow,color] duration-200',
    isDark ? 'text-white/85' : 'text-zinc-800',
    navHover,
  );

  const subRowBase = cn(
    'flex min-h-10 items-center rounded-md px-2.5 py-2 text-xs leading-snug transition-[background-color,box-shadow,color] duration-200',
    navHover,
  );

  const subRowMuted = cn(subRowBase, isDark ? 'text-white/70' : 'text-zinc-600');

  const subNavText = isDark ? 'text-white/85' : 'text-zinc-800';

  const footerBtn = cn(
    'flex w-full items-center justify-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-[background-color,box-shadow,transform] duration-200 active:scale-[0.99] group-data-[collapsible=icon]:px-2',
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

type SidebarNavChrome = AppSidebarChrome;

function SidebarSubnavToggleButton({
  open,
  active,
  collapsedHref,
  onToggle,
  sb,
  chevronNavClass,
  label,
  icon,
}: {
  open: boolean;
  active: boolean;
  collapsedHref: string;
  onToggle: () => void;
  sb: SidebarNavChrome;
  chevronNavClass: string;
  label: string;
  icon: ReactNode;
}) {
  const [, setLocation] = useLocation();
  const { state, isMobile } = useSidebar();

  const handleClick = () => {
    if (state === 'collapsed' && !isMobile) {
      setLocation(collapsedHref);
      return;
    }
    onToggle();
  };

  return (
    <CollapsedIconTooltip label={label}>
      <button
        type="button"
        aria-expanded={open}
        onClick={handleClick}
        className={cn(
          sb.rowGhost,
          'min-h-10 w-full group-data-[collapsible=icon]:justify-center',
          active && sb.navActive,
        )}
      >
        <span className={cn('relative flex shrink-0 [&_svg]:size-4', sb.iconMuted)}>{icon}</span>
        <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">{label}</span>
        <ChevronDown className={cn(chevronNavClass, open && 'rotate-180')} aria-hidden />
      </button>
    </CollapsedIconTooltip>
  );
}


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
  hidePageTitle = false,
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
  const [channelsOpen, setChannelsOpen] = useState(() => readAdminChannelsNavOpen());
  const [settingsOpen, setSettingsOpen] = useState(
    () =>
      readAdminSettingsNavOpen() ||
      normalizePath(pathWithoutLang).startsWith('/app/admin/settings'),
  );
  const [utilitiesOpen, setUtilitiesOpen] = useState(
    () => {
      const p = normalizePath(pathWithoutLang);
      return (
        readAdminUtilitiesNavOpen() ||
        p === '/app/admin/utileria/tareas' ||
        p === '/app/admin/utileria/recordatorios'
      );
    },
  );
  const [adminSidebarVisibility, setAdminSidebarVisibility] = useState<AdminSidebarVisibility>(
    () => readAdminSidebarVisibility(),
  );
  const [trabajoOpen, setTrabajoOpen] = useState(false);
  const sidebarContentRef = useRef<HTMLDivElement>(null);
  const [appThemeMode, setAppThemeMode] = useState<AppThemeMode>(() => getStoredAppTheme());
  const [sideChatExpanded, setSideChatExpandedState] = useState(() => resolveInitialSideChatOpen());
  const vadoIntelPanelId = useId();
  const canonicalPath = path(pathWithoutLang);

  const setSideChatExpanded = useCallback((next: boolean | ((prev: boolean) => boolean)) => {
    setSideChatExpandedState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;
      writeSideChatOpen(value);
      return value;
    });
  }, []);

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
  const hrefAdminOpportunities = path('/app/admin/oportunidades');
  const hrefAdminLeadsMyEvolve = path('/app/admin/leads/my-evolve');
  const hrefAdminAutoLeads = path('/app/admin/leads/auto');
  const hrefAdminAutoSearch = path('/app/admin/leads/auto-search');
  const hrefAdminCampanias = path('/app/admin/campanas');
  const hrefAdminCanalesFacebook = path('/app/admin/canales/facebook');
  const hrefAdminCanalesWhatsApp = path('/app/admin/canales/whatsapp');
  const hrefAdminCanalesInstagram = path('/app/admin/canales/instagram');
  const hrefAdminCanalesBotTest = path('/app/admin/canales/bot-test');
  const hrefAdminSettings = path('/app/admin/settings');
  const hrefAdminSettingsIntegraciones = path('/app/admin/settings/integraciones');
  const hrefAdminSettingsCuestionario = path('/app/admin/settings/cuestionario');
  const hrefAdminUtileriaTareas = path('/app/admin/utileria/tareas');
  const hrefAdminUtileriaRecordatorios = path('/app/admin/utileria/recordatorios');
  const hrefAdminUtileriaCalendario = path('/app/admin/utileria/calendario');
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

  const settingsActive = currentAppPath.startsWith('/app/admin/settings');

  const utilitiesActive =
    isActive(hrefAdminUtileriaTareas) || isActive(hrefAdminUtileriaRecordatorios);

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
    if (!channelsActive) return;
    queueMicrotask(() => {
      setChannelsOpen(true);
      writeAdminChannelsNavOpen(true);
    });
  }, [channelsActive]);

  useEffect(() => {
    if (!settingsActive) return;
    queueMicrotask(() => {
      setSettingsOpen(true);
      writeAdminSettingsNavOpen(true);
    });
  }, [settingsActive]);

  useEffect(() => {
    if (!utilitiesActive) return;
    queueMicrotask(() => {
      setUtilitiesOpen(true);
      writeAdminUtilitiesNavOpen(true);
    });
  }, [utilitiesActive]);

  const toggleSettingsNav = () => {
    setSettingsOpen((v) => {
      const next = !v;
      writeAdminSettingsNavOpen(next);
      return next;
    });
  };

  const toggleUtilitiesNav = () => {
    setUtilitiesOpen((v) => {
      const next = !v;
      writeAdminUtilitiesNavOpen(next);
      return next;
    });
  };

  useEffect(() => {
    const el = sidebarContentRef.current;
    if (!el) return;
    const savedScrollTop = readAdminSidebarScrollTop();
    if (savedScrollTop > 0) {
      el.scrollTop = savedScrollTop;
    }
  }, []);

  const handleSidebarScroll = (event: React.UIEvent<HTMLDivElement>) => {
    writeAdminSidebarScrollTop(event.currentTarget.scrollTop);
  };

  const toggleChannelsNav = () => {
    setChannelsOpen((v) => {
      const next = !v;
      writeAdminChannelsNavOpen(next);
      return next;
    });
  };

  useEffect(() => {
    if (trabajoGroupActive) queueMicrotask(() => setTrabajoOpen(true));
  }, [trabajoGroupActive]);

  useEffect(() => {
    const sync = () => setAppThemeMode(getStoredAppTheme());
    sync();
    window.addEventListener(APP_THEME_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_THEME_CHANGE_EVENT, sync);
  }, []);

  useEffect(() => {
    const sync = () => setAdminSidebarVisibility(readAdminSidebarVisibility());
    window.addEventListener(ADMIN_SIDEBAR_VISIBILITY_CHANGE_EVENT, sync);
    return () => window.removeEventListener(ADMIN_SIDEBAR_VISIBILITY_CHANGE_EVENT, sync);
  }, []);

  useEffect(() => {
    void (async () => {
      await migrateLegacyWorkspaceStorageOnce();
      await Promise.all([hydrateUserPreferences(), hydrateThemeFromServer()]);
      setAppThemeMode(getStoredAppTheme());
    })();
  }, []);

  useEffect(() => {
    const syncThemeFromServer = () => {
      if (!isUserAuthenticated()) return;
      void hydrateThemeFromServer().then(() => setAppThemeMode(getStoredAppTheme()));
    };
    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, syncThemeFromServer);
    window.addEventListener(DEV_AUTH_CHANGE_EVENT, syncThemeFromServer);
    window.addEventListener(COMPANY_AUTH_CHANGE_EVENT, syncThemeFromServer);
    return () => {
      window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, syncThemeFromServer);
      window.removeEventListener(DEV_AUTH_CHANGE_EVENT, syncThemeFromServer);
      window.removeEventListener(COMPANY_AUTH_CHANGE_EVENT, syncThemeFromServer);
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
    'mb-3 space-y-1 rounded-lg p-2 last:mb-0',
    isAppDark
      ? 'bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-inset ring-white/[0.08]'
      : 'bg-black/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] ring-1 ring-inset ring-black/[0.07]',
    'group-data-[collapsible=icon]:mb-2 group-data-[collapsible=icon]:rounded-md group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:shadow-none group-data-[collapsible=icon]:ring-0',
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
          'flex h-svh max-h-svh min-h-0 w-full overflow-x-hidden overflow-y-hidden font-sans antialiased',
          
          appThemeMode === 'dark'
            ? 'app-dark bg-black text-zinc-100'
            : 'bg-[#d1d1d6] text-zinc-900',
          sideChatExpanded && 'md:transition-[padding] md:duration-200 md:ease-out',
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

          <SidebarContent
            ref={sidebarContentRef}
            onScroll={handleSidebarScroll}
            className="min-h-0 flex-1 gap-0 overflow-y-auto overscroll-y-contain px-2 pb-2"
          >
            <nav className="flex flex-col py-3" aria-label={t('sidebarDemo.appAreaNav')}>
              {isAdminSection ? (
                <>
                  {isAdminSidebarSectionVisible(adminSidebarVisibility, 'general') ? (
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-general">
                    <h2 id="nav-admin-general" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionGeneral')}
                    </h2>
                    {navItem(hrefAdminProjects, t('sidebarDemo.navProjects'), <FolderKanban />, adminProjectsUnread)}
                  </section>
                  ) : null}

                  {isAdminSidebarSectionVisible(adminSidebarVisibility, 'talent') ? (
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-talent">
                    <h2 id="nav-admin-talent" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionTalent')}
                    </h2>
                    {navItem(hrefDevelopers, t('sidebarDemo.navDevelopers'), <Code2 />, adminDevelopersUnread)}
                    <SidebarSubnavToggleButton
                      open={recruitersOpen}
                      active={recruitersActive}
                      collapsedHref={hrefAdminRecruitersList}
                      onToggle={() => setRecruitersOpen((v) => !v)}
                      sb={sb}
                      chevronNavClass={chevronNavClass}
                      label={t('sidebarDemo.navRecruiters')}
                      icon={<UserSearch />}
                    />
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

                    <SidebarSubnavToggleButton
                      open={offersOpen}
                      active={offersActive}
                      collapsedHref={hrefAdminActiveJobs}
                      onToggle={() => setOffersOpen((v) => !v)}
                      sb={sb}
                      chevronNavClass={chevronNavClass}
                      label={t('sidebarDemo.navJobs')}
                      icon={<BriefcaseBusiness />}
                    />
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
                  </section>
                  ) : null}

                  {isAdminSidebarSectionVisible(adminSidebarVisibility, 'sales') ? (
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-sales">
                    <h2 id="nav-admin-sales" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionSales')}
                    </h2>
                    {navItem(
                      hrefAdminCompanies,
                      t('sidebarDemo.navCompanies'),
                      <ClipboardList />,
                      adminCompaniesUnread,
                    )}
                    {navItem(
                      hrefAdminLeadsMyEvolve,
                      t('sidebarDemo.navLeadsMyEvolve'),
                      <Sparkles />,
                    )}
                    {navItem(
                      hrefAdminAutoLeads,
                      t('sidebarDemo.navAutoLeads'),
                      <Bot />,
                    )}
                    {navItem(
                      hrefAdminAutoSearch,
                      t('sidebarDemo.navAutoSearch'),
                      <Search />,
                    )}
                    {navItem(
                      hrefAdminOpportunities,
                      t('sidebarDemo.navOpportunities'),
                      <Target />,
                    )}
                    {navItem(
                      hrefAdminCampanias,
                      t('sidebarDemo.navCampanias'),
                      <Megaphone />,
                    )}
                  </section>
                  ) : null}

                  {isAdminSidebarSectionVisible(adminSidebarVisibility, 'channels') ? (
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-channels">
                    <h2 id="nav-admin-channels" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionChannels')}
                    </h2>
                    <SidebarSubnavToggleButton
                      open={channelsOpen}
                      active={channelsActive}
                      collapsedHref={hrefAdminCanalesWhatsApp}
                      onToggle={toggleChannelsNav}
                      sb={sb}
                      chevronNavClass={chevronNavClass}
                      label={t('sidebarDemo.navChannels')}
                      icon={<MessagesSquare />}
                    />
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
                  ) : null}

                  {isAdminSidebarSectionVisible(adminSidebarVisibility, 'utilities') ? (
                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-utilities">
                    <h2 id="nav-admin-utilities" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionUtilities')}
                    </h2>
                    <SidebarSubnavToggleButton
                      open={utilitiesOpen}
                      active={utilitiesActive}
                      collapsedHref={hrefAdminUtileriaTareas}
                      onToggle={toggleUtilitiesNav}
                      sb={sb}
                      chevronNavClass={chevronNavClass}
                      label={t('sidebarDemo.navUtilities')}
                      icon={<Boxes />}
                    />
                    <SidebarAnimatedCollapse show={utilitiesOpen} className="group-data-[collapsible=icon]:hidden">
                      <div className={cn('ml-2 space-y-1 border-l pl-2.5', sb.borderSubNav)}>
                        <Link
                          href={hrefAdminUtileriaTareas}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminUtileriaTareas) && sb.navActive,
                          )}
                        >
                          <ListChecks className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navUtilitiesTasks')}</span>
                        </Link>
                        <Link
                          href={hrefAdminUtileriaRecordatorios}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminUtileriaRecordatorios) && sb.navActive,
                          )}
                        >
                          <Bell className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navUtilitiesReminders')}</span>
                        </Link>
                      </div>
                    </SidebarAnimatedCollapse>
                    {navItem(
                      hrefAdminUtileriaCalendario,
                      t('sidebarDemo.navUtilitiesCalendar'),
                      <CalendarDays />,
                    )}
                  </section>
                  ) : null}

                  <section className={sidebarNavSectionShell} aria-labelledby="nav-admin-account">
                    <h2 id="nav-admin-account" className={sidebarNavSectionTitle}>
                      {t('sidebarDemo.navSectionAccount')}
                    </h2>
                    <SidebarSubnavToggleButton
                      open={settingsOpen}
                      active={settingsActive}
                      collapsedHref={hrefAdminSettings}
                      onToggle={toggleSettingsNav}
                      sb={sb}
                      chevronNavClass={chevronNavClass}
                      label={t('sidebarDemo.navSettings')}
                      icon={<Settings />}
                    />
                    <SidebarAnimatedCollapse show={settingsOpen} className="group-data-[collapsible=icon]:hidden">
                      <div className={cn('ml-2 space-y-1 border-l pl-2.5', sb.borderSubNav)}>
                        <Link
                          href={hrefAdminSettings}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminSettings) && sb.navActive,
                          )}
                        >
                          <Settings2 className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navSettingsGeneral')}</span>
                        </Link>
                        <Link
                          href={hrefAdminSettingsIntegraciones}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminSettingsIntegraciones) && sb.navActive,
                          )}
                        >
                          <Plug className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navSettingsIntegrations')}</span>
                        </Link>
                        <Link
                          href={hrefAdminSettingsCuestionario}
                          className={cn(
                            sb.subRowBase,
                            sb.subNavText,
                            'gap-2',
                            isActive(hrefAdminSettingsCuestionario) && sb.navActive,
                          )}
                        >
                          <ClipboardList className={cn('size-4 shrink-0', sb.iconMuted)} strokeWidth={2} aria-hidden />
                          <span className="truncate">{t('sidebarDemo.navSettingsQuestionnaire')}</span>
                        </Link>
                      </div>
                    </SidebarAnimatedCollapse>
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
                          <SidebarSubnavToggleButton
                            open={offersOpen}
                            active={offersActive}
                            collapsedHref={hrefRecruiterActiveJobs}
                            onToggle={() => setOffersOpen((v) => !v)}
                            sb={sb}
                            chevronNavClass={chevronNavClass}
                            label={t('sidebarDemo.navJobs')}
                            icon={<BriefcaseBusiness />}
                          />
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

          <SidebarFooter
            className={cn(
              'mt-auto shrink-0 border-t p-2 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
              sb.borderSeparator,
            )}
          >
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
            'flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-lg',
            
            'h-[calc(100svh-1rem)] max-h-[calc(100svh-1rem)]',
            'ml-0 mt-2 mb-2 max-md:mx-2 max-md:mt-2',
            sideChatExpanded
              ? 'md:mr-[calc(400px+0.75rem)]'
              : 'mr-2 max-md:mr-2',
            'max-md:mb-[max(0.5rem,env(safe-area-inset-bottom,0px))]',
            'max-md:h-[calc(100svh-1rem-env(safe-area-inset-bottom,0px))] max-md:max-h-[calc(100svh-1rem-env(safe-area-inset-bottom,0px))]',
            appThemeMode === 'dark'
              ? 'border-zinc-700/55 bg-zinc-900 shadow-black/50'
              : 'border-white/90 bg-white shadow-md shadow-zinc-900/10',

          )}
        >
          <header
            className={cn(
              'flex shrink-0 items-center gap-2 border-b max-md:gap-1.5 max-md:px-3',
              hidePageTitle ? 'h-11 px-3 max-md:h-10' : 'h-[52px] px-5 max-md:h-12',
              appThemeMode === 'dark'
                ? 'border-white/[0.07] bg-zinc-900'
                : 'border-black/[0.06] bg-white',
            )}
          >
            <SidebarTrigger className="-ml-1 max-md:size-8" />
            {!hidePageTitle ? (
              <>
                <Separator
                  orientation="vertical"
                  className="mr-1 hidden data-[orientation=vertical]:h-4 md:block"
                />
                <h1 className="min-w-0 flex-1 truncate text-[17px] font-semibold tracking-tight max-md:text-sm md:text-[17px]">
                  {title}
                </h1>
              </>
            ) : (
              <div className="min-w-0 flex-1" aria-hidden />
            )}
            <div
              className={cn(
                'flex w-max max-w-[min(100%,18rem)] shrink-0 items-center justify-end',
                hidePageTitle ? '' : 'ml-auto',
              )}
            >
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
                    contentOverflow === 'hidden'
                      ? cn(
                          'flex h-0 min-h-0 flex-1 flex-col gap-0 overflow-hidden overscroll-none',
                          'px-4 py-3 max-md:px-3 max-md:py-3',
                          'max-md:pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
                        )
                      : cn(
                          'gap-6 overflow-y-auto max-md:gap-5',
                          'px-5 py-5 max-md:px-4 max-md:py-4',
                          'max-md:pb-[max(1rem,env(safe-area-inset-bottom,0px))]',
                        ),
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
          onOpenChange={(open) => {
            if (!open) setSideChatExpanded(false);
          }}
          regionId={vadoIntelPanelId}
        />
      </SidebarProvider>
    </>
  );
}
