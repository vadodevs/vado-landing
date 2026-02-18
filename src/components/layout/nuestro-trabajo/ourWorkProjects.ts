export type CategoryKey = 'webApp' | 'platform' | 'website' | 'crm' | 'ecommerce';

const BADGE_COLOR = 'bg-[#3390ff]';

export const BADGE_COLORS: Record<CategoryKey, string> = {
  webApp: BADGE_COLOR,
  platform: BADGE_COLOR,
  website: BADGE_COLOR,
  crm: BADGE_COLOR,
  ecommerce: BADGE_COLOR,
};

export type OurWorkProject = {
  id: string;
  image: string;
  categoryKey: CategoryKey;
  /** Override badge background color (ej. #3390ff). Si no se define, se usa BADGE_COLORS[categoryKey]. */
  badgeColor?: string;
};

export const OUR_WORK_PROJECTS: OurWorkProject[] = [
  { id: 'sendero', image: '/case-studies/sendero-crm/bg-cover-card.png', categoryKey: 'crm' },
  { id: 'ebm', image: 'ebm.png', categoryKey: 'platform' },
  { id: 'digitalRanch', image: 'digital-ranch.png', categoryKey: 'webApp' },
  { id: 'zenqr', image: 'zenqur.png', categoryKey: 'webApp' },
  { id: 'easySales', image: 'easy-sales.png', categoryKey: 'ecommerce' },
  { id: 'cipreses', image: 'cipreses.png', categoryKey: 'website' },
  { id: 'maggiore', image: 'cipreses.png', categoryKey: 'platform', badgeColor: '#3390ff' },
  { id: 'washapp', image: 'cipreses.png', categoryKey: 'webApp', badgeColor: '#3390ff' },
];
