import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Bot,
  ChevronLeft,
  Facebook,
  Instagram,
  MessageSquarePlus,
  Mic,
  MoreVertical,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
} from 'lucide-react';
import { Redirect } from 'wouter';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { WhatsAppGlyph } from '@/components/admin/AdminChannelIcons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import {
  postInboxLeadAssistantChat,
  type AssistantChatMessage,
  type InboxLeadChannel,
} from '@/lib/appAssistantChat';

export type AdminChannel = 'facebook' | 'whatsapp' | 'instagram' | 'bot-test';

const CHANNELS: readonly AdminChannel[] = ['facebook', 'whatsapp', 'instagram', 'bot-test'];

export function isAdminChannel(s: string): s is AdminChannel {
  return (CHANNELS as readonly string[]).includes(s);
}

type ChatMsg = { id: string; from: 'them' | 'us'; text: string; time: string };

const BOT_TEST_THREAD_SESSION_KEY = 'vado.adminCanales.botTestThread.v1';

function isChatMsgRow(x: unknown): x is ChatMsg {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    (o.from === 'them' || o.from === 'us') &&
    typeof o.text === 'string' &&
    typeof o.time === 'string'
  );
}

function loadBotThreadFromSession(fallback: ChatMsg[]): ChatMsg[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = sessionStorage.getItem(BOT_TEST_THREAD_SESSION_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return fallback;
    const rows = parsed.filter(isChatMsgRow);
    return rows.length > 0 ? rows : fallback;
  } catch {
    return fallback;
  }
}

function persistBotThreadToSession(messages: ChatMsg[]) {
  if (typeof window === 'undefined') return;
  try {
    const capped = messages.length > 200 ? messages.slice(-200) : messages;
    sessionStorage.setItem(BOT_TEST_THREAD_SESSION_KEY, JSON.stringify(capped));
  } catch {
    /* ignore quota / private mode */
  }
}

export type InboxConversation = {
  id: string;
  name: string;
  initials: string;
  timeLabel: string;
  messages: ChatMsg[];
};

function lastPreview(messages: ChatMsg[], max = 46): string {
  const last = messages[messages.length - 1];
  if (!last) return '';
  const raw = last.text.replace(/\s+/g, ' ').trim();
  return raw.length > max ? `${raw.slice(0, max)}…` : raw;
}

function buildWhatsappInbox(t: TFunction): InboxConversation[] {
  return [
    {
      id: 'wa-1',
      name: t('adminCanales.inboxNames.waPartnerx'),
      initials: 'PX',
      timeLabel: '09:14',
      messages: [
        { id: '1', from: 'them', text: 'Buen día, soy de la cuenta de PartnerX. ¿Tienen slot esta semana?', time: '09:05' },
        { id: '2', from: 'us', text: 'Buen día, podemos coordinar jueves 16:00 (GMT-3).', time: '09:12' },
        { id: '3', from: 'them', text: 'Genial, confirmo con el equipo y les aviso.', time: '09:14' },
      ],
    },
    {
      id: 'wa-2',
      name: t('adminCanales.inboxNames.waCliente'),
      initials: 'BS',
      timeLabel: 'Ayer',
      messages: [
        { id: '1', from: 'them', text: 'Les comparto el PDF con los requisitos del proyecto.', time: '17:40' },
        { id: '2', from: 'us', text: 'Recibido, lo revisamos y les contestamos mañana a primera hora.', time: '17:52' },
      ],
    },
    {
      id: 'wa-3',
      name: t('adminCanales.inboxNames.waTalento'),
      initials: 'TI',
      timeLabel: 'lun.',
      messages: [
        { id: '1', from: 'them', text: 'Hola, ¿siguen tomando perfiles senior en Node?', time: '11:02' },
        { id: '2', from: 'us', text: 'Sí, dejá el CV en el portal y te contactamos si hay match.', time: '11:18' },
        { id: '3', from: 'them', text: 'Listo, gracias.', time: '11:19' },
      ],
    },
  ];
}

