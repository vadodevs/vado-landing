import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { ArrowUp, MessageSquarePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import type { AppThemeMode } from '@/lib/appTheme';
import { useAppSideChatState, type AppSideChatMessage } from '@/contexts/AppSideChatStateContext';
import { postAssistantChat, type AssistantChatMessage } from '@/lib/appAssistantChat';
import { cn } from '@/lib/utils';

const MD_MIN = 768;

function useDesktopDock() {
  const [wide, setWide] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= MD_MIN : false,
  );

  useLayoutEffect(() => {
    const mq = window.matchMedia(`(min-width: ${MD_MIN}px)`);
    const apply = () => setWide(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return wide;
}

/** Misma lógica visual que el rail lateral: vidrio translúcido + blur (visionOS-ish). */
function chatDockGlassShell(isDark: boolean) {
  return isDark
    ? cn(
        'border border-white/[0.18] bg-transparent',
        'bg-gradient-to-br from-zinc-950/58 via-zinc-900/42 to-zinc-900/24',
        'backdrop-blur-[48px] backdrop-saturate-[1.85] backdrop-brightness-[1.08]',
        'shadow-[0_26px_64px_-18px_rgba(0,0,0,0.52),inset_0_1px_0_rgba(255,255,255,0.22)]',
        'ring-1 ring-inset ring-white/[0.07]',
      )
    : cn(
        'border border-white/[0.42] bg-transparent',
        'bg-gradient-to-br from-white/14 via-zinc-200/32 to-zinc-500/38',
        'backdrop-blur-[40px] backdrop-saturate-[1.35]',
        'shadow-[0_14px_44px_-10px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.65)]',
        'ring-1 ring-inset ring-zinc-900/[0.05]',
      );
}

function ThinkingDots({ isDark }: { isDark: boolean }) {
  return (
    <span className="inline-flex items-center gap-0.5 px-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            'size-1 rounded-full motion-safe:animate-bounce',
            isDark ? 'bg-sky-400' : 'bg-sky-500',
          )}
          style={{ animationDelay: `${i * 140}ms`, animationDuration: '0.85s' }}
        />
      ))}
    </span>
  );
}

