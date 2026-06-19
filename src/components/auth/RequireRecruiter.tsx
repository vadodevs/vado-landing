import { type ReactNode, useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import { getPreferredLocaleFromBrowser, isLocale } from '@/app/i18n';
import { ADMIN_AUTH_CHANGE_EVENT, isAdminAuthenticated } from '@/lib/adminAuth';
import {
  RECRUITER_AUTH_CHANGE_EVENT,
  isRecruiterAuthenticated,
  logoutRecruiter,
  verifyRecruiterSession,
} from '@/lib/recruiterAuth';
import { COMPANY_AUTH_CHANGE_EVENT, isCompanyAuthenticated } from '@/lib/companyAuth';
import {
  DEV_AUTH_CHANGE_EVENT,
  isDeveloperAuthenticated,
} from '@/lib/devAuth';

type RequireRecruiterProps = {
  children: ReactNode;
  lang?: string;
};


export function RequireRecruiter({ children, lang }: RequireRecruiterProps) {
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
      if (!isRecruiterAuthenticated()) {
        setAllowed(false);
        setChecking(false);
        return;
      }
      setChecking(true);
      void verifyRecruiterSession()
        .then((ok) => {
          if (!ok) logoutRecruiter();
          setAllowed(ok);
        })
        .finally(() => setChecking(false));
    };
    sync();
    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
    window.addEventListener(RECRUITER_AUTH_CHANGE_EVENT, sync);
    window.addEventListener(DEV_AUTH_CHANGE_EVENT, sync);
    window.addEventListener(COMPANY_AUTH_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
      window.removeEventListener(RECRUITER_AUTH_CHANGE_EVENT, sync);
      window.removeEventListener(DEV_AUTH_CHANGE_EVENT, sync);
      window.removeEventListener(COMPANY_AUTH_CHANGE_EVENT, sync);
    };
  }, []);

  if (checking) return null;
  if (isAdminAuthenticated()) return <Redirect to={`/${locale}/app/admin/desarrolladores`} />;
  if (isDeveloperAuthenticated()) return <Redirect to={`/${locale}/app/dev`} />;
  if (isCompanyAuthenticated()) return <Redirect to={`/${locale}/app/company/profile`} />;
  if (!allowed) return <Redirect to={`/${locale}/login?next=recruiter`} />;
  return <>{children}</>;
}
