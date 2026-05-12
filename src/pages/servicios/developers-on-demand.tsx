import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/hooks/useLocale';
import { DodDarkHero } from '@/components/layout/servicios/developers-on-demand/DodDarkHero';
import { DodPainQuantification } from '@/components/layout/servicios/developers-on-demand/DodPainQuantification';
import { DodDarkCta } from '@/components/layout/servicios/developers-on-demand/DodDarkCta';

export default function DevelopersOnDemand() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <>
      <PageMeta
        title={t('nav.developersOnDemand')}
        description={t('seo.developersOnDemand')}
        canonicalPath={path('/services/it-staff-agumentation')}
        pathWithoutLang="/services/it-staff-agumentation"
      />
      <MainLayout>
        <div className="bg-black">
          <DodDarkHero />
          <DodPainQuantification />
          <DodDarkCta />
        </div>
      </MainLayout>
    </>
  );
}
