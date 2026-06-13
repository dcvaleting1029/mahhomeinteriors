import React, { useState } from "react";
import { Link } from "react-router-dom";
import { X, Heart, Minus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { formatPrice } from "../lib/api";

export default function QuickViewDialog({ product, open, onOpenChange }) {
    const { addItem, setOpen: setCartOpen } = useCart();
    const { has, toggle } = useWishlist();
    const [qty, setQty] = useState(1);
    const [colour, setColour] = useState((product?.colours || [])[0] || null);

    if (!product) return null;
    const wished = has(product.id);

    const onAdd = () => {
        addItem(product, qty, { colour });
        onOpenChange(false);
        setQty(1);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                data-testid="quickview-dialog"
                className="!max-w-[920px] w-[92vw] p-0 bg-white border border-ma-border rounded-none gap-0 overflow-hidden"
            >
                <DialogTitle className="sr-only">{product.name}</DialogTitle>
                <DialogDescription className="sr-only">{product.short_description || `Quick view of ${product.name}`}</DialogDescription>
                <button
                    onClick={() => onOpenChange(false)}
                    aria-label="Close"
                    data-testid="quickview-close"
                    className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur border border-ma-border hover:border-ma-gold transition-colors"
                >
                    <X size={16} strokeWidth={1.4} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-[4/5] md:aspect-auto md:min-h-[520px] bg-white overflow-hidden">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain p-6" />
                    </div>
                    <div className="p-6 md:p-10 flex flex-col overflow-y-auto max-h-[80vh] md:max-h-[640px]">
                        <span className="ma-eyebrow">{product.category}</span>
                        <h2 className="font-serif text-[28px] md:text-[34px] leading-tight mt-3 mb-3">{product.name}</h2>
                        <p className="font-serif text-[22px] mb-5">{formatPrice(product.price, product.currency)}</p>
                        <p className="text-ma-muted text-[13.5px] leading-relaxed mb-6">{product.short_description}</p>

                        {product.colours && product.colours.length > 0 && (
                            <div className="mb-6">
                                <p className="ma-eyebrow !text-ma-text mb-3">
                                    Colour {colour && <span className="text-ma-muted font-normal normal-case tracking-normal">— {colour}</span>}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {product.colours.map((c) => (
                                        <button
                                            key={c}
                                            data-testid={`quickview-colour-${c.toLowerCase()}`}
                                            onClick={() => setColour(c)}
                                            className={`text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${colour === c ? "border-ma-gold text-ma-gold" : "border-ma-border hover:border-ma-text"}`}
                                        >{c}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center border border-ma-border">
                                <button data-testid="quickview-qty-dec" onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-ma-warm"><Minus size={14} /></button>
                                <span className="w-9 text-center text-sm" data-testid="quickview-qty">{qty}</span>
                                <button data-testid="quickview-qty-inc" onClick={() => setQty(qty + 1)} className="w-10 h-11 flex items-center justify-center hover:bg-ma-warm"><Plus size={14} /></button>
                            </div>
                            <button onClick={onAdd} className="btn-gold flex-1 justify-center" data-testid="quickview-add">
                                Add to Cart →
                            </button>
                            <button
                                onClick={() => toggle(product.id)}
                                aria-label="Wishlist"
                                data-testid="quickview-wishlist"
                                className="w-11 h-11 flex items-center justify-center border border-ma-border hover:border-ma-gold transition-colors"
                            >
                                <Heart size={15} strokeWidth={1.4} fill={wished ? "#C9983F" : "none"} className={wished ? "text-ma-gold" : ""} />
                            </button>
                        </div>

                        <Link
                            to={`/product/${product.slug || product.id}`}
                            onClick={() => onOpenChange(false)}
                            data-testid="quickview-view-details"
                            className="ma-link text-[10px] text-center mt-3"
                        >
                            View Full Details →
                        </Link>

                        <div className="ma-divider my-6" />
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[12px] text-ma-muted">
                            {product.materials && (
                                <div>
                                    <p className="ma-eyebrow !text-ma-text mb-1 !text-[10px]">Materials</p>
                                    <p>{product.materials}</p>
                                </div>
                            )}
                            {product.dimensions && (
                                <div>
                                    <p className="ma-eyebrow !text-ma-text mb-1 !text-[10px]">Dimensions</p>
                                    <p>{product.dimensions}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
