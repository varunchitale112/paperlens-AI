import { cn } from '@/src/lib/utils';

interface CardProps {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}

interface CardContentProps {
  className?: string;
  children?: React.ReactNode;
}

export function CardContent({ className, children }: CardContentProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function CardHeader({ className, children }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  className?: string;
  children?: React.ReactNode;
}

export function CardTitle({ className, children }: CardTitleProps) {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  );
}
