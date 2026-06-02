import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
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
  X,
} from 'lucide-react';
import { Link, Redirect } from 'wouter';
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
import {
  fetchInboxConversations,
  fetchInboxMessages,
  fetchWhatsappLinkStatus,
  markInboxConversationRead,
  sendInboxImage,
  sendInboxMessage,
  type InboxConversationDto,
  type InboxMessageDto,
} from '@/lib/adminInboxApi';
import {
  loadInboxMessageMediaUrl,
  readFileAsBase64,
  releaseInboxMessageMediaUrl,
} from '@/lib/inboxMessageMedia';
import { isAdminChannel, type AdminChannel } from '@/lib/adminCanalesChannel';

type ChatMsg = {
  id: string;
  from: 'them' | 'us';
  text: string;
  time: string;
  mediaType?: string | null;
  hasMedia?: boolean;
  /** Vista previa local mientras se sube (solo optimista). */
  localMediaUrl?: string | null;
};

const WHATSAPP_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

const INBOX_CONVERSATION_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRealInboxConversationId(id: string): boolean {
  return INBOX_CONVERSATION_UUID_RE.test(id);
}

const MEDIA_PREVIEW_LABELS = /^\[(Imagen|Video|Audio|Documento|Sticker)\]$/;

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
  lastPreview?: string;
  unreadCount?: number;
};

type InboxDataSource = 'mock' | 'bot-test' | 'whatsapp-api';

type WhatsappGate = 'loading' | 'linked' | 'not-linked' | 'no-auth' | 'error';

function WhatsappInboxEmpty({ gate }: { gate: WhatsappGate }) {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-[#f0f2f5] px-6 py-12 text-center dark:bg-[#111b21]">
      <div className="flex size-16 items-center justify-center rounded-full bg-[#128c7e] text-white shadow-md">
        <WhatsAppGlyph className="size-8" />
      </div>
      {gate === 'loading' ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">{t('adminCanales.whatsappLoadingChats')}</p>
      ) : gate === 'no-auth' ? (
        <>
          <h2 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('adminCanales.inboxAuthRequired')}
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            {t('adminCanales.inboxAuthRequiredBody')}
          </p>
          <Button asChild className="mt-6 bg-[#128c7e] hover:bg-[#0f7669]">
            <Link href={path('/login?next=admin')}>{t('adminCanales.inboxAuthLogin')}</Link>
          </Button>
        </>
      ) : (
        <>
          <h2 className="mt-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {t('adminCanales.whatsappNotLinkedTitle')}
          </h2>
          <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
            {t('adminCanales.whatsappNotLinkedBody')}
          </p>
          <Button asChild className="mt-6 bg-[#128c7e] hover:bg-[#0f7669]">
            <Link href={path('/app/admin/settings#whatsapp')}>{t('adminCanales.whatsappGoToSettings')}</Link>
          </Button>
        </>
      )}
    </div>
  );
}

function initialsForContact(name: string, externalId: string): string {
  const trimmed = name.trim();
  if (trimmed.length >= 2 && !/^\d+$/.test(trimmed.replace(/\D/g, ''))) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  const digits = externalId.replace(/\D/g, '');
  return digits.length >= 2 ? digits.slice(-2) : 'WA';
}

function formatInboxTimeLabel(iso: string, t: TFunction): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return formatChatTime(d);
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) {
    return t('adminCanales.whatsappYesterday');
  }
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

function mapConversationDto(c: InboxConversationDto, t: TFunction): InboxConversation {
  const name = c.contactName?.trim() || c.externalId;
  return {
    id: c.id,
    name,
    initials: initialsForContact(name, c.externalId),
    timeLabel: formatInboxTimeLabel(c.lastMessageAt, t),
    messages: [],
    lastPreview: c.lastMessagePreview?.trim() || undefined,
    unreadCount: c.unreadCount,
  };
}

function mapMessageDto(m: InboxMessageDto): ChatMsg {
  const sentAt = new Date(m.sentAt);
  return {
    id: m.id,
    from: m.direction === 'outbound' ? 'us' : 'them',
    text: m.body,
    time: Number.isNaN(sentAt.getTime()) ? '' : formatChatTime(sentAt),
    mediaType: m.mediaType ?? null,
    hasMedia: m.hasMedia ?? Boolean(m.mediaType),
  };
}

function messageExpectsMedia(msg: ChatMsg): boolean {
  return Boolean(msg.mediaType) && (msg.hasMedia ?? false);
}

