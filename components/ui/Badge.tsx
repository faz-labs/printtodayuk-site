import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'plum' | 'uk-blue' | 'uk-red' | 'sameday' | 'discount' | 'outline' | 'success';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-800 border-slate-200',
    plum: 'bg-[#012169]/10 text-[#012169] border-[#012169]/20 font-semibold',
    'uk-blue': 'bg-[#012169]/10 text-[#012169] border-[#012169]/20 font-semibold',
    'uk-red': 'bg-[#C8102E] text-white border-red-700 font-bold shadow-xs',
    sameday: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold shadow-xs',
    discount: 'bg-[#C8102E] text-white border-red-700 font-bold shadow-xs',
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
