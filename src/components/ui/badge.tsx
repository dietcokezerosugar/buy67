import { cn } from '@/lib/utils';

interface BadgeProps {
    variant?: 'default' | 'success' | 'warning' | 'destructive' | 'outline';
    className?: string;
    children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
    const variants = {
        default:
            'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]',
        success:
            'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        warning:
            'bg-amber-500/10 text-amber-600 border-amber-500/20',
        destructive:
            'bg-red-500/10 text-red-600 border-red-500/20',
        outline:
            'border border-[hsl(var(--border))] text-[hsl(var(--foreground))]',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
