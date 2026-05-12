import { cn } from '@/lib/utils';

/** Botón icono en fila «Acciones» (alineado con admin desarrolladores). */
export const ADMIN_ROW_ACTION_ICON_BUTTON_CLASS =
  'size-8 shrink-0 text-zinc-400 hover:bg-zinc-200/80 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100';

export const ADMIN_ROW_ACTION_ICON_MUTED_CLASS = 'text-zinc-400 dark:text-zinc-400';

export function adminRowActionHeartIconClass(isFavorite: boolean): string {
  return cn(
    'size-4',
    isFavorite
      ? 'fill-rose-500 text-rose-500 dark:fill-rose-400 dark:text-rose-400'
      : ADMIN_ROW_ACTION_ICON_MUTED_CLASS,
  );
}

/** Cabecera de columna Acciones en tablas admin compactas. */
export const ADMIN_TABLE_ACTIONS_TH_CLASS =
  'px-2 py-1.5 text-center font-semibold uppercase tracking-[0.12em] xl:px-4 xl:py-2';