function SideChatPanel({ theme }: { theme: AppThemeMode }) {
  const { t } = useTranslation();
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const { messages, setMessages, draft, setDraft, sending, setSending, startNewConversation } =
    useAppSideChatState();
  const isDark = theme === 'dark';

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const send = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft('');

    let apiMessages: AssistantChatMessage[] = [];
    setMessages((prev) => {
      const userMsg: AppSideChatMessage = { id: `u-${crypto.randomUUID()}`, role: 'user', text };
      const thread = [...prev, userMsg];
      apiMessages = thread
        .filter((m) => !m.localOnly)
        .map((m) => ({ role: m.role, content: m.text }));
      return thread;
    });

    setSending(true);
    const result = await postAssistantChat(apiMessages);
    setSending(false);
    if (result.ok) {
      setMessages((prev) => [...prev, { id: `a-${crypto.randomUUID()}`, role: 'assistant', text: result.reply }]);
      return;
    }
    const errText =
      result.reason === 'no-config'
        ? 'Falta VITE_API_BASE_URL o VITE_ADMIN_API_BASE_URL en el front (URL del backend adminvado).'
        : result.reason === 'no-auth'
          ? 'No hay sesión del panel. Vuelve a iniciar sesión.'
          : result.message?.trim() || `No se pudo contactar al asistente (${result.status ?? 'error'}).`;
    setMessages((prev) => [...prev, { id: `a-${crypto.randomUUID()}`, role: 'assistant', text: errText }]);
  }, [draft, sending, setDraft, setMessages, setSending]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className={cn(
        'relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent transition-shadow duration-300',
        isDark ? 'text-zinc-100' : 'text-zinc-900',
        sending &&
          'shadow-[0_0_0_1px_rgba(56,189,248,0.35),0_0_32px_rgba(59,130,246,0.2)] ring-1 ring-sky-500/30',
      )}
      role="region"
      aria-label="Chat"
      aria-busy={sending}
    >
      <div
        className={cn(
          'relative z-10 flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2',
          isDark ? 'border-white/10 bg-zinc-950/30' : 'border-zinc-200/80 bg-white/30',
        )}
      >
        <span
          className={cn(
            'min-w-0 truncate text-[12px] font-semibold tracking-tight',
            isDark ? 'text-zinc-100' : 'text-zinc-900',
          )}
        >
          Vado Intelligence
        </span>
        <button
          type="button"
          onClick={startNewConversation}
          disabled={sending}
          title={t('appSideChat.newChatAria')}
          aria-label={t('appSideChat.newChatAria')}
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors',
            isDark
              ? 'text-sky-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40'
              : 'text-sky-700 hover:bg-black/[0.06] disabled:cursor-not-allowed disabled:opacity-40',
          )}
        >
          <MessageSquarePlus className="size-3.5" strokeWidth={2} aria-hidden />
          {t('appSideChat.newChat')}
        </button>
      </div>
      <div
        className={cn(
          'relative z-10 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3',
          isDark ? 'bg-zinc-950/25 backdrop-blur-sm' : 'bg-white/20 backdrop-blur-sm',
        )}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[min(100%,20rem)] rounded-2xl px-3 py-2 text-[13px] leading-snug whitespace-pre-wrap',
                m.role === 'user'
                  ? isDark
                    ? 'bg-zinc-700 text-zinc-50'
                    : 'bg-zinc-800 text-white'
                  : isDark
                    ? 'bg-zinc-800/90 text-zinc-100 ring-1 ring-zinc-700/80'
                    : 'border border-zinc-200/90 bg-white text-zinc-800 shadow-sm',
              )}
            >
              {m.text}
            </div>
          </div>
        ))}
        <div ref={listEndRef} />
      </div>

      {/* Compositor: mismo lenguaje visual que el hilo (claro u oscuro según tema). */}
      <form
        onSubmit={onSubmit}
        className={cn(
          'relative z-[1] shrink-0 border-t px-3 pb-3 pt-2 backdrop-blur-md',
          isDark ? 'border-white/10 bg-zinc-950/25' : 'border-zinc-500/15 bg-white/25',
        )}
      >
        <div
          className={cn(
            'rounded-2xl border p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-[box-shadow,ring] duration-300',
            isDark
              ? 'border-zinc-600/90 bg-[#262626]'
              : 'border-zinc-300/90 bg-white shadow-sm ring-1 ring-zinc-900/[0.06]',
            sending &&
              cn(
                'ring-2 ring-sky-400/75 ring-offset-2 ring-offset-transparent',
                'shadow-[0_0_0_1px_rgba(56,189,248,0.45),0_0_36px_12px_rgba(59,130,246,0.35),inset_0_0_20px_rgba(56,189,248,0.06)]',
                'motion-safe:animate-[pulse_2.2s_ease-in-out_infinite]',
              ),
          )}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={sending}
            placeholder="Pregunta al vado intelligence…"
            rows={3}
            className={cn(
              'w-full min-h-[4.25rem] resize-none bg-transparent px-1.5 py-1 text-[13px] leading-relaxed outline-none focus:outline-none',
              isDark
                ? 'text-zinc-100 placeholder:text-zinc-500'
                : 'text-zinc-900 placeholder:text-zinc-500',
            )}
            aria-label="Mensaje para el asistente"
          />
          <div
            className={cn(
              'mt-1 flex items-center justify-between gap-2 border-t pt-1.5',
              isDark ? 'border-zinc-700/80' : 'border-zinc-200/90',
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-1">
              {sending ? (
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 text-[11px] font-medium',
                    isDark ? 'text-sky-400/95' : 'text-sky-600',
                  )}
                  role="status"
                  aria-live="polite"
                >
                  Pensando
                  <ThinkingDots isDark={isDark} />
                </span>
              ) : (
                <span className="truncate pl-1 text-[11px] text-zinc-500">
                  Enter para enviar · Shift+Enter salto
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors',
                isDark
                  ? 'bg-zinc-100 text-zinc-900 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-500 disabled:opacity-50'
                  : 'bg-zinc-900 text-white shadow-sm hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 disabled:opacity-50',
              )}
              aria-label="Enviar"
            >
              <ArrowUp className="size-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

/** Ancho del dock en desktop; el shell usa `md:pr-[calc(400px+0.5rem)]` por el `right-2`. */
export const APP_SIDE_CHAT_DESKTOP_WIDTH_PX = 400;

export type AppSideChatDockProps = {
  theme: AppThemeMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Mismo `id` que `aria-controls` del botón Vado Intelligence */
  regionId: string;
};

/** Desktop: tarjeta ficha a la derecha con slide. Móvil: hoja controlada por el mismo estado. */
export function AppSideChatDock({ theme, open, onOpenChange, regionId }: AppSideChatDockProps) {
  const wide = useDesktopDock();
  const isDark = theme === 'dark';
  const glass = chatDockGlassShell(isDark);

  const panel = <SideChatPanel theme={theme} />;

  if (wide) {
    return (
      <aside
        id={regionId}
        style={
          {
            '--side-chat-width': `${APP_SIDE_CHAT_DESKTOP_WIDTH_PX}px`,
          } as CSSProperties
        }
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden rounded-3xl max-md:hidden',
          'top-2 bottom-2 transition-[transform,opacity,visibility,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform',
          open
            ? 'pointer-events-auto visible right-2 w-[var(--side-chat-width,400px)] translate-x-0 opacity-100'
            : 'pointer-events-none invisible right-0 w-0 max-w-0 translate-x-full overflow-hidden opacity-0',
          glass,
        )}
        aria-label="Vado Intelligence"
        aria-hidden={!open}
      >
        {panel}
      </aside>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id={regionId}
        side="right"
        showCloseButton={false}
        className={cn(
          'flex w-full max-w-md flex-col gap-0 border-0 p-0 sm:max-w-md',
          '!bg-transparent',
          glass,
        )}
        aria-label="Vado Intelligence"
      >
        {panel}
      </SheetContent>
    </Sheet>
  );
}
