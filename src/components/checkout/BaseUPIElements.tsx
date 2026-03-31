'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BaseUPIPaymentElement } from '@snc0x/baseupi-react';

interface BaseUPIElementsProps {
    orderId: string;
    onSuccess: (order: any) => void;
    onError?: (error: any) => void;
    onReady?: () => void;
}

export function BaseUPIElements({ orderId, onSuccess, onError, onReady }: BaseUPIElementsProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleReady = () => {
        setLoading(false);
        onReady?.();
    };

    const handleError = (err: any) => {
        console.error('BaseUPI Element Error:', err);
        setError(err.message || 'An error occurred during payment');
        onError?.(err);
        setLoading(false);
    };

    return (
        <Card className="w-full max-w-md mx-auto overflow-hidden border-2 border-[hsl(var(--primary)/0.1)] shadow-xl glass">
            <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent-foreground))] bg-clip-text text-transparent">
                    Secure UPI Payment
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {error && (
                    <div className="p-4 mb-4 text-sm text-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.1)] rounded-lg border border-[hsl(var(--destructive)/0.2)]">
                        {error}
                    </div>
                )}

                <div className="relative min-h-[150px] flex flex-col items-center justify-center">
                    {loading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[hsl(var(--background)/0.5)] backdrop-blur-sm z-10 rounded-lg">
                            <svg
                                className="animate-spin h-8 w-8 text-[hsl(var(--primary))]"
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
                            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))] mt-4">
                                Initializing secure payment...
                            </p>
                        </div>
                    )}

                    <BaseUPIPaymentElement
                        orderId={orderId}
                        onSuccess={onSuccess}
                        onReady={handleReady}
                        className="w-full"
                        appearance={{
                            variables: {
                                colorPrimary: '#6366f1', // Our main Accent color
                                colorBackground: 'transparent',
                                colorText: '#111827',
                                fontFamily: "'Inter', sans-serif",
                                borderRadius: '8px'
                            }
                        }}
                    />
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-semibold opacity-70">
                    <span className="h-px w-8 bg-[hsl(var(--border))]" />
                    Secured by BaseUPI
                    <span className="h-px w-8 bg-[hsl(var(--border))]" />
                </div>
            </CardContent>
        </Card>
    );
}
