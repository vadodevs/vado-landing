import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Bot,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ClipboardCopy,
  Clock,
  Facebook,
  Instagram,
  MessageSquarePlus,
  Mic,
  MoreVertical,
  Users,
  Paperclip,
  Plus,
  Search,
  Send,
  Smile,
  Sparkles,
  X,
} from 'lucide-react';
import { Link, Redirect } from 'wouter';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { WhatsAppGlyph } from '@/components/admin/AdminChannelIcons';
import {
  WhatsappInboxLinkGate,
  type WhatsappGate,
} from '@/components/admin/WhatsappInboxLinkGate';
import { InboxAccountAvatar } from '@/components/admin/InboxAccountAvatar';
import { InboxAutopilotStatusLine } from '@/components/admin/InboxAutopilotIndicator';
import { InboxComposePicker } from '@/components/admin/InboxComposePicker';
import { InboxContactAvatar } from '@/components/admin/InboxContactAvatar';
import { InboxGroupInfoSheet } from '@/components/admin/InboxGroupInfoSheet';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import {
  postInboxLeadAssistantChat,
  type AssistantChatMessage,
  type InboxLeadChannel,
} from '@/lib/appAssistantChat';
import {
  formatInboxContactName,
  formatInboxMessagePreview,
  isTechnicalInboxLabel,
} from '@/lib/inboxDisplay';
import {
  fetchInboxConversations,
  fetchInboxMessages,
  fetchWhatsappHistoryImportStatus,
  importWhatsappHistoryAfterLink,
  syncWhatsappChats,
  type InboxDeliveryStatus,
  fetchWhatsappLinkStatus,
  markInboxConversationRead,
  sendInboxImage,
  sendInboxMessage,
  sendInboxSticker,
  type InboxConversationDto,
  type InboxMessageDto,
} from '@/lib/adminInboxApi';
import {
  loadInboxMessageMediaUrl,
  readFileAsBase64,
  releaseAllInboxMessageMediaUrls,
} from '@/lib/inboxMessageMedia';
import {
  notifyInboxAccountAvatarChanged,
  releaseInboxAccountAvatarUrl,
} from '@/lib/inboxAccountAvatar';
import {
  releaseAllInboxContactAvatarUrls,
} from '@/lib/inboxContactAvatar';
import { isInboxAiAutoReplyActiveNow } from '@/lib/inboxAiAutoReply';
import { flushInboxAiSettingsSync } from '@/lib/inboxAiSettingsSync';
import { triggerInboxAutoReply } from '@/lib/inboxAiSettingsApi';
import { loadInboxAutopilotConfig } from '@/lib/inboxAutopilotConfig';
import { loadInboxBotConfig } from '@/lib/inboxBotConfig';
import { loadInboxLlmConfig } from '@/lib/inboxLlmConfig';
import {
  applyInboxReadState,
  markInboxConversationReadLocal,
} from '@/lib/inboxReadState';
import {
  clearWhatsappInboxSession,
  saveWhatsappInboxSession,
} from '@/lib/inboxWhatsappSessionCache';
import {
  notifyWhatsappLinkChanged,
  purgeWhatsappInboxLocalState,
  shouldKickoffWhatsappHistoryImport,
  WHATSAPP_LINK_CHANGE_EVENT,
  type WhatsappLinkChangeDetail,
} from '@/lib/inboxWhatsappLink';
import {
  shouldRunWhatsappEvolutionSync,
  WHATSAPP_PHONE_POLL_MS,
} from '@/lib/inboxWhatsappSync';

const INBOX_TIME_ZONE = 'America/Mexico_City';
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
  /** Solo salientes (nosotros): reloj / ✓ / ✓✓ / ✓✓ azul. */
  deliveryStatus?: InboxDeliveryStatus | null;
  /** Grupos: quién envió el mensaje entrante */
  senderName?: string | null;
};

const WHATSAPP_IMAGE_MAX_BYTES = 8 * 1024 * 1024;

const INBOX_CONVERSATION_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRealInboxConversationId(id: string): boolean {
  return INBOX_CONVERSATION_UUID_RE.test(id);
}

const MEDIA_PREVIEW_LABELS = /^\[(imagen|video|audio|documento|sticker)\]$/i;

function isAudioMediaType(mediaType: string | null | undefined): boolean {
  if (!mediaType) return false;
  const kind = mediaType.toLowerCase();
  return kind === 'audio' || kind === 'ptt' || kind === 'voice' || kind === 'ptv';
}

function isAudioMessage(msg: ChatMsg): boolean {
  if (isAudioMediaType(msg.mediaType)) return true;
  return /^\[audio\]$/i.test(msg.text.trim());
}

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
  lastMessageAtMs?: number;
  messages: ChatMsg[];
  lastPreview?: string;
  unreadCount?: number;
  externalId?: string;
  contactPhone?: string | null;
  hasProfilePicture?: boolean;
  isGroup?: boolean;
  groupMemberCount?: number | null;
};

type InboxDataSource = 'mock' | 'bot-test' | 'whatsapp-api';

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

function inboxDateKey(d: Date): string {
  return d.toLocaleDateString('en-CA', { timeZone: INBOX_TIME_ZONE });
}

function formatInboxTimeLabel(iso: string, t: TFunction): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  if (inboxDateKey(d) === inboxDateKey(now)) {
    return formatChatTime(d);
  }
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (inboxDateKey(d) === inboxDateKey(yesterday)) {
    return t('adminCanales.whatsappYesterday');
  }
  return d.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    timeZone: INBOX_TIME_ZONE,
  });
}

function mapConversationDto(c: InboxConversationDto, t: TFunction): InboxConversation | null {
  const name = formatInboxContactName(c.contactName, c.externalId, t);
  if (isTechnicalInboxLabel(name)) return null;
  const preview = formatInboxMessagePreview(c.lastMessagePreview, t);
  const isGroup = c.isGroup ?? c.externalId.startsWith('g:');
  const lastMs = new Date(c.lastMessageAt).getTime();
  return {
    id: c.id,
    name,
    initials: initialsForContact(name, c.externalId),
    timeLabel: formatInboxTimeLabel(c.lastMessageAt, t),
    lastMessageAtMs: Number.isNaN(lastMs) ? 0 : lastMs,
    messages: [],
    lastPreview: preview,
    unreadCount: c.unreadCount,
    externalId: c.externalId,
    contactPhone: c.contactPhone ?? null,
    hasProfilePicture: c.hasProfilePicture ?? false,
    isGroup,
    groupMemberCount:
      typeof c.groupMemberCount === 'number' ? c.groupMemberCount : null,
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
    deliveryStatus:
      m.direction === 'outbound' ? (m.deliveryStatus ?? 'sent') : undefined,
    senderName: m.senderName ?? null,
  };
}

const GROUP_SENDER_COLORS = [
  'text-teal-400',
  'text-amber-400',
  'text-sky-400',
  'text-rose-400',
  'text-violet-400',
  'text-lime-400',
  'text-orange-400',
  'text-cyan-400',
] as const;

function groupSenderColorClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  return GROUP_SENDER_COLORS[Math.abs(hash) % GROUP_SENDER_COLORS.length]!;
}

function WaDeliveryTicks({
  status,
  title,
}: {
  status: InboxDeliveryStatus | null | undefined;
  title: string;
}) {
  const s = status ?? 'sent';
  const className = 'size-[15px] shrink-0 stroke-[2.25]';
  const wrap = (icon: ReactNode) => (
    <span className="inline-flex" title={title} aria-label={title}>
      {icon}
    </span>
  );
  if (s === 'pending') {
    return wrap(<Clock className={cn(className, 'opacity-70')} aria-hidden />);
  }
  if (s === 'error') {
    return wrap(<Clock className={cn(className, 'text-red-500')} aria-hidden />);
  }
  if (s === 'delivered') {
    return wrap(<CheckCheck className={cn(className, 'opacity-75')} aria-hidden />);
  }
  if (s === 'read' || s === 'played') {
    return wrap(
      <CheckCheck className={cn(className, 'text-sky-300')} aria-hidden />,
    );
  }
  return wrap(<Check className={cn(className, 'opacity-75')} aria-hidden />);
}

function deliveryStatusAriaLabel(status: InboxDeliveryStatus | null | undefined, t: TFunction): string {
  switch (status ?? 'sent') {
    case 'pending':
      return t('adminCanales.whatsappStatusPending');
    case 'delivered':
      return t('adminCanales.whatsappStatusDelivered');
    case 'read':
      return t('adminCanales.whatsappStatusRead');
    case 'played':
      return t('adminCanales.whatsappStatusPlayed');
    case 'error':
      return t('adminCanales.whatsappDeliveryFailed');
    default:
      return t('adminCanales.whatsappStatusSent');
  }
}

function messageExpectsMedia(msg: ChatMsg): boolean {
  if (isAudioMessage(msg)) return true;
  return Boolean(msg.mediaType) && (msg.hasMedia ?? false);
}

function normalizeThreadSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

function messageMatchesThreadSearch(msg: ChatMsg, query: string): boolean {
  const q = normalizeThreadSearchQuery(query);
  if (!q) return false;
  if (msg.text.toLowerCase().includes(q)) return true;
  return Boolean(msg.senderName?.toLowerCase().includes(q));
}

