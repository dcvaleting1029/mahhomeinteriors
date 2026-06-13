import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, Truck, RotateCcw, Star } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../components/ui/accordion";
import Layout from "../components/layout/Layout";
import ProductCard from "../components/ProductCard";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import api, { formatPrice } from "../lib/api";
import Reveal from "../components/Reveal";

export default function ProductDetail() {
    const { slug } = useParams();
    const [data, setData] = useState(null);
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [colour, setColour] = useState(null);
    const { addItem, setOpen } = useCart();
    const { has, toggle } = useWishlist();

    useEffect(() => {
        (async () => {
            const { data } = await api.get(`/products/${slug}`);
            setData(data);
            setActiveImg(0);
            setColour((data.product.colours || [])[0] || null);
        })();
    }, [slug]);

    if (!data) return <Layout><div className="h-[60vh] flex items-center justify-center text-ma-muted">Loading…</div></Layout>;
    const p = data.product;
    const gallery = p.gallery && p.gallery.length ? p.gallery : [p.image];

    return (
        <Layout>
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-10">
                <nav className="text-[11px] tracking-widest uppercase text-ma-muted flex items-center gap-2 mb-10">
                    <Link to="/" className="hover:text-ma-gold">Home</Link>
                    <span>/</span>
                    <Link to={`/shop?category=${encodeURIComponent(p.category)}`} className="hover:text-ma-gold">{p.category}</Link>
                    <span>/</span>
                    <span className="text-ma-text">{p.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Gallery */}
                    <Reveal duration={900}>
                        <div className="aspect-[4/5] overflow-hidden bg-white group" data-testid="product-main-image">
                            <img src={gallery[activeImg]} alt={p.name} className="w-full h-full object-contain p-6 sm:p-8 transition-transform duration-[1200ms] group-hover:scale-105" />
                        </div>
                        {gallery.length > 1 && (
                            <div className="grid grid-cols-5 gap-3 mt-4">
                                {gallery.map((g, i) => (
                                    <button
                                        key={i}
                                        data-testid={`thumb-${i}`}
                                        onClick={() => setActiveImg(i)}
                                        className={`aspect-square overflow-hidden border-2 transition-colors bg-white ${i === activeImg ? "border-ma-gold" : "border-transparent hover:border-ma-border"}`}
                                    >
                                        <img src={g} alt="" className="w-full h-full object-contain p-2" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </Reveal>

                    {/* Details */}
                    <Reveal delay={120} duration={900}>
                        <span className="ma-eyebrow">{p.category}</span>
                        <h1 className="font-serif text-[40px] md:text-[52px] leading-tight mt-3 mb-4">{p.name}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="font-serif text-[26px]">{formatPrice(p.price, p.currency)}</span>
                            {p.on_sale && p.original_price && p.original_price > p.price && (
                                <span className="font-serif text-[18px] text-ma-muted line-through" data-testid="detail-price-original">
                                    {formatPrice(p.original_price, p.currency)}
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-[12px] text-ma-muted">
                                <span className="star-gold flex">
                                    {[0,1,2,3,4].map((i) => <Star key={i} size={12} fill="currentColor" strokeWidth={0} />)}
                                </span>
                                <span>(38 reviews)</span>
                            </span>
                        </div>
                        <p className="text-ma-muted leading-relaxed text-[14px] mb-8 max-w-lg">{p.short_description}</p>

                        {p.colours && p.colours.length > 0 && (
                            <div className="mb-8">
                                <p className="ma-eyebrow !text-ma-text mb-3">Colour {colour && <span className="text-ma-muted font-normal normal-case tracking-normal">— {colour}</span>}</p>
                                <div className="flex flex-wrap gap-2">
                                    {p.colours.map((c) => (
                                        <button
                                            key={c}
                                            data-testid={`colour-${c.toLowerCase()}`}
                                            onClick={() => setColour(c)}
                                            className={`text-[11px] tracking-widest uppercase px-4 py-2 border transition-colors ${colour === c ? "border-ma-gold text-ma-gold" : "border-ma-border hover:border-ma-text"}`}
                                        >{c}</button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center border border-ma-border">
                                <button data-testid="qty-dec" onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-12 flex items-center justify-center hover:bg-ma-warm"><Minus size={14} /></button>
                                <span className="w-10 text-center" data-testid="qty-value">{qty}</span>
                                <button data-testid="qty-inc" onClick={() => setQty(qty + 1)} className="w-11 h-12 flex items-center justify-center hover:bg-ma-warm"><Plus size={14} /></button>
                            </div>
                            <button
                                data-testid="add-to-cart-detail"
                                onClick={() => addItem(p, qty, { colour })}
                                className="btn-gold flex-1 justify-center"
                            >
                                Add to Cart →
                            </button>
                            <button
                                data-testid="wishlist-detail"
                                onClick={() => toggle(p.id)}
                                aria-label="Wishlist"
                                className="w-12 h-12 flex items-center justify-center border border-ma-border hover:border-ma-gold transition-colors"
                            >
                                <Heart size={16} strokeWidth={1.4} fill={has(p.id) ? "#C9983F" : "none"} className={has(p.id) ? "text-ma-gold" : ""} />
                            </button>
                        </div>
                        <button
                            data-testid="buy-now"
                            onClick={() => { addItem(p, qty, { colour }); setOpen(false); window.location.assign("/checkout"); }}
                            className="btn-dark w-full justify-center"
                        >
                            Buy It Now
                        </button>

                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="flex items-center gap-3 text-[12px] text-ma-muted">
                                <Truck size={16} className="text-ma-gold" strokeWidth={1.4} />
                                <span>Free UK delivery over £100</span>
                            </div>
                            <div className="flex items-center gap-3 text-[12px] text-ma-muted">
                                <RotateCcw size={16} className="text-ma-gold" strokeWidth={1.4} />
                                <span>30-day easy returns</span>
                            </div>
                        </div>

                        <Accordion type="multiple" defaultValue={["desc"]} className="mt-10 border-t border-ma-border">
                            <AccordionItem value="desc">
                                <AccordionTrigger className="ma-eyebrow !text-ma-text">Description</AccordionTrigger>
                                <AccordionContent className="text-ma-muted text-[14px] leading-relaxed">{p.description}</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="dim">
                                <AccordionTrigger className="ma-eyebrow !text-ma-text">Dimensions</AccordionTrigger>
                                <AccordionContent className="text-ma-muted text-[14px]">{p.dimensions}</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="mat">
                                <AccordionTrigger className="ma-eyebrow !text-ma-text">Materials &amp; Care</AccordionTrigger>
                                <AccordionContent className="text-ma-muted text-[14px]"><strong>Materials:</strong> {p.materials}<br /><strong>Care:</strong> {p.care}</AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="del">
                                <AccordionTrigger className="ma-eyebrow !text-ma-text">Delivery &amp; Returns</AccordionTrigger>
                                <AccordionContent className="text-ma-muted text-[14px]">Standard UK delivery is free on orders over £100. Express delivery available at £6.99. 30-day returns on unused items.</AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Reveal>
                </div>
            </div>

            {data.related && data.related.length > 0 && (
                <section className="bg-ma-warm/40 border-t border-ma-border py-24 mt-20">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
                        <Reveal>
                            <span className="ma-eyebrow">You May Also Like</span>
                            <h3 className="font-serif text-[34px] mt-3 mb-10">Pair It With</h3>
                        </Reveal>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8" data-testid="related-products">
                            {data.related.map((rp, idx) => (
                                <Reveal key={rp.id} as="div" delay={idx * 90}>
                                    <ProductCard product={rp} />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </Layout>
    );
}
