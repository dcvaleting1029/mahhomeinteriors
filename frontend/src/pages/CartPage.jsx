import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "../lib/api";

export default function CartPage() {
    const { items, removeItem, updateQuantity, subtotal } = useCart();
    const shipping = subtotal >= 100 || subtotal === 0 ? 0 : 4.99;
    const total = subtotal + shipping;

    return (
        <Layout>
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-16">
                <span className="ma-eyebrow">Your Bag</span>
                <h1 className="font-serif text-[48px] md:text-[64px] leading-tight mt-3 mb-12">Shopping Bag</h1>

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
                            <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} testId="summary-shipping" />
                            <Row label="Tax" value="Included" />
                            <div className="ma-divider my-5" />
                            <Row label="Total" value={formatPrice(total)} large testId="summary-total" />
                            <p className="text-[11.5px] text-ma-muted mt-3">{subtotal >= 100 ? "✓ Free UK delivery applied." : `Add ${formatPrice(100 - subtotal)} more for free UK delivery.`}</p>

                            <div className="mt-6 flex items-stretch border-b border-ma-text">
                                <input placeholder="Discount code" className="flex-1 bg-transparent py-3 outline-none text-sm" data-testid="discount-code" />
                                <button className="ma-link text-[10px] px-3" data-testid="apply-discount">Apply →</button>
                            </div>

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
