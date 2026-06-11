export function leadInitials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return (parts[0]?.slice(0, 2) || '??').toUpperCase();
}

export function calificacionBadgeClass(calificacion: string): string {
  const isNoCalificado = /no calificado/i.test(calificacion);
  const isCalificado = /calificado/i.test(calificacion) && !isNoCalificado;
  if (isNoCalificado) {
    return 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300';
  }
  if (isCalificado) {
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
  }
  return 'bg-muted text-muted-foreground';
}
