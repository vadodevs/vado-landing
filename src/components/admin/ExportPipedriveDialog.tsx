import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, FileSpreadsheet, Loader2, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
import type { CompanyContact } from '@/lib/companyAdminContact'
import type { CompanyLeadUpdate } from '@/lib/companyLeadUpdates'
import {
  ALL_PIPEDRIVE_EXPORT_ENTITIES,
  DEFAULT_PIPEDRIVE_EXPORT_ENTITIES,
  buildPipedriveCsv,
  downloadPipedriveCsv,
  type PipedriveExportEntity,
} from '@/lib/pipedriveExport'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: CompanyContact[]
  updatesByContactId: Record<string, CompanyLeadUpdate[]>
}

type Step = 'entities' | 'leads'

const ENTITY_OPTIONS: {
  id: PipedriveExportEntity
  labelKey: string
  hintKey: string
  recommended?: boolean
}[] = [
  {
    id: 'persons',
    labelKey: 'adminCompany.pipedriveEntityPersons',
    hintKey: 'adminCompany.pipedriveEntityPersonsHint',
    recommended: true,
  },
  {
    id: 'organizations',
    labelKey: 'adminCompany.pipedriveEntityOrgs',
    hintKey: 'adminCompany.pipedriveEntityOrgsHint',
    recommended: true,
  },
  {
    id: 'leads',
    labelKey: 'adminCompany.pipedriveEntityLeads',
    hintKey: 'adminCompany.pipedriveEntityLeadsHint',
    recommended: true,
  },
  {
    id: 'deals',
    labelKey: 'adminCompany.pipedriveEntityDeals',
    hintKey: 'adminCompany.pipedriveEntityDealsHint',
  },
  {
    id: 'activities',
    labelKey: 'adminCompany.pipedriveEntityActivities',
    hintKey: 'adminCompany.pipedriveEntityActivitiesHint',
  },
  {
    id: 'notes',
    labelKey: 'adminCompany.pipedriveEntityNotes',
    hintKey: 'adminCompany.pipedriveEntityNotesHint',
    recommended: true,
  },
  {
    id: 'products',
    labelKey: 'adminCompany.pipedriveEntityProducts',
    hintKey: 'adminCompany.pipedriveEntityProductsHint',
  },
  {
    id: 'projects',
    labelKey: 'adminCompany.pipedriveEntityProjects',
    hintKey: 'adminCompany.pipedriveEntityProjectsHint',
  },
]

