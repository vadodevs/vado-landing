import { cn } from '@/lib/utils';

interface CenterContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function CenterContainer({ children, className }: CenterContainerProps) {
  return (
    <div
      className={cn(
        'w-full min-w-0 max-w-6xl mx-auto',
        'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12',
        className
      )}
    >
      {children}
    </div>
  );
}
