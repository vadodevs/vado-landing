import { Route, Switch, Redirect } from 'wouter'
import { ScrollToTop } from '@/components/ScrollToTop'
import Home from '@/pages/home'
import SoftwareALaMedida from '@/pages/servicios/software-a-la-medida'
import SolucionesIA from '@/pages/servicios/soluciones-ia'
import AmpliacionDePersonal from '@/pages/servicios/ampliacion-de-personal'
import NuestroTrabajo from '@/pages/nuestro-trabajo'
import NuestroTrabajoProject from '@/pages/nuestro-trabajo/[slug]'
import VadoInsights from '@/pages/compania/vado-insights'
import CulturaYTalento from '@/pages/compania/cultura-y-talento'
import Contacto from '@/pages/contacto'
import { NotFound } from '@/pages/not-found'
import { withLocale } from '@/app/withLocale'

export function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
      <Route path="/">
        <Redirect to="/es" />
      </Route>
      <Route path="/:lang/servicios/software-a-la-medida" component={withLocale(SoftwareALaMedida)} />
      <Route path="/:lang/servicios/soluciones-ia" component={withLocale(SolucionesIA)} />
      <Route path="/:lang/servicios/ampliacion-de-personal" component={withLocale(AmpliacionDePersonal)} />
      <Route path="/:lang/nuestro-trabajo/:slug" component={withLocale(NuestroTrabajoProject)} />
      <Route path="/:lang/nuestro-trabajo" component={withLocale(NuestroTrabajo)} />
      <Route path="/:lang/compania/vado-insights" component={withLocale(VadoInsights)} />
      <Route path="/:lang/compania/cultura-y-talento" component={withLocale(CulturaYTalento)} />
      <Route path="/:lang/contacto" component={withLocale(Contacto)} />
      <Route path="/:lang" component={withLocale(Home)} />
      <Route path="/:lang/*" component={withLocale(NotFound)} />
      <Route component={NotFound} />
    </Switch>
    </>
  )
}
