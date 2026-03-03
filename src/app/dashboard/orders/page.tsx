import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function OrdersPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    // Get creator's products
    const { data: products } = await supabase
        .from('products')
        .select('id, title')
        .eq('creator_id', user.id);

    const productIds = products?.map((p) => p.id) || [];
    const productMap = new Map(products?.map((p) => [p.id, p.title]) || []);

    let orders: Array<{
        id: string;
        merchant_order_id: string;
        buyer_email: string;
        amount_paise: number;
        status: string;
        created_at: string;
        order_items: Array<{
            product_id: string;
            quantity: number;
            price_paise: number;
        }>;
    }> = [];

    if (productIds.length > 0) {
        const { data: orderItems } = await supabase
            .from('order_items')
            .select(`
        product_id,
        quantity,
        price_paise,
        orders!inner (
          id,
          merchant_order_id,
          buyer_email,
          amount_paise,
          status,
          created_at
        )
      `)
            .in('product_id', productIds)
            .order('created_at', { ascending: false, referencedTable: 'orders' });

        if (orderItems) {
            const orderMap = new Map<string, typeof orders[0]>();
            orderItems.forEach((item) => {
                const order = item.orders as unknown as { id: string; merchant_order_id: string; buyer_email: string; amount_paise: number; status: string; created_at: string };
                if (!orderMap.has(order.id)) {
                    orderMap.set(order.id, { ...order, order_items: [] });
                }
                orderMap.get(order.id)!.order_items.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_paise: item.price_paise,
                });
            });
            orders = Array.from(orderMap.values()).sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Track your product orders
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {orders.length === 0 ? (
                        <p className="text-sm text-[hsl(var(--muted-foreground))] py-8 text-center">
                            No orders yet. Share your product links to start selling!
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
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors"
                                        >
                                            <td className="py-3 px-2 font-mono text-xs">
                                                {order.merchant_order_id}
                                            </td>
                                            <td className="py-3 px-2">
                                                {order.order_items.map((item, i) => (
                                                    <div key={i} className="text-xs">
                                                        {productMap.get(item.product_id) || 'Unknown'} × {item.quantity}
                                                    </div>
                                                ))}
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
