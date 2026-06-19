import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ADMIN_PAGE_SIZE } from '@/lib/adminPagination';
import { cn } from '@/lib/utils';

type AdminTablePaginationProps = {
  page: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  
  nounPlural: string;
  className?: string;
};

export function AdminTablePagination({
  page,
  totalItems,
  pageSize = ADMIN_PAGE_SIZE,
  onPageChange,
  nounPlural,
  className,
}: AdminTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = totalItems === 0 ? 0 : Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={cn(
        'flex flex-col gap-2 border-t border-zinc-100 px-5 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p>
        Mostrando <strong>{start}</strong>–<strong>{end}</strong> de <strong>{totalItems}</strong>{' '}
        {nounPlural}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={safePage <= 1 || totalItems === 0}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </Button>
        <span className="tabular-nums text-xs text-zinc-500 dark:text-zinc-500">
          Página {safePage} de {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8"
          disabled={safePage >= totalPages || totalItems === 0}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
