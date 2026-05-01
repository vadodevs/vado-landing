import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import {
  BriefcaseBusiness,
  ChevronDown,
  CircleUser,
  ClipboardList,
  Code2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  UserSearch,
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
import { APP_THEME_CHANGE_EVENT, getStoredAppTheme, type AppThemeMode } from '@/lib/appTheme';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
import { useAppNavBadges } from '@/contexts/AppNavBadgesContext';

export type AppShellProps = {
  pathWithoutLang: string;
  title: string;
  description: string;
  children: ReactNode;
};

const sidebarBrandShell = cn(
  '[&_[data-slot=sidebar-inner]]:!bg-[#17304b] [&_[data-slot=sidebar-inner]]:!text-white [&_[data-slot=sidebar-inner]]:rounded-xl [&_[data-slot=sidebar-inner]]:overflow-hidden',
);

const sidebarMobileSheet = cn(
  '!border-0 !bg-[#17304b] !text-white shadow-none',
  'rounded-xl',
  'pt-[max(0.75rem,env(safe-area-inset-top,0px))]',
  'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
);

const rowGhost =
  'flex w-full items-center gap-2 rounded-md px-2 py-2.5 text-left text-sm text-white/85 transition-colors hover:bg-white/5';

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

function normalizePath(p: string) {
  const x = p.split('#')[0].split('?')[0].replace(/\/$/, '');
  return x === '' ? '/' : x;
}

export function AppShell({ pathWithoutLang, title, description, children }: AppShellProps) {
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
  const [trabajoOpen, setTrabajoOpen] = useState(false);
  const [appThemeMode, setAppThemeMode] = useState<AppThemeMode>('light');
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

  const nuevasAperturasActive = isActive(hrefDevDashboard) || isActive(hrefDevOverview);
  const empleosOfertasActive = isActive(hrefEmpleosOfertas);
  const guardadasActive = isActive(hrefEmpleosGuardadas);
  const trabajoGroupActive = nuevasAperturasActive || empleosOfertasActive || guardadasActive;

  useEffect(() => {
    if (offersActive) setOffersOpen(true);
  }, [offersActive]);

  useEffect(() => {
    if (recruitersActive) setRecruitersOpen(true);
  }, [recruitersActive]);

  useEffect(() => {
    if (trabajoGroupActive) setTrabajoOpen(true);
  }, [trabajoGroupActive]);

  useEffect(() => {
    const sync = () => setAppThemeMode(getStoredAppTheme());
    sync();
    window.addEventListener(APP_THEME_CHANGE_EVENT, sync);
    return () => window.removeEventListener(APP_THEME_CHANGE_EVENT, sync);
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

  const navItem = (href: string, label: string, icon?: ReactNode, showUnreadDot?: boolean) => (
    <CollapsedIconTooltip label={label}>
      <Link
        href={href}
        className={cn(
          rowGhost,
          'group-data-[collapsible=icon]:justify-center',
          isActive(href) && 'bg-white/10 text-white',
        )}
      >
        {icon ? (
          <span className="relative flex shrink-0 text-white/70 [&_svg]:size-4">
            {icon}
            {showUnreadDot ? (
              <span
                className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-rose-500 ring-2 ring-[#17304b]"
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
          sidebarBrandShell,
          'min-h-svh font-sans',
          appThemeMode === 'dark' ? 'app-dark bg-zinc-950 text-zinc-100' : 'bg-zinc-100',
        )}
      >
        <Sidebar collapsible="icon" variant="floating" sheetClassName={sidebarMobileSheet}>
          <SidebarHeader className="border-b border-white/10 px-3 py-4">
            <Link
              href={path('')}
              className="flex w-full justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#17304b] group-data-[collapsible=icon]:py-2"
              aria-label={t('nav.home')}
            >
              <span className="flex max-w-[10.5rem] items-center justify-center [&_svg]:h-8 [&_svg]:w-auto [&_svg]:max-w-full group-data-[collapsible=icon]:max-w-10 group-data-[collapsible=icon]:[&_svg]:h-7">
                <VadoLogo white />
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="gap-0 px-2 pb-2">
            <nav className="flex flex-col py-3" aria-label={t('sidebarDemo.appAreaNav')}>
              {isAdminSection ? (
                <>
                  {navItem(hrefDevelopers, t('sidebarDemo.navDevelopers'), <Code2 />, adminDevelopersUnread)}
                  <CollapsedIconTooltip label={t('sidebarDemo.navRecruiters')}>
                    <button
                      type="button"
                      onClick={() => setRecruitersOpen((v) => !v)}
                      className={cn(
                        rowGhost,
                        'mb-0.5 min-h-10 group-data-[collapsible=icon]:justify-center',
                        recruitersActive && 'bg-white/10 text-white',
                      )}
                    >
                      <span className="relative flex shrink-0 text-white/70 [&_svg]:size-4">
                        <UserSearch />
                      </span>
                      <span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:hidden">
                        {t('sidebarDemo.navRecruiters')}
                      </span>
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden',
                          recruitersOpen && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </button>
                  </CollapsedIconTooltip>
                  {recruitersOpen ? (
                    <div className="ml-4 mb-1.5 space-y-2.5 border-l border-white/15 pl-3 pt-0.5 group-data-[collapsible=icon]:hidden">
                      <Link
                        href={hrefAdminCreateRecruiter}
                        className={cn(
                          'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/85 transition-colors hover:bg-white/10 hover:text-white',
                          isActive(hrefAdminCreateRecruiter) && 'bg-white/10 text-white',
                        )}
                      >
                        {t('sidebarDemo.navCreateRecruiter')}
                      </Link>
                      <Link
                        href={hrefAdminRecruitersList}
                        className={cn(
                          'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/85 transition-colors hover:bg-white/10 hover:text-white',
                          isActive(hrefAdminRecruitersList) &&
                            !isActive(hrefAdminCreateRecruiter) &&
                            'bg-white/10 text-white',
                        )}
                      >
                        {t('sidebarDemo.navRecruiterList')}
                      </Link>
                    </div>
                  ) : null}
                  <CollapsedIconTooltip label={t('sidebarDemo.navJobs')}>
                    <button
                      type="button"
                      onClick={() => setOffersOpen((v) => !v)}
                      className={cn(
                        rowGhost,
                        'mb-0.5 min-h-10 group-data-[collapsible=icon]:justify-center',
                        offersActive && 'bg-white/10 text-white',
                      )}
                    >
                      <span className="relative flex shrink-0 text-white/70 [&_svg]:size-4">
                        <BriefcaseBusiness />
                      </span>
                      <span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:hidden">
                        {t('sidebarDemo.navJobs')}
                      </span>
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden',
                          offersOpen && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </button>
                  </CollapsedIconTooltip>
                  {offersOpen ? (
                    <div className="ml-4 mb-1.5 space-y-2.5 border-l border-white/15 pl-3 pt-0.5 group-data-[collapsible=icon]:hidden">
                      <Link
                        href={hrefAdminCreateJob}
                        className={cn(
                          'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/85 transition-colors hover:bg-white/10 hover:text-white',
                          isActive(hrefAdminCreateJob) && 'bg-white/10 text-white',
                        )}
                      >
                        {t('sidebarDemo.navCreateJob')}
                      </Link>
                      <Link
                        href={hrefAdminActiveJobs}
                        className={cn(
                          'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/85 transition-colors hover:bg-white/10 hover:text-white',
                          isActive(hrefAdminActiveJobs) && 'bg-white/10 text-white',
                        )}
                      >
                        {t('sidebarDemo.navActiveJobs')}
                      </Link>
                    </div>
                  ) : null}
                  {navItem(hrefAdminProjects, t('sidebarDemo.navProjects'), <FolderKanban />, adminProjectsUnread)}
                  {navItem(hrefAdminCompanies, t('sidebarDemo.navCompanies'), <User />, adminCompaniesUnread)}
                  {navItem(hrefAdminSettings, t('sidebarDemo.navSettings'), <Settings />)}
                </>
              ) : isRecruiterPortal ? (
                <>
                  {navItem(hrefRecruiterProfile, t('sidebarDemo.navProfile'), <CircleUser />)}
                  <div
                    className="my-2 border-t border-white/15 group-data-[collapsible=icon]:mx-1"
                    role="separator"
                    aria-hidden
                  />
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
                          onClick={() => setOffersOpen((v) => !v)}
                          className={cn(
                            rowGhost,
                            'mb-0.5 min-h-10 group-data-[collapsible=icon]:justify-center',
                            offersActive && 'bg-white/10 text-white',
                          )}
                        >
                          <span className="relative flex shrink-0 text-white/70 [&_svg]:size-4">
                            <BriefcaseBusiness />
                          </span>
                          <span className="min-w-0 flex-1 truncate group-data-[collapsible=icon]:hidden">
                            {t('sidebarDemo.navJobs')}
                          </span>
                          <ChevronDown
                            className={cn(
                              'size-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden',
                              offersOpen && 'rotate-180',
                            )}
                            aria-hidden
                          />
                        </button>
                      </CollapsedIconTooltip>
                      {offersOpen ? (
                        <div className="ml-4 mb-1.5 space-y-2.5 border-l border-white/15 pl-3 pt-0.5 group-data-[collapsible=icon]:hidden">
                          <Link
                            href={hrefRecruiterCreateJob}
                            className={cn(
                              'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/85 transition-colors hover:bg-white/10 hover:text-white',
                              isActive(hrefRecruiterCreateJob) && 'bg-white/10 text-white',
                            )}
                          >
                            {t('sidebarDemo.navCreateJob')}
                          </Link>
                          <Link
                            href={hrefRecruiterActiveJobs}
                            className={cn(
                              'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/85 transition-colors hover:bg-white/10 hover:text-white',
                              isActive(hrefRecruiterActiveJobs) && 'bg-white/10 text-white',
                            )}
                          >
                            {t('sidebarDemo.navActiveJobs')}
                          </Link>
                        </div>
                      ) : null}
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
                  <div
                    className="my-2 border-t border-white/15 group-data-[collapsible=icon]:mx-1"
                    role="separator"
                    aria-hidden
                  />
                  {navItem(hrefRecruiterSettings, t('sidebarDemo.navSettings'), <Settings />)}
                </>
              ) : isCompanySection ? (
                <>
                  {navItem(hrefCompanyProfile, t('sidebarDemo.navProfile'), <User />)}
                  {navItem(hrefCompanyProjects, t('sidebarDemo.navProjects'), <FolderKanban />, companyProjectsUnread)}
                  {navItem(hrefCompanySettings, t('sidebarDemo.navSettings'), <Settings />)}
                </>
              ) : isDevSection ? (
                <>
                  {navItem(hrefDevDashboard, t('sidebarDemo.navDashboard'), <LayoutDashboard />)}
                  <div
                    className="my-2 border-t border-white/15 group-data-[collapsible=icon]:mx-1"
                    role="separator"
                    aria-hidden
                  />
                  {navItem(hrefProfile, t('sidebarDemo.navProfile'), <User />)}
                  <CollapsedIconTooltip label={t('sidebarDemo.navWork')}>
                    <button
                      type="button"
                      onClick={() => setTrabajoOpen((v) => !v)}
                      className={cn(
                        rowGhost,
                        'mb-0.5 min-h-10 group-data-[collapsible=icon]:justify-center',
                        trabajoGroupActive && 'bg-white/10 text-white',
                      )}
                    >
                      <span className="relative flex shrink-0 text-white/70 [&_svg]:size-4">
                        <BriefcaseBusiness />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                        {t('sidebarDemo.navWork')}
                      </span>
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden',
                          trabajoOpen && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </button>
                  </CollapsedIconTooltip>
                  {trabajoOpen ? (
                    <div className="ml-4 mb-1.5 space-y-2.5 border-l border-white/15 pl-3 pt-0.5 group-data-[collapsible=icon]:hidden">
                      <Link
                        href={hrefDevDashboard}
                        className={cn(
                          'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/70 transition-colors hover:bg-white/10 hover:text-white',
                          nuevasAperturasActive && 'bg-white/10 text-white',
                        )}
                      >
                        {t('sidebarDemo.navNuevasAperturas')}
                      </Link>
                      <Link
                        href={hrefEmpleosOfertas}
                        className={cn(
                          'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/70 transition-colors hover:bg-white/10 hover:text-white',
                          empleosOfertasActive && 'bg-white/10 text-white',
                        )}
                      >
                        {t('sidebarDemo.navEmpleos')}
                      </Link>
                      <Link
                        href={hrefEmpleosGuardadas}
                        className={cn(
                          'flex min-h-10 items-center rounded-lg px-2.5 py-2 text-xs leading-snug text-white/70 transition-colors hover:bg-white/10 hover:text-white',
                          guardadasActive && 'bg-white/10 text-white',
                        )}
                      >
                        {t('devDashboard.tabSavedJobs')}
                      </Link>
                    </div>
                  ) : null}
                  {navItem(hrefProjects, t('sidebarDemo.navProjects'), <FolderKanban />, devProjectsUnread)}
                  {navItem(hrefEmpleosPostulacion, t('sidebarDemo.navApplications'), <ClipboardList />)}
                  <div
                    className="my-2 border-t border-white/15 group-data-[collapsible=icon]:mx-1"
                    role="separator"
                    aria-hidden
                  />
                  {navItem(hrefDevSettings, t('sidebarDemo.navSettings'), <Settings />)}
                </>
              ) : null}
            </nav>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/10 p-2">
            <CollapsedIconTooltip label={t('sidebarDemo.logOut')}>
              {isAdminSection ? (
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 group-data-[collapsible=icon]:px-2"
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
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 group-data-[collapsible=icon]:px-2"
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
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 group-data-[collapsible=icon]:px-2"
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
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 group-data-[collapsible=icon]:px-2"
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
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 group-data-[collapsible=icon]:px-2"
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
            'flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-sm',
            appThemeMode === 'dark'
              ? 'border-zinc-800/80 bg-zinc-900'
              : 'border-zinc-300/80 bg-zinc-200',
            'm-2 max-md:mx-2.5 max-md:mt-2 max-md:mb-[max(0.5rem,env(safe-area-inset-bottom,0px))]',
            'max-md:min-h-0 max-md:flex-1',
          )}
        >
          <header
            className={cn(
              'flex h-14 max-md:h-12 shrink-0 items-center gap-2 border-b px-4 max-md:gap-1.5 max-md:px-3',
              appThemeMode === 'dark'
                ? 'border-zinc-800/70 bg-zinc-900/95'
                : 'border-zinc-300/70 bg-zinc-200/98',
            )}
          >
            <SidebarTrigger className="-ml-1 max-md:size-8" />
            <Separator orientation="vertical" className="mr-1 hidden data-[orientation=vertical]:h-4 md:block" />
            <h1 className="min-w-0 flex-1 truncate text-base font-semibold max-md:text-sm md:text-lg">{title}</h1>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" className="max-md:h-8 max-md:px-2 max-md:text-xs" asChild>
                <Link href={path('')}>{t('sidebarDemo.backHome')}</Link>
              </Button>
            </div>
          </header>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-10 overflow-y-auto p-6 max-md:gap-8 max-md:p-4 max-md:pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
