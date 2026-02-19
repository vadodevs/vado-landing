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
  badgeColor?: string;
};

export const OUR_WORK_PROJECTS: OurWorkProject[] = [
  { id: 'sendero', image: '/case-studies/sendero-crm/bg-cover-card.webp', categoryKey: 'crm' },
  { id: 'zenqr', image: '/case-studies/zenqr/bg-cover-card.webp', categoryKey: 'webApp' },
  { id: 'ebm', image: '/case-studies/ebm/ebm-cover-card.webp', categoryKey: 'platform' },
  {
    id: 'maggiore',
    image: '/case-studies/maggiore/bg-cover-card.webp',
    categoryKey: 'platform',
  },
  {
    id: 'digitalRanch',
    image: '/case-studies/digital-ranch/digital-cover-card.webp',
    categoryKey: 'webApp',
  },
  {
    id: 'washapp',
    image: '/case-studies/washapp/bg-cover-card.webp',
    categoryKey: 'webApp',
    badgeColor: '#3390ff',
  },
  {
    id: 'easySales',
    image: '/case-studies/easy-sales/bg-cover-card.webp',
    categoryKey: 'ecommerce',
  },
  {
    id: 'cipreses',
    image: '/case-studies/criadero-cipreses/bg-cover-card.webp',
    categoryKey: 'website',
  },
];
