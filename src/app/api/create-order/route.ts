import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createBaseUPIOrder } from '@/lib/baseupi';
import { createOrderSchema } from '@/lib/validations';
import { generateMerchantOrderId, getBaseUrl } from '@/lib/utils';
import { withRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    // Rate limit
    const rateLimitResponse = withRateLimit(request, '/api/create-order');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const body = await request.json();

        // Validate input
        const parsed = createOrderSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { items, buyer_email, coupon_code } = parsed.data;

        // Check env vars
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing Supabase env vars');
            return NextResponse.json(
                { success: false, error: 'Server configuration error: missing Supabase credentials' },
                { status: 500 }
            );
        }

        if (!process.env.BASEUPI_API_KEY) {
            console.error('Missing BASEUPI_API_KEY');
            return NextResponse.json(
                { success: false, error: 'Server configuration error: missing BaseUPI API key' },
                { status: 500 }
            );
        }

        const supabase = createAdminClient();

        // Fetch all products
        const productIds = items.map((i) => i.product_id);
        const { data: products, error: productError } = await supabase
            .from('products')
            .select('*')
            .in('id', productIds);

        if (productError) {
            console.error('Product fetch error:', productError);
            return NextResponse.json(
                { success: false, error: 'Failed to fetch products: ' + productError.message },
                { status: 500 }
            );
        }

        if (!products || products.length !== productIds.length) {
            return NextResponse.json(
                { success: false, error: 'One or more products not found' },
                { status: 404 }
            );
        }

        // Calculate total
        let totalPaise = 0;
        const orderItems = items.map((item) => {
            const product = products.find((p) => p.id === item.product_id)!;
            const itemTotal = product.price_paise * item.quantity;
            totalPaise += itemTotal;
            return {
                product_id: item.product_id,
                quantity: item.quantity,
                price_paise: product.price_paise,
            };
        });

        // Apply coupon if provided
        let discountPercent = 0;
        if (coupon_code) {
            const { data: coupon } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', coupon_code.toUpperCase())
                .eq('active', true)
                .single();

            if (!coupon) {
                return NextResponse.json(
                    { success: false, error: 'Invalid or inactive coupon' },
                    { status: 400 }
                );
            }

            if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
                return NextResponse.json(
                    { success: false, error: 'Coupon has expired' },
                    { status: 400 }
                );
            }

            discountPercent = coupon.discount_percent;
            totalPaise = Math.round(totalPaise * (1 - discountPercent / 100));
        }

        // Ensure minimum charge
        if (totalPaise < 100) {
            totalPaise = 100; // Minimum ₹1
        }

        // Generate merchant order ID
        const merchantOrderId = generateMerchantOrderId();
        const baseUrl = getBaseUrl();

        // Create BaseUPI order
        let baseupiResponse;
        try {
            baseupiResponse = await createBaseUPIOrder({
                merchant_order_id: merchantOrderId,
                amount: totalPaise,
                buyer_email,
                webhook_url: `${baseUrl}/webhook/baseupi`,
                redirect_url: `${baseUrl}/p/thank-you?order=${merchantOrderId}`,
            });
        } catch (baseupiError) {
            console.error('BaseUPI API error:', baseupiError);
            return NextResponse.json(
                { success: false, error: 'BaseUPI API failed: ' + (baseupiError instanceof Error ? baseupiError.message : 'Unknown error') },
                { status: 500 }
            );
        }

        if (!baseupiResponse.success) {
            console.error('BaseUPI order failed:', baseupiResponse);
            return NextResponse.json(
                { success: false, error: 'Failed to create payment order' },
                { status: 500 }
            );
        }

        // Save order to DB
        const { error: orderError, data: order } = await supabase
            .from('orders')
            .insert({
                merchant_order_id: merchantOrderId,
                product_id: items.length === 1 ? items[0].product_id : null,
                buyer_email,
                amount_paise: baseupiResponse.data.amount_paise || totalPaise,
                status: 'PENDING',
                baseupi_order_id: baseupiResponse.data.order_id,
            })
            .select()
            .single();

        if (orderError) {
            console.error('Order insert error:', orderError);
            return NextResponse.json(
                { success: false, error: 'Failed to save order: ' + orderError.message },
                { status: 500 }
            );
        }

        // Save order items
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(
                orderItems.map((item) => ({
                    order_id: order.id,
                    ...item,
                }))
            );

        if (itemsError) {
            console.error('Order items insert error:', itemsError);
            await supabase.from('orders').delete().eq('id', order.id);
            return NextResponse.json(
                { success: false, error: 'Failed to save order items: ' + itemsError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                merchant_order_id: merchantOrderId,
                checkout_url: baseupiResponse.data.checkout_url,
                amount_paise: totalPaise,
                discount_percent: discountPercent,
            },
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown') },
            { status: 500 }
        );
    }
}
