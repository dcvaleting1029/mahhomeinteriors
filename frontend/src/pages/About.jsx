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
                        <span className="ma-eyebrow">Founded in London</span>
                        <h2 className="font-serif text-[40px] lg:text-[52px] leading-[1.05] mt-3 mb-6">
                            Editorial spaces.<br />
                            <span className="italic text-ma-gold">Lived-in luxury.</span>
                        </h2>
                        <div className="text-ma-muted text-[14.5px] leading-[1.85] space-y-5 max-w-lg">
                            <p>
                                MA Home Interiors was founded on a quiet conviction — that the best homes aren't decorated, they're collected. Piece by piece. Year by year. With intention.
                            </p>
                            <p>
                                Our studio works with independent makers across Europe, India and the UK, sourcing furniture, lighting and tableware that pair material honesty with the kind of detail you only notice on the second look.
                            </p>
                            <p>
                                Every piece in our collection earns its place. We don't follow seasons — we follow craft.
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
                        <h2 className="font-serif text-[40px] lg:text-[52px] leading-tight mt-3">Three quiet principles.</h2>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
                        {[
                            { Icon: Hand, eyebrow: "01 · Craft", title: "Made by hand", body: "We work directly with small studios and family-run workshops. Each piece carries the quiet imperfections that only handwork can give." },
                            { Icon: Award, eyebrow: "02 · Quality", title: "Built to last", body: "Solid stone, hardwood, mouth-blown glass, heavyweight linen — materials that age beautifully and stay with you for decades." },
                            { Icon: Leaf, eyebrow: "03 · Conscience", title: "Sustainably sourced", body: "Natural materials, low-waste packaging, fair payment for the makers we work with. Quietly responsible, transparently so." },
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
                            People before products.
                        </h2>
                        <div className="text-ma-muted text-[14.5px] leading-[1.85] space-y-5 max-w-lg">
                            <p>
                                The studios we work with aren't faceless suppliers — they're potters, weavers, glassblowers, joiners. We visit, we listen, and we commission pieces that play to what each maker does best.
                            </p>
                            <p>
                                Some of our makers have been in their craft for three generations. Others started yesterday. What they share is a refusal to compromise on the things you'll only notice when you hold the piece in your hands.
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-6 mt-10 max-w-md">
                            {[{n: "20+", l: "Independent makers"},{n: "9", l: "Countries"},{n: "1", l: "Quiet standard"}].map((s) => (
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
