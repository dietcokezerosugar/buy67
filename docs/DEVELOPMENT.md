# BUY67 — Local Development Guide

## Prerequisites

- Node.js 18+
- npm
- A Supabase project (see [SETUP.md](./SETUP.md))
- A BaseUPI account (see [SETUP.md](./SETUP.md))

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` (see [SETUP.md](./SETUP.md)).

### 3. Database Setup

Run `supabase/schema.sql` in your Supabase SQL Editor, then `supabase/seed.sql`.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development Workflow

### Testing the Checkout Flow

1. The BaseUPI webhook needs a public URL. Use ngrok:
   ```bash
   npx ngrok http 3000
   ```
2. Update `NEXT_PUBLIC_BASE_URL` in `.env.local` to your ngrok URL
3. Update the webhook URL in your BaseUPI dashboard to: `https://your-ngrok-url.ngrok.io/api/baseupi/webhook`

### Project Structure

```
src/
├── app/              # Next.js App Router pages and API routes
│   ├── admin/        # Admin panel pages
│   ├── api/          # API route handlers
│   ├── auth/         # Auth callback
│   ├── cart/         # Cart page
│   ├── dashboard/    # Creator dashboard
│   └── p/            # Public product pages
├── components/       # React components
│   ├── ui/           # Reusable UI primitives
│   ├── dashboard/    # Dashboard-specific components
│   ├── checkout/     # Checkout components
│   └── admin/        # Admin components
├── lib/              # Shared utilities
│   └── supabase/     # Supabase client configurations
├── store/            # Zustand state stores
├── types/            # TypeScript type definitions
└── middleware.ts     # Auth + route protection middleware
```

### Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
