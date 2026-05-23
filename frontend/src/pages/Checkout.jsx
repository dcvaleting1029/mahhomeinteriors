import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import Layout from "../components/layout/Layout";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import api, { formatPrice, formatApiErrorDetail } from "../lib/api";
import Reveal from "../components/Reveal";

const STEPS = ["Contact", "Delivery", "Payment", "Review"];

export default function Checkout() {
    const { items, subtotal, clear } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        email: "",
        first_name: "",
        last_name: "",
        address_line1: "",
        address_line2: "",
        city: "",
        postcode: "",
        country: "United Kingdom",
        phone: "",
        shipping_method: "standard",
        payment_method: "card",
    });

    useEffect(() => {
        if (user) {
            setForm((f) => ({
                ...f,
                email: f.email || user.email,
                first_name: f.first_name || user.first_name,
                last_name: f.last_name || user.last_name,
            }));
        }
    }, [user]);

    useEffect(() => {
        if (items.length === 0) {
            // allow viewing empty checkout but redirect to shop
        }
    }, [items]);

    const shipping = form.shipping_method === "express" ? 6.99 : subtotal >= 100 ? 0 : 4.99;
    const total = subtotal + shipping;

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const validateStep = () => {
        if (step === 0 && !form.email) return "Email is required.";
        if (step === 1 && (!form.first_name || !form.last_name || !form.address_line1 || !form.city || !form.postcode)) {
            return "Please fill all delivery fields.";
        }
        return "";
    };

    const handleNext = () => {
        const err = validateStep();
        if (err) { setError(err); return; }
        setError("");
        setStep(step + 1);
    };

    const handlePay = async () => {
        setSubmitting(true);
        setError("");
        try {
            const { data } = await api.post("/checkout/session", {
                items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
                shipping_method: form.shipping_method,
                origin_url: window.location.origin,
                contact_email: form.email,
                address: {
                    first_name: form.first_name,
                    last_name: form.last_name,
                    address_line1: form.address_line1,
                    address_line2: form.address_line2,
                    city: form.city,
                    postcode: form.postcode,
                    country: form.country,
                    phone: form.phone,
                },
            });
            // Keep cart for now — clear after successful payment
            window.location.href = data.url;
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || e.message);
            setSubmitting(false);
        }
    };

    if (items.length === 0) {
        return (
            <Layout>
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-24 text-center">
                    <h1 className="font-serif text-[42px] mb-4">Your bag is empty</h1>
                    <p className="text-ma-muted mb-8">Add a few pieces to begin checkout.</p>
                    <Link to="/shop" className="btn-gold inline-flex">Shop the collection →</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout hideAnnouncement>
            <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16 py-14">
                <Reveal>
                    <h1 className="font-serif text-[40px] md:text-[52px] mb-2">Checkout</h1>
                </Reveal>
                {/* Stepper */}
                <ol className="flex items-center gap-2 md:gap-6 mb-12" data-testid="checkout-stepper">
                    {STEPS.map((s, i) => (
                        <li key={s} className="flex items-center gap-2 flex-1 min-w-0">
                            <span className={`w-7 h-7 flex items-center justify-center text-[12px] border ${i <= step ? "bg-ma-gold text-white border-ma-gold" : "border-ma-border text-ma-muted"}`}>{i <= step ? <Check size={14} strokeWidth={2.5} /> : i + 1}</span>
                            <span className={`ma-eyebrow truncate ${i === step ? "!text-ma-text" : "!text-ma-muted"}`}>{s}</span>
                            {i < STEPS.length - 1 && <span className="flex-1 ma-divider hidden md:block ml-2" />}
                        </li>
                    ))}
                </ol>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14">
                    <div>
                        {error && <p className="mb-6 text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3" data-testid="checkout-error">{error}</p>}

                        {step === 0 && (
                            <div data-testid="step-contact">
                                <h2 className="font-serif text-[28px] mb-6">Contact</h2>
                                <Field label="Email" value={form.email} onChange={(v) => update("email", v)} type="email" testId="checkout-email" />
                                <Field label="Phone (optional)" value={form.phone} onChange={(v) => update("phone", v)} testId="checkout-phone" />
                                {!user && (
                                    <p className="text-[12.5px] text-ma-muted mt-4">
                                        Have an account? <Link to="/login" className="text-ma-gold hover:underline">Log in</Link> for faster checkout.
                                    </p>
                                )}
                            </div>
                        )}

                        {step === 1 && (
                            <div data-testid="step-delivery">
                                <h2 className="font-serif text-[28px] mb-6">Delivery Address</h2>
                                <div className="grid grid-cols-2 gap-x-6">
                                    <Field label="First name" value={form.first_name} onChange={(v) => update("first_name", v)} testId="checkout-first" />
                                    <Field label="Last name" value={form.last_name} onChange={(v) => update("last_name", v)} testId="checkout-last" />
                                </div>
                                <Field label="Address line 1" value={form.address_line1} onChange={(v) => update("address_line1", v)} testId="checkout-line1" />
                                <Field label="Address line 2 (optional)" value={form.address_line2} onChange={(v) => update("address_line2", v)} testId="checkout-line2" />
                                <div className="grid grid-cols-2 gap-x-6">
                                    <Field label="City" value={form.city} onChange={(v) => update("city", v)} testId="checkout-city" />
                                    <Field label="Postcode" value={form.postcode} onChange={(v) => update("postcode", v)} testId="checkout-postcode" />
                                </div>
                                <Field label="Country" value={form.country} onChange={(v) => update("country", v)} testId="checkout-country" />

                                <h3 className="ma-eyebrow !text-ma-text mt-8 mb-4">Shipping Method</h3>
                                <div className="space-y-3">
                                    {[
                                        { id: "standard", title: "Standard Delivery", sub: subtotal >= 100 ? "Free over £100" : "£4.99 — 3-5 working days" },
                                        { id: "express", title: "Express Delivery", sub: "£6.99 — 1-2 working days" },
                                    ].map((m) => (
                                        <label key={m.id} data-testid={`shipping-${m.id}`} className={`flex items-center justify-between cursor-pointer border p-4 ${form.shipping_method === m.id ? "border-ma-gold" : "border-ma-border"}`}>
                                            <span className="flex items-center gap-3">
                                                <input type="radio" name="ship" checked={form.shipping_method === m.id} onChange={() => update("shipping_method", m.id)} className="accent-ma-gold" />
                                                <span>
                                                    <span className="font-serif text-[18px] block leading-tight">{m.title}</span>
                                                    <span className="text-[12px] text-ma-muted">{m.sub}</span>
                                                </span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div data-testid="step-payment">
                                <h2 className="font-serif text-[28px] mb-6">Payment Method</h2>
                                <div className="border border-ma-border p-5 bg-ma-warm/40 mb-6">
                                    <span className="ma-eyebrow !text-ma-gold">Stripe Test Mode</span>
                                    <p className="text-[13px] text-ma-muted mt-2">You'll be redirected to Stripe's secure checkout. Use any test card e.g. <code className="bg-white px-2 py-0.5 border border-ma-border">4242 4242 4242 4242</code>, any future expiry, any CVC.</p>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { id: "card", label: "Credit / Debit Card" },
                                        { id: "applepay", label: "Apple Pay (via Stripe)" },
                                        { id: "paypal", label: "PayPal (placeholder)" },
                                    ].map((m) => (
                                        <label key={m.id} className={`flex items-center justify-between cursor-pointer border p-4 ${form.payment_method === m.id ? "border-ma-gold" : "border-ma-border"}`} data-testid={`payment-${m.id}`}>
                                            <span className="flex items-center gap-3">
                                                <input type="radio" name="pay" checked={form.payment_method === m.id} onChange={() => update("payment_method", m.id)} className="accent-ma-gold" />
                                                <span className="font-serif text-[18px]">{m.label}</span>
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div data-testid="step-review">
                                <h2 className="font-serif text-[28px] mb-6">Review &amp; Pay</h2>
                                <ReviewBlock title="Contact">{form.email}<br />{form.phone}</ReviewBlock>
                                <ReviewBlock title="Deliver to">
                                    {form.first_name} {form.last_name}<br />
                                    {form.address_line1} {form.address_line2}<br />
                                    {form.city}, {form.postcode}<br />
                                    {form.country}
                                </ReviewBlock>
                                <ReviewBlock title="Shipping">{form.shipping_method === "express" ? "Express — £6.99" : `Standard — ${subtotal >= 100 ? "Free" : "£4.99"}`}</ReviewBlock>
                                <ReviewBlock title="Payment">{form.payment_method === "card" ? "Credit / Debit Card" : form.payment_method}</ReviewBlock>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-10">
                            <button
                                onClick={() => setStep(Math.max(0, step - 1))}
                                className="ma-link"
                                disabled={step === 0}
                                data-testid="checkout-back"
                            >
                                ← Back
                            </button>
                            {step < STEPS.length - 1 ? (
                                <button onClick={handleNext} className="btn-gold" data-testid="checkout-next">Continue →</button>
                            ) : (
                                <button onClick={handlePay} disabled={submitting} className="btn-gold" data-testid="checkout-pay">
                                    {submitting ? "Redirecting…" : `Pay ${formatPrice(total)} →`}
                                </button>
                            )}
                        </div>
                    </div>

                    <aside className="bg-ma-warm/40 border border-ma-border p-7 h-fit" data-testid="checkout-summary">
                        <h3 className="font-serif text-[22px] mb-5">Your Order</h3>
                        <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
                            {items.map((i) => (
                                <div key={i.product_id} className="flex gap-3 items-start">
                                    <div className="w-14 h-16 bg-white overflow-hidden flex-shrink-0">
                                        <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-serif text-[15px] truncate">{i.name}</p>
                                        <p className="text-[11px] text-ma-muted">Qty {i.quantity}</p>
                                    </div>
                                    <p className="text-sm">{formatPrice(i.price * i.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="ma-divider my-5" />
                        <Row label="Subtotal" value={formatPrice(subtotal)} />
                        <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
                        <Row label="Tax" value="Included" />
                        <div className="ma-divider my-3" />
                        <Row label="Total" value={formatPrice(total)} large />
                    </aside>
                </div>
            </div>
        </Layout>
    );
}

function Field({ label, value, onChange, type = "text", testId }) {
    return (
        <label className="block mb-5">
            <span className="ma-eyebrow !text-ma-muted block mb-1">{label}</span>
            <input data-testid={testId} value={value} onChange={(e) => onChange(e.target.value)} type={type} className="ma-input" />
        </label>
    );
}
function Row({ label, value, large }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className={large ? "font-serif text-[19px]" : "text-sm text-ma-muted"}>{label}</span>
            <span className={large ? "font-serif text-[20px]" : "text-sm"}>{value}</span>
        </div>
    );
}
function ReviewBlock({ title, children }) {
    return (
        <div className="border border-ma-border p-5 mb-4">
            <p className="ma-eyebrow !text-ma-text mb-2">{title}</p>
            <p className="text-[13.5px] text-ma-muted leading-relaxed">{children}</p>
        </div>
    );
}
