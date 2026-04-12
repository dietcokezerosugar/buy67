import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default async function AdminCustomersPage() {
    const supabase = createAdminClient();

    // Fetch all orders to aggregate customer data manually
    // This allows us to handle 'PENDING' orders and 'COMPLETED' orders for each phone number
    const { data: orders } = await supabase
        .from('orders')
        .select('buyer_phone, status, amount_paise, created_at')
        .order('created_at', { ascending: false });

    // Aggregate customer data
    const customerMap = (orders || []).reduce((acc, order) => {
        const phone = order.buyer_phone;
        if (!phone) return acc;

        if (!acc[phone]) {
            acc[phone] = {
                phone,
                totalOrders: 0,
                completedOrders: 0,
                totalSpent: 0,
                lastSeen: order.created_at,
                lastStatus: order.status
            };
        }

        acc[phone].totalOrders += 1;
        if (order.status === 'COMPLETED') {
            acc[phone].completedOrders += 1;
            acc[phone].totalSpent += order.amount_paise;
        }

        return acc;
    }, {} as Record<string, { 
        phone: string; 
        totalOrders: number; 
        completedOrders: number; 
        totalSpent: number; 
        lastSeen: string;
        lastStatus: string;
    }>);

    const customers = Object.values(customerMap).sort((a, b) => 
        new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Customer Directory</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Every WhatsApp number entered during checkout (Completed & Pending)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-indigo-500/5 border-indigo-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-indigo-300">Total Captured Numbers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{customers.length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500/5 border-emerald-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-300">Successful Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {customers.filter(c => c.completedOrders > 0).length}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-500/5 border-amber-500/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-widest text-amber-300">Pending Leads</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {customers.filter(c => c.completedOrders === 0).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Interaction Logs ({customers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-[hsl(var(--border))]">
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        WhatsApp Number
                                    </th>
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        Fulfillment
                                    </th>
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        Total Spent
                                    </th>
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))]">
                                        Last Activity
                                    </th>
                                    <th className="text-left py-3 px-2 font-medium text-[hsl(var(--muted-foreground))] text-right">
                                        History
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr
                                        key={customer.phone}
                                        className="border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--accent))]/50 transition-colors group"
                                    >
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-2 font-bold text-indigo-400">
                                                {customer.phone}
                                                <button 
                                                    onClick={() => {
                                                        // Note: In server component this won't work easily, 
                                                        // but we can add a client component wrapper if needed.
                                                        // For now, just plain text is fine.
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white"
                                                    title="Copy URL will be added in client component"
                                                >
                                                    COPY
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            {customer.completedOrders > 0 ? (
                                                <span className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Ready for Delivery
                                                </span>
                                            ) : (
                                                <span className="text-amber-500/60 font-medium italic">
                                                    Payment Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-2 font-medium">
                                            {formatPrice(customer.totalSpent)}
                                        </td>
                                        <td className="py-4 px-2 text-[hsl(var(--muted-foreground))]">
                                            {new Date(customer.lastSeen).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-2 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-bold text-white/40">
                                                    {customer.completedOrders} / {customer.totalOrders} PAID
                                                </span>
                                                <div className="flex gap-1">
                                                    {Array.from({ length: customer.totalOrders }).map((_, i) => (
                                                        <div 
                                                            key={i} 
                                                            className={`w-1.5 h-1.5 rounded-full ${i < customer.completedOrders ? 'bg-emerald-500' : 'bg-white/10'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </div>
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
