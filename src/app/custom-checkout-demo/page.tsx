import { CustomCheckoutFlow } from '@/components/checkout/CustomCheckoutFlow';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Custom Checkout Demo | Buy67',
    description: 'Bespoke payment experience built with BaseUPI Headless SDK',
};

export default function CustomCheckoutDemoPage() {
    // In a real app, this would come from your backend API
    const MOCK_ORDER = {
        id: 'ord_demo_' + Math.random().toString(36).substring(7),
        amount_paise: 49900, // ₹499.00
        merchantName: 'Buy67 Premium Store'
    };

    return (
        <main className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
            </div>

            <div className="relative z-10 container mx-auto px-4 py-12 md:py-24">
                {/* Back Link */}
                <div className="max-w-xl mx-auto mb-12">
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white/80 transition-colors group"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Back to Store
                    </Link>
                </div>

                <div className="text-center space-y-6 mb-16">
                    <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
                        <Shield className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                        Bespoke Checkout Experience
                    </h1>
                    <p className="max-w-md mx-auto text-white/40 font-medium leading-relaxed">
                        This checkout is built using the <code className="text-indigo-400 font-bold">useBaseUPIPaymentFlow</code> headless hook, 
                        giving you 100% control over the UI and branding.
                    </p>
                </div>

                {/* The Custom Checkout Component */}
                <CustomCheckoutFlow 
                    orderId={MOCK_ORDER.id}
                    amount={MOCK_ORDER.amount_paise}
                    merchantName={MOCK_ORDER.merchantName}
                />

                {/* Technical Footnote */}
                <div className="max-w-md mx-auto mt-24 p-6 rounded-3xl border border-white/5 bg-white/[0.02] text-center space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">SDK Implementation Details</p>
                    <p className="text-xs text-white/40 leading-relaxed italic">
                        "The headless SDK handles the frame-to-parent handshake, security challenges, and state synchronization, 
                        while the host app dictates every pixel of the presentation."
                    </p>
                </div>
            </div>
        </main>
    );
}