function buildFacebookInbox(t: TFunction): InboxConversation[] {
  return [
    {
      id: 'fb-1',
      name: t('adminCanales.inboxNames.fbLaura'),
      initials: 'LM',
      timeLabel: '10:22',
      messages: [
        { id: '1', from: 'them', text: 'Hola, vi su anuncio en Meta. ¿Siguen buscando equipo remoto?', time: '10:12' },
        { id: '2', from: 'us', text: 'Hola Laura, gracias por escribir. Sí, estamos evaluando perfiles para Q3.', time: '10:18' },
      ],
    },
    {
      id: 'fb-2',
      name: t('adminCanales.inboxNames.fbAgencia'),
      initials: 'A3',
      timeLabel: '10:22',
      messages: [
        { id: '1', from: 'them', text: 'Perfecto. ¿Pueden compartir una breve descripción del stack?', time: '10:19' },
        { id: '2', from: 'us', text: 'Te envío un resumen por correo en unos minutos.', time: '10:22' },
      ],
    },
  ];
}

function buildInstagramInbox(t: TFunction): InboxConversation[] {
  return [
    {
      id: 'ig-1',
      name: t('adminCanales.inboxNames.igCreator'),
      initials: 'CM',
      timeLabel: '18:55',
      messages: [
        { id: '1', from: 'them', text: '🔥 Me encanta el reel de cultura remota.', time: '18:40' },
        { id: '2', from: 'us', text: 'Gracias, nos alegra que resuene.', time: '18:55' },
      ],
    },
    {
      id: 'ig-2',
      name: t('adminCanales.inboxNames.igDesign'),
      initials: 'DR',
      timeLabel: '19:10',
      messages: [
        { id: '1', from: 'them', text: '¿Hacen hiring para diseño también?', time: '19:02' },
        { id: '2', from: 'us', text: 'En esta etapa solo ingeniería; igual dejamos nota por si abrimos rol.', time: '19:10' },
      ],
    },
  ];
}

function buildBotTestInbox(t: TFunction): InboxConversation[] {
  return [
    {
      id: 'bot',
      name: t('sidebarDemo.navChannelBotTest'),
      initials: 'BT',
      timeLabel: '·',
      messages: [],
    },
  ];
}

function buildInboxConversations(ch: AdminChannel, t: TFunction): InboxConversation[] {
  switch (ch) {
    case 'whatsapp':
      return buildWhatsappInbox(t);
    case 'facebook':
      return buildFacebookInbox(t);
    case 'instagram':
      return buildInstagramInbox(t);
    case 'bot-test':
      return buildBotTestInbox(t);
  }
}

function formatChatTime(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function threadToAssistantMessages(thread: ChatMsg[]): AssistantChatMessage[] {
  return thread.map((m) => ({
    role: m.from === 'us' ? 'user' : 'assistant',
    content: m.text,
  }));
}

type ChannelChrome = {
  titleKey: string;
  seoKey: string;
  /** Barra superior del panel de conversación (estilo WhatsApp / marca canal) */
  headerBar: string;
  listBg: string;
};

function channelChrome(ch: AdminChannel): ChannelChrome {
  switch (ch) {
    case 'whatsapp':
      return {
        titleKey: 'sidebarDemo.navChannelWhatsApp',
        seoKey: 'seo.appAdminCanalesWhatsApp',
        headerBar: 'bg-[#008069] text-white',
        listBg: 'bg-[#f0f2f5] dark:bg-[#111b21]',
      };
    case 'facebook':
      return {
        titleKey: 'sidebarDemo.navChannelFacebook',
        seoKey: 'seo.appAdminCanalesFacebook',
        headerBar: 'bg-[#1877F2] text-white',
        listBg: 'bg-[#f0f2f5] dark:bg-[#111b21]',
      };
    case 'instagram':
      return {
        titleKey: 'sidebarDemo.navChannelInstagram',
        seoKey: 'seo.appAdminCanalesInstagram',
        headerBar: 'bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#F77737] text-white',
        listBg: 'bg-[#f0f2f5] dark:bg-[#111b21]',
      };
    case 'bot-test':
      return {
        titleKey: 'sidebarDemo.navChannelBotTest',
        seoKey: 'seo.appAdminCanalesBotTest',
        headerBar: 'bg-[#128c7e] text-white dark:bg-[#0f7669]',
        listBg: 'bg-[#f0f2f5] dark:bg-[#111b21]',
      };
  }
}

function ChannelHeaderIcon({ channel }: { channel: AdminChannel }) {
  if (channel === 'facebook') {
    return <Facebook className="size-5 shrink-0 text-white" strokeWidth={1.75} aria-hidden />;
  }
  if (channel === 'instagram') {
    return <Instagram className="size-5 shrink-0 text-white" strokeWidth={1.75} aria-hidden />;
  }
  if (channel === 'bot-test') {
    return <Bot className="size-5 shrink-0 text-white" strokeWidth={2} aria-hidden />;
  }
  return <WhatsAppGlyph className="size-5 text-white" />;
}

function useIsDesktopMd(): boolean {
  const [ok, setOk] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const fn = () => setOk(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return ok;
}

/** Fondo tipo papel tapiz WA Web (tiled dots) */
function WaThreadBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.11] dark:opacity-[0.14]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }}
      aria-hidden
    />
  );
}