export function ExportPipedriveDialog({
  open,
  onOpenChange,
  contacts,
  updatesByContactId,
}: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<Step>('entities')
  const [selectedEntities, setSelectedEntities] = useState<PipedriveExportEntity[]>(
    DEFAULT_PIPEDRIVE_EXPORT_ENTITIES,
  )
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(() => new Set())
  const [leadSearch, setLeadSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep('entities')
    setSelectedEntities(DEFAULT_PIPEDRIVE_EXPORT_ENTITIES)
    setSelectedLeadIds(new Set(contacts.map((c) => c.id)))
    setLeadSearch('')
    setExporting(false)
  }, [open, contacts])

  const visibleContacts = useMemo(() => {
    const q = leadSearch.trim().toLowerCase()
    if (!q) return contacts
    return contacts.filter((c) => {
      const hay = `${c.nombre} ${c.correo} ${c.empresa} ${c.servicio}`.toLowerCase()
      return hay.includes(q)
    })
  }, [contacts, leadSearch])

  const selectedCount = selectedLeadIds.size
  const allVisibleSelected =
    visibleContacts.length > 0 && visibleContacts.every((c) => selectedLeadIds.has(c.id))
  const someVisibleSelected =
    !allVisibleSelected && visibleContacts.some((c) => selectedLeadIds.has(c.id))

  const canContinue = selectedEntities.length > 0
  const canExport = selectedEntities.length > 0 && selectedCount > 0

  const toggleEntity = (id: PipedriveExportEntity, next: boolean) => {
    setSelectedEntities((prev) => {
      if (next) return prev.includes(id) ? prev : [...prev, id]
      return prev.filter((x) => x !== id)
    })
  }

  const toggleLead = (id: string, next: boolean) => {
    setSelectedLeadIds((prev) => {
      const nextSet = new Set(prev)
      if (next) nextSet.add(id)
      else nextSet.delete(id)
      return nextSet
    })
  }

  const toggleAllVisible = (next: boolean) => {
    setSelectedLeadIds((prev) => {
      const nextSet = new Set(prev)
      for (const c of visibleContacts) {
        if (next) nextSet.add(c.id)
        else nextSet.delete(c.id)
      }
      return nextSet
    })
  }

  const onExport = () => {
    if (!canExport) return
    setExporting(true)
    try {
      const toExport = contacts.filter((c) => selectedLeadIds.has(c.id))
      const csv = buildPipedriveCsv(toExport, {
        entities: selectedEntities,
        updatesByContactId,
      })
      if (!csv) return
      downloadPipedriveCsv(csv)
      onOpenChange(false)
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        useAppDark
        className="flex max-h-[85vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="space-y-1 border-b border-border/60 px-4 py-3 text-left">
          <DialogTitle>{t('adminCompany.pipedriveExportTitle')}</DialogTitle>
          <DialogDescription>
            {step === 'entities'
              ? t('adminCompany.pipedriveStepEntitiesBody')
              : t('adminCompany.pipedriveStepLeadsBody')}
          </DialogDescription>
          <div className="flex items-center gap-2 pt-1">
            <span
              className={cn(
                'text-[10px] font-semibold tracking-wide uppercase',
                step === 'entities' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              1. {t('adminCompany.pipedriveStepEntities')}
            </span>
            <span className="text-muted-foreground" aria-hidden>
              →
            </span>
            <span
              className={cn(
                'text-[10px] font-semibold tracking-wide uppercase',
                step === 'leads' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              2. {t('adminCompany.pipedriveStepLeads')}
            </span>
          </div>
        </DialogHeader>

        {step === 'entities' ? (
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                {t('adminCompany.pipedriveEntitiesSelected', {
                  count: selectedEntities.length,
                  total: ENTITY_OPTIONS.length,
                })}
              </p>
              <button
                type="button"
                className="text-[11px] font-semibold text-foreground hover:underline"
                disabled={exporting}
                onClick={() =>
                  setSelectedEntities(
                    selectedEntities.length === ALL_PIPEDRIVE_EXPORT_ENTITIES.length
                      ? DEFAULT_PIPEDRIVE_EXPORT_ENTITIES
                      : [...ALL_PIPEDRIVE_EXPORT_ENTITIES],
                  )
                }
              >
                {selectedEntities.length === ALL_PIPEDRIVE_EXPORT_ENTITIES.length
                  ? t('adminCompany.pipedriveResetRecommended')
                  : t('adminCompany.pipedriveSelectAllEntities')}
              </button>
            </div>
            <ul className="space-y-2">
              {ENTITY_OPTIONS.map((opt) => {
                const checked = selectedEntities.includes(opt.id)
                return (
                  <li
                    key={opt.id}
                    className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5"
                  >
                    <Checkbox
                      checked={checked}
                      disabled={exporting}
                      onCheckedChange={(v) => toggleEntity(opt.id, v === true)}
                      aria-label={t(opt.labelKey)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {t(opt.labelKey)}
                        {opt.recommended ? (
                          <span className="ml-1.5 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                            {t('adminCompany.pipedriveRecommended')}
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{t(opt.hintKey)}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="text-[11px] text-muted-foreground">
              {t('adminCompany.pipedriveExportHint')}
            </p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[12px] text-muted-foreground">
                {t('adminCompany.pipedriveExportCount', { count: selectedCount })}
              </p>
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder={t('adminCompany.pipedriveLeadSearch')}
                aria-label={t('adminCompany.pipedriveLeadSearch')}
                className={cn(
                  'h-9 w-full rounded-xl border border-border/70 bg-muted/30 pr-3 pl-9 text-sm',
                  'text-foreground outline-none placeholder:text-muted-foreground',
                  'focus-visible:ring-2 focus-visible:ring-ring',
                )}
              />
            </div>

            <div className="flex items-center gap-2 border-b border-border/50 pb-2">
              <Checkbox
                checked={
                  allVisibleSelected ? true : someVisibleSelected ? 'indeterminate' : false
                }
                disabled={visibleContacts.length === 0 || exporting}
                onCheckedChange={(v) => toggleAllVisible(v === true)}
                aria-label={t('adminCompany.pipedriveSelectAll')}
              />
              <button
                type="button"
                className="text-[11px] font-semibold text-foreground hover:underline"
                disabled={visibleContacts.length === 0 || exporting}
                onClick={() => toggleAllVisible(!allVisibleSelected)}
              >
                {allVisibleSelected
                  ? t('adminCompany.pipedriveDeselectAll')
                  : t('adminCompany.pipedriveSelectAll')}
              </button>
              <span className="text-[11px] text-muted-foreground">
                ({visibleContacts.length})
              </span>
            </div>

            <ul className="max-h-[min(50vh,22rem)] space-y-1 overflow-y-auto rounded-xl border border-border/60 p-1.5">
              {visibleContacts.length === 0 ? (
                <li className="px-2 py-6 text-center text-[12px] text-muted-foreground">
                  {t('adminCompany.pipedriveExportEmpty')}
                </li>
              ) : (
                visibleContacts.map((contact) => {
                  const checked = selectedLeadIds.has(contact.id)
                  return (
                    <li key={contact.id}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-1.5',
                          'hover:bg-muted/40',
                          checked && 'bg-muted/30',
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={exporting}
                          onCheckedChange={(v) => toggleLead(contact.id, v === true)}
                          aria-label={contact.nombre}
                          className="mt-0.5"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium text-foreground">
                            {contact.nombre}
                            {contact.empresa && contact.empresa !== '—' ? (
                              <span className="font-normal text-muted-foreground">
                                {' · '}
                                {contact.empresa}
                              </span>
                            ) : null}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {contact.correo}
                          </span>
                        </span>
                      </label>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}

        <DialogFooter className="gap-2 border-t border-border/60 px-4 py-3 sm:justify-between">
          {step === 'entities' ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 rounded-xl text-[11px] font-semibold"
                onClick={() => onOpenChange(false)}
              >
                {t('adminCompany.pipedriveExportCancel')}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 rounded-xl text-[11px] font-semibold"
                disabled={!canContinue}
                onClick={() => setStep('leads')}
              >
                {t('adminCompany.pipedriveNext')}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 rounded-xl text-[11px] font-semibold"
                disabled={exporting}
                onClick={() => setStep('entities')}
              >
                <ArrowLeft className="size-3.5" aria-hidden />
                {t('adminCompany.pipedriveBack')}
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-8 gap-1.5 rounded-xl text-[11px] font-semibold"
                disabled={!canExport || exporting}
                onClick={onExport}
              >
                {exporting ? (
                  <Loader2 className="size-3.5 animate-spin" aria-hidden />
                ) : (
                  <FileSpreadsheet className="size-3.5" aria-hidden />
                )}
                {t('adminCompany.pipedriveExportDownload')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
