'use client';

import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { CheckCircle2 } from 'lucide-react';
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

const SUBJECT_POSTULARSE = 'quiero-postularme';

const LEADS_API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')}/leads`
  : '';

function getUtmParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  const keys = ['utm_campaign', 'utm_term', 'utm_content', 'utm_source', 'utm_medium'];
  keys.forEach((k) => {
    const v = params.get(k);
    if (v) out[k] = v;
  });
  return out;
}

export function ContactForm({ idPrefix = 'cta-', className }: ContactFormProps) {
  const { t } = useTranslation();
  const { path } = useLocale();
  const formRef = useRef<HTMLFormElement>(null);
  const [subject, setSubject] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyStep, setApplyStep] = useState<1 | 2>(1);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isPostularse = subject === SUBJECT_POSTULARSE;
  const isInApplyFlow = isPostularse && showApplyForm;

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSubject(value);
    setSubmitStatus('idle');
    setSubmitError(null);
    if (value !== SUBJECT_POSTULARSE) {
      setShowApplyForm(false);
      setApplyStep(1);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isInApplyFlow && applyStep === 2) return; // apply flow handled separately for now
    if (isPostularse) return;

    const form = formRef.current;
    if (!form) return;

    const privacyEl = form.querySelector(`[id="${idPrefix}privacy"]`);
    const privacyChecked =
      privacyEl?.getAttribute('data-state') === 'checked' ||
      privacyEl?.getAttribute('aria-checked') === 'true';
    if (!privacyChecked) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.errors.privacyRequired'));
      return;
    }

    if (!LEADS_API_URL) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.errors.apiNotConfigured'));
      return;
    }

    const fullName = (form.querySelector<HTMLInputElement>('[name="fullName"]')?.value ?? '').trim();
    const email = (form.querySelector<HTMLInputElement>('[name="email"]')?.value ?? '').trim();
    const company = (form.querySelector<HTMLInputElement>('[name="company"]')?.value ?? '').trim();
    const phone = (form.querySelector<HTMLInputElement>('[name="phone"]')?.value ?? '').trim();
    const message = (form.querySelector<HTMLTextAreaElement>('[name="projectDescription"]')?.value ?? '').trim();

    if (!fullName || !email || !company || !phone || !message) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.errors.fieldsRequired'));
      return;
    }

    setSubmitStatus('loading');
    setSubmitError(null);

    const subjectLabel =
      subject === 'software-a-la-medida'
        ? t('home.ctaContact.subjectOptions.softwareALaMedida')
        : subject === 'ampliacion-personal'
          ? t('home.ctaContact.subjectOptions.ampliacionPersonal')
          : subject === 'soluciones-ia'
            ? t('home.ctaContact.subjectOptions.solucionesIA')
            : subject === 'otros'
              ? t('home.ctaContact.subjectOptions.otros')
              : subject;
    const projectDescription = subjectLabel
      ? `${t('home.ctaContact.subject')}: ${subjectLabel}\n\n${message}`
      : message;

    const utm = getUtmParams();
    const body = {
      fullName,
      email,
      phoneNumber: phone,
      company,
      projectDescription,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      utmCampaign: utm.utm_campaign,
      utmTerm: utm.utm_term,
      utmContent: utm.utm_content,
    };

    try {
      const res = await fetch(LEADS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const message = data?.message ?? data?.error ?? res.statusText;
        throw new Error(message);
      }
      setSubmitStatus('success');
      form.reset();
      setSubject('');
    } catch (err) {
      setSubmitStatus('error');
      setSubmitError(err instanceof Error ? err.message : t('home.ctaContact.errors.generic'));
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-white px-6 py-8 shadow-sm md:px-8 md:py-10',
        className,
      )}
    >
      <h3 className="text-primary mb-6 text-center text-xl font-bold md:text-2xl">
        {t('home.ctaContact.formTitle')}
      </h3>

      <AnimatePresence mode="wait">
        {submitStatus === 'success' ? (
          <motion.div
            key="thank-you"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center gap-6 py-6 text-center"
          >
            <CheckCircle2
              className="text-primary size-16 shrink-0 md:size-20"
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="flex flex-col gap-2">
              <h4 className="text-foreground text-xl font-bold md:text-2xl">
                {t('thankYou.title')}
              </h4>
              <p className="text-muted-foreground text-base leading-relaxed md:text-lg">
                {t('thankYou.message')}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href={path('')}>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                >
                  {t('thankYou.ctaHome')}
                </Button>
              </Link>
              <Link href={path('/contacto')}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 rounded-lg font-medium"
                >
                  {t('thankYou.ctaContact')}
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <form
            ref={formRef}
            className="flex flex-col gap-4"
            onSubmit={handleContactSubmit}
          >
        {!isInApplyFlow && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}subject`}>{t('home.ctaContact.subject')}</Label>
          <select
            id={`${idPrefix}subject`}
            value={subject}
            onChange={handleSubjectChange}
            className={cn(
              'border-input h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-base',
              'focus:border-primary focus:ring-primary/50 focus:ring-2 focus:outline-none md:text-sm',
            )}
          >
            <option value="">{t('home.ctaContact.subjectPlaceholder')}</option>
            <option value="software-a-la-medida">{t('home.ctaContact.subjectOptions.softwareALaMedida')}</option>
            <option value="ampliacion-personal">{t('home.ctaContact.subjectOptions.ampliacionPersonal')}</option>
            <option value="soluciones-ia">{t('home.ctaContact.subjectOptions.solucionesIA')}</option>
            <option value={SUBJECT_POSTULARSE}>{t('home.ctaContact.subjectOptions.quieroPostularme')}</option>
            <option value="otros">{t('home.ctaContact.subjectOptions.otros')}</option>
          </select>
        </div>
        )}
        <AnimatePresence mode="wait">
          {isPostularse ? (
            showApplyForm ? (
              applyStep === 1 ? (
              <motion.div
                key="apply-form-step1"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col gap-4"
              >
                <div className="text-center">
                  <h4 className="text-primary text-lg font-bold">
                    {t('home.ctaContact.applyForm.title')}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {t('home.ctaContact.applyForm.step', { current: 1, total: 2 })}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-name`}>{t('home.ctaContact.fullName')}</Label>
                  <Input
                    id={`${idPrefix}apply-name`}
                    type="text"
                    placeholder={t('home.ctaContact.fullNamePlaceholder')}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-email`}>{t('home.ctaContact.email')}</Label>
                  <Input
                    id={`${idPrefix}apply-email`}
                    type="email"
                    placeholder={t('home.ctaContact.emailPlaceholder')}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-phone`}>{t('home.ctaContact.phone')}</Label>
                  <Input
                    id={`${idPrefix}apply-phone`}
                    type="tel"
                    placeholder={t('home.ctaContact.phonePlaceholder')}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-role`}>
                    {t('home.ctaContact.applyForm.roleLabel')}
                  </Label>
                  <Input
                    id={`${idPrefix}apply-role`}
                    type="text"
                    placeholder={t('home.ctaContact.applyForm.rolePlaceholder')}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                    onClick={() => setApplyStep(2)}
                  >
                    {t('home.ctaContact.applyForm.continue')}
                  </Button>
                </div>
              </motion.div>
              ) : (
              <motion.div
                key="apply-form-step2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col gap-4"
              >
                <div className="text-center">
                  <h4 className="text-primary text-lg font-bold">
                    {t('home.ctaContact.applyForm.step2Title')}
                  </h4>
                  <p className="text-muted-foreground text-sm">
                    {t('home.ctaContact.applyForm.step', { current: 2, total: 2 })}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-heard`}>
                    {t('home.ctaContact.applyForm.heardAbout')}
                  </Label>
                  <select
                    id={`${idPrefix}apply-heard`}
                    className={cn(
                      'border-input h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-base',
                      'focus:border-primary focus:ring-primary/50 focus:ring-2 focus:outline-none md:text-sm',
                    )}
                  >
                    <option value="">{t('home.ctaContact.subjectPlaceholder')}</option>
                    <option value="linkedin">{t('home.ctaContact.applyForm.heardLinkedIn')}</option>
                    <option value="referido">{t('home.ctaContact.applyForm.heardReferral')}</option>
                    <option value="web">{t('home.ctaContact.applyForm.heardWeb')}</option>
                    <option value="otro">{t('home.ctaContact.subjectOptions.otros')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t('home.ctaContact.applyForm.currentlyWorking')}</Label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`${idPrefix}apply-working`}
                        value="si"
                        className="accent-primary border-input size-4 rounded-full border"
                      />
                      <span className="text-sm">{t('home.ctaContact.applyForm.yes')}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`${idPrefix}apply-working`}
                        value="no"
                        className="accent-primary border-input size-4 rounded-full border"
                      />
                      <span className="text-sm">{t('home.ctaContact.applyForm.no')}</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-start`}>
                    {t('home.ctaContact.applyForm.startDate')}
                  </Label>
                  <select
                    id={`${idPrefix}apply-start`}
                    className={cn(
                      'border-input h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-base',
                      'focus:border-primary focus:ring-primary/50 focus:ring-2 focus:outline-none md:text-sm',
                    )}
                  >
                    <option value="">{t('home.ctaContact.subjectPlaceholder')}</option>
                    <option value="inmediato">{t('home.ctaContact.applyForm.immediately')}</option>
                    <option value="1-mes">1 {t('home.ctaContact.applyForm.month')}</option>
                    <option value="2-3-meses">2-3 {t('home.ctaContact.applyForm.months')}</option>
                    <option value="mas">{t('home.ctaContact.applyForm.moreThan3Months')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    {t('home.ctaContact.applyForm.validVisa')}
                    <span
                      className="text-muted-foreground size-4 rounded-full bg-current"
                      title={t('home.ctaContact.applyForm.visaInfo')}
                      aria-label={t('home.ctaContact.applyForm.visaInfo')}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                      </svg>
                    </span>
                  </Label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`${idPrefix}apply-visa`}
                        value="si"
                        defaultChecked
                        className="accent-primary border-input size-4 rounded-full border"
                      />
                      <span className="text-sm">{t('home.ctaContact.applyForm.yes')}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`${idPrefix}apply-visa`}
                        value="no"
                        className="accent-primary border-input size-4 rounded-full border"
                      />
                      <span className="text-sm">{t('home.ctaContact.applyForm.no')}</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t('home.ctaContact.applyForm.travelAvailability')}</Label>
                  <div className="flex gap-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`${idPrefix}apply-travel`}
                        value="si"
                        className="accent-primary border-input size-4 rounded-full border"
                      />
                      <span className="text-sm">{t('home.ctaContact.applyForm.yes')}</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name={`${idPrefix}apply-travel`}
                        value="no"
                        className="accent-primary border-input size-4 rounded-full border"
                      />
                      <span className="text-sm">{t('home.ctaContact.applyForm.no')}</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-cv`}>{t('home.ctaContact.applyForm.attachCV')}</Label>
                  <label
                    htmlFor={`${idPrefix}apply-cv`}
                    className={cn(
                      'border-primary/30 bg-primary/5 flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6',
                      'hover:bg-primary/10 transition-colors',
                    )}
                  >
                    <svg
                      className="text-primary size-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-muted-foreground text-sm">
                      {t('home.ctaContact.applyForm.attachCVHint')}
                    </span>
                    <input
                      id={`${idPrefix}apply-cv`}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex justify-between gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="rounded-lg font-medium"
                    onClick={() => setApplyStep(1)}
                  >
                    ← {t('home.ctaContact.applyForm.back')}
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                  >
                    {t('home.ctaContact.submit')}
                  </Button>
                </div>
              </motion.div>
              )
            ) : (
              <motion.div
                key="postularse"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex flex-col items-center gap-6 py-4"
              >
                <p className="text-muted-foreground text-center text-base leading-relaxed">
                  {t('home.ctaContact.applyMessage')}
                </p>
                <Button
                  type="button"
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium px-8"
                  onClick={() => setShowApplyForm(true)}
                >
                  {t('home.ctaContact.applyNow')}
                </Button>
              </motion.div>
            )
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col gap-4"
            >
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}name`}>{t('home.ctaContact.fullName')}</Label>
          <Input
            id={`${idPrefix}name`}
            name="fullName"
            type="text"
            placeholder={t('home.ctaContact.fullNamePlaceholder')}
            className="h-10 rounded-lg"
            disabled={submitStatus === 'loading'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}email`}>{t('home.ctaContact.email')}</Label>
          <Input
            id={`${idPrefix}email`}
            name="email"
            type="email"
            placeholder={t('home.ctaContact.emailPlaceholder')}
            className="h-10 rounded-lg"
            disabled={submitStatus === 'loading'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}company`}>{t('home.ctaContact.companyName')}</Label>
          <Input
            id={`${idPrefix}company`}
            name="company"
            type="text"
            placeholder={t('home.ctaContact.companyPlaceholder')}
            className="h-10 rounded-lg"
            disabled={submitStatus === 'loading'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}phone`}>{t('home.ctaContact.phone')}</Label>
          <Input
            id={`${idPrefix}phone`}
            name="phone"
            type="tel"
            placeholder={t('home.ctaContact.phonePlaceholder')}
            className="h-10 rounded-lg"
            disabled={submitStatus === 'loading'}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}message`}>{t('home.ctaContact.message')}</Label>
          <Textarea
            id={`${idPrefix}message`}
            name="projectDescription"
            placeholder={t('home.ctaContact.messagePlaceholder')}
            rows={4}
            className="rounded-lg"
            disabled={submitStatus === 'loading'}
          />
        </div>
        <div className="flex items-start gap-3">
          <Checkbox id={`${idPrefix}privacy`} className="border-primary/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary" />
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
          <Checkbox id={`${idPrefix}newsletter`} className="border-primary/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary" />
          <Label
            htmlFor={`${idPrefix}newsletter`}
            className="text-muted-foreground cursor-pointer text-sm leading-relaxed font-normal"
          >
            {t('home.ctaContact.newsletterLabel')}
          </Label>
        </div>
        {submitStatus === 'error' && submitError && (
          <p className="text-destructive text-sm" role="alert">
            {submitError}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg font-medium"
          disabled={submitStatus === 'loading'}
        >
          {submitStatus === 'loading' ? t('home.ctaContact.sending') : t('home.ctaContact.submit')}
        </Button>
            </motion.div>
          )}
        </AnimatePresence>
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
