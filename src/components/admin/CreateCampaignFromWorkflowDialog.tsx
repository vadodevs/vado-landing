import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Mail, MessageCircle, Instagram } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ADMIN_FIELD_INPUT_CLASS, ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi'
import { fetchAutoLeadRuns } from '@/lib/autoLeadsApi'
import {
  AUTO_LEADS_MOCK_RUNS,
  type AutoLeadRun,
  type AutoLeadRunStatus,
} from '@/lib/autoLeadsMock'
import { createCampaign } from '@/lib/campaignsApi'
import {
  addCampaign,
  audienceFromAutoLeadRun,
  createCampaignId,
  type Campaign,
  type CampaignAudienceLead,
  type CampaignChannel,
} from '@/lib/campaignsMock'
import { cn } from '@/lib/utils'

type WizardStep = 1 | 2 | 3

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (campaign: Campaign) => void
}

const CHANNELS: { id: CampaignChannel; icon: typeof Mail }[] = [
  { id: 'email', icon: Mail },
  { id: 'whatsapp', icon: MessageCircle },
  { id: 'instagram', icon: Instagram },
]

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

export function CreateCampaignFromWorkflowDialog({ open, onOpenChange, onCreated }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<WizardStep>(1)
  const [runs, setRuns] = useState<AutoLeadRun[]>([])
  const [usingDemoRuns, setUsingDemoRuns] = useState(false)
  const [loadingRuns, setLoadingRuns] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null)
  const [channel, setChannel] = useState<CampaignChannel>('email')
  const [name, setName] = useState('')

  useEffect(() => {
    if (!open) return
    setStep(1)
    setSelectedRunId(null)
    setChannel('email')
    setName('')
    setCreating(false)
    setLoadingRuns(true)
    void fetchAutoLeadRuns()
      .then((data) => {
        if (data && data.runs.length > 0) {
          setRuns(data.runs)
          setUsingDemoRuns(false)
          return
        }
        setRuns(AUTO_LEADS_MOCK_RUNS)
        setUsingDemoRuns(true)
      })
      .catch(() => {
        setRuns(AUTO_LEADS_MOCK_RUNS)
        setUsingDemoRuns(true)
      })
      .finally(() => setLoadingRuns(false))
  }, [open])

  const selectedRun = useMemo(
    () => runs.find((r) => r.id === selectedRunId) ?? null,
    [runs, selectedRunId],
  )

  const audience = useMemo((): CampaignAudienceLead[] => {
    if (!selectedRun) return []
    return audienceFromAutoLeadRun(selectedRun)
  }, [selectedRun])

  const canGoNext =
    (step === 1 && selectedRunId !== null) ||
    (step === 2 && audience.length > 0) ||
    (step === 3 && name.trim().length > 0 && !creating)

  const handleCreate = async () => {
    if (!selectedRun || !name.trim() || creating) return
    setCreating(true)
    try {
      if (!usingDemoRuns) {
        const created = await createCampaign({
          name: name.trim(),
          autoLeadRunId: selectedRun.id,
          channel,
          status: 'draft',
        })
        if (created) {
          onCreated(created)
          onOpenChange(false)
          toast.success(t('campaigns.wizardCreateSuccess'))
          return
        }
        toast.error(t('campaigns.wizardCreateError'))
        return
      }

      const today = new Date().toISOString().slice(0, 10)
      const local: Campaign = {
        id: createCampaignId(),
        name: name.trim(),
        status: 'draft',
        createdAt: today,
        contacts: audience.length,
        opens: 0,
        clicks: 0,
        replies: 0,
        autoLeadRunId: selectedRun.id,
        autoLeadRunName: selectedRun.name,
        channel,
        metricsByDay: [],
      }
      addCampaign(local)
      onCreated(local)
      onOpenChange(false)
      toast.success(t('campaigns.wizardCreateLocalSuccess'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border/60 px-5 py-4">
          <DialogTitle>{t('campaigns.wizardTitle')}</DialogTitle>
          <p className="text-xs text-muted-foreground">{t('campaigns.wizardSubtitle')}</p>
          <ol className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium">
            {([1, 2, 3] as const).map((n) => (
              <li key={n} className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex size-5 items-center justify-center rounded-full text-[10px]',
                    step === n
                      ? 'bg-[#0b2a55] text-white dark:bg-sky-700'
                      : step > n
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {step > n ? <Check className="size-3" aria-hidden /> : n}
                </span>
                <span className={cn(step === n ? 'text-foreground' : 'text-muted-foreground')}>
                  {t(`campaigns.wizardStep${n}`)}
                </span>
                {n < 3 ? <span className="text-muted-foreground/50" aria-hidden>·</span> : null}
              </li>
            ))}
          </ol>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === 1 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('campaigns.wizardStep1Hint')}</p>
              {usingDemoRuns && !loadingRuns ? (
                <p className="rounded-md border border-dashed border-border/70 bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
                  {t('campaigns.wizardDemoRunsNote')}
                </p>
              ) : null}
              {loadingRuns ? (
                <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {t('campaigns.wizardLoadingRuns')}
                </div>
              ) : runs.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/70 px-3 py-8 text-center text-sm text-muted-foreground">
                  {t('campaigns.wizardNoRuns')}
                </p>
              ) : (
                <div className="grid gap-2">
                  {runs.map((run) => {
                    const contactCount = run.contacts.filter((c) => !c.archivedAt).length
                    const selected = selectedRunId === run.id
                    return (
                      <button
                        key={run.id}
                        type="button"
                        onClick={() => setSelectedRunId(run.id)}
                        className={cn(
                          'flex w-full items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                          selected
                            ? 'border-[#0b2a55]/50 bg-[#0b2a55]/5 dark:border-sky-500/50 dark:bg-sky-950/40'
                            : 'border-border/60 hover:bg-muted/40',
                        )}
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">{run.name}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                            {run.icpLabel}
                          </span>
                          <span
                            className={cn(
                              'mt-1.5 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold',
                              runStatusClass(run.status),
                            )}
                          >
                            {t(`campaigns.runStatus.${run.status}`)}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold',
                            selected
                              ? 'bg-[#0b2a55] text-white dark:bg-sky-700'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {contactCount}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}

          {step === 2 && selectedRun ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t('campaigns.wizardStep2Hint', { run: selectedRun.name })}
              </p>
              {audience.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border/70 px-3 py-8 text-center text-sm text-muted-foreground">
                  {t('campaigns.wizardEmptyAudience')}
                </p>
              ) : (
                <ul className="divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60">
                  {audience.map((lead) => (
                    <li key={lead.id} className="flex items-start gap-3 px-3 py-2.5">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-muted-foreground">
                        {lead.nombre
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((p) => p[0]?.toUpperCase() ?? '')
                          .join('')}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {lead.nombre}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {lead.empresa}
                          {lead.email !== '—' ? ` · ${lead.email}` : ''}
                          {lead.phone ? ` · ${lead.phone}` : ''}
                        </span>
                      </span>
                      {lead.status ? (
                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                          {t(`adminAutoLeads.contactStatus.${lead.status}`, {
                            defaultValue: lead.status,
                          })}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs font-medium text-muted-foreground">
                {t('campaigns.wizardAudienceCount', { count: audience.length })}
              </p>
            </div>
          ) : null}

          {step === 3 && selectedRun ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('campaigns.wizardStep3Hint')}</p>
              <div className="space-y-1.5">
                <label htmlFor="campaign-name" className="text-xs font-semibold text-foreground">
                  {t('campaigns.wizardNameLabel')}
                </label>
                <Input
                  id="campaign-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('campaigns.wizardNamePlaceholder', { run: selectedRun.name })}
                  className={ADMIN_FIELD_INPUT_CLASS}
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-foreground">{t('campaigns.wizardChannelLabel')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {CHANNELS.map(({ id, icon: Icon }) => {
                    const selected = channel === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setChannel(id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center transition-colors',
                          selected
                            ? 'border-[#0b2a55]/50 bg-[#0b2a55]/5 dark:border-sky-500/50 dark:bg-sky-950/40'
                            : 'border-border/60 hover:bg-muted/40',
                        )}
                      >
                        <Icon className="size-4 text-muted-foreground" aria-hidden />
                        <span className="text-[11px] font-medium">{t(`campaigns.channel.${id}`)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 text-xs text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">{t('campaigns.wizardSummaryWorkflow')}:</span>{' '}
                  {selectedRun.name}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-foreground">{t('campaigns.wizardSummaryAudience')}:</span>{' '}
                  {t('campaigns.wizardAudienceCount', { count: audience.length })}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-foreground">{t('campaigns.wizardSummaryChannel')}:</span>{' '}
                  {t(`campaigns.channel.${channel}`)}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border/60 px-5 py-3 sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={creating}
            onClick={() => {
              if (step === 1) onOpenChange(false)
              else setStep((s) => (s - 1) as WizardStep)
            }}
          >
            {step === 1 ? t('campaigns.wizardCancel') : t('campaigns.wizardBack')}
          </Button>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                type="button"
                size="sm"
                className={ADMIN_PRIMARY_BTN_CLASS}
                disabled={!canGoNext}
                onClick={() => {
                  if (step === 1 && selectedRun) {
                    if (!name.trim()) {
                      setName(t('campaigns.wizardDefaultName', { run: selectedRun.name }))
                    }
                    setStep(2)
                    return
                  }
                  setStep(3)
                }}
              >
                {t('campaigns.wizardNext')}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                className={ADMIN_PRIMARY_BTN_CLASS}
                disabled={!canGoNext}
                onClick={() => void handleCreate()}
              >
                {creating ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    {t('campaigns.wizardCreating')}
                  </>
                ) : (
                  t('campaigns.wizardCreate')
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
