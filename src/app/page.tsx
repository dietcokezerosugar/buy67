import Link from 'next/link';
import { LoginButton } from '@/components/auth-buttons';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export default async function HomePage() {
  let user: User | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Supabase not configured yet — show unauthenticated state
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navigation */}
      <nav className="border-b border-[hsl(var(--border))] glass sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            BUY67
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center h-10 px-4 text-sm font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-opacity"
              >
                Dashboard →
              </Link>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--background))] to-[hsl(var(--muted))]" />
        <div className="relative mx-auto max-w-6xl px-6 py-32 lg:py-44 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] mb-8 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-subtle" />
            Zero commission. 100% yours.
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Sell digital products.
            <br />
            <span className="text-[hsl(var(--muted-foreground))]">
              Get paid via UPI.
            </span>
          </h1>
          <p className="text-lg lg:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            The simplest way for Indian creators to sell ebooks, templates, design kits,
            presets, and more. Direct UPI payments. No middleman.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center h-12 px-8 text-base font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-all shadow-lg"
              >
                Go to Dashboard →
              </Link>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Everything you need to sell online
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg max-w-xl mx-auto">
            No complex setup. No monthly fees. Just create, upload, and start earning.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '💰',
              title: 'Zero Commission',
              desc: 'Payments go directly to your UPI. We never touch your money.',
            },
            {
              icon: '⚡',
              title: 'Instant Setup',
              desc: 'Create your product page in under 2 minutes. Start selling immediately.',
            },
            {
              icon: '🔒',
              title: 'Secure Downloads',
              desc: 'Files are protected with signed URLs. Only paying customers get access.',
            },
            {
              icon: '🎫',
              title: 'Coupon System',
              desc: 'Create discount coupons to boost your sales and reward loyal customers.',
            },
            {
              icon: '📊',
              title: 'Analytics Dashboard',
              desc: 'Track your revenue, orders, and growth from a clean dashboard.',
            },
            {
              icon: '🛒',
              title: 'Multi-Product Cart',
              desc: 'Customers can buy multiple products at once with a single checkout.',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-[hsl(var(--border))] p-6 transition-all duration-300 hover:border-[hsl(var(--foreground))]/20 hover:shadow-lg hover:-translate-y-1"
            >
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-12 lg:p-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Start selling today
          </h2>
          <p className="text-[hsl(var(--muted-foreground))] text-lg mb-8 max-w-lg mx-auto">
            Join thousands of Indian creators already earning with BUY67.
          </p>
          {!user && <LoginButton />}
          {user && (
            <Link
              href="/dashboard"
              className="inline-flex items-center h-12 px-8 text-base font-medium rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:opacity-90 transition-all"
            >
              Open Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[hsl(var(--border))] py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            © 2026 BUY67. Built for Indian creators.
          </p>
          <div className="flex items-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
            <span>UPI Payments via BaseUPI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
