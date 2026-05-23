import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

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
    const { user, loading: authLoading } = useAuth();
    const [ids, setIds] = useState(read);
    const mergedRef = useRef(false);

    // Persist to localStorage as the cache
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    }, [ids]);

    // On login: pull server wishlist + merge with local, push any local-only IDs up
    useEffect(() => {
        if (authLoading) return;
        if (!user) { mergedRef.current = false; return; }
        if (mergedRef.current) return;
        mergedRef.current = true;
        (async () => {
            try {
                const { data } = await api.get("/wishlist");
                const serverIds = (data.items || []).map((p) => p.id);
                const localOnly = ids.filter((id) => !serverIds.includes(id));
                // push local-only to server (best effort)
                await Promise.all(
                    localOnly.map((pid) => api.post("/wishlist", { product_id: pid }).catch(() => null))
                );
                const merged = Array.from(new Set([...serverIds, ...ids]));
                setIds(merged);
            } catch {
                // server unavailable — keep local
            }
        })();
    }, [user, authLoading]); // eslint-disable-line

    const toggle = useCallback((productId) => {
        setIds((prev) => {
            const exists = prev.includes(productId);
            const next = exists ? prev.filter((x) => x !== productId) : [...prev, productId];
            // Best-effort server sync if logged in
            if (user) {
                if (exists) {
                    api.delete(`/wishlist/${productId}`).catch(() => null);
                } else {
                    api.post("/wishlist", { product_id: productId }).catch(() => null);
                }
            }
            return next;
        });
    }, [user]);

    const remove = useCallback((productId) => {
        setIds((prev) => prev.filter((x) => x !== productId));
        if (user) api.delete(`/wishlist/${productId}`).catch(() => null);
    }, [user]);

    const has = useCallback((productId) => ids.includes(productId), [ids]);

    return (
        <WishlistContext.Provider value={{ ids, toggle, has, remove }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
