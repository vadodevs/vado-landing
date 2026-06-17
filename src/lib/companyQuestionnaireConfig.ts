export type QuestionnaireFieldType = 'text' | 'email' | 'phone' | 'textarea' | 'choice';

export type CompanyQuestionnaireStep = {
  id: number;
  label: string;
  prompt: string;
  type: QuestionnaireFieldType;
  options?: readonly string[];
  placeholder?: string;
};

/** Pasos del cuestionario del chat widget en el sitio (orden fijo). */
export const COMPANY_CHAT_QUESTIONNAIRE_STEPS: readonly CompanyQuestionnaireStep[] = [
  {
    id: 0,
    label: 'Empresa',
    prompt: '¿Cuál es el nombre de tu empresa?',
    type: 'text',
    placeholder: 'Ej. Acme Corp',
  },
  {
    id: 1,
    label: 'Correo',
    prompt: '¿Cuál es tu correo de trabajo?',
    type: 'email',
    placeholder: 'nombre@empresa.com',
  },
  {
    id: 2,
    label: 'Teléfono',
    prompt: '¿Cuál es tu número de teléfono?',
    type: 'phone',
    placeholder: '+52 55 1234 5678',
  },
  {
    id: 3,
    label: 'Nombre',
    prompt: '¿Cómo te llamas?',
    type: 'text',
    placeholder: 'Tu nombre',
  },
  {
    id: 4,
    label: 'Rol',
    prompt: '¿Cuál es tu rol en la empresa?',
    type: 'text',
    placeholder: 'Ej. CTO, Founder, Product Manager',
  },
  {
    id: 5,
    label: 'Problema a resolver',
    prompt: '¿Qué problema o necesidad quieres resolver?',
    type: 'textarea',
    placeholder: 'Cuéntanos brevemente tu contexto…',
  },
  {
    id: 6,
    label: 'Tipo de desarrollo',
    prompt: '¿Qué tipo de solución buscas?',
    type: 'choice',
    options: [
      'Software a la medida',
      'Soluciones con IA',
      'Ampliación de personal',
      'Developers on demand',
      'Otro / aún no lo sé',
    ],
  },
  {
    id: 7,
    label: 'Urgencia',
    prompt: '¿Qué tan urgente es el proyecto?',
    type: 'choice',
    options: ['Inmediata (menos de 1 mes)', '1–3 meses', '3–6 meses', 'Solo explorando'],
  },
  {
    id: 8,
    label: 'Presupuesto (¿dentro de $5k USD/mes?)',
    prompt: '¿Tu presupuesto está dentro de $5,000 USD al mes?',
    type: 'choice',
    options: ['Sí', 'No'],
  },
  {
    id: 9,
    label: 'Monto mensual dispuesto (USD)',
    prompt: '¿Qué monto mensual en USD podrías invertir?',
    type: 'text',
    placeholder: 'Ej. 3,500',
  },
  {
    id: 10,
    label: 'Madurez del proyecto',
    prompt: '¿En qué etapa está tu proyecto?',
    type: 'choice',
    options: ['Solo una idea', 'En definición / discovery', 'Listo para desarrollar', 'Ya en producción'],
  },
] as const;

export const CHAT_WIDGET_STEP_LABELS = COMPANY_CHAT_QUESTIONNAIRE_STEPS.map((step) => step.label);
