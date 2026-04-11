import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    children: React.ReactNode;
}

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    className,
    children,
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center font-bold tracking-tight rounded-xl transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]';

    const variants = {
        primary:
            'bg-white text-black hover:bg-white/90 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]',
        secondary:
            'bg-white/5 border border-white/5 text-white hover:bg-white/10',
        outline:
            'border border-white/10 bg-transparent hover:bg-white/5 text-white',
        ghost:
            'hover:bg-white/5 text-white/70 hover:text-white',
        destructive:
            'bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20',
    };

    const sizes = {
        sm: 'h-9 px-4 text-xs gap-2',
        md: 'h-11 px-6 text-sm gap-2',
        lg: 'h-14 px-8 text-base gap-3',
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                </svg>
            )}
            {children}
        </button>
    );
}