function getBubbleVariantForList(msg: ChatMsg): 'text' | 'media' {
  if (!messageExpectsMedia(msg) && !msg.localMediaUrl) return 'text';
  const isImage = msg.mediaType === 'image' || msg.mediaType === 'sticker';
  if (!isImage) return 'text';
  const showText =
    msg.text.trim().length > 0 && !MEDIA_PREVIEW_LABELS.test(msg.text.trim());
  return showText ? 'text' : 'media';
}

type WhatsappMessageLayout = {
  hasMedia: boolean;
  isImage: boolean;
  isSticker: boolean;
  isVideo: boolean;
  isMediaMessage: boolean;
  showText: boolean;
  bubbleVariant: 'text' | 'media';
};

function getWhatsappMessageLayout(msg: ChatMsg, mediaSrc: string | null): WhatsappMessageLayout {
  const isImage = msg.mediaType === 'image';
  const isSticker = msg.mediaType === 'sticker';
  const isVideo = msg.mediaType === 'video';
  const hasMedia = Boolean(mediaSrc);
  const showText =
    msg.text.trim().length > 0 && !MEDIA_PREVIEW_LABELS.test(msg.text.trim());
  const imageOnly = (isImage || isSticker) && hasMedia && !showText;
  return {
    hasMedia,
    isImage,
    isSticker,
    isVideo,
    isMediaMessage: Boolean(msg.mediaType),
    showText,
    bubbleVariant: imageOnly ? 'media' : 'text',
  };
}

function WaMediaLightbox({
  src,
  open,
  onClose,
  closeLabel,
}: {
  src: string;
  open: boolean;
  onClose: () => void;
  closeLabel: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0b141a]/96 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 z-10 flex size-10 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/10 hover:text-white"
        aria-label={closeLabel}
      >
        <X className="size-6" strokeWidth={1.75} aria-hidden />
      </button>
      <img
        src={src}
        alt=""
        className="max-h-[min(90vh,900px)] max-w-[min(95vw,1200px)] select-none object-contain"
        onClick={(e) => e.stopPropagation()}
        draggable={false}
      />
    </div>
  );
}

