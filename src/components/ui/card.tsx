import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
    className?: string;
    children: React.ReactNode;
    hover?: boolean;
}

export function Card({ className, children, hover = false }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm',
                hover && 'transition-all duration-200 hover:shadow-md hover:border-[hsl(var(--foreground))]/20 hover:-translate-y-0.5',
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
            {children}
        </h3>
    );
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <p className={cn('text-sm text-[hsl(var(--muted-foreground))]', className)}>
            {children}
        </p>
    );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('p-6 pt-0', className)}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('flex items-center p-6 pt-0', className)}>
            {children}
        </div>
    );
}
