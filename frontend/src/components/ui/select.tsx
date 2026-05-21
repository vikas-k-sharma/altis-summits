import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'h-12 w-full appearance-none rounded-xl border border-white/10 bg-white/5 px-4 pr-10 text-sm text-white shadow-sm transition-colors focus:border-cyan-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-slate-950',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
    </div>
  )
);

Select.displayName = 'Select';
