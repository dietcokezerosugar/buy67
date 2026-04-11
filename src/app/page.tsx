import Link from 'next/link';
import { LoginButton } from '@/components/auth-buttons';
import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import { ShieldCheck, Zap, Globe, Lock, ArrowRight, Sparkles } from 'lucide-react';

export default async function HomePage() {
  let user: User | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Unauthenticated state
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10 overflow-x-hidden">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-white/5 blur-[100px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-white/5 h-20">
        <div className="mx-auto max-w-7xl px-8 h-full flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-outfit tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center text-sm font-black">67</div>
            BUY67
          </Link>
          <div className="flex items-center gap-8">
            <Link href="#features" className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors hidden sm:block">Features</Link>
            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
            {user ? (
              <Link
                href="/dashboard"
                className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black px-6 py-3 rounded-full hover:bg-white/90 transition-all active:scale-95"
              >
                Go to Dashboard
              </Link>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 lg:pt-64 lg:pb-48">
        <div className="mx-auto max-w-7xl px-8 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 mb-12 animate-reveal">
            <Sparkles className="w-3.5 h-3.5 text-white/40" />
            Phase Zero • Now in Public Beta
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-bold font-outfit tracking-tight mb-8 leading-[0.9] animate-reveal [animation-delay:0.1s]">
            Sell digital.<br />
            <span className="text-white/20">Get paid instantly.</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-white/40 max-w-2xl font-medium leading-relaxed mb-12 animate-reveal [animation-delay:0.2s]">
            The minimalist commerce engine for high-end creators. 
            Accept UPI payments directly. Zero commission. Zero friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-reveal [animation-delay:0.3s]">
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center h-14 px-10 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full bg-white text-black hover:bg-white/90 transition-all active:scale-95"
              >
                Open Dashboard <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <LoginButton />
            )}
            <Link 
              href="/custom-checkout-demo"
              className="h-14 px-10 inline-flex items-center text-[10px] font-bold uppercase tracking-[0.2em] rounded-full border border-white/5 hover:bg-white/5 transition-all"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-8 py-32 border-t border-white/5">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-24">
          <div className="space-y-4 max-w-xl">
             <h2 className="text-4xl lg:text-5xl font-bold font-outfit tracking-tight">Built for speed.</h2>
             <p className="text-lg text-white/40 font-medium">Simple enough to set up in two minutes, powerful enough to scale with your audience.</p>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 pb-4">
            Platform Capabilities
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              icon: <Zap className="w-5 h-5" />,
              title: 'Instant Setup',
              desc: 'Upload your file, set a price, and get a link. Sell ebooks, presets, or templates in seconds.',
            },
            {
              icon: <Globe className="w-5 h-5" />,
              title: 'UPI Everywhere',
              desc: 'Optimized for the Indian market. Full support for GPay, PhonePe, Paytm, and all UPI apps.',
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: 'Zero Commission',
              desc: 'Every paise goes directly to your bank account via BaseUPI. We never touch your revenue.',
            },
            {
              icon: <Lock className="w-5 h-5" />,
              title: 'Secure Delivery',
              desc: 'Automated fulfillment with signed download URLs that expire for maximum file security.',
            },
            {
              icon: <Sparkles className="w-5 h-5" />,
              title: 'SDK Integrated',
              desc: 'Powering custom checkout flows with our headless React hooks and world-class API.',
            },
            {
              icon: <ArrowRight className="w-5 h-5" />,
              title: 'Clean Analytics',
              desc: 'Monitor your growth without the noise. High-fidelity transaction reports and customer data.',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="group p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-700"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-white/60 mb-8 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold font-outfit mb-4">{feature.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-8 py-32">
        <div className="rounded-[4rem] border border-white/10 bg-white/[0.02] p-16 lg:p-32 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl" />
          <h2 className="text-4xl lg:text-7xl font-bold font-outfit tracking-tight mb-8 relative z-10 transition-transform duration-700 group-hover:scale-105">
            Start selling.<br />
            <span className="text-white/20">Own your audience.</span>
          </h2>
          <p className="text-white/40 text-lg mb-12 max-w-lg mx-auto font-medium relative z-10">
            Join the new wave of Indian digital creators.
          </p>
          <div className="relative z-10">
            {!user && <LoginButton />}
            {user && (
              <Link
                href="/dashboard"
                className="inline-flex items-center h-14 px-10 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full bg-white text-black hover:bg-white/90 transition-all active:scale-95"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-8 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <Link href="/" className="text-xl font-bold font-outfit tracking-tighter">BUY67</Link>
             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">© 2026</span>
          </div>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Secure by BaseUPI
            </span>
            <Link href="/dashboard" className="hover:text-white transition-colors">Seller Portal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
