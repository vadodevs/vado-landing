import { Route, Switch } from 'wouter';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { ScrollToTop } from '@/components/ScrollToTop';
import { GtmPageView } from '@/components/GtmPageView';
import { JsonLd } from '@/components/JsonLd';
import { getPreferredLocaleFromBrowser } from '@/app/i18n';
import Home from '@/pages/home';
import SoftwareALaMedida from '@/pages/servicios/software-a-la-medida';
import SolucionesIA from '@/pages/servicios/soluciones-ia';
import AmpliacionDePersonal from '@/pages/servicios/ampliacion-de-personal';
import NuestroTrabajo from '@/pages/nuestro-trabajo';
import NuestroTrabajoProject from '@/pages/nuestro-trabajo/[slug]';
import VadoInsights from '@/pages/compania/vado-insights';
import ArticleRouter from '@/pages/compania/articulos/ArticleRouter';
import CulturaYTalento from '@/pages/compania/cultura-y-talento';
import Contacto from '@/pages/contacto';
import Gracias from '@/pages/gracias';
import TerminosDelServicio from '@/pages/legal/terminos';
import PoliticaDePrivacidad from '@/pages/legal/politica-privacidad';
import Cookies from '@/pages/legal/cookies';
import { NotFound } from '@/pages/not-found';
import { withLocale } from '@/app/withLocale';

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
        <Route path="/:lang/our-work/:slug" component={withLocale(NuestroTrabajoProject)} />
        <Route path="/:lang/our-work" component={withLocale(NuestroTrabajo)} />
        <Route path="/:lang/company/articles/:articleName" component={withLocale(ArticleRouter)} />
        <Route path="/:lang/company/vado-insights" component={withLocale(VadoInsights)} />
        <Route path="/:lang/company/culture-and-talent" component={withLocale(CulturaYTalento)} />
        <Route path="/:lang/contact" component={withLocale(Contacto)} />
        <Route path="/:lang/thank-you" component={withLocale(Gracias)} />
        <Route path="/:lang/info/terms-of-service" component={withLocale(TerminosDelServicio)} />
        <Route path="/:lang/info/privacy-policy" component={withLocale(PoliticaDePrivacidad)} />
        <Route path="/:lang/info/cookies" component={withLocale(Cookies)} />
        <Route path="/:lang" component={withLocale(Home)} />
        <Route path="/:lang/*" component={withLocale(NotFound)} />
        <Route component={NotFound} />
      </Switch>
      <GtmPageView />
    </>
  );
}
