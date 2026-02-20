'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface FloatingLabelInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'placeholder'> {
  label: string;
  value?: string;
}

const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  function FloatingLabelInput(
    { label, value: valueProp, id, className, onFocus, onBlur, onChange, defaultValue, ...props },
    ref,
  ) {
    const [focused, setFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState((defaultValue as string) ?? '');
    const isControlled = valueProp !== undefined;
    const value = isControlled ? valueProp : internalValue;
    const hasValue = (value ?? '').trim() !== '';
    const floated = focused || hasValue;

    const inputId = id ?? `floating-${React.useId()}`;

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          id={inputId}
          aria-label={label}
          value={isControlled ? valueProp : undefined}
          defaultValue={isControlled ? undefined : defaultValue}
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
          className={cn('h-10 rounded-lg pt-3', className)}
          placeholder=" "
          {...props}
        />
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-3 transition-all duration-200',
            floated
              ? 'top-1.5 -translate-y-0 text-xs text-foreground'
              : 'top-1/2 -translate-y-1/2 text-base text-muted-foreground md:text-sm',
          )}
        >
          {label}
        </label>
      </div>
    );
  },
);

export { FloatingLabelInput };
