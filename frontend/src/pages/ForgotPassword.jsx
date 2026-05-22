import React, { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import MaLogo from "../components/MaLogo";
import api from "../lib/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault();
        try { await api.post("/auth/forgot-password", { email }); } catch { /* always silent */ }
        setSent(true);
    };

    return (
        <Layout hideAnnouncement>
            <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
                <div className="w-full max-w-md text-center">
                    <div className="flex justify-center mb-10"><MaLogo size={56} /></div>
                    <span className="ma-eyebrow">Reset Password</span>
                    <h1 className="font-serif text-[40px] mt-3 mb-6">Forgot Password?</h1>
                    {sent ? (
                        <p className="text-ma-muted" data-testid="forgot-sent">
                            If an account exists for <strong>{email}</strong>, a reset link will be sent shortly.
                        </p>
                    ) : (
                        <form onSubmit={onSubmit} className="text-left">
                            <p className="text-ma-muted text-[13.5px] mb-8 text-center">Enter your email and we'll send you a link to reset your password.</p>
                            <label className="block mb-6">
                                <span className="ma-eyebrow !text-ma-muted block mb-1">Email</span>
                                <input data-testid="forgot-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="ma-input" />
                            </label>
                            <button type="submit" className="btn-gold w-full justify-center" data-testid="forgot-submit">Send Reset Link →</button>
                        </form>
                    )}
                    <p className="text-center text-[13px] text-ma-muted mt-10">
                        Remembered? <Link to="/login" className="text-ma-gold hover:underline">Back to login</Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
}
