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
        buyer_phone: string;
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
          buyer_phone,
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
                const order = item.orders as unknown as { 
                    id: string; 
                    merchant_order_id: string; 
                    buyer_email: string; 
                    buyer_phone: string;
                    amount_paise: number; 
                    status: string; 
                    created_at: string 
                };
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

    // Customer aggregation logic
    const customerStats = orders.reduce((acc, order) => {
        if (order.status !== 'COMPLETED') return acc;
        const phone = order.buyer_phone || 'Unknown';
        if (!acc[phone]) {
            acc[phone] = { phone, orders: 0, spent: 0 };
        }
        acc[phone].orders += 1;
        acc[phone].spent += order.amount_paise;
        return acc;
    }, {} as Record<string, { phone: string; orders: number; spent: number }>);

    const summarizedCustomers = Object.values(customerStats).sort((a, b) => b.orders - a.orders);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Track your product orders
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
                <Card className="bg-emerald-500/5 border-emerald-500/10 shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Total Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{summarizedCustomers.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-indigo-500/5 border-indigo-500/10 shadow-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Repeat Buyers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {summarizedCustomers.filter(c => c.orders > 1).length}
                        </p>
                    </CardContent>
                </Card>
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
                                            WhatsApp
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
                                            <td className="py-3 px-2 font-medium text-indigo-400">
                                                {order.buyer_phone || '-'}
                                                {summarizedCustomers.find(c => c.phone === order.buyer_phone && c.orders > 1) && (
                                                    <span className="ml-2 text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded cursor-help" title="Repeat Customer">
                                                        ⭐️ {customerStats[order.buyer_phone].orders} orders
                                                    </span>
                                                )}
                                            </td>
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
