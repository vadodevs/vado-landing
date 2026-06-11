import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';
import { RECRUITER_PANEL_KEYS } from '@/lib/adminRecruitersApi';
import { getRecruiterPermissions, logoutRecruiter, RECRUITER_AUTH_CHANGE_EVENT } from '@/lib/recruiterAuth';
import {
  RECRUITER_PANEL_ROUTES,
  type RecruiterPanelKey,
  hasRecruiterPanelPermission,
} from '@/lib/recruiterPanel';
import { cn } from '@/lib/utils';

const PANEL_LABEL_I18N: Record<RecruiterPanelKey, string> = {
  'panel:developers': 'sidebarDemo.navDevelopers',
  'panel:jobs': 'sidebarDemo.navJobs',
  'panel:projects': 'sidebarDemo.navProjects',
  'panel:companies': 'sidebarDemo.navCompanies',
};

const linkCard =
  'block rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent/50';

export default function AppRecruiterHomePage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [permBump, setPermBump] = useState(0);

  useEffect(() => {
    const bump = () => setPermBump((x) => x + 1);
    window.addEventListener(RECRUITER_AUTH_CHANGE_EVENT, bump);
    return () => window.removeEventListener(RECRUITER_AUTH_CHANGE_EVENT, bump);
  }, []);

  void permBump;
  const perms = getRecruiterPermissions();
  const enabledPanels = RECRUITER_PANEL_KEYS.filter((k) => hasRecruiterPanelPermission(perms, k));

  return (
    <AppShell pathWithoutLang="/app/recruiter" title={t('recruitersPage.portalTitle')} description="">
      <section className="scroll-mt-24 space-y-6">
        <p className="text-muted-foreground text-sm">{t('recruitersPage.portalIntro')}</p>

        <div className="space-y-2">
          <h2 className="text-sm font-medium">{t('sidebarDemo.navProfile')}</h2>
          <Link href={path('/app/recruiter/profile')} className={cn(linkCard)}>
            {t('recruitersPage.portalHomeProfileCta')}
          </Link>
        </div>

        {enabledPanels.length > 0 ? (
          <div className="space-y-2">
            <h2 className="text-sm font-medium">{t('recruitersPage.portalShortcutsTitle')}</h2>
            <ul className="flex flex-col gap-2 sm:max-w-md">
              {enabledPanels.map((key) => (
                <li key={key}>
                  <Link href={path(RECRUITER_PANEL_ROUTES[key])} className={cn(linkCard)}>
                    {t(PANEL_LABEL_I18N[key])}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{t('recruitersPage.portalNoPanels')}</p>
        )}

        <div className="space-y-2">
          <h2 className="text-sm font-medium">{t('sidebarDemo.navSettings')}</h2>
          <Link href={path('/app/recruiter/settings')} className={cn(linkCard)}>
            {t('recruitersPage.portalHomeSettingsCta')}
          </Link>
        </div>

        <p className="text-muted-foreground text-xs">{t('recruitersPage.portalPermissionsSyncHint')}</p>

        <Button type="button" variant="outline" onClick={() => logoutRecruiter()}>
          {t('recruitersPage.portalLogout')}
        </Button>
      </section>
    </AppShell>
  );
}
