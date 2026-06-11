import { Eye, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { EvolveLeadRow } from '@/lib/adminEvolveLeadsApi';
import {
  ADMIN_ROW_ACTION_ICON_BUTTON_CLASS,
} from '@/lib/adminTableActionsUi';
import { cn } from '@/lib/utils';

type Props = {
  lead: EvolveLeadRow;
  initials: string;
  calificacionBadgeClass: (calificacion: string) => string;
  onView: (lead: EvolveLeadRow) => void;
};

export function EvolveLeadCard({ lead, initials, calificacionBadgeClass, onView }: Props) {
  const { t } = useTranslation();

  return (
    <article className="relative flex flex-col rounded-xl border border-border/70 bg-card p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-muted/20">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(ADMIN_ROW_ACTION_ICON_BUTTON_CLASS, 'absolute top-2 right-2')}
        title={t('adminLeads.evolveViewDetail')}
        aria-label={t('adminLeads.evolveViewDetailFor', { name: lead.nombre })}
        onClick={() => onView(lead)}
      >
        <Eye className="size-4" strokeWidth={1.5} aria-hidden />
      </Button>

      <div className="flex min-w-0 items-start gap-2.5 pr-9">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-xs font-semibold text-violet-900 dark:bg-violet-950/70 dark:text-violet-200">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground" title={lead.nombre}>
            {lead.nombre}
          </h3>
          <p className="truncate text-xs text-muted-foreground" title={lead.empresa}>
            {lead.empresa}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Badge
          variant="secondary"
          className={cn('text-[10px] font-medium', calificacionBadgeClass(lead.calificacion))}
        >
          {lead.calificacion}
        </Badge>
        <span className="inline-block max-w-full truncate rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium text-sky-800 dark:bg-sky-950/50 dark:text-sky-200">
          {lead.fuente}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <p className="flex min-w-0 items-center gap-1.5">
          <Mail className="size-3 shrink-0" aria-hidden />
          <span className="truncate" title={lead.email}>
            {lead.email}
          </span>
        </p>
        <p className="flex items-center gap-1.5">
          <Phone className="size-3 shrink-0" aria-hidden />
          <span>{lead.telefono}</span>
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-2.5 text-[10px] text-muted-foreground">
        <span className="truncate" title={lead.anuncio}>
          {lead.anuncio}
        </span>
        <span className="shrink-0 tabular-nums">{lead.fechaAlta}</span>
      </div>
    </article>
  );
}
