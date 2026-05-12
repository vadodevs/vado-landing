/**
 * Lightweight placeholder while lazy route chunks load (code-split pages).
 */
export function RoutePageFallback() {
  return (
    <div
      className="bg-background flex min-h-[50vh] items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="text-muted-foreground text-sm font-medium">Loading…</div>
    </div>
  );
}
