import { cn } from '@/lib/utils';
import { FeatureCardPanel, type FeatureCardPanelProps } from './FeatureCardPanel';

export type FeatureCardsSectionLayoutProps = {
  /** Card principal (izquierda en desktop) */
  mainCard: FeatureCardPanelProps & { variant: 'main' };
  /** Dos cards secundarias (derecha en desktop, apiladas) */
  subCards: [
    FeatureCardPanelProps & { variant: 'sub' },
    FeatureCardPanelProps & { variant: 'sub' },
  ];
  /** Clase opcional para el contenedor de la sección */
  className?: string;
};

export function FeatureCardsSectionLayout({
  mainCard,
  subCards,
  className,
}: FeatureCardsSectionLayoutProps) {
  return (
    <div className={cn('flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6', className)}>
      <div className="flex lg:min-w-0 lg:flex-3">
        <FeatureCardPanel {...mainCard} className={cn(mainCard.className, 'h-full')} />
      </div>
      <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-2">
        <FeatureCardPanel {...subCards[0]} />
        <FeatureCardPanel {...subCards[1]} />
      </div>
    </div>
  );
}
