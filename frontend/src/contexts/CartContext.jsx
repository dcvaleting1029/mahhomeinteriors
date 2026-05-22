import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "ma_cart_v1";

function readCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(readCart);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = useCallback((product, quantity = 1, options = {}) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
                );
            }
            return [
                ...prev,
                {
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    slug: product.slug,
                    quantity,
                    colour: options.colour || null,
                },
            ];
        });
        setOpen(true);
    }, []);

    const removeItem = useCallback((productId) => {
        setItems((prev) => prev.filter((i) => i.product_id !== productId));
    }, []);

    const updateQuantity = useCallback((productId, quantity) => {
        setItems((prev) =>
            prev
                .map((i) => (i.product_id === productId ? { ...i, quantity: Math.max(1, quantity) } : i))
                .filter((i) => i.quantity > 0),
        );
    }, []);

    const clear = useCallback(() => setItems([]), []);

    const { subtotal, count } = useMemo(() => {
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const count = items.reduce((s, i) => s + i.quantity, 0);
        return { subtotal, count };
    }, [items]);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, subtotal, count, open, setOpen }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
