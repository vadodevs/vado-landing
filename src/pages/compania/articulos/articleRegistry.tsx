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
  'digitalizacion-retail': DigitalizacionRetail,
  'tecnologia-industria-restaurantera': TecnologiaIndustriaRestaurantera,
  'ia-sin-fronteras': IaSinFronteras,
  'evolucion-trabajo-remoto-talento': EvolucionTrabajoRemotoTalento,
  'mas-alla-fronteras-talento-global': MasAllaFronterasTalentoGlobal,
  'preparando-negocio-futuro-mercados-talento': PreparandoNegocioFuturoMercadosTalento,
  'plataformas-talento-revolucionando-crecimiento': PlataformasTalentoRevolucionandoCrecimiento,
  'nuevo-paradigma-laboral-talento-senior': NuevoParadigmaLaboralTalentoSenior,
  '10-razones-nearshore-outsourcing': RazonesNearshoreOutsourcing,
  'futuro-trabajo-fronteras-decada-transformacion': FuturoTrabajoFronterasDecadaTransformacion,
  'asegurando-pipeline-cicd-devops': AsegurandoPipelineCicdDevops,
  'desbloqueando-potencial-ingenieria-nearshore': DesbloqueandoPotencialIngenieriaNearshore,
  'consigue-trabajo-suenos-entrevista-desarrollo': ConsigueTrabajoSuenosEntrevistaDesarrollo,
};

export const ARTICULO_SLUGS = Object.keys(ARTICULO_PAGES);
