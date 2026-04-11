'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Sparkles, AlertCircle, ShieldCheck, Smartphone, CheckCircle2 } from 'lucide-react';
import { useBaseUPICheckoutSession } from '@snc0x/baseupi-react';

interface BaseUPINativeCheckoutProps {
    orderId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function BaseUPINativeCheckout({
    orderId,
    open,
    onOpenChange,
    onSuccess,
}: BaseUPINativeCheckoutProps) {
    const session = useBaseUPICheckoutSession({
        orderId: open ? orderId : '',
        onSuccess,
    });

    const {
        amountFormatted,
        qrCodeUrl,
        timeLeft,
        status,
        isSuccess,
        isPending,
        openUpiApp,
        merchantName,
        branding,
        isLoading,
        error,
    } = session;

    // Handle closing the modal on success (optional, or wait for user to click)
    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                // Keep success screen visible for 3 seconds before closing/redirecting
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess]);

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay asChild>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
                    />
                </Dialog.Overlay>

                <Dialog.Content asChild>
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            className="relative w-full max-w-[400px] overflow-hidden rounded-[32px] glass shadow-2xl"
                        >
                            {/* Close Button */}
                            <Dialog.Close asChild>
                                <button className="absolute right-4 top-4 z-20 rounded-full bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white">
                                    <X className="h-4 w-4" />
                                </button>
                            </Dialog.Close>

                            {/* Main Content Area */}
                            <div className="relative flex flex-col p-8">
                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <LoadingState key="loading" />
                                    ) : error ? (
                                        <ErrorState key="error" message={error} />
                                    ) : isSuccess ? (
                                        <SuccessState key="success" message={branding?.success_message} amount={amountFormatted} />
                                    ) : (
                                        <CheckoutUI
                                            key="checkout"
                                            amount={amountFormatted}
                                            merchant={merchantName}
                                            qr={qrCodeUrl}
                                            timer={timeLeft}
                                            status={status}
                                            openApp={openUpiApp}
                                            branding={branding}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Trust Footer */}
                            <div className="flex items-center justify-center gap-2 border-t border-white/5 bg-white/[0.02] py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                                <ShieldCheck className="h-3 w-3" />
                                Secure UPI Transaction
                            </div>
                        </motion.div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function LoadingState() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <Loader2 className="h-8 w-8 animate-spin text-white/20" />
            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Secure Session</p>
        </motion.div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="mt-6 text-lg font-bold text-white">Oops! Something went wrong</h3>
            <p className="mt-2 text-sm text-white/40">{message}</p>
        </motion.div>
    );
}

function SuccessState({ message, amount }: { message: string; amount: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-8 text-center"
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black mb-8">
                <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-4xl font-bold font-outfit text-white tracking-tight">{amount}</h3>
            <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">
                Payment Success
            </div>
            <p className="mt-8 text-sm font-medium text-white/40 max-w-[240px] leading-relaxed">{message}</p>
        </motion.div>
    );
}

function CheckoutUI({ amount, merchant, qr, timer, status, openApp, branding }: {
    amount: string;
    merchant: string;
    qr: string;
    timer: string;
    status: string;
    openApp: (app: any) => void;
    branding: any;
}) {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/40">
                    <Smartphone className="h-3 w-3" />
                    Pay with UPI
                </div>
                <h2 className="mt-4 text-4xl font-black tracking-tight text-white">{amount}</h2>
                <p className="mt-1 text-sm font-medium text-white/40">to {merchant}</p>
            </div>

            <div className="mx-auto w-fit">
                <div className="relative rounded-[32px] border border-white/5 bg-white/[0.02] p-6 shadow-2xl transition-all duration-700">
                    <img src={qr} alt="UPI QR Code" className="h-44 w-44 rounded-xl opacity-90 brightness-110 grayscale" />
                    {status === 'pending' && (
                        <div className="absolute top-3 right-3">
                             <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white/60"></span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Timer & Status */}
            <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.1em]">
                    <div className="flex items-center gap-2 text-white/30">
                        Expires in <span className="text-white/80 tabular-nums">{timer}</span>
                    </div>
                </div>
            </div>

            {/* UPI Buttons */}
            <div className="grid grid-cols-3 gap-3">
                <UPIButton label="GPay" color="#4285F4" onClick={() => openApp('gpay')} />
                <UPIButton label="PhonePe" color="#6739B7" onClick={() => openApp('phonepe')} />
                <UPIButton label="Paytm" color="#00BAF2" onClick={() => openApp('paytm')} />
            </div>

            {/* Status Footer */}
            <div className="text-center">
                <p className="text-[10px] font-medium text-white/20">
                    Scan the QR code or select a UPI app above
                </p>
            </div>
        </div>
    );
}

function UPIButton({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="relative flex flex-col items-center justify-center gap-1 rounded-xl border border-white/5 bg-white/[0.03] py-3 transition-all hover:bg-white/[0.06] active:scale-95"
            style={{ '--hover-color': color } as any}
        >
            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{label}</span>
        </button>
    );
}
