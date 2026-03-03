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

        const fetchDownloads = async () => {
            try {
                const res = await fetch(`/api/download/${merchantOrderId}`);
                const data = await res.json();

                if (!cancelled) {
                    if (data.success) {
                        setDownloads(data.data.downloads);
                        setLoading(false);
                    } else {
                        setError(data.error || 'Downloads not available yet');
                    }
                }
            } catch {
                if (!cancelled) {
                    setError('Failed to fetch downloads');
                }
            }
        };

        // Poll for a few seconds in case webhook hasn't arrived yet
        const interval = setInterval(fetchDownloads, 3000);
        fetchDownloads();

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [merchantOrderId]);

    return (
        <Card className="max-w-lg w-full">
            <CardContent className="p-8 text-center space-y-6">
                {loading ? (
                    <>
                        <div className="text-5xl animate-pulse-subtle">⏳</div>
                        <h1 className="text-2xl font-bold">Processing payment...</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            Please wait while we verify your payment. This usually takes a few seconds.
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
                        <h1 className="text-2xl font-bold">Thank you for your purchase!</h1>
                        <p className="text-[hsl(var(--muted-foreground))]">
                            Your download links are ready. Links expire in 60 seconds.
                        </p>
                        <div className="space-y-3">
                            {downloads.map((download, i) => (
                                <a
                                    key={i}
                                    href={download.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium hover:opacity-90 transition-opacity"
                                >
                                    ⬇ Download {download.title}
                                </a>
                            ))}
                        </div>
                    </>
                )}
                <Link
                    href="/"
                    className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors block"
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
