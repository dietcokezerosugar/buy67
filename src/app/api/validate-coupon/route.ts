import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateCouponSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    const rateLimitResponse = withRateLimit(request, '/api/validate-coupon');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const body = await request.json();
        const parsed = validateCouponSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', parsed.data.code.toUpperCase())
            .eq('active', true)
            .single();

        if (error || !coupon) {
            return NextResponse.json(
                { success: false, error: 'Invalid or inactive coupon code' },
                { status: 404 }
            );
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json(
                { success: false, error: 'This coupon has expired' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                code: coupon.code,
                discount_percent: coupon.discount_percent,
            },
        });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
