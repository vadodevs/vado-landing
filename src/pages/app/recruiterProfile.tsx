import { useCallback, useEffect, useState } from 'react';
import { Loader2, Mail, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RECRUITER_PANEL_KEYS } from '@/lib/adminRecruitersApi';
import {
  fetchRecruiterProfile,
  getRecruiterAccessToken,
  getRecruiterPermissions,
  RECRUITER_AUTH_CHANGE_EVENT,
} from '@/lib/recruiterAuth';
import { type RecruiterPanelKey, hasRecruiterPanelPermission } from '@/lib/recruiterPanel';

const PANEL_LABEL: Record<RecruiterPanelKey, string> = {
  'panel:developers': 'sidebarDemo.navDevelopers',
  'panel:jobs': 'sidebarDemo.navJobs',
  'panel:projects': 'sidebarDemo.navProjects',
  'panel:companies': 'sidebarDemo.navCompanies',
};

function initials(firstName: string, lastName: string): string {
  const a = firstName.trim()[0] ?? '';
  const b = lastName.trim()[0] ?? '';
  const o = `${a}${b}`.trim();
  return o ? o.toUpperCase() : '?';
}

export default function AppRecruiterProfile() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState<string | null>(null);
  const [permBump, setPermBump] = useState(0);

  const load = useCallback(() => {
    const token = getRecruiterAccessToken();
    if (!token) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    void fetchRecruiterProfile(token)
      .then((p) => {
        if (!p) {
          setError(true);
          return;
        }
        setFirstName(p.firstName);
        setLastName(p.lastName);
        setEmail(p.email);
        setPhone(p.phone);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const b = () => {
      setPermBump((x) => x + 1);
      load();
    };
    window.addEventListener(RECRUITER_AUTH_CHANGE_EVENT, b);
    return () => window.removeEventListener(RECRUITER_AUTH_CHANGE_EVENT, b);
  }, [load]);

  void permBump;
  const recruiterPerms = getRecruiterPermissions();
  const displayName = `${firstName} ${lastName}`.trim() || email;

  return (
    <AppShell
      pathWithoutLang="/app/recruiter/profile"
      title={t('sidebarDemo.navProfile')}
      description={t('seo.appRecruiterProfile')}
    >
      <section className="scroll-mt-24 space-y-6">
        <p className="text-muted-foreground text-sm">{t('recruitersPage.profileIntro')}</p>

        <Card className="max-w-xl">
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary"
              aria-hidden
            >
              {loading ? (
                <Loader2 className="size-6 animate-spin text-primary/80" aria-hidden />
              ) : (
                initials(firstName, lastName)
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="truncate text-xl">{loading ? '—' : displayName}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">{t('recruitersPage.profileLoading')}</p>
            ) : error ? (
              <p className="text-sm text-destructive">{t('recruitersPage.profileLoadError')}</p>
            ) : (
              <>
                <div className="flex items-start gap-2 text-sm">
                  <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="break-all">{email}</span>
                </div>
                {phone ? (
                  <div className="flex items-start gap-2 text-sm">
                    <Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span>{phone}</span>
                  </div>
                ) : null}
              </>
            )}

            {!loading ? (
              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-sm font-medium">{t('recruitersPage.profilePermissionsHeading')}</h3>
                <ul className="flex flex-wrap gap-2">
                  {RECRUITER_PANEL_KEYS.map((key) => {
                    const on = hasRecruiterPanelPermission(recruiterPerms, key);
                    if (!on) return null;
                    return (
                      <li key={key}>
                        <Badge variant="secondary">{t(PANEL_LABEL[key])}</Badge>
                      </li>
                    );
                  })}
                </ul>
                {RECRUITER_PANEL_KEYS.every((k) => !hasRecruiterPanelPermission(recruiterPerms, k)) ? (
                  <p className="text-muted-foreground text-sm">{t('recruitersPage.profileNoPermissions')}</p>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
