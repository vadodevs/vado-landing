import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  /** Prefijo para los ids de los campos (evita duplicados si hay varios formularios en la página). */
  idPrefix?: string;
  className?: string;
}

export function ContactForm({ idPrefix = 'cta-', className }: ContactFormProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-white px-6 py-8 shadow-sm md:px-8 md:py-10',
        className,
      )}
    >
      <h3 className="text-primary mb-6 text-xl font-bold md:text-2xl">
        {t('home.ctaContact.formTitle')}
      </h3>
      <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}subject`}>{t('home.ctaContact.subject')}</Label>
          <select
            id={`${idPrefix}subject`}
            className={cn(
              'border-input h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-base',
              'focus:border-primary focus:ring-primary/50 focus:ring-2 focus:outline-none md:text-sm',
            )}
          >
            <option value="">{t('home.ctaContact.subjectPlaceholder')}</option>
            <option value="general">{t('home.ctaContact.subjectOptions.general')}</option>
            <option value="project">{t('home.ctaContact.subjectOptions.project')}</option>
            <option value="support">{t('home.ctaContact.subjectOptions.support')}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}name`}>{t('home.ctaContact.fullName')}</Label>
          <Input
            id={`${idPrefix}name`}
            type="text"
            placeholder={t('home.ctaContact.fullNamePlaceholder')}
            className="h-10 rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}email`}>{t('home.ctaContact.email')}</Label>
          <Input
            id={`${idPrefix}email`}
            type="email"
            placeholder={t('home.ctaContact.emailPlaceholder')}
            className="h-10 rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}company`}>{t('home.ctaContact.companyName')}</Label>
          <Input
            id={`${idPrefix}company`}
            type="text"
            placeholder={t('home.ctaContact.companyPlaceholder')}
            className="h-10 rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}phone`}>{t('home.ctaContact.phone')}</Label>
          <Input
            id={`${idPrefix}phone`}
            type="tel"
            placeholder={t('home.ctaContact.phonePlaceholder')}
            className="h-10 rounded-lg"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}message`}>{t('home.ctaContact.message')}</Label>
          <Textarea
            id={`${idPrefix}message`}
            placeholder={t('home.ctaContact.messagePlaceholder')}
            rows={4}
            className="rounded-lg"
          />
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id={`${idPrefix}privacy`} />
          <Label
            htmlFor={`${idPrefix}privacy`}
            className="text-muted-foreground flex cursor-pointer flex-wrap items-center gap-x-1 gap-y-0 text-sm leading-relaxed font-normal"
          >
            <span>{t('home.ctaContact.privacyLabel')}</span>
            <a
              href="/politica-privacidad"
              className="text-primary shrink-0 font-medium underline underline-offset-2"
            >
              {t('home.ctaContact.privacyPolicy')}
            </a>
            <span>{t('home.ctaContact.and')}</span>
            <a
              href="/terminos"
              className="text-primary shrink-0 font-medium underline underline-offset-2"
            >
              {t('home.ctaContact.termsOfService')}
            </a>
          </Label>
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id={`${idPrefix}newsletter`} />
          <Label
            htmlFor={`${idPrefix}newsletter`}
            className="text-muted-foreground cursor-pointer text-sm leading-relaxed font-normal"
          >
            {t('home.ctaContact.newsletterLabel')}
          </Label>
        </div>
        <Button
          type="submit"
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg font-medium"
        >
          {t('home.ctaContact.submit')}
        </Button>
      </form>
    </div>
  );
}
