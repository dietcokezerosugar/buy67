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

        // Generate signed URLs for all products in the order
        const downloads: { title: string; url: string }[] = [];

        for (const item of order.order_items || []) {
            const product = item.products as unknown as { file_path: string; title: string } | null;
            if (!product?.file_path) continue;

            const { data: signedUrl, error: signError } = await supabase.storage
                .from('products')
                .createSignedUrl(product.file_path, 60); // 60 seconds expiry

            if (signError || !signedUrl) {
                console.error('Failed to create signed URL:', signError);
                continue;
            }

            downloads.push({
                title: product.title,
                url: signedUrl.signedUrl,
            });
        }

        if (downloads.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No downloadable files found' },
                { status: 404 }
            );
        }

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
