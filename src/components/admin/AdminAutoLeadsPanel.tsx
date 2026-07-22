import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Bot,
  CalendarDays,
  LayoutGrid,
  List,
  Mail,
  MessageCircle,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Download,
  ExternalLink,
  Inbox,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
  ADMIN_FILTER_BADGE_CLASS,
  ADMIN_FILTER_VIEW_TOGGLE_CLASS,
  ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS,
} from '@/lib/adminFilterUi'
import {
  deleteAutoLeadContact,
  deleteAutoLeadRun,
  fetchAutoLeadRuns,
  patchAutoLeadContactArchived,
  patchAutoLeadContactAuto,
  patchAutoLeadRunArchived,
  patchAutoLeadRunStatus,
  patchAutoLeadsSettings,
  promoteAutoLeadToCompany,
  type AutoLeadsOutboundStatus,
  type AutoLeadsSettings,
} from '@/lib/autoLeadsApi'
import {
  formatAutoLeadRelative,
  type AutoLeadChannel,
  type AutoLeadContact,
  type AutoLeadContactStatus,
  type AutoLeadRun,
  type AutoLeadRunStatus,
} from '@/lib/autoLeadsMock'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'

type ViewMode = 'list' | 'cards'
type Scope = 'active' | 'archived'

function runStatusClass(status: AutoLeadRunStatus): string {
  switch (status) {
    case 'active':
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    case 'paused':
      return 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300'
    case 'completed':
      return 'border-border bg-muted/50 text-muted-foreground'
  }
}

function contactStatusClass(status: AutoLeadContactStatus): string {
  switch (status) {
    case 'queued':
      return 'border-border bg-muted/40 text-muted-foreground'
    case 'sent':
      return 'border-sky-500/40 bg-sky-500/10 text-sky-800 dark:text-sky-300'
    case 'replied':
      return 'border-violet-500/40 bg-violet-500/10 text-violet-800 dark:text-violet-300'
    case 'meeting':
      return 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
    case 'no_response':
      return 'border-border bg-muted/50 text-muted-foreground'
    case 'failed':
      return 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300'
  }
}

function ChannelIcon({ channel }: { channel: AutoLeadChannel }) {
  if (channel === 'whatsapp') {
    return <MessageCircle className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
  }
  return <Mail className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
}

function RunStatusIcon({ status }: { status: AutoLeadRunStatus }) {
  if (status === 'active') return <PlayCircle className="size-3.5" aria-hidden />
  if (status === 'paused') return <PauseCircle className="size-3.5" aria-hidden />
  return <CheckCircle2 className="size-3.5" aria-hidden />
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-background/60 px-2.5 py-1.5">
      <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  )
}

function AutoSwitch({
  label,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string
  checked: boolean
  disabled?: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <label
      className="inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <span>{label}</span>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </label>
  )
}

function ActionIconButton({
  label,
  onClick,
  disabled,
  tone = 'muted',
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  tone?: 'muted' | 'danger'
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        'h-8 w-8 shrink-0 rounded-lg p-0',
        tone === 'danger' && 'text-rose-600 hover:bg-rose-500/10 hover:text-rose-700',
      )}
    >
      {children}
    </Button>
  )
}

