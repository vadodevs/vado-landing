import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLocale } from '@/hooks/useLocale';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const;

export function FAQSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="bg-background relative overflow-hidden py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          {/* Left: CTA */}
          <div className="flex flex-1 flex-col lg:max-w-md">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase md:text-sm">
              {t('home.faq.label')}
            </p>
            <h2 className="mb-4 text-3xl leading-tight font-bold text-[#19314c] md:text-4xl">
              {t('home.faq.titlePart1')}{' '}
              <span className="text-primary">{t('home.faq.titlePart2')}</span>
            </h2>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed md:text-lg">
              {t('home.faq.description')}
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button asChild size="default" className="w-full shrink-0 font-bold md:w-auto md:text-lg lg:w-auto">
                <Link href={path('/contacto')}>{t('home.faq.cta')}</Link>
              </Button>
            </div>
          </div>

          {/* Right: Accordion */}
          <div className="min-w-0 flex-1 lg:max-w-xl">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_KEYS.map((key) => (
                <AccordionItem
                  key={key}
                  value={key}
                  className="border-border border-b last:border-b-0"
                >
                  <AccordionTrigger className="text-foreground hover:text-primary data-[state=open]:text-primary py-4 text-left text-base font-medium hover:no-underline">
                    {t(`home.faq.questions.${key}.question`)}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(`home.faq.questions.${key}.answer`)}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
