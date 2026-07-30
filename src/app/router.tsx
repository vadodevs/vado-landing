import { Route, Switch, Redirect, useParams } from 'wouter';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AnalyticsPageView } from '@/components/AnalyticsPageView';
import { JsonLd } from '@/components/JsonLd';
import { getPreferredLocaleFromBrowser, isLocale } from '@/app/i18n';
import Home from '@/pages/home';
import SoftwareALaMedida from '@/pages/servicios/software-a-la-medida';
import SolucionesIA from '@/pages/servicios/soluciones-ia';
import AmpliacionDePersonal from '@/pages/servicios/ampliacion-de-personal';
import DevelopersOnDemand from '@/pages/servicios/developers-on-demand';
import NuestroTrabajo from '@/pages/nuestro-trabajo';
import NuestroTrabajoProject from '@/pages/nuestro-trabajo/[slug]';
import VadoInsights from '@/pages/compania/vado-insights';
import ArticleRouter from '@/pages/compania/articulos/ArticleRouter';
import CulturaYTalento from '@/pages/compania/cultura-y-talento';
import Contacto from '@/pages/contacto';
import Login from '@/pages/login';
import Gracias from '@/pages/gracias';
import TerminosDelServicio from '@/pages/legal/terminos';
import PoliticaDePrivacidad from '@/pages/legal/politica-privacidad';
import Cookies from '@/pages/legal/cookies';
import AppDev from '@/pages/app/dev';
import AppDevGuardadas from '@/pages/app/devGuardadas';
import AppDevProfile from '@/pages/app/devProfile';
import AppDevProjects from '@/pages/app/devProjects';
import AppDevEmpleos from '@/pages/app/devEmpleos';
import AppDevSettings from '@/pages/app/devSettings';
import AppAdminSettings from '@/pages/app/adminSettings';
import AppAdminSettingsIntegraciones from '@/pages/app/adminSettingsIntegraciones';
import AppAdminSettingsCuestionario from '@/pages/app/adminSettingsCuestionario';
import AppAdminUtileriaTareas from '@/pages/app/adminUtileriaTareas';
import AppAdminUtileriaRecordatorios from '@/pages/app/adminUtileriaRecordatorios';
import AppCompanySettings from '@/pages/app/companySettings';
import AppCompanyProfile from '@/pages/app/companyProfile';
import AppCompanyProyectos from '@/pages/app/companyProyectos';
import AppRecruiterHome from '@/pages/app/recruiterHome';
import AppRecruiterProfile from '@/pages/app/recruiterProfile';
import AppRecruiterSettings from '@/pages/app/recruiterSettings';
import AppAdminDesarrolladores from '@/pages/app/adminDesarrolladores';
import AppAdminProyectos from '@/pages/app/adminProyectos';
import AppAdminCompany from '@/pages/app/adminCompany';
import AppAdminOportunidades from '@/pages/app/adminOportunidades';
import AppAdminCampanias from '@/pages/app/adminCampanias';
import AppAdminCampaniaDetalle from '@/pages/app/adminCampaniaDetalle';
import AppAdminLeadsMyEvolve from '@/pages/app/adminLeadsMyEvolve';
import AppAdminLeadsMyEvolveCalendar from '@/pages/app/adminLeadsMyEvolveCalendar';
import AppAdminAutoLeads from '@/pages/app/adminAutoLeads';
import AppAdminAutoSearch from '@/pages/app/adminAutoSearch';
import AppAdminCanales from '@/pages/app/adminCanales';
import AppAdminReclutadores from '@/pages/app/adminReclutadores';
import AppAdminOfertas from '@/pages/app/adminOfertas';
import AppAdminOfertasCandidatos from '@/pages/app/adminOfertasCandidatos';
import AppAdminOfertasCandidatoPerfil from '@/pages/app/adminOfertasCandidatoPerfil';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { RequireDeveloper } from '@/components/auth/RequireDeveloper';
import { RequireCompany } from '@/components/auth/RequireCompany';
import { RequireRecruiter } from '@/components/auth/RequireRecruiter';
import { RequireRecruiterPanel } from '@/components/auth/RequireRecruiterPanel';
import { NotFound } from '@/pages/not-found';
import { withLocale } from '@/app/withLocale';