export function AdminAutoLeadsPanel() {
  const { t } = useTranslation()
  const { locale } = useLocale()
  const [scope, setScope] = useState<Scope>('active')
  const [viewMode, setViewMode] = useState<ViewMode>('cards')
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<AutoLeadContact | null>(null)
  const [runs, setRuns] = useState<AutoLeadRun[]>([])
  const [settings, setSettings] = useState<AutoLeadsSettings>({
    defaultAutoEnabled: true,
    coldEmailLlmEnabled: true,
    coldEmailPromptTemplate: '',
  })
  const [outbound, setOutbound] = useState<AutoLeadsOutboundStatus>({
    gmailConnected: true,
    calendarConnected: true,
    queuedWaiting: 0,
    waitingForGmail: false,
  })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(false)

  const showArchived = scope === 'archived'

  const loadRuns = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setLoading(true)
      setLoadError(false)
      const data = await fetchAutoLeadRuns({ archived: showArchived })
      if (data == null) {
        if (!opts?.silent) setLoadError(true)
        if (!opts?.silent) setRuns([])
      } else {
        setRuns(data.runs)
        setSettings(data.settings)
        setOutbound(data.outbound)
        setSelectedContact((prev) => {
          if (!prev) return prev
          for (const run of data.runs) {
            const updated = run.contacts.find((c) => c.id === prev.id)
            if (updated) return updated
          }
          return null
        })
        setSelectedRunId((prev) => {
          if (!prev) return prev
          return data.runs.some((r) => r.id === prev) ? prev : null
        })
      }
      if (!opts?.silent) setLoading(false)
    },
    [showArchived],
  )

  useEffect(() => {
    setSelectedRunId(null)
    setSelectedContact(null)
    void loadRuns()
  }, [loadRuns])

  useEffect(() => {
    const id = window.setInterval(() => {
      void loadRuns({ silent: true })
    }, 12_000)
    return () => window.clearInterval(id)
  }, [loadRuns])

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId],
  )

  const applyRunUpdate = useCallback((updated: AutoLeadRun) => {
    setRuns((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
  }, [])

  const applyContactUpdate = useCallback((updated: AutoLeadContact) => {
    setRuns((prev) =>
      prev.map((run) => ({
        ...run,
        contacts: run.contacts.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)),
      })),
    )
    setSelectedContact((prev) => (prev?.id === updated.id ? { ...prev, ...updated } : prev))
  }, [])

  const onToggleGlobal = async (next: boolean) => {
    setSaving(true)
    setSaveError(false)
    const result = await patchAutoLeadsSettings({ defaultAutoEnabled: next })
    setSaving(false)
    if (!result) {
      setSaveError(true)
      return
    }
    setSettings(result.settings)
    await loadRuns()
  }

  const onToggleRun = async (runId: string, enabled: boolean) => {
    setSaving(true)
    setSaveError(false)
    const updated = await patchAutoLeadRunStatus(runId, enabled ? 'active' : 'paused')
    setSaving(false)
    if (!updated) {
      setSaveError(true)
      return
    }
    applyRunUpdate(updated)
  }

  const onToggleContact = async (contactId: string, enabled: boolean) => {
    setSaving(true)
    setSaveError(false)
    const updated = await patchAutoLeadContactAuto(contactId, enabled)
    setSaving(false)
    if (!updated) {
      setSaveError(true)
      return
    }
    applyContactUpdate(updated)
  }

  const onArchiveRun = async (runId: string, archived: boolean) => {
    setSaving(true)
    setSaveError(false)
    const updated = await patchAutoLeadRunArchived(runId, archived)
    setSaving(false)
    if (!updated) {
      setSaveError(true)
      return
    }
    if (selectedRunId === runId) setSelectedRunId(null)
    await loadRuns()
  }

  const onDeleteRun = async (runId: string) => {
    if (!window.confirm(t('adminAutoLeads.deleteRunConfirm'))) return
    setSaving(true)
    setSaveError(false)
    const ok = await deleteAutoLeadRun(runId)
    setSaving(false)
    if (!ok) {
      setSaveError(true)
      return
    }
    if (selectedRunId === runId) setSelectedRunId(null)
    await loadRuns()
  }

  const onArchiveContact = async (contactId: string, archived: boolean) => {
    setSaving(true)
    setSaveError(false)
    const updated = await patchAutoLeadContactArchived(contactId, archived)
    setSaving(false)
    if (!updated) {
      setSaveError(true)
      return
    }
    if (selectedContact?.id === contactId) setSelectedContact(null)
    await loadRuns()
  }

  const onDeleteContact = async (contactId: string) => {
    if (!window.confirm(t('adminAutoLeads.deleteContactConfirm'))) return
    setSaving(true)
    setSaveError(false)
    const ok = await deleteAutoLeadContact(contactId)
    setSaving(false)
    if (!ok) {
      setSaveError(true)
      return
    }
    if (selectedContact?.id === contactId) setSelectedContact(null)
    await loadRuns()
  }

  const onPromoteContact = async (contactId: string) => {
    setSaving(true)
    setSaveError(false)
    const result = await promoteAutoLeadToCompany(contactId)
    setSaving(false)
    if (!result) {
      setSaveError(true)
      return
    }
    applyContactUpdate(result.contact)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 pb-12 pt-0 md:pb-16">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300">
            <Bot className="size-4" strokeWidth={1.75} aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">{t('adminAutoLeads.title')}</h2>
              <span className={ADMIN_FILTER_BADGE_CLASS}>{t('adminAutoLeads.liveBadge')}</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{t('adminAutoLeads.subtitle')}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{t('adminAutoLeads.autoGlobalHint')}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AutoSwitch
            label={t('adminAutoLeads.autoGlobalLabel')}
            checked={settings.defaultAutoEnabled}
            disabled={saving || loading}
            onCheckedChange={(next) => void onToggleGlobal(next)}
          />
          {saving ? (
            <span className="text-[11px] text-muted-foreground">{t('adminAutoLeads.autoSaving')}</span>
          ) : null}
          {saveError ? (
            <span className="text-[11px] text-rose-600 dark:text-rose-400">
              {t('adminAutoLeads.autoSaveError')}
            </span>
          ) : null}
          {!selectedRun ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-xl text-[11px] font-semibold"
              disabled={loading}
              onClick={() => void loadRuns()}
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-3.5" aria-hidden />
              )}
              {t('adminAutoLeads.refresh')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 rounded-xl text-[11px] font-semibold"
              onClick={() => {
                setSelectedRunId(null)
                setSelectedContact(null)
              }}
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              {t('adminAutoLeads.backToRuns')}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className={ADMIN_FILTER_VIEW_TOGGLE_CLASS} role="group" aria-label={t('adminAutoLeads.scopeActive')}>
          <Button
            type="button"
            variant={scope === 'active' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-lg px-2.5 text-[11px] font-semibold"
            onClick={() => setScope('active')}
            aria-pressed={scope === 'active'}
          >
            {t('adminAutoLeads.scopeActive')}
          </Button>
          <Button
            type="button"
            variant={scope === 'archived' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 rounded-lg px-2.5 text-[11px] font-semibold"
            onClick={() => setScope('archived')}
            aria-pressed={scope === 'archived'}
          >
            {t('adminAutoLeads.scopeArchived')}
          </Button>
        </div>
        <div
          className={cn(ADMIN_FILTER_VIEW_TOGGLE_CLASS, 'ml-auto')}
          role="group"
          aria-label={t('adminAutoLeads.viewMode')}
        >
          <Button
            type="button"
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 shrink-0 rounded-lg p-0"
            title={t('adminAutoLeads.viewList')}
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 w-8 shrink-0 rounded-lg p-0"
            title={t('adminAutoLeads.viewCards')}
            onClick={() => setViewMode('cards')}
            aria-pressed={viewMode === 'cards'}
          >
            <LayoutGrid className="size-4" />
          </Button>
        </div>
      </div>

      {outbound.waitingForGmail && scope === 'active' ? (
        <div
          role="status"
          className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
        >
          <p className="font-semibold">{t('adminAutoLeads.gmailDisconnectedTitle')}</p>
          <p className="mt-1 text-xs opacity-90">
            {outbound.queuedWaiting > 0
              ? t('adminAutoLeads.gmailDisconnectedBodyQueued', { count: outbound.queuedWaiting })
              : t('adminAutoLeads.gmailDisconnectedBody')}
          </p>
        </div>
      ) : null}

      {loading && runs.length === 0 ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 px-4 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {t('adminAutoLeads.loading')}
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">{t('adminAutoLeads.loadError')}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 h-8 rounded-xl text-[11px] font-semibold"
            onClick={() => void loadRuns()}
          >
            {t('adminAutoLeads.refresh')}
          </Button>
        </div>
      ) : !selectedRun ? (
        runs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">
              {showArchived
                ? t('adminAutoLeads.emptyArchivedTitle')
                : t('adminAutoLeads.emptyTitle')}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {showArchived
                ? t('adminAutoLeads.emptyArchivedBody')
                : t('adminAutoLeads.emptyBody')}
            </p>
          </div>
        ) : (
          <RunsList
            runs={runs}
            locale={locale}
            saving={saving}
            viewMode={viewMode}
            onOpen={(id) => setSelectedRunId(id)}
            onToggleRun={(id, enabled) => void onToggleRun(id, enabled)}
            onArchiveRun={(id, archived) => void onArchiveRun(id, archived)}
            onDeleteRun={(id) => void onDeleteRun(id)}
          />
        )
      ) : (
        <RunDetail
          run={selectedRun}
          saving={saving}
          viewMode={viewMode}
          onOpenContact={(c) => setSelectedContact(c)}
          onToggleRun={(enabled) => void onToggleRun(selectedRun.id, enabled)}
          onToggleContact={(id, enabled) => void onToggleContact(id, enabled)}
          onArchiveRun={(archived) => void onArchiveRun(selectedRun.id, archived)}
          onDeleteRun={() => void onDeleteRun(selectedRun.id)}
          onArchiveContact={(id, archived) => void onArchiveContact(id, archived)}
          onDeleteContact={(id) => void onDeleteContact(id)}
          onPromoteContact={(id) => void onPromoteContact(id)}
        />
      )}

      <ConversationDialog
        contact={selectedContact}
        open={selectedContact != null}
        onOpenChange={(open) => {
          if (!open) setSelectedContact(null)
        }}
        locale={locale}
        saving={saving}
        onToggleContact={(id, enabled) => void onToggleContact(id, enabled)}
        onArchiveContact={(id, archived) => void onArchiveContact(id, archived)}
        onDeleteContact={(id) => void onDeleteContact(id)}
        onPromoteContact={(id) => void onPromoteContact(id)}
      />
    </div>
  )
}

