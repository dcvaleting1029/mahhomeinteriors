import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Hand, Award, Mail } from "lucide-react";
import Layout from "../components/layout/Layout";
import Reveal from "../components/Reveal";

const HERO_IMG = "https://images.unsplash.com/photo-1758448755778-90ebf4d0f1e7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxtaW5pbWFsJTIwbHV4dXJ5JTIwbGl2aW5nJTIwcm9vbSUyMGJlaWdlfGVufDB8fHx8MTc3OTQ4NzU2NHww&ixlib=rb-4.1.0&q=85";
const STORY_IMG = "https://images.pexels.com/photos/7005270/pexels-photo-7005270.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const CRAFT_IMG = "https://images.unsplash.com/photo-1761330439741-3dcf41ee766b?crop=entropy&cs=srgb&fm=jpg&q=85";

export default function About() {
    return (
        <Layout>
            {/* HERO */}
            <section className="relative">
                <div className="aspect-[16/8] md:aspect-[16/7] overflow-hidden bg-ma-warm">
                    <img src={HERO_IMG} alt="Luxury living interior" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/40 to-transparent flex items-center">
                    <div className="max-w-[1440px] w-full mx-auto px-6 md:px-12 lg:px-16">
                        <Reveal duration={1000}>
                            <span className="ma-eyebrow" data-testid="about-eyebrow">Our Story</span>
                            <h1 className="font-serif text-[48px] sm:text-[64px] lg:text-[88px] leading-[1.02] tracking-tight mt-4 max-w-3xl">
                                Considered design. <span className="italic">Made to live with.</span>
                            </h1>
                            <p className="text-ma-muted text-[15px] mt-6 max-w-xl leading-relaxed">
                                MA Home Interiors curates luxury home pieces that hold their poise for a lifetime — quietly modern, deeply tactile, made by people who care.
                            </p>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* INTRO STORY */}
            <section className="py-24 lg:py-32">
                <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <Reveal>
                        <span className="ma-eyebrow" data-testid="about-founded-eyebrow">Founded in Glasgow</span>
                        <h2 className="font-serif text-[40px] lg:text-[52px] leading-[1.05] mt-3 mb-6">
                            How We <span className="italic text-ma-gold">Started.</span>
                        </h2>
                        <div className="text-ma-muted text-[14.5px] leading-[1.85] space-y-5 max-w-lg">
                            <p>
                                Founded by a father and son team, our journey began over 10 years ago with a simple goal — delivering great products and honest service through online marketplaces like eBay and Amazon. What started as a small reselling business quickly grew through dedication, experience, and a genuine passion for finding quality household products customers could trust.
                            </p>
                            <p>
                                After a decade of building relationships with suppliers and understanding what people truly value in their homes, we decided it was time to create something of our own — a store focused on carefully selected, high-quality household essentials crafted with care and built to last.
                            </p>
                            <p>
                                Based in Glasgow, we proudly source and dispatch our products locally, supporting craftsmanship, reliability, and the personal touch that large retailers often miss. Every item in our collection is chosen with the same standards we would expect for our own homes: practical, dependable, and made with quality in mind.
                            </p>
                            <p>
                                We believe shopping should feel personal, trustworthy, and straightforward. From our home in Glasgow to yours, thank you for supporting our family-built business and being part of our next chapter.
                            </p>
                        </div>
                    </Reveal>
                    <Reveal delay={120}>
                        <div className="aspect-[4/5] overflow-hidden bg-ma-warm">
                            <img src={STORY_IMG} alt="MA Home Interiors editorial" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* VALUES */}
            <section className="bg-ma-warm/50 border-y border-ma-border py-24 lg:py-32">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16">
                    <Reveal className="text-center max-w-2xl mx-auto mb-16">
                        <span className="ma-eyebrow">What We Stand For</span>
                        <h2 className="font-serif text-[40px] lg:text-[52px] leading-tight mt-3">A decade of trust, distilled.</h2>
                        <p className="text-ma-muted text-[14.5px] leading-[1.85] mt-5">
                            Ten years of serving customers through online marketplaces taught us what really matters at home. These are the three quiet principles our family business is built on.
                        </p>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
                        {[
                            { Icon: Hand, eyebrow: "01 · Honest Service", title: "Personal by nature", body: "We are still the small father-and-son team that started this. Every order is packed, dispatched and stood behind by people who genuinely care about how it arrives at your door." },
                            { Icon: Award, eyebrow: "02 · Quality First", title: "Built to last", body: "A decade of working with suppliers means we know what holds up — and what doesn't. We only stock household essentials we'd happily live with in our own homes." },
                            { Icon: Leaf, eyebrow: "03 · Glasgow Local", title: "Sourced & dispatched here", body: "Our products are selected, stored and shipped from Glasgow. Supporting local logistics, reliable delivery, and the personal touch that larger retailers can't quite replicate." },
                        ].map(({ Icon, eyebrow, title, body }, i) => (
                            <Reveal key={title} delay={i * 120}>
                                <span className="ma-eyebrow !text-ma-gold/90 text-[10px]">{eyebrow}</span>
                                <div className="flex items-center justify-center w-12 h-12 border border-ma-gold/40 rounded-full mt-4 mb-5">
                                    <Icon size={18} className="text-ma-gold" strokeWidth={1.4} />
                                </div>
                                <h3 className="font-serif text-[26px] leading-tight mb-3">{title}</h3>
                                <p className="text-ma-muted text-[13.5px] leading-[1.8]">{body}</p>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CRAFTSPEOPLE */}
            <section className="py-24 lg:py-32">
                <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <Reveal as="div" className="order-2 lg:order-1">
                        <div className="aspect-[4/5] overflow-hidden bg-ma-warm">
                            <img src={CRAFT_IMG} alt="The makers behind MA Home Interiors" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                    </Reveal>
                    <Reveal className="order-1 lg:order-2" delay={100}>
                        <span className="ma-eyebrow">The Makers</span>
                        <h2 className="font-serif text-[40px] lg:text-[52px] leading-[1.05] mt-3 mb-6">
                            A father, a son, <span className="italic text-ma-gold">and ten years in.</span>
                        </h2>
                        <div className="text-ma-muted text-[14.5px] leading-[1.85] space-y-5 max-w-lg">
                            <p>
                                We're not a faceless retailer. We're a father and son who started out reselling on eBay and Amazon, learning every shipping label, every customer message, every honest piece of feedback the hard way — and the right way.
                            </p>
                            <p>
                                Over the last decade we've built quiet, dependable relationships with the suppliers behind our shelves. We visit, we test, we negotiate, and we only bring through the household pieces we'd be proud to put in our own kitchens, living rooms and dining tables.
                            </p>
                            <p>
                                Everything you order from us still leaves Glasgow with the same care it did on day one. This is a family-built business, and you're now part of its next chapter.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 mt-10 max-w-md">
                            {[{n: "10+", l: "Years of trade"},{n: "2", l: "Generations"},{n: "1", l: "Glasgow home"}].map((s) => (
                                <div key={s.l}>
                                    <p className="font-serif text-[34px] text-ma-text leading-none">{s.n}</p>
                                    <p className="ma-eyebrow !text-ma-muted text-[9px] mt-2">{s.l}</p>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* CTA STRIP */}
            <section className="bg-ma-text text-white">
                <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16 py-20 lg:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <Reveal>
                        <span className="ma-eyebrow !text-ma-gold">Stay in Touch</span>
                        <h2 className="font-serif text-[36px] lg:text-[44px] leading-tight mt-3 text-white">
                            Quiet inspiration. <span className="italic text-ma-gold">Considered pieces.</span>
                        </h2>
                        <p className="text-white/70 mt-4 max-w-md text-[14px] leading-relaxed">
                            We send a thoughtful note once a month — new arrivals, seasonal stories, and the occasional first look reserved for our members.
                        </p>
                    </Reveal>
                    <Reveal delay={140} className="flex flex-col md:items-end gap-4">
                        <Link to="/shop" data-testid="about-cta-shop" className="btn-gold">Explore the Collection →</Link>
                        <a href="mailto:hello@ma-home.com" className="ma-link !text-white/70 hover:!text-ma-gold flex items-center gap-2">
                            <Mail size={14} strokeWidth={1.4} /> hello@ma-home.com
                        </a>
                    </Reveal>
                </div>
            </section>
        </Layout>
    );
}
