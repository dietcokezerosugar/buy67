import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    // Get creator's products
    const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('creator_id', user.id);

    const productIds = products?.map((p) => p.id) || [];
    const productCount = productIds.length;

    // Get orders for creator's products
    let totalRevenue = 0;
    let totalSales = 0;
    let recentOrders: Array<{
        id: string;
        merchant_order_id: string;
        buyer_email: string;
        amount_paise: number;
        status: string;
        created_at: string;
    }> = [];

    if (productIds.length > 0) {
        // Get completed orders through order_items
        const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
        price_paise,
        quantity,
        order_id,
        orders!inner (
          id,
          merchant_order_id,
          buyer_email,
          amount_paise,
          status,
          created_at
        )
      `)
            .in('product_id', productIds);

        if (orderItems) {
            const completedItems = orderItems.filter(
                (item) => (item.orders as unknown as { status: string })?.status === 'COMPLETED'
            );
            totalRevenue = completedItems.reduce(
                (sum, item) => sum + item.price_paise * item.quantity,
                0
            );
            totalSales = completedItems.length;

            // Deduplicate orders for recent list
            const orderMap = new Map<string, typeof recentOrders[0]>();
            orderItems.forEach((item) => {
                const order = item.orders as unknown as typeof recentOrders[0];
                if (order && !orderMap.has(order.id)) {
                    orderMap.set(order.id, order);
                }
            });
            recentOrders = Array.from(orderMap.values())
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 10);
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Welcome back! Here&apos;s your overview.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Total Sales
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{totalSales}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{productCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
                <Link
                    href="/dashboard/products/new"
                    className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
                >
                    + New Product
                </Link>
                <Link
                    href="/dashboard/payouts"
                    className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                >
                    Request Payout
                </Link>
            </div>

            {/* Recent Transactions */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    {recentOrders.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] py-8 text-center">
                            No transactions yet. Create your first product to start selling!
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--border))]">
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Order ID
                                        </th>
                                        <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                            Buyer
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
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                                        >
                                            <td className="py-3 px-2 font-mono text-xs">
                                                {order.merchant_order_id}
                                            </td>
                                            <td className="py-3 px-2">{order.buyer_email}</td>
                                            <td className="py-3 px-2 font-medium">
                                                {formatPrice(order.amount_paise)}
                                            </td>
                                            <td className="py-3 px-2">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${order.status === 'COMPLETED'
                                                            ? 'bg-emerald-500/10 text-emerald-600'
                                                            : 'bg-amber-500/10 text-amber-600'
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-[hsl(var(--muted-foreground))]">
                                                {new Date(order.created_at).toLocaleDateString()}
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
