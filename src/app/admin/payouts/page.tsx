import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { MarkPayoutPaidButton } from '@/components/admin/mark-payout-paid';

export default async function AdminPayoutsPage() {
    const supabase = createAdminClient();

    const { data: payouts } = await supabase
        .from('payouts')
        .select('*, creator:profiles(full_name, username)')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Manage creator payout requests
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Payouts ({payouts?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {!payouts || payouts.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] py-8 text-center">
                            No payout requests yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--border))]">
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Creator
                                        </th>
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Amount
                                        </th>
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((payout) => {
                                        const creator = payout.creator as unknown as {
                                            full_name: string;
                                            username: string;
                                        } | null;

                                        return (
                                            <tr
                                                key={payout.id}
                                                className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                                            >
                                                <td className="py-3 px-2">
                                                    <div>
                                                        <p className="font-medium">{creator?.full_name}</p>
                                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                            @{creator?.username}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-2 font-medium">
                                                    {formatPrice(payout.amount_paise)}
                                                </td>
                                                <td className="py-3 px-2">
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${payout.status === 'PAID'
                                                                ? 'bg-emerald-500/10 text-emerald-600'
                                                                : 'bg-amber-500/10 text-amber-600'
                                                            }`}
                                                    >
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-[hsl(var(--muted-foreground))]">
                                                    {new Date(payout.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-2">
                                                    {payout.status === 'PENDING' && (
                                                        <MarkPayoutPaidButton payoutId={payout.id} />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
