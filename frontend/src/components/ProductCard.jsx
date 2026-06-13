import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { formatPrice } from "../lib/api";
import QuickViewDialog from "./QuickViewDialog";

export default function ProductCard({ product, eager = false }) {
    const { addItem } = useCart();
    const { has, toggle } = useWishlist();
    const isWished = has(product.id);
    const isNew = product.is_new || product.badge === "NEW";
    const isSale = product.on_sale && product.original_price && product.original_price > product.price;
    const [quickOpen, setQuickOpen] = useState(false);

    return (
        <>
            <article
                data-testid={`product-card-${product.slug || product.id}`}
                className="product-card group flex flex-col bg-white border border-transparent hover:border-ma-border transition-[border-color] duration-500"
            >
                <div className="relative">
                    <Link to={`/product/${product.slug || product.id}`} className="relative block overflow-hidden bg-white aspect-[4/5]">
                        <img
                            src={product.image}
                            alt={product.name}
                            loading={eager ? "eager" : "lazy"}
                            className="product-img w-full h-full object-contain p-4 sm:p-5"
                        />
                        {isNew && !isSale && (
                            <span
                                data-testid="new-badge"
                                className="absolute top-4 left-4 bg-ma-text text-white text-[9px] tracking-widest uppercase px-3 py-1.5 border border-ma-gold"
                            >
                                New
                            </span>
                        )}
                        {isSale && (
                            <span
                                data-testid="sale-badge"
                                className="absolute top-4 left-4 bg-ma-gold text-white text-[9px] tracking-widest uppercase px-3 py-1.5"
                            >
                                Sale
                            </span>
                        )}
                    </Link>
                    <button
                        data-testid={`wishlist-${product.id}`}
                        onClick={(e) => { e.preventDefault(); toggle(product.id); }}
                        aria-label="Add to wishlist"
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center border border-ma-border hover:border-ma-gold transition-colors"
                    >
                        <Heart
                            size={15}
                            strokeWidth={1.4}
                            className={isWished ? "text-ma-gold" : "text-ma-text"}
                            fill={isWished ? "#C9983F" : "none"}
                        />
                    </button>
                    {/* Quick view button — reveals on hover */}
                    <button
                        data-testid={`quickview-open-${product.id}`}
                        onClick={(e) => { e.preventDefault(); setQuickOpen(true); }}
                        className="absolute left-1/2 -translate-x-1/2 bottom-4 flex items-center gap-2 text-[10px] tracking-widest uppercase px-4 py-2.5 bg-white text-ma-text border border-ma-border opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-ma-text hover:text-white hover:border-ma-text"
                    >
                        <Eye size={12} strokeWidth={1.6} /> Quick View
                    </button>
                </div>

                <div className="pt-5 pb-2 px-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-[20px] leading-tight">
                            <Link to={`/product/${product.slug || product.id}`} className="hover:text-ma-gold transition-colors">
                                {product.name}
                            </Link>
                        </h3>
                        <span className="font-sans text-sm text-ma-text whitespace-nowrap flex items-center gap-2">
                            {isSale && (
                                <span className="text-ma-muted line-through text-[12.5px]" data-testid="price-original">
                                    {formatPrice(product.original_price, product.currency)}
                                </span>
                            )}
                            <span className={isSale ? "text-ma-gold font-semibold" : ""} data-testid="price-current">
                                {formatPrice(product.price, product.currency)}
                            </span>
                        </span>
                    </div>
                    {product.short_description && (
                        <p className="text-[12.5px] text-ma-muted leading-relaxed line-clamp-2">{product.short_description}</p>
                    )}
                    <button
                        data-testid={`add-to-cart-${product.id}`}
                        onClick={() => addItem(product, 1)}
                        className="btn-outline-gold mt-2 w-full justify-between"
                    >
                        <span>Add to Cart</span>
                        <span>→</span>
                    </button>
                </div>
            </article>
            <QuickViewDialog product={product} open={quickOpen} onOpenChange={setQuickOpen} />
        </>
    );
}
