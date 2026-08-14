'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'plum' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
      md: 'h-10 px-4 text-sm rounded-xl gap-2',
      lg: 'h-12 px-6 text-base rounded-xl gap-2.5 font-semibold',
      icon: 'h-10 w-10 p-0 rounded-xl justify-center items-center',
    };

    const variantStyles = {
      primary:
        'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm shadow-slate-950/10 border border-slate-800/80',
      plum:
        'bg-[#4a0e35] text-white hover:bg-[#5e1343] active:bg-[#390b29] shadow-md shadow-[#4a0e35]/20 border border-[#4a0e35]/30 hover:shadow-[#4a0e35]/30',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200/60',
      outline:
        'bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
      ghost:
        'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm border border-rose-700',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#4a0e35]/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
