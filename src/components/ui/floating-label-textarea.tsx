'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

export interface FloatingLabelTextareaProps
  extends Omit<React.ComponentProps<typeof Textarea>, 'placeholder'> {
  label: string;
  value?: string;
}

const FloatingLabelTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(function FloatingLabelTextarea(
  { label, value: valueProp, id, className, onFocus, onBlur, onChange, ...props },
  ref,
) {
  const [focused, setFocused] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState('');
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : internalValue;
  const hasValue = (value ?? '').trim() !== '';
  const floated = focused || hasValue;

  const inputId = id ?? `floating-ta-${React.useId()}`;

  return (
    <div className="relative w-full">
      <Textarea
        ref={ref}
        id={inputId}
        aria-label={label}
        value={isControlled ? valueProp : undefined}
        onChange={(e) => {
          if (!isControlled) setInternalValue(e.target.value);
          onChange?.(e);
        }}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn('min-h-16 rounded-lg pt-5', className)}
        placeholder=" "
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          'pointer-events-none absolute left-3 transition-all duration-200',
          floated
            ? 'top-2 -translate-y-0 text-xs text-foreground'
            : 'top-4 -translate-y-0 text-base text-muted-foreground md:text-sm',
        )}
      >
        {label}
      </label>
    </div>
  );
});

export { FloatingLabelTextarea };
