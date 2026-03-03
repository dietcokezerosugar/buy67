import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { DeleteProductButton } from '@/components/dashboard/delete-product-button';

export default async function ProductsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-[hsl(var(--destructive))]">Failed to load products.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-[hsl(var(--muted-foreground))] mt-1">
                        Manage your digital products
                    </p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
                >
                    + New Product
                </Link>
            </div>

            {!products || products.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <p className="text-4xl mb-4">📦</p>
                        <p className="text-lg font-medium mb-2">No products yet</p>
                        <p className="text-[hsl(var(--muted-foreground))] mb-6">
                            Create your first digital product to start selling
                        </p>
                        <Link
                            href="/dashboard/products/new"
                            className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
                        >
                            Create Product
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {products.map((product) => (
                        <Card key={product.id} hover>
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        {product.cover_image ? (
                                            <img
                                                src={product.cover_image}
                                                alt={product.title}
                                                className="h-16 w-16 rounded-lg object-cover border border-[hsl(var(--border))]"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center text-2xl">
                                                📦
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-semibold">{product.title}</h3>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))] mt-0.5">
                                                {product.slug}
                                            </p>
                                            <p className="text-lg font-bold mt-1">
                                                {formatPrice(product.price_paise)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/p/${product.slug}`}
                                            target="_blank"
                                            className="inline-flex items-center h-9 px-3 text-sm rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            href={`/dashboard/products/${product.id}/edit`}
                                            className="inline-flex items-center h-9 px-3 text-sm rounded-lg border border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <DeleteProductButton productId={product.id} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
