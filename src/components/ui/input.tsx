import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export function Input({
    label,
    error,
    helperText,
    className,
    id,
    ...props
}: InputProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[hsl(var(--foreground))]"
                >
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={cn(
                    'flex h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm transition-colors',
                    'placeholder:text-[hsl(var(--muted-foreground))]',
                    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive))]',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{helperText}</p>
            )}
        </div>
    );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export function Textarea({
    label,
    error,
    className,
    id,
    ...props
}: TextareaProps) {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-[hsl(var(--foreground))]"
                >
                    {label}
                </label>
            )}
            <textarea
                id={inputId}
                className={cn(
                    'flex min-h-[100px] w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2 text-sm transition-colors',
                    'placeholder:text-[hsl(var(--muted-foreground))]',
                    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-1',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    error && 'border-[hsl(var(--destructive))] focus:ring-[hsl(var(--destructive))]',
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-[hsl(var(--destructive))]">{error}</p>
            )}
        </div>
    );
}
