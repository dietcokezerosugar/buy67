'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseUPIElements } from '@/components/checkout/BaseUPIElements';
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
    const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
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

            if (data.success && data.data.public_order_id) {
                setCheckoutOrderId(data.data.public_order_id);
            } else {
                setError(data.error || 'Failed to create order');
            }
        } catch {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = (order: any) => {
        setCheckoutOrderId(null);
        window.location.href = `/p/thank-you?order=${order.merchant_order_id || order.id}`;
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

            {checkoutOrderId ? (
                <div className="pt-2">
                    <BaseUPIElements 
                        orderId={checkoutOrderId}
                        onSuccess={handlePaymentSuccess}
                        onError={(err) => setError(err.message || 'Payment failed')}
                    />
                    <Button 
                        variant="ghost" 
                        className="w-full mt-4 text-xs text-[hsl(var(--muted-foreground))]"
                        onClick={() => setCheckoutOrderId(null)}
                    >
                        ← Change Email / Coupon
                    </Button>
                </div>
            ) : (
                <Button
                    onClick={handleBuyNow}
                    loading={loading}
                    size="lg"
                    className="w-full"
                >
                    Buy Now — {formatPrice(discountedPrice)}
                </Button>
            )}

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
