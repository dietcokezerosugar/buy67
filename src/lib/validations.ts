import { z } from 'zod';

export const createProductSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title too long'),
    description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
    price_paise: z.number().int().min(100, 'Minimum price is ₹1.00').max(10000000, 'Maximum price is ₹1,00,000'),
});

export const createOrderSchema = z.object({
    items: z.array(z.object({
        product_id: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1).max(10),
    })).min(1, 'Cart cannot be empty').max(20, 'Too many items'),
    buyer_phone: z.string().regex(/^\+91[6789]\d{9}$/, 'Invalid WhatsApp number. Must start with +91 followed by 10 digits.'),
    coupon_code: z.string().max(50).optional(),
});

export const validateCouponSchema = z.object({
    code: z.string().min(1, 'Coupon code required').max(50),
});

export const payoutRequestSchema = z.object({
    amount_paise: z.number().int().min(10000, 'Minimum payout is ₹100'),
});
