import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BaseUPI } from '@snc0x/baseupi';

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-baseupi-signature') || '';
        const webhookSecret = process.env.BASEUPI_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('BASEUPI_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const baseupi = new BaseUPI(process.env.BASEUPI_API_KEY || '');
        
        // Verify HMAC-SHA256 signature and parse event using the scoped SDK
        let event;
        try {
            event = baseupi.webhooks.constructEvent({
                payload: rawBody,
                signature: signature,
                secret: webhookSecret
            });
        } catch (err) {
            console.error('Invalid webhook signature or payload:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        if (event.event !== 'payment.completed') {
            return NextResponse.json({ success: true, message: 'Event ignored' });
        }

        const { order_id, merchant_order_id, amount_paise } = event;

        if (!merchant_order_id || !amount_paise) {
            console.error('Missing required fields in webhook payload', event);
            return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Find the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('merchant_order_id', merchant_order_id)
            .single();

        if (orderError || !order) {
            console.error('Order not found:', merchant_order_id);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Validate amount matches
        if (order.amount_paise !== amount_paise) {
            console.error('Amount mismatch:', {
                expected: order.amount_paise,
                received: amount_paise,
            });
            return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
        }

        // Check if already completed (idempotency)
        if (order.status === 'COMPLETED') {
            return NextResponse.json({ success: true, message: 'Already completed' });
        }

        // Update order status
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'COMPLETED',
                baseupi_order_id: order_id,
                updated_at: new Date().toISOString()
            })
            .eq('merchant_order_id', merchant_order_id);

        if (updateError) {
            console.error('Failed to update order:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
