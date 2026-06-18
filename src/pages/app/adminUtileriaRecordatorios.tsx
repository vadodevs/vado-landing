import { BellRing } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/app/AppShell';
export default function AppAdminUtileriaRecordatorios() {
    const { t } = useTranslation();
    return (<AppShell pathWithoutLang="/app/admin/utileria/recordatorios" title={t('sidebarDemo.navUtilitiesReminders')} description={t('seo.appAdminUtilitiesReminders')}>
      <section className="mx-auto w-full max-w-3xl space-y-4 pb-12 pt-0 md:pb-16">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
            <BellRing className="size-5" strokeWidth={1.75} aria-hidden/>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground">{t('adminUtilities.remindersTitle')}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('adminUtilities.remindersSubtitle')}</p>
          </div>
        </div>
        <p className="rounded-xl border border-dashed border-border/70 px-4 py-12 text-center text-sm text-muted-foreground">
          {t('adminUtilities.remindersEmpty')}
        </p>
      </section>
    </AppShell>);
}
