# BUY67 Setup Guide

## 1. Supabase Setup

### Create Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings → API
3. Note your **Service Role Key** from Settings → API (keep this secret!)

### Run Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Paste the contents of `supabase/schema.sql` and run it
3. This creates all tables, RLS policies, indexes, triggers, and storage buckets

### Run Seed Data
1. In **SQL Editor**, paste and run `supabase/seed.sql`
2. This adds sample coupon codes for testing

### Configure Google OAuth
1. Go to **Authentication → Providers → Google**
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Go to **APIs & Services → Credentials**
   - Create **OAuth 2.0 Client ID** (Web application)
   - Add authorized redirect URI: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
   - Copy **Client ID** and **Client Secret** to Supabase Google provider settings

### Configure Storage
The schema.sql automatically creates two storage buckets:
- `products` (private) — for digital product files
- `covers` (public) — for product cover images

Verify they exist in **Storage** section of your Supabase dashboard.

---

## 2. BaseUPI Setup

### Create Account
1. Go to [baseupi.netlify.app](https://baseupi.netlify.app) and sign up
2. Set up your UPI payment details

### Get API Credentials
1. From your BaseUPI dashboard, get your:
   - **API Key** → `BASEUPI_API_KEY`
   - **Webhook Secret** → `BASEUPI_WEBHOOK_SECRET`

### Configure Webhook
1. In BaseUPI dashboard, set your webhook URL:
   - **Development**: `https://your-ngrok-url.ngrok.io/api/baseupi/webhook`
   - **Production**: `https://your-domain.com/api/baseupi/webhook`
2. The webhook handles `payment.completed` events
3. Webhook payloads are verified using HMAC-SHA256 signatures

### Testing Payments
- Use BaseUPI's **Test Environment** with test API keys
- Use the built-in simulator to test the full payment flow without real money

---

## 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `BASEUPI_API_KEY` | BaseUPI API key |
| `BASEUPI_WEBHOOK_SECRET` | BaseUPI webhook signing secret |
| `NEXT_PUBLIC_BASE_URL` | Your app URL (e.g., http://localhost:3000) |

---

## 4. Making a User Admin

After a user signs up via Google OAuth, promote them to admin:

```sql
UPDATE public.profiles SET role = 'admin' WHERE username = 'your_username';
```

Run this in the Supabase SQL Editor.
