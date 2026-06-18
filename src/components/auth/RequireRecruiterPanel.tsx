import { type ReactNode, useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import { getPreferredLocaleFromBrowser, isLocale } from '@/app/i18n';
import { getRecruiterPermissions, RECRUITER_AUTH_CHANGE_EVENT } from '@/lib/recruiterAuth';
import { type RecruiterPanelKey, hasRecruiterPanelPermission } from '@/lib/recruiterPanel';

type RequireRecruiterPanelProps = {
  panel: RecruiterPanelKey;
  children: ReactNode;
  lang?: string;
};


export function RequireRecruiterPanel({ panel, children, lang }: RequireRecruiterPanelProps) {
  const locale = lang && isLocale(lang) ? lang : getPreferredLocaleFromBrowser();
  const [permBump, setPermBump] = useState(0);
  useEffect(() => {
    const bump = () => setPermBump((x) => x + 1);
    window.addEventListener(RECRUITER_AUTH_CHANGE_EVENT, bump);
    return () => window.removeEventListener(RECRUITER_AUTH_CHANGE_EVENT, bump);
  }, []);

  void permBump;
  const perms = getRecruiterPermissions();
  const allowed = hasRecruiterPanelPermission(perms, panel);
  if (!allowed) {
    return <Redirect to={`/${locale}/app/recruiter`} />;
  }
  return <>{children}</>;
}
