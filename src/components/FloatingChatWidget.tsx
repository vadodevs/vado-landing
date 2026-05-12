import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { MessageCircle, Send, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  answersToContactPayload,
  phoneHasMinDigits,
  submitChatWidgetLead,
} from '@/lib/chatWidgetLead';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

/**
 * Cada paso puede tener:
 * - `prompt`: texto que muestra el bot.
 * - `choices`: botones de respuesta rápida (opcional).
 * - `placeholder`: hint del input.
 * - `next`: función que recibe la respuesta del usuario y devuelve el índice del
 *   siguiente paso. Si no se define se usa el paso siguiente en orden.
 * - `skip`: si devuelve true el paso se omite completamente.
 */
type Step = {
  prompt: string;
  choices?: readonly string[];
  placeholder?: string;
  next?: (answer: string, answers: Record<number, string>) => number;
};

// Índices para las referencias condicionales
const STEP_BUDGET_AMOUNT = 9;  // Sub-pregunta sólo si responde "No"
const STEP_MATURITY      = 10; // Siempre llega aquí

const STEPS: Step[] = [
  // 0
  {
    prompt: '¿Cuál es el nombre de tu compañía?',
    placeholder: 'Ej. Mi empresa S.A.',
  },
  // 1
  {
    prompt: '¿Cuál es tu correo electrónico?',
    placeholder: 'nombre@empresa.com',
  },
  // 2
  {
    prompt: '¿Cuál es tu número de teléfono?',
    placeholder: 'Ej. +52 55 1234 5678',
  },
  // 3
  {
    prompt: '¿Cuál es tu nombre?',
    placeholder: 'Tu nombre completo',
  },
  // 4
  {
    prompt: '¿Cuál es tu rol en la empresa?',
    placeholder: 'Ej. CTO, Product Owner…',
  },
  // 5
  {
    prompt: '¿Qué problema estás buscando resolver?',
    placeholder: 'Descríbenos el contexto…',
  },
  // 6
  {
    prompt: '¿Qué tipo de desarrollo necesitas?',
    placeholder: 'Ej. web, app móvil, APIs…',
  },
  // 7
  {
    prompt: '¿Qué tan urgente es iniciar?',
    choices: ['Inmediatamente', '1 a 2 meses', '3 meses en adelante'],
    placeholder: 'Elige una opción o escribe…',
  },
  // 8 — STEP_BUDGET_CONFIRM (presupuesto)
  {
    prompt:
      'Nuestros proyectos suelen requerir una inversión mensual a partir de $5,000 USD.\n¿Tu presupuesto se encuentra dentro de este rango?',
    choices: ['Sí', 'No'],
    placeholder: 'Sí / No',
    next: (answer) => {
      const lower = answer.trim().toLowerCase();
      // "no" → sub-pregunta de monto; cualquier otra respuesta → paso de madurez
      if (lower === 'no') return STEP_BUDGET_AMOUNT;
      return STEP_MATURITY;
    },
  },
  // 9 — STEP_BUDGET_AMOUNT (sólo si dijo "No")
  {
    prompt: '¿Qué monto mensual estarías dispuesto a invertir en este proyecto (USD)?',
    placeholder: 'Ej. $2,000 USD / mes',
    next: () => STEP_MATURITY,
  },
  // 10 — STEP_MATURITY
  {
    prompt: '¿Tienes una idea o ya está operando?',
    choices: ['Solo idea', 'En desarrollo', 'Ya operando'],
    placeholder: 'Elige una opción o escribe…',
  },
];

const LAST_STEP = STEPS.length - 1;

const INTRO_ASSISTANT =
  'Hola — soy el asistente de Vado. Te haré unas preguntas breves para entender mejor tu proyecto.';

const CLOSING_ASSISTANT =
  '¡Listo! Tu solicitud quedó registrada. En breve alguien del equipo te contactará por correo. ¿Hay algo más que quieras aclarar mientras tanto?';

