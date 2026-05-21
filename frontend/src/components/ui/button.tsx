import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost';
}

export function Button({
  className,
  variant = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-white text-slate-950 hover:bg-cyan-300',
        variant === 'secondary' && 'bg-white/10 text-white hover:bg-white/15',
        variant === 'ghost' && 'text-zinc-300 hover:bg-white/10 hover:text-white',
        className
      )}
      {...props}
    />
  );
}
