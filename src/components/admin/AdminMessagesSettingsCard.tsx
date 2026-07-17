import { useEffect, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';
import { cn } from '@/lib/utils';
import { SettingsCollapsibleCard } from '@/components/settings/settings-ui';

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
    <SettingsCollapsibleCard
      icon={MessageSquareText}
      title={t('adminSettings.messagesTitle')}
      description={t('adminSettings.messagesDescription')}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="admin-messages-welcome" className="text-xs">
            {t('adminSettings.messagesWelcomeLabel')}
          </Label>
          <Textarea
            id="admin-messages-welcome"
            rows={2}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder={t('adminSettings.messagesWelcomePlaceholder')}
            className="min-h-0 resize-y text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="admin-messages-out-of-hours" className="text-xs">
            {t('adminSettings.messagesOutOfHoursLabel')}
          </Label>
          <Textarea
            id="admin-messages-out-of-hours"
            rows={2}
            value={outOfHoursMessage}
            onChange={(e) => setOutOfHoursMessage(e.target.value)}
            placeholder={t('adminSettings.messagesOutOfHoursPlaceholder')}
            className="min-h-0 resize-y text-sm"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="admin-messages-closing" className="text-xs">
            {t('adminSettings.messagesClosingLabel')}
          </Label>
          <Textarea
            id="admin-messages-closing"
            rows={2}
            value={closingMessage}
            onChange={(e) => setClosingMessage(e.target.value)}
            placeholder={t('adminSettings.messagesClosingPlaceholder')}
            className="min-h-0 resize-y text-sm"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
        <p className="text-xs text-muted-foreground">{t('adminSettings.messagesMockNote')}</p>
        <Button
          type="button"
          size="sm"
          className={cn(ADMIN_PRIMARY_BTN_CLASS, 'shrink-0')}
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? t('adminSettings.messagesSaving') : t('adminSettings.messagesSave')}
        </Button>
      </div>
    </SettingsCollapsibleCard>
  );
}
