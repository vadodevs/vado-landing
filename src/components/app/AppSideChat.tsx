import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { AppThemeMode } from '@/lib/appTheme';
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

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

const INTRO =
  'Soy el asistente del panel. Puedes escribir dudas operativas; las respuestas automáticas son una vista previa hasta conectar datos internos.';

function placeholderReply(): string {
  return 'Gracias por tu mensaje. Esta conversación es una vista previa: pronto podremos enlazar contexto de tus pantallas (leads, desarrolladores, etc.).';
}

function SideChatPanel({ theme }: { theme: AppThemeMode }) {
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'welcome', role: 'assistant', text: INTRO },
  ]);
  const [draft, setDraft] = useState('');
  const isDark = theme === 'dark';

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const userId = `u-${crypto.randomUUID()}`;
    setMessages((prev) => [...prev, { id: userId, role: 'user', text }]);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${crypto.randomUUID()}`, role: 'assistant', text: placeholderReply() },
      ]);
    }, 450);
  }, [draft]);

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
        'flex h-full min-h-0 flex-col',
        isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900',
      )}
      role="region"
      aria-label="Chat"
    >
      <div
        className={cn(
          'min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3',
          isDark ? 'bg-zinc-950/50' : 'bg-zinc-50/80',
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

      <form
        onSubmit={onSubmit}
        className={cn(
          'shrink-0 border-t p-2.5',
          isDark ? 'border-zinc-700/80 bg-zinc-900' : 'border-zinc-200/90 bg-white',
        )}
      >
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Escribe un mensaje…"
            rows={2}
            className={cn(
              'min-h-[2.75rem] resize-none rounded-xl text-[13px]',
              isDark
                ? 'border-zinc-600 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-500'
                : 'border-zinc-200 bg-zinc-50/90 text-zinc-900 placeholder:text-zinc-500',
            )}
            aria-label="Mensaje para el asistente"
          />
          <Button
            type="submit"
            size="icon"
            className={cn(
              'size-10 shrink-0 rounded-xl bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700',
            )}
            aria-label="Enviar"
          >
            <Send className="size-4 text-white" />
          </Button>
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

  const panel = <SideChatPanel theme={theme} />;

  if (wide) {
    return (
      <aside
        id={regionId}
        style={{ width: APP_SIDE_CHAT_DESKTOP_WIDTH_PX }}
        className={cn(
          'pointer-events-auto fixed z-50 max-md:hidden',
          'top-2 bottom-2 right-2 flex flex-col overflow-hidden rounded-xl border shadow-lg',
          'transition-[transform,opacity,visibility] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform',
          open
            ? 'translate-x-0 opacity-100'
            : 'pointer-events-none translate-x-[calc(100%+0.75rem)] opacity-0',
          theme === 'dark'
            ? 'border-zinc-700/55 bg-zinc-900 shadow-black/50'
            : 'border-white/90 bg-white shadow-md shadow-zinc-900/10',
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
        className="flex w-full max-w-md flex-col gap-0 border-l p-0 sm:max-w-md"
        aria-label="Vado Intelligence"
      >
        {panel}
      </SheetContent>
    </Sheet>
  );
}
