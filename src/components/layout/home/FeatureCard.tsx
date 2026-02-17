import { cn } from '@/lib/utils';

type FeatureCardProps = {
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
  className?: string;
};

export function FeatureCard({ iconSrc, iconAlt, title, description, className }: FeatureCardProps) {
  return (
    <div className={cn('flex flex-col items-start gap-4 rounded-xl px-5 py-6', className)}>
      <div className="flex w-full shrink-0 items-center justify-center">
        <img src={iconSrc} alt={iconAlt} className="size-24 object-contain" />
      </div>
      <h3 className="text-lg leading-tight font-bold text-[#19314c]">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}
