import { useTranslation } from 'react-i18next';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const BENEFIT_KEYS = [
  'home.ctaContact.benefit1',
  'home.ctaContact.benefit2',
  'home.ctaContact.benefit3',
] as const;

export function CtaContactSection() {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden pt-0 pb-12 md:pb-16 lg:pb-10">
      {/* Mitad superior blanca, mitad inferior #f8fafc */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(to bottom, white 50%, #f8fafc 50%)',
        }}
        aria-hidden
      />
      <img
        src="/backgrounds/bg-cut-v2.svg"
        alt=""
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-top opacity-90"
        aria-hidden
      />
      <CenterContainer className="relative z-10 pt-12 md:pt-16 lg:pt-20">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          {/* Izquierda: título, descripción, beneficios sin círculos */}
          <div className="flex flex-1 flex-col lg:max-w-[48%]">
            <h2 className="mb-4 text-3xl leading-tight font-bold text-[#19314c] md:text-4xl">
              <span className="uppercase">{t('home.ctaContact.titlePart1')}</span>{' '}
              <span className="text-primary uppercase">{t('home.ctaContact.titlePart2')}</span>
            </h2>
            <p className="text-muted-foreground mb-6 text-base leading-relaxed md:text-lg">
              {t('home.ctaContact.description')}
            </p>
            <ul className="space-y-3">
              {BENEFIT_KEYS.map((key) => (
                <li key={key} className="flex items-center gap-3">
                  <img src="/icons/check.svg" alt="" className="size-5 shrink-0" aria-hidden />
                  <span className="text-foreground text-sm leading-relaxed md:text-base">
                    {t(key)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Derecha: formulario en contenedor blanco */}
          <div className="min-w-0 flex-1 lg:max-w-[52%]">
            <div className="rounded-xl bg-white px-6 py-8 shadow-md md:px-8 md:py-10">
              <h3 className="text-primary mb-6 text-lg font-bold uppercase md:text-xl">
                {t('home.ctaContact.formTitle')}
              </h3>
              <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                <div className="space-y-2">
                  <Label htmlFor="cta-subject">{t('home.ctaContact.subject')}</Label>
                  <select
                    id="cta-subject"
                    className={cn(
                      'border-input h-9 w-full rounded-md border bg-transparent px-3 py-1 text-base shadow-xs',
                      'focus:border-ring focus:ring-ring/50 focus:ring-2 focus:outline-none md:text-sm',
                    )}
                  >
                    <option value="">{t('home.ctaContact.subjectPlaceholder')}</option>
                    <option value="general">{t('home.ctaContact.subjectOptions.general')}</option>
                    <option value="project">{t('home.ctaContact.subjectOptions.project')}</option>
                    <option value="support">{t('home.ctaContact.subjectOptions.support')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-name">{t('home.ctaContact.fullName')}</Label>
                  <Input
                    id="cta-name"
                    type="text"
                    placeholder={t('home.ctaContact.fullNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-email">{t('home.ctaContact.email')}</Label>
                  <Input
                    id="cta-email"
                    type="email"
                    placeholder={t('home.ctaContact.emailPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-company">{t('home.ctaContact.companyName')}</Label>
                  <Input
                    id="cta-company"
                    type="text"
                    placeholder={t('home.ctaContact.companyPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-phone">{t('home.ctaContact.phone')}</Label>
                  <Input
                    id="cta-phone"
                    type="tel"
                    placeholder={t('home.ctaContact.phonePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cta-message">{t('home.ctaContact.message')}</Label>
                  <Textarea
                    id="cta-message"
                    placeholder={t('home.ctaContact.messagePlaceholder')}
                    rows={4}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="cta-privacy" />
                  <Label
                    htmlFor="cta-privacy"
                    className="text-muted-foreground flex cursor-pointer flex-wrap items-center gap-x-1 gap-y-0 text-sm leading-relaxed font-normal"
                  >
                    <span>{t('home.ctaContact.privacyLabel')}</span>
                    <a
                      href="/politica-privacidad"
                      className="text-muted-foreground shrink-0 font-medium underline underline-offset-2"
                    >
                      {t('home.ctaContact.privacyPolicy')}
                    </a>
                    <span>{t('home.ctaContact.and')}</span>
                    <a
                      href="/terminos"
                      className="text-muted-foreground shrink-0 font-medium underline underline-offset-2"
                    >
                      {t('home.ctaContact.termsOfService')}
                    </a>
                  </Label>
                </div>
                <div className="flex items-start gap-3">
                  <Checkbox id="cta-newsletter" />
                  <Label
                    htmlFor="cta-newsletter"
                    className="text-muted-foreground cursor-pointer text-sm leading-relaxed font-normal"
                  >
                    {t('home.ctaContact.newsletterLabel')}
                  </Label>
                </div>
                <div className="flex justify-center lg:justify-start">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full shrink-0 font-bold uppercase md:w-auto lg:w-auto"
                  >
                    {t('home.ctaContact.submit')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </CenterContainer>
    </section>
  );
}
