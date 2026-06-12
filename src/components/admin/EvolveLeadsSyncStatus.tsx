import { useTranslation } from 'react-i18next';
import { formatEvolveLastSync } from '@/lib/evolveLeadsAutoSync';

type Props = {
  lastSyncedAt: Date | null;
  backgroundSyncing?: boolean;
  className?: string;
};

export function EvolveLeadsSyncStatus({ lastSyncedAt, backgroundSyncing, className }: Props) {
  const { t, i18n } = useTranslation();
  if (!lastSyncedAt && !backgroundSyncing) return null;

  return (
    <div className={className}>
      {lastSyncedAt ? (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {t('adminLeads.evolveLastSync', {
            time: formatEvolveLastSync(lastSyncedAt, i18n.language),
          })}
        </p>
      ) : null}
      {backgroundSyncing ? (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {t('adminLeads.evolveSyncInProgress')}
        </p>
      ) : null}
    </div>
  );
}
