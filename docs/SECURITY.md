# BUY67 — Security Notes

## Authentication & Authorization

### Google OAuth
- Authentication is handled entirely by Supabase Auth with Google OAuth
- No passwords are stored in the application
- Session tokens are managed via HTTP-only cookies through `@supabase/ssr`

### Route Protection
- `middleware.ts` intercepts all `/dashboard/*` and `/admin/*` routes
- Dashboard routes require authentication
- Admin routes require both authentication AND `role = 'admin'` in the profiles table
- The middleware refreshes sessions on every request

### Row Level Security (RLS)
- All tables have RLS enabled
- Creators can only manage their own products
- Creators can only view orders for their own products
- Admins can view all data
- Service role key bypasses RLS (used only in server-side API routes)

## API Security

### Input Validation
- All API endpoints use **Zod schemas** for strict input validation
- Invalid inputs are rejected with descriptive error messages
- Maximum lengths are enforced on all text fields

### Rate Limiting
- In-memory rate limiting is applied to all sensitive API endpoints
- Default: 60 requests/minute per IP
- `/api/create-order`: 10 requests/minute per IP
- `/api/validate-coupon`: 20 requests/minute per IP
- `/api/payouts`: 10 requests/minute per IP

> **Note**: In-memory rate limiting resets on server restart. For production at scale, consider using Redis-based rate limiting (e.g., Upstash).

### Webhook Security
- BaseUPI webhooks are verified using **HMAC-SHA256** signatures
- `crypto.timingSafeEqual` is used for constant-time signature comparison (prevents timing attacks)
- Replay protection via in-memory processed webhook tracking
- Amount validation: webhook payment amount is compared against the stored order amount
- Idempotency: already-completed orders are skipped gracefully

## File Security

### Product File Storage
- Product files are stored in a **private** Supabase Storage bucket
- Files are never publicly accessible via direct URLs
- Download access requires:
  1. A valid `merchant_order_id`
  2. Order status must be `COMPLETED`
  3. A signed URL is generated with 60-second expiry

### Cover Images
- Cover images are stored in a **public** bucket (they're meant to be visible)
- Only authenticated users can upload files

## Environment Variables

### Server-Only Variables
- `SUPABASE_SERVICE_ROLE_KEY` — Never exposed to the client
- `BASEUPI_API_KEY` — Never exposed to the client
- `BASEUPI_WEBHOOK_SECRET` — Never exposed to the client

### Public Variables
- Variables prefixed with `NEXT_PUBLIC_` are safe to expose to the browser
- Only `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BASE_URL`, and `NEXT_PUBLIC_APP_NAME` are public

## Production Recommendations

1. **Use HTTPS everywhere** — Vercel provides this by default
2. **Rotate API keys regularly** — Especially the Supabase service role key
3. **Monitor webhook logs** — Check for unusual patterns or failed validations
4. **Enable Supabase Auth rate limiting** — Configure in Authentication → Rate Limits
5. **Set up database backups** — Enable point-in-time recovery in Supabase
6. **Use Redis for rate limiting at scale** — In-memory limits reset on cold starts
7. **Add Content Security Policy headers** — Restrict script sources in `next.config.ts`
8. **Enable Supabase Realtime abuse prevention** — If using realtime features