function WaMessageBubble({
  from,
  children,
  time,
}: {
  from: 'them' | 'us';
  children: ReactNode;
  time: string;
}) {
  const us = from === 'us';
  return (
    <div className={cn('relative max-w-[min(100%,920px)]', us ? 'ml-4 md:ml-10' : '')}>
      {!us ? (
        <div
          className="absolute bottom-[9px] left-[-6px] z-0 h-0 w-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-white dark:border-r-[#202c33]"
          aria-hidden
        />
      ) : (
        <div
          className="absolute bottom-[9px] right-[-6px] z-0 h-0 w-0 border-y-[6px] border-y-transparent border-l-[7px] border-l-[#d9fdd3] dark:border-l-[#005c4b]"
          aria-hidden
        />
      )}
      <div
        className={cn(
          'relative z-[1] rounded-lg px-2.5 py-1.5 text-[14.2px] leading-snug shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
          us
            ? 'rounded-br-sm bg-[#d9fdd3] text-zinc-900 dark:bg-[#005c4b] dark:text-emerald-50'
            : 'rounded-bl-sm bg-white text-zinc-900 dark:bg-[#202c33] dark:text-zinc-100',
        )}
      >
        {children}
        <p
          className={cn(
            'mt-0.5 flex items-center justify-end gap-1 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400',
            us && 'text-emerald-900/75 dark:text-emerald-100/75',
          )}
        >
          <span>{time}</span>
        </p>
      </div>
    </div>
  );
}

type InboxProps = {
  channel: AdminChannel;
  chrome: ChannelChrome;
  isInteractive: boolean;
};

