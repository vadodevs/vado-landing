import { type FormEvent, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'wouter';
import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { useLocale } from '@/hooks/useLocale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { isAdminAuthConfigured, loginAdmin } from '@/lib/adminAuth';
import { loginCompany } from '@/lib/companyAuth';
import { loginDeveloper } from '@/lib/devAuth';
import { loginRecruiter } from '@/lib/recruiterAuth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const { t } = useTranslation();
  const { path } = useLocale();
  const [, setLocation] = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const next = searchParams.get('next');
  const isAdminLogin = next === 'admin';
  const isCompanyLogin = next === 'company';
  const isRecruiterLogin = next === 'recruiter';

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (isAdminLogin) {
      if (isAdminAuthConfigured()) {
        const admin = await loginAdmin(email, password);
        if (admin.ok) {
          setLocation(path('/app/admin'));
          return;
        }
        if (admin.reason === 'network') {
          setError('No fue posible conectar con la API. Verifica que adminvado esté activo.');
          return;
        }
        setError(t('loginPage.invalidCredentials'));
        return;
      }
      setError('Falta configurar VITE_API_BASE_URL para validar credenciales de admin.');
      return;
    }

    if (isAdminAuthConfigured()) {
      const admin = await loginAdmin(email, password);
      if (admin.ok) {
        setLocation(path('/app/admin'));
        return;
      }
    }

    if (isCompanyLogin) {
      const company = await loginCompany(email, password);
      if (company.ok) {
        setLocation(path('/app/company'));
        return;
      }
      if (company.reason === 'no-config') {
        setError('Falta configurar VITE_API_BASE_URL para validar credenciales de compañía.');
        return;
      }
      if (company.reason === 'network') {
        setError('No fue posible conectar con la API. Verifica que el backend esté activo.');
        return;
      }
      setError(t('loginPage.invalidCredentials'));
      return;
    }

    if (isRecruiterLogin) {
      const recruiter = await loginRecruiter(email, password);
      if (recruiter.ok) {
        setLocation(path('/app/recruiter'));
        return;
      }
      if (recruiter.reason === 'no-config') {
        setError('Falta configurar VITE_API_BASE_URL para validar credenciales de reclutador.');
        return;
      }
      if (recruiter.reason === 'network') {
        setError('No fue posible conectar con la API. Verifica que el backend esté activo.');
        return;
      }
      if (recruiter.reason === 'recruiter-me-unavailable') {
        setError(t('loginPage.recruiterEndpointMissing'));
        return;
      }
      if (recruiter.reason === 'recruiter-record-missing') {
        setError(t('loginPage.recruiterRecordMissing'));
        return;
      }
      setError(t('loginPage.invalidCredentials'));
      return;
    }

    const dev = await loginDeveloper(email, password);
    if (dev.ok) {
      setLocation(path('/app/dev'));
      return;
    }
    if (dev.reason === 'no-config') {
      setError('Falta configurar VITE_API_BASE_URL para validar credenciales del desarrollador.');
      return;
    }
    if (dev.reason === 'network') {
      setError('No fue posible conectar con la API. Verifica que el backend esté activo.');
      return;
    }

    if (isAdminAuthConfigured()) {
      const admin = await loginAdmin(email, password);
      if (admin.ok) {
        setLocation(path('/app/admin'));
        return;
      }
    }
    const company = await loginCompany(email, password);
    if (company.ok) {
      setLocation(path('/app/company'));
      return;
    }
    const recruiter = await loginRecruiter(email, password);
    if (recruiter.ok) {
      setLocation(path('/app/recruiter'));
      return;
    }
    setError(t('loginPage.invalidCredentials'));
  };

  return (
    <>
      <PageMeta
        title={t('nav.login')}
        description={t('seo.login')}
        canonicalPath={path('/login')}
        pathWithoutLang="/login"
      />
      <MainLayout>
        <section className="bg-muted/30 py-16 md:py-24">
          <CenterContainer className="max-w-md">
            <Card className="border-border/80 shadow-md">
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl">{t('loginPage.title')}</CardTitle>
              </CardHeader>
              <form onSubmit={onSubmit}>
                <CardContent className="space-y-4 pb-3">
                  {error ? (
                    <p
                      className={cn(
                        'rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive',
                      )}
                      role="alert"
                    >
                      {error}
                    </p>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t('loginPage.email')}</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('loginPage.password')}</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={1}
                    />
                  </div>
                </CardContent>
                <CardFooter className="mt-2 flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-between">
                  <Button type="submit" className="w-full sm:w-auto">
                    {t('loginPage.submit')}
                  </Button>
                  <Button variant="ghost" asChild className="w-full sm:w-auto">
                    <Link href={path('/contact')}>{t('nav.contactUs')}</Link>
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </CenterContainer>
        </section>
      </MainLayout>
    </>
  );
}
