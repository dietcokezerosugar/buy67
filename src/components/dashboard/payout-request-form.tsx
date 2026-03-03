'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export function PayoutRequestForm({ availableBalance }: { availableBalance: number }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const amountPaise = Math.round(parseFloat(amount) * 100);
        if (isNaN(amountPaise) || amountPaise < 10000) {
            setError('Minimum payout is ₹100');
            setLoading(false);
            return;
        }

        if (amountPaise > availableBalance) {
            setError('Amount exceeds available balance');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/payouts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount_paise: amountPaise }),
            });

            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to request payout');

            setAmount('');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to request payout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Request Payout</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex items-end gap-4">
                    <div className="flex-1">
                        <Input
                            label={`Amount (₹) — Available: ${formatPrice(availableBalance)}`}
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="100.00"
                            step="0.01"
                            min="100"
                            required
                            error={error}
                        />
                    </div>
                    <Button type="submit" loading={loading}>
                        Request
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
