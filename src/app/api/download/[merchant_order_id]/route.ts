import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ merchant_order_id: string }> }
) {
    try {
        const { merchant_order_id } = await params;
        const supabase = createAdminClient();

        // Find the order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, order_items(product_id, products(file_path, title))')
            .eq('merchant_order_id', merchant_order_id)
            .single();

        if (orderError || !order) {
            return NextResponse.json(
                { success: false, error: 'Order not found' },
                { status: 404 }
            );
        }

        // Check if order is completed
        if (order.status !== 'COMPLETED') {
            return NextResponse.json(
                { success: false, error: 'Payment not completed' },
                { status: 403 }
            );
        }

        // Default download: serve dld.docx from public folder
        console.log(`[DownloadAPI] Order ${order.id} COMPLETED — returning default download link`);

        // Build absolute URL from the request origin
        const origin = new URL(_request.url).origin;
        const downloads = [
            {
                title: 'DLD Lab Manual',
                url: `${origin}/dld.docx`,
            },
        ];

        return NextResponse.json({
            success: true,
            data: { downloads },
        });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
