import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import Layout from "../components/layout/Layout";
import ProductCard from "../components/ProductCard";
import api from "../lib/api";
import Reveal from "../components/Reveal";

const CATEGORIES = ["All", "Furniture", "Lighting", "Decor & Accessories", "Tableware", "Candles & Fragrance", "Textiles"];
const COLOURS = ["Bone", "Sand", "Clay", "Oat", "Ivory", "Pebble", "Charcoal", "Amber"];
const MATERIALS = ["Ceramic", "Linen", "Stoneware", "Travertine", "Glass", "Bouclé", "Cotton", "Brass"];

export default function Shop() {
    const [params, setParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterOpen, setFilterOpen] = useState(false);

    const category = params.get("category") || "All";
    const isNew = params.get("new") === "true";
    const search = params.get("search") || "";
    const sort = params.get("sort") || "featured";
    const maxPrice = Number(params.get("max_price") || 1000);
    const inStockOnly = params.get("in_stock") === "true";

    useEffect(() => {
        setLoading(true);
        (async () => {
            const q = {};
            if (category && category !== "All") q.category = category;
            if (isNew) q.is_new = true;
            if (search) q.search = search;
            if (sort && sort !== "featured") q.sort = sort;
            if (maxPrice && maxPrice < 1000) q.max_price = maxPrice;
            const { data } = await api.get("/products", { params: q });
            let items = data.items;
            if (inStockOnly) items = items.filter((p) => p.in_stock);
            setProducts(items);
            setLoading(false);
        })();
    }, [category, isNew, search, sort, maxPrice, inStockOnly]);

    const setParam = (k, v) => {
        const next = new URLSearchParams(params);
        if (v === undefined || v === null || v === "" || v === "All") next.delete(k);
        else next.set(k, v);
        setParams(next, { replace: true });
    };

    const FilterContents = useMemo(() => (
        <div className="space-y-9">
            <Block title="Category">
                <ul className="space-y-2.5">
                    {CATEGORIES.map((c) => (
                        <li key={c}>
                            <button
                                data-testid={`filter-cat-${c.toLowerCase().replace(/\s|&/g, "-")}`}
                                onClick={() => setParam("category", c === "All" ? "" : c)}
                                className={`text-[13px] block hover:text-ma-gold transition-colors ${category === c ? "text-ma-gold" : "text-ma-text"}`}
                            >
                                {c}
                            </button>
                        </li>
                    ))}
                </ul>
            </Block>
            <Block title="Price">
                <input
                    data-testid="filter-price"
                    type="range" min={20} max={1000} step={5}
                    value={maxPrice}
                    onChange={(e) => setParam("max_price", e.target.value)}
                    className="w-full accent-ma-gold"
                />
                <p className="text-[12px] text-ma-muted mt-2">Up to £{maxPrice}</p>
            </Block>
            <Block title="Colour">
                <div className="flex flex-wrap gap-2">
                    {COLOURS.map((c) => (
                        <span key={c} className="text-[11px] tracking-widest uppercase px-3 py-1.5 border border-ma-border hover:border-ma-gold hover:text-ma-gold cursor-pointer transition-colors">
                            {c}
                        </span>
                    ))}
                </div>
            </Block>
            <Block title="Material">
                <ul className="space-y-2 text-[13px] text-ma-muted">
                    {MATERIALS.map((m) => <li key={m} className="hover:text-ma-text cursor-pointer">{m}</li>)}
                </ul>
            </Block>
            <Block title="Availability">
                <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                        data-testid="filter-stock"
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => setParam("in_stock", e.target.checked ? "true" : "")}
                        className="accent-ma-gold"
                    />
                    In stock only
                </label>
            </Block>
        </div>
    ), [category, maxPrice, inStockOnly]); // eslint-disable-line

    return (
        <Layout>
            <section className="border-b border-ma-border">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-20">
                    <Reveal>
                        <span className="ma-eyebrow">{isNew ? "New In" : category === "All" ? "Shop All" : category}</span>
                        <h1 className="font-serif text-[48px] md:text-[64px] leading-tight mt-3">
                            {isNew ? "Just Arrived" : category === "All" ? "Shop All" : category}
                        </h1>
                        <p className="text-ma-muted mt-3 max-w-xl text-[14px]">
                            {search ? `Showing results for “${search}”` : "Curated pieces for timeless interiors."}
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-12">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <button
                        data-testid="filter-toggle"
                        className="lg:hidden inline-flex items-center gap-2 ma-link"
                        onClick={() => setFilterOpen(true)}
                    >
                        <SlidersHorizontal size={14} /> Filters
                    </button>
                    <p className="text-[13px] text-ma-muted">{products.length} products</p>
                    <label className="inline-flex items-center gap-3 text-[12px] text-ma-muted">
                        <span className="hidden sm:inline ma-eyebrow !text-ma-muted">Sort by</span>
                        <select
                            data-testid="sort-select"
                            value={sort}
                            onChange={(e) => setParam("sort", e.target.value === "featured" ? "" : e.target.value)}
                            className="bg-transparent border-b border-ma-border focus:border-ma-gold outline-none py-1 text-[12px] uppercase tracking-widest"
                        >
                            <option value="featured">Featured</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest</option>
                        </select>
                    </label>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12">
                    <aside className="hidden lg:block" data-testid="filter-sidebar">{FilterContents}</aside>
                    <div>
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="aspect-[4/5] bg-ma-warm animate-pulse" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-24" data-testid="no-products">
                                <p className="font-serif text-[28px]">No products found</p>
                                <p className="text-ma-muted mt-2 text-sm">Try adjusting your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8" data-testid="product-grid">
                                {products.map((p, idx) => (
                                    <Reveal key={p.id} as="div" delay={(idx % 4) * 80}>
                                        <ProductCard product={p} />
                                    </Reveal>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {filterOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setFilterOpen(false)}>
                    <aside className="absolute top-0 left-0 h-full w-[85%] max-w-[340px] bg-white p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-serif text-[24px]">Filters</h3>
                            <button onClick={() => setFilterOpen(false)} data-testid="close-filter-drawer"><X size={20} /></button>
                        </div>
                        {FilterContents}
                    </aside>
                </div>
            )}
        </Layout>
    );
}

function Block({ title, children }) {
    return (
        <div>
            <h4 className="ma-eyebrow !text-ma-text mb-4">{title}</h4>
            {children}
        </div>
    );
}
