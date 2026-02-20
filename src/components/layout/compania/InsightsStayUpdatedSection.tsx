import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';

export function InsightsStayUpdatedSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: integrate with your newsletter/backend later
    if (email.trim()) {
      setEmail('');
    }
  };

  return (
    <section className="py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="w-full text-left">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase md:text-sm">
            {t('insightsPage.stayUpdated.topLine')}
          </p>
          <h2 className="mb-2 text-2xl font-bold leading-tight tracking-tight uppercase text-[#19314c] md:text-4xl lg:text-5xl">
            {t('insightsPage.stayUpdated.titleLine1')}
            <span className="text-primary mt-0.5 block">{t('insightsPage.stayUpdated.titleLine2')}</span>
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex w-full max-w-2xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-start sm:gap-3"
          >
            <div className="flex flex-1 flex-col items-stretch gap-1.5 text-left sm:max-w-xs sm:flex-initial">
              <FloatingLabelInput
                id="insights-email"
                type="email"
                label={t('insightsPage.stayUpdated.emailLabel')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input bg-background focus:ring-primary w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-offset-2"
                required
              />
            </div>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 rounded-lg px-6 py-2.5 text-sm font-bold uppercase"
            >
              {t('insightsPage.stayUpdated.subscribeButton')}
            </Button>
          </form>
        </div>
      </CenterContainer>
    </section>
  );
}