function ChannelWhatsAppInbox({ channel, chrome, isInteractive }: InboxProps) {
  const { t } = useTranslation();
  const isMd = useIsDesktopMd();
  const bottomRef = useRef<HTMLDivElement>(null);

  const baseConversations = useMemo(() => buildInboxConversations(channel, t), [channel, t]);
  const [dynamicRows, setDynamicRows] = useState<InboxConversation[]>([]);

  const conversations = useMemo(
    () => [...dynamicRows, ...baseConversations],
    [dynamicRows, baseConversations],
  );

  const [selectedId, setSelectedId] = useState(() => buildInboxConversations(channel, t)[0]?.id ?? '');
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const [botThread, setBotThread] = useState<ChatMsg[]>(() => {
    if (!isInteractive) return [];
    const welcome: ChatMsg = {
      id: 'welcome',
      from: 'them',
      text: t('adminCanales.botTestWelcome'),
      time: formatChatTime(new Date()),
    };
    return loadBotThreadFromSession([welcome]);
  });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  const prevChannelRef = useRef<AdminChannel | null>(null);
  useEffect(() => {
    if (prevChannelRef.current === null) {
      prevChannelRef.current = channel;
      return;
    }
    if (prevChannelRef.current === channel) return;
    prevChannelRef.current = channel;
    setDynamicRows([]);
    const first = buildInboxConversations(channel, t)[0]?.id ?? '';
    setSelectedId(first);
    setMobileShowThread(false);
  }, [channel, t]);

  useEffect(() => {
    if (!isInteractive) return;
    persistBotThreadToSession(botThread);
  }, [botThread, isInteractive]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? conversations[0],
    [conversations, selectedId],
  );

  const threadMessages = useMemo(() => {
    if (isInteractive && selected?.id === 'bot') return botThread;
    return selected?.messages ?? [];
  }, [isInteractive, selected?.id, selected?.messages, botThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [threadMessages, sending, selectedId]);

  const sendBot = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending || !isInteractive) return;
    setDraft('');
    const userMsg: ChatMsg = {
      id: `u-${crypto.randomUUID()}`,
      from: 'us',
      text,
      time: formatChatTime(new Date()),
    };
    const nextThread = [...botThread, userMsg];
    setBotThread(nextThread);
    setSending(true);
    let replyText: string;
    try {
      const inboxChannel = channel as InboxLeadChannel;
      const result = await postInboxLeadAssistantChat(threadToAssistantMessages(nextThread), inboxChannel);
      replyText = result.ok
        ? result.reply
        : result.reason === 'no-config'
          ? t('adminCanales.botErrorNoConfig')
          : result.reason === 'no-auth'
            ? t('adminCanales.botErrorNoAuth')
            : (result.message?.trim() || t('adminCanales.botErrorGeneric'));
    } catch {
      replyText = t('adminCanales.botErrorGeneric');
    } finally {
      setSending(false);
    }
    const reply: ChatMsg = {
      id: `b-${crypto.randomUUID()}`,
      from: 'them',
      text: replyText,
      time: formatChatTime(new Date()),
    };
    setBotThread((prev) => [...prev, reply]);
  }, [draft, sending, isInteractive, botThread, channel, t]);

  const openThread = (id: string) => {
    setSelectedId(id);
    if (!isMd) setMobileShowThread(true);
  };

  const startNewChat = useCallback(() => {
    if (channel === 'bot-test' && isInteractive) {
      const welcome: ChatMsg = {
        id: 'welcome',
        from: 'them',
        text: t('adminCanales.botTestWelcome'),
        time: formatChatTime(new Date()),
      };
      setBotThread([welcome]);
      try {
        sessionStorage.removeItem(BOT_TEST_THREAD_SESSION_KEY);
      } catch {
        /* ignore */
      }
      setDraft('');
      setSelectedId('bot');
      if (!isMd) setMobileShowThread(true);
      return;
    }
    const id = `demo-${Date.now()}`;
    const now = formatChatTime(new Date());
    setDynamicRows((prev) => [
      {
        id,
        name: t('adminCanales.inboxNewChatName'),
        initials: '+',
        timeLabel: now,
        messages: [
          {
            id: `${id}-open`,
            from: 'them',
            text: t('adminCanales.inboxNewChatSeed'),
            time: now,
          },
        ],
      },
      ...prev,
    ]);
    setSelectedId(id);
    if (!isMd) setMobileShowThread(true);
  }, [channel, isInteractive, isMd, t]);

  const backToList = () => setMobileShowThread(false);

  const showListPane = isMd || !mobileShowThread;
  const showThreadPane = isMd || mobileShowThread;

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden',
        'border-0 shadow-none',
      )}
    >
      {/* Lista de chats (estilo WhatsApp Web) */}
      <div
        className={cn(
          'flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-black/10 md:w-[min(520px,38vw)] md:min-w-[300px] md:max-w-[560px] md:shrink-0 md:border-r dark:border-white/10',
          chrome.listBg,
          !showListPane && 'max-md:hidden',
        )}
      >
        <div className="flex shrink-0 items-center gap-1 border-b border-black/10 px-2 py-2 dark:border-white/10 dark:bg-[#202c33]">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 text-xs font-bold text-white shadow-sm"
            aria-hidden
          >
            VA
          </div>
          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
              {t('adminCanales.inboxChatsTitle')}
            </p>
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">{t('adminCanales.inboxYourAccount')}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-full text-zinc-600 hover:bg-black/[0.06] dark:text-zinc-300 dark:hover:bg-white/10"
            title={t('adminCanales.inboxToolbarNewChat')}
            aria-label={t('adminCanales.inboxToolbarNewChat')}
            onClick={startNewChat}
          >
            <MessageSquarePlus className="size-[22px]" strokeWidth={1.5} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-full text-zinc-600 hover:bg-black/[0.06] dark:text-zinc-300 dark:hover:bg-white/10"
            title={t('adminCanales.inboxToolbarMenu')}
          >
            <MoreVertical className="size-[22px]" strokeWidth={1.5} />
          </Button>
        </div>

        <div className="shrink-0 border-b border-black/5 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#111b21]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <Input
              readOnly
              className="h-9 border-0 bg-[#f0f2f5] pl-9 text-sm text-zinc-800 shadow-none dark:bg-[#2a3942] dark:text-zinc-100"
              placeholder={t('adminCanales.inboxSearchPlaceholder')}
              aria-label={t('adminCanales.inboxSearchPlaceholder')}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-white dark:bg-[#111b21]" role="listbox" aria-label={t('sidebarDemo.navChannels')}>
          {conversations.map((c) => {
            const active = c.id === selectedId;
            const rowPreview =
              isInteractive && c.id === 'bot'
                ? lastPreview(threadMessages) || '—'
                : lastPreview(c.messages) || '—';
            const rowTime =
              isInteractive && c.id === 'bot'
                ? threadMessages[threadMessages.length - 1]?.time ?? c.timeLabel
                : c.messages[c.messages.length - 1]?.time ?? c.timeLabel;
            return (
              <button
                key={c.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => openThread(c.id)}
                className={cn(
                  'flex w-full gap-3 border-b border-black/[0.06] px-3 py-2.5 text-left transition-colors dark:border-white/[0.06]',
                  active ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]',
                )}
              >
                <div
                  className={cn(
                    'flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white shadow-sm',
                    channel === 'whatsapp' && 'bg-[#128c7e]',
                    channel === 'facebook' && 'bg-[#1877F2]',
                    channel === 'instagram' && 'bg-gradient-to-br from-[#833AB4] to-[#F77737]',
                    channel === 'bot-test' && 'bg-[#14d9ce] text-zinc-900',
                  )}
                >
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[15px] font-medium text-zinc-900 dark:text-zinc-50">{c.name}</span>
                    <span className="shrink-0 text-[11px] text-emerald-700 tabular-nums dark:text-emerald-400/90">
                      {rowTime}
                    </span>
                  </div>
                  <p className="truncate text-[13px] text-zinc-500 dark:text-zinc-400">{rowPreview}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hilo de mensajes: overflow-hidden + columna interna con flex-1 para que solo el listado haga scroll y el input quede fijo abajo */}
      <div
        className={cn(
          'relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#efeae2] dark:bg-[#0b141a]',
          !showThreadPane && 'max-md:hidden',
        )}
      >
        <WaThreadBackdrop />

        <div className={cn('relative z-[1] flex h-[52px] shrink-0 items-center gap-1 px-1 shadow-md', chrome.headerBar)}>
          {!isMd ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-white hover:bg-white/10 md:hidden"
              onClick={backToList}
              aria-label={t('adminCanales.inboxBack')}
            >
              <ChevronLeft className="size-6" />
            </Button>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-black/10 ring-1 ring-white/20">
              <ChannelHeaderIcon channel={channel} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[16px] font-medium leading-tight tracking-tight">{selected?.name}</p>
              <p className="truncate text-[12px] text-white/90">{t('adminCanales.inboxOnline')}</p>
            </div>
          </div>
        </div>

        <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 min-w-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-3 md:px-4">
            {threadMessages.length === 0 && !isInteractive ? (
              <p className="py-8 text-center text-sm text-zinc-500">{t('adminCanales.inboxTapChat')}</p>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="mx-auto mb-2 rounded-md bg-white/80 px-3 py-0.5 text-[11px] font-medium text-zinc-600 shadow-sm dark:bg-[#182229]/90 dark:text-zinc-400">
                  {t('adminCanales.mockToday')}
                </div>
                {threadMessages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex items-end gap-2 px-1',
                      m.from === 'us' ? 'justify-end' : 'justify-start',
                    )}
                  >
                    {m.from === 'them' ? (
                      <div
                        className={cn(
                          'mb-1 flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10',
                          channel === 'bot-test' && 'bg-[#14d9ce] text-zinc-900',
                          channel === 'whatsapp' && 'bg-[#128c7e] text-white',
                          channel === 'facebook' && 'bg-[#1877F2] text-white',
                          channel === 'instagram' &&
                            'bg-gradient-to-br from-[#833AB4] to-[#F77737] text-white',
                        )}
                      >
                        {channel === 'bot-test' ? (
                          <Bot className="size-4" strokeWidth={2} aria-hidden />
                        ) : (
                          <span className="text-[10px] font-bold">{selected?.initials?.slice(0, 2) ?? '·'}</span>
                        )}
                      </div>
                    ) : null}
                    <WaMessageBubble from={m.from} time={m.time}>
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    </WaMessageBubble>
                  </div>
                ))}
                {sending && isInteractive ? (
                  <div className="flex items-end justify-start gap-2 px-1">
                    <div
                      className={cn(
                        'mb-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#14d9ce] text-zinc-900 shadow-sm ring-1 ring-black/5 dark:ring-white/10',
                      )}
                    >
                      <Bot className="size-4" strokeWidth={2} aria-hidden />
                    </div>
                    <div className="relative max-w-[min(100%,520px)] rounded-lg rounded-bl-sm bg-white px-2.5 py-2 text-sm text-zinc-500 shadow-md ring-1 ring-black/[0.06] dark:bg-[#202c33] dark:text-zinc-400">
                      …
                    </div>
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          <div className="relative z-[1] shrink-0 border-t border-black/10 bg-[#f0f2f5] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1.5 dark:border-white/10 dark:bg-[#1f2c33]">
            {isInteractive ? (
              <form
                className="flex items-center gap-1.5"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendBot();
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 rounded-full text-zinc-500 hover:bg-zinc-200/90 dark:text-zinc-400 dark:hover:bg-zinc-600/60"
                  title={t('adminCanales.inboxPlus')}
                >
                  <Plus className="size-6" strokeWidth={1.25} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 rounded-full text-zinc-500 hover:bg-zinc-200/90 dark:text-zinc-400 dark:hover:bg-zinc-600/60"
                  title={t('adminCanales.inboxAttach')}
                >
                  <Paperclip className="size-[22px]" strokeWidth={1.5} />
                </Button>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={t('adminCanales.botInputPlaceholder')}
                  className="min-h-11 flex-1 rounded-lg border-0 bg-white px-3 py-2.5 text-[15px] shadow-sm ring-1 ring-black/[0.06] dark:bg-[#2a3942] dark:text-zinc-100 dark:ring-white/10"
                  aria-label={t('adminCanales.botInputAria')}
                  disabled={sending}
                  maxLength={2000}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 rounded-full text-zinc-500 hover:bg-zinc-200/90 dark:text-zinc-400 dark:hover:bg-zinc-600/60"
                  title={t('adminCanales.inboxEmoji')}
                >
                  <Smile className="size-[22px]" strokeWidth={1.5} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 rounded-full text-zinc-500 hover:bg-zinc-200/90 dark:text-zinc-400 dark:hover:bg-zinc-600/60"
                  title={t('adminCanales.inboxMicDemo')}
                >
                  <Mic className="size-[22px]" strokeWidth={1.5} />
                </Button>
                <Button
                  type="submit"
                  size="icon"
                  className="size-11 shrink-0 rounded-full bg-[#00a884] text-white shadow-md hover:bg-[#008f72] dark:bg-[#00a884]"
                  disabled={sending || !draft.trim()}
                  aria-label={t('adminCanales.botSend')}
                >
                  <Send className="size-[22px]" strokeWidth={1.5} />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 rounded-full text-zinc-500 opacity-70 dark:text-zinc-400"
                  disabled
                >
                  <Plus className="size-6" strokeWidth={1.25} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 rounded-full text-zinc-500 opacity-70 dark:text-zinc-400"
                  disabled
                >
                  <Paperclip className="size-[22px]" strokeWidth={1.5} />
                </Button>
                <Input
                  readOnly
                  disabled
                  placeholder={t('adminCanales.mockInputPlaceholder')}
                  className="min-h-11 flex-1 rounded-lg border-0 bg-white py-2.5 text-[15px] opacity-90 shadow-sm ring-1 ring-black/[0.06] dark:bg-[#2a3942] dark:ring-white/10"
                  aria-label={t('adminCanales.mockInputAria')}
                />
                <Smile className="size-5 shrink-0 text-zinc-400 opacity-60" aria-hidden />
                <Mic className="size-5 shrink-0 text-zinc-400 opacity-60" aria-hidden />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppAdminCanales({ channel }: { channel: string }) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const normalized = channel.toLowerCase();

  if (!isAdminChannel(normalized)) {
    return <Redirect to={path('/app/admin/canales/facebook')} />;
  }

  const ch = normalized;
  const chrome = channelChrome(ch);
  const title = t(chrome.titleKey);
  const description = t(chrome.seoKey);
  const pathSuffix = `/app/admin/canales/${ch}`;

  return (
    <AppShell
      pathWithoutLang={pathSuffix}
      title={title}
      description={description}
      contentOverflow="hidden"
      contentFlush
    >
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <ChannelWhatsAppInbox channel={ch} chrome={chrome} isInteractive={ch === 'bot-test'} />
      </div>
    </AppShell>
  );
}
