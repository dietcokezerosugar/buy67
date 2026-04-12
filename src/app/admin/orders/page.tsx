import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default async function AdminOrdersPage() {
    const supabase = createAdminClient();

    const { data: orders } = await supabase
        .from('orders')
        .select('*, order_items(product_id, quantity, price_paise, products(title))')
        .order('created_at', { ascending: false })
        .limit(100);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    All platform orders
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders ({orders?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[hsl(var(--border))]">
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        Order ID
                                    </th>
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        Products
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
                                {orders?.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                                    >
                                        <td className="py-3 px-2 font-mono text-xs">
                                            {order.merchant_order_id}
                                        </td>
                                        <td className="py-3 px-2">
                                            {order.order_items?.map((item: { product_id: string; quantity: number; products: { title: string } | null }, i: number) => (
                                                <div key={i} className="text-xs">
                                                    {(item.products as { title: string } | null)?.title || 'Unknown'} × {item.quantity}
                                                </div>
                                            ))}
                                        </td>
                                        <td className="py-3 px-2 text-indigo-400 font-medium">{order.buyer_phone || '-'}</td>
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
                </CardContent>
            </Card>
        </div>
    );
}
