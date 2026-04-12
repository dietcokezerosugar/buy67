import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { BuyButton } from '@/components/checkout/buy-button';
import type { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: product } = await supabase
        .from('products')
        .select('title, description')
        .eq('slug', slug)
        .single();

    if (!product) return { title: 'Product Not Found' };

    return {
        title: `${product.title} | BUY67`,
        description: product.description.substring(0, 160),
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: product } = await supabase
        .from('products')
        .select('*, creator:profiles(username, full_name, avatar_url)')
        .eq('slug', slug)
        .single();

    if (!product) notFound();

    const creator = product.creator as unknown as {
        username: string;
        full_name: string;
        avatar_url: string | null;
    } | null;

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            {/* Nav */}
            <nav className="border-b border-[hsl(var(--border))] glass sticky top-0 z-40">
                <div className="mx-auto max-w-4xl px-6 h-16 flex items-center justify-between">
                    <a href="/" className="text-xl font-bold tracking-tight">
                        BUY67
                    </a>
                </div>
            </nav>

            <div className="mx-auto max-w-4xl px-6 py-12">
                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Product Info */}
                    <div className="lg:col-span-3 space-y-6">
                        {product.cover_image && (
                            <div className="rounded-xl overflow-hidden border border-[hsl(var(--border))]">
                                <img
                                    src={product.cover_image}
                                    alt={product.title}
                                    className="w-full aspect-video object-cover"
                                />
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                                {product.title}
                            </h1>
                        </div>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-[hsl(var(--muted-foreground))] leading-relaxed whitespace-pre-wrap">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    {/* Purchase Card */}
                    <div className="lg:col-span-2">
                        <div className="sticky top-24 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 space-y-6">
                            <div>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">Price</p>
                                <p className="text-4xl font-bold mt-1">
                                    {formatPrice(product.price_paise)}
                                </p>
                            </div>
                            <BuyButton product={product} />
                            <div className="space-y-3 pt-4 border-t border-[hsl(var(--border))]">
                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                    <span>🔒</span>
                                    <span>Secure payment via UPI</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                    <span>⚡</span>
                                    <span>Instant digital download</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                                    <span>💰</span>
                                    <span>Money-back guarantee</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
