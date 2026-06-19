const OPEN_LEAD_ID_KEY = 'vado-company-open-lead-id';
const OPEN_LEAD_TAB_KEY = 'vado-company-open-lead-tab';

export type CompanyLeadOpenTab = 'cuestionario' | 'actividad' | 'notas';

export function requestOpenCompanyLead(contactId: string, tab?: CompanyLeadOpenTab): void {
  if (typeof window === 'undefined' || !contactId.trim()) return;
  sessionStorage.setItem(OPEN_LEAD_ID_KEY, contactId.trim());
  if (tab) sessionStorage.setItem(OPEN_LEAD_TAB_KEY, tab);
  else sessionStorage.removeItem(OPEN_LEAD_TAB_KEY);
}

export function consumeOpenCompanyLeadRequest(): {
  contactId: string;
  tab?: CompanyLeadOpenTab;
} | null {
  if (typeof window === 'undefined') return null;
  const contactId = sessionStorage.getItem(OPEN_LEAD_ID_KEY);
  if (!contactId) return null;
  sessionStorage.removeItem(OPEN_LEAD_ID_KEY);
  const tabRaw = sessionStorage.getItem(OPEN_LEAD_TAB_KEY);
  sessionStorage.removeItem(OPEN_LEAD_TAB_KEY);
  const tab =
    tabRaw === 'cuestionario' || tabRaw === 'actividad' || tabRaw === 'notas' ? tabRaw : undefined;
  return { contactId, tab };
}
