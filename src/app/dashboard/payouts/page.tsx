import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PayoutRequestForm } from '@/components/dashboard/payout-request-form';

export default async function PayoutsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    const { data: payouts } = await supabase
        .from('payouts')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

    // Calculate available balance (revenue - already requested payouts)
    const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('creator_id', user.id);

    const productIds = products?.map((p) => p.id) || [];
    let totalRevenue = 0;

    if (productIds.length > 0) {
        const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
        price_paise,
        quantity,
        orders!inner (status)
      `)
            .in('product_id', productIds);

        if (orderItems) {
            totalRevenue = orderItems
                .filter((item) => (item.orders as unknown as { status: string })?.status === 'COMPLETED')
                .reduce((sum, item) => sum + item.price_paise * item.quantity, 0);
        }
    }

    const totalRequested = payouts?.reduce((sum, p) => sum + p.amount_paise, 0) || 0;
    const availableBalance = totalRevenue - totalRequested;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Request payouts for your earnings
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Total Requested
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatPrice(totalRequested)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Available Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-emerald-500">
                            {formatPrice(Math.max(0, availableBalance))}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {availableBalance >= 10000 && (
                <PayoutRequestForm availableBalance={availableBalance} />
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                    {!payouts || payouts.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] py-8 text-center">
                            No payouts requested yet.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--border))]">
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Amount
                                        </th>
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payouts.map((payout) => (
                                        <tr
                                            key={payout.id}
                                            className="border-b border-[hsl(var(--border))] last:border-0"
                                        >
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
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
