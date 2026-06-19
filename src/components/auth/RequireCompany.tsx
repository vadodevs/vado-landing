import { type ReactNode, useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import { getPreferredLocaleFromBrowser, isLocale } from '@/app/i18n';
import { ADMIN_AUTH_CHANGE_EVENT, isAdminAuthenticated } from '@/lib/adminAuth';
import {
  COMPANY_AUTH_CHANGE_EVENT,
  isCompanyAuthenticated,
  logoutCompany,
  verifyCompanySession,
} from '@/lib/companyAuth';
import { isRecruiterAuthenticated, RECRUITER_AUTH_CHANGE_EVENT } from '@/lib/recruiterAuth';

type RequireCompanyProps = {
  children: ReactNode;
  lang?: string;
};


export function RequireCompany({ children, lang }: RequireCompanyProps) {
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
      if (!isCompanyAuthenticated()) {
        setAllowed(false);
        setChecking(false);
        return;
      }
      setChecking(true);
      void verifyCompanySession()
        .then((ok) => {
          if (!ok) logoutCompany();
          setAllowed(ok);
        })
        .finally(() => setChecking(false));
    };
    sync();
    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
    window.addEventListener(COMPANY_AUTH_CHANGE_EVENT, sync);
    window.addEventListener(RECRUITER_AUTH_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
      window.removeEventListener(COMPANY_AUTH_CHANGE_EVENT, sync);
      window.removeEventListener(RECRUITER_AUTH_CHANGE_EVENT, sync);
    };
  }, []);

  if (checking) return null;
  if (isAdminAuthenticated()) return <Redirect to={`/${locale}/app/admin/desarrolladores`} />;
  if (isRecruiterAuthenticated()) return <Redirect to={`/${locale}/app/recruiter`} />;
  if (!allowed) return <Redirect to={`/${locale}/login?next=company`} />;
  return <>{children}</>;
}
