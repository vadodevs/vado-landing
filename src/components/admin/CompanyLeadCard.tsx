import { Copy, Eye, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CompanyContact } from '@/lib/companyAdminContact';
import { COMPANY_LEAD_STATUS_DOT_CLASS, COMPANY_LEAD_STATUS_LABELS } from '@/lib/companyLeadStatus';
import {
  ADMIN_ROW_ACTION_ICON_BUTTON_CLASS,
  adminRowActionHeartIconClass,
} from '@/lib/adminTableActionsUi';
import { cn } from '@/lib/utils';

type Props = {
  lead: CompanyContact;
  initials: string;
  isFavorite: boolean;
  onView: (lead: CompanyContact) => void;
  onToggleFavorite: (id: string) => void;
  onCopyEmail: (email: string) => void;
  copiedEmail: string | null;
  leadEstado: string;
};

export function CompanyLeadCard({
  lead,
  initials,
  isFavorite,
  onView,
  onToggleFavorite,
  onCopyEmail,
  copiedEmail,
  leadEstado,
}: Props) {
  return (
    <article className="relative flex flex-col rounded-xl border border-border/70 bg-card p-3 shadow-sm transition-shadow hover:shadow-md dark:bg-muted/20">
      <div className="absolute top-2 right-2 flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          onClick={() => onToggleFavorite(lead.id)}
        >
          <Heart
            className={adminRowActionHeartIconClass(isFavorite)}
            strokeWidth={1.5}
            aria-hidden
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={ADMIN_ROW_ACTION_ICON_BUTTON_CLASS}
          title="Ver detalle"
          aria-label={`Ver detalle de ${lead.nombre}`}
          onClick={() => onView(lead)}
        >
          <Eye className="size-4" strokeWidth={1.5} aria-hidden />
        </Button>
      </div>

      <div className="flex min-w-0 items-start gap-2.5 pr-12">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xs font-semibold text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200">
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
        <div className="flex items-center gap-1">
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              COMPANY_LEAD_STATUS_DOT_CLASS[leadEstado as keyof typeof COMPANY_LEAD_STATUS_DOT_CLASS],
            )}
            title={COMPANY_LEAD_STATUS_LABELS[leadEstado as keyof typeof COMPANY_LEAD_STATUS_LABELS]}
            aria-hidden
          />
          <Badge variant="secondary" className="text-[10px] font-medium">
            {COMPANY_LEAD_STATUS_LABELS[leadEstado as keyof typeof COMPANY_LEAD_STATUS_LABELS] || leadEstado}
          </Badge>
        </div>
        <span className="inline-block max-w-full truncate rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200">
          {lead.servicio}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
        <p className="flex min-w-0 items-center gap-1.5">
          <span className="truncate" title={lead.correo}>
            {lead.correo}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onCopyEmail(lead.correo)}
            title="Copiar correo"
            aria-label={`Copiar correo de ${lead.nombre}`}
            className="shrink-0"
          >
            <Copy className="size-3" />
          </Button>
        </p>
        {copiedEmail === lead.correo ? (
          <p className="text-xs text-emerald-600 dark:text-emerald-400">Correo copiado</p>
        ) : null}
        <p className="flex items-center gap-1.5">
          <span>{lead.telefono}</span>
        </p>
      </div>

      <div className="mt-3 border-t border-border/50 pt-2.5">
        <span className="truncate text-[10px] text-muted-foreground" title={lead.mensaje}>
          {lead.mensaje.length > 0 ? lead.mensaje.substring(0, 40) + '...' : '(sin mensaje)'}
        </span>
      </div>

      <span className="mt-2 text-[10px] text-muted-foreground">{lead.fechaSolicitud}</span>
    </article>
  );
}
