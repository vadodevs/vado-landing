import { useEffect, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import { cn } from '@/lib/utils';

export function AdminMessagesSettingsCard() {
  const { t } = useTranslation();
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [outOfHoursMessage, setOutOfHoursMessage] = useState('');
  const [closingMessage, setClosingMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWelcomeMessage(t('adminSettings.messagesWelcomeDefault'));
    setOutOfHoursMessage(t('adminSettings.messagesOutOfHoursDefault'));
    setClosingMessage(t('adminSettings.messagesClosingDefault'));
  }, [t]);

  const handleSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast.success(t('adminSettings.messagesMockSaved'));
    }, 600);
  };

  return (
    <article className="scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
          <MessageSquareText className="size-6" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {t('adminSettings.messagesTitle')}
            </h3>
            <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wide">
              {t('adminSettings.messagesMockBadge')}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('adminSettings.messagesDescription')}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="admin-messages-welcome">{t('adminSettings.messagesWelcomeLabel')}</Label>
          <Textarea
            id="admin-messages-welcome"
            rows={3}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder={t('adminSettings.messagesWelcomePlaceholder')}
            className="resize-y rounded-xl"
          />
          <p className="text-xs text-muted-foreground">{t('adminSettings.messagesWelcomeHint')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-messages-out-of-hours">
            {t('adminSettings.messagesOutOfHoursLabel')}
          </Label>
          <Textarea
            id="admin-messages-out-of-hours"
            rows={3}
            value={outOfHoursMessage}
            onChange={(e) => setOutOfHoursMessage(e.target.value)}
            placeholder={t('adminSettings.messagesOutOfHoursPlaceholder')}
            className="resize-y rounded-xl"
          />
          <p className="text-xs text-muted-foreground">{t('adminSettings.messagesOutOfHoursHint')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-messages-closing">{t('adminSettings.messagesClosingLabel')}</Label>
          <Textarea
            id="admin-messages-closing"
            rows={2}
            value={closingMessage}
            onChange={(e) => setClosingMessage(e.target.value)}
            placeholder={t('adminSettings.messagesClosingPlaceholder')}
            className="resize-y rounded-xl"
          />
          <p className="text-xs text-muted-foreground">{t('adminSettings.messagesClosingHint')}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-5">
        <p className="text-xs text-muted-foreground">{t('adminSettings.messagesMockNote')}</p>
        <Button
          type="button"
          className={cn(ADMIN_PRIMARY_BTN_CLASS, 'shrink-0')}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? t('adminSettings.messagesSaving') : t('adminSettings.messagesSave')}
        </Button>
      </div>
    </article>
  );
}