function useWhatsappMessageMedia(msg: ChatMsg) {
  const localUrl = msg.localMediaUrl ?? null;
  const expectsMedia = messageExpectsMedia(msg) || Boolean(localUrl);
  const fetchId =
    !localUrl && expectsMedia && msg.id && !msg.id.startsWith('opt-') ? msg.id : null;

  const [fetchedSrc, setFetchedSrc] = useState<string | null>(null);
  const [fetchState, setFetchState] = useState<'idle' | 'loading' | 'ready' | 'error'>(() =>
    fetchId ? 'loading' : 'idle',
  );

  useEffect(() => {
    if (!fetchId) return;
    let cancelled = false;
    void loadInboxMessageMediaUrl(fetchId).then((url) => {
      if (cancelled) return;
      if (url) {
        setFetchedSrc(url);
        setFetchState('ready');
      } else {
        setFetchState('error');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchId]);

  useEffect(() => {
    const id = msg.id;
    return () => {
      if (id && !id.startsWith('opt-')) {
        releaseInboxMessageMediaUrl(id);
      }
    };
  }, [msg.id]);

  const mediaSrc = localUrl ?? fetchedSrc;
  const mediaState = localUrl ? ('ready' as const) : fetchState;
  return { mediaSrc, mediaState, expectsMedia };
}

function WaMessageContent({ msg, t }: { msg: ChatMsg; t: TFunction }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { mediaSrc, mediaState, expectsMedia } = useWhatsappMessageMedia(msg);

  const layout = getWhatsappMessageLayout(msg, mediaSrc);
  const { hasMedia, isImage, isSticker, isVideo, showText } = layout;
  const src = mediaSrc ?? '';
  const showLoading =
    expectsMedia && !hasMedia && (mediaState === 'loading' || mediaState === 'idle');
  const showError = expectsMedia && !hasMedia && mediaState === 'error';

  return (
    <>
      {(isImage || isSticker) && hasMedia ? (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className={cn(
            'relative block w-full min-h-[120px] cursor-zoom-in overflow-hidden rounded-[6px] bg-[#dfe5e7] text-left dark:bg-[#3b4a54]',
            isSticker ? 'max-w-[200px] min-h-0' : 'max-w-[min(100%,330px)]',
          )}
          aria-label={t('adminCanales.whatsappImageZoom')}
        >
          <img
            src={src}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className={cn(
              'block h-auto w-full object-contain',
              isSticker ? 'max-h-48' : 'max-h-[min(420px,55vh)]',
            )}
          />
        </button>
      ) : null}
      {isVideo && hasMedia ? (
        <div className="mb-0.5 max-w-[min(100%,330px)] overflow-hidden rounded-[6px] bg-black">
          <video
            src={src}
            controls
            playsInline
            preload="metadata"
            className="block max-h-[min(360px,50vh)] w-full"
          />
        </div>
      ) : null}
      {showLoading ? (
        <p className="min-w-[200px] py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          {t('adminCanales.whatsappMediaLoading')}
        </p>
      ) : null}
      {showError ? (
        <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
          {t('adminCanales.whatsappMediaUnavailable')}
        </p>
      ) : null}
      {showText ? (
        <p
          className={cn(
            'whitespace-pre-wrap break-words',
            hasMedia && (isImage || isSticker || isVideo) && 'mt-1 px-0.5',
          )}
        >
          {msg.text}
        </p>
      ) : null}
      <WaMediaLightbox
        src={src}
        open={lightboxOpen && hasMedia && (isImage || isSticker)}
        onClose={() => setLightboxOpen(false)}
        closeLabel={t('adminCanales.whatsappImageClose')}
      />
    </>
  );
}

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
  variant = 'text',
}: {
  from: 'them' | 'us';
  children: ReactNode;
  time: string;
  variant?: 'text' | 'media';
}) {
  const us = from === 'us';
  const isMedia = variant === 'media';
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
          'relative z-[1] rounded-lg text-[14.2px] leading-snug shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
          isMedia ? 'overflow-hidden p-[3px]' : 'px-2.5 py-1.5',
          us
            ? 'rounded-br-sm bg-[#d9fdd3] text-zinc-900 dark:bg-[#005c4b] dark:text-emerald-50'
            : 'rounded-bl-sm bg-white text-zinc-900 dark:bg-[#202c33] dark:text-zinc-100',
        )}
      >
        {children}
        {isMedia ? (
          <span
            className="pointer-events-none absolute bottom-2 right-2 z-[2] rounded-md bg-black/55 px-1.5 py-0.5 text-[11px] leading-none font-medium tabular-nums text-white shadow-sm"
            aria-hidden
          >
            {time}
          </span>
        ) : (
          <p
            className={cn(
              'mt-0.5 flex items-center justify-end gap-1 text-[11px] tabular-nums text-zinc-500 dark:text-zinc-400',
              us && 'text-emerald-900/75 dark:text-emerald-100/75',
            )}
          >
            <span>{time}</span>
          </p>
        )}
      </div>
    </div>
  );
}

type InboxProps = {
  channel: AdminChannel;
  chrome: ChannelChrome;
  dataSource: InboxDataSource;
};

