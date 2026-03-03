import { NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS: Record<string, number> = {
    '/api/create-order': 10,
    '/api/validate-coupon': 20,
    '/api/payouts': 10,
    default: 60,
};

export function rateLimit(
    identifier: string,
    path: string
): { limited: boolean; remaining: number } {
    const now = Date.now();
    const maxRequests = MAX_REQUESTS[path] || MAX_REQUESTS.default;
    const key = `${identifier}:${path}`;

    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
        return { limited: false, remaining: maxRequests - 1 };
    }

    if (entry.count >= maxRequests) {
        return { limited: true, remaining: 0 };
    }

    entry.count++;
    return { limited: false, remaining: maxRequests - entry.count };
}

export function withRateLimit(
    request: Request,
    path: string
): NextResponse | null {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const { limited, remaining } = rateLimit(ip, path);

    if (limited) {
        return NextResponse.json(
            { success: false, error: 'Too many requests. Please try again later.' },
            {
                status: 429,
                headers: {
                    'X-RateLimit-Remaining': remaining.toString(),
                    'Retry-After': '60',
                },
            }
        );
    }

    return null;
}
