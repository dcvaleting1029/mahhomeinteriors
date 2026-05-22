import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import MaLogo from "../components/MaLogo";
import { useAuth } from "../contexts/AuthContext";
import { formatApiErrorDetail } from "../lib/api";

export default function Login() {
    const [email, setEmail] = useState("customer@mahomeinteriors.com");
    const [password, setPassword] = useState("customer12345");
    const [remember, setRemember] = useState(true);
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const nav = useNavigate();
    const location = useLocation();
    const redirectTo = location.state?.from || "/account";

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            await login(email, password, remember);
            nav(redirectTo, { replace: true });
        } catch (ex) {
            setErr(formatApiErrorDetail(ex.response?.data?.detail) || ex.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout hideAnnouncement>
            <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2">
                <div className="hidden lg:block bg-ma-warm">
                    <img src="https://images.unsplash.com/photo-1761330439741-3dcf41ee766b?crop=entropy&cs=srgb&fm=jpg&q=85" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-center px-6 py-16">
                    <div className="w-full max-w-md">
                        <div className="flex justify-center mb-10"><MaLogo size={56} /></div>
                        <span className="ma-eyebrow block text-center">Customer Login</span>
                        <h1 className="font-serif text-[40px] md:text-[48px] leading-tight text-center mt-3 mb-10">Welcome Back</h1>

                        {err && <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6" data-testid="login-error">{err}</p>}

                        <form onSubmit={onSubmit} className="space-y-1">
                            <label className="block mb-5">
                                <span className="ma-eyebrow !text-ma-muted block mb-1">Email</span>
                                <input data-testid="login-email" required value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="ma-input" />
                            </label>
                            <label className="block mb-5">
                                <span className="ma-eyebrow !text-ma-muted block mb-1">Password</span>
                                <input data-testid="login-password" required value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="ma-input" />
                            </label>
                            <div className="flex items-center justify-between mt-2 mb-8">
                                <label className="flex items-center gap-2 text-[12.5px] text-ma-muted cursor-pointer">
                                    <input data-testid="login-remember" type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-ma-gold" />
                                    Remember me
                                </label>
                                <Link to="/forgot-password" className="ma-link text-[10px]">Forgot password?</Link>
                            </div>
                            <button type="submit" disabled={loading} className="btn-gold w-full justify-center" data-testid="login-submit">
                                {loading ? "Signing in…" : "Log In →"}
                            </button>
                        </form>

                        <p className="text-center text-[13px] text-ma-muted mt-8">
                            New to MA?{" "}
                            <Link to="/signup" className="text-ma-gold hover:underline" data-testid="link-signup">Create an Account →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
