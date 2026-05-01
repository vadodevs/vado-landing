import { type ReactNode, useEffect, useState } from 'react';
import { Redirect, useLocation } from 'wouter';
import { getPreferredLocaleFromBrowser, isLocale } from '@/app/i18n';
import { ADMIN_AUTH_CHANGE_EVENT, isAdminAuthenticated } from '@/lib/adminAuth';
import { isRecruiterAuthenticated, RECRUITER_AUTH_CHANGE_EVENT } from '@/lib/recruiterAuth';

type RequireAdminProps = {
  children: ReactNode;
};

export function RequireAdmin({ children }: RequireAdminProps) {
  const [location] = useLocation();
  const [allowed, setAllowed] = useState(() => isAdminAuthenticated());
  const [, setPortalTick] = useState(0);

  useEffect(() => {
    const sync = () => setAllowed(isAdminAuthenticated());
    sync();
    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
    const bump = () => setPortalTick((x) => x + 1);
    window.addEventListener(RECRUITER_AUTH_CHANGE_EVENT, bump);
    return () => {
      window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
      window.removeEventListener(RECRUITER_AUTH_CHANGE_EVENT, bump);
    };
  }, []);

  const segments = location.split('/').filter(Boolean);
  const first = segments[0];
  const lang = first && isLocale(first) ? first : getPreferredLocaleFromBrowser();

  if (isRecruiterAuthenticated()) {
    return <Redirect to={`/${lang}/app/recruiter`} />;
  }

  if (!allowed) {
    return <Redirect to={`/${lang}/login?next=admin`} />;
  }

  return <>{children}</>;
}
