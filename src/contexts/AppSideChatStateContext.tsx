/* eslint-disable react-refresh/only-export-components -- hook + provider */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

export type AppSideChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  /** Solo UI: no se envía a /admin/assistant/chat */
  localOnly?: boolean;
};

export const APP_SIDE_CHAT_WELCOME_TEXT =
  'Bienvenido a Vado Intelligence. Puedes preguntar por leads (Compañías), desarrolladores del directorio, ofertas laborales, reclutadores, empresas o proyectos; el asistente consulta los datos del panel.';

type AppSideChatStateContextValue = {
  messages: AppSideChatMessage[];
  setMessages: Dispatch<SetStateAction<AppSideChatMessage[]>>;
  draft: string;
  setDraft: Dispatch<SetStateAction<string>>;
  sending: boolean;
  setSending: Dispatch<SetStateAction<boolean>>;
  /** Limpia el hilo y deja solo el mensaje de bienvenida (misma sesión de panel). */
  startNewConversation: () => void;
};

const AppSideChatStateContext = createContext<AppSideChatStateContextValue | null>(null);

function initialSideChatMessages(): AppSideChatMessage[] {
  return [{ id: 'welcome', role: 'assistant', text: APP_SIDE_CHAT_WELCOME_TEXT, localOnly: true }];
}

export function AppSideChatStateProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AppSideChatMessage[]>(initialSideChatMessages);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const startNewConversation = useCallback(() => {
    setMessages(initialSideChatMessages());
    setDraft('');
    setSending(false);
  }, []);

  const value = useMemo(
    () => ({
      messages,
      setMessages,
      draft,
      setDraft,
      sending,
      setSending,
      startNewConversation,
    }),
    [messages, draft, sending, startNewConversation],
  );

  return <AppSideChatStateContext.Provider value={value}>{children}</AppSideChatStateContext.Provider>;
}

export function useAppSideChatState(): AppSideChatStateContextValue {
  const ctx = useContext(AppSideChatStateContext);
  if (!ctx) {
    throw new Error('useAppSideChatState must be used within AppSideChatStateProvider');
  }
  return ctx;
}
