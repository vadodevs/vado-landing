export type CountrySelectOption = { value: string; label: string };

/** Solo México y Estados Unidos (Lead Engine). Orden: México primero (default habitual). */
export const LEAD_ENGINE_COUNTRY_OPTIONS: CountrySelectOption[] = [
  { value: "MX", label: "México" },
  { value: "US", label: "Estados Unidos" },
];

/** @deprecated Usar LEAD_ENGINE_COUNTRY_OPTIONS; se mantiene por si algo importaba la función. */
export function getLeadEngineCountrySelectOptions(): CountrySelectOption[] {
  return LEAD_ENGINE_COUNTRY_OPTIONS;
}

/** Bandera regional Unicode (p. ej. logs); la UI usa SVG para compatibilidad con Windows. */
export function isoToRegionalFlag(iso: string): string {
  const u = iso.toUpperCase();
  if (!/^[A-Z]{2}$/.test(u)) return "🏳️";
  const base = 0x1f1e6;
  return String.fromCodePoint(base + u.charCodeAt(0) - 65, base + u.charCodeAt(1) - 65);
}
