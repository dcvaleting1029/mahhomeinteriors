import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check } from "lucide-react";
import Layout from "../components/layout/Layout";
import api, { formatPrice } from "../lib/api";
import { useCart } from "../contexts/CartContext";

export default function PaymentSuccess() {
    const [params] = useSearchParams();
    const sessionId = params.get("session_id");
    const [status, setStatus] = useState({ payment_status: "pending" });
    const [attempts, setAttempts] = useState(0);
    const { clear } = useCart();

    useEffect(() => {
        if (!sessionId) return;
        let stopped = false;
        const poll = async (n = 0) => {
            if (stopped || n > 10) return;
            try {
                const { data } = await api.get(`/checkout/status/${sessionId}`);
                setStatus(data);
                setAttempts(n);
                if (data.payment_status === "paid") {
                    clear();
                    return;
                }
                if (data.status === "expired") return;
                setTimeout(() => poll(n + 1), 2000);
            } catch {
                setTimeout(() => poll(n + 1), 2000);
            }
        };
        poll();
        return () => { stopped = true; };
    }, [sessionId]); // eslint-disable-line

    const paid = status.payment_status === "paid";

    return (
        <Layout hideAnnouncement>
            <div className="max-w-[800px] mx-auto px-6 py-24 text-center" data-testid="payment-success-page">
                {paid ? (
                    <>
                        <span className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-ma-gold mb-8">
                            <Check size={28} className="text-ma-gold" />
                        </span>
                        <span className="ma-eyebrow">Order Confirmed</span>
                        <h1 className="font-serif text-[48px] md:text-[60px] leading-tight mt-3 mb-6">Thank you</h1>
                        <p className="text-ma-muted max-w-md mx-auto mb-8">
                            Your order has been received and is being prepared. A confirmation has been sent to your email.
                        </p>
                        {status.order && (
                            <div className="border border-ma-border p-6 text-left max-w-md mx-auto mb-8" data-testid="order-summary">
                                <p className="ma-eyebrow !text-ma-text mb-2">Order Reference</p>
                                <p className="font-serif text-[20px] mb-4">#{status.order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-sm text-ma-muted">Total paid: <span className="text-ma-text">{formatPrice(status.order.total)}</span></p>
                            </div>
                        )}
                        <div className="flex items-center justify-center gap-4">
                            <Link to="/account/orders" className="btn-dark" data-testid="view-orders">View Orders</Link>
                            <Link to="/shop" className="ma-link">Continue Shopping →</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="ma-spinner mx-auto mb-6" />
                        <h1 className="font-serif text-[34px]">Confirming your payment…</h1>
                        <p className="text-ma-muted mt-3">Please wait while we confirm with Stripe. ({attempts}/10)</p>
                    </>
                )}
            </div>
        </Layout>
    );
}
