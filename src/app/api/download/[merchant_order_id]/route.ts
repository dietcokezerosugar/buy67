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

        console.log(`[DownloadAPI] Generating links for order ${order.id}, items:`, order.order_items?.length);

        for (const item of order.order_items || []) {
            // Handle cases where item.products might be an array or a single object
            let productData = item.products;
            if (Array.isArray(productData)) {
                productData = productData[0];
            }

            const product = productData as unknown as { file_path: string; title: string } | null;
            
            if (!product || !product.file_path) {
                console.warn(`[DownloadAPI] Missing product data for item in order ${order.id}`);
                continue;
            }

            const { data: signedUrl, error: signError } = await supabase.storage
                .from('products')
                .createSignedUrl(product.file_path, 3600); // Increase to 1 hour for better UX

            if (signError || !signedUrl) {
                console.error(`[DownloadAPI] Failed to create signed URL for ${product.file_path}:`, signError);
                continue;
            }

            downloads.push({
                title: product.title,
                url: signedUrl.signedUrl,
            });
        }

        if (downloads.length === 0) {
            console.error(`[DownloadAPI] No downloadable files found for order ${order.id}`);
            return NextResponse.json(
                { success: false, error: 'Downloadable files could not be retrieved. Please contact support.' },
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
