import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import api, { formatPrice, formatApiErrorDetail } from "../lib/api";
import Reveal from "../components/Reveal";

export default function CartPage() {
    const { items, removeItem, updateQuantity, subtotal, coupon, setCoupon, clearCoupon, discount, freeShipping } = useCart();
    const { user } = useAuth();
    const baseShipping = subtotal >= 100 || subtotal === 0 ? 0 : 4.99;
    const shipping = freeShipping ? 0 : baseShipping;
    const total = Math.max(0, subtotal - discount + shipping);
    const [codeInput, setCodeInput] = useState("");
    const [couponErr, setCouponErr] = useState("");
    const [couponBusy, setCouponBusy] = useState(false);

    const applyCoupon = async (e) => {
        e.preventDefault();
        if (!codeInput.trim()) return;
        setCouponBusy(true);
        setCouponErr("");
        try {
            // Use authenticated endpoint when logged in so first-order-only codes work
            const endpoint = user ? "/coupons/validate/auth" : "/coupons/validate";
            const { data } = await api.post(endpoint, { code: codeInput, subtotal });
            setCoupon({
                code: data.code,
                description: data.description,
                discount_type: data.discount_type,
                discount_value: data.discount_value,
                min_subtotal: data.min_subtotal,
            });
            setCodeInput("");
        } catch (ex) {
            setCouponErr(formatApiErrorDetail(ex.response?.data?.detail) || "Invalid code.");
        } finally {
            setCouponBusy(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-16">
                <Reveal>
                    <span className="ma-eyebrow">Your Bag</span>
                    <h1 className="font-serif text-[48px] md:text-[64px] leading-tight mt-3 mb-12">Shopping Bag</h1>
                </Reveal>

                {items.length === 0 ? (
                    <div className="border border-ma-border p-16 text-center">
                        <p className="font-serif text-[28px]">Your bag is empty</p>
                        <p className="text-ma-muted mt-3">Discover curated pieces for considered, beautiful living.</p>
                        <Link to="/shop" className="btn-gold mt-8 inline-flex" data-testid="cart-empty-shop-page">Shop the Collection →</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
                        <div className="divide-y divide-ma-border border-t border-ma-border">
                            {items.map((it) => (
                                <div key={it.product_id} data-testid={`cartpage-line-${it.product_id}`} className="flex gap-6 py-8">
                                    <Link to={`/product/${it.slug}`} className="w-28 h-32 overflow-hidden bg-ma-warm flex-shrink-0">
                                        <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                                    </Link>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <Link to={`/product/${it.slug}`} className="font-serif text-[22px] hover:text-ma-gold">{it.name}</Link>
                                            <button onClick={() => removeItem(it.product_id)} aria-label="Remove" data-testid={`cartpage-remove-${it.product_id}`} className="text-ma-muted hover:text-ma-text">
                                                <X size={18} />
                                            </button>
                                        </div>
                                        {it.colour && <p className="text-[12px] text-ma-muted mt-1">Colour: {it.colour}</p>}
                                        <p className="text-sm text-ma-muted mt-1">{formatPrice(it.price)}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <div className="flex items-center border border-ma-border">
                                                <button onClick={() => updateQuantity(it.product_id, it.quantity - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-ma-warm"><Minus size={12} /></button>
                                                <span className="w-9 text-center text-sm">{it.quantity}</span>
                                                <button onClick={() => updateQuantity(it.product_id, it.quantity + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-ma-warm"><Plus size={12} /></button>
                                            </div>
                                            <span className="font-serif text-[20px]">{formatPrice(it.price * it.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <aside className="bg-ma-warm/50 border border-ma-border p-8 h-fit">
                            <h3 className="font-serif text-[24px] mb-6">Order Summary</h3>
                            <Row label="Subtotal" value={formatPrice(subtotal)} testId="summary-subtotal" />
                            {coupon && discount > 0 && (
                                <div className="flex items-center justify-between py-1.5 text-ma-gold" data-testid="summary-discount">
                                    <span className="text-sm flex items-center gap-2">
                                        <span>{coupon.code}</span>
                                        <button onClick={clearCoupon} aria-label="Remove code" className="text-ma-muted hover:text-ma-text" data-testid="remove-coupon"><X size={13} /></button>
                                    </span>
                                    <span className="text-sm">−{formatPrice(discount)}</span>
                                </div>
                            )}
                            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} testId="summary-shipping" />
                            <Row label="Tax" value="Included" />
                            <div className="ma-divider my-5" />
                            <Row label="Total" value={formatPrice(total)} large testId="summary-total" />
                            <p className="text-[11.5px] text-ma-muted mt-3">{subtotal >= 100 || freeShipping ? "✓ Free UK delivery applied." : `Add ${formatPrice(100 - subtotal)} more for free UK delivery.`}</p>

                            {!coupon ? (
                                <form onSubmit={applyCoupon} className="mt-6">
                                    <div className="flex items-stretch border-b border-ma-text">
                                        <input
                                            placeholder="Discount code"
                                            value={codeInput}
                                            onChange={(e) => { setCodeInput(e.target.value); setCouponErr(""); }}
                                            className="flex-1 bg-transparent py-3 outline-none text-sm uppercase tracking-widest"
                                            data-testid="discount-code"
                                            disabled={couponBusy}
                                        />
                                        <button type="submit" className="ma-link text-[10px] px-3" data-testid="apply-discount" disabled={couponBusy}>
                                            {couponBusy ? "…" : "Apply →"}
                                        </button>
                                    </div>
                                    {couponErr && <p className="text-[11.5px] text-red-700 mt-2" data-testid="coupon-err">{couponErr}</p>}
                                    <p className="text-[10.5px] text-ma-muted mt-2">Try <strong>WELCOME10</strong>, <strong>SAVE20</strong> or <strong>FREESHIP</strong>.</p>
                                </form>
                            ) : (
                                <div className="mt-6 border border-ma-gold/40 bg-ma-warm/40 p-3" data-testid="coupon-applied">
                                    <p className="ma-eyebrow !text-ma-gold text-[10px]">Code applied</p>
                                    <p className="text-[12.5px] text-ma-muted mt-1">{coupon.description}</p>
                                </div>
                            )}

                            <Link to="/checkout" data-testid="proceed-to-checkout" className="btn-dark w-full justify-center mt-6">Checkout →</Link>
                            <Link to="/shop" className="block text-center mt-4 ma-link text-[11px]">Continue Shopping</Link>
                        </aside>
                    </div>
                )}
            </div>
        </Layout>
    );
}

function Row({ label, value, large, testId }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className={`${large ? "font-serif text-[20px]" : "text-sm text-ma-muted"}`}>{label}</span>
            <span data-testid={testId} className={`${large ? "font-serif text-[22px]" : "text-sm text-ma-text"}`}>{value}</span>
        </div>
    );
}
