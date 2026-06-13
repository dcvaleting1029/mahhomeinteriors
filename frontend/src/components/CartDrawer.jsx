import React from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "../lib/api";

export default function CartDrawer() {
    const { open, setOpen, items, removeItem, updateQuantity, subtotal } = useCart();
    if (!open) return null;

    return (
        <div
            data-testid="cart-drawer"
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setOpen(false)}
        >
            <aside
                className="absolute top-0 right-0 h-full w-full sm:w-[440px] bg-white shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between px-6 py-5 border-b border-ma-border">
                    <h3 className="font-serif text-[22px]">Your Bag</h3>
                    <button onClick={() => setOpen(false)} aria-label="Close cart" data-testid="cart-close">
                        <X size={20} strokeWidth={1.4} />
                    </button>
                </header>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
                        <p className="font-serif text-[22px]">Your bag is empty</p>
                        <p className="text-sm text-ma-muted max-w-xs">
                            Discover curated pieces for considered, beautiful living.
                        </p>
                        <Link to="/shop" onClick={() => setOpen(false)} className="btn-gold" data-testid="cart-empty-shop">
                            Shop the collection →
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-ma-border">
                            {items.map((it) => (
                                <div key={it.product_id} data-testid={`cart-line-${it.product_id}`} className="flex gap-4 py-5">
                                    <Link to={`/product/${it.slug}`} onClick={() => setOpen(false)} className="block w-20 h-24 overflow-hidden bg-white border border-ma-border flex-shrink-0">
                                        <img src={it.image} alt={it.name} className="w-full h-full object-contain p-2" />
                                    </Link>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link to={`/product/${it.slug}`} onClick={() => setOpen(false)} className="font-serif text-[17px] leading-snug hover:text-ma-gold">
                                                {it.name}
                                            </Link>
                                            <button onClick={() => removeItem(it.product_id)} aria-label="Remove" data-testid={`remove-${it.product_id}`}>
                                                <X size={16} className="text-ma-muted hover:text-ma-text" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-ma-muted mt-1">{formatPrice(it.price)}</p>
                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex items-center border border-ma-border">
                                                <button data-testid={`dec-${it.product_id}`} onClick={() => updateQuantity(it.product_id, it.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-ma-warm">
                                                    <Minus size={12} strokeWidth={1.6} />
                                                </button>
                                                <span className="w-8 text-center text-sm">{it.quantity}</span>
                                                <button data-testid={`inc-${it.product_id}`} onClick={() => updateQuantity(it.product_id, it.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-ma-warm">
                                                    <Plus size={12} strokeWidth={1.6} />
                                                </button>
                                            </div>
                                            <span className="text-sm">{formatPrice(it.price * it.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <footer className="border-t border-ma-border px-6 py-5 space-y-4 bg-ma-warm/40">
                            <div className="flex items-center justify-between text-sm">
                                <span className="ma-eyebrow !text-ma-text">Subtotal</span>
                                <span className="font-serif text-[20px]" data-testid="cart-subtotal">{formatPrice(subtotal)}</span>
                            </div>
                            <p className="text-[11.5px] text-ma-muted">
                                {subtotal >= 100
                                    ? "✓ You qualify for free UK delivery."
                                    : `Add ${formatPrice(100 - subtotal)} more for free UK delivery.`}
                            </p>
                            <Link
                                data-testid="cart-checkout"
                                to="/checkout"
                                onClick={() => setOpen(false)}
                                className="btn-dark w-full justify-center"
                            >
                                Checkout →
                            </Link>
                            <Link to="/cart" onClick={() => setOpen(false)} className="block text-center ma-link text-[11px]" data-testid="view-bag-link">
                                View Bag
                            </Link>
                        </footer>
                    </>
                )}
            </aside>
        </div>
    );
}
