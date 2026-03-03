# BUY67 — Vercel Deployment Guide

## Prerequisites

- GitHub repository with the BUY67 codebase
- [Vercel account](https://vercel.com)
- Supabase project configured (see [SETUP.md](./SETUP.md))
- BaseUPI account configured (see [SETUP.md](./SETUP.md))

## Deployment Steps

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: BUY67 MVP"
git remote add origin https://github.com/your-username/buy67.git
git push -u origin main
```

### 2. Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Framework preset: **Next.js** (auto-detected)
4. Root directory: `./`

### 3. Environment Variables

Add these environment variables in Vercel project settings:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `BASEUPI_API_KEY` | Your BaseUPI API key |
| `BASEUPI_WEBHOOK_SECRET` | Your BaseUPI webhook secret |
| `NEXT_PUBLIC_BASE_URL` | `https://your-domain.vercel.app` |

### 4. Deploy

Click **Deploy**. Vercel will build and deploy automatically.

### 5. Post-Deployment

1. **Update Supabase OAuth callback URL**:
   - Add `https://your-domain.vercel.app/auth/callback` to your Google OAuth authorized redirect URIs

2. **Update BaseUPI webhook URL**:
   - Set webhook URL to `https://your-domain.vercel.app/api/baseupi/webhook`

3. **Update Supabase Site URL**:
   - In Supabase → Authentication → URL Configuration
   - Set Site URL to `https://your-domain.vercel.app`
   - Add `https://your-domain.vercel.app/**` to Redirect URLs

### 6. Custom Domain (Optional)

1. Go to Vercel project → Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
4. Update all callback URLs with the new domain

## Continuous Deployment

Vercel automatically deploys on every push to `main`. Preview deployments are created for pull requests.

## Monitoring

- **Vercel Analytics**: Enable in project settings for performance monitoring
- **Vercel Logs**: View real-time function logs in the Vercel dashboard
- **Supabase Dashboard**: Monitor database and auth activity
