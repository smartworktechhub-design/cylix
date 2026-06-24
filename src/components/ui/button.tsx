'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed',
          {
            'bg-[#00E5FF] text-[#050816] hover:bg-[#00E5FF]/90 active:scale-[0.98]':
              variant === 'primary',
            'bg-[#7B61FF] text-white hover:bg-[#7B61FF]/90 active:scale-[0.98]':
              variant === 'secondary',
            'bg-transparent text-[#94A3B8] hover:text-white hover:bg-white/5':
              variant === 'ghost',
            'border border-[rgba(0,229,255,0.2)] text-[#00E5FF] bg-transparent hover:bg-[rgba(0,229,255,0.08)]':
              variant === 'outline',
            'bg-[#FF5C7A] text-white hover:bg-[#FF5C7A]/90': variant === 'danger',
            'bg-[#00FFB2] text-[#050816] hover:bg-[#00FFB2]/90': variant === 'success',
          },
          {
            'h-8 px-3 text-xs gap-1.5': size === 'sm',
            'h-10 px-5 text-sm gap-2': size === 'md',
            'h-12 px-7 text-base gap-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
export type { ButtonProps };
