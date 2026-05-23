import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import MaLogo from "../components/MaLogo";
import { useAuth } from "../contexts/AuthContext";
import { formatApiErrorDetail } from "../lib/api";
import Reveal from "../components/Reveal";

export default function Signup() {
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm: "",
        marketing: true,
        terms: false,
    });
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const nav = useNavigate();

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        if (form.password !== form.confirm) return setErr("Passwords don't match.");
        if (!form.terms) return setErr("Please accept the terms.");
        setLoading(true);
        try {
            await register({
                first_name: form.first_name,
                last_name: form.last_name,
                email: form.email,
                password: form.password,
                marketing_opt_in: form.marketing,
            });
            nav("/account", { replace: true });
        } catch (ex) {
            setErr(formatApiErrorDetail(ex.response?.data?.detail) || ex.message);
        } finally { setLoading(false); }
    };

    return (
        <Layout hideAnnouncement>
            <div className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-2">
                <div className="hidden lg:block bg-ma-warm">
                    <img src="https://images.unsplash.com/photo-1768144092684-c1a5dd6c7aad?crop=entropy&cs=srgb&fm=jpg&q=85" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-center px-6 py-16">
                    <Reveal className="w-full max-w-md" duration={900}>
                        <div className="flex justify-center mb-10"><MaLogo size={56} /></div>
                        <span className="ma-eyebrow block text-center">Become a Member</span>
                        <h1 className="font-serif text-[40px] md:text-[48px] leading-tight text-center mt-3 mb-10">Create Your Account</h1>

                        {err && <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-6" data-testid="signup-error">{err}</p>}

                        <form onSubmit={onSubmit}>
                            <div className="grid grid-cols-2 gap-x-5">
                                <Field label="First name" value={form.first_name} onChange={(v) => update("first_name", v)} testId="signup-first" required />
                                <Field label="Last name" value={form.last_name} onChange={(v) => update("last_name", v)} testId="signup-last" required />
                            </div>
                            <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} testId="signup-email" required />
                            <Field label="Password" type="password" value={form.password} onChange={(v) => update("password", v)} testId="signup-password" required />
                            <Field label="Confirm password" type="password" value={form.confirm} onChange={(v) => update("confirm", v)} testId="signup-confirm" required />

                            <label className="flex items-start gap-3 text-[12.5px] text-ma-muted mt-6 cursor-pointer">
                                <input type="checkbox" data-testid="signup-marketing" checked={form.marketing} onChange={(e) => update("marketing", e.target.checked)} className="mt-1 accent-ma-gold" />
                                Send me new arrivals, inspiration and exclusive offers.
                            </label>
                            <label className="flex items-start gap-3 text-[12.5px] text-ma-muted mt-3 cursor-pointer">
                                <input type="checkbox" data-testid="signup-terms" checked={form.terms} onChange={(e) => update("terms", e.target.checked)} className="mt-1 accent-ma-gold" />
                                I accept the <Link to="/terms" className="text-ma-gold">terms &amp; conditions</Link>.
                            </label>

                            <button type="submit" disabled={loading} className="btn-gold w-full justify-center mt-8" data-testid="signup-submit">
                                {loading ? "Creating account…" : "Create Account →"}
                            </button>
                        </form>

                        <p className="text-center text-[13px] text-ma-muted mt-8">
                            Already have an account? <Link to="/login" className="text-ma-gold hover:underline" data-testid="link-login">Log in</Link>
                        </p>
                    </Reveal>
                </div>
            </div>
        </Layout>
    );
}

function Field({ label, value, onChange, type = "text", testId, required }) {
    return (
        <label className="block mb-5">
            <span className="ma-eyebrow !text-ma-muted block mb-1">{label}</span>
            <input data-testid={testId} required={required} value={value} onChange={(e) => onChange(e.target.value)} type={type} className="ma-input" />
        </label>
    );
}
