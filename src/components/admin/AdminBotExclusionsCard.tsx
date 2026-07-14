import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Loader2, MessageCircleOff, RefreshCw, Search, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { InboxContactAvatar } from '@/components/admin/InboxContactAvatar';
import { cn } from '@/lib/utils';
import {
  SettingsCollapsibleCard,
} from '@/components/settings/settings-ui';
import {
  adminInboxErrorMessage,
  fetchInboxConversations,
  fetchWhatsappLinkStatus,
  patchInboxConversationAutoReply,
  type InboxConversationAutoReplyMode,
  type InboxConversationDto,
} from '@/lib/adminInboxApi';
import { formatInboxContactName, isTechnicalInboxLabel } from '@/lib/inboxDisplay';

type FilterId = 'all' | 'excluded' | 'groups' | 'contacts';

type ExclusionRow = {
  id: string;
  name: string;
  initials: string;
  subtitle: string | null;
  isGroup: boolean;
  autoReplyMode: InboxConversationAutoReplyMode;
  autoReplyActive: boolean;
};

function initialsForContact(name: string, externalId: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  if (parts[0]?.[0]) return parts[0]![0]!.toUpperCase();
  const digits = externalId.replace(/\D/g, '');
  if (digits.length >= 2) return digits.slice(-2);
  return '?';
}

function mapDtoToRow(c: InboxConversationDto, t: TFunction): ExclusionRow | null {
  const name = formatInboxContactName(c.contactName, c.externalId, t);
  if (isTechnicalInboxLabel(name)) return null;
  const isGroup = c.isGroup ?? c.externalId.startsWith('g:');
  const autoReplyMode = c.autoReplyMode ?? (isGroup ? 'off' : 'inherit');
  const subtitle = isGroup
    ? t('adminSettings.botExclusionsTypeGroup')
    : c.contactPhone?.trim() || null;
  return {
    id: c.id,
    name,
    initials: initialsForContact(name, c.externalId),
    subtitle,
    isGroup,
    autoReplyMode,
    autoReplyActive: c.autoReplyActive ?? false,
  };
}

function isExcluded(mode: InboxConversationAutoReplyMode): boolean {
  return mode === 'off';
}

const FILTER_I18N: Record<FilterId, string> = {
  all: 'adminSettings.botExclusionsFilterAll',
  excluded: 'adminSettings.botExclusionsFilterExcluded',
  groups: 'adminSettings.botExclusionsFilterGroups',
  contacts: 'adminSettings.botExclusionsFilterContacts',
};

