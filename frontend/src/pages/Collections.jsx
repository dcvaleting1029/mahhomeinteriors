import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import api from "../lib/api";
import Reveal from "../components/Reveal";

export default function Collections() {
    const [list, setList] = useState([]);
    useEffect(() => {
        (async () => {
            const { data } = await api.get("/products/collections");
            setList(data.items);
        })();
    }, []);
    return (
        <Layout>
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-16">
                <Reveal>
                    <span className="ma-eyebrow">Curated Looks</span>
                    <h1 className="font-serif text-[48px] md:text-[64px] mt-3 mb-3">Collections</h1>
                    <p className="text-ma-muted max-w-xl text-[14px] mb-12">Shop the look — considered groupings to bring effortless cohesion to your home.</p>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                    {list.map((c, idx) => (
                        <Reveal key={c.id} as="div" delay={idx * 110}>
                            <Link to={`/collections/${c.id}`} className="group block" data-testid={`collection-${c.id}`}>
                                <div className="aspect-[5/4] overflow-hidden bg-ma-warm">
                                    <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-[800ms] group-hover:scale-105" />
                                </div>
                                <div className="pt-6 flex items-start justify-between gap-6">
                                    <div>
                                        <h2 className="font-serif text-[30px] leading-tight">{c.name}</h2>
                                        <p className="text-ma-muted text-[13px] mt-2 max-w-md">{c.subtitle}</p>
                                    </div>
                                    <span className="ma-link text-[10px] group-hover:text-ma-gold mt-1 flex-shrink-0">Shop the Look →</span>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>
            </div>
        </Layout>
    );
}
