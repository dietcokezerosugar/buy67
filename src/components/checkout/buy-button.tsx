'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BaseUPINativeCheckout } from './BaseUPINativeCheckout';
import type { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';

interface BuyButtonProps {
    product: Product;
}

export function BuyButton({ product }: BuyButtonProps) {
    const [phone, setPhone] = useState('+91');
    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checkoutOrderId, setCheckoutOrderId] = useState<string | null>(null);
    const [currentMerchantOrderId, setCurrentMerchantOrderId] = useState<string | null>(null);
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
        if (!phone.trim() || phone === '+91') {
            setError('Please enter your WhatsApp number to continue');
            return;
        }

        if (!/^\+91[6789]\d{9}$/.test(phone)) {
            setError('Invalid WhatsApp number. Must start with +91 followed by 10 digits.');
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
                    buyer_phone: phone,
                    coupon_code: couponApplied ? coupon : undefined,
                }),
            });

            const data = await res.json();

            if (data.success && data.data.public_order_id) {
                setCheckoutOrderId(data.data.public_order_id);
                setCurrentMerchantOrderId(data.data.merchant_order_id);
            } else {
                setError(data.error || 'Failed to create order');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setCheckoutOrderId(null);
        if (currentMerchantOrderId) {
            window.location.href = `/p/thank-you?order=${currentMerchantOrderId}`;
        } else {
            // Fallback just in case, though currentMerchantOrderId should be set
            window.location.href = `/p/thank-you?order=${product.slug || 'success'}`;
        }
    };

    const discountedPrice = discount
        ? Math.round(product.price_paise * (1 - discount / 100))
        : product.price_paise;

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                    WhatsApp Number
                </label>
                <Input
                    placeholder="+919876543210"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                        let val = e.target.value;
                        // Ensure it always starts with +91 and only contains digits after that
                        if (!val.startsWith('+91')) {
                            val = '+91' + val.replace(/\D/g, '');
                        } else {
                            const digits = val.slice(3).replace(/\D/g, '');
                            val = '+91' + digits;
                        }
                        // Limit to 10 digits after +91
                        if (val.length > 13) val = val.slice(0, 13);
                        setPhone(val);
                    }}
                    className="h-12 bg-[hsl(var(--background))] border-[hsl(var(--border))] focus:ring-primary/20"
                    required
                />
            </div>

            <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] px-1">
                    Have a coupon?
                </label>
                <div className="flex gap-2">
                    <Input
                        placeholder="CODE10"
                        value={coupon}
                        onChange={(e) => {
                            setCoupon(e.target.value);
                            setCouponApplied(false);
                            setDiscount(0);
                        }}
                        className="h-12 bg-[hsl(var(--background))] border-[hsl(var(--border))]"
                    />
                    <Button
                        variant="outline"
                        onClick={handleValidateCoupon}
                        disabled={loading || !coupon.trim()}
                        className="h-12 px-6 font-bold border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] shrink-0"
                    >
                        Apply
                    </Button>
                </div>
            </div>

            {couponApplied && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-500 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-medium">
                        ✓ {discount}% discount applied
                    </span>
                    <span className="font-bold">{formatPrice(discountedPrice)}</span>
                </div>
            )}

            {error && (
                <div className="p-3 rounded-lg bg-[hsl(var(--destructive)/0.1)] border border-[hsl(var(--destructive)/0.2)] text-xs text-[hsl(var(--destructive))] font-medium">
                    {error}
                </div>
            )}

            <div className="pt-2">
                <BaseUPINativeCheckout
                    orderId={checkoutOrderId || ''}
                    open={!!checkoutOrderId}
                    onOpenChange={(open: boolean) => !open && setCheckoutOrderId(null)}
                    onSuccess={handlePaymentSuccess}
                />
                <Button
                    onClick={handleBuyNow}
                    disabled={loading}
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-lg shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.4)] transition-all duration-300 uppercase tracking-tight border border-white/10"
                >
                    {loading ? 'Starting Secure Flow...' : `Buy Now — ${formatPrice(discountedPrice)}`}
                </Button>
            </div>

            <Button
                variant="ghost"
                size="lg"
                className="w-full text-[hsl(var(--muted-foreground))] hover:text-white transition-colors text-sm font-bold uppercase tracking-widest opacity-60"
                onClick={() => addItem(product)}
            >
                Add to Cart
            </Button>

            <p className="text-[10px] text-center text-[hsl(var(--muted-foreground))] uppercase tracking-[0.2em] font-black opacity-30 mt-4">
                Powered by @snc0x BaseUPI
            </p>
        </div>
    );
}
