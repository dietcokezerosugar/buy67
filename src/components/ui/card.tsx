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
                'glass rounded-[2rem] text-white shadow-2xl relative overflow-hidden transition-all duration-500',
                hover && 'hover:border-white/20 hover:shadow-white/5 hover:-translate-y-1',
                className
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('flex flex-col space-y-1.5 p-8', className)}>
            {children}
        </div>
    );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <h3 className={cn('text-xl font-bold font-outfit leading-none tracking-tight', className)}>
            {children}
        </h3>
    );
}

export function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <p className={cn('text-sm text-white/40 font-medium', className)}>
            {children}
        </p>
    );
}

export function CardContent({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('p-8 pt-0', className)}>
            {children}
        </div>
    );
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
    return (
        <div className={cn('flex items-center p-8 pt-0', className)}>
            {children}
        </div>
    );
}
