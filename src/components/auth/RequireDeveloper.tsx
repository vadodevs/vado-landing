import { type ReactNode, useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import { getPreferredLocaleFromBrowser, isLocale } from '@/app/i18n';
import { ADMIN_AUTH_CHANGE_EVENT, isAdminAuthenticated } from '@/lib/adminAuth';
import {
  DEV_AUTH_CHANGE_EVENT,
  isDeveloperAuthenticated,
  logoutDeveloper,
  verifyDeveloperSession,
} from '@/lib/devAuth';
import { isRecruiterAuthenticated, RECRUITER_AUTH_CHANGE_EVENT } from '@/lib/recruiterAuth';

type RequireDeveloperProps = {
  children: ReactNode;
  lang?: string;
};


export function RequireDeveloper({ children, lang }: RequireDeveloperProps) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const locale = lang && isLocale(lang) ? lang : getPreferredLocaleFromBrowser();

  useEffect(() => {
    const sync = () => {
      if (isAdminAuthenticated()) {
        setAllowed(false);
        setChecking(false);
        return;
      }
      if (!isDeveloperAuthenticated()) {
        setAllowed(false);
        setChecking(false);
        return;
      }
      setChecking(true);
      void verifyDeveloperSession()
        .then((ok) => {
          if (!ok) logoutDeveloper();
          setAllowed(ok);
        })
        .finally(() => setChecking(false));
    };
    sync();
    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
    window.addEventListener(DEV_AUTH_CHANGE_EVENT, sync);
    window.addEventListener(RECRUITER_AUTH_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
      window.removeEventListener(DEV_AUTH_CHANGE_EVENT, sync);
      window.removeEventListener(RECRUITER_AUTH_CHANGE_EVENT, sync);
    };
  }, []);

  if (checking) return null;
  if (isRecruiterAuthenticated()) return <Redirect to={`/${locale}/app/recruiter`} />;
  if (isAdminAuthenticated()) return <Redirect to={`/${locale}/app/admin/desarrolladores`} />;
  if (!allowed) return <Redirect to={`/${locale}/login?next=dev`} />;
  return <>{children}</>;
}
