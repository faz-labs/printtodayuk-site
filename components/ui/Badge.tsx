import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'plum' | 'sameday' | 'discount' | 'outline' | 'success';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    plum: 'bg-[#4a0e35]/10 text-[#4a0e35] border-[#4a0e35]/20 font-medium',
    sameday: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold shadow-xs',
    discount: 'bg-rose-500 text-white border-rose-600 font-bold shadow-xs',
    outline: 'bg-transparent text-slate-600 border-slate-200',
    success: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border tracking-tight transition-colors',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
