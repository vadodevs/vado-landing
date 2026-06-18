import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ADMIN_FILTER_CONTROL_CLASS } from '@/lib/adminFilterUi';
import { cn } from '@/lib/utils';

export type AdminSelectOption = { value: string; label: string };

export type AdminSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: AdminSelectOption[];
  id?: string;
  'aria-label'?: string;
  
  triggerClassName?: string;
  
  contentMatchTriggerWidth?: boolean;
  
  contentClassName?: string;
};


export function AdminSelect({
  value,
  onValueChange,
  options,
  id,
  'aria-label': ariaLabel,
  triggerClassName,
  contentMatchTriggerWidth = true,
  contentClassName,
}: AdminSelectProps) {
  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? options[0]?.label ?? '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id={id}
          type="button"
          className={cn(
            ADMIN_FILTER_CONTROL_CLASS,
            'inline-flex min-h-0 max-w-full min-w-0 items-center justify-between gap-2 px-2.5 text-left data-[state=open]:bg-muted/40 data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background',
            triggerClassName,
          )}
          aria-label={ariaLabel}
        >
          <span className="min-w-0 flex-1 truncate">{label}</span>
          <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        collisionPadding={8}
        className={cn(
          contentMatchTriggerWidth && 'min-w-[var(--radix-dropdown-menu-trigger-width)]',
          contentClassName,
        )}
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value === '' ? '__all' : opt.value}
            className={cn(
              'cursor-pointer rounded-lg px-2.5 py-2 text-[12px]',
              opt.value === value && 'bg-accent font-medium text-accent-foreground',
            )}
            onSelect={() => onValueChange(opt.value)}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
