import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { BaseUPI } from '@snc0x/baseupi';

// Replay protection: check if we already processed this webhook
// Note: In serverless this only persists per instance, but status checks handle this anyway.
const processedWebhooks = new Set<string>();

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('x-baseupi-signature') || '';
        const webhookSecret = process.env.BASEUPI_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('[Webhook] BASEUPI_WEBHOOK_SECRET not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const baseupi = new BaseUPI(process.env.BASEUPI_API_KEY || '');
        
        // Verify HMAC-SHA256 signature and parse event using the SDK
        let payload;
        try {
            payload = baseupi.webhooks.constructEvent({
                payload: rawBody,
                signature: signature,
                secret: webhookSecret
            });
        } catch (err) {
            console.error('[Webhook] Invalid signature or payload:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        if (payload.event !== 'payment.completed') {
            console.log(`[Webhook] Ignoring event: ${payload.event}`);
            return NextResponse.json({ success: true, message: 'Event ignored' });
        }

        const { order_id, merchant_order_id, amount_paise } = payload;

        if (!merchant_order_id || !amount_paise) {
            console.error('[Webhook] Missing required fields in payload', payload);
            return NextResponse.json({ error: 'Invalid payload format' }, { status: 400 });
        }

        // Replay protection
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
            console.error('[Webhook] Order not found in DB:', merchant_order_id);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Validate amount — extremely lenient check (within 1000 paise / ₹10) 
        // to handle any smart offsets or rounding issues.
        const dbAmount = Number(order.amount_paise);
        const webhookAmount = Number(amount_paise);
        const amountDifference = Math.abs(dbAmount - webhookAmount);
        
        if (amountDifference > 1000) {
            console.error('[Webhook] Amount mismatch beyond tolerance:', {
                db_expected: dbAmount,
                webhook_received: webhookAmount,
                difference: amountDifference
            });
            // We return success anyway to stop retries if we found the order, 
            // but we don't complete it.
            return NextResponse.json({ error: 'Amount mismatch too high' }, { status: 400 });
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
                updated_at: new Date().toISOString()
            })
            .eq('merchant_order_id', merchant_order_id);

        if (updateError) {
            console.error('[Webhook] Failed to update order status:', updateError);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        // Mark as processed
        processedWebhooks.add(webhookId);
        
        // Cleanup old entries
        if (processedWebhooks.size > 1000) {
            const entries = Array.from(processedWebhooks);
            entries.slice(0, 100).forEach((e) => processedWebhooks.delete(e));
        }

        console.log(`[Webhook] Order ${merchant_order_id} marked as COMPLETED`);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Webhook] Internal error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
