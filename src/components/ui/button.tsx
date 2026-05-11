import { cn } from '@/src/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
}

export function Button({ className, variant = 'default', size = 'default', children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-gray-900 text-white hover:bg-gray-700',
        variant === 'outline' && 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50',
        variant === 'ghost' && 'text-gray-900 hover:bg-gray-100',
        variant === 'destructive' && 'bg-red-600 text-white hover:bg-red-700',
        size === 'default' && 'h-10 px-4 py-2',
        size === 'sm' && 'h-8 px-3 text-xs',
        size === 'lg' && 'h-12 px-6',
        size === 'icon' && 'h-10 w-10',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
