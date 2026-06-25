import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ children, variant = 'default', className, style }: BadgeProps) {
  return (
    <span
      style={style}
      className={cn(

        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-[rgba(148,163,184,0.1)] text-[#94A3B8]': variant === 'default',
          'bg-[rgba(0,255,178,0.1)] text-[#00FFB2]': variant === 'success',
          'bg-[rgba(255,184,0,0.1)] text-[#FFB800]': variant === 'warning',
          'bg-[rgba(255,92,122,0.1)] text-[#FF5C7A]': variant === 'danger',
          'bg-[rgba(0,229,255,0.1)] text-[#00E5FF]': variant === 'info',
          'bg-[rgba(123,97,255,0.1)] text-[#7B61FF]': variant === 'primary',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
