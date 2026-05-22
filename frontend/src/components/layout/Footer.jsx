import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";
import MaLogo from "../MaLogo";

const SHOP = ["New In", "Shop All", "Furniture", "Decor & Accessories", "Lighting", "Textiles", "Sale"];
const CARE = ["Delivery Information", "Returns & Exchanges", "FAQs", "Size Guide", "Care Instructions", "Track My Order"];
const ABOUT = ["About Us", "Our Journal", "Sustainability", "Trade Program", "Contact Us"];

export default function Footer() {
    const [email, setEmail] = useState("");
    const [signedUp, setSignedUp] = useState(false);
    return (
        <footer data-testid="site-footer" className="bg-ma-warm border-t border-ma-border">
            {/* Newsletter strip */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div className="flex items-start gap-5">
                    <span className="flex items-center justify-center w-12 h-12 rounded-full border border-ma-gold/40">
                        <Mail size={20} className="text-ma-gold" strokeWidth={1.4} />
                    </span>
                    <div>
                        <h3 className="font-serif text-[28px] md:text-[34px] leading-tight">Join Our Community</h3>
                        <p className="text-ma-muted text-sm mt-2 max-w-md">
                            Be the first to know about new arrivals, exclusive offers and inspiration for your home.
                        </p>
                    </div>
                </div>
                <form
                    onSubmit={(e) => { e.preventDefault(); if (email) setSignedUp(true); }}
                    className="flex items-center gap-0 border-b border-ma-text"
                >
                    <input
                        data-testid="newsletter-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="flex-1 bg-transparent py-4 outline-none text-sm placeholder:text-ma-muted"
                    />
                    <button type="submit" data-testid="newsletter-submit" className="btn-gold !py-3 !px-6 ml-3">
                        {signedUp ? "Subscribed ✓" : "Sign Up →"}
                    </button>
                </form>
            </div>

            <div className="ma-divider" />

            {/* Main grid */}
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
                <div className="col-span-2 md:col-span-2">
                    <MaLogo size={50} withText />
                    <p className="text-ma-muted text-sm mt-6 max-w-sm leading-relaxed">
                        Creating beautiful, functional spaces for the way you live today.
                    </p>
                    <div className="flex items-center gap-4 mt-6">
                        <a href="#instagram" aria-label="Instagram" className="text-ma-text hover:text-ma-gold transition-colors"><Instagram size={18} strokeWidth={1.4} /></a>
                        <a href="#facebook" aria-label="Facebook" className="text-ma-text hover:text-ma-gold transition-colors"><Facebook size={18} strokeWidth={1.4} /></a>
                        <a href="mailto:hello@ma-home.com" aria-label="Email" className="text-ma-text hover:text-ma-gold transition-colors"><Mail size={18} strokeWidth={1.4} /></a>
                    </div>
                </div>
                <FooterCol title="Shop" items={SHOP} />
                <FooterCol title="Customer Care" items={CARE} />
                <FooterCol title="About" items={ABOUT} />
            </div>

            <div className="ma-divider" />
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-ma-muted">
                <div className="flex items-center gap-6">
                    <span>© {new Date().getFullYear()} MA Home Interiors. All rights reserved.</span>
                </div>
                <div className="flex items-center gap-5">
                    <Link to="/privacy" className="hover:text-ma-text transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-ma-text transition-colors">Terms &amp; Conditions</Link>
                </div>
                <div className="flex items-center gap-2 opacity-80">
                    <PaymentMark label="VISA" />
                    <PaymentMark label="MC" />
                    <PaymentMark label="PayPal" />
                    <PaymentMark label="Apple Pay" />
                </div>
            </div>
        </footer>
    );
}

function FooterCol({ title, items }) {
    return (
        <div>
            <h4 className="ma-eyebrow !text-ma-text mb-5">{title}</h4>
            <ul className="space-y-3 text-sm text-ma-muted">
                {items.map((i) => (
                    <li key={i}><a href={`/shop?q=${encodeURIComponent(i)}`} className="hover:text-ma-gold transition-colors">{i}</a></li>
                ))}
            </ul>
        </div>
    );
}

function PaymentMark({ label }) {
    return (
        <span className="inline-flex items-center justify-center px-2 py-1 border border-ma-border bg-white text-[9px] tracking-widest font-semibold text-ma-text">
            {label}
        </span>
    );
}
