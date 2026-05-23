import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Truck, RotateCcw, ShieldCheck, MessageSquare, Star } from "lucide-react";
import Layout from "../components/layout/Layout";
import ProductCard from "../components/ProductCard";
import api, { formatPrice } from "../lib/api";
import Reveal from "../components/Reveal";

// Hero & lifestyle imagery from design guidelines
const HERO_IMG = "https://images.unsplash.com/photo-1758448755778-90ebf4d0f1e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85";
const WHY_IMG = "https://images.pexels.com/photos/7005270/pexels-photo-7005270.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [categories, setCategories] = useState([]);
    const scrollerRef = useRef(null);

    useEffect(() => {
        (async () => {
            const [p, cls, cats] = await Promise.all([
                api.get("/products", { params: { is_new: true } }),
                api.get("/products/collections"),
                api.get("/products/categories"),
            ]);
            setProducts(p.data.items);
            setCollections(cls.data.items);
            setCategories(cats.data.items);
        })();
    }, []);

    const scrollBy = (dir) => {
        if (!scrollerRef.current) return;
        scrollerRef.current.scrollBy({ left: dir * scrollerRef.current.clientWidth * 0.6, behavior: "smooth" });
    };

    return (
        <Layout>
            {/* HERO */}
            <section className="relative bg-white">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center min-h-[560px] lg:min-h-[640px] py-16 lg:py-24">
                    <Reveal className="lg:col-span-5 flex flex-col items-start z-10 max-w-xl" duration={1000}>
                        <span className="ma-eyebrow mb-6" data-testid="hero-eyebrow">MA, Home Interiors</span>
                        <h1 className="font-serif text-[44px] sm:text-[58px] lg:text-[78px] leading-[1.02] tracking-tight mb-3">
                            Beautiful Spaces.
                        </h1>
                        <h2 className="font-serif italic text-[36px] sm:text-[48px] lg:text-[64px] leading-[1.05] mb-7">
                            Designed for <span className="text-ma-gold not-italic font-semibold">You.</span>
                        </h2>
                        <p className="text-ma-muted text-[15px] leading-relaxed max-w-md mb-9">
                            Luxury home interiors curated for modern living. Timeless pieces, loved for creating a gallery in your home.
                        </p>
                        <Link to="/shop" data-testid="hero-cta" className="btn-gold">
                            Shop the Collection <ArrowRight size={14} strokeWidth={2} />
                        </Link>
                    </Reveal>

                    <Reveal className="lg:col-span-7 relative h-[380px] sm:h-[460px] lg:h-[600px]" delay={150} duration={1100} distance={30}>
                        <div className="absolute inset-0 lg:left-0">
                            <img
                                src={HERO_IMG}
                                alt="Luxury living room"
                                className="hero-mask-left w-full h-full object-cover"
                            />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* BENEFITS BAR */}
            <section className="border-y border-ma-border bg-ma-warm/40">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-2 md:grid-cols-4 divide-x divide-ma-border">
                    {[
                        { Icon: Truck, title: "Free UK Delivery", sub: "On orders over £100" },
                        { Icon: RotateCcw, title: "Easy Returns", sub: "30-day returns" },
                        { Icon: ShieldCheck, title: "Secure Payment", sub: "100% safe & secure" },
                        { Icon: MessageSquare, title: "Customer Support", sub: "We're here to help" },
                    ].map(({ Icon, title, sub }, idx) => (
                        <Reveal key={title} delay={idx * 100} className="flex items-center gap-4 py-8 px-4 md:px-8">
                            <span className="flex items-center justify-center w-11 h-11 border border-ma-gold/40 rounded-full">
                                <Icon size={18} className="text-ma-gold" strokeWidth={1.4} />
                            </span>
                            <div>
                                <p className="font-serif text-[18px] leading-tight">{title}</p>
                                <p className="text-[12px] text-ma-muted mt-1">{sub}</p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </section>

            {/* SHOP BY CATEGORY */}
            <section className="py-24 lg:py-32">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
                    <Reveal className="flex items-end justify-between mb-14 flex-wrap gap-4">
                        <div>
                            <span className="ma-eyebrow">Shop by Category</span>
                            <h2 className="font-serif text-[40px] lg:text-[56px] leading-tight mt-3">Shop Our Bestsellers</h2>
                        </div>
                        <Link to="/shop" className="ma-link" data-testid="view-all-categories">View All Categories →</Link>
                    </Reveal>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 lg:gap-6">
                        {categories.map((c, idx) => {
                            const href = c.is_filter
                                ? (c.filter === "new" ? "/shop?new=true" : "/shop?sale=true")
                                : `/shop?category=${encodeURIComponent(c.name)}`;
                            return (
                                <Reveal key={c.id} delay={idx * 90} as="div">
                                    <Link
                                        data-testid={`category-${c.id}`}
                                        to={href}
                                        className="group block"
                                    >
                                        <div className="overflow-hidden bg-ma-warm aspect-[4/5] relative">
                                            <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105" loading="lazy" />
                                            {c.is_filter && (
                                                <span className="absolute top-4 left-4 bg-white text-ma-text text-[9px] tracking-widest uppercase px-3 py-1.5 border border-ma-gold">
                                                    {c.filter === "new" ? "New In" : "Save Now"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="pt-5 flex flex-col gap-1">
                                            <h3 className="font-serif text-[20px] leading-tight">{c.name}</h3>
                                            <span className="ma-link !text-[10px] text-ma-muted group-hover:text-ma-gold">Shop Now →</span>
                                        </div>
                                    </Link>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* NEW IN CAROUSEL */}
            <section className="bg-ma-warm/40 py-24 lg:py-32 border-y border-ma-border">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
                    <Reveal className="flex items-end justify-between mb-12 flex-wrap gap-4">
                        <div>
                            <span className="ma-eyebrow">New In</span>
                            <h2 className="font-serif text-[40px] lg:text-[56px] leading-tight mt-3">Just Arrived</h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/shop?new=true" className="ma-link" data-testid="view-all-new">View All New In →</Link>
                            <div className="hidden md:flex items-center gap-2">
                                <button data-testid="carousel-prev" onClick={() => scrollBy(-1)} className="w-10 h-10 flex items-center justify-center border border-ma-border bg-white hover:border-ma-gold hover:text-ma-gold transition-colors" aria-label="Previous">
                                    <ChevronLeft size={16} strokeWidth={1.4} />
                                </button>
                                <button data-testid="carousel-next" onClick={() => scrollBy(1)} className="w-10 h-10 flex items-center justify-center border border-ma-border bg-white hover:border-ma-gold hover:text-ma-gold transition-colors" aria-label="Next">
                                    <ChevronRight size={16} strokeWidth={1.4} />
                                </button>
                            </div>
                        </div>
                    </Reveal>
                    <Reveal as="div" delay={120}>
                        <div
                            ref={scrollerRef}
                            className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 -mx-4 px-4"
                        >
                            {products.map((p) => (
                                <div key={p.id} className="snap-start flex-none w-[78%] sm:w-[44%] md:w-[30%] lg:w-[22%]">
                                    <ProductCard product={p} eager />
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* WHY CHOOSE */}
            <section className="py-24 lg:py-32">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <Reveal>
                        <span className="ma-eyebrow">Why Choose Us</span>
                        <h2 className="font-serif text-[40px] lg:text-[56px] leading-tight mt-3 mb-10">
                            Why Choose <span className="italic">MA Home Interiors?</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Timeless Design", sub: "Pieces that never go out of style." },
                                { title: "Premium Quality", sub: "Crafted with the finest materials." },
                                { title: "Sustainable Choices", sub: "Designed for a better home & planet." },
                            ].map((f, i) => (
                                <Reveal key={f.title} delay={150 + i * 100}>
                                    <span className="ma-eyebrow !text-ma-gold/80 text-[10px]">0{i + 1}</span>
                                    <h3 className="font-serif text-[22px] mt-3 mb-2">{f.title}</h3>
                                    <p className="text-ma-muted text-[13px] leading-relaxed">{f.sub}</p>
                                </Reveal>
                            ))}
                        </div>
                    </Reveal>
                    <Reveal delay={120} className="relative">
                        <div className="aspect-[4/5] overflow-hidden bg-ma-warm">
                            <img src={WHY_IMG} alt="Interior" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div className="absolute -bottom-6 -left-6 md:bottom-8 md:-left-10 bg-white border border-ma-border p-6 w-[260px] shadow-lg" data-testid="trustpilot-card">
                            <div className="star-gold flex gap-[2px] mb-2">
                                {[0,1,2,3,4].map((i) => <Star key={i} size={16} fill="currentColor" strokeWidth={0} />)}
                            </div>
                            <p className="font-serif text-[22px] leading-tight">Excellent</p>
                            <p className="text-[12px] text-ma-muted mt-1">4.8 out of 5 — based on 2,357 reviews</p>
                            <p className="ma-eyebrow !text-ma-muted text-[9px] mt-3">Trustpilot</p>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* SHOP THE LOOK */}
            <section className="bg-ma-warm/40 py-24 lg:py-32 border-y border-ma-border">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
                    <Reveal className="flex items-end justify-between mb-12 flex-wrap gap-4">
                        <div>
                            <span className="ma-eyebrow">Shop the Look</span>
                            <h2 className="font-serif text-[40px] lg:text-[56px] leading-tight mt-3">Complete Your Space</h2>
                        </div>
                        <Link to="/collections" className="ma-link" data-testid="view-all-looks">View All Looks →</Link>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {collections.map((col, idx) => (
                            <Reveal key={col.id} as="div" delay={idx * 110}>
                                <Link to={`/collections/${col.id}`} data-testid={`look-${col.id}`} className="group block">
                                    <div className="aspect-[4/5] overflow-hidden bg-ma-warm">
                                        <img src={col.image} alt={col.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105" />
                                    </div>
                                    <div className="pt-5 flex flex-col gap-1">
                                        <h3 className="font-serif text-[20px] leading-tight">{col.name}</h3>
                                        <span className="ma-link !text-[10px] text-ma-muted group-hover:text-ma-gold">Shop The Look →</span>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
