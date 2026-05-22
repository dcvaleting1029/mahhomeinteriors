import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import api, { formatPrice } from "../../lib/api";
import { useWishlist } from "../../contexts/WishlistContext";
import { useCart } from "../../contexts/CartContext";

export default function Wishlist() {
    const { ids, remove } = useWishlist();
    const { addItem } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (ids.length === 0) { setProducts([]); setLoading(false); return; }
            const { data } = await api.get("/products", { params: { limit: 60 } });
            setProducts(data.items.filter((p) => ids.includes(p.id)));
            setLoading(false);
        })();
    }, [ids]);

    return (
        <div data-testid="wishlist-page">
            <h2 className="font-serif text-[32px] mb-6">Your Wishlist</h2>
            {loading ? <p className="text-ma-muted">Loading…</p> : products.length === 0 ? (
                <div className="border border-ma-border p-12 text-center">
                    <Heart size={28} className="text-ma-gold mx-auto" strokeWidth={1.2} />
                    <p className="font-serif text-[22px] mt-4">No favourites yet</p>
                    <p className="text-ma-muted text-sm mt-2">Tap the heart on any product to save it here.</p>
                    <Link to="/shop" className="btn-gold mt-6 inline-flex">Explore →</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {products.map((p) => (
                        <div key={p.id} className="flex gap-4 border border-ma-border p-4" data-testid={`wishlist-item-${p.id}`}>
                            <Link to={`/product/${p.slug}`} className="w-24 h-28 bg-ma-warm overflow-hidden flex-shrink-0">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </Link>
                            <div className="flex-1 flex flex-col">
                                <Link to={`/product/${p.slug}`} className="font-serif text-[18px] hover:text-ma-gold leading-tight">{p.name}</Link>
                                <p className="text-[13px] text-ma-muted mt-1">{formatPrice(p.price)}</p>
                                <div className="mt-auto flex gap-2">
                                    <button onClick={() => addItem(p, 1)} className="btn-outline-gold text-[10px] !py-2 flex-1" data-testid={`wishlist-add-${p.id}`}>Move to Bag</button>
                                    <button onClick={() => remove(p.id)} className="ma-link text-[10px]" data-testid={`wishlist-remove-${p.id}`}>Remove</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