const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [qualificationComplete, setQualificationComplete] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const apiBase = String(import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '');

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function startChatSession() {
    setQualificationComplete(false);
    setLeadSubmitting(false);
    setStep(0);
    setAnswers({});
    setDraft('');
    setMessages([
      {
        id: `a-open-${crypto.randomUUID()}`,
        role: 'assistant',
        text: `${INTRO_ASSISTANT}\n\n${STEPS[0].prompt}`,
      },
    ]);
    setOpen(true);
  }

  function appendAssistant(text: string, delay = 420) {
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${crypto.randomUUID()}`, role: 'assistant', text },
      ]);
    }, delay);
  }

  function dummyFollowUpReply() {
    appendAssistant(
      'Gracias por tu mensaje. Un miembro del equipo lo verá en cuanto esté disponible.',
      500,
    );
  }

  async function persistLeadAndFinish(newAnswers: Record<number, string>) {
    if (!apiBase) {
      appendAssistant(
        'No pudimos registrar tu solicitud: falta configurar la URL del servidor (VITE_API_BASE_URL).',
        280,
      );
      return;
    }
    setLeadSubmitting(true);
    const payload = answersToContactPayload(newAnswers);
    const result = await submitChatWidgetLead(apiBase, payload);
    setLeadSubmitting(false);
    if (result.ok) {
      setQualificationComplete(true);
      setStep(LAST_STEP + 1);
      appendAssistant(CLOSING_ASSISTANT);
    } else {
      const hint =
        result.detail?.trim() ||
        (result.status === 400
          ? 'Revisa los datos e intenta de nuevo.'
          : 'Intenta de nuevo en unos minutos.');
      appendAssistant(
        `No pudimos registrar tu solicitud (${result.status}). ${hint}`,
        320,
      );
    }
  }

  function submitAnswer(raw: string) {
    const text = raw.trim();
    if (!text) return;

    if (leadSubmitting) return;

    if (qualificationComplete) {
      setDraft('');
      setMessages((prev) => [
        ...prev,
        { id: `u-${crypto.randomUUID()}`, role: 'user', text },
      ]);
      dummyFollowUpReply();
      return;
    }

    if (step === 1 && !SIMPLE_EMAIL.test(text)) {
      appendAssistant('Ese correo no parece válido. ¿Podrías revisarlo e intentar de nuevo?', 200);
      return;
    }

    if (step === 2 && !phoneHasMinDigits(text)) {
      appendAssistant(
        'El teléfono debe tener al menos 10 dígitos. ¿Podrías revisarlo e intentar de nuevo?',
        200,
      );
      return;
    }

    const currentStep = STEPS[step];
    const newAnswers = { ...answers, [step]: text };
    setAnswers(newAnswers);

    setMessages((prev) => [
      ...prev,
      { id: `u-${crypto.randomUUID()}`, role: 'user', text },
    ]);
    setDraft('');

    if (step === LAST_STEP) {
      void persistLeadAndFinish(newAnswers);
      return;
    }

    const next =
      currentStep.next
        ? currentStep.next(text, newAnswers)
        : step + 1;

    setStep(next);
    appendAssistant(STEPS[next].prompt);
  }

  function submitDraft() {
    submitAnswer(draft);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitDraft();
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitDraft();
    }
  }

  const currentStep = STEPS[step];
  const showQuickReplies =
    !qualificationComplete &&
    currentStep?.choices &&
    currentStep.choices.length > 0;

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => startChatSession()}
          className={
            'bg-primary text-primary-foreground shadow-lg ring-primary/40 hover:bg-primary/90 ' +
            'focus-visible:ring-ring fixed bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))] ' +
            'right-[max(1.5rem,env(safe-area-inset-right,0px))] z-[100] flex size-14 items-center ' +
            'justify-center rounded-full transition focus-visible:ring-2 focus-visible:ring-offset-2 ' +
            'focus-visible:outline-none active:scale-95'
          }
          aria-haspopup="dialog"
          aria-expanded={false}
        >
          <MessageCircle className="size-7" aria-hidden />
          <span className="sr-only">Abrir chat de soporte</span>
        </button>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          aria-labelledby={titleId}
          className={
            'gap-0 p-0 sm:max-w-none ' +
            'fixed left-auto top-auto translate-x-0 translate-y-0 ' +
            'right-[max(0.75rem,env(safe-area-inset-right,0px))] ' +
            'bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] z-[100] ' +
            'flex h-[min(36rem,calc(100dvh-1rem))] w-[min(calc(100vw-1.5rem),25rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl ' +
            'origin-bottom-right data-[state=open]:fade-in data-[state=closed]:fade-out ' +
            'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 duration-200'
          }
        >
          <DialogHeader className="relative shrink-0 space-y-0 border-b px-4 py-4 text-left">
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 size-9 rounded-full"
              >
                <XIcon className="size-4" />
                <span className="sr-only">Cerrar chat</span>
              </Button>
            </DialogClose>
            <DialogTitle id={titleId} className="pr-11 text-lg">
              Chat con Vado
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              {qualificationComplete
                ? 'Puedes seguir escribiendo si lo necesitas'
                : 'Te guiamos con unas preguntas cortas'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              <ul className="flex flex-col gap-3">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-br-md px-3 py-2 text-sm whitespace-pre-wrap'
                          : 'bg-muted text-foreground max-w-[85%] rounded-2xl rounded-bl-md px-3 py-2 text-sm whitespace-pre-wrap'
                      }
                    >
                      {m.text}
                    </div>
                  </li>
                ))}
                <div ref={listEndRef} aria-hidden />
              </ul>
            </div>

            <footer className="bg-background shrink-0 space-y-3 rounded-b-2xl border-t p-4">
              {showQuickReplies ? (
                <div className="flex flex-wrap gap-2" role="group" aria-label="Respuestas sugeridas">
                  {currentStep.choices!.map((opt) => (
                    <Button
                      key={opt}
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={leadSubmitting}
                      className="h-auto shrink-0 rounded-full px-3 py-2 text-left text-xs leading-snug"
                      onClick={() => submitAnswer(opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>
              ) : null}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  disabled={leadSubmitting}
                  placeholder={
                    qualificationComplete
                      ? 'Escribe un mensaje…'
                      : (currentStep?.placeholder ?? 'Escribe tu respuesta…')
                  }
                  aria-label={
                    qualificationComplete
                      ? 'Mensaje'
                      : `Respuesta: ${currentStep?.prompt ?? ''}`
                  }
                  autoComplete={
                    step === 1
                      ? 'email'
                      : step === 0
                        ? 'organization'
                        : step === 2
                          ? 'tel'
                          : 'name'
                  }
                  className="flex-1"
                />
                <Button
                  type="submit"
                  size="icon"
                  aria-label="Enviar mensaje"
                  disabled={leadSubmitting}
                >
                  <Send className="size-4" />
                </Button>
              </form>
              {leadSubmitting ? (
                <p className="text-muted-foreground text-center text-xs">Guardando solicitud…</p>
              ) : null}
            </footer>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