function RunsList({
  runs,
  locale,
  saving,
  viewMode,
  onOpen,
  onToggleRun,
  onArchiveRun,
  onDeleteRun,
}: {
  runs: AutoLeadRun[]
  locale: string
  saving: boolean
  viewMode: ViewMode
  onOpen: (id: string) => void
  onToggleRun: (id: string, enabled: boolean) => void
  onArchiveRun: (id: string, archived: boolean) => void
  onDeleteRun: (id: string) => void
}) {
  const { t } = useTranslation()

  const item = (run: AutoLeadRun) => {
    const isArchived = Boolean(run.archivedAt)
    return (
      <div
        key={run.id}
        className={cn(
          'rounded-2xl border border-border/70 bg-card/40 p-4 text-left shadow-sm transition-colors',
          'hover:border-border hover:bg-muted/30',
          viewMode === 'cards' && 'flex h-full flex-col',
        )}
      >
        <button
          type="button"
          onClick={() => onOpen(run.id)}
          className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground">{run.name}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    'gap-1 rounded-lg text-[10px] font-semibold uppercase',
                    runStatusClass(run.status),
                  )}
                >
                  <RunStatusIcon status={run.status} />
                  {t(`adminAutoLeads.runStatus.${run.status}`)}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">{run.icpLabel}</p>
              <p className="text-[11px] text-muted-foreground">
                {t('adminAutoLeads.lastActivity', {
                  time: formatAutoLeadRelative(run.lastActivityAt, locale),
                })}
              </p>
            </div>
            <span className="text-[11px] font-medium text-sky-700 dark:text-sky-300">
              {t('adminAutoLeads.openRun')} →
            </span>
          </div>
          <div
            className={cn(
              'mt-3 grid gap-2',
              viewMode === 'cards' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-5',
            )}
          >
            <StatPill label={t('adminAutoLeads.statFound')} value={run.stats.found} />
            <StatPill label={t('adminAutoLeads.statQualified')} value={run.stats.qualified} />
            {viewMode === 'list' ? (
              <>
                <StatPill label={t('adminAutoLeads.statContacted')} value={run.stats.contacted} />
                <StatPill label={t('adminAutoLeads.statReplied')} value={run.stats.replied} />
                <StatPill label={t('adminAutoLeads.statMeetings')} value={run.stats.meetings} />
              </>
            ) : (
              <>
                <StatPill label={t('adminAutoLeads.statContacted')} value={run.stats.contacted} />
                <StatPill label={t('adminAutoLeads.statMeetings')} value={run.stats.meetings} />
              </>
            )}
          </div>
        </button>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
          <AutoSwitch
            label={t('adminAutoLeads.autoRunLabel')}
            checked={run.status === 'active'}
            disabled={saving || isArchived}
            onCheckedChange={(next) => onToggleRun(run.id, next)}
          />
          <div className="flex items-center gap-0.5">
            <ActionIconButton
              label={isArchived ? t('adminAutoLeads.unarchive') : t('adminAutoLeads.archive')}
              disabled={saving}
              onClick={() => onArchiveRun(run.id, !isArchived)}
            >
              {isArchived ? (
                <ArchiveRestore className="size-3.5" aria-hidden />
              ) : (
                <Archive className="size-3.5" aria-hidden />
              )}
            </ActionIconButton>
            <ActionIconButton
              label={t('adminAutoLeads.delete')}
              disabled={saving}
              tone="danger"
              onClick={() => onDeleteRun(run.id)}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </ActionIconButton>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'cards') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {runs.map((run) => item(run))}
      </div>
    )
  }

  return <div className="space-y-3">{runs.map((run) => item(run))}</div>
}

