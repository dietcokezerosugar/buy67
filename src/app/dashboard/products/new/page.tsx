import { ProductForm } from '@/components/dashboard/product-form';

export default function NewProductPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
                <p className="text-[hsl(var(--muted-foreground))] mt-1">
                    Create a new digital product to sell
                </p>
            </div>
            <ProductForm />
        </div>
    );
}
