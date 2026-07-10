/** Tipos + helpers para Auto Leads (autosales → adminvado). El mock histórico queda sin uso en UI. */

export type AutoLeadRunStatus = 'active' | 'paused' | 'completed'
export type AutoLeadChannel = 'email' | 'whatsapp'
export type AutoLeadContactStatus =
  | 'queued'
  | 'sent'
  | 'replied'
  | 'meeting'
  | 'no_response'
  | 'failed'

export type AutoLeadMessage = {
  id: string
  direction: 'outbound' | 'inbound'
  at: string
  body: string
  actor: 'bot' | 'human' | 'lead'
}

export type AutoLeadContact = {
  id: string
  company: string
  contactName: string
  email: string | null
  phone: string | null
  channel: AutoLeadChannel
  status: AutoLeadContactStatus
  lastActivityAt: string
  snippet: string
  score: number
  messages: AutoLeadMessage[]
  meetingAt?: string
  meetingLink?: string
}

export type AutoLeadRun = {
  id: string
  name: string
  icpLabel: string
  status: AutoLeadRunStatus
  channelMode: 'auto'
  startedAt: string
  lastActivityAt: string
  stats: {
    found: number
    qualified: number
    contacted: number
    replied: number
    meetings: number
  }
  contacts: AutoLeadContact[]
}

