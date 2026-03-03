import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/baseupi';

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
        try {
            const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        } catch {
            console.error('Signature verification failed');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const event = payload.event;

        // Handle both nested 'data' and flat JSON structure based on BaseUPI docs
        const orderId = payload.data?.order_id || payload.order_id;
        const merchantOrderId = payload.data?.merchant_order_id || payload.merchant_order_id || payload.metadata?.merchant_order_id;

        // Use requested_amount_paise if available (original amount), 
        // fallback to amount_paise (final amount with offset)
        const amountPaise = payload.data?.requested_amount_paise || payload.requested_amount_paise ||
            payload.data?.amount_paise || payload.data?.amount ||
            payload.amount_paise || payload.amount;

        if (!merchantOrderId || !amountPaise) {
            console.error('Missing required fields in webhook payload', payload);
            return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
        }

        // Replay protection: check if we already processed this webhook
        const webhookId = `${merchantOrderId}:${event}`;
        if (processedWebhooks.has(webhookId)) {
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        if (event !== 'payment.completed') {
            // We only care about completed payments
            return NextResponse.json({ success: true, message: 'Event ignored' });
        }

        const supabase = createAdminClient();

        // Find the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('merchant_order_id', merchantOrderId)
            .single();

        if (orderError || !order) {
            console.error('Order not found:', merchantOrderId);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Validate amount matches
        // We check against order.amount_paise (which buy67 stores)
        // The webhook might send the original amount in requested_amount_paise
        // or the offset amount in amount_paise.
        const matchesRequest = order.amount_paise === (payload.data?.requested_amount_paise || payload.requested_amount_paise);
        const matchesFinal = order.amount_paise === (payload.data?.amount_paise || payload.amount_paise || payload.data?.amount || payload.amount);

        if (!matchesRequest && !matchesFinal) {
            console.error('Amount mismatch:', {
                expected: order.amount_paise,
                received_request: payload.data?.requested_amount_paise || payload.requested_amount_paise,
                received_final: payload.data?.amount_paise || payload.amount_paise,
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
                baseupi_order_id: orderId,
            })
            .eq('merchant_order_id', merchantOrderId);

        if (updateError) {
            console.error('Failed to update order:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        // Mark as processed
        processedWebhooks.add(webhookId);

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
