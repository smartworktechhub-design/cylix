import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className, hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgba(0,229,255,0.08)]',
        gradient
          ? 'bg-gradient-to-br from-[rgba(18,26,43,0.9)] to-[rgba(11,16,32,0.9)]'
          : 'bg-[rgba(18,26,43,0.6)]',
        hover && 'transition-all duration-300 hover:border-[rgba(0,229,255,0.2)] hover:shadow-[0_0_20px_rgba(0,229,255,0.05)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('px-6 pb-6', className)}>{children}</div>;
}