function HighlightedMessageText({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  const lower = text.toLowerCase();
  const qLower = q.toLowerCase();
  const parts: ReactNode[] = [];
  let start = 0;
  let idx = lower.indexOf(qLower);

  while (idx !== -1) {
    if (idx > start) parts.push(text.slice(start, idx));
    parts.push(
      <mark
        key={`${idx}-${q.length}`}
        className="rounded-sm bg-teal-400/45 text-inherit dark:bg-teal-500/55"
      >
        {text.slice(idx, idx + q.length)}
      </mark>,
    );
    start = idx + q.length;
    idx = lower.indexOf(qLower, start);
  }

  if (start < text.length) parts.push(text.slice(start));
  return <>{parts}</>;
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
  isAudio: boolean;
  isMediaMessage: boolean;
  showText: boolean;
  bubbleVariant: 'text' | 'media';
};

function getWhatsappMessageLayout(msg: ChatMsg, mediaSrc: string | null): WhatsappMessageLayout {
  const isImage = msg.mediaType === 'image';
  const isSticker = msg.mediaType === 'sticker';
  const isVideo = msg.mediaType === 'video';
  const isAudio = isAudioMessage(msg);
  const hasMedia = Boolean(mediaSrc);
  const showText =
    msg.text.trim().length > 0 && !MEDIA_PREVIEW_LABELS.test(msg.text.trim());
  const imageOnly = (isImage || isSticker) && hasMedia && !showText;
  return {
    hasMedia,
    isImage,
    isSticker,
    isVideo,
    isAudio,
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

  if (!open || !src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0b141a]/96 p-4 sm:p-8"
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
    </div>,
    document.body,
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
    let attempt = 0;

    const run = async () => {
      setFetchState('loading');
      const url = await loadInboxMessageMediaUrl(fetchId);
      if (cancelled) return;
      if (url) {
        setFetchedSrc(url);
        setFetchState('ready');
        return;
      }
      attempt += 1;
      if (attempt < 4) {
        window.setTimeout(() => void run(), 1200 * attempt);
        return;
      }
      setFetchState('error');
    };

    void run();
    const failTimer = window.setTimeout(() => {
      if (!cancelled) setFetchState('error');
    }, 12_000);
    return () => {
      cancelled = true;
      window.clearTimeout(failTimer);
    };
  }, [fetchId]);

  const mediaSrc = localUrl ?? fetchedSrc;
  const mediaState = localUrl ? ('ready' as const) : fetchState;
  return { mediaSrc, mediaState, expectsMedia };
}

function WaMessageContent({
  msg,
  t,
  messenger = false,
  searchQuery = '',
}: {
  msg: ChatMsg;
  t: TFunction;
  messenger?: boolean;
  searchQuery?: string;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const { mediaSrc, mediaState, expectsMedia } = useWhatsappMessageMedia(msg);

  const layout = getWhatsappMessageLayout(msg, mediaSrc);
  const { hasMedia, isImage, isSticker, isVideo, isAudio, showText } = layout;
  const src = mediaSrc ?? '';
  const showLoading =
    expectsMedia && !hasMedia && (mediaState === 'loading' || mediaState === 'idle');
  const showError = expectsMedia && !hasMedia && mediaState === 'error';

  const openLightbox = () => {
    if (!src) return;
    setLightboxSrc(src);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxSrc(null);
  };

  return (
    <>
      {(isImage || isSticker) && hasMedia ? (
        <button
          type="button"
          onClick={openLightbox}
          className={cn(
            messenger
              ? 'relative block w-fit max-w-[min(85vw,360px)] cursor-zoom-in overflow-hidden rounded-xl bg-zinc-900/80 text-left shadow-xl ring-1 ring-white/10'
              : 'relative block w-fit max-w-[min(85vw,330px)] cursor-zoom-in overflow-hidden rounded-[6px] bg-[#dfe5e7] text-left shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ring-1 ring-black/[0.06] dark:bg-[#3b4a54] dark:ring-white/[0.08]',
            isSticker && 'max-w-[200px]',
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
              'block h-auto max-w-[min(85vw,330px)] object-contain',
              isSticker ? 'max-h-48' : 'max-h-[min(360px,50vh)]',
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
      {isAudio && (hasMedia || showLoading || showError) ? (
        <div
          className={cn(
            'flex min-w-[min(100%,260px)] max-w-[min(85vw,320px)] items-center gap-2.5',
            messenger ? 'py-0.5' : 'py-1',
            showText && 'mb-1',
          )}
        >
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full',
              messenger
                ? 'bg-white/10 text-teal-200'
                : 'bg-teal-600/15 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
            )}
            aria-hidden
          >
            <Mic className="size-4" strokeWidth={2} />
          </span>
          {hasMedia ? (
            <audio
              src={src}
              controls
              preload="metadata"
              className={cn(
                'h-9 min-w-0 flex-1',
                messenger && '[color-scheme:dark]',
              )}
              aria-label={t('adminCanales.whatsappAudioLabel')}
            />
          ) : showLoading ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t('adminCanales.whatsappAudioLoading')}
            </p>
          ) : (
            <p className="text-xs italic text-zinc-500 dark:text-zinc-400">
              {t('adminCanales.whatsappAudioUnavailable')}
            </p>
          )}
        </div>
      ) : null}
      {showLoading && !isAudio ? (
        <p
          className={cn(
            'text-center text-sm text-zinc-500 dark:text-zinc-400',
            messenger ? 'py-2 text-xs' : 'min-w-[200px] py-8',
          )}
        >
          {t('adminCanales.whatsappMediaLoading')}
        </p>
      ) : null}
      {showError && !isAudio ? (
        <p className="text-sm italic text-zinc-500 dark:text-zinc-400">
          {t('adminCanales.whatsappMediaUnavailable')}
        </p>
      ) : null}
      {showText ? (
        <p
          className={cn(
            'whitespace-pre-wrap [overflow-wrap:break-word]',
            messenger && 'text-left',
            hasMedia && (isImage || isSticker || isVideo || isAudio) && 'mt-1 px-0.5',
          )}
        >
          <HighlightedMessageText text={msg.text} query={searchQuery} />
        </p>
      ) : null}
      <WaMediaLightbox
        src={lightboxSrc ?? src}
        open={lightboxOpen && Boolean(lightboxSrc ?? src)}
        onClose={closeLightbox}
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
  return d.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: INBOX_TIME_ZONE,
  });
}

function threadToAssistantMessages(thread: ChatMsg[]): AssistantChatMessage[] {
  return thread.map((m) => ({
    role: m.from === 'us' ? 'user' : 'assistant',
    content: m.text,
  }));
}

