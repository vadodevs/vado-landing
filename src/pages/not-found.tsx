import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

export const NotFound = () => {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <PageTitle title={t('notFound.title')} />
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-6xl font-bold text-primary sm:text-7xl md:text-8xl">
          {t('notFound.code')}
        </p>
        <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl">
          <span className="text-primary">{t('notFound.titlePart1')}</span>{' '}
          <span className="text-[#19314c]">{t('notFound.titlePart2')}</span>
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-base sm:text-lg">
          {t('notFound.description')}
        </p>
        <Link href={path('')} className="mt-8">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-5 text-sm font-bold uppercase tracking-wide"
          >
            {t('notFound.cta')}
          </Button>
        </Link>
      </div>
    </main>
  );
};
