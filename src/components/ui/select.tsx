'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">{label}</label>
        )}
        <select
          ref={ref}
          className={cn(
            'w-full h-10 px-4 rounded-xl bg-[rgba(11,16,32,0.8)] border border-[rgba(0,229,255,0.1)] text-white text-sm transition-all duration-200 focus:outline-none focus:border-[rgba(0,229,255,0.3)] focus:shadow-[0_0_10px_rgba(0,229,255,0.05)] appearance-none cursor-pointer',
            error && 'border-[#FF5C7A]',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0B1020]">
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-[#FF5C7A]">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export { Select };
export type { SelectProps };
