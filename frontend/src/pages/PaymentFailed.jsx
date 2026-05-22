import React from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import Layout from "../components/layout/Layout";

export default function PaymentFailed() {
    return (
        <Layout hideAnnouncement>
            <div className="max-w-[800px] mx-auto px-6 py-24 text-center" data-testid="payment-failed-page">
                <span className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-ma-border mb-8">
                    <X size={28} className="text-ma-text" />
                </span>
                <span className="ma-eyebrow">Payment Cancelled</span>
                <h1 className="font-serif text-[48px] md:text-[60px] leading-tight mt-3 mb-6">Something went wrong</h1>
                <p className="text-ma-muted max-w-md mx-auto mb-10">
                    Your payment wasn't completed. Your bag is still saved — feel free to try again.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link to="/checkout" className="btn-gold" data-testid="retry-checkout">Try Again →</Link>
                    <Link to="/shop" className="ma-link">Continue Shopping →</Link>
                </div>
            </div>
        </Layout>
    );
}
