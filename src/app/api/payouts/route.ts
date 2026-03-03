import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { payoutRequestSchema } from '@/lib/validations';
import { withRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    const rateLimitResponse = withRateLimit(request, '/api/payouts');
    if (rateLimitResponse) return rateLimitResponse;

    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const parsed = payoutRequestSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { success: false, error: parsed.error.issues[0].message },
                { status: 400 }
            );
        }

        const { error } = await supabase.from('payouts').insert({
            creator_id: user.id,
            amount_paise: parsed.data.amount_paise,
            status: 'PENDING',
        });

        if (error) {
            return NextResponse.json(
                { success: false, error: 'Failed to create payout request' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
