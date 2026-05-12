import { lazy, Suspense } from 'react'
import { Route, Switch } from 'wouter'
import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { ScrollToTop } from '@/components/ScrollToTop'
import { JsonLd } from '@/components/JsonLd'
import { getPreferredLocaleFromBrowser } from '@/app/i18n'
import Home from '@/pages/home'
import { RoutePageFallback } from '@/components/layout/RoutePageFallback'
import { withLocale } from '@/app/withLocale'

const SoftwareALaMedida = lazy(() => import('@/pages/servicios/software-a-la-medida'))
const SolucionesIA = lazy(() => import('@/pages/servicios/soluciones-ia'))
const AmpliacionDePersonal = lazy(() => import('@/pages/servicios/ampliacion-de-personal'))
const NuestroTrabajo = lazy(() => import('@/pages/nuestro-trabajo'))
const NuestroTrabajoProject = lazy(() => import('@/pages/nuestro-trabajo/[slug]'))
const VadoInsights = lazy(() => import('@/pages/compania/vado-insights'))
const ArticleRouter = lazy(() => import('@/pages/compania/articulos/ArticleRouter'))
const CulturaYTalento = lazy(() => import('@/pages/compania/cultura-y-talento'))
const Contacto = lazy(() => import('@/pages/contacto'))
const Gracias = lazy(() => import('@/pages/gracias'))
const TerminosDelServicio = lazy(() => import('@/pages/legal/terminos'))
const PoliticaDePrivacidad = lazy(() => import('@/pages/legal/politica-privacidad'))
const Cookies = lazy(() => import('@/pages/legal/cookies'))
const NotFound = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFound })),
)

function RootRedirect() {
  const [, setLocation] = useLocation()
  useEffect(() => {
    setLocation(`/${getPreferredLocaleFromBrowser()}`)
  }, [setLocation])
  return null
}

export function Router() {
  return (
    <>
      <ScrollToTop />
      <JsonLd />
      <Suspense fallback={<RoutePageFallback />}>
        <Switch>
          <Route path="/">
            <RootRedirect />
          </Route>
          <Route path="/:lang/services/custom-software" component={withLocale(SoftwareALaMedida)} />
          <Route path="/:lang/services/ai-solutions" component={withLocale(SolucionesIA)} />
          <Route path="/:lang/services/staff-augmentation" component={withLocale(AmpliacionDePersonal)} />
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
      </Suspense>
    </>
  )
}
