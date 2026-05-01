import { type ReactNode, useEffect, useState } from 'react';
import { Redirect } from 'wouter';
import { getPreferredLocaleFromBrowser, isLocale } from '@/app/i18n';
import { ADMIN_AUTH_CHANGE_EVENT, isAdminAuthenticated } from '@/lib/adminAuth';

type RequireNonAdminProps = {
  children: ReactNode;
  lang?: string;
};

/** Impide acceder a rutas dev/company cuando existe sesión admin activa. */
export function RequireNonAdmin({ children, lang }: RequireNonAdminProps) {
  const [isAdmin, setIsAdmin] = useState(() => isAdminAuthenticated());

  useEffect(() => {
    const sync = () => setIsAdmin(isAdminAuthenticated());
    sync();
    window.addEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(ADMIN_AUTH_CHANGE_EVENT, sync);
  }, []);

  const locale = lang && isLocale(lang) ? lang : getPreferredLocaleFromBrowser();

  if (isAdmin) {
    return <Redirect to={`/${locale}/app/admin/desarrolladores`} />;
  }

  return <>{children}</>;
}