function AdminDesarrolladoresRoute() {
  return (
    <RequireAdmin>
      <AppAdminDesarrolladores />
    </RequireAdmin>
  );
}
function AdminProyectosRoute() {
  return (
    <RequireAdmin>
      <AppAdminProyectos />
    </RequireAdmin>
  );
}
function AdminCompanyRoute() {
  return (
    <RequireAdmin>
      <AppAdminCompany />
    </RequireAdmin>
  );
}
function AdminLeadsMyEvolveRoute() {
  return (
    <RequireAdmin>
      <AppAdminLeadsMyEvolve />
    </RequireAdmin>
  );
}
function AdminAutoLeadsRoute() {
  return (
    <RequireAdmin>
      <AppAdminAutoLeads />
    </RequireAdmin>
  );
}
function AdminAutoSearchRoute() {
  return (
    <RequireAdmin>
      <AppAdminAutoSearch />
    </RequireAdmin>
  );
}
function AdminLeadsCalendarRoute() {
  return (
    <RequireAdmin>
      <AppAdminLeadsMyEvolveCalendar />
    </RequireAdmin>
  );
}
function AdminOpportunitiesRoute() {
  return (
    <RequireAdmin>
      <AppAdminOportunidades />
    </RequireAdmin>
  );
}
function AdminCampaignasRoute() {
  return (
    <RequireAdmin>
      <AppAdminCampanias />
    </RequireAdmin>
  );
}
function AdminCampaignDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return (
    <RequireAdmin>
      <AppAdminCampaniaDetalle campaignId={id ?? ''} />
    </RequireAdmin>
  );
}
function AdminCanalesRoute() {
  const { canal } = useParams<{ canal: string }>();
  return (
    <RequireAdmin>
      <AppAdminCanales channel={canal ?? ''} />
    </RequireAdmin>
  );
}
function AdminReclutadoresRoute() {
  return (
    <RequireAdmin>
      <AppAdminReclutadores />
    </RequireAdmin>
  );
}
function AdminOfertasRoute() {
  return (
    <RequireAdmin>
      <AppAdminOfertas />
    </RequireAdmin>
  );
}
function AdminOfertasCandidatosRoute() {
  return (
    <RequireAdmin>
      <AppAdminOfertasCandidatos />
    </RequireAdmin>
  );
}
function AdminOfertasCandidatoPerfilRoute() {
  return (
    <RequireAdmin>
      <AppAdminOfertasCandidatoPerfil />
    </RequireAdmin>
  );
}
function RedirectAdminJobsToActive({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/admin/ofertas/activas`} />;
}

function RedirectAdminLeadsCalendarToUtilities({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/admin/utileria/calendario`} />;
}

function DevProfileRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireDeveloper lang={params.lang}>
      <AppDevProfile />
    </RequireDeveloper>
  );
}
function DevDashboardRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireDeveloper lang={params.lang}>
      <AppDev />
    </RequireDeveloper>
  );
}
function DevProjectsRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireDeveloper lang={params.lang}>
      <AppDevProjects />
    </RequireDeveloper>
  );
}
function DevEmpleosRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireDeveloper lang={params.lang}>
      <AppDevEmpleos />
    </RequireDeveloper>
  );
}
function DevGuardadasRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireDeveloper lang={params.lang}>
      <AppDevGuardadas />
    </RequireDeveloper>
  );
}
function DevSettingsRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireDeveloper lang={params.lang}>
      <AppDevSettings />
    </RequireDeveloper>
  );
}

