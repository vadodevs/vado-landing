import { useTranslation } from 'react-i18next';
import { FaClipboardList, FaLaptop, FaCode } from 'react-icons/fa';
import { type ProjectStackItem } from '@/components/layout/nuestro-trabajo/ProjectStack';
import { AppStoreButtons } from '@/components/ui/AppStoreButtons';
import { EBM_ACCENT } from './ebm-case-section';

const EBM_APP_STORE_URL = 'https://apps.apple.com/co/app/easy-boat-management/id6747445332';
const EBM_PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.easyboatmanagement.app';

const STACK_BASE = '/stack';

const EBM_STACK: ProjectStackItem[] = [
  { name: 'Vue', icon: 'vue' },
  { name: 'Capacitor', icon: 'capacitor' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'NestJS', icon: 'nestjs' },
  { name: 'TypeScript', icon: 'typescript' },
  { name: 'Node.js', icon: 'node-js' },
  { name: 'Android Studio', icon: 'android' },
];

export function EbmProjectSidebar() {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-md">
      <div className="border-border border-b px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-wider text-slate-700 uppercase">
          <FaClipboardList className="size-4 shrink-0" style={{ color: EBM_ACCENT }} />
          {t('ourWork.caseStudy.ebm.sidebar.title')}
        </h3>
      </div>

      <div className="divide-y divide-slate-100 px-5 py-4">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground mb-1 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <FaLaptop className="size-3.5 shrink-0" style={{ color: EBM_ACCENT }} />
              {t('ourWork.caseStudy.ebm.sidebar.productType')}
            </dt>
            <dd className="font-medium text-slate-700">
              {t('ourWork.caseStudy.ebm.sidebar.productTypeMobile')}
            </dd>
          </div>
        </dl>

        <div className="pt-4">
          <p className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <FaCode className="size-3.5 shrink-0" style={{ color: EBM_ACCENT }} />
            {t('ourWork.caseStudy.ebm.stackLabel')}
          </p>
          <ul className="flex flex-wrap gap-2" role="list">
            {EBM_STACK.map((item) => (
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
        <AppStoreButtons
          appStoreUrl={EBM_APP_STORE_URL}
          playStoreUrl={EBM_PLAY_STORE_URL}
          variant="light"
          fullWidth
        />
      </div>
    </div>
  );
}
