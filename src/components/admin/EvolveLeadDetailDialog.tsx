import type { ReactNode } from 'react';
import {
  Building2,
  Calendar,
  Copy,
  ExternalLink,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { EvolveLeadRow } from '@/lib/adminEvolveLeadsApi';
import { cn } from '@/lib/utils';

type Props = {
  lead: EvolveLeadRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calificacionBadgeClass: (calificacion: string) => string;
  onCopyEmail: (email: string) => void;
  copiedEmail: string | null;
  /** Optional block under the header (e.g. pipeline estimated amount). */
  headerExtra?: ReactNode;
};

function DetailField({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border border-border bg-muted/25 p-2.5', className)}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">{value || '—'}</p>
    </div>
  );
}

export function EvolveLeadDetailDialog({
  lead,
  open,
  onOpenChange,
  calificacionBadgeClass,
  onCopyEmail,
  copiedEmail,
  headerExtra,
}: Props) {
  const { t } = useTranslation();
  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        useAppDark
        showCloseButton
        className="flex max-h-[min(92svh,880px)] min-h-0 flex-col gap-0 overflow-hidden !p-0 sm:!max-w-2xl"
      >
        <DialogHeader className="shrink-0 space-y-2 px-4 pt-4 pr-12 text-left sm:px-5 sm:pt-5">
          <div className="flex flex-wrap items-start gap-2">
            <DialogTitle className="text-lg leading-tight">{lead.nombre}</DialogTitle>
            <Badge
              variant="secondary"
              className={cn('text-[10px] font-medium', calificacionBadgeClass(lead.calificacion))}
            >
              {lead.calificacion}
            </Badge>
          </div>
          <DialogDescription className="line-clamp-2">{lead.empresa}</DialogDescription>
        </DialogHeader>
        {headerExtra}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-3 sm:px-5 sm:pb-5">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5 sm:col-span-2">
              <Mail className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground">{t('adminLeads.evolveColContacto')}</p>
                <p className="truncate text-sm font-medium text-foreground" title={lead.email}>
                  {lead.email}
                </p>
                {lead.email !== '—' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1.5 h-7 gap-1 px-2 text-[11px]"
                    onClick={() => onCopyEmail(lead.email)}
                  >
                    <Copy className="size-3" aria-hidden />
                    {copiedEmail === lead.email
                      ? t('adminLeads.evolveEmailCopied')
                      : t('adminLeads.evolveCopyEmail')}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5">
              <Phone className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">{t('adminLeads.evolveDetailPhone')}</p>
                <p className="text-sm font-medium text-foreground">{lead.telefono}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 p-2.5">
              <Building2 className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground">{t('adminLeads.evolveColEmpresa')}</p>
                <p className="text-sm font-medium text-foreground">{lead.empresa}</p>
              </div>
            </div>

            <DetailField label={t('adminLeads.evolveColFuente')} value={lead.fuente} />
            <DetailField label={t('adminLeads.evolveColUrgencia')} value={lead.urgencia} />
            <DetailField label={t('adminLeads.evolveColEtapa')} value={lead.etapaNegocio} />
            <DetailField label={t('adminLeads.evolveDetailClaridad')} value={lead.claridad} />
            <DetailField label={t('adminLeads.evolveColAnuncio')} value={lead.anuncio} />
            <DetailField
              label={t('adminLeads.evolveColPipeline')}
              value={lead.pipelineStatus}
              className="capitalize"
            />
            <DetailField label={t('adminLeads.evolveColFecha')} value={lead.fechaAlta} />

            <div className="rounded-lg border border-border bg-muted/25 p-2.5 sm:col-span-2">
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {t('adminLeads.evolveColCita')}
                </p>
              </div>
              {lead.meetingLink ? (
                <div className="mt-2 space-y-1">
                  {lead.meetingTitle ? (
                    <p className="text-sm font-medium text-foreground">{lead.meetingTitle}</p>
                  ) : null}
                  {lead.meetingStart ? (
                    <p className="text-xs text-muted-foreground">{lead.meetingStart}</p>
                  ) : null}
                  <Button asChild variant="outline" size="sm" className="mt-1 h-8 gap-1.5">
                    <a href={lead.meetingLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5" aria-hidden />
                      {t('adminLeads.evolveMeetingLink')}
                    </a>
                  </Button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">—</p>
              )}
            </div>

            <div className="rounded-lg border border-dashed border-border/80 bg-muted/10 p-2.5 sm:col-span-2">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Sparkles className="size-3 shrink-0" aria-hidden />
                <span>GHL ID: {lead.id}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
