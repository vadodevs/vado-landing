import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import type { DevTrackingViewModel } from '@/lib/devApplicationTracking';
import { cn } from '@/lib/utils';

type Props = {
  tracking: DevTrackingViewModel;
  className?: string;
  compact?: boolean;
  
  showMockNotice?: boolean;
};

function lineStepClasses(state: 'completed' | 'current' | 'upcoming'): { circle: string; line: string } {
  if (state === 'completed') {
    return {
      circle: 'border-sky-600 bg-sky-600 text-white',
      line: 'bg-sky-200',
    };
  }
  if (state === 'current') {
    return {
      circle: 'border-sky-600 bg-white text-sky-800 ring-2 ring-sky-200',
      line: 'bg-zinc-200',
    };
  }
  return {
    circle: 'border-zinc-200 bg-zinc-50 text-zinc-400',
    line: 'bg-zinc-200',
  };
}

function labelKey(
  id: 'applied' | 'viewed' | 'in_process' | 'rejected' | 'finished',
):
  | 'devEmpleosPage.trackingApplied'
  | 'devEmpleosPage.trackingViewed'
  | 'devEmpleosPage.trackingInProcess'
  | 'devEmpleosPage.trackingRejected'
  | 'devEmpleosPage.trackingFinished' {
  switch (id) {
    case 'applied':
      return 'devEmpleosPage.trackingApplied';
    case 'viewed':
      return 'devEmpleosPage.trackingViewed';
    case 'in_process':
      return 'devEmpleosPage.trackingInProcess';
    case 'rejected':
      return 'devEmpleosPage.trackingRejected';
    case 'finished':
      return 'devEmpleosPage.trackingFinished';
  }
}

export function DevApplicationTrackingBar({
  tracking,
  className,
  compact = false,
  showMockNotice = true,
}: Props) {
  const { t } = useTranslation();
  const main = tracking.mainLine;

  return (
    <div className={cn('space-y-3', className)} data-testid="dev-application-tracking">
      <div className="space-y-1">
        <p
          className={cn('font-medium text-zinc-800', compact ? 'text-xs' : 'text-sm')}
          id="dev-tracking-heading"
        >
          {t('devEmpleosPage.trackingHeading')}
        </p>
        {showMockNotice ? (
          <p className="text-[11px] leading-snug text-zinc-500">{t('devEmpleosPage.trackingMockNotice')}</p>
        ) : null}
      </div>

      <ol className="flex w-full list-none items-start justify-center gap-0" aria-describedby="dev-tracking-heading">
        {main.map((step, idx) => {
          const { circle, line: lineClass } = lineStepClasses(step.state);
          return (
            <li key={step.id} className="flex min-w-0 items-start">
              <div className="flex w-[min(7.5rem,28vw)] min-w-0 flex-col items-center text-center sm:w-[8.5rem]">
                <div
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                    circle,
                    compact && 'size-7 text-[10px]',
                  )}
                  aria-current={step.state === 'current' ? 'step' : undefined}
                >
                  {step.state === 'completed' ? (
                    <Check className="size-4" strokeWidth={2.5} aria-hidden />
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1.5 text-[11px] leading-tight',
                    step.state === 'upcoming' ? 'text-zinc-400' : 'text-zinc-700',
                    compact && 'text-[10px]',
                  )}
                >
                  {t(labelKey(step.id))}
                </span>
              </div>
              {idx < main.length - 1 ? (
                <div
                  className={cn('mt-4 h-0.5 w-2 shrink-0 self-start sm:mt-4 sm:w-8', lineClass)}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="pt-1">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {t('devEmpleosPage.trackingOutcomeLabel')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([tracking.terminal.rejected, tracking.terminal.finished] as const).map((tstep) => {
            const isCurrent = tstep.state === 'current';
            const isPending = tstep.state === 'pending';
            const isExcluded = tstep.state === 'excluded';
            return (
              <div
                key={tstep.id}
                className={cn(
                  'rounded-xl border px-2 py-2.5 text-center text-xs font-medium sm:py-2',
                  isCurrent && tstep.id === 'rejected' && 'border-red-200 bg-red-50 text-red-900',
                  isCurrent && tstep.id === 'finished' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
                  isPending && 'border-dashed border-zinc-200 bg-zinc-50/80 text-zinc-500',
                  isExcluded && 'border-zinc-100 bg-zinc-50/50 text-zinc-300 line-through',
                )}
              >
                {t(labelKey(tstep.id))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
