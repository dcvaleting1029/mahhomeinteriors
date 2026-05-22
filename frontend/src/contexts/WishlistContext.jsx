import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const WishlistContext = createContext(null);
const STORAGE_KEY = "ma_wishlist_v1";

function read() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function WishlistProvider({ children }) {
    const [ids, setIds] = useState(read);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }, [ids]);

    const toggle = useCallback((productId) => {
        setIds((prev) => (prev.includes(productId) ? prev.filter((x) => x !== productId) : [...prev, productId]));
    }, []);

    const remove = useCallback((productId) => {
        setIds((prev) => prev.filter((x) => x !== productId));
    }, []);

    const has = useCallback((productId) => ids.includes(productId), [ids]);

    return (
        <WishlistContext.Provider value={{ ids, toggle, has, remove }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
