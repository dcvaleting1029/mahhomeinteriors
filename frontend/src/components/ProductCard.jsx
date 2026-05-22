import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { formatPrice } from "../lib/api";

export default function ProductCard({ product, eager = false }) {
    const { addItem } = useCart();
    const { has, toggle } = useWishlist();
    const isWished = has(product.id);
    const isNew = product.is_new || product.badge === "NEW";

    return (
        <article
            data-testid={`product-card-${product.slug || product.id}`}
            className="product-card group flex flex-col bg-white border border-transparent hover:border-ma-border transition-[border-color] duration-500"
        >
            <Link to={`/product/${product.slug || product.id}`} className="relative block overflow-hidden bg-ma-warm aspect-[4/5]">
                <img
                    src={product.image}
                    alt={product.name}
                    loading={eager ? "eager" : "lazy"}
                    className="product-img w-full h-full object-cover"
                />
                {isNew && (
                    <span
                        data-testid="new-badge"
                        className="absolute top-4 left-4 bg-ma-text text-white text-[9px] tracking-widest uppercase px-3 py-1.5 border border-ma-gold"
                    >
                        New
                    </span>
                )}
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
            </Link>

            <div className="pt-5 pb-2 px-1 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-[20px] leading-tight">
                        <Link to={`/product/${product.slug || product.id}`} className="hover:text-ma-gold transition-colors">
                            {product.name}
                        </Link>
                    </h3>
                    <span className="font-sans text-sm text-ma-text whitespace-nowrap">
                        {formatPrice(product.price, product.currency)}
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
    );
}
