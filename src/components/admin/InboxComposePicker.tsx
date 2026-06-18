import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react';
import { Loader2, Search, Smile } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  fetchSavedInboxStickers,
  type InboxSavedStickerDto,
} from '@/lib/adminInboxApi';
import { insertTextAtComposeInput } from '@/lib/inboxComposeInsert';
import {
  fetchRemoteImageAsFile,
  fetchTrendingGifs,
  getFallbackGifs,
  getGiphyApiKey,
  searchGifs,
  type GiphyMediaItem,
} from '@/lib/inboxGiphy';
import { loadInboxMessageMediaUrl } from '@/lib/inboxMessageMedia';
import { cn } from '@/lib/utils';

type InboxComposePickerProps = {
  disabled?: boolean;
  messenger?: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  composeInputRef: React.RefObject<HTMLInputElement | null>;
  onSendImageFile: (file: File) => void | Promise<void>;
  
  onSendSavedSticker?: (sourceMessageId: string) => void | Promise<void>;
  sending?: boolean;
};

function GiphyGrid({
  items,
  loading,
  onPick,
  disabled,
}: {
  items: GiphyMediaItem[];
  loading: boolean;
  onPick: (item: GiphyMediaItem) => void;
  disabled?: boolean;
}) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-zinc-500">
        <Loader2 className="size-6 animate-spin" aria-hidden />
      </div>
    );
  }
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="grid max-h-52 grid-cols-4 gap-1.5 overflow-y-auto overscroll-contain p-0.5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          className="relative aspect-square overflow-hidden rounded-md bg-zinc-800/80 ring-1 ring-white/[0.06] transition hover:ring-teal-500/50 disabled:opacity-50"
          title={item.title}
          onClick={() => onPick(item)}
        >
          <img
            src={item.previewUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </button>
      ))}
    </div>
  );
}

function SavedStickerThumb({
  messageId,
  disabled,
  onPick,
}: {
  messageId: string;
  disabled?: boolean;
  onPick: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setSrc(null);
    void loadInboxMessageMediaUrl(messageId).then((url) => {
      if (cancelled) return;
      if (url) setSrc(url);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [messageId]);

  return (
    <button
      type="button"
      disabled={disabled || failed}
      onClick={onPick}
      className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-zinc-800/80 ring-1 ring-white/[0.06] transition hover:ring-teal-500/50 disabled:opacity-40"
    >
      {src ? (
        <img src={src} alt="" className="size-full object-contain p-0.5" loading="lazy" decoding="async" />
      ) : failed ? (
        <span className="text-[10px] text-zinc-600">·</span>
      ) : (
        <Loader2 className="size-4 animate-spin text-zinc-500" aria-hidden />
      )}
    </button>
  );
}

function SavedStickersGrid({
  items,
  loading,
  disabled,
  onPick,
}: {
  items: InboxSavedStickerDto[];
  loading: boolean;
  disabled?: boolean;
  onPick: (messageId: string) => void;
}) {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-zinc-500">
        <Loader2 className="size-6 animate-spin" aria-hidden />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-xs leading-relaxed text-zinc-500">
        {t('adminCanales.inboxPickerSavedStickersEmpty')}
      </p>
    );
  }

  return (
    <div className="grid max-h-52 grid-cols-4 gap-1.5 overflow-y-auto overscroll-contain p-0.5">
      {items.map((item) => (
        <SavedStickerThumb
          key={item.messageId}
          messageId={item.messageId}
          disabled={disabled}
          onPick={() => onPick(item.messageId)}
        />
      ))}
    </div>
  );
}

