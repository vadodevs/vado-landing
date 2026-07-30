/** Subset used by hunter-lead-phones (autosales merge helper). */
export function normalizePhonesFromCrawl(raw: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of raw) {
    const t = String(p ?? '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!t) continue;
    const digits = t.replace(/\D/g, '');
    if (digits.length < 10) continue;
    const key = digits.length >= 10 ? digits.slice(-10) : digits;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t.slice(0, 80));
  }
  return out;
}
