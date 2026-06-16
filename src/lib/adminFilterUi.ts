/** Inputs de filtros: radio generoso y tokens de tema (.app-dark / .dark). */
export const ADMIN_FILTER_CONTROL_CLASS =
  'rounded-2xl border border-border bg-background text-[12px] text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

/** Etiqueta «Filtros rápidos» y similares. */
export const ADMIN_FILTER_BADGE_CLASS =
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xl bg-muted/60 px-2 py-1 text-[10px] font-semibold tracking-[0.06em] text-muted-foreground uppercase dark:bg-muted/40';

/** Botón «Favoritos» en la barra de filtros (rojo, activo = relleno). */
export const ADMIN_FAVORITES_TOOLBAR_BUTTON_INACTIVE =
  'h-8 shrink-0 gap-1.5 border-2 border-rose-500 bg-transparent px-2.5 text-[11px] font-semibold text-rose-600 shadow-sm transition-colors hover:bg-rose-50 hover:border-rose-600 dark:border-rose-400/70 dark:text-rose-400 dark:hover:bg-rose-950/45 dark:hover:border-rose-400';

export const ADMIN_FAVORITES_TOOLBAR_BUTTON_ACTIVE =
  'h-8 shrink-0 gap-1.5 border-2 border-rose-600 bg-rose-600 px-2.5 text-[11px] font-semibold text-white shadow-md transition-colors hover:bg-rose-700 hover:border-rose-700 dark:border-rose-500 dark:bg-rose-600 dark:hover:bg-rose-500';

/** Botón corazón en fila: mismo aspecto en ambos estados; solo cambia el relleno del icono. */
export const ADMIN_FAVORITE_ROW_HEART_BUTTON_CLASS =
  'text-muted-foreground hover:bg-muted/50 hover:text-foreground dark:hover:bg-muted/40';

export const ADMIN_FAVORITE_ROW_HEART_ICON_CLASS = (active: boolean) =>
  active
    ? 'size-3.5 fill-rose-600 text-rose-600 dark:fill-rose-400 dark:text-rose-400'
    : 'size-3.5';

/** Pills de filtros rápidos (Company, Evolve, etc.). */
export const ADMIN_FILTER_PILL_CLASS =
  'h-9 shrink-0 !rounded-xl !border-border/70 !bg-muted/30 px-3 text-[12px] font-medium !shadow-none hover:!bg-muted/50 dark:!bg-muted/20';

/** Toggle lista / grid en barra de filtros. */
export const ADMIN_FILTER_VIEW_TOGGLE_CLASS =
  'flex items-center gap-0.5 rounded-xl border border-border/70 bg-muted/30 p-0.5 dark:bg-muted/20';