function RedirectDevEmpleosToOfertas({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/dev/empleos/ofertas`} />;
}
function CompanyProfileRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireCompany lang={params.lang}>
      <AppCompanyProfile />
    </RequireCompany>
  );
}
function CompanyProyectosRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireCompany lang={params.lang}>
      <AppCompanyProyectos />
    </RequireCompany>
  );
}
function CompanySettingsRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireCompany lang={params.lang}>
      <AppCompanySettings />
    </RequireCompany>
  );
}

function RecruiterHomeRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <AppRecruiterHome />
    </RequireRecruiter>
  );
}

function RecruiterProfileRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <AppRecruiterProfile />
    </RequireRecruiter>
  );
}

function RecruiterSettingsRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <AppRecruiterSettings />
    </RequireRecruiter>
  );
}

function RecruiterDesarrolladoresRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <RequireRecruiterPanel panel="panel:developers" lang={params.lang}>
        <AppAdminDesarrolladores />
      </RequireRecruiterPanel>
    </RequireRecruiter>
  );
}
function RecruiterOfertasRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <RequireRecruiterPanel panel="panel:jobs" lang={params.lang}>
        <AppAdminOfertas />
      </RequireRecruiterPanel>
    </RequireRecruiter>
  );
}
function RecruiterOfertasCandidatosRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <RequireRecruiterPanel panel="panel:jobs" lang={params.lang}>
        <AppAdminOfertasCandidatos />
      </RequireRecruiterPanel>
    </RequireRecruiter>
  );
}
function RecruiterOfertasCandidatoPerfilRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <RequireRecruiterPanel panel="panel:jobs" lang={params.lang}>
        <AppAdminOfertasCandidatoPerfil />
      </RequireRecruiterPanel>
    </RequireRecruiter>
  );
}
function RecruiterProyectosRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <RequireRecruiterPanel panel="panel:projects" lang={params.lang}>
        <AppAdminProyectos />
      </RequireRecruiterPanel>
    </RequireRecruiter>
  );
}
function RecruiterCompanyRoute({ params }: { params: { lang: string } }) {
  return (
    <RequireRecruiter lang={params.lang}>
      <RequireRecruiterPanel panel="panel:companies" lang={params.lang}>
        <AppAdminCompany />
      </RequireRecruiterPanel>
    </RequireRecruiter>
  );
}

function RedirectRecruiterJobsToActive({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/recruiter/ofertas/activas`} />;
}
function AdminSettingsRoute() {
  return (
    <RequireAdmin>
      <AppAdminSettings />
    </RequireAdmin>
  );
}
function AdminSettingsIntegracionesRoute() {
  return (
    <RequireAdmin>
      <AppAdminSettingsIntegraciones />
    </RequireAdmin>
  );
}
function AdminSettingsCuestionarioRoute() {
  return (
    <RequireAdmin>
      <AppAdminSettingsCuestionario />
    </RequireAdmin>
  );
}
function AdminUtileriaTareasRoute() {
  return (
    <RequireAdmin>
      <AppAdminUtileriaTareas />
    </RequireAdmin>
  );
}
function AdminUtileriaRecordatoriosRoute() {
  return (
    <RequireAdmin>
      <AppAdminUtileriaRecordatorios />
    </RequireAdmin>
  );
}
const AppAdminDesarrolladoresPage = withLocale(AdminDesarrolladoresRoute);
const AppAdminProyectosPage = withLocale(AdminProyectosRoute);
const AppAdminCompanyPage = withLocale(AdminCompanyRoute);
const AppAdminOpportunitiesPage = withLocale(AdminOpportunitiesRoute);
const AppAdminCampaignasPage = withLocale(AdminCampaignasRoute);
const AppAdminCampaignDetailPage = withLocale(AdminCampaignDetailRoute);
const AppAdminLeadsMyEvolvePage = withLocale(AdminLeadsMyEvolveRoute);
const AppAdminAutoLeadsPage = withLocale(AdminAutoLeadsRoute);
const AppAdminAutoSearchPage = withLocale(AdminAutoSearchRoute);
const AppAdminLeadsCalendarPage = withLocale(AdminLeadsCalendarRoute);
const AppAdminReclutadoresPage = withLocale(AdminReclutadoresRoute);
const AppAdminOfertasPage = withLocale(AdminOfertasRoute);
const AppAdminOfertasCandidatosPage = withLocale(AdminOfertasCandidatosRoute);
const AppAdminOfertasCandidatoPerfilPage = withLocale(AdminOfertasCandidatoPerfilRoute);
const AppAdminSettingsPage = withLocale(AdminSettingsRoute);
const AppAdminSettingsIntegracionesPage = withLocale(AdminSettingsIntegracionesRoute);
const AppAdminSettingsCuestionarioPage = withLocale(AdminSettingsCuestionarioRoute);
const AppAdminUtileriaTareasPage = withLocale(AdminUtileriaTareasRoute);
const AppAdminUtileriaRecordatoriosPage = withLocale(AdminUtileriaRecordatoriosRoute);
const AppAdminCanalesPage = withLocale(AdminCanalesRoute);
const AppDevProfileGuardedPage = withLocale(DevProfileRoute);
const AppDevDashboardGuardedPage = withLocale(DevDashboardRoute);
const AppDevProjectsGuardedPage = withLocale(DevProjectsRoute);
const AppDevEmpleosGuardedPage = withLocale(DevEmpleosRoute);
const AppDevGuardadasGuardedPage = withLocale(DevGuardadasRoute);
const AppDevSettingsGuardedPage = withLocale(DevSettingsRoute);
const RedirectDevEmpleosToOfertasPage = withLocale(RedirectDevEmpleosToOfertas);
const AppCompanyProfileGuardedPage = withLocale(CompanyProfileRoute);
const AppCompanyProyectosGuardedPage = withLocale(CompanyProyectosRoute);
const AppCompanySettingsGuardedPage = withLocale(CompanySettingsRoute);
const AppRecruiterHomeGuardedPage = withLocale(RecruiterHomeRoute);
const AppRecruiterProfileGuardedPage = withLocale(RecruiterProfileRoute);
const AppRecruiterSettingsGuardedPage = withLocale(RecruiterSettingsRoute);
const AppRecruiterDesarrolladoresPage = withLocale(RecruiterDesarrolladoresRoute);
const AppRecruiterOfertasPage = withLocale(RecruiterOfertasRoute);
const AppRecruiterOfertasCandidatosPage = withLocale(RecruiterOfertasCandidatosRoute);
const AppRecruiterOfertasCandidatoPerfilPage = withLocale(RecruiterOfertasCandidatoPerfilRoute);
const AppRecruiterProyectosPage = withLocale(RecruiterProyectosRoute);
const AppRecruiterCompanyPage = withLocale(RecruiterCompanyRoute);
const RedirectRecruiterJobsToActivePage = withLocale(RedirectRecruiterJobsToActive);