function ChannelWhatsAppInbox({ channel, chrome, dataSource }: InboxProps) {
  const isMock = dataSource === 'mock';
  const isBotTest = dataSource === 'bot-test';
  const isWhatsappApi = dataSource === 'whatsapp-api';
  const isInteractive = !isMock;
  const { t } = useTranslation();
  const { path } = useLocale();
  const isMd = useIsDesktopMd();
  const bottomRef = useRef<HTMLDivElement>(null);

  const mockConversations = useMemo(() => buildInboxConversations(channel, t), [channel, t]);
  const [dynamicRows, setDynamicRows] = useState<InboxConversation[]>([]);
  const [whatsappRows, setWhatsappRows] = useState<InboxConversation[]>([]);
  const [whatsappLoadState, setWhatsappLoadState] = useState<'idle' | 'loading' | 'error' | 'ok'>('idle');
  const [whatsappListError, setWhatsappListError] = useState<string | null>(null);
  const [messagesById, setMessagesById] = useState<Record<string, ChatMsg[]>>({});
  const [whatsappGate, setWhatsappGate] = useState<WhatsappGate>('loading');
  const [whatsappInstanceName, setWhatsappInstanceName] = useState('');

  const conversations = useMemo(
    () => (isWhatsappApi ? whatsappRows : [...dynamicRows, ...mockConversations]),
    [dynamicRows, isWhatsappApi, mockConversations, whatsappRows],
  );

  const [selectedId, setSelectedId] = useState(() =>
    isWhatsappApi ? '' : (mockConversations[0]?.id ?? ''),
  );
  const [mobileShowThread, setMobileShowThread] = useState(false);

  const [botThread, setBotThread] = useState<ChatMsg[]>(() => {
    if (!isBotTest) return [];
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
    setWhatsappRows([]);
    setMessagesById({});
    setWhatsappLoadState('idle');
    setWhatsappListError(null);
    setWhatsappGate('loading');
    setSelectedId(isWhatsappApi ? '' : (buildInboxConversations(channel, t)[0]?.id ?? ''));
    setMobileShowThread(false);
  }, [channel, t]);

  const refreshWhatsappLink = useCallback(async (): Promise<boolean> => {
    const res = await fetchWhatsappLinkStatus();
    if (res.ok) {
      setWhatsappInstanceName(res.data.instanceName);
      if (res.data.linked) {
        setWhatsappGate('linked');
        return true;
      }
      setWhatsappGate('not-linked');
      return false;
    }
    if (res.reason === 'no-auth') {
      setWhatsappGate('no-auth');
    } else if (res.reason === 'no-config') {
      setWhatsappGate('error');
    } else {
      setWhatsappGate('not-linked');
    }
    return false;
  }, []);

  const reloadWhatsappConversations = useCallback(async () => {
    const res = await fetchInboxConversations('whatsapp');
    if (!res.ok) {
      if (res.reason === 'no-auth') {
        setWhatsappGate('no-auth');
        return;
      }
      setWhatsappLoadState('error');
      setWhatsappListError(
        res.reason === 'no-config'
          ? t('adminCanales.botErrorNoConfig')
          : res.message?.trim() || t('adminCanales.whatsappLoadError'),
      );
      return;
    }
    setWhatsappListError(null);
    setWhatsappLoadState('ok');
    const rows = res.data.map((c) => mapConversationDto(c, t));
    setWhatsappRows(rows);
    setSelectedId((prev) => {
      if (prev && rows.some((r) => r.id === prev)) return prev;
      return rows[0]?.id ?? '';
    });
  }, [t]);

  useEffect(() => {
    if (!isWhatsappApi) return;
    let cancelled = false;
    const run = async () => {
      setWhatsappGate('loading');
      const linked = await refreshWhatsappLink();
      if (cancelled || !linked) return;
      setWhatsappLoadState('loading');
      await reloadWhatsappConversations();
    };
    void run();
    const interval = window.setInterval(() => {
      void refreshWhatsappLink().then((linked) => {
        if (linked) void reloadWhatsappConversations();
      });
    }, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isWhatsappApi, refreshWhatsappLink, reloadWhatsappConversations]);

  useEffect(() => {
    if (!isWhatsappApi || whatsappGate !== 'linked') return;
    let cancelled = false;
    const run = async () => {
      setWhatsappLoadState((s) => (s === 'ok' ? 'ok' : 'loading'));
      await reloadWhatsappConversations();
      if (cancelled) return;
    };
    void run();
    const interval = window.setInterval(() => {
      void reloadWhatsappConversations();
    }, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isWhatsappApi, whatsappGate, reloadWhatsappConversations]);

  const reloadThreadMessages = useCallback(async (conversationId: string) => {
    const res = await fetchInboxMessages(conversationId);
    if (!res.ok) return;
    setMessagesById((prev) => ({ ...prev, [conversationId]: res.data.map(mapMessageDto) }));
  }, []);

  useEffect(() => {
    if (!isWhatsappApi || !selectedId || !isRealInboxConversationId(selectedId)) return;
    let cancelled = false;
    const run = async () => {
      await reloadThreadMessages(selectedId);
      if (cancelled) return;
      await markInboxConversationRead(selectedId);
      setWhatsappRows((prev) =>
        prev.map((r) => (r.id === selectedId ? { ...r, unreadCount: 0 } : r)),
      );
    };
    void run();
    const interval = window.setInterval(() => void reloadThreadMessages(selectedId), 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isWhatsappApi, selectedId, reloadThreadMessages]);

  useEffect(() => {
    if (!isBotTest) return;
    persistBotThreadToSession(botThread);
  }, [botThread, isBotTest]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? conversations[0],
    [conversations, selectedId],
  );

  const threadMessages = useMemo(() => {
    if (isBotTest && selected?.id === 'bot') return botThread;
    if (isWhatsappApi && selectedId) return messagesById[selectedId] ?? [];
    return selected?.messages ?? [];
  }, [isBotTest, isWhatsappApi, selected?.id, selected?.messages, selectedId, botThread, messagesById]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [threadMessages, sending, selectedId]);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const sendWhatsappImage = useCallback(
    async (file: File) => {
      if (!selectedId || sending) return;
      if (!file.type.startsWith('image/')) {
        window.alert(t('adminCanales.whatsappImageTypeError'));
        return;
      }
      if (file.size > WHATSAPP_IMAGE_MAX_BYTES) {
        window.alert(t('adminCanales.whatsappImageSizeError'));
        return;
      }

      const caption = draft.trim();
      setDraft('');
      setSending(true);

      const localPreview = URL.createObjectURL(file);
      const optimisticId = `opt-${crypto.randomUUID()}`;
      const optimistic: ChatMsg = {
        id: optimisticId,
        from: 'us',
        text: caption || '[Imagen]',
        time: formatChatTime(new Date()),
        mediaType: 'image',
        hasMedia: true,
        localMediaUrl: localPreview,
      };
      setMessagesById((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), optimistic],
      }));

      try {
        const base64 = await readFileAsBase64(file);
        const res = await sendInboxImage(selectedId, {
          imageBase64: base64,
          mimetype: file.type,
          caption: caption || undefined,
        });
        if (!res.ok) {
          setMessagesById((prev) => ({
            ...prev,
            [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== optimisticId),
          }));
          if (caption) setDraft(caption);
          window.alert(
            res.reason === 'no-auth'
              ? t('adminCanales.inboxAuthRequired')
              : res.message?.trim() || t('adminCanales.whatsappSendError'),
          );
        } else {
          await reloadThreadMessages(selectedId);
          await reloadWhatsappConversations();
        }
      } catch {
        setMessagesById((prev) => ({
          ...prev,
          [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== optimisticId),
        }));
        if (caption) setDraft(caption);
        window.alert(t('adminCanales.whatsappSendError'));
      } finally {
        URL.revokeObjectURL(localPreview);
        setSending(false);
      }
    },
    [draft, sending, selectedId, reloadThreadMessages, reloadWhatsappConversations, t],
  );

  const sendWhatsapp = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending || !selectedId) return;
    setDraft('');
    setSending(true);
    const optimisticId = `opt-${crypto.randomUUID()}`;
    const optimistic: ChatMsg = {
      id: optimisticId,
      from: 'us',
      text,
      time: formatChatTime(new Date()),
    };
    setMessagesById((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), optimistic],
    }));
    const res = await sendInboxMessage(selectedId, text);
    if (!res.ok) {
      setMessagesById((prev) => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== optimisticId),
      }));
      setDraft(text);
    } else {
      await reloadThreadMessages(selectedId);
      await reloadWhatsappConversations();
    }
    setSending(false);
  }, [draft, sending, selectedId, reloadThreadMessages, reloadWhatsappConversations]);

  const sendBot = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending || !isBotTest) return;
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
  }, [draft, sending, isBotTest, botThread, channel, t]);

  const handleSend = useCallback(() => {
    if (isBotTest) void sendBot();
    else if (isWhatsappApi) void sendWhatsapp();
  }, [isBotTest, isWhatsappApi, sendBot, sendWhatsapp]);

  const openThread = (id: string) => {
    setSelectedId(id);
    if (!isMd) setMobileShowThread(true);
  };

  const startNewChat = useCallback(() => {
    if (isWhatsappApi) return;
    if (channel === 'bot-test' && isBotTest) {
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
  }, [channel, isBotTest, isMd, isWhatsappApi, t]);

  const backToList = () => setMobileShowThread(false);

  const inputPlaceholder = isBotTest
    ? t('adminCanales.botInputPlaceholder')
    : isWhatsappApi
      ? t('adminCanales.whatsappInputPlaceholder')
      : t('adminCanales.mockInputPlaceholder');
  const inputAria = isBotTest
    ? t('adminCanales.botInputAria')
    : isWhatsappApi
      ? t('adminCanales.whatsappInputAria')
      : t('adminCanales.mockInputAria');
  const sendAria = isBotTest
    ? t('adminCanales.botSend')
    : isWhatsappApi
      ? t('adminCanales.whatsappSend')
      : t('adminCanales.botSend');

  const showListPane = isMd || !mobileShowThread;
  const showThreadPane = isMd || mobileShowThread;

  if (isWhatsappApi && whatsappGate !== 'linked') {
    return <WhatsappInboxEmpty gate={whatsappGate} />;
  }

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
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              {isWhatsappApi
                ? t('adminCanales.inboxYourAccountWhatsapp', {
                    instance: whatsappInstanceName.trim() || '…',
                  })
                : t('adminCanales.inboxYourAccount')}
            </p>
          </div>
          {!isWhatsappApi ? (
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
          ) : null}
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
          {isWhatsappApi && whatsappLoadState === 'loading' && conversations.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">{t('adminCanales.whatsappLoadingChats')}</p>
          ) : null}
          {isWhatsappApi && whatsappLoadState === 'error' ? (
            <p className="px-4 py-8 text-center text-sm text-red-600 dark:text-red-400">
              {whatsappListError ?? t('adminCanales.whatsappLoadError')}
            </p>
          ) : null}
          {isWhatsappApi && whatsappLoadState === 'ok' && conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">
              <p>{t('adminCanales.whatsappEmptyChats')}</p>
              <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                {t('adminCanales.whatsappEmptyChatsWebhookHint')}
              </p>
              <Button asChild variant="link" className="mt-2 h-auto p-0 text-[#128c7e]">
                <Link href={path('/app/admin/settings#whatsapp')}>{t('adminCanales.whatsappGoToSettings')}</Link>
              </Button>
            </div>
          ) : null}
          {conversations.map((c) => {
            const active = c.id === selectedId;
            const rowPreview =
              isBotTest && c.id === 'bot'
                ? lastPreview(threadMessages) || '—'
                : isWhatsappApi
                  ? c.lastPreview || '—'
                  : lastPreview(c.messages) || '—';
            const rowTime =
              isBotTest && c.id === 'bot'
                ? threadMessages[threadMessages.length - 1]?.time ?? c.timeLabel
                : isWhatsappApi
                  ? c.timeLabel
                  : c.messages[c.messages.length - 1]?.time ?? c.timeLabel;
            const unread = (c.unreadCount ?? 0) > 0;
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
                    <span
                      className={cn(
                        'shrink-0 text-[11px] tabular-nums',
                        unread
                          ? 'font-semibold text-[#25d366]'
                          : 'text-emerald-700 dark:text-emerald-400/90',
                      )}
                    >
                      {rowTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-[13px] text-zinc-500 dark:text-zinc-400">{rowPreview}</p>
                    {unread ? (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-[11px] font-semibold text-white">
                        {c.unreadCount! > 9 ? '9+' : c.unreadCount}
                      </span>
                    ) : null}
                  </div>
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
            {threadMessages.length === 0 && isMock ? (
              <p className="py-8 text-center text-sm text-zinc-500">{t('adminCanales.inboxTapChat')}</p>
            ) : threadMessages.length === 0 && isWhatsappApi && selectedId ? (
              <p className="py-8 text-center text-sm text-zinc-500">{t('adminCanales.whatsappLoadingChats')}</p>
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
                    <WaMessageBubble
                      from={m.from}
                      time={m.time}
                      variant={isWhatsappApi ? getBubbleVariantForList(m) : 'text'}
                    >
                      {isWhatsappApi ? (
                        <WaMessageContent key={m.id} msg={m} t={t} />
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      )}
                    </WaMessageBubble>
                  </div>
                ))}
                {sending && isBotTest ? (
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
                  handleSend();
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
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (file && isWhatsappApi) void sendWhatsappImage(file);
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 rounded-full text-zinc-500 hover:bg-zinc-200/90 dark:text-zinc-400 dark:hover:bg-zinc-600/60"
                  title={t('adminCanales.inboxAttach')}
                  disabled={sending || !selectedId || !isRealInboxConversationId(selectedId)}
                  onClick={() => imageInputRef.current?.click()}
                >
                  <Paperclip className="size-[22px]" strokeWidth={1.5} />
                </Button>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={inputPlaceholder}
                  className="min-h-11 flex-1 rounded-lg border-0 bg-white px-3 py-2.5 text-[15px] shadow-sm ring-1 ring-black/[0.06] dark:bg-[#2a3942] dark:text-zinc-100 dark:ring-white/10"
                  aria-label={inputAria}
                  disabled={
                    sending ||
                    (isWhatsappApi && (!selectedId || !isRealInboxConversationId(selectedId)))
                  }
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
                  disabled={sending || !draft.trim() || (isWhatsappApi && !selectedId)}
                  aria-label={sendAria}
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
        <ChannelWhatsAppInbox
          channel={ch}
          chrome={chrome}
          dataSource={ch === 'bot-test' ? 'bot-test' : ch === 'whatsapp' ? 'whatsapp-api' : 'mock'}
        />
      </div>
    </AppShell>
  );
}
