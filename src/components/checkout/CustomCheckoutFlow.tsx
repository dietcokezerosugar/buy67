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
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-8"
                    >
                        {/* Custom Header Area */}
                        <div className="flex items-end justify-between mb-12">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-bold font-outfit tracking-tight text-white/90">Checkout</h2>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">{merchantName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-4xl font-bold font-outfit text-white">{formatINR(amount)}</p>
                            </div>
                        </div>

                        {!isStarted ? (
                            <Card className="hover:border-white/10 transition-all duration-700">
                                <CardContent className="p-0">
                                    <div className="p-10 space-y-10">
                                        <div className="flex items-start gap-6">
                                            <div className="p-4 rounded-2xl bg-white/5 text-white/60">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-bold text-white/90">Pay via UPI</h3>
                                                <p className="text-sm text-white/40 leading-relaxed max-w-[320px]">
                                                    Instant verification via Google Pay, PhonePe, or any global UPI application.
                                                </p>
                                            </div>
                                        </div>

                                        <Button 
                                            onClick={() => setIsStarted(true)}
                                            className="w-full"
                                            size="lg"
                                        >
                                            Continue to Payment
                                        </Button>
                                    </div>

                                    {/* Footer Branding */}
                                    <div className="p-5 bg-white/[0.01] border-t border-white/5 flex items-center justify-center gap-2">
                                        <ShieldCheck className="w-3.5 h-3.5 text-white/20" />
                                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                                            Verified by BaseUPI SDK
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
                                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Live Connection
                                        </span>
                                        <button 
                                            onClick={() => setIsStarted(false)}
                                            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-white transition-colors"
                                        >
                                            Go Back
                                        </button>
                                    </div>

                                    {/* The SDK iframe integrated into our custom UI */}
                                    <Card className="shimmer transition-all duration-700">
                                        <iframe
                                            src={checkoutUrl}
                                            style={{ 
                                                width: '100%', 
                                                height: `${iframeHeight}px`, 
                                                border: 'none',
                                                transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                                borderRadius: '2rem'
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
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 px-10 glass rounded-[3rem] space-y-10"
                    >
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black mx-auto">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-4xl font-bold font-outfit text-white tracking-tight">Success</h2>
                            <p className="text-white/40 font-medium text-sm">Your payment has been successfully captured.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 inline-flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Order ID: {orderId}</span>
                            </div>

                            <Button 
                                className="w-full"
                                size="lg"
                                onClick={() => window.location.href = '/dashboard'}
                            >
                                Return to Dashboard
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