export const AUTO_LEADS_MOCK_RUNS: AutoLeadRun[] = [
  {
    id: 'run-saas-latam',
    name: 'SaaS LatAm · outbound',
    icpLabel: 'ICP v3 · Software B2B 20–200 empleados',
    status: 'active',
    channelMode: 'auto',
    startedAt: '2026-07-08T14:20:00.000Z',
    lastActivityAt: '2026-07-09T21:42:00.000Z',
    stats: {
      found: 128,
      qualified: 34,
      contacted: 18,
      replied: 5,
      meetings: 2,
    },
    contacts: [
      {
        id: 'c-acme',
        company: 'Acme Logistics',
        contactName: 'María Fernández',
        email: 'maria.fernandez@acmelogistics.mx',
        phone: '+52 55 1234 5678',
        channel: 'email',
        status: 'meeting',
        lastActivityAt: '2026-07-09T21:42:00.000Z',
        snippet: 'Perfecto, agendemos el jueves a las 10.',
        score: 86,
        meetingAt: '2026-07-10T17:00:00.000Z',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        messages: [
          {
            id: 'm1',
            direction: 'outbound',
            at: '2026-07-09T15:10:00.000Z',
            actor: 'bot',
            body: 'Hola María,\n\nVi que Acme Logistics está escalando operaciones en México. En Vado Devs armamos equipos de desarrollo dedicados para empresas como la suya.\n\n¿Tendría 15 minutos esta semana para platicar?',
          },
          {
            id: 'm2',
            direction: 'inbound',
            at: '2026-07-09T18:05:00.000Z',
            actor: 'lead',
            body: 'Hola, sí me interesa. ¿Qué días tienen disponibles?',
          },
          {
            id: 'm3',
            direction: 'outbound',
            at: '2026-07-09T18:12:00.000Z',
            actor: 'bot',
            body: 'Genial. Tenemos jueves 10:00 o viernes 11:30 (hora CDMX). ¿Cuál le acomoda?',
          },
          {
            id: 'm4',
            direction: 'inbound',
            at: '2026-07-09T21:40:00.000Z',
            actor: 'lead',
            body: 'Perfecto, agendemos el jueves a las 10.',
          },
          {
            id: 'm5',
            direction: 'outbound',
            at: '2026-07-09T21:42:00.000Z',
            actor: 'bot',
            body: 'Listo. Quedó agendado el jueves 10 a las 10:00 CDMX. Meet: https://meet.google.com/abc-defg-hij\n\nNos vemos ahí.',
          },
        ],
      },
      {
        id: 'c-norte',
        company: 'Norte Digital',
        contactName: 'Carlos Ruiz',
        email: 'carlos@nortedigital.com',
        phone: null,
        channel: 'email',
        status: 'replied',
        lastActivityAt: '2026-07-09T19:20:00.000Z',
        snippet: '¿Pueden trabajar con un ERP existente?',
        score: 78,
        messages: [
          {
            id: 'm1',
            direction: 'outbound',
            at: '2026-07-09T12:00:00.000Z',
            actor: 'bot',
            body: 'Hola Carlos,\n\nNoté que Norte Digital publica vacantes de ingeniería de forma constante. Ayudamos a equipos como el suyo a sumar capacidad sin alargar el hiring.\n\n¿Le suena useful platicarlo 15 min?',
          },
          {
            id: 'm2',
            direction: 'inbound',
            at: '2026-07-09T19:20:00.000Z',
            actor: 'lead',
            body: 'Interesante. ¿Pueden trabajar con un ERP existente o solo greenfield?',
          },
        ],
      },
      {
        id: 'c-delta',
        company: 'Delta Retail',
        contactName: 'Ana Soto',
        email: null,
        phone: '+52 81 9988 1122',
        channel: 'whatsapp',
        status: 'sent',
        lastActivityAt: '2026-07-09T16:05:00.000Z',
        snippet: 'Hola Ana, soy Andres de Vado Devs…',
        score: 72,
        messages: [
          {
            id: 'm1',
            direction: 'outbound',
            at: '2026-07-09T16:05:00.000Z',
            actor: 'bot',
            body: 'Hola Ana, soy Andres de Vado Devs. Vimos que Delta Retail está digitalizando tiendas y queríamos ver si les sirve un equipo dedicado para apps / integraciones. ¿Le parece si platicamos 10 min esta semana?',
          },
        ],
      },
      {
        id: 'c-orbit',
        company: 'Orbit Pay',
        contactName: 'Luis Herrera',
        email: 'luis.herrera@orbitpay.io',
        phone: '+1 520 555 0199',
        channel: 'email',
        status: 'no_response',
        lastActivityAt: '2026-07-08T17:30:00.000Z',
        snippet: 'Sin respuesta todavía',
        score: 81,
        messages: [
          {
            id: 'm1',
            direction: 'outbound',
            at: '2026-07-08T17:30:00.000Z',
            actor: 'bot',
            body: 'Hola Luis,\n\nOrbit Pay crece rápido y el backlog de producto suele venir apretado. En Vado reforzamos equipos fintech con ingenieros seniors.\n\n¿Te late un discovery corto?',
          },
        ],
      },
      {
        id: 'c-fail',
        company: 'Beacon Labs',
        contactName: 'Sofía Méndez',
        email: 'sofía@beaconlabs.co',
        phone: null,
        channel: 'email',
        status: 'failed',
        lastActivityAt: '2026-07-09T11:02:00.000Z',
        snippet: 'Bounce: dirección no válida',
        score: 69,
        messages: [],
      },
    ],
  },
  {
    id: 'run-clinicas',
    name: 'Clínicas privadas MX',
    icpLabel: 'ICP v2 · Salud · software clínico',
    status: 'paused',
    channelMode: 'auto',
    startedAt: '2026-07-05T10:00:00.000Z',
    lastActivityAt: '2026-07-07T22:15:00.000Z',
    stats: {
      found: 64,
      qualified: 12,
      contacted: 8,
      replied: 2,
      meetings: 1,
    },
    contacts: [
      {
        id: 'c-vital',
        company: 'Vital Clínica',
        contactName: 'Dr. Jorge Peña',
        email: 'jorge.pena@vitalclinica.mx',
        phone: '+52 33 4444 0909',
        channel: 'email',
        status: 'meeting',
        lastActivityAt: '2026-07-07T22:15:00.000Z',
        snippet: 'Reunión confirmada · Meet listo',
        score: 90,
        meetingAt: '2026-07-11T16:00:00.000Z',
        meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
        messages: [
          {
            id: 'm1',
            direction: 'outbound',
            at: '2026-07-06T15:00:00.000Z',
            actor: 'bot',
            body: 'Hola Dr. Peña,\n\nAyudamos a clínicas privadas a digitalizar agendas, expedientes e integraciones con laboratorios.\n\n¿Le interesaría una llamada breve?',
          },
          {
            id: 'm2',
            direction: 'inbound',
            at: '2026-07-07T20:00:00.000Z',
            actor: 'lead',
            body: 'Sí, el viernes a las 10 me funciona.',
          },
          {
            id: 'm3',
            direction: 'outbound',
            at: '2026-07-07T22:15:00.000Z',
            actor: 'bot',
            body: 'Confirmado viernes 11 (hora CDMX). Meet: https://meet.google.com/xyz-uvwx-rst',
          },
        ],
      },
      {
        id: 'c-san',
        company: 'San Ángel Imaging',
        contactName: 'Patricia Gómez',
        email: null,
        phone: '+52 55 7777 2211',
        channel: 'whatsapp',
        status: 'replied',
        lastActivityAt: '2026-07-07T12:40:00.000Z',
        snippet: 'Mándame info del stack, porfa',
        score: 74,
        messages: [
          {
            id: 'm1',
            direction: 'outbound',
            at: '2026-07-06T18:00:00.000Z',
            actor: 'bot',
            body: 'Hola Patricia, somos Vado Devs. Vimos que San Ángel Imaging está modernizando su portal de pacientes. ¿Les ayudaría un equipo externo de producto?',
          },
          {
            id: 'm2',
            direction: 'inbound',
            at: '2026-07-07T12:40:00.000Z',
            actor: 'lead',
            body: 'Mándame info del stack, porfa.',
          },
        ],
      },
    ],
  },
  {
    id: 'run-fintech-us',
    name: 'Fintech SW USA',
    icpLabel: 'ICP v1 · Payments / compliance',
    status: 'completed',
    channelMode: 'auto',
    startedAt: '2026-06-20T09:00:00.000Z',
    lastActivityAt: '2026-07-01T18:00:00.000Z',
    stats: {
      found: 90,
      qualified: 22,
      contacted: 22,
      replied: 6,
      meetings: 3,
    },
    contacts: [
      {
        id: 'c-payly',
        company: 'Payly Inc',
        contactName: 'Emily Cho',
        email: 'emily@payly.com',
        phone: null,
        channel: 'email',
        status: 'meeting',
        lastActivityAt: '2026-06-28T16:00:00.000Z',
        snippet: 'Booked · discovery completed path',
        score: 88,
        meetingAt: '2026-06-30T18:00:00.000Z',
        meetingLink: 'https://meet.google.com/pay-ly-demo',
        messages: [
          {
            id: 'm1',
            direction: 'outbound',
            at: '2026-06-22T14:00:00.000Z',
            actor: 'bot',
            body: 'Hi Emily,\n\nVado Devs helps fintech teams ship product faster with dedicated senior engineers.\n\nOpen to a 15-min intro?',
          },
          {
            id: 'm2',
            direction: 'inbound',
            at: '2026-06-27T15:00:00.000Z',
            actor: 'lead',
            body: 'Sure — Tuesday afternoon works.',
          },
          {
            id: 'm3',
            direction: 'outbound',
            at: '2026-06-28T16:00:00.000Z',
            actor: 'bot',
            body: 'Booked Tuesday 11:00 MT. Meet: https://meet.google.com/pay-ly-demo',
          },
        ],
      },
    ],
  },
]

export function getAutoLeadRunById(id: string): AutoLeadRun | undefined {
  return AUTO_LEADS_MOCK_RUNS.find((r) => r.id === id)
}

export function formatAutoLeadRelative(iso: string, locale: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffSec = Math.round((then - now) / 1000)
  const rtf = new Intl.RelativeTimeFormat(locale.startsWith('en') ? 'en' : 'es', { numeric: 'auto' })
  const abs = Math.abs(diffSec)
  if (abs < 60) return rtf.format(diffSec, 'second')
  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  const diffHr = Math.round(diffMin / 60)
  if (Math.abs(diffHr) < 48) return rtf.format(diffHr, 'hour')
  const diffDay = Math.round(diffHr / 24)
  return rtf.format(diffDay, 'day')
}
