import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { ProductForm } from '@/components/dashboard/product-form';

export default async function EditProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect('/');

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('creator_id', user.id)
        .single();

    if (!product) notFound();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Update your product details
                </p>
            </div>
            <ProductForm initialData={product} />
        </div>
    );
}
