import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Toggle / chip active state — primary tokens, like autosales settings. */
export function settingsIconToggleClass(active: boolean) {
  return cn(
    'inline-flex items-center justify-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
    active
      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
      : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
  );
}

export function SettingsSectionCard({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24 flex flex-col gap-0 rounded-xl border border-border bg-card p-3 text-card-foreground shadow-sm',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SettingsSectionHeader({
  icon: Icon,
  iconSlot,
  title,
  badge,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconSlot?: ReactNode;
  title: string;
  badge?: ReactNode;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {iconSlot ??
            (Icon ? (
              <Icon className="size-4 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
            ) : null)}
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {badge}
        </div>
        {description ? (
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function SettingsSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="pt-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground first:pt-0">
      {children}
    </p>
  );
}

/** Compact card that collapses body by default — keeps long settings short on the page. */
export function SettingsCollapsibleCard({
  id,
  icon,
  iconSlot,
  title,
  badge,
  description,
  action,
  defaultOpen = false,
  children,
  className,
}: {
  id?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  iconSlot?: ReactNode;
  title: string;
  badge?: ReactNode;
  description?: string;
  action?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(() => {
    if (defaultOpen) return true;
    if (typeof window === 'undefined' || !id) return false;
    return window.location.hash.replace(/^#/, '') === id;
  });

  return (
    <SettingsSectionCard id={id} className={className}>
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="min-w-0 flex-1 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <SettingsSectionHeader
            icon={icon}
            iconSlot={iconSlot}
            title={title}
            badge={badge}
            description={open ? description : undefined}
            className="mb-0"
          />
        </button>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {action ? (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              {action}
            </div>
          ) : null}
          <button
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Contraer' : 'Expandir'}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown
              className={cn('size-4 transition-transform', open && 'rotate-180')}
              aria-hidden
            />
          </button>
        </div>
      </div>
      {open ? <div className="mt-3 border-t border-border pt-3">{children}</div> : null}
    </SettingsSectionCard>
  );
}
