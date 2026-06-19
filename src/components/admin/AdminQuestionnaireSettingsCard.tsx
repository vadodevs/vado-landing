import { useState } from 'react';
import { ClipboardList, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CompanyQuestionnairePreviewDialog } from '@/components/admin/CompanyQuestionnairePreviewDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  COMPANY_CHAT_QUESTIONNAIRE_STEPS,
  type QuestionnaireFieldType,
} from '@/lib/companyQuestionnaireConfig';

const TYPE_LABEL_KEY: Record<QuestionnaireFieldType, string> = {
  text: 'adminSettings.questionnaireTypeText',
  email: 'adminSettings.questionnaireTypeEmail',
  phone: 'adminSettings.questionnaireTypePhone',
  textarea: 'adminSettings.questionnaireTypeTextarea',
  choice: 'adminSettings.questionnaireTypeChoice',
};

export function AdminQuestionnaireSettingsCard() {
  const { t } = useTranslation();
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <article className="scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
              <ClipboardList className="size-6" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-foreground">
                {t('adminSettings.questionnaireTitle')}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('adminSettings.questionnaireDescription')}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 rounded-xl px-3 text-[11px] font-semibold"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="size-3.5 shrink-0" aria-hidden />
            {t('adminSettings.questionnairePreview')}
          </Button>
        </div>

        <ol className="mt-6 space-y-3">
          {COMPANY_CHAT_QUESTIONNAIRE_STEPS.map((step, index) => (
            <li
              key={step.id}
              className="rounded-xl border border-border/70 bg-muted/10 px-4 py-3 dark:bg-muted/10"
            >
              <div className="flex flex-wrap items-start gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-semibold tabular-nums text-muted-foreground ring-1 ring-border/70">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {t(TYPE_LABEL_KEY[step.type])}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{step.prompt}</p>
                  {step.options?.length ? (
                    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {t('adminSettings.questionnaireOptions')}:
                      </span>{' '}
                      {step.options.join(' · ')}
                    </p>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-4 text-xs text-muted-foreground">{t('adminSettings.questionnaireNote')}</p>
      </article>

      <CompanyQuestionnairePreviewDialog open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  );
}
