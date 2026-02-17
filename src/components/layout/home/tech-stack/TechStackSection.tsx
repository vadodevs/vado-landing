import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/hooks/useLocale';

export function TechStackSection() {
  const { t } = useTranslation();
  const { path } = useLocale();

  return (
    <section className="bg-background py-12 md:py-16 lg:py-20">
      <CenterContainer>
        <div className="flex flex-col-reverse items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
          {/* Left: tech stack image with circular background */}
          <div className="relative flex w-full max-w-md flex-1 items-center justify-center lg:max-w-lg">
            <div className="relative flex aspect-square w-full max-w-[320px] items-center justify-center md:max-w-[380px] lg:max-w-[420px]">
              <img
                src="/tech-stack/stack.png"
                alt=""
                className="relative z-1 w-full max-w-[280px] object-contain md:max-w-[320px] lg:max-w-[360px]"
                aria-hidden
              />
            </div>
          </div>

          {/* Right: text + CTA */}
          <div className="flex max-w-xl flex-1 flex-col lg:max-w-[48%] lg:text-left">
            <h2 className="mb-4 text-3xl leading-tight font-bold text-[#19314C] md:text-4xl lg:text-[2.25rem]">
              {t('home.techStack.titlePart1')}{' '}
              <span className="text-primary">{t('home.techStack.titlePart2')}</span>
            </h2>
            <p className="mb-6 text-base leading-relaxed text-[#19314C] md:text-lg">
              {t('home.techStack.description')}
            </p>
            <div className="flex justify-center lg:justify-start">
              <Button asChild size="default" className="w-full sm:w-auto">
                <Link href={path('/contacto')}>{t('home.techStack.cta')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
