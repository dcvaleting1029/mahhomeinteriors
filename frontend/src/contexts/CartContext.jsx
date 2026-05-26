import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "ma_cart_v1";
const COUPON_KEY = "ma_coupon_v1";

function readCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}
function readCoupon() {
    try {
        const raw = localStorage.getItem(COUPON_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function CartProvider({ children }) {
    const [items, setItems] = useState(readCart);
    const [coupon, setCouponState] = useState(readCoupon);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);
    useEffect(() => {
        if (coupon) localStorage.setItem(COUPON_KEY, JSON.stringify(coupon));
        else localStorage.removeItem(COUPON_KEY);
    }, [coupon]);

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

    const clear = useCallback(() => { setItems([]); setCouponState(null); }, []);
    const setCoupon = useCallback((c) => setCouponState(c), []);
    const clearCoupon = useCallback(() => setCouponState(null), []);

    const { subtotal, count, discount, freeShipping } = useMemo(() => {
        const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
        const count = items.reduce((s, i) => s + i.quantity, 0);
        let discount = 0;
        let freeShipping = false;
        if (coupon && subtotal >= (coupon.min_subtotal || 0)) {
            if (coupon.discount_type === "percent") discount = Math.round(subtotal * (coupon.discount_value / 100) * 100) / 100;
            else if (coupon.discount_type === "fixed") discount = Math.min(subtotal, coupon.discount_value);
            else if (coupon.discount_type === "free_shipping") freeShipping = true;
        }
        return { subtotal, count, discount, freeShipping };
    }, [items, coupon]);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear, subtotal, count, open, setOpen, coupon, setCoupon, clearCoupon, discount, freeShipping }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
