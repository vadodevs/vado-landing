import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

const CTA_TITLE_DARK = '#314158';

type CaseStudyId =
  | 'sendero'
  | 'zenqr'
  | 'ebm'
  | 'maggiore'
  | 'digitalRanch'
  | 'washaut'
  | 'easySales'
  | 'cipreses';

interface CaseStudyCtaSectionProps {
  caseStudyId: CaseStudyId;
  accentColor: string;
}

export function CaseStudyCtaSection({ caseStudyId, accentColor }: CaseStudyCtaSectionProps) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const baseKey = `ourWork.caseStudy.${caseStudyId}.cta`;

  return (
    <section className="relative w-full py-16 md:py-20 lg:py-24">
      <div className="w-full min-w-0">
        <div
          className="w-full text-left"
        >
          <h2 className="mb-8 text-lg leading-tight font-semibold tracking-tight uppercase md:text-xl lg:text-2xl">
            <span className="block" style={{ color: CTA_TITLE_DARK }}>
              {t(`${baseKey}.titleLine1`)}
            </span>
            <span className="block" style={{ color: accentColor }}>
              {t(`${baseKey}.titleLine2`)}
            </span>
          </h2>
          <Button
            size="lg"
            className="rounded-xl px-8 py-6 text-base font-semibold shadow-lg transition-all hover:shadow-xl"
            style={{
              backgroundColor: accentColor,
              color: 'white',
            }}
            asChild
          >
            <Link href={path('/contact')}>{t(`${baseKey}.ctaLabel`)}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
