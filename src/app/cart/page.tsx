'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, getTotalPaise } = useCartStore();
    const [email, setEmail] = useState('');
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const totalPaise = getTotalPaise();
    const discountedTotal = discount
        ? Math.round(totalPaise * (1 - discount / 100))
        : totalPaise;

    const handleValidateCoupon = async () => {
        if (!coupon.trim()) return;
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: coupon }),
            });

            const data = await res.json();
            if (data.success) {
                setDiscount(data.data.discount_percent);
                setCouponApplied(true);
            } else {
                setError(data.error);
                setDiscount(0);
                setCouponApplied(false);
            }
        } catch {
            setError('Failed to validate coupon');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        if (items.length === 0) {
            setError('Cart is empty');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const popup = window.open('about:blank', 'buy67_checkout', 'width=500,height=700');

            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                    })),
                    buyer_email: email,
                    coupon_code: couponApplied ? coupon : undefined,
                }),
            });

            const data = await res.json();

            if (data.success && data.data.checkout_url) {
                if (popup) {
                    popup.location.href = data.data.checkout_url;

                    // Listen for Success from BaseUPI popup
                    const paymentListener = (e: MessageEvent) => {
                        if (e.data?.type === 'baseupi:success' || e.data === 'baseupi:success') {
                            popup.close();
                            window.removeEventListener('message', paymentListener);
                            window.location.href = `/p/thank-you?order=${data.data.merchant_order_id}`;
                        }
                    };
                    window.addEventListener('message', paymentListener);

                } else {
                    window.location.href = data.data.checkout_url;
                }
                clearCart();
            } else {
                popup?.close();
                setError(data.error || 'Failed to create order');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(var(--background))]">
            <nav className="border-b border-[hsl(var(--border))] glass sticky top-0 z-40">
                <div className="mx-auto max-w-4xl px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tight">
                        BUY67
                    </Link>
                    <Link
                        href="/dashboard"
                        className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                    >
                        Dashboard
                    </Link>
                </div>
            </nav>

            <div className="mx-auto max-w-4xl px-6 py-12">
                <h1 className="text-3xl font-bold tracking-tight mb-8">Your Cart</h1>

                {items.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <p className="text-4xl mb-4">🛒</p>
                            <p className="text-lg font-medium mb-2">Your cart is empty</p>
                            <p className="text-[hsl(var(--muted-foreground))] mb-6">
                                Browse products to add items to your cart
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center h-10 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
                            >
                                Browse Products
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <Card key={item.product.id}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                {item.product.cover_image ? (
                                                    <img
                                                        src={item.product.cover_image}
                                                        alt={item.product.title}
                                                        className="h-16 w-16 rounded-lg object-cover border border-[hsl(var(--border))]"
                                                    />
                                                ) : (
                                                    <div className="h-16 w-16 rounded-lg bg-[hsl(var(--muted))] flex items-center justify-center text-2xl">
                                                        📦
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-semibold">{item.product.title}</h3>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                        {formatPrice(item.product.price_paise)} each
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.product.id, item.quantity - 1)
                                                        }
                                                        className="h-8 w-8 rounded border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-8 text-center font-medium">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() =>
                                                            updateQuantity(item.product.id, item.quantity + 1)
                                                        }
                                                        className="h-8 w-8 rounded border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.product.id)}
                                                    className="text-[hsl(var(--destructive))] hover:opacity-80 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <div>
                            <Card className="sticky top-24">
                                <CardHeader>
                                    <CardTitle>Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        {items.map((item) => (
                                            <div key={item.product.id} className="flex justify-between">
                                                <span className="text-[hsl(var(--muted-foreground))]">
                                                    {item.product.title} × {item.quantity}
                                                </span>
                                                <span>
                                                    {formatPrice(item.product.price_paise * item.quantity)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Coupon code"
                                            value={coupon}
                                            onChange={(e) => {
                                                setCoupon(e.target.value);
                                                setCouponApplied(false);
                                                setDiscount(0);
                                            }}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleValidateCoupon}
                                            className="shrink-0"
                                        >
                                            Apply
                                        </Button>
                                    </div>

                                    {couponApplied && (
                                        <p className="text-sm text-emerald-500">
                                            ✓ {discount}% off applied!
                                        </p>
                                    )}

                                    <div className="border-t border-[hsl(var(--border))] pt-4">
                                        {discount > 0 && (
                                            <div className="flex justify-between text-sm text-[hsl(var(--muted-foreground))] mb-1">
                                                <span>Subtotal</span>
                                                <span className="line-through">{formatPrice(totalPaise)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span>{formatPrice(discountedTotal)}</span>
                                        </div>
                                    </div>

                                    <Input
                                        placeholder="your@email.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />

                                    {error && (
                                        <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
                                    )}

                                    <Button
                                        onClick={handleCheckout}
                                        loading={loading}
                                        size="lg"
                                        className="w-full"
                                    >
                                        Checkout — {formatPrice(discountedTotal)}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