function buildInboxThreadAiContextMarkdown(
  conv: InboxConversation | undefined,
  messages: ChatMsg[],
  channel: AdminChannel,
): string {
  const lines: string[] = ['# Contexto IA — conversación inbox', ''];
  if (conv) {
    lines.push(`- **Contacto:** ${conv.name}`);
    if (conv.contactPhone) lines.push(`- **Teléfono:** ${conv.contactPhone}`);
    if (conv.isGroup) lines.push('- **Tipo:** Grupo de WhatsApp');
    if (conv.externalId) lines.push(`- **ID externo:** ${conv.externalId}`);
  }
  lines.push(`- **Canal:** ${channel}`);
  lines.push('');
  lines.push('## Mensajes recientes');
  const recent = messages.slice(-50);
  if (recent.length === 0) {
    lines.push('_Sin mensajes en este hilo._');
  } else {
    for (const m of recent) {
      const who = m.from === 'us' ? 'Nosotros' : 'Contacto';
      const body =
        m.text.trim() ||
        (m.hasMedia || m.mediaType ? `[${m.mediaType ?? 'archivo'}]` : '—');
      lines.push(`- **${who}** (${m.time}): ${body.replace(/\n/g, ' ')}`);
    }
  }
  return lines.join('\n');
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

/** Fondo del hilo: patrón WA clásico o gradiente oscuro estilo messenger. */
function WaThreadBackdrop({ messenger }: { messenger?: boolean }) {
  if (messenger) {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0a0c0e] via-[#0d1114] to-[#0a0c0e]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20,184,166,0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(20,184,166,0.08), transparent)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23fff'/%3E%3C/svg%3E")`,
            backgroundSize: '32px 32px',
          }}
          aria-hidden
        />
      </>
    );
  }
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
  deliveryStatus,
  showDeliveryTicks = false,
  deliveryStatusLabel,
  messenger = false,
}: {
  from: 'them' | 'us';
  children: ReactNode;
  time: string;
  variant?: 'text' | 'media';
  deliveryStatus?: InboxDeliveryStatus | null;
  showDeliveryTicks?: boolean;
  deliveryStatusLabel?: string;
  messenger?: boolean;
}) {
  const us = from === 'us';
  const isMedia = variant === 'media';
  const tickTitle = deliveryStatusLabel ?? '';
  const textBubbleWidth = messenger
    ? 'w-fit max-w-[min(85vw,420px)]'
    : 'w-fit max-w-[min(85vw,480px)]';

  return (
    <div
      className={cn(
        'relative',
        isMedia ? 'w-fit max-w-[min(85vw,360px)]' : textBubbleWidth,
        messenger && (us ? 'ml-0' : 'mr-0'),
        !messenger && us ? 'ml-4 md:ml-10' : '',
      )}
    >
      {!messenger && !isMedia && !us ? (
        <div
          className="absolute bottom-[9px] left-[-6px] z-0 h-0 w-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-white dark:border-r-[#202c33]"
          aria-hidden
        />
      ) : null}
      {!messenger && !isMedia && us ? (
        <div
          className="absolute bottom-[9px] right-[-6px] z-0 h-0 w-0 border-y-[6px] border-y-transparent border-l-[7px] border-l-[#d9fdd3] dark:border-l-[#005c4b]"
          aria-hidden
        />
      ) : null}
      <div
        className={cn(
          'relative z-[1] text-[14.5px] leading-relaxed',
          isMedia
            ? 'overflow-visible bg-transparent p-0 shadow-none ring-0'
            : cn(
                'w-fit max-w-full overflow-hidden px-3.5 py-2.5',
                messenger
                  ? 'shadow-lg backdrop-blur-md ring-1'
                  : 'rounded-lg px-2.5 py-1.5 shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]',
              ),
          !isMedia &&
            (messenger
              ? us
                ? 'rounded-xl rounded-tr-sm bg-gradient-to-br from-teal-600 to-teal-700 text-white ring-teal-500/20 shadow-teal-900/20'
                : 'rounded-xl rounded-tl-sm bg-zinc-800/90 text-zinc-100 ring-white/[0.06] shadow-black/30'
              : us
                ? 'rounded-br-sm bg-[#d9fdd3] text-zinc-900 dark:bg-[#005c4b] dark:text-emerald-50'
                : 'rounded-bl-sm bg-white text-zinc-900 dark:bg-[#202c33] dark:text-zinc-100'),
        )}
      >
        {children}
        {isMedia ? (
          <span
            className="pointer-events-none absolute bottom-1.5 right-1.5 z-[2] flex items-center gap-0.5 rounded-md bg-black/50 px-1.5 py-0.5 text-[11px] leading-none font-medium tabular-nums text-white backdrop-blur-sm"
            aria-hidden
          >
            <span>{time}</span>
            {showDeliveryTicks && us ? (
              <WaDeliveryTicks status={deliveryStatus} title={tickTitle} />
            ) : null}
          </span>
        ) : messenger ? (
          <span
            className={cn(
              'float-right ml-2 mt-0.5 inline-flex shrink-0 items-center gap-0.5 text-[11px] leading-none tabular-nums',
              us ? 'text-teal-100/80' : 'text-zinc-500',
            )}
          >
            <span>{time}</span>
            {showDeliveryTicks && us ? (
              <WaDeliveryTicks status={deliveryStatus} title={tickTitle} />
            ) : null}
          </span>
        ) : (
          <p
            className={cn(
              'mt-1 flex items-center justify-end gap-1 text-[11px] tabular-nums',
              'text-zinc-500 dark:text-zinc-400',
              us && 'text-emerald-900/75 dark:text-emerald-100/75',
            )}
          >
            <span>{time}</span>
            {showDeliveryTicks && us ? (
              <WaDeliveryTicks status={deliveryStatus} title={tickTitle} />
            ) : null}
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
  const hadSessionCacheRef = useRef(false);
  const isInteractive = !isMock;
  const { t } = useTranslation();
  const { path } = useLocale();
  const isMd = useIsDesktopMd();
  const threadScrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const threadTailIdRef = useRef<string | null>(null);
  const forceThreadScrollRef = useRef(false);
  const composeInputRef = useRef<HTMLInputElement>(null);
  const threadSearchInputRef = useRef<HTMLInputElement>(null);
  const threadMessageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [threadSearchOpen, setThreadSearchOpen] = useState(false);
  const [threadSearchQuery, setThreadSearchQuery] = useState('');
  const [threadSearchMatchIndex, setThreadSearchMatchIndex] = useState(0);
  const [aiContextOpen, setAiContextOpen] = useState(false);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [aiContextCopied, setAiContextCopied] = useState(false);
  const [listSearchQuery, setListSearchQuery] = useState('');

  const scrollThreadToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const el = threadScrollRef.current;
    if (!el) return;
    const top = el.scrollHeight;
    if (behavior === 'auto') {
      el.scrollTop = top;
      return;
    }
    el.scrollTo({ top, behavior });
  }, []);

  /** Tras pintar mensajes o cargar media, el alto del hilo cambia; reintenta ir al final. */
  const scrollThreadToBottomAfterLayout = useCallback(
    (behavior: ScrollBehavior = 'auto') => {
      scrollThreadToBottom(behavior);
      requestAnimationFrame(() => {
        scrollThreadToBottom('auto');
        requestAnimationFrame(() => scrollThreadToBottom('auto'));
      });
      window.setTimeout(() => scrollThreadToBottom('auto'), 80);
      window.setTimeout(() => scrollThreadToBottom('auto'), 240);
    },
    [scrollThreadToBottom],
  );

  const handleThreadScroll = useCallback(() => {
    const el = threadScrollRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottomRef.current = gap < 100;
  }, []);

  const mockConversations = useMemo(() => buildInboxConversations(channel, t), [channel, t]);
  const [dynamicRows, setDynamicRows] = useState<InboxConversation[]>([]);
  const [whatsappRows, setWhatsappRows] = useState<InboxConversation[]>([]);
  const [whatsappLoadState, setWhatsappLoadState] = useState<
    'idle' | 'loading' | 'error' | 'ok'
  >('idle');
  const [whatsappHistoryImporting, setWhatsappHistoryImporting] = useState(false);
  const [whatsappListError, setWhatsappListError] = useState<string | null>(null);
  const [messagesById, setMessagesById] = useState<Record<string, ChatMsg[]>>({});
  const [whatsappGate, setWhatsappGate] = useState<WhatsappGate>('loading');
  const [whatsappOwnerJid, setWhatsappOwnerJid] = useState('');

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

  const whatsappBootSyncDoneRef = useRef(false);
  const lastEvolutionSyncAtRef = useRef(0);
  const autoReplyInFlightRef = useRef<Set<string>>(new Set());
  const lastAutoRepliedInboundRef = useRef<Record<string, string>>({});
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const whatsappGateRef = useRef(whatsappGate);
  whatsappGateRef.current = whatsappGate;
  const whatsappOwnerJidRef = useRef(whatsappOwnerJid);
  whatsappOwnerJidRef.current = whatsappOwnerJid;
  const prevLinkedRef = useRef<boolean | null>(null);
  const inboxBootDoneRef = useRef(false);
  const inboxPollInFlightRef = useRef(false);
  /** Incrementa al desvincular; invalida respuestas de inbox en vuelo. */
  const inboxLinkEpochRef = useRef(0);
  const inboxAiSettingsSyncedRef = useRef(false);
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
    whatsappBootSyncDoneRef.current = false;
    setWhatsappGate('loading');
    setSelectedId(isWhatsappApi ? '' : (buildInboxConversations(channel, t)[0]?.id ?? ''));
    setMobileShowThread(false);
    releaseAllInboxContactAvatarUrls();
    releaseInboxAccountAvatarUrl();
    setWhatsappOwnerJid('');
    setListSearchQuery('');
    if (prevChannelRef.current === 'whatsapp' && channel !== 'whatsapp') {
      clearWhatsappInboxSession();
    }
  }, [channel, t, isWhatsappApi]);

  const displayedConversations = useMemo(() => {
    const sorted = [...conversations].sort(
      (a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0),
    );
    const q = listSearchQuery.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((c) => {
      const hay = [c.name, c.lastPreview ?? '', c.contactPhone ?? ''].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [conversations, listSearchQuery]);

  const purgeWhatsappInboxUiState = useCallback((ownerJid = '') => {
    inboxLinkEpochRef.current += 1;
    purgeWhatsappInboxLocalState(ownerJid);
    setWhatsappRows([]);
    setMessagesById({});
    setSelectedId('');
    setWhatsappLoadState('idle');
    setWhatsappListError(null);
    setWhatsappOwnerJid('');
    whatsappBootSyncDoneRef.current = false;
    lastEvolutionSyncAtRef.current = 0;
    hadSessionCacheRef.current = false;
  }, []);

  const applyWhatsappLinkGateFromStatus = useCallback(
    (linked: boolean, state: string, ownerJid?: string | null): WhatsappGate => {
      if (linked) {
        return 'linked';
      }
      if (state === 'connecting') {
        setWhatsappRows([]);
        setMessagesById({});
        setSelectedId('');
        setWhatsappOwnerJid('');
        setWhatsappLoadState('idle');
        setWhatsappListError(null);
        return 'connecting';
      }
      purgeWhatsappInboxUiState(ownerJid?.trim() ?? '');
      return 'not-linked';
    },
    [purgeWhatsappInboxUiState],
  );

  const refreshWhatsappLink = useCallback(async (): Promise<WhatsappGate> => {
    const res = await fetchWhatsappLinkStatus();
    if (res.ok) {
      if (res.data.linked) {
        const nextOwner = res.data.ownerJid?.trim() || '';
        setWhatsappOwnerJid((prev) => {
          if (prev !== nextOwner) {
            notifyInboxAccountAvatarChanged(nextOwner);
            if (prev && nextOwner && prev !== nextOwner) {
              purgeWhatsappInboxUiState(prev);
            }
          }
          return nextOwner;
        });
        setWhatsappGate('linked');
        if (prevLinkedRef.current !== true) {
          prevLinkedRef.current = true;
          notifyWhatsappLinkChanged({ linked: true, ownerJid: nextOwner });
        }
        return 'linked';
      }
      const nextGate = applyWhatsappLinkGateFromStatus(
        false,
        res.data.state,
        res.data.ownerJid,
      );
      setWhatsappGate(nextGate);
      if (prevLinkedRef.current !== false) {
        prevLinkedRef.current = false;
        notifyWhatsappLinkChanged({ linked: false });
      }
      return nextGate;
    }
    purgeWhatsappInboxUiState(whatsappOwnerJidRef.current);
    if (res.reason === 'no-auth') {
      setWhatsappGate('no-auth');
      return 'no-auth';
    }
    if (res.reason === 'no-config') {
      setWhatsappGate('error');
      return 'error';
    }
    setWhatsappGate('not-linked');
    if (prevLinkedRef.current !== false) {
      prevLinkedRef.current = false;
      notifyWhatsappLinkChanged({ linked: false });
    }
    return 'not-linked';
  }, [purgeWhatsappInboxUiState, applyWhatsappLinkGateFromStatus]);

  const refreshWhatsappLinkRef = useRef(refreshWhatsappLink);
  refreshWhatsappLinkRef.current = refreshWhatsappLink;

  const reloadWhatsappConversations = useCallback(async (opts?: {
    sync?: boolean;
    activeConversationId?: string;
  }) => {
    if (whatsappGateRef.current !== 'linked') {
      return false;
    }

    const requestEpoch = inboxLinkEpochRef.current;
    const res = await fetchInboxConversations('whatsapp', {
      sync: opts?.sync,
      activeConversationId: opts?.activeConversationId ?? selectedId,
    });
    if (
      requestEpoch !== inboxLinkEpochRef.current ||
      whatsappGateRef.current !== 'linked'
    ) {
      return false;
    }
    if (!res.ok) {
      if (res.reason === 'no-auth') {
        setWhatsappGate('no-auth');
        return false;
      }
      setWhatsappLoadState('error');
      setWhatsappListError(
        res.reason === 'no-config'
          ? t('adminCanales.botErrorNoConfig')
          : res.message?.trim() || t('adminCanales.whatsappLoadError'),
      );
      return false;
    }
    setWhatsappListError(null);
    setWhatsappLoadState('ok');
    const rows = res.data
      .map((c) => mapConversationDto(c, t))
      .filter((c): c is InboxConversation => c != null)
      .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0));
    const owner = whatsappOwnerJid.trim();
    let merged = owner ? applyInboxReadState(owner, rows) : rows;
    if (selectedId) {
      merged = merged.map((r) =>
        r.id === selectedId ? { ...r, unreadCount: 0 } : r,
      );
    }
    setWhatsappRows(merged);
    setSelectedId((prev) => {
      if (prev && rows.some((r) => r.id === prev)) return prev;
      return rows[0]?.id ?? '';
    });
    return true;
  }, [t, whatsappOwnerJid, selectedId]);

  const reloadWhatsappConversationsRef = useRef(reloadWhatsappConversations);
  reloadWhatsappConversationsRef.current = reloadWhatsappConversations;

  const kickoffWhatsappHistoryImport = useCallback(async (ownerJid: string) => {
    if (!shouldKickoffWhatsappHistoryImport(ownerJid)) {
      setWhatsappHistoryImporting(true);
      return true;
    }
    const res = await importWhatsappHistoryAfterLink();
    lastEvolutionSyncAtRef.current = Date.now();
    whatsappBootSyncDoneRef.current = true;
    if (!res.ok) {
      setWhatsappListError(
        res.reason === 'no-config'
          ? t('adminCanales.botErrorNoConfig')
          : res.message?.trim() || t('adminCanales.whatsappLoadError'),
      );
      return false;
    }
    setWhatsappHistoryImporting(true);
    return true;
  }, [t]);

  const syncWhatsappInboxData = useCallback(
    async (opts?: {
      fullImport?: boolean;
      showListLoading?: boolean;
      activeConversationId?: string;
      importHistory?: boolean;
    }) => {
      if (opts?.showListLoading && !opts?.importHistory) {
        setWhatsappLoadState('loading');
      }

      if (opts?.importHistory) {
        await syncWhatsappChats();
        lastEvolutionSyncAtRef.current = Date.now();
        whatsappBootSyncDoneRef.current = true;
        await kickoffWhatsappHistoryImport(whatsappOwnerJidRef.current);
      } else if (
        opts?.fullImport &&
        shouldRunWhatsappEvolutionSync(lastEvolutionSyncAtRef.current, { force: true })
      ) {
        await syncWhatsappChats();
        lastEvolutionSyncAtRef.current = Date.now();
        whatsappBootSyncDoneRef.current = true;
      }

      return reloadWhatsappConversations({
        sync: true,
        activeConversationId: opts?.activeConversationId ?? selectedIdRef.current,
      });
    },
    [kickoffWhatsappHistoryImport, reloadWhatsappConversations],
  );

  const syncWhatsappInboxDataRef = useRef(syncWhatsappInboxData);
  syncWhatsappInboxDataRef.current = syncWhatsappInboxData;

  useEffect(() => {
    if (!isWhatsappApi || whatsappGate !== 'linked') {
      inboxAiSettingsSyncedRef.current = false;
      return;
    }
    if (inboxAiSettingsSyncedRef.current) return;
    inboxAiSettingsSyncedRef.current = true;
    flushInboxAiSettingsSync({
      autopilot: loadInboxAutopilotConfig(),
      bot: loadInboxBotConfig(),
      llm: loadInboxLlmConfig(),
    });
  }, [isWhatsappApi, whatsappGate]);

  useEffect(() => {
    if (!isWhatsappApi) return;

    const onLinkChange = (event: Event) => {
      const detail = (event as CustomEvent<WhatsappLinkChangeDetail>).detail;
      if (!detail) return;
      if (!detail.linked) {
        inboxBootDoneRef.current = false;
        purgeWhatsappInboxUiState(detail.ownerJid ?? whatsappOwnerJidRef.current);
        setWhatsappGate('not-linked');
        return;
      }
      if (detail.reloadInbox) {
        setWhatsappLoadState('loading');
        void reloadWhatsappConversationsRef.current({ sync: true }).then(() => {
          setWhatsappLoadState('ok');
        });
        return;
      }
      void refreshWhatsappLinkRef.current().then((gate) => {
        if (gate !== 'linked' || inboxBootDoneRef.current) return;
        inboxBootDoneRef.current = true;
        void syncWhatsappInboxDataRef.current({
          importHistory: detail.importHistory === true,
          fullImport: !detail.importHistory,
          showListLoading: detail.importHistory !== true,
        });
      });
    };
    window.addEventListener(WHATSAPP_LINK_CHANGE_EVENT, onLinkChange);

    let cancelled = false;
    void (async () => {
      purgeWhatsappInboxUiState();
      setWhatsappGate('loading');
      const gate = await refreshWhatsappLinkRef.current();
      if (cancelled || gate !== 'linked') return;
      if (!inboxBootDoneRef.current) {
        inboxBootDoneRef.current = true;
        setWhatsappLoadState('loading');
        await syncWhatsappChats();
        lastEvolutionSyncAtRef.current = Date.now();
        whatsappBootSyncDoneRef.current = true;
      }
      await reloadWhatsappConversationsRef.current({ sync: true });
    })();

    return () => {
      cancelled = true;
      inboxBootDoneRef.current = false;
      window.removeEventListener(WHATSAPP_LINK_CHANGE_EVENT, onLinkChange);
    };
  }, [isWhatsappApi, purgeWhatsappInboxUiState]);

  useEffect(() => {
    if (!isWhatsappApi || whatsappGate !== 'linked') return;
    void fetchWhatsappHistoryImportStatus().then((res) => {
      if (res.ok && res.data.running) setWhatsappHistoryImporting(true);
    });
  }, [isWhatsappApi, whatsappGate]);

  useEffect(() => {
    if (!isWhatsappApi || !whatsappHistoryImporting) return;
    const poll = () => {
      void fetchWhatsappHistoryImportStatus().then((res) => {
        if (!res.ok) return;
        if (res.data.running) {
          void reloadWhatsappConversationsRef.current({ sync: true });
          return;
        }
        setWhatsappHistoryImporting(false);
        void reloadWhatsappConversationsRef.current({ sync: true });
      });
    };
    poll();
    const interval = window.setInterval(poll, 12_000);
    return () => window.clearInterval(interval);
  }, [isWhatsappApi, whatsappHistoryImporting]);

  useEffect(() => {
    if (!isWhatsappApi || !whatsappOwnerJid.trim()) return;
    setWhatsappRows((prev) => {
      if (!prev.length) return prev;
      const next = applyInboxReadState(whatsappOwnerJid, prev);
      const changed = next.some(
        (r, i) => (r.unreadCount ?? 0) !== (prev[i]?.unreadCount ?? 0),
      );
      return changed ? next : prev;
    });
  }, [isWhatsappApi, whatsappOwnerJid]);

  useEffect(() => {
    if (!isWhatsappApi || whatsappGate !== 'linked' || whatsappRows.length === 0) return;
    const owner = whatsappOwnerJid.trim();
    const conversationsToSave = owner
      ? applyInboxReadState(owner, whatsappRows)
      : whatsappRows;
    const timer = window.setTimeout(() => {
      saveWhatsappInboxSession({
        ownerJid: whatsappOwnerJid,
        selectedId,
        conversations: conversationsToSave,
        messagesById,
        bootSyncDone: whatsappBootSyncDoneRef.current,
        lastEvolutionSyncAt: lastEvolutionSyncAtRef.current,
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    isWhatsappApi,
    whatsappGate,
    whatsappRows,
    messagesById,
    selectedId,
    whatsappOwnerJid,
  ]);

  const reloadThreadMessages = useCallback(
    async (
      conversationId: string,
      opts?: { refreshListOnNew?: boolean; sync?: boolean },
    ): Promise<ChatMsg[] | null> => {
      if (whatsappGateRef.current !== 'linked') return null;

      const requestEpoch = inboxLinkEpochRef.current;
      const res = await fetchInboxMessages(conversationId, {
        sync: opts?.sync !== false,
      });
      if (
        requestEpoch !== inboxLinkEpochRef.current ||
        whatsappGateRef.current !== 'linked'
      ) {
        return null;
      }
      if (!res.ok) return null;
      const next = res.data.map(mapMessageDto);
      let hasNewMessages = false;
      setMessagesById((prev) => {
        const prevRows = prev[conversationId] ?? [];
        const prevSig = prevRows.map((m) => m.id).join('|');
        const nextSig = next.map((m) => m.id).join('|');
        hasNewMessages = prevSig !== nextSig;
        return { ...prev, [conversationId]: next };
      });
      if (opts?.refreshListOnNew && hasNewMessages) {
        void reloadWhatsappConversations({ sync: true });
      }
      return next;
    },
    [reloadWhatsappConversations],
  );

  const tryInboxAiAutoReply = useCallback(
    async (conversationId: string, messages: ChatMsg[]) => {
      if (!isWhatsappApi || !isRealInboxConversationId(conversationId)) return;
      if (!isInboxAiAutoReplyActiveNow()) return;
      const last = messages[messages.length - 1];
      if (!last || last.from !== 'them') return;
      if (lastAutoRepliedInboundRef.current[conversationId] === last.id) return;
      if (autoReplyInFlightRef.current.has(conversationId)) return;

      autoReplyInFlightRef.current.add(conversationId);
      try {
        const res = await triggerInboxAutoReply(conversationId);
        if (res.ok && res.data.replied) {
          lastAutoRepliedInboundRef.current[conversationId] = last.id;
          await reloadThreadMessages(conversationId);
          await reloadWhatsappConversations({ sync: true });
        }
      } finally {
        autoReplyInFlightRef.current.delete(conversationId);
      }
    },
    [isWhatsappApi, reloadThreadMessages, reloadWhatsappConversations],
  );

  const runInboxPollTick = useCallback(async () => {
    if (inboxPollInFlightRef.current || whatsappGateRef.current !== 'linked') return;
    inboxPollInFlightRef.current = true;
    try {
      const activeId = selectedIdRef.current;
      await reloadWhatsappConversations({ sync: true, activeConversationId: activeId });
      if (activeId && isRealInboxConversationId(activeId)) {
        const rows = await reloadThreadMessages(activeId, { sync: true });
        if (rows?.length) void tryInboxAiAutoReply(activeId, rows);
      }
    } finally {
      inboxPollInFlightRef.current = false;
    }
  }, [reloadWhatsappConversations, reloadThreadMessages, tryInboxAiAutoReply]);

  useEffect(() => {
    if (!isWhatsappApi || whatsappGate !== 'linked') return;

    const pollInterval = window.setInterval(() => {
      void runInboxPollTick();
    }, WHATSAPP_PHONE_POLL_MS);

    const linkInterval = window.setInterval(() => {
      void refreshWhatsappLinkRef.current();
    }, 15_000);

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      void refreshWhatsappLinkRef.current().then((gate) => {
        if (gate === 'linked') void runInboxPollTick();
      });
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearInterval(pollInterval);
      window.clearInterval(linkInterval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isWhatsappApi, whatsappGate, runInboxPollTick]);

  useEffect(() => {
    if (!isWhatsappApi || whatsappGate !== 'linked') return;
    const scanUnread = () => {
      if (!isInboxAiAutoReplyActiveNow()) return;
      for (const row of whatsappRows) {
        if (!isRealInboxConversationId(row.id)) continue;
        if ((row.unreadCount ?? 0) <= 0) continue;
        const msgs = messagesById[row.id];
        if (msgs?.length) {
          void tryInboxAiAutoReply(row.id, msgs);
        } else {
          void (async () => {
            const res = await fetchInboxMessages(row.id);
            if (!res.ok) return;
            const mapped = res.data.map(mapMessageDto);
            setMessagesById((prev) => ({ ...prev, [row.id]: mapped }));
            await tryInboxAiAutoReply(row.id, mapped);
          })();
        }
      }
    };
    const interval = window.setInterval(scanUnread, 12_000);
    scanUnread();
    return () => window.clearInterval(interval);
  }, [isWhatsappApi, whatsappGate, whatsappRows, messagesById, tryInboxAiAutoReply]);

  useEffect(() => {
    if (!isWhatsappApi || !selectedId || !isRealInboxConversationId(selectedId)) return;
    return () => {
      releaseAllInboxMessageMediaUrls();
    };
  }, [isWhatsappApi, selectedId]);

  useEffect(() => {
    if (!isWhatsappApi || !selectedId || !isRealInboxConversationId(selectedId)) return;
    let cancelled = false;
    const run = async () => {
      await reloadThreadMessages(selectedId, { sync: true });
      if (cancelled) return;
      await markInboxConversationRead(selectedId);
      setWhatsappRows((prev) => {
        const row = prev.find((r) => r.id === selectedId);
        const lastMs = row?.lastMessageAtMs ?? 0;
        const owner = whatsappOwnerJid.trim();
        if (owner && lastMs > 0) {
          markInboxConversationReadLocal(owner, selectedId, lastMs);
        }
        return prev.map((r) => (r.id === selectedId ? { ...r, unreadCount: 0 } : r));
      });
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [
    isWhatsappApi,
    selectedId,
    reloadThreadMessages,
    whatsappOwnerJid,
  ]);

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
    forceThreadScrollRef.current = true;
    stickToBottomRef.current = true;
    threadTailIdRef.current = null;
    const el = threadScrollRef.current;
    if (el) el.scrollTop = 0;
    setThreadSearchOpen(false);
    setThreadSearchQuery('');
    setThreadSearchMatchIndex(0);
    setAiContextOpen(false);
    setAiContextCopied(false);
    threadMessageRefs.current.clear();
  }, [selectedId]);

  const inboxAiContextMarkdown = useMemo(
    () => buildInboxThreadAiContextMarkdown(selected, threadMessages, channel),
    [selected, threadMessages, channel],
  );

  const copyInboxAiContext = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(inboxAiContextMarkdown);
      setAiContextCopied(true);
      window.setTimeout(() => setAiContextCopied(false), 2000);
    } catch {
      setAiContextCopied(false);
    }
  }, [inboxAiContextMarkdown]);

  const threadSearchMatches = useMemo(() => {
    if (!threadSearchOpen || !normalizeThreadSearchQuery(threadSearchQuery)) return [];
    return threadMessages
      .filter((m) => messageMatchesThreadSearch(m, threadSearchQuery))
      .map((m) => m.id);
  }, [threadMessages, threadSearchOpen, threadSearchQuery]);

  const closeThreadSearch = useCallback(() => {
    setThreadSearchOpen(false);
    setThreadSearchQuery('');
    setThreadSearchMatchIndex(0);
  }, []);

  const goToThreadSearchMatch = useCallback(
    (delta: number) => {
      if (threadSearchMatches.length === 0) return;
      setThreadSearchMatchIndex((prev) => {
        const next = (prev + delta + threadSearchMatches.length) % threadSearchMatches.length;
        return next;
      });
    },
    [threadSearchMatches.length],
  );

  useEffect(() => {
    if (threadSearchMatchIndex >= threadSearchMatches.length) {
      setThreadSearchMatchIndex(0);
    }
  }, [threadSearchMatchIndex, threadSearchMatches.length]);

  useEffect(() => {
    if (!threadSearchOpen || threadSearchMatches.length === 0) return;
    const id = threadSearchMatches[threadSearchMatchIndex];
    const el = id ? threadMessageRefs.current.get(id) : undefined;
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [threadSearchOpen, threadSearchMatchIndex, threadSearchMatches]);

  useEffect(() => {
    if (threadSearchOpen) {
      window.setTimeout(() => threadSearchInputRef.current?.focus(), 0);
    }
  }, [threadSearchOpen]);

  useEffect(() => {
    const tailId =
      threadMessages.length > 0 ? (threadMessages[threadMessages.length - 1]?.id ?? null) : null;
    const tailChanged = tailId !== threadTailIdRef.current;
    threadTailIdRef.current = tailId;

    const force = forceThreadScrollRef.current;
    if (force && threadMessages.length === 0) return;

    if (force) forceThreadScrollRef.current = false;

    if (!force && !stickToBottomRef.current) return;
    if (!force && !tailChanged) return;

    scrollThreadToBottomAfterLayout('auto');
  }, [threadMessages, selectedId, scrollThreadToBottomAfterLayout]);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const focusComposeInput = useCallback(() => {
    requestAnimationFrame(() => {
      composeInputRef.current?.focus();
    });
  }, []);

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
        deliveryStatus: 'pending',
      };
      forceThreadScrollRef.current = true;
      stickToBottomRef.current = true;
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
          URL.revokeObjectURL(localPreview);
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
          setMessagesById((prev) => ({
            ...prev,
            [selectedId]: (prev[selectedId] ?? []).map((m) =>
              m.id === optimisticId ? { ...m, deliveryStatus: 'sent' } : m,
            ),
          }));
          await reloadThreadMessages(selectedId);
          await reloadWhatsappConversations({ sync: true });
          URL.revokeObjectURL(localPreview);
        }
      } catch {
        URL.revokeObjectURL(localPreview);
        setMessagesById((prev) => ({
          ...prev,
          [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== optimisticId),
        }));
        if (caption) setDraft(caption);
        window.alert(t('adminCanales.whatsappSendError'));
      } finally {
        setSending(false);
        focusComposeInput();
      }
    },
    [draft, sending, selectedId, reloadThreadMessages, reloadWhatsappConversations, t, focusComposeInput],
  );

  const sendWhatsappSticker = useCallback(
    async (sourceMessageId: string) => {
      if (!selectedId || sending || !isRealInboxConversationId(selectedId)) return;
      setSending(true);
      const optimisticId = `opt-${crypto.randomUUID()}`;
      const optimistic: ChatMsg = {
        id: optimisticId,
        from: 'us',
        text: '[Sticker]',
        time: formatChatTime(new Date()),
        mediaType: 'sticker',
        hasMedia: true,
        deliveryStatus: 'pending',
      };
      forceThreadScrollRef.current = true;
      stickToBottomRef.current = true;
      setMessagesById((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] ?? []), optimistic],
      }));

      try {
        const res = await sendInboxSticker(selectedId, sourceMessageId);
        if (!res.ok) {
          setMessagesById((prev) => ({
            ...prev,
            [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== optimisticId),
          }));
          window.alert(
            res.reason === 'no-auth'
              ? t('adminCanales.inboxAuthRequired')
              : res.message?.trim() || t('adminCanales.whatsappSendError'),
          );
        } else {
          setMessagesById((prev) => ({
            ...prev,
            [selectedId]: (prev[selectedId] ?? []).map((m) =>
              m.id === optimisticId ? { ...m, deliveryStatus: 'sent' } : m,
            ),
          }));
          await reloadThreadMessages(selectedId);
          await reloadWhatsappConversations({ sync: true });
        }
      } catch {
        setMessagesById((prev) => ({
          ...prev,
          [selectedId]: (prev[selectedId] ?? []).filter((m) => m.id !== optimisticId),
        }));
        window.alert(t('adminCanales.whatsappSendError'));
      } finally {
        setSending(false);
        focusComposeInput();
      }
    },
    [sending, selectedId, reloadThreadMessages, reloadWhatsappConversations, t, focusComposeInput],
  );

  const sendWhatsapp = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending || !selectedId || !isRealInboxConversationId(selectedId)) return;
    setDraft('');
    setSending(true);
    const optimisticId = `opt-${crypto.randomUUID()}`;
    const optimistic: ChatMsg = {
      id: optimisticId,
      from: 'us',
      text,
      time: formatChatTime(new Date()),
      deliveryStatus: 'pending',
    };
    forceThreadScrollRef.current = true;
    stickToBottomRef.current = true;
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
      window.alert(
        res.reason === 'no-auth'
          ? t('adminCanales.inboxAuthRequired')
          : res.message?.trim() || t('adminCanales.whatsappSendError'),
      );
    } else {
      const ack = res.data.deliveryStatus ?? 'sent';
      setMessagesById((prev) => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).map((m) =>
          m.id === optimisticId
            ? { ...m, id: res.data.id, deliveryStatus: ack }
            : m,
        ),
      }));
      await reloadThreadMessages(selectedId);
      await reloadWhatsappConversations({ sync: true });
    }
    setSending(false);
    focusComposeInput();
  }, [draft, sending, selectedId, reloadThreadMessages, reloadWhatsappConversations, focusComposeInput, t]);

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
      focusComposeInput();
    }
    const reply: ChatMsg = {
      id: `b-${crypto.randomUUID()}`,
      from: 'them',
      text: replyText,
      time: formatChatTime(new Date()),
    };
    setBotThread((prev) => [...prev, reply]);
  }, [draft, sending, isBotTest, botThread, channel, t, focusComposeInput]);

  const handleSend = useCallback(() => {
    if (isBotTest) void sendBot();
    else if (isWhatsappApi) void sendWhatsapp();
  }, [isBotTest, isWhatsappApi, sendBot, sendWhatsapp]);

  const openThread = (id: string) => {
    forceThreadScrollRef.current = true;
    stickToBottomRef.current = true;
    const el = threadScrollRef.current;
    if (el) el.scrollTop = 0;
    if (isWhatsappApi && isRealInboxConversationId(id)) {
      const conv = conversations.find((c) => c.id === id);
      const lastMs = conv?.lastMessageAtMs ?? 0;
      const owner = whatsappOwnerJid.trim();
      if (owner && lastMs > 0) {
        markInboxConversationReadLocal(owner, id, lastMs);
      }
      setWhatsappRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, unreadCount: 0 } : r)),
      );
    }
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
    return (
      <WhatsappInboxLinkGate gate={whatsappGate} onRefreshLink={refreshWhatsappLink} />
    );
  }

  return (
    <div
      className={cn(
        'flex h-full max-h-full min-h-0 w-full min-w-0 flex-1 flex-row overflow-hidden',
        'border-0 shadow-none',
      )}
    >
      {/* Lista de chats (estilo WhatsApp Web) */}
      <div
        className={cn(
          'flex h-full max-h-full min-h-0 w-full min-w-0 flex-col overflow-hidden border-black/10 md:w-[min(520px,38vw)] md:min-w-[300px] md:max-w-[560px] md:shrink-0 md:border-r dark:border-white/10',
          chrome.listBg,
          !showListPane && 'max-md:hidden',
        )}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-black/10 px-3 py-2.5 dark:border-white/10 dark:bg-[#202c33]">
          {isWhatsappApi ? (
            <InboxAccountAvatar
              enabled={whatsappGate === 'linked'}
              cacheKey={whatsappOwnerJid}
              alt={t('adminCanales.inboxChatsTitle')}
            />
          ) : (
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 text-xs font-bold text-white shadow-sm"
              aria-hidden
            >
              VA
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight text-zinc-900 dark:text-zinc-100">
              {t('adminCanales.inboxChatsTitle')}
            </p>
            {isWhatsappApi ? (
              <InboxAutopilotStatusLine />
            ) : (
              <p className="mt-0.5 truncate text-[11px] text-zinc-500 dark:text-zinc-400">
                {t('adminCanales.inboxYourAccount')}
              </p>
            )}
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
              value={listSearchQuery}
              onChange={(e) => setListSearchQuery(e.target.value)}
              className="h-9 border-0 bg-[#f0f2f5] pl-9 text-sm text-zinc-800 shadow-none dark:bg-[#2a3942] dark:text-zinc-100"
              placeholder={t('adminCanales.inboxSearchPlaceholder')}
              aria-label={t('adminCanales.inboxSearchPlaceholder')}
            />
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-white dark:bg-[#111b21]"
          role="listbox"
          aria-label={t('sidebarDemo.navChannels')}
        >
          {isWhatsappApi && whatsappHistoryImporting ? (
            <div className="border-b border-[#128c7e]/20 bg-[#128c7e]/10 px-4 py-2 text-center text-xs text-[#075e54] dark:text-[#25d366]">
              {t('adminCanales.whatsappImportingHistoryBackground')}
            </div>
          ) : null}
          {isWhatsappApi && whatsappLoadState === 'loading' && conversations.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              {t('adminCanales.whatsappLoadingChats')}
            </p>
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
          {displayedConversations.length === 0 && listSearchQuery.trim() ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              {t('adminCanales.inboxListSearchEmpty')}
            </p>
          ) : null}
          {displayedConversations.map((c) => {
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
                  'flex w-full gap-3 border-b px-3 py-2.5 text-left transition-colors',
                  isWhatsappApi
                    ? active
                      ? 'border-teal-500/20 bg-teal-500/10 dark:border-teal-500/20'
                      : 'border-white/[0.04] hover:bg-white/[0.04]'
                    : cn(
                        'border-black/[0.06] dark:border-white/[0.06]',
                        active
                          ? 'bg-[#f0f2f5] dark:bg-[#2a3942]'
                          : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]',
                      ),
                )}
              >
                {isWhatsappApi && isRealInboxConversationId(c.id) ? (
                  <InboxContactAvatar
                    conversationId={c.id}
                    name={c.name}
                    initials={c.initials}
                    channel="whatsapp"
                    size="lg"
                  />
                ) : (
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
                )}
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
                      <span
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white',
                          isWhatsappApi ? 'bg-teal-500' : 'bg-[#25d366]',
                        )}
                      >
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

      {/* Hilo de mensajes */}
      <div
        className={cn(
          'relative flex h-full max-h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden',
          isWhatsappApi ? 'bg-[#0a0c0e]' : 'bg-[#efeae2] dark:bg-[#0b141a]',
          !showThreadPane && 'max-md:hidden',
        )}
      >
        <WaThreadBackdrop messenger={isWhatsappApi} />

        <div
          className={cn(
            'relative z-[1] flex h-[52px] min-h-[52px] shrink-0 items-center gap-0.5 overflow-hidden border-b px-1.5 backdrop-blur-xl sm:px-2',
            isWhatsappApi
              ? 'border-white/[0.06] bg-zinc-900/80 shadow-[0_4px_24px_rgba(0,0,0,0.35)]'
              : cn('shadow-md', chrome.headerBar),
          )}
        >
          {!isMd ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'shrink-0 md:hidden',
                isWhatsappApi
                  ? 'text-zinc-300 hover:bg-white/10 hover:text-white'
                  : 'text-white hover:bg-white/10',
              )}
              onClick={backToList}
              aria-label={t('adminCanales.inboxBack')}
            >
              <ChevronLeft className="size-6" />
            </Button>
          ) : null}
          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden px-0.5 sm:gap-3 sm:px-1">
            {isWhatsappApi && selected && isRealInboxConversationId(selected.id) ? (
              <InboxContactAvatar
                conversationId={selected.id}
                name={selected.name}
                initials={selected.initials}
                channel="whatsapp"
                size="md"
                className="ring-2 ring-teal-500/30"
              />
            ) : (
              <div
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-full ring-1',
                  isWhatsappApi
                    ? 'bg-zinc-800 ring-white/10'
                    : 'bg-black/10 ring-white/20',
                )}
              >
                <ChannelHeaderIcon channel={channel} />
              </div>
            )}
            <div className="min-w-0 overflow-hidden">
              <p
                className={cn(
                  'truncate text-[15px] font-semibold leading-tight tracking-tight sm:text-[16px]',
                  isWhatsappApi ? 'text-zinc-50' : 'text-white',
                )}
              >
                {selected?.name}
              </p>
              {isWhatsappApi ? (
                selected?.isGroup ? (
                  selected.groupMemberCount != null && selected.groupMemberCount > 0 ? (
                    <p className="truncate text-[12px] text-zinc-500">
                      {t('adminCanales.inboxGroupMemberCount', {
                        count: selected.groupMemberCount,
                      })}
                    </p>
                  ) : (
                    <p className="truncate text-[12px] text-zinc-500">
                      {t('adminCanales.inboxGroupTapMembers')}
                    </p>
                  )
                ) : selected?.contactPhone ? (
                  <p className="truncate text-[12px] text-zinc-500">{selected.contactPhone}</p>
                ) : null
              ) : (
                <p className="truncate text-[12px] text-white/90">{t('adminCanales.inboxOnline')}</p>
              )}
            </div>
          </div>
          {isWhatsappApi ? (
            <div className="flex shrink-0 items-center gap-0.5 pr-0.5">
              {selected?.isGroup && isRealInboxConversationId(selected.id) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'size-9 shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-teal-300',
                    groupInfoOpen && 'bg-white/10 text-teal-300',
                  )}
                  title={t('adminCanales.inboxGroupInfo')}
                  aria-label={t('adminCanales.inboxGroupInfo')}
                  onClick={() => setGroupInfoOpen(true)}
                >
                  <Users className="size-5" strokeWidth={1.5} />
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                className={cn(
                  'h-8 shrink-0 gap-1 rounded-full border border-teal-500/30 bg-teal-500/10 px-2 text-teal-300 hover:bg-teal-500/20 hover:text-teal-200',
                  aiContextOpen && 'border-teal-400/50 bg-teal-500/20',
                )}
                title={t('adminCanales.inboxAiContext')}
                aria-label={t('adminCanales.inboxAiContext')}
                onClick={() => setAiContextOpen(true)}
              >
                <Sparkles className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
                <span className="hidden text-[11px] font-medium leading-none md:inline">
                  {t('adminCanales.inboxAiContext')}
                </span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  'size-9 shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-teal-300',
                  threadSearchOpen && 'bg-white/10 text-teal-300',
                )}
                title={t('adminCanales.inboxSearchChat')}
                aria-label={t('adminCanales.inboxSearchChat')}
                aria-pressed={threadSearchOpen}
                onClick={() => {
                  if (threadSearchOpen) {
                    closeThreadSearch();
                    return;
                  }
                  setThreadSearchOpen(true);
                }}
              >
                <Search className="size-5" strokeWidth={1.5} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-teal-300"
                title={t('adminCanales.inboxToolbarMenu')}
                aria-label={t('adminCanales.inboxToolbarMenu')}
              >
                <MoreVertical className="size-5" strokeWidth={1.5} />
              </Button>
            </div>
          ) : null}
        </div>

        {isWhatsappApi && threadSearchOpen ? (
          <div className="relative z-[2] flex shrink-0 items-center gap-1 border-b border-white/[0.06] bg-zinc-900/95 px-2 py-2">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
                aria-hidden
              />
              <Input
                ref={threadSearchInputRef}
                value={threadSearchQuery}
                onChange={(e) => {
                  setThreadSearchQuery(e.target.value);
                  setThreadSearchMatchIndex(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    closeThreadSearch();
                    return;
                  }
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    goToThreadSearchMatch(e.shiftKey ? -1 : 1);
                  }
                }}
                className="h-9 border-0 bg-zinc-800 pl-9 pr-2 text-sm text-zinc-100 shadow-none placeholder:text-zinc-500 focus-visible:ring-teal-500/40"
                placeholder={t('adminCanales.inboxSearchChatPlaceholder')}
                aria-label={t('adminCanales.inboxSearchChatPlaceholder')}
              />
            </div>
            {normalizeThreadSearchQuery(threadSearchQuery) ? (
              <span className="shrink-0 px-1 text-[11px] tabular-nums text-zinc-500">
                {threadSearchMatches.length === 0
                  ? t('adminCanales.inboxSearchChatNoResults')
                  : `${threadSearchMatchIndex + 1}/${threadSearchMatches.length}`}
              </span>
            ) : null}
            {threadSearchMatches.length > 1 ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-teal-300"
                  title={t('adminCanales.inboxSearchChatPrev')}
                  aria-label={t('adminCanales.inboxSearchChatPrev')}
                  onClick={() => goToThreadSearchMatch(-1)}
                >
                  <ChevronUp className="size-5" strokeWidth={1.5} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-teal-300"
                  title={t('adminCanales.inboxSearchChatNext')}
                  aria-label={t('adminCanales.inboxSearchChatNext')}
                  onClick={() => goToThreadSearchMatch(1)}
                >
                  <ChevronDown className="size-5" strokeWidth={1.5} />
                </Button>
              </>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-zinc-200"
              title={t('adminCanales.inboxSearchChatClose')}
              aria-label={t('adminCanales.inboxSearchChatClose')}
              onClick={closeThreadSearch}
            >
              <X className="size-5" strokeWidth={1.5} />
            </Button>
          </div>
        ) : null}

        <div className="relative z-[1] flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div
            ref={threadScrollRef}
            onScroll={handleThreadScroll}
            className={cn(
              'min-h-0 min-w-0 flex-1 basis-0 overflow-y-auto overflow-x-hidden overscroll-contain',
              isWhatsappApi ? 'px-4 py-5 md:px-8' : 'px-2 py-3 md:px-4',
            )}
          >
            {threadMessages.length === 0 && isMock ? (
              <p
                className={cn(
                  'py-8 text-center text-sm',
                  isWhatsappApi ? 'text-zinc-500' : 'text-zinc-500',
                )}
              >
                {t('adminCanales.inboxTapChat')}
              </p>
            ) : threadMessages.length === 0 && isWhatsappApi && selectedId ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                {t('adminCanales.whatsappLoadingChats')}
              </p>
            ) : (
              <div className={cn('flex flex-col', isWhatsappApi ? 'gap-3' : 'gap-1')}>
                <div
                  className={cn(
                    'mx-auto mb-1 px-4 py-1 text-[11px] font-semibold tracking-wider uppercase',
                    isWhatsappApi
                      ? 'rounded-lg bg-zinc-800/70 text-zinc-500 ring-1 ring-white/[0.06] backdrop-blur-sm'
                      : 'rounded-md bg-white/80 font-medium text-zinc-600 shadow-sm dark:bg-[#182229]/90 dark:text-zinc-400',
                  )}
                >
                  {t('adminCanales.mockToday')}
                </div>
                {threadMessages.map((m) => {
                  const searchActive =
                    threadSearchOpen && normalizeThreadSearchQuery(threadSearchQuery).length > 0;
                  const isMatch = searchActive && messageMatchesThreadSearch(m, threadSearchQuery);
                  const isActiveMatch =
                    isMatch &&
                    threadSearchMatches[threadSearchMatchIndex] === m.id;
                  const dimNonMatch = searchActive && !isMatch;
                  const groupSenderLabel =
                    isWhatsappApi &&
                    selected?.isGroup &&
                    m.from === 'them' &&
                    m.senderName?.trim()
                      ? m.senderName.trim()
                      : null;

                  return (
                  <div
                    key={m.id}
                    ref={(el) => {
                      if (el) threadMessageRefs.current.set(m.id, el);
                      else threadMessageRefs.current.delete(m.id);
                    }}
                    className={cn(
                      'flex px-1 transition-opacity',
                      isWhatsappApi ? 'items-end gap-0' : 'items-end gap-2',
                      m.from === 'us' ? 'justify-end' : 'justify-start',
                      dimNonMatch && 'opacity-35',
                      isActiveMatch && 'rounded-lg ring-1 ring-teal-400/50',
                    )}
                  >
                    {!isWhatsappApi && m.from === 'them' ? (
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
                          <span className="text-[10px] font-bold">
                            {selected?.initials?.slice(0, 2) ?? '·'}
                          </span>
                        )}
                      </div>
                    ) : null}
                    <div
                      className={cn(
                        'flex flex-col',
                        isWhatsappApi
                          ? 'w-fit max-w-[min(85vw,420px)]'
                          : 'min-w-0 max-w-full',
                        m.from === 'us' ? 'items-end' : 'items-start',
                      )}
                    >
                      {groupSenderLabel ? (
                        <span
                          className={cn(
                            'mb-1 max-w-full truncate px-0.5 text-[12.5px] font-semibold leading-tight',
                            groupSenderColorClass(groupSenderLabel),
                          )}
                        >
                          {groupSenderLabel}
                        </span>
                      ) : null}
                      <WaMessageBubble
                      from={m.from}
                      time={m.time}
                      variant={isWhatsappApi ? getBubbleVariantForList(m) : 'text'}
                      messenger={isWhatsappApi}
                      showDeliveryTicks={isWhatsappApi && m.from === 'us'}
                      deliveryStatus={m.from === 'us' ? m.deliveryStatus : undefined}
                      deliveryStatusLabel={
                        isWhatsappApi && m.from === 'us'
                          ? deliveryStatusAriaLabel(m.deliveryStatus, t)
                          : undefined
                      }
                    >
                      {isWhatsappApi ? (
                        <WaMessageContent
                          msg={m}
                          t={t}
                          messenger
                          searchQuery={searchActive ? threadSearchQuery : ''}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap [overflow-wrap:break-word]">
                          <HighlightedMessageText
                            text={m.text}
                            query={searchActive ? threadSearchQuery : ''}
                          />
                        </p>
                      )}
                    </WaMessageBubble>
                    </div>
                  </div>
                  );
                })}
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
                <div className="h-px shrink-0" aria-hidden />
              </div>
            )}
          </div>

          <div
            className={cn(
              'relative z-[1] shrink-0 border-t px-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-2',
              isWhatsappApi
                ? 'border-white/[0.06] bg-zinc-900/90 backdrop-blur-xl'
                : 'border-black/10 bg-[#f0f2f5] dark:border-white/10 dark:bg-[#1f2c33]',
            )}
          >
            {isInteractive ? (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'size-10 shrink-0 rounded-full',
                    isWhatsappApi
                      ? 'text-zinc-400 hover:bg-white/10 hover:text-teal-300'
                      : 'text-zinc-500 hover:bg-zinc-200/90 dark:text-zinc-400 dark:hover:bg-zinc-600/60',
                  )}
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
                {!isWhatsappApi ? (
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
                ) : null}
                <Input
                  ref={composeInputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={inputPlaceholder}
                  className={cn(
                    'min-h-11 flex-1 border-0 px-4 py-2.5 text-[15px] shadow-none',
                    isWhatsappApi
                      ? 'rounded-lg bg-zinc-800/90 text-zinc-100 ring-1 ring-white/[0.08] placeholder:text-zinc-500 focus-visible:ring-teal-500/40'
                      : 'rounded-lg bg-white shadow-sm ring-1 ring-black/[0.06] dark:bg-[#2a3942] dark:text-zinc-100 dark:ring-white/10',
                  )}
                  aria-label={inputAria}
                  disabled={
                    isWhatsappApi && (!selectedId || !isRealInboxConversationId(selectedId))
                  }
                  maxLength={2000}
                  autoComplete="off"
                />
                <InboxComposePicker
                  messenger={isWhatsappApi}
                  draft={draft}
                  onDraftChange={setDraft}
                  composeInputRef={composeInputRef}
                  sending={sending}
                  disabled={
                    isWhatsappApi &&
                    (!selectedId || !isRealInboxConversationId(selectedId))
                  }
                  onSendImageFile={(file) => {
                    if (isWhatsappApi) void sendWhatsappImage(file);
                  }}
                  onSendSavedSticker={
                    isWhatsappApi ? (id) => sendWhatsappSticker(id) : undefined
                  }
                />
                {isWhatsappApi ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0 rounded-full text-zinc-400 hover:bg-white/10 hover:text-teal-300"
                    title={t('adminCanales.inboxAttach')}
                    disabled={sending || !selectedId || !isRealInboxConversationId(selectedId)}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <Paperclip className="size-5" strokeWidth={1.5} />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0 rounded-full text-zinc-500 hover:bg-zinc-200/90 dark:text-zinc-400 dark:hover:bg-zinc-600/60"
                    title={t('adminCanales.inboxMicDemo')}
                  >
                    <Mic className="size-[22px]" strokeWidth={1.5} />
                  </Button>
                )}
                <Button
                  type="submit"
                  size="icon"
                  className={cn(
                    'size-11 shrink-0 rounded-full text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-95',
                    isWhatsappApi
                      ? 'bg-gradient-to-br from-teal-500 to-teal-600 shadow-teal-900/40 hover:from-teal-400 hover:to-teal-500'
                      : 'bg-[#00a884] hover:bg-[#008f72] dark:bg-[#00a884]',
                  )}
                  disabled={sending || !draft.trim() || (isWhatsappApi && !selectedId)}
                  aria-label={sendAria}
                >
                  <Send className="size-5" strokeWidth={2} />
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

      {isWhatsappApi ? (
        <>
          <InboxGroupInfoSheet
            open={groupInfoOpen}
            onOpenChange={setGroupInfoOpen}
            conversationId={
              selected?.isGroup && isRealInboxConversationId(selected.id) ? selected.id : null
            }
            groupName={selected?.name ?? t('adminCanales.inboxGroupFallback')}
            onOpenMemberChat={(conversationId) => {
              setGroupInfoOpen(false);
              openThread(conversationId);
              void reloadThreadMessages(conversationId, { sync: true });
              void syncWhatsappInboxData({ fullImport: true, activeConversationId: conversationId });
            }}
          />
        <Sheet open={aiContextOpen} onOpenChange={setAiContextOpen}>
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-0 border-zinc-700/80 bg-zinc-900 p-0 text-zinc-100 sm:max-w-md"
          >
            <SheetHeader className="border-b border-white/[0.06] px-4 pt-4 pb-3">
              <SheetTitle className="flex items-center gap-2 text-base text-zinc-50">
                <Sparkles className="size-5 shrink-0 text-teal-400" strokeWidth={1.5} aria-hidden />
                {t('adminCanales.inboxAiContextTitle')}
              </SheetTitle>
              <SheetDescription className="text-left text-xs text-zinc-400">
                {t('adminCanales.inboxAiContextHint')}
              </SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 py-3">
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2 border-zinc-600 bg-zinc-800/80 text-zinc-100 hover:bg-zinc-700 hover:text-white"
                onClick={() => void copyInboxAiContext()}
              >
                <ClipboardCopy className="size-4" strokeWidth={1.5} aria-hidden />
                {aiContextCopied
                  ? t('adminCanales.inboxAiContextCopied')
                  : t('adminCanales.inboxAiContextCopy')}
              </Button>
              <pre className="min-h-0 flex-1 overflow-y-auto rounded-lg bg-zinc-950/90 p-3 text-xs leading-relaxed whitespace-pre-wrap text-zinc-300 ring-1 ring-white/[0.06]">
                {inboxAiContextMarkdown}
              </pre>
            </div>
          </SheetContent>
        </Sheet>
        </>
      ) : null}
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
      hidePageTitle={ch === 'whatsapp'}
    >
      <div className="flex h-full max-h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
        <ChannelWhatsAppInbox
          channel={ch}
          chrome={chrome}
          dataSource={ch === 'bot-test' ? 'bot-test' : ch === 'whatsapp' ? 'whatsapp-api' : 'mock'}
        />
      </div>
    </AppShell>
  );
}
