import { useTranslation } from 'react-i18next';
import { PageMeta } from '@/components/PageMeta';
import MainLayout from '@/components/layout/MainLayout';
import { useLocale } from '@/hooks/useLocale';
import { ServiceHero } from '@/components/layout/servicios/ServiceHero';
import { OurWorkProjectsSection } from '@/components/layout/nuestro-trabajo/OurWorkProjectsSection';
import { FAQSection } from '@/components/layout/home/faq/FAQSection';
import { CtaContactSection } from '@/components/layout/home/cta-contact/CtaContactSection';

export default function NuestroTrabajo() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <>
      <PageMeta
        title={t('nav.ourWork')}
        description={t('seo.ourWork')}
        canonicalPath={path('/our-work')}
        pathWithoutLang="/our-work"
      />
      <MainLayout>
        <ServiceHero
          backgroundImage="/backgrounds/bg-blue.webp"
          titleLine1={t('ourWork.hero.titleLine1')}
          titleLine2={t('ourWork.hero.titleLine2')}
          tagline={t('ourWork.hero.tagline')}
        />
        <OurWorkProjectsSection />
        <FAQSection />
        <CtaContactSection />
      </MainLayout>
    </>
  );
}
