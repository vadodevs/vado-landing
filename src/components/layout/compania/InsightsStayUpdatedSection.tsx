import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'motion/react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { CenterContainer } from '@/components/layout/CenterContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/$/, '')
  : '';
/** Endpoint para suscripción al boletín. Ver newsletter.md */
const NEWSLETTER_API_URL = API_BASE ? `${API_BASE}/newsletter` : '';

const transition = { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const };

export function InsightsStayUpdatedSection() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    if (!NEWSLETTER_API_URL) {
      setStatus('error');
      setErrorMessage(t('insightsPage.stayUpdated.error'));
      return;
    }

    setStatus('loading');
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(NEWSLETTER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = data?.errors?.[0]?.message ?? data?.message ?? data?.error ?? res.statusText;
        throw new Error(msg);
      }

      setStatus('success');
      setEmail('');
      if (data.alreadyRegistered === true && data.message) {
        setSuccessMessage(data.message);
      } else {
        setSuccessMessage(t('insightsPage.stayUpdated.success'));
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : t('insightsPage.stayUpdated.error'));
    }
  };

  const showSuccess = status === 'success' && successMessage;

  return (
    <section className="py-14 md:py-20 lg:py-24">
      <CenterContainer>
        <motion.div
          className="w-full overflow-visible px-1 py-8 text-left md:py-12"
          initial={false}
          animate={{ opacity: 1 }}
        >
          <motion.p
            className="text-muted-foreground mb-2 text-xs font-semibold tracking-[0.2em] uppercase md:text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.05 }}
          >
            {t('insightsPage.stayUpdated.topLine')}
          </motion.p>
          <motion.h2
            className="mb-6 text-2xl leading-tight font-bold tracking-tight text-[#19314c] md:mb-8 md:text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.1 }}
          >
            {t('insightsPage.stayUpdated.titleLine1')}
            <span className="text-primary mt-1 block">
              {t('insightsPage.stayUpdated.titleLine2')}
            </span>
          </motion.h2>

          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.div
                key="success"
                className="flex flex-col gap-5"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={transition}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    className="text-primary mt-0.5 size-6 shrink-0 md:size-7"
                    strokeWidth={2}
                    aria-hidden
                  />
                  <p
                    className="text-foreground text-base leading-relaxed font-medium md:text-lg"
                    role="status"
                  >
                    {successMessage}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 w-fit rounded-xl px-5 py-2.5 font-medium transition-colors"
                  onClick={() => {
                    setStatus('idle');
                    setSuccessMessage(null);
                    setErrorMessage(null);
                  }}
                >
                  {t('insightsPage.stayUpdated.enterAnotherEmail')}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex w-full max-w-2xl flex-col gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={transition}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
                  <div className="flex flex-1 flex-col gap-1.5 sm:max-w-sm sm:pr-1">
                    <Label
                      htmlFor="insights-email"
                      className="text-muted-foreground text-sm font-medium"
                    >
                      {t('insightsPage.stayUpdated.emailLabel')}
                    </Label>
                    <div className="relative overflow-visible">
                      <Mail
                        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
                        aria-hidden
                      />
                      <Input
                        id="insights-email"
                        type="email"
                        placeholder={t('insightsPage.stayUpdated.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-input bg-background focus-visible:ring-primary h-11 rounded-xl border py-2.5 pr-4 pl-10 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        required
                        disabled={status === 'loading'}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 shrink-0 rounded-xl px-6 py-2.5 text-sm font-bold tracking-wide uppercase transition-colors disabled:opacity-70"
                  >
                    {status === 'loading' ? '...' : t('insightsPage.stayUpdated.subscribeButton')}
                  </Button>
                </div>
                <AnimatePresence>
                  {status === 'error' && errorMessage && (
                    <motion.p
                      className="text-destructive text-sm"
                      role="alert"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={transition}
                    >
                      {errorMessage}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </CenterContainer>
    </section>
  );
}
