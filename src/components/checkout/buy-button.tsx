'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

interface BuyButtonProps {
    product: Product;
}

export function BuyButton({ product }: BuyButtonProps) {
    const [email, setEmail] = useState('');
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const addItem = useCartStore((state) => state.addItem);

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

    const handleBuyNow = async () => {
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Open popup first
            const popup = window.open('about:blank', 'buy67_checkout', 'width=500,height=700');

            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: [{ product_id: product.id, quantity: 1 }],
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

    const discountedPrice = discount
        ? Math.round(product.price_paise * (1 - discount / 100))
        : product.price_paise;

    return (
        <div className="space-y-4">
            <Input
                placeholder="your@email.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

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
                    loading={loading}
                    className="shrink-0"
                >
                    Apply
                </Button>
            </div>

            {couponApplied && (
                <div className="text-sm text-emerald-500 flex items-center gap-1">
                    ✓ {discount}% off applied!
                    <span className="text-[hsl(var(--muted-foreground))] line-through ml-2">
                        {formatPrice(product.price_paise)}
                    </span>
                    <span className="font-bold ml-1">{formatPrice(discountedPrice)}</span>
                </div>
            )}

            {error && (
                <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>
            )}

            <Button
                onClick={handleBuyNow}
                loading={loading}
                size="lg"
                className="w-full"
            >
                Buy Now — {formatPrice(discountedPrice)}
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => addItem(product)}
            >
                Add to Cart
            </Button>
        </div>
    );
}
