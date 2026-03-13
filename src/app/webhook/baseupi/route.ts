import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/baseupi';
import type { BaseUPIWebhookPayload } from '@/types';

// Set of processed webhook IDs for replay protection
const processedWebhooks = new Set<string>();

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-baseupi-signature') || '';
        const webhookSecret = process.env.BASEUPI_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('BASEUPI_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Verify HMAC-SHA256 signature
        const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
        if (!isValid) {
            console.error('Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload: BaseUPIWebhookPayload = JSON.parse(rawBody);

        if (payload.event !== 'payment.completed') {
            return NextResponse.json({ success: true, message: 'Event ignored' });
        }

        const { order_id, merchant_order_id, amount_paise } = payload;

        if (!merchant_order_id || !amount_paise) {
            console.error('Missing required fields in webhook payload', payload);
            return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
        }

        // Replay protection: check if we already processed this webhook
        const webhookId = `${merchant_order_id}:payment.completed`;
        if (processedWebhooks.has(webhookId)) {
            return NextResponse.json({ success: true, message: 'Already processed' });
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
        // Note: The webhook amount_paise is the final amount (with offset)
        // We compare it with what the user actually paid
        if (order.amount_paise !== amount_paise) {
            console.error('Amount mismatch:', {
                expected: order.amount_paise,
                received: amount_paise,
            });
            return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
        }

        // Check if already completed (idempotency)
        if (order.status === 'COMPLETED') {
            processedWebhooks.add(webhookId);
            return NextResponse.json({ success: true, message: 'Already completed' });
        }

        // Update order status
        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'COMPLETED',
                baseupi_order_id: order_id,
            })
            .eq('merchant_order_id', merchant_order_id);

        if (updateError) {
            console.error('Failed to update order:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        // Mark as processed
        processedWebhooks.add(webhookId);
        return NextResponse.json({ success: true });

        // Cleanup old entries (keep last 10000)
        if (processedWebhooks.size > 10000) {
            const entries = Array.from(processedWebhooks);
            entries.slice(0, entries.length - 10000).forEach((e) => processedWebhooks.delete(e));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
