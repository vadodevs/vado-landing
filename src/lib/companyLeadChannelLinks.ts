import type { CompanyContact } from '@/lib/companyAdminContact';

export function pickCompanyLeadLinkedinUrl(contact: CompanyContact): string | null {
  const url = contact.linkedinUrl?.trim();
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

export function pickCompanyLeadWhatsappUrl(contact: CompanyContact): string | null {
  const phone = contact.telefono?.trim();
  if (!phone || phone === '—') return null;

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;

  return `https://wa.me/${digits}`;
}

/** Extrae teléfono y LinkedIn de una instrucción de «alimentar manualmente». */
export function parseCompanyLeadManualFeed(instruction: string): {
  phone?: string;
  linkedinUrl?: string;
} {
  const text = instruction.trim();
  if (!text) return {};

  const out: { phone?: string; linkedinUrl?: string } = {};

  const linkedinMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s,;)"']+/i,
  );
  if (linkedinMatch?.[0]) {
    const raw = linkedinMatch[0].replace(/[),.;]+$/, '');
    out.linkedinUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  }

  const withoutLinkedin = linkedinMatch
    ? text.replace(linkedinMatch[0], ' ')
    : text;
  const phoneMatch = withoutLinkedin.match(
    /(?:\+?\d[\d\s().-]{6,}\d|\b\d{8,15}\b)/,
  );
  if (phoneMatch?.[0]) {
    const digits = phoneMatch[0].replace(/\D/g, '');
    if (digits.length >= 8 && digits.length <= 15) {
      out.phone = phoneMatch[0].trim().slice(0, 25);
    }
  }

  return out;
}
