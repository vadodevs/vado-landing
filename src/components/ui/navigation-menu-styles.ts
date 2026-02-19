import { cva } from 'class-variance-authority';

export const navigationMenuTriggerStyle = cva(
  'group inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/60 hover:text-primary focus:bg-muted/60 focus:text-primary disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-muted/60 data-[state=open]:text-primary focus-visible:ring-ring/50 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
);
