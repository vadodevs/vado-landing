import { cn } from '@/lib/utils';

interface CenterContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CenterContainer({ children, className }: CenterContainerProps) {
  return (
    <div
      className={cn(
        'w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}
