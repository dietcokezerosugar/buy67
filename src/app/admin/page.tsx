import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';

export default async function AdminPage() {
    const supabase = createAdminClient();

    // Count users
    const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Count products
    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    // Get all completed orders
    const { data: orders } = await supabase
        .from('orders')
        .select('amount_paise')
        .eq('status', 'COMPLETED');

    const totalRevenue = orders?.reduce((sum, o) => sum + o.amount_paise, 0) || 0;
    const orderCount = orders?.length || 0;

    // Pending payouts
    const { data: pendingPayouts } = await supabase
        .from('payouts')
        .select('amount_paise')
        .eq('status', 'PENDING');

    const pendingPayoutTotal =
        pendingPayouts?.reduce((sum, p) => sum + p.amount_paise, 0) || 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Platform-wide statistics
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{userCount || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Total Products
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{productCount || 0}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Platform Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {orderCount} completed orders
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                            Pending Payouts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-amber-500">
                            {formatPrice(pendingPayoutTotal)}
                        </p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                            {pendingPayouts?.length || 0} pending
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