function RunDetail({
  run,
  saving,
  viewMode,
  onOpenContact,
  onToggleRun,
  onToggleContact,
  onArchiveRun,
  onDeleteRun,
  onArchiveContact,
  onDeleteContact,
  onPromoteContact,
}: {
  run: AutoLeadRun
  saving: boolean
  viewMode: ViewMode
  onOpenContact: (c: AutoLeadContact) => void
  onToggleRun: (enabled: boolean) => void
  onToggleContact: (id: string, enabled: boolean) => void
  onArchiveRun: (archived: boolean) => void
  onDeleteRun: () => void
  onArchiveContact: (id: string, archived: boolean) => void
  onDeleteContact: (id: string) => void
  onPromoteContact: (id: string) => void
}) {
  const { t } = useTranslation()
  const runArchived = Boolean(run.archivedAt)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card/40 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{run.name}</h3>
              <Badge
                variant="outline"
                className={cn(
                  'gap-1 rounded-lg text-[10px] font-semibold uppercase',
                  runStatusClass(run.status),
                )}
              >
                <RunStatusIcon status={run.status} />
                {t(`adminAutoLeads.runStatus.${run.status}`)}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">{run.icpLabel}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <AutoSwitch
              label={t('adminAutoLeads.autoRunLabel')}
              checked={run.status === 'active'}
              disabled={saving || runArchived}
              onCheckedChange={onToggleRun}
            />
            <ActionIconButton
              label={runArchived ? t('adminAutoLeads.unarchive') : t('adminAutoLeads.archive')}
              disabled={saving}
              onClick={() => onArchiveRun(!runArchived)}
            >
              {runArchived ? (
                <ArchiveRestore className="size-3.5" aria-hidden />
              ) : (
                <Archive className="size-3.5" aria-hidden />
              )}
            </ActionIconButton>
            <ActionIconButton
              label={t('adminAutoLeads.delete')}
              disabled={saving}
              tone="danger"
              onClick={onDeleteRun}
            >
              <Trash2 className="size-3.5" aria-hidden />
            </ActionIconButton>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <StatPill label={t('adminAutoLeads.statFound')} value={run.stats.found} />
          <StatPill label={t('adminAutoLeads.statQualified')} value={run.stats.qualified} />
          <StatPill label={t('adminAutoLeads.statContacted')} value={run.stats.contacted} />
          <StatPill label={t('adminAutoLeads.statReplied')} value={run.stats.replied} />
          <StatPill label={t('adminAutoLeads.statMeetings')} value={run.stats.meetings} />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/70 shadow-sm">
        <div className="border-b border-border/60 bg-muted/30 px-3 py-2">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {t('adminAutoLeads.contactsSection', { count: run.contacts.length })}
          </p>
        </div>

        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2">
            {run.contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                saving={saving}
                onOpen={() => onOpenContact(contact)}
                onToggle={(enabled) => onToggleContact(contact.id, enabled)}
                onArchive={(archived) => onArchiveContact(contact.id, archived)}
                onDelete={() => onDeleteContact(contact.id)}
                onPromote={() => onPromoteContact(contact.id)}
              />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {run.contacts.map((contact) => {
              const contactAuto = contact.autoEnabled !== false
              const contactArchived = Boolean(contact.archivedAt)
              return (
                <li
                  key={contact.id}
                  className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <button
                    type="button"
                    onClick={() => onOpenContact(contact)}
                    className="min-w-0 flex-1 text-left transition-colors hover:opacity-90"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{contact.company}</p>
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded-lg text-[10px] font-semibold uppercase',
                            contactStatusClass(contact.status),
                          )}
                        >
                          {t(`adminAutoLeads.contactStatus.${contact.status}`)}
                        </Badge>
                        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                          <ChannelIcon channel={contact.channel} />
                          {t(`adminAutoLeads.channel.${contact.channel}`)}
                        </span>
                      </div>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {contact.contactName}
                        {contact.email ? ` · ${contact.email}` : null}
                        {contact.phone ? ` · ${contact.phone}` : null}
                      </p>
                      <p className="line-clamp-1 text-[12px] text-foreground/80">{contact.snippet}</p>
                    </div>
                  </button>
                  <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
                    <div className="flex items-center gap-0.5">
                      <AutoSwitch
                        label={t('adminAutoLeads.autoContactLabel')}
                        checked={contactAuto}
                        disabled={saving || contactArchived}
                        onCheckedChange={(next) => onToggleContact(contact.id, next)}
                      />
                      <ActionIconButton
                        label={
                          contact.promotedCompanyLeadId
                            ? t('adminCompany.sendToCompanyLeadsDone')
                            : t('adminCompany.sendToCompanyLeads')
                        }
                        disabled={
                          saving ||
                          Boolean(contact.promotedCompanyLeadId) ||
                          !contact.email?.includes('@')
                        }
                        onClick={() => onPromoteContact(contact.id)}
                      >
                        {contact.promotedCompanyLeadId ? (
                          <CheckCircle2 className="size-3.5" aria-hidden />
                        ) : (
                          <Download className="size-3.5" aria-hidden />
                        )}
                      </ActionIconButton>
                      <ActionIconButton
                        label={
                          contactArchived
                            ? t('adminAutoLeads.unarchive')
                            : t('adminAutoLeads.archive')
                        }
                        disabled={saving}
                        onClick={() => onArchiveContact(contact.id, !contactArchived)}
                      >
                        {contactArchived ? (
                          <ArchiveRestore className="size-3.5" aria-hidden />
                        ) : (
                          <Archive className="size-3.5" aria-hidden />
                        )}
                      </ActionIconButton>
                      <ActionIconButton
                        label={t('adminAutoLeads.delete')}
                        disabled={saving}
                        tone="danger"
                        onClick={() => onDeleteContact(contact.id)}
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </ActionIconButton>
                    </div>
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      ICP {contact.score}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenContact(contact)}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 hover:underline dark:text-sky-300"
                    >
                      <Inbox className="size-3.5" aria-hidden />
                      {t('adminAutoLeads.viewConversation')}
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function ContactCard({
  contact,
  saving,
  onOpen,
  onToggle,
  onArchive,
  onDelete,
  onPromote,
}: {
  contact: AutoLeadContact
  saving: boolean
  onOpen: () => void
  onToggle: (enabled: boolean) => void
  onArchive: (archived: boolean) => void
  onDelete: () => void
  onPromote: () => void
}) {
  const { t } = useTranslation()
  const contactArchived = Boolean(contact.archivedAt)
  const promoted = Boolean(contact.promotedCompanyLeadId)

  return (
    <div className="flex h-full flex-col rounded-xl border border-border/60 bg-background/50 p-3">
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{contact.company}</p>
          <Badge
            variant="outline"
            className={cn(
              'rounded-lg text-[10px] font-semibold uppercase',
              contactStatusClass(contact.status),
            )}
          >
            {t(`adminAutoLeads.contactStatus.${contact.status}`)}
          </Badge>
          {promoted ? (
            <Badge variant="outline" className="rounded-lg text-[10px] font-semibold text-emerald-700">
              {t('adminCompany.sendToCompanyLeadsDone')}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 truncate text-[12px] text-muted-foreground">
          {contact.contactName}
          {contact.email ? ` · ${contact.email}` : null}
        </p>
        <p className="mt-1 line-clamp-2 text-[12px] text-foreground/80">{contact.snippet}</p>
        <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
          <ChannelIcon channel={contact.channel} />
          {t(`adminAutoLeads.channel.${contact.channel}`)}
          <span className="tabular-nums">ICP {contact.score}</span>
        </div>
      </button>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2">
        <AutoSwitch
          label={t('adminAutoLeads.autoContactLabel')}
          checked={contact.autoEnabled !== false}
          disabled={saving || contactArchived}
          onCheckedChange={onToggle}
        />
        <div className="flex items-center gap-0.5">
          <ActionIconButton
            label={
              promoted
                ? t('adminCompany.sendToCompanyLeadsDone')
                : t('adminCompany.sendToCompanyLeads')
            }
            disabled={saving || promoted || !contact.email?.includes('@')}
            onClick={onPromote}
          >
            {promoted ? (
              <CheckCircle2 className="size-3.5" aria-hidden />
            ) : (
              <Download className="size-3.5" aria-hidden />
            )}
          </ActionIconButton>
          <ActionIconButton
            label={contactArchived ? t('adminAutoLeads.unarchive') : t('adminAutoLeads.archive')}
            disabled={saving}
            onClick={() => onArchive(!contactArchived)}
          >
            {contactArchived ? (
              <ArchiveRestore className="size-3.5" aria-hidden />
            ) : (
              <Archive className="size-3.5" aria-hidden />
            )}
          </ActionIconButton>
          <ActionIconButton
            label={t('adminAutoLeads.delete')}
            disabled={saving}
            tone="danger"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" aria-hidden />
          </ActionIconButton>
        </div>
      </div>
    </div>
  )
}

function ConversationDialog({
  contact,
  open,
  onOpenChange,
  locale,
  saving,
  onToggleContact,
  onArchiveContact,
  onDeleteContact,
  onPromoteContact,
}: {
  contact: AutoLeadContact | null
  open: boolean
  onOpenChange: (open: boolean) => void
  locale: string
  saving: boolean
  onToggleContact: (id: string, enabled: boolean) => void
  onArchiveContact: (id: string, archived: boolean) => void
  onDeleteContact: (id: string) => void
  onPromoteContact: (id: string) => void
}) {
  const { t } = useTranslation()
  if (!contact) return null
  const contactArchived = Boolean(contact.archivedAt)
  const promoted = Boolean(contact.promotedCompanyLeadId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="space-y-1 border-b border-border/60 px-4 py-3 text-left">
          <div className="flex flex-wrap items-start justify-between gap-2 pr-6">
            <div className="min-w-0">
              <DialogTitle className="text-base">{contact.company}</DialogTitle>
              <DialogDescription className="text-xs">
                {contact.contactName}
                {' · '}
                {t(`adminAutoLeads.channel.${contact.channel}`)}
                {' · '}
                {t(`adminAutoLeads.contactStatus.${contact.status}`)}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-0.5">
              <AutoSwitch
                label={t('adminAutoLeads.autoContactLabel')}
                checked={contact.autoEnabled !== false}
                disabled={saving || contactArchived}
                onCheckedChange={(next) => onToggleContact(contact.id, next)}
              />
              <ActionIconButton
                label={
                  promoted
                    ? t('adminCompany.sendToCompanyLeadsDone')
                    : t('adminCompany.sendToCompanyLeads')
                }
                disabled={saving || promoted || !contact.email?.includes('@')}
                onClick={() => onPromoteContact(contact.id)}
              >
                {promoted ? (
                  <CheckCircle2 className="size-3.5" aria-hidden />
                ) : (
                  <Download className="size-3.5" aria-hidden />
                )}
              </ActionIconButton>
              <ActionIconButton
                label={contactArchived ? t('adminAutoLeads.unarchive') : t('adminAutoLeads.archive')}
                disabled={saving}
                onClick={() => onArchiveContact(contact.id, !contactArchived)}
              >
                {contactArchived ? (
                  <ArchiveRestore className="size-3.5" aria-hidden />
                ) : (
                  <Archive className="size-3.5" aria-hidden />
                )}
              </ActionIconButton>
              <ActionIconButton
                label={t('adminAutoLeads.delete')}
                disabled={saving}
                tone="danger"
                onClick={() => onDeleteContact(contact.id)}
              >
                <Trash2 className="size-3.5" aria-hidden />
              </ActionIconButton>
            </div>
          </div>
        </DialogHeader>

        {contact.status === 'meeting' && contact.meetingAt ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-emerald-500/10 px-4 py-2 text-[12px] text-emerald-900 dark:text-emerald-200">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            <span>
              {t('adminAutoLeads.meetingBooked', {
                when: new Date(contact.meetingAt).toLocaleString(
                  locale.startsWith('en') ? 'en' : 'es',
                  { dateStyle: 'medium', timeStyle: 'short' },
                ),
              })}
            </span>
            {contact.meetingLink ? (
              <a
                href={contact.meetingLink}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  ADMIN_PRIMARY_TOOLBAR_BUTTON_CLASS,
                  'ml-auto inline-flex h-7 items-center gap-1 no-underline',
                )}
              >
                <ExternalLink className="size-3" aria-hidden />
                Meet
              </a>
            ) : null}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {(contact.messages ?? []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              {contact.status === 'failed'
                ? t('adminAutoLeads.conversationFailed')
                : t('adminAutoLeads.conversationEmpty')}
            </p>
          ) : (
            (contact.messages ?? []).map((msg) => {
              const outbound = msg.direction === 'outbound'
              return (
                <div
                  key={msg.id}
                  className={cn('flex flex-col gap-1', outbound ? 'items-end' : 'items-start')}
                >
                  <div
                    className={cn(
                      'max-w-[90%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
                      outbound
                        ? 'rounded-br-md bg-[#0b2a55] text-white dark:bg-sky-800'
                        : 'rounded-bl-md border border-border/70 bg-muted/40 text-foreground',
                    )}
                  >
                    {msg.body}
                  </div>
                  <span className="px-1 text-[10px] text-muted-foreground">
                    {outbound
                      ? t(`adminAutoLeads.actor.${msg.actor}`)
                      : t('adminAutoLeads.actor.lead')}
                    {' · '}
                    {formatAutoLeadRelative(msg.at, locale)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
