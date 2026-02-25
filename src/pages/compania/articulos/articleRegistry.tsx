import type { ComponentType } from 'react';
import DigitalizacionRetail from './digitalizacion-retail';
import TecnologiaIndustriaRestaurantera from './tecnologia-industria-restaurantera';
import IaSinFronteras from './ia-sin-fronteras';
import EvolucionTrabajoRemotoTalento from './evolucion-trabajo-remoto-talento';
import MasAllaFronterasTalentoGlobal from './mas-alla-fronteras-talento-global';
import PreparandoNegocioFuturoMercadosTalento from './preparando-negocio-futuro-mercados-talento';
import PlataformasTalentoRevolucionandoCrecimiento from './plataformas-talento-revolucionando-crecimiento';
import NuevoParadigmaLaboralTalentoSenior from './nuevo-paradigma-laboral-talento-senior';
import RazonesNearshoreOutsourcing from './10-razones-nearshore-outsourcing';
import FuturoTrabajoFronterasDecadaTransformacion from './futuro-trabajo-fronteras-decada-transformacion';
import AsegurandoPipelineCicdDevops from './asegurando-pipeline-cicd-devops';
import DesbloqueandoPotencialIngenieriaNearshore from './desbloqueando-potencial-ingenieria-nearshore';
import ConsigueTrabajoSuenosEntrevistaDesarrollo from './consigue-trabajo-suenos-entrevista-desarrollo';

export const ARTICULO_PAGES: Record<string, ComponentType> = {
  'digitalization-in-retail': DigitalizacionRetail,
  'technology-transforming-restaurant-industry': TecnologiaIndustriaRestaurantera,
  'ai-without-borders': IaSinFronteras,
  'evolution-of-remote-work-talent-acquisition': EvolucionTrabajoRemotoTalento,
  'beyond-borders-global-talent-pools': MasAllaFronterasTalentoGlobal,
  'future-proofing-with-talent-marketplaces': PreparandoNegocioFuturoMercadosTalento,
  'how-talent-platforms-revolutionize-growth': PlataformasTalentoRevolucionandoCrecimiento,
  'new-labor-paradigm-senior-talent': NuevoParadigmaLaboralTalentoSenior,
  '10-reasons-nearshore-outsourcing-success': RazonesNearshoreOutsourcing,
  'future-of-work-across-borders': FuturoTrabajoFronterasDecadaTransformacion,
  'securing-your-ci-cd-pipeline': AsegurandoPipelineCicdDevops,
  'benefits-of-nearshore-engineering': DesbloqueandoPotencialIngenieriaNearshore,
  'land-your-dream-software-job': ConsigueTrabajoSuenosEntrevistaDesarrollo,
};

export const ARTICULO_SLUGS = Object.keys(ARTICULO_PAGES);
