'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartStore {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getTotalPaise: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product: Product) => {
                const items = get().items;
                const existing = items.find((i) => i.product.id === product.id);
                if (existing) {
                    set({
                        items: items.map((i) =>
                            i.product.id === product.id
                                ? { ...i, quantity: Math.min(i.quantity + 1, 10) }
                                : i
                        ),
                    });
                } else {
                    set({ items: [...items, { product, quantity: 1 }] });
                }
            },
            removeItem: (productId: string) => {
                set({ items: get().items.filter((i) => i.product.id !== productId) });
            },
            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set({
                    items: get().items.map((i) =>
                        i.product.id === productId
                            ? { ...i, quantity: Math.min(quantity, 10) }
                            : i
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            getTotalPaise: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.product.price_paise * item.quantity,
                    0
                );
            },
            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: 'buy67-cart',
        }
    )
);
