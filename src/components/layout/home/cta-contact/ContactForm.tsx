'use client';

import { useState, useRef } from 'react';
import { Link } from 'wouter';
import { AnimatePresence, motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')
  : '';

const LEADS_API_URL = API_BASE ? `${API_BASE}/leads` : '';
const DEVELOPERS_API_URL = API_BASE ? `${API_BASE}/users/developers` : '';
const DEVELOPERS_WITH_CV_URL = API_BASE ? `${API_BASE}/users/developers/with-cv` : '';

const MAX_CV_SIZE_MB = 10;
const MAX_CV_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;

/** Formato email: algo@dominio.ext (RFC 5322 simplificado) */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Teléfono: solo dígitos, +, espacios, guiones, paréntesis; mínimo 10 dígitos */
function isValidEmail(value: string): boolean {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 && trimmed.length <= 255 && EMAIL_REGEX.test(trimmed);
}

function isValidPhone(value: string): boolean {
  const trimmed = (value ?? '').trim();
  const digitsOnly = trimmed.replace(/\D/g, '');
  return digitsOnly.length >= 10 && trimmed.length <= 55;
}

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
  const [applyStep1Data, setApplyStep1Data] = useState<{
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
  } | null>(null);
  const [applyCvFile, setApplyCvFile] = useState<File | null>(null);
  const applyCvInputRef = useRef<HTMLInputElement>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});
  const isPostularse = subject === SUBJECT_POSTULARSE;
  const isInApplyFlow = isPostularse && showApplyForm;

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSubject(value);
    setSubmitStatus('idle');
    setSubmitError(null);
    setFieldErrors({});
    if (value !== SUBJECT_POSTULARSE) {
      setShowApplyForm(false);
      setApplyStep(1);
      setApplyStep1Data(null);
    }
  };

  const handleContinueToStep2 = () => {
    const data = applyStep1Data ?? { fullName: '', email: '', phoneNumber: '', role: '' };
    const fullName = (data.fullName ?? '').trim();
    const email = (data.email ?? '').trim();
    const phoneNumber = (data.phoneNumber ?? '').trim();
    const role = (data.role ?? '').trim();
    const errors: { email?: string; phone?: string } = {};
    if (!isValidEmail(email)) errors.email = t('home.ctaContact.errors.emailInvalid');
    if (!isValidPhone(phoneNumber)) errors.phone = t('home.ctaContact.errors.phoneInvalid');
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitStatus('error');
      setSubmitError(
        errors.email && errors.phone
          ? `${t('home.ctaContact.errors.emailInvalid')} ${t('home.ctaContact.errors.phoneInvalid')}`
          : errors.email ?? errors.phone ?? t('home.ctaContact.errors.fieldsRequired'),
      );
      return;
    }
    if (!fullName || !role) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.errors.fieldsRequired'));
      return;
    }
    setFieldErrors({});
    setSubmitError(null);
    setApplyCvFile(null);
    setApplyStep1Data({ fullName, email, phoneNumber, role });
    setApplyStep(2);
  };

  const handleApplySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isInApplyFlow || applyStep !== 2 || !applyStep1Data) return;

    const form = formRef.current;
    if (!form) return;

    const agreementEl = form.querySelector(`[id="${idPrefix}apply-agreement"]`);
    const agreement =
      agreementEl?.getAttribute('data-state') === 'checked' ||
      agreementEl?.getAttribute('aria-checked') === 'true';
    if (!agreement) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.errors.privacyRequired'));
      return;
    }

    if (!DEVELOPERS_API_URL || !DEVELOPERS_WITH_CV_URL) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.errors.apiNotConfigured'));
      return;
    }

    const howTheyKnowVado = (form.querySelector<HTMLSelectElement>(`[id="${idPrefix}apply-heard"]`)?.value ?? '').trim();
    const startVadoRaw = (form.querySelector<HTMLSelectElement>(`[id="${idPrefix}apply-start"]`)?.value ?? '').trim();
    const validVisaRadio = form.querySelector<HTMLInputElement>(`input[name="${idPrefix}apply-visa"]:checked`)?.value;
    const travelRadio = form.querySelector<HTMLInputElement>(`input[name="${idPrefix}apply-travel"]:checked`)?.value;
    const cvInput = form.querySelector<HTMLInputElement>(`[id="${idPrefix}apply-cv"]`);
    const cvFile = applyCvFile ?? cvInput?.files?.[0];

    if (!howTheyKnowVado || !startVadoRaw) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.errors.fieldsRequired'));
      return;
    }

    const startVadoMap: Record<string, string> = {
      inmediato: t('home.ctaContact.applyForm.immediately'),
      '1-mes': `1 ${t('home.ctaContact.applyForm.month')}`,
      '2-3-meses': `2-3 ${t('home.ctaContact.applyForm.months')}`,
      mas: t('home.ctaContact.applyForm.moreThan3Months'),
    };
    const startVado = startVadoMap[startVadoRaw] ?? startVadoRaw;

    const howMap: Record<string, string> = {
      linkedin: t('home.ctaContact.applyForm.heardLinkedIn'),
      referido: t('home.ctaContact.applyForm.heardReferral'),
      web: t('home.ctaContact.applyForm.heardWeb'),
      otro: t('home.ctaContact.subjectOptions.otros'),
    };
    const howTheyKnowVadoLabel = howMap[howTheyKnowVado] ?? howTheyKnowVado;

    const validVisa = validVisaRadio === 'si';
    const availabilityToTravel = travelRadio === 'si';

    if (!cvFile) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.applyForm.errors.cvRequired'));
      return;
    }
    if (cvFile.type !== 'application/pdf' || cvFile.size > MAX_CV_BYTES) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.applyForm.errors.cvInvalid'));
      return;
    }

    setSubmitStatus('loading');
    setSubmitError(null);

    const body = {
      fullName: applyStep1Data.fullName,
      email: applyStep1Data.email,
      phoneNumber: applyStep1Data.phoneNumber,
      role: applyStep1Data.role,
      howTheyKnowVado: howTheyKnowVadoLabel,
      agreement: true,
      startVado,
      validVisa,
      availabilityToTravel,
    };

    try {
      const fd = new FormData();
        fd.append('fullName', body.fullName);
        fd.append('email', body.email);
        fd.append('phoneNumber', body.phoneNumber);
        fd.append('role', body.role);
        fd.append('howTheyKnowVado', body.howTheyKnowVado);
        fd.append('agreement', 'true');
        fd.append('startVado', body.startVado);
        fd.append('validVisa', String(body.validVisa));
        fd.append('availabilityToTravel', String(body.availabilityToTravel));
        fd.append('cv', cvFile);

        const res = await fetch(DEVELOPERS_WITH_CV_URL, {
          method: 'POST',
          body: fd,
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg = data?.message ?? data?.error ?? res.statusText;
          throw new Error(msg);
        }
      setSubmitStatus('success');
      setShowApplyForm(false);
      setApplyStep(1);
      setApplyStep1Data(null);
      setApplyCvFile(null);
      form.reset();
      if (applyCvInputRef.current) applyCvInputRef.current.value = '';
    } catch (err) {
      setSubmitStatus('error');
      setSubmitError(err instanceof Error ? err.message : t('home.ctaContact.errors.generic'));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isInApplyFlow && applyStep === 2) {
      await handleApplySubmit(e);
      return;
    }
    if (isPostularse) return;
    await handleContactSubmit();
  };

  const handleContactSubmit = async () => {
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

    const errors: { email?: string; phone?: string } = {};
    if (!isValidEmail(email)) errors.email = t('home.ctaContact.errors.emailInvalid');
    if (!isValidPhone(phone)) errors.phone = t('home.ctaContact.errors.phoneInvalid');
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setSubmitStatus('error');
      setSubmitError(
        errors.email && errors.phone
          ? `${t('home.ctaContact.errors.emailInvalid')} ${t('home.ctaContact.errors.phoneInvalid')}`
          : errors.email ?? errors.phone ?? t('home.ctaContact.errors.fieldsRequired'),
      );
      return;
    }
    if (!fullName || !company || !message) {
      setSubmitStatus('error');
      setSubmitError(t('home.ctaContact.errors.fieldsRequired'));
      return;
    }

    setFieldErrors({});
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
            onSubmit={handleFormSubmit}
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
                    value={applyStep1Data?.fullName ?? ''}
                    onChange={(e) =>
                      setApplyStep1Data((prev) => ({
                        ...(prev ?? { fullName: '', email: '', phoneNumber: '', role: '' }),
                        fullName: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-email`}>{t('home.ctaContact.email')}</Label>
                  <Input
                    id={`${idPrefix}apply-email`}
                    type="email"
                    placeholder={t('home.ctaContact.emailPlaceholder')}
                    className={cn('h-10 rounded-lg', fieldErrors.email && 'border-destructive focus-visible:ring-destructive')}
                    value={applyStep1Data?.email ?? ''}
                    onChange={(e) => {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      setApplyStep1Data((prev) => ({
                        ...(prev ?? { fullName: '', email: '', phoneNumber: '', role: '' }),
                        email: e.target.value,
                      }));
                    }}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? `${idPrefix}apply-email-error` : undefined}
                  />
                  {fieldErrors.email && (
                    <p id={`${idPrefix}apply-email-error`} className="text-destructive text-sm" role="alert">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-phone`}>{t('home.ctaContact.phone')}</Label>
                  <Input
                    id={`${idPrefix}apply-phone`}
                    type="tel"
                    placeholder={t('home.ctaContact.phonePlaceholder')}
                    className={cn('h-10 rounded-lg', fieldErrors.phone && 'border-destructive focus-visible:ring-destructive')}
                    value={applyStep1Data?.phoneNumber ?? ''}
                    onChange={(e) => {
                      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                      setApplyStep1Data((prev) => ({
                        ...(prev ?? { fullName: '', email: '', phoneNumber: '', role: '' }),
                        phoneNumber: e.target.value,
                      }));
                    }}
                    aria-invalid={!!fieldErrors.phone}
                    aria-describedby={fieldErrors.phone ? `${idPrefix}apply-phone-error` : undefined}
                  />
                  {fieldErrors.phone && (
                    <p id={`${idPrefix}apply-phone-error`} className="text-destructive text-sm" role="alert">
                      {fieldErrors.phone}
                    </p>
                  )}
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
                    value={applyStep1Data?.role ?? ''}
                    onChange={(e) =>
                      setApplyStep1Data((prev) => ({
                        ...(prev ?? { fullName: '', email: '', phoneNumber: '', role: '' }),
                        role: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                    onClick={handleContinueToStep2}
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
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="text-muted-foreground hover:text-foreground inline-flex cursor-help"
                          aria-label={t('home.ctaContact.applyForm.visaInfo')}
                        >
                          <Info className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent sideOffset={6} className="max-w-[240px]">
                        {t('home.ctaContact.applyForm.visaInfo')}
                      </TooltipContent>
                    </Tooltip>
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
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`${idPrefix}apply-agreement`}
                    className="border-primary/50 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                  />
                  <Label
                    htmlFor={`${idPrefix}apply-agreement`}
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
                <div className="space-y-2">
                  <Label htmlFor={`${idPrefix}apply-cv`}>
                    {t('home.ctaContact.applyForm.attachCV')}
                    <span className="text-destructive"> *</span>
                  </Label>
                  <label
                    htmlFor={`${idPrefix}apply-cv`}
                    className={cn(
                      'border-primary/30 bg-primary/5 flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6',
                      'hover:bg-primary/10 transition-colors',
                    )}
                  >
                    {applyCvFile ? (
                      <>
                        <svg
                          className="text-primary size-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-foreground text-sm font-medium">
                          {applyCvFile.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({(applyCvFile.size / 1024).toFixed(1)} KB)
                        </span>
                        <span className="text-primary text-xs font-medium">
                          {t('home.ctaContact.applyForm.fileSelected')}
                        </span>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                    <input
                      ref={applyCvInputRef}
                      id={`${idPrefix}apply-cv`}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => setApplyCvFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {applyCvFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground -mt-1"
                      onClick={(e) => {
                        e.preventDefault();
                        setApplyCvFile(null);
                        if (applyCvInputRef.current) applyCvInputRef.current.value = '';
                      }}
                    >
                      {t('home.ctaContact.applyForm.removeFile')}
                    </Button>
                  )}
                </div>
                {submitStatus === 'error' && submitError && (
                  <p className="text-destructive text-sm" role="alert">
                    {submitError}
                  </p>
                )}
                <div className="flex justify-between gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="rounded-lg font-medium"
                    onClick={() => {
                    setFieldErrors({});
                    setSubmitError(null);
                    setApplyStep(1);
                  }}
                    disabled={submitStatus === 'loading'}
                  >
                    ← {t('home.ctaContact.applyForm.back')}
                  </Button>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-medium"
                    disabled={submitStatus === 'loading'}
                  >
                    {submitStatus === 'loading' ? t('home.ctaContact.sending') : t('home.ctaContact.submit')}
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
                  onClick={() => {
                    setShowApplyForm(true);
                    setApplyStep1Data((prev) => prev ?? { fullName: '', email: '', phoneNumber: '', role: '' });
                  }}
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
            className={cn('h-10 rounded-lg', fieldErrors.email && 'border-destructive focus-visible:ring-destructive')}
            disabled={submitStatus === 'loading'}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? `${idPrefix}email-error` : undefined}
            onInput={() => setFieldErrors((prev) => ({ ...prev, email: undefined }))}
          />
          {fieldErrors.email && (
            <p id={`${idPrefix}email-error`} className="text-destructive text-sm" role="alert">
              {fieldErrors.email}
            </p>
          )}
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
            className={cn('h-10 rounded-lg', fieldErrors.phone && 'border-destructive focus-visible:ring-destructive')}
            disabled={submitStatus === 'loading'}
            aria-invalid={!!fieldErrors.phone}
            aria-describedby={fieldErrors.phone ? `${idPrefix}phone-error` : undefined}
            onInput={() => setFieldErrors((prev) => ({ ...prev, phone: undefined }))}
          />
          {fieldErrors.phone && (
            <p id={`${idPrefix}phone-error`} className="text-destructive text-sm" role="alert">
              {fieldErrors.phone}
            </p>
          )}
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