export function AdminBotExclusionsCard() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [linked, setLinked] = useState<boolean | null>(null);
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'error' | 'ok'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [rows, setRows] = useState<ExclusionRow[]>([]);
  const [filter, setFilter] = useState<FilterId>('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const loadRows = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);
    const linkRes = await fetchWhatsappLinkStatus();
    if (!linkRes.ok) {
      setLinked(false);
      setLoadState('error');
      setLoadError(adminInboxErrorMessage(linkRes, t, 'adminSettings.botExclusionsEmpty'));
      return;
    }
    setLinked(linkRes.data.linked === true);
    if (!linkRes.data.linked) {
      setRows([]);
      setLoadState('ok');
      return;
    }
    const res = await fetchInboxConversations('whatsapp');
    if (!res.ok) {
      setLoadState('error');
      setLoadError(adminInboxErrorMessage(res, t, 'adminCanales.whatsappLoadError'));
      return;
    }
    const mapped = res.data
      .map((c) => mapDtoToRow(c, t))
      .filter((r): r is ExclusionRow => r != null)
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
    setRows(mapped);
    setLoadState('ok');
  }, [t]);

  useEffect(() => {
    void loadRows();
  }, [loadRows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === 'excluded' && !isExcluded(row.autoReplyMode)) return false;
      if (filter === 'groups' && !row.isGroup) return false;
      if (filter === 'contacts' && row.isGroup) return false;
      if (!q) return true;
      const hay = `${row.name} ${row.subtitle ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [rows, filter, search]);

  const excludedCount = useMemo(
    () => rows.filter((r) => isExcluded(r.autoReplyMode)).length,
    [rows],
  );

  const handleToggle = useCallback(
    async (row: ExclusionRow, allowAutoReply: boolean) => {
      const nextMode: InboxConversationAutoReplyMode = allowAutoReply ? 'inherit' : 'off';
      if (nextMode === row.autoReplyMode) return;
      setBusyId(row.id);
      try {
        const res = await patchInboxConversationAutoReply(row.id, nextMode);
        if (!res.ok) return;
        const mode = res.data.autoReplyMode ?? nextMode;
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  autoReplyMode: mode,
                  autoReplyActive: res.data.autoReplyActive ?? r.autoReplyActive,
                }
              : r,
          ),
        );
      } finally {
        setBusyId(null);
      }
    },
    [],
  );

  const excludeAllGroups = useCallback(async () => {
    const groups = rows.filter((r) => r.isGroup && !isExcluded(r.autoReplyMode));
    if (groups.length === 0) return;
    setBulkBusy(true);
    try {
      for (const row of groups) {
        const res = await patchInboxConversationAutoReply(row.id, 'off');
        if (!res.ok) continue;
        const mode = res.data.autoReplyMode ?? 'off';
        setRows((prev) =>
          prev.map((r) =>
            r.id === row.id
              ? {
                  ...r,
                  autoReplyMode: mode,
                  autoReplyActive: res.data.autoReplyActive ?? false,
                }
              : r,
          ),
        );
      }
    } finally {
      setBulkBusy(false);
    }
  }, [rows]);

  return (
    <SettingsCollapsibleCard
      id="bot-exclusions"
      icon={MessageCircleOff}
      title={t('adminSettings.botExclusionsTitle')}
      description={t('adminSettings.botExclusionsSubtitle')}
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0"
          disabled={loadState === 'loading' || linked !== true}
          onClick={() => void loadRows()}
        >
          {loadState === 'loading' ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <RefreshCw className="size-4" aria-hidden />
          )}
        </Button>
      }
    >
      {linked === false && (
        <p className="text-sm text-muted-foreground">
          {t('adminSettings.botExclusionsNotLinked')}{' '}
          <Link
            href={`${path('/app/admin/settings')}#whatsapp`}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            {t('adminSettings.botExclusionsLinkWhatsapp')}
          </Link>
        </p>
      )}

      {linked === true && (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {t('adminSettings.botExclusionsSummary', {
                total: rows.length,
                excluded: excludedCount,
              })}
            </p>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={bulkBusy || rows.every((r) => !r.isGroup || isExcluded(r.autoReplyMode))}
              onClick={() => void excludeAllGroups()}
            >
              {bulkBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Users className="size-4" aria-hidden />
              )}
              <span className="ml-2">{t('adminSettings.botExclusionsExcludeAllGroups')}</span>
            </Button>
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('adminSettings.botExclusionsSearch')}
                className="h-8 pl-9 text-sm"
                aria-label={t('adminSettings.botExclusionsSearch')}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(FILTER_I18N) as FilterId[]).map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className={cn(
                    'rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
                    filter === id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent',
                  )}
                >
                  {t(FILTER_I18N[id])}
                </button>
              ))}
            </div>
          </div>

          {loadState === 'error' && loadError && (
            <p className="mt-2 text-sm text-destructive" role="alert">
              {loadError}
            </p>
          )}

          {loadState === 'loading' && rows.length === 0 && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t('adminSettings.botExclusionsLoading')}
            </div>
          )}

          {loadState === 'ok' && linked && rows.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('adminSettings.botExclusionsEmpty')}
            </p>
          )}

          {filteredRows.length > 0 && (
            <ul className="mt-2 max-h-[min(16rem,40vh)] divide-y divide-border overflow-y-auto rounded-lg border border-border">
              {filteredRows.map((row) => {
                const allowed = !isExcluded(row.autoReplyMode);
                const rowBusy = busyId === row.id;
                return (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 px-3 py-2"
                  >
                    <InboxContactAvatar
                      name={row.name}
                      initials={row.initials}
                      size="sm"
                      channel="whatsapp"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                      {row.subtitle && (
                        <p className="truncate text-xs text-muted-foreground">{row.subtitle}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {rowBusy ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />
                      ) : null}
                      <Switch
                        checked={allowed}
                        disabled={rowBusy || bulkBusy}
                        onCheckedChange={(checked) => void handleToggle(row, checked)}
                        aria-label={t('adminSettings.botExclusionsToggleAria', { name: row.name })}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {loadState === 'ok' && rows.length > 0 && filteredRows.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t('adminSettings.botExclusionsNoMatches')}
            </p>
          )}

          <p className="mt-2 text-xs text-muted-foreground">{t('adminSettings.botExclusionsHint')}</p>
        </>
      )}
    </SettingsCollapsibleCard>
  );
}
