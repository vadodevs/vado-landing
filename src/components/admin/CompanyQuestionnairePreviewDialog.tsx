import { useMemo, useState } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { COMPANY_CHAT_QUESTIONNAIRE_STEPS } from '@/lib/companyQuestionnaireConfig';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const PREVIEW_SAMPLE_ANSWERS: Record<number, string> = {
  0: 'Demo Corp',
  1: 'contacto@democorp.com',
  2: '+52 55 1234 5678',
  3: 'María López',
  4: 'Head of Product',
  5: 'Necesitamos automatizar el onboarding de clientes B2B.',
  6: 'Software a la medida',
  7: '1–3 meses',
  8: 'Sí',
  9: '4,500',
  10: 'En definición / discovery',
};

export function CompanyQuestionnairePreviewDialog({ open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState('');

  const step = COMPANY_CHAT_QUESTIONNAIRE_STEPS[stepIndex];
  const totalSteps = COMPANY_CHAT_QUESTIONNAIRE_STEPS.length;
  const isLast = stepIndex >= totalSteps - 1;

  const history = useMemo(() => {
    return COMPANY_CHAT_QUESTIONNAIRE_STEPS.slice(0, stepIndex).map((item) => ({
      prompt: item.prompt,
      answer: PREVIEW_SAMPLE_ANSWERS[item.id] ?? '—',
    }));
  }, [stepIndex]);

  const reset = () => {
    setStepIndex(0);
    setDraft('');
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const advance = (value?: string) => {
    if (!step) return;
    const nextValue = value ?? draft.trim();
    if (!nextValue && step.type !== 'choice') return;
    if (isLast) {
      handleOpenChange(false);
      return;
    }
    setStepIndex((i) => i + 1);
    setDraft('');
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent useAppDark className="flex max-h-[min(92vh,760px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="shrink-0 border-b border-border/70 px-5 py-4 text-left">
          <DialogTitle>{t('adminSettings.questionnairePreviewTitle')}</DialogTitle>
          <DialogDescription>{t('adminSettings.questionnairePreviewDescription')}</DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-4">
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg">
            <div className="flex items-center gap-2 border-b border-border/60 bg-[#0b2a55] px-4 py-3 text-white">
              <span className="flex size-8 items-center justify-center rounded-full bg-white/15">
                <Sparkles className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Vado</p>
                <p className="text-[11px] text-white/75">{t('adminSettings.questionnairePreviewWidgetHint')}</p>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {history.map((item) => (
                <div key={item.prompt} className="space-y-2">
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-3 py-2 text-sm text-foreground">
                    {item.prompt}
                  </div>
                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-[#0b2a55] px-3 py-2 text-sm text-white">
                    {item.answer}
                  </div>
                </div>
              ))}

              {step ? (
                <div className="space-y-3">
                  <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-muted px-3 py-2 text-sm text-foreground">
                    {step.prompt}
                  </div>

                  {step.type === 'choice' && step.options ? (
                    <div className="flex flex-wrap gap-2">
                      {step.options.map((option) => (
                        <Button
                          key={option}
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-auto whitespace-normal rounded-full px-3 py-1.5 text-left text-xs"
                          onClick={() => advance(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  ) : step.type === 'textarea' ? (
                    <Textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder={step.placeholder}
                      rows={3}
                      className="text-sm"
                    />
                  ) : (
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      type={step.type === 'email' ? 'email' : step.type === 'phone' ? 'tel' : 'text'}
                      placeholder={step.placeholder}
                      className="text-sm"
                    />
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-muted/15 px-4 py-3">
              <p className="text-[11px] text-muted-foreground">
                {t('adminSettings.questionnairePreviewProgress', {
                  current: Math.min(stepIndex + 1, totalSteps),
                  total: totalSteps,
                })}
              </p>
              {step && step.type !== 'choice' ? (
                <Button type="button" size="sm" onClick={() => advance()} disabled={!draft.trim() && !isLast}>
                  {isLast ? t('adminSettings.questionnairePreviewFinish') : t('adminSettings.questionnairePreviewNext')}
                </Button>
              ) : null}
            </div>
          </div>

          <p className="mx-auto mt-3 flex max-w-sm items-start gap-2 text-[11px] text-muted-foreground">
            <MessageCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {t('adminSettings.questionnairePreviewFootnote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
