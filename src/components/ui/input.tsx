'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">{icon}</div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-10 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white placeholder:text-[#94A3B8]/50 text-sm transition-all duration-200 focus:outline-none focus:border-[rgba(0,229,255,0.3)] focus:shadow-[0_0_10px_rgba(0,229,255,0.05)]',
              icon && 'pl-10',
              error && 'border-[#FF5C7A]',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-[#FF5C7A]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
export type { InputProps };
