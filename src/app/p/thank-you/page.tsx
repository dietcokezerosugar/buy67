'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ThankYouContent() {
    const searchParams = useSearchParams();
    const merchantOrderId = searchParams.get('order');
    const [downloads, setDownloads] = useState<{ title: string; url: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!merchantOrderId) {
            setLoading(false);
            setError('No order ID found');
            return;
        }

        let cancelled = false;
        let attempts = 0;
        const maxAttempts = 100; // ~5 minutes of polling

        const fetchDownloads = async () => {
            if (cancelled) return;
            attempts++;

            try {
                // cache: 'no-store' is critical to prevent stale 403 responses
                const res = await fetch(`/api/download/${merchantOrderId}`, {
                    cache: 'no-store'
                });
                const data = await res.json();

                if (!cancelled) {
                    if (data.success) {
                        setDownloads(data.data.downloads);
                        setLoading(false);
                        setError('');
                        return; // Success! Stop polling.
                    } else {
                        // If it's 403, it means the order exists but isn't completed yet.
                        // We KEEP loading = true so the user stays on the "Processing" screen.
                        if (res.status === 403 && attempts < maxAttempts) {
                            setError('Waiting for payment verification...');
                        } else {
                            // Definitive error or timed out
                            setError(data.error || 'Downloads not available yet');
                            setLoading(false);
                            return; // Stop polling on definitive error.
                        }
                    }
                }
            } catch {
                if (!cancelled) {
                    setError('Unable to reach server. Retrying...');
                    if (attempts >= maxAttempts) {
                        setLoading(false);
                        return;
                    }
                }
            }

            // Schedule next poll
            if (!cancelled && attempts < maxAttempts) {
                setTimeout(fetchDownloads, 3000);
            }
        };

        fetchDownloads();

        return () => {
            cancelled = true;
        };
    }, [merchantOrderId]);

    return (
        <Card className="max-w-lg w-full">
            <CardContent className="p-8 text-center space-y-6">
                {loading ? (
                    <>
                        <div className="text-5xl animate-pulse-subtle">⏳</div>
                        <h1 className="text-2xl font-bold">Processing payment...</h1>
                        <p className="text-[hsl(var(--muted-foreground))] transition-all">
                            {error || "Please wait while we verify your payment. This usually takes a few seconds."}
                        </p>
                    </>
                ) : error && downloads.length === 0 ? (
                    <>
                        <div className="text-5xl">⏳</div>
                        <h1 className="text-2xl font-bold">Payment Processing</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            {error}. If you&apos;ve already paid, your download will be available shortly.
                            Try refreshing this page in a few seconds.
                        </p>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                        >
                            Refresh
                        </Button>
                    </>
                ) : (
                    <>
                        <div className="text-5xl">🎉</div>
                        <h1 className="text-2xl font-bold">Order Received!</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            Thank you for your purchase. Since this is a manual delivery, 
                            we will contact you on your WhatsApp number shortly with the 
                            **DLD Lab Manual**.
                        </p>
                        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300">
                            Expected delivery: 5-10 minutes
                        </div>
                    </>
                )}
                <Link
                    href="/"
                    className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors block pt-4"
                >
                    ← Back to BUY67
                </Link>
            </CardContent>
        </Card>
    );
}

export default function ThankYouPage() {
    return (
        <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center p-6">
            <Suspense
                fallback={
                    <Card className="max-w-lg w-full">
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="text-5xl animate-pulse-subtle">⏳</div>
                            <h1 className="text-2xl font-bold">Loading...</h1>
                        </CardContent>
                    </Card>
                }
            >
                <ThankYouContent />
            </Suspense>
        </div>
    );
}
