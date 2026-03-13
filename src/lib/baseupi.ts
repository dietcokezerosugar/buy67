import type { BaseUPICreateOrderResponse } from '@/types';

const BASEUPI_URL = process.env.BASEUPI_URL || 'https://baseupi.netlify.app';

interface CreateBaseUPIOrderParams {
    merchant_order_id: string;
    amount_paise: number;
    customer_email: string;
    redirect_url: string;
    metadata?: Record<string, any>;
}

export async function createBaseUPIOrder(
    params: CreateBaseUPIOrderParams
): Promise<BaseUPICreateOrderResponse> {
    const response = await fetch(`${BASEUPI_URL}/api/v1/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.BASEUPI_API_KEY || '',
        },
        body: JSON.stringify({
            merchant_order_id: params.merchant_order_id,
            customer_email: params.customer_email,
            line_items: [
                {
                    name: "Order " + params.merchant_order_id,
                    amount_paise: params.amount_paise,
                    quantity: 1
                }
            ],
            redirect_url: params.redirect_url,
            metadata: params.metadata || {},
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BaseUPI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Align with guide response: { id, public_order_id, checkout_url, amount_paise }
    return {
        success: true,
        data: {
            id: data.id,
            public_order_id: data.public_order_id,
            checkout_url: data.checkout_url,
            amount_paise: data.amount_paise
        }
    };
}

export function verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string
): boolean {
    if (!signature || !secret || !rawBody) return false;

    try {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        const expectedSignature = hmac.update(rawBody).digest('hex');

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
