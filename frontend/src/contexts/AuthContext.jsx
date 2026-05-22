import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = useCallback(async () => {
        try {
            const { data } = await api.get("/auth/me", { validateStatus: (s) => s < 500 });
            if (data && data.id) setUser(data);
            else setUser(null);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const login = async (email, password, remember) => {
        const { data } = await api.post("/auth/login", { email, password, remember });
        setUser(data);
        return data;
    };
    const register = async (payload) => {
        const { data } = await api.post("/auth/register", payload);
        setUser(data);
        return data;
    };
    const logout = async () => {
        await api.post("/auth/logout");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: fetchMe, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
