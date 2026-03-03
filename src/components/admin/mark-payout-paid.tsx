'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function MarkPayoutPaidButton({ payoutId }: { payoutId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleMarkPaid = async () => {
        if (!confirm('Mark this payout as PAID? This action cannot be undone.')) return;

        setLoading(true);
        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('payouts')
                .update({ status: 'PAID' })
                .eq('id', payoutId);

            if (error) throw error;
            router.refresh();
        } catch {
            alert('Failed to update payout status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            loading={loading}
            onClick={handleMarkPaid}
            className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
        >
            Mark as Paid
        </Button>
    );
}
