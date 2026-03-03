import type { BaseUPICreateOrderResponse } from '@/types';

const BASEUPI_API_URL = 'https://baseupi.netlify.app/api/v1';

interface CreateBaseUPIOrderParams {
    merchant_order_id: string;
    amount: number; // in paise
    buyer_email: string;
    webhook_url: string;
    redirect_url?: string;
}

export async function createBaseUPIOrder(
    params: CreateBaseUPIOrderParams
): Promise<BaseUPICreateOrderResponse> {
    const response = await fetch(`${BASEUPI_API_URL}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.BASEUPI_API_KEY || '',
            'Authorization': `Bearer ${process.env.BASEUPI_SECRET_KEY || ''}`,
        },
        body: JSON.stringify({
            merchant_order_id: params.merchant_order_id,
            amount_paise: params.amount,
            buyer_email: params.buyer_email,
            webhook_url: params.webhook_url,
            redirect_url: params.redirect_url,
            line_items: [{ name: 'Digital Product', amount_paise: params.amount, quantity: 1 }],
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BaseUPI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // The actual response from BaseUPI is flat, but our code expects it 
    // wrapped in { success: true, data: {...} }
    return {
        success: true,
        data: {
            order_id: data.order_id,
            checkout_url: data.checkout_url,
            amount_paise: data.amount_paise
        }
    };
}

export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
): boolean {
    if (!signature || !secret || !payload) return false;

    try {
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');

        if (signature.length !== expectedSignature.length) {
            return false;
        }

        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    } catch (e) {
        console.error('Signature verification error:', e);
        return false;
    }
}
