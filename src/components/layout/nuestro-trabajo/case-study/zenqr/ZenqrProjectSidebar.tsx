import { useTranslation } from 'react-i18next';
import { FaGlobe, FaClipboardList, FaIndustry, FaLaptop, FaCode } from 'react-icons/fa';
import { type ProjectStackItem } from '@/components/layout/nuestro-trabajo/ProjectStack';
import { ZENQR_ACCENT } from './zenqr-case-section';

const STACK_BASE = '/stack';
const ZENQR_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'Figma', icon: 'figma' },
  { name: 'Digital Ocean', icon: 'digital-ocean' },
  { name: 'Stripe', icon: 'stripe-favicon' },
  { name: 'SendGrid', icon: 'sengrid' },
];

export function ZenqrProjectSidebar() {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-md">
      <div className="border-border border-b px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-700 uppercase">
          <FaClipboardList className="size-4 shrink-0" style={{ color: ZENQR_ACCENT }} />
          {t('ourWork.caseStudy.zenqr.sidebar.title')}
        </h3>
      </div>

      <div className="divide-y divide-slate-100 px-5 py-4">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <FaIndustry className="size-3.5 shrink-0" style={{ color: ZENQR_ACCENT }} />
              {t('ourWork.heroBadge.industry')}
            </dt>
            <dd className="font-medium text-slate-700">
              {t('ourWork.caseStudy.zenqr.hero.industry')}
            </dd>
          </div>
          <div className="pt-3">
            <dt className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <FaLaptop className="size-3.5 shrink-0" style={{ color: ZENQR_ACCENT }} />
              {t('ourWork.caseStudy.zenqr.sidebar.productType')}
            </dt>
            <dd className="font-medium text-slate-700">
              {t('ourWork.caseStudy.zenqr.sidebar.productTypeWeb')}
            </dd>
          </div>
        </dl>

        <div className="pt-4">
          <p className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <FaCode className="size-3.5 shrink-0" style={{ color: ZENQR_ACCENT }} />
            {t('ourWork.caseStudy.zenqr.stackLabel')}
          </p>
          <ul className="flex flex-wrap gap-2" role="list">
            {ZENQR_STACK.map((item) => (
              <li key={item.icon}>
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                  title={item.name}
                >
                  <img
                    src={`${STACK_BASE}/${item.icon}.svg`}
                    alt=""
                    aria-hidden
                    className="h-6 w-6 shrink-0 object-contain"
                  />
                  <span>{item.name}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-4 pt-0">
        <a
          href="https://www.zenqr.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-95 hover:shadow-md"
          style={{ backgroundColor: ZENQR_ACCENT }}
        >
          <FaGlobe className="size-4 shrink-0" />
          {t('ourWork.caseStudy.zenqr.sidebar.visitWebsite')}
        </a>
      </div>
    </div>
  );
}
