import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, ChevronDown, ChevronRight, Download, Loader2, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  fetchAutoLeadRuns,
  promoteAutoLeadsToCompany,
  type PromoteAutoLeadResult,
} from '@/lib/autoLeadsApi'
import type { AutoLeadContact, AutoLeadRun } from '@/lib/autoLeadsMock'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImported: (companyLeadIds: string[]) => void
}

function contactMatches(c: AutoLeadContact, q: string): boolean {
  if (!q) return true
  const hay = [c.company, c.contactName, c.email, c.phone, c.snippet, c.domain]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return q.split(/\s+/).filter(Boolean).every((token) => hay.includes(token))
}

export function ImportWorkflowLeadsDialog({ open, onOpenChange, onImported }: Props) {
  const { t } = useTranslation()
  const [runs, setRuns] = useState<AutoLeadRun[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState(false)
  const [lastResults, setLastResults] = useState<PromoteAutoLeadResult[] | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(false)
    const data = await fetchAutoLeadRuns({ archived: false })
    setLoading(false)
    if (!data) {
      setLoadError(true)
      setRuns([])
      return
    }
    setRuns(data.runs)
    setExpanded((prev) => {
      const next = { ...prev }
      for (const run of data.runs) {
        if (next[run.id] === undefined) next[run.id] = data.runs.length <= 3
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!open) return
    setSearch('')
    setSelected({})
    setImportError(false)
    setLastResults(null)
    void load()
  }, [open, load])

  const q = search.trim().toLowerCase()

  const filteredRuns = useMemo(() => {
    return runs
      .map((run) => ({
        ...run,
        contacts: run.contacts.filter((c) => contactMatches(c, q)),
      }))
      .filter((run) => {
        if (!q) return true
        const runHay = `${run.name} ${run.icpLabel}`.toLowerCase()
        return run.contacts.length > 0 || runHay.includes(q)
      })
  }, [runs, q])

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected],
  )

  const importableSelected = useMemo(() => {
    const byId = new Map<string, AutoLeadContact>()
    for (const run of runs) {
      for (const c of run.contacts) byId.set(c.id, c)
    }
    return selectedIds.filter((id) => {
      const c = byId.get(id)
      return c && c.email?.includes('@') && !c.promotedCompanyLeadId
    })
  }, [runs, selectedIds])

  const toggleContact = (id: string, next: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: next }))
  }

  const toggleRunContacts = (run: AutoLeadRun, next: boolean) => {
    setSelected((prev) => {
      const out = { ...prev }
      for (const c of run.contacts) {
        if (!c.email?.includes('@')) continue
        out[c.id] = next
      }
      return out
    })
  }

  const onImport = async () => {
    if (importableSelected.length === 0) return
    setImporting(true)
    setImportError(false)
    const results = await promoteAutoLeadsToCompany(importableSelected)
    setImporting(false)
    if (!results) {
      setImportError(true)
      return
    }
    setLastResults(results)
    const okIds = results.filter((r) => r.ok || r.alreadyPromoted).map((r) => r.companyLeadId)
    await load()
    setSelected({})
    if (okIds.length > 0) onImported(okIds)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="space-y-1 border-b border-border/60 px-4 py-3 text-left">
          <DialogTitle>{t('adminCompany.importWorkflowsTitle')}</DialogTitle>
          <DialogDescription>{t('adminCompany.importWorkflowsBody')}</DialogDescription>
        </DialogHeader>

        <div className="border-b border-border/50 px-4 py-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('adminCompany.importWorkflowsSearch')}
              aria-label={t('adminCompany.importWorkflowsSearch')}
              className={cn(
                'h-10 w-full rounded-xl border border-border/70 bg-muted/30 pr-3 pl-10 text-sm',
                'text-foreground outline-none placeholder:text-muted-foreground',
                'focus-visible:ring-2 focus-visible:ring-ring',
              )}
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden />
              {t('adminCompany.importWorkflowsLoading')}
            </div>
          ) : loadError ? (
            <div className="px-2 py-8 text-center text-sm text-muted-foreground">
              <p>{t('adminCompany.importWorkflowsLoadError')}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 h-8 rounded-xl text-[11px]"
                onClick={() => void load()}
              >
                {t('adminCompany.importWorkflowsRetry')}
              </Button>
            </div>
          ) : filteredRuns.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              {t('adminCompany.importWorkflowsEmpty')}
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredRuns.map((run) => {
                const expandedNow = q ? true : expanded[run.id] === true
                const selectable = run.contacts.filter(
                  (c) => c.email?.includes('@') && !c.promotedCompanyLeadId,
                )
                const allSelected =
                  selectable.length > 0 && selectable.every((c) => selected[c.id])
                return (
                  <li
                    key={run.id}
                    className="overflow-hidden rounded-xl border border-border/60 bg-card/40"
                  >
                    <div className="flex items-center gap-2 px-3 py-2">
                      <button
                        type="button"
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted/50"
                        aria-expanded={expandedNow}
                        onClick={() =>
                          setExpanded((prev) => ({ ...prev, [run.id]: !expandedNow }))
                        }
                      >
                        {expandedNow ? (
                          <ChevronDown className="size-4" aria-hidden />
                        ) : (
                          <ChevronRight className="size-4" aria-hidden />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{run.name}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{run.icpLabel}</p>
                      </div>
                      <Badge variant="outline" className="rounded-lg text-[10px] font-semibold">
                        {t('adminCompany.importWorkflowsLeadCount', {
                          count: run.contacts.length,
                        })}
                      </Badge>
                      {selectable.length > 0 ? (
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={(v) => toggleRunContacts(run, v === true)}
                          aria-label={t('adminCompany.importWorkflowsSelectRun')}
                        />
                      ) : null}
                    </div>
                    {expandedNow ? (
                      <ul className="divide-y divide-border/50 border-t border-border/50">
                        {run.contacts.length === 0 ? (
                          <li className="px-3 py-3 text-[12px] text-muted-foreground">
                            {t('adminCompany.importWorkflowsNoContacts')}
                          </li>
                        ) : (
                          run.contacts.map((c) => {
                            const canImport = Boolean(c.email?.includes('@'))
                            const already = Boolean(c.promotedCompanyLeadId)
                            return (
                              <li
                                key={c.id}
                                className="flex items-start gap-2 px-3 py-2.5 sm:items-center"
                              >
                                <Checkbox
                                  checked={Boolean(selected[c.id])}
                                  disabled={!canImport || already || importing}
                                  onCheckedChange={(v) => toggleContact(c.id, v === true)}
                                  aria-label={c.company}
                                  className="mt-0.5 sm:mt-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-foreground">
                                    {c.company}
                                  </p>
                                  <p className="truncate text-[11px] text-muted-foreground">
                                    {c.contactName}
                                    {c.email ? ` · ${c.email}` : ''}
                                  </p>
                                </div>
                                {already ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                                    <Check className="size-3" aria-hidden />
                                    {t('adminCompany.importWorkflowsAlready')}
                                  </span>
                                ) : !canImport ? (
                                  <span className="text-[10px] text-muted-foreground">
                                    {t('adminCompany.importWorkflowsNoEmail')}
                                  </span>
                                ) : (
                                  <span className="text-[10px] tabular-nums text-muted-foreground">
                                    ICP {c.score}
                                  </span>
                                )}
                              </li>
                            )
                          })
                        )}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-[11px] text-muted-foreground">
            {importError ? (
              <span className="text-rose-600 dark:text-rose-400">
                {t('adminCompany.importWorkflowsImportError')}
              </span>
            ) : lastResults ? (
              <span>
                {t('adminCompany.importWorkflowsImportSummary', {
                  created: lastResults.filter((r) => r.created).length,
                  linked: lastResults.filter((r) => r.alreadyPromoted && !r.created).length,
                  failed: lastResults.filter((r) => !r.ok && !r.alreadyPromoted).length,
                })}
              </span>
            ) : (
              <span>
                {t('adminCompany.importWorkflowsSelected', {
                  count: importableSelected.length,
                })}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-xl text-[11px] font-semibold"
              onClick={() => onOpenChange(false)}
            >
              {t('adminCompany.importWorkflowsClose')}
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-1.5 rounded-xl text-[11px] font-semibold"
              disabled={importing || importableSelected.length === 0}
              onClick={() => void onImport()}
            >
              {importing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
              ) : (
                <Download className="size-3.5" aria-hidden />
              )}
              {t('adminCompany.importWorkflowsImport')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
