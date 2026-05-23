import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ProductCard from "../components/ProductCard";
import api from "../lib/api";

export default function Collection() {
    const { id } = useParams();
    const [collection, setCollection] = useState(null);
    const [products, setProducts] = useState([]);
    const [others, setOthers] = useState([]);

    useEffect(() => {
        (async () => {
            const { data } = await api.get(`/products/collections/${id}`);
            setCollection(data.collection);
            setProducts(data.products);
            const all = await api.get("/products/collections");
            setOthers(all.data.items.filter((c) => c.id !== id));
        })();
    }, [id]);

    if (!collection) return <Layout><div className="h-[60vh] flex items-center justify-center text-ma-muted">Loading collection…</div></Layout>;

    return (
        <Layout>
            <section className="relative">
                <div className="aspect-[16/7] overflow-hidden">
                    <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/85 to-white/20 flex items-center">
                    <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 lg:px-16">
                        <Reveal>
                            <span className="ma-eyebrow">Collection</span>
                            <h1 className="font-serif text-[44px] md:text-[68px] lg:text-[84px] leading-[1.02] mt-4 max-w-2xl">{collection.name}</h1>
                            <p className="text-ma-muted text-[15px] mt-5 max-w-xl">{collection.subtitle}</p>
                            <a href="#products" className="btn-gold mt-8">Shop Collection →</a>
                        </Reveal>
                    </div>
                </div>
            </section>

            <section id="products" className="py-24 lg:py-32">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
                    <h2 className="font-serif text-[34px] mb-12 max-w-xl leading-tight">The Pieces</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8" data-testid="collection-products">
                        {products.map((p, idx) => (
                            <Reveal key={p.id} as="div" delay={(idx % 4) * 90}>
                                <ProductCard product={p} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {others.length > 0 && (
                <section className="bg-ma-warm/40 border-t border-ma-border py-24">
                    <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
                        <span className="ma-eyebrow">Related Collections</span>
                        <h3 className="font-serif text-[32px] mt-3 mb-10">Discover More Looks</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {others.slice(0, 3).map((c) => (
                                <Link key={c.id} to={`/collections/${c.id}`} className="group block" data-testid={`related-${c.id}`}>
                                    <div className="aspect-[4/5] overflow-hidden bg-ma-warm">
                                        <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    </div>
                                    <h4 className="font-serif text-[20px] mt-4">{c.name}</h4>
                                    <p className="text-ma-muted text-[12px] mt-1 line-clamp-1">{c.subtitle}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </Layout>
    );
}