export function InboxComposePicker({
  disabled,
  messenger = false,
  draft,
  onDraftChange,
  composeInputRef,
  onSendImageFile,
  onSendSavedSticker,
  sending,
}: InboxComposePickerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('emoji');
  const [gifQuery, setGifQuery] = useState('');
  const [gifs, setGifs] = useState<GiphyMediaItem[]>([]);
  const [savedStickers, setSavedStickers] = useState<InboxSavedStickerDto[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const [stickersLoading, setStickersLoading] = useState(false);
  const [mediaSending, setMediaSending] = useState(false);

  const giphyConfigured = Boolean(getGiphyApiKey());
  const canSendSavedSticker = Boolean(onSendSavedSticker);
  const pickerDisabled = disabled || sending || mediaSending;

  const handleEmojiClick = useCallback(
    (data: EmojiClickData) => {
      insertTextAtComposeInput(composeInputRef.current, draft, data.emoji, onDraftChange);
      setOpen(false);
    },
    [composeInputRef, draft, onDraftChange],
  );

  const sendRemoteGif = useCallback(
    async (item: GiphyMediaItem) => {
      if (pickerDisabled) return;
      setMediaSending(true);
      try {
        const file = await fetchRemoteImageAsFile(item.sendUrl, 'image/gif');
        await onSendImageFile(file);
        setOpen(false);
      } catch {
        window.alert(t('adminCanales.inboxPickerMediaError'));
      } finally {
        setMediaSending(false);
      }
    },
    [onSendImageFile, pickerDisabled, t],
  );

  const handleSavedStickerPick = useCallback(
    async (messageId: string) => {
      if (pickerDisabled || !onSendSavedSticker) return;
      setMediaSending(true);
      try {
        await onSendSavedSticker(messageId);
        setOpen(false);
      } catch {
        window.alert(t('adminCanales.inboxPickerMediaError'));
      } finally {
        setMediaSending(false);
      }
    },
    [onSendSavedSticker, pickerDisabled, t],
  );

  useEffect(() => {
    if (!open || tab !== 'gif') return;
    if (!giphyConfigured) {
      setGifs(getFallbackGifs());
      setGifLoading(false);
      return;
    }
    let cancelled = false;
    setGifLoading(true);
    const timer = window.setTimeout(() => {
      void (async () => {
        const rows = await searchGifs(gifQuery);
        if (!cancelled) {
          setGifs(rows);
          setGifLoading(false);
        }
      })();
    }, gifQuery.trim() ? 320 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, tab, gifQuery, giphyConfigured]);

  useEffect(() => {
    if (!open || tab !== 'sticker' || !canSendSavedSticker) return;
    let cancelled = false;
    setStickersLoading(true);
    void (async () => {
      const res = await fetchSavedInboxStickers();
      if (cancelled) return;
      setSavedStickers(res.ok && Array.isArray(res.data) ? res.data : []);
      setStickersLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, tab, canSendSavedSticker]);

  useEffect(() => {
    if (!open || !giphyConfigured || tab !== 'gif') return;
    if (gifs.length === 0 && !gifQuery.trim()) {
      void fetchTrendingGifs().then(setGifs);
    }
  }, [open, tab, giphyConfigured, gifs.length, gifQuery]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pickerDisabled}
          className={cn(
            'size-10 shrink-0 rounded-full',
            messenger
              ? 'text-zinc-400 hover:bg-white/10 hover:text-teal-300 data-[state=open]:bg-white/10 data-[state=open]:text-teal-300'
              : 'text-zinc-500 hover:bg-zinc-200/90 dark:text-zinc-400 dark:hover:bg-zinc-600/60',
          )}
          title={t('adminCanales.inboxEmoji')}
          aria-label={t('adminCanales.inboxEmoji')}
          aria-expanded={open}
        >
          <Smile className="size-[22px]" strokeWidth={1.5} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className={cn(
          'w-[min(92vw,360px)] gap-0 overflow-hidden p-0',
          messenger && 'app-dark border-zinc-700/90 bg-zinc-900 text-zinc-100',
        )}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs value={tab} onValueChange={setTab} className="gap-0">
          <TabsList
            className={cn(
              'h-10 w-full shrink-0 rounded-none border-b px-1',
              messenger
                ? 'border-white/[0.06] bg-zinc-900/95'
                : 'border-border bg-muted/40',
            )}
          >
            <TabsTrigger value="emoji" className="flex-1 text-xs">
              {t('adminCanales.inboxPickerEmoji')}
            </TabsTrigger>
            <TabsTrigger value="gif" className="flex-1 text-xs">
              {t('adminCanales.inboxPickerGif')}
            </TabsTrigger>
            <TabsTrigger value="sticker" className="flex-1 text-xs">
              {t('adminCanales.inboxPickerSticker')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="emoji" className="mt-0 outline-none">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={messenger ? Theme.DARK : Theme.AUTO}
              width="100%"
              height={340}
              lazyLoadEmojis
              searchPlaceholder={t('adminCanales.inboxPickerEmojiSearch')}
              previewConfig={{ showPreview: false }}
            />
          </TabsContent>

          <TabsContent value="gif" className="mt-0 space-y-2 p-3 outline-none">
            {giphyConfigured ? (
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-zinc-500"
                  aria-hidden
                />
                <Input
                  value={gifQuery}
                  onChange={(e) => setGifQuery(e.target.value)}
                  placeholder={t('adminCanales.inboxPickerGifSearch')}
                  className={cn(
                    'h-9 pl-8 text-sm',
                    messenger &&
                      'border-zinc-700 bg-zinc-800/90 text-zinc-100 placeholder:text-zinc-500',
                  )}
                  disabled={pickerDisabled}
                />
              </div>
            ) : (
              <p className="text-center text-[11px] leading-relaxed text-zinc-500">
                {t('adminCanales.inboxPickerGiphyHint')}
              </p>
            )}
            <GiphyGrid
              items={gifs}
              loading={gifLoading}
              disabled={pickerDisabled}
              onPick={(item) => void sendRemoteGif(item)}
            />
          </TabsContent>

          <TabsContent value="sticker" className="mt-0 space-y-2 p-3 outline-none">
            <p className="text-center text-[11px] leading-relaxed text-zinc-500">
              {t('adminCanales.inboxPickerSavedStickersHint')}
            </p>
            {canSendSavedSticker ? (
              <SavedStickersGrid
                items={savedStickers}
                loading={stickersLoading}
                disabled={pickerDisabled}
                onPick={(id) => void handleSavedStickerPick(id)}
              />
            ) : (
              <p className="text-center text-xs text-zinc-500">
                {t('adminCanales.inboxPickerSavedStickersNeedChat')}
              </p>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
