'use client';

import { useState } from 'react';
import { useBaseUPIPaymentFlow } from '@snc0x/baseupi-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Receipt, CreditCard, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CustomCheckoutFlowProps {
    orderId: string;
    amount: number;
    merchantName?: string;
}

export function CustomCheckoutFlow({ orderId, amount, merchantName = 'Buy67 Store' }: CustomCheckoutFlowProps) {
    const [isStarted, setIsStarted] = useState(false);
    
    // Headless hook from our new @snc0x/baseupi-react SDK!
    const { checkoutUrl, iframeHeight, isSuccess } = useBaseUPIPaymentFlow({
        orderId,
        baseUrl: process.env.NEXT_PUBLIC_BASEUPI_URL || 'https://baseupi.app',
        onSuccess: () => {
            console.log('[Demo] Payment Successful!');
        }
    });

    const formatINR = (paise: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(paise / 100);
    };

    return (
        <div className="max-w-xl mx-auto p-4 space-y-8">
            <AnimatePresence mode="wait">
                {!isSuccess ? (
                    <motion.div
                        key="checkout"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        {/* Custom Header Area */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black tracking-tight text-white/90">Checkout</h2>
                                <p className="text-xs font-medium text-white/40 uppercase tracking-widest">{merchantName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-indigo-400">{formatINR(amount)}</p>
                                <Badge variant="outline" className="mt-1 border-indigo-500/20 text-indigo-400 bg-indigo-500/5">
                                    Secure Transaction
                                </Badge>
                            </div>
                        </div>

                        {!isStarted ? (
                            <Card className="glass border-white/10 overflow-hidden group hover:border-indigo-500/30 transition-all duration-500">
                                <CardContent className="p-0">
                                    <div className="p-8 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                                                <CreditCard className="w-6 h-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-white/80">Pay via UPI</h3>
                                                <p className="text-sm text-white/40 leading-relaxed">
                                                    Use Google Pay, PhonePe, or any other UPI app to complete your secure payment.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                                <span className="text-sm text-white/40">Order Reference</span>
                                                <span className="text-sm font-mono text-white/60">{orderId}</span>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={() => setIsStarted(true)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-6 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            Proceed to Pay <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Footer Branding */}
                                    <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                                            Handshake Verified by BaseUPI SDK
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Verifying Connection
                                        </span>
                                        <button 
                                            onClick={() => setIsStarted(false)}
                                            className="text-xs font-bold text-indigo-400/60 hover:text-indigo-400 transition-colors"
                                        >
                                            Change Method
                                        </button>
                                    </div>

                                    {/* The SDK iframe integrated into our custom UI */}
                                    <Card className="glass-intense border-indigo-500/20 shadow-2xl overflow-hidden shadow-indigo-500/10">
                                        <iframe
                                            src={checkoutUrl}
                                            style={{ 
                                                width: '100%', 
                                                height: `${iframeHeight}px`, 
                                                border: 'none',
                                                transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                                            }}
                                            allow="payment"
                                            title="BaseUPI Checkout"
                                        />
                                    </Card>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 px-8 glass border-emerald-500/20 rounded-[32px] space-y-8"
                    >
                        <div className="relative inline-block">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                                className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 relative z-10"
                            >
                                <CheckCircle2 className="w-12 h-12" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1.5 }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                                className="absolute inset-0 rounded-full bg-emerald-500/5 blur-xl -z-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-white/90">Transaction Complete</h2>
                            <p className="text-white/40 font-medium">Your payment has been successfully verified.</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 inline-flex items-center gap-3">
                            <Receipt className="w-5 h-5 text-indigo-400 text-transparent" />
                            <span className="text-sm font-medium text-white/60">ID: {orderId}</span>
                        </div>

                        <Button 
                            className="w-full bg-white text-black hover:bg-white/90 font-black py-4 rounded-xl transition-all"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Return to Dashboard
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Global Styles for Glassmorphism */}
            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }
                .glass-intense {
                    background: rgba(255, 255, 255, 0.04);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }
            `}</style>
        </div>
    );
}
