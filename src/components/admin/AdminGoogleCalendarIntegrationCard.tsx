import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { GoogleCalendarLogo } from '@/components/admin/integrationBrandLogos';
import { cn } from '@/lib/utils';
import { ADMIN_PRIMARY_BTN_CLASS } from '@/lib/adminVadoUi';

export function AdminGoogleCalendarIntegrationCard() {
  const { t } = useTranslation();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (connected) return;
    setConnecting(true);
    window.setTimeout(() => {
      setConnecting(false);
      setConnected(true);
      toast.success(t('adminSettings.googleCalendarMockConnected'));
    }, 900);
  };

  return (
    <article className="scroll-mt-24 rounded-xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white p-2 shadow-sm dark:bg-zinc-950">
          <GoogleCalendarLogo className="size-8" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">
              {t('adminSettings.googleCalendarTitle')}
            </h3>
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
              )}
            >
              {connected
                ? t('adminSettings.googleCalendarConnected')
                : t('adminSettings.googleCalendarDisconnected')}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('adminSettings.googleCalendarDescription')}
          </p>
        </div>
        <Button
          type="button"
          className={cn(ADMIN_PRIMARY_BTN_CLASS, 'shrink-0')}
          disabled={connected || connecting}
          onClick={handleConnect}
        >
          {connecting
            ? t('adminSettings.googleCalendarConnecting')
            : connected
              ? t('adminSettings.googleCalendarConnected')
              : t('adminSettings.googleCalendarConnect')}
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{t('adminSettings.googleCalendarMockNote')}</p>
    </article>
  );
}
