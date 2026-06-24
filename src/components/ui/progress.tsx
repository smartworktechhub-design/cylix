'use client';

import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function Progress({ value, max = 100, className, barClassName, size = 'sm', showLabel = false }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="w-full">
      <div
        className={cn(
          'rounded-full bg-[rgba(148,163,184,0.1)] overflow-hidden',
          {
            'h-1': size === 'sm',
            'h-2': size === 'md',
            'h-3': size === 'lg',
          },
          className
        )}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-[#7B61FF] transition-all duration-700 ease-out',
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-[#94A3B8] font-mono">
          {value.toLocaleString()} / {max.toLocaleString()} ({percentage.toFixed(1)}%)
        </p>
      )}
    </div>
  );
}
