import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { InsightCard } from './InsightCard';
import { useLocale } from '@/hooks/useLocale';

export function VadoInsightsSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  const articles = [
    {
      imageSrc: '/articles/article-1.png',
      imageAlt: t('home.vadoInsights.article1.imageAlt'),
      date: t('home.vadoInsights.article1.date'),
      category: t('home.vadoInsights.article1.category'),
      title: t('home.vadoInsights.article1.title'),
      author: t('home.vadoInsights.author'),
      href: path('/compania/vado-insights'),
    },
    {
      imageSrc: '/articles/article-2.png',
      imageAlt: t('home.vadoInsights.article2.imageAlt'),
      date: t('home.vadoInsights.article2.date'),
      category: t('home.vadoInsights.article2.category'),
      title: t('home.vadoInsights.article2.title'),
      author: t('home.vadoInsights.author'),
      href: path('/compania/vado-insights'),
    },
    {
      imageSrc: '/articles/article-3.png',
      imageAlt: t('home.vadoInsights.article3.imageAlt'),
      date: t('home.vadoInsights.article3.date'),
      category: t('home.vadoInsights.article3.category'),
      title: t('home.vadoInsights.article3.title'),
      author: t('home.vadoInsights.author'),
      href: path('/compania/vado-insights'),
    },
  ];

  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase md:text-sm">
          {t('home.vadoInsights.label')}
        </p>
        <h2 className="mb-8 text-3xl leading-tight font-bold text-[#19314c] md:text-4xl">
          {t('home.vadoInsights.titlePart1')}{' '}
          <span className="text-primary">{t('home.vadoInsights.titlePart2')}</span>
        </h2>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
          {articles.map((article, index) => (
            <InsightCard key={index} {...article} className="lg:min-w-0 lg:flex-1" />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="outline" className="border-primary text-primary" asChild>
            <Link href={path('/compania/vado-insights')}>{t('home.vadoInsights.viewMore')}</Link>
          </Button>
        </div>
      </CenterContainer>
    </section>
  );
}