function RedirectLegacyDemoSidebarToAppDev({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/dev`} />;
}

function RedirectAppRootToAdmin({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/admin/desarrolladores`} />;
}

function RedirectAdminToDesarrolladores({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/admin/desarrolladores`} />;
}

function RedirectCompanyToProfile({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/company/profile`} />;
}

function RedirectLegacyProjectsToDevProjects({ params }: { params: { lang: string } }) {
  const lang = isLocale(params.lang) ? params.lang : getPreferredLocaleFromBrowser();
  return <Redirect to={`/${lang}/app/dev/projects`} />;
}

function RootRedirect() {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(`/${getPreferredLocaleFromBrowser()}`);
  }, [setLocation]);
  return null;
}

export function Router() {
  return (
    <>
      <ScrollToTop />
      <JsonLd />
      <Switch>
        <Route path="/">
          <RootRedirect />
        </Route>
        <Route path="/:lang/services/custom-software" component={withLocale(SoftwareALaMedida)} />
        <Route path="/:lang/services/ai-solutions" component={withLocale(SolucionesIA)} />
        <Route
          path="/:lang/services/staff-augmentation"
          component={withLocale(AmpliacionDePersonal)}
        />
        <Route
          path="/:lang/services/it-staff-agumentation"
          component={withLocale(DevelopersOnDemand)}
        />
        <Route path="/:lang/our-work/:slug" component={withLocale(NuestroTrabajoProject)} />
        <Route path="/:lang/our-work" component={withLocale(NuestroTrabajo)} />
        <Route path="/:lang/company/articles/:articleName" component={withLocale(ArticleRouter)} />
        <Route path="/:lang/company/vado-insights" component={withLocale(VadoInsights)} />
        <Route path="/:lang/company/culture-and-talent" component={withLocale(CulturaYTalento)} />
        <Route path="/:lang/contact" component={withLocale(Contacto)} />
        <Route path="/:lang/login" component={withLocale(Login)} />
        <Route path="/:lang/thank-you" component={withLocale(Gracias)} />
        <Route path="/:lang/info/terms-of-service" component={withLocale(TerminosDelServicio)} />
        <Route path="/:lang/info/privacy-policy" component={withLocale(PoliticaDePrivacidad)} />
        <Route path="/:lang/info/cookies" component={withLocale(Cookies)} />
        <Route path="/:lang/demo/sidebar" component={RedirectLegacyDemoSidebarToAppDev} />
        <Route path="/:lang/app/dev/overview" component={AppDevDashboardGuardedPage} />
        <Route path="/:lang/app/dev/profile" component={AppDevProfileGuardedPage} />
        <Route path="/:lang/app/dev/projects" component={AppDevProjectsGuardedPage} />
        <Route path="/:lang/app/dev/empleos/guardadas" component={AppDevGuardadasGuardedPage} />
        <Route path="/:lang/app/dev/empleos/postulacion" component={AppDevEmpleosGuardedPage} />
        <Route path="/:lang/app/dev/empleos/ofertas" component={AppDevEmpleosGuardedPage} />
        <Route path="/:lang/app/dev/empleos" component={RedirectDevEmpleosToOfertasPage} />
        <Route path="/:lang/app/dev/settings" component={AppDevSettingsGuardedPage} />
        <Route path="/:lang/app/dev" component={AppDevDashboardGuardedPage} />
        <Route path="/:lang/app/company/profile" component={AppCompanyProfileGuardedPage} />
        <Route path="/:lang/app/company/proyectos" component={AppCompanyProyectosGuardedPage} />
        <Route path="/:lang/app/company/settings" component={AppCompanySettingsGuardedPage} />
        <Route path="/:lang/app/company" component={RedirectCompanyToProfile} />
        <Route path="/:lang/app/recruiter/profile" component={AppRecruiterProfileGuardedPage} />
        <Route path="/:lang/app/recruiter/settings" component={AppRecruiterSettingsGuardedPage} />
        <Route
          path="/:lang/app/recruiter/desarrolladores"
          component={AppRecruiterDesarrolladoresPage}
        />
        <Route path="/:lang/app/recruiter/ofertas/crear" component={AppRecruiterOfertasPage} />
        <Route path="/:lang/app/recruiter/ofertas/activas" component={AppRecruiterOfertasPage} />
        <Route
          path="/:lang/app/recruiter/ofertas/preview/:id"
          component={AppRecruiterOfertasPage}
        />
        <Route
          path="/:lang/app/recruiter/ofertas/:jobId/candidatos/:applicantId"
          component={AppRecruiterOfertasCandidatoPerfilPage}
        />
        <Route
          path="/:lang/app/recruiter/ofertas/:id/candidatos"
          component={AppRecruiterOfertasCandidatosPage}
        />
        <Route path="/:lang/app/recruiter/ofertas" component={RedirectRecruiterJobsToActivePage} />
        <Route path="/:lang/app/recruiter/proyectos" component={AppRecruiterProyectosPage} />
        <Route path="/:lang/app/recruiter/company" component={AppRecruiterCompanyPage} />
        <Route path="/:lang/app/recruiter" component={AppRecruiterHomeGuardedPage} />
        <Route path="/:lang/app/projects" component={RedirectLegacyProjectsToDevProjects} />
        <Route path="/:lang/app/admin/desarrolladores" component={AppAdminDesarrolladoresPage} />
        <Route path="/:lang/app/admin/reclutadores/crear" component={AppAdminReclutadoresPage} />
        <Route path="/:lang/app/admin/reclutadores/:id" component={AppAdminReclutadoresPage} />
        <Route path="/:lang/app/admin/reclutadores" component={AppAdminReclutadoresPage} />
        <Route path="/:lang/app/admin/ofertas/crear" component={AppAdminOfertasPage} />
        <Route path="/:lang/app/admin/ofertas/activas" component={AppAdminOfertasPage} />
        <Route path="/:lang/app/admin/ofertas/preview/:id" component={AppAdminOfertasPage} />
        <Route
          path="/:lang/app/admin/ofertas/:jobId/candidatos/:applicantId"
          component={AppAdminOfertasCandidatoPerfilPage}
        />
        <Route
          path="/:lang/app/admin/ofertas/:id/candidatos"
          component={AppAdminOfertasCandidatosPage}
        />
        <Route path="/:lang/app/admin/ofertas" component={RedirectAdminJobsToActive} />
        <Route path="/:lang/app/admin/proyectos" component={AppAdminProyectosPage} />
        <Route path="/:lang/app/admin/company" component={AppAdminCompanyPage} />
        <Route path="/:lang/app/admin/oportunidades" component={AppAdminOpportunitiesPage} />
        <Route path="/:lang/app/admin/campanas/:id" component={AppAdminCampaignDetailPage} />
        <Route path="/:lang/app/admin/campanas" component={AppAdminCampaignasPage} />
        <Route path="/:lang/app/admin/leads/my-evolve" component={AppAdminLeadsMyEvolvePage} />
        <Route path="/:lang/app/admin/leads/auto" component={AppAdminAutoLeadsPage} />
        <Route path="/:lang/app/admin/leads/auto-search" component={AppAdminAutoSearchPage} />
        <Route path="/:lang/app/admin/canales/:canal" component={AppAdminCanalesPage} />
        <Route path="/:lang/app/admin/utileria/tareas" component={AppAdminUtileriaTareasPage} />
        <Route
          path="/:lang/app/admin/utileria/recordatorios"
          component={AppAdminUtileriaRecordatoriosPage}
        />
        <Route
          path="/:lang/app/admin/utileria/calendario"
          component={AppAdminLeadsCalendarPage}
        />
        <Route
          path="/:lang/app/admin/leads/calendar"
          component={RedirectAdminLeadsCalendarToUtilities}
        />
        <Route
          path="/:lang/app/admin/settings/integraciones"
          component={AppAdminSettingsIntegracionesPage}
        />
        <Route
          path="/:lang/app/admin/settings/cuestionario"
          component={AppAdminSettingsCuestionarioPage}
        />
        <Route path="/:lang/app/admin/settings" component={AppAdminSettingsPage} />
        <Route path="/:lang/app/admin" component={RedirectAdminToDesarrolladores} />
        <Route path="/:lang/app/" component={RedirectAppRootToAdmin} />
        <Route path="/:lang/app" component={RedirectAppRootToAdmin} />
        <Route path="/:lang" component={withLocale(Home)} />
        <Route path="/:lang/*" component={withLocale(NotFound)} />
        <Route component={NotFound} />
      </Switch>
      <AnalyticsPageView />
    </>
  );
}
