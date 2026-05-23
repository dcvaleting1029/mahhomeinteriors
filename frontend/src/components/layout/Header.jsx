import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import MaLogo from "../MaLogo";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

const NAV = [
    { label: "NEW IN", href: "/shop?new=true" },
    { label: "SHOP", href: "/shop" },
    { label: "KITCHEN & DINING", href: "/shop?category=Kitchen+%26+Dining" },
    { label: "HOME LIVING", href: "/shop?category=Home+Living" },
    { label: "COLLECTIONS", href: "/collections" },
    { label: "SALE", href: "/shop?sale=true" },
    { label: "ABOUT", href: "/about" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [query, setQuery] = useState("");
    const { count, setOpen } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const onSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
            setSearchOpen(false);
            setQuery("");
        }
    };

    return (
        <header
            data-testid="site-header"
            className={`ma-header sticky top-0 z-40 ${scrolled ? "scrolled" : "bg-white border-b border-ma-border"}`}
        >
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 h-20 flex items-center">
                <div className="flex-1 flex items-center gap-6">
                    <button
                        data-testid="mobile-menu-button"
                        className="lg:hidden text-ma-text"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} strokeWidth={1.4} />
                    </button>
                    <MaLogo size={42} />
                </div>

                <nav className="hidden lg:flex items-center gap-8" data-testid="primary-nav">
                    {NAV.map((n) => (
                        <NavLink
                            key={n.label}
                            to={n.href}
                            data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                            className={({ isActive }) =>
                                `ma-link relative py-2 ${isActive ? "text-ma-gold" : ""}`
                            }
                        >
                            {n.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex-1 flex items-center justify-end gap-5">
                    <button
                        data-testid="search-toggle"
                        className="text-ma-text hover:text-ma-gold transition-colors"
                        onClick={() => setSearchOpen((v) => !v)}
                        aria-label="Search"
                    >
                        <Search size={19} strokeWidth={1.4} />
                    </button>
                    <Link
                        to={user ? "/account" : "/login"}
                        data-testid="account-link"
                        className="text-ma-text hover:text-ma-gold transition-colors"
                        aria-label="Account"
                    >
                        <User size={19} strokeWidth={1.4} />
                    </Link>
                    <button
                        data-testid="cart-toggle"
                        onClick={() => setOpen(true)}
                        className="relative text-ma-text hover:text-ma-gold transition-colors"
                        aria-label="Shopping bag"
                    >
                        <ShoppingBag size={19} strokeWidth={1.4} />
                        {count > 0 && (
                            <span
                                data-testid="cart-count"
                                className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-ma-gold text-white text-[10px] font-semibold flex items-center justify-center"
                            >
                                {count}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {searchOpen && (
                <div className="border-t border-ma-border bg-white">
                    <form onSubmit={onSearch} className="max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 py-4 flex items-center gap-3">
                        <Search size={18} className="text-ma-muted" strokeWidth={1.4} />
                        <input
                            data-testid="search-input"
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search the collection — try ‘candle’, ‘table’, ‘linen’…"
                            className="ma-input flex-1 border-b-0"
                        />
                        <button type="submit" className="ma-link" data-testid="search-submit">Search →</button>
                    </form>
                </div>
            )}

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} data-testid="mobile-nav-overlay">
                    <aside
                        className="absolute top-0 left-0 h-full w-[82%] max-w-[360px] bg-white shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-ma-border">
                            <MaLogo size={38} />
                            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="mobile-menu-close">
                                <X size={22} strokeWidth={1.4} />
                            </button>
                        </div>
                        <nav className="flex flex-col p-6 gap-5">
                            {NAV.map((n) => (
                                <Link
                                    key={n.label}
                                    to={n.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="ma-link text-[13px]"
                                >
                                    {n.label}
                                </Link>
                            ))}
                            <div className="ma-divider my-4" />
                            <Link to={user ? "/account" : "/login"} onClick={() => setMobileOpen(false)} className="ma-link text-[13px]">
                                {user ? `Hello, ${user.first_name}` : "LOGIN"}
                            </Link>
                            {!user && (
                                <Link to="/signup" onClick={() => setMobileOpen(false)} className="ma-link text-[13px]">
                                    CREATE ACCOUNT
                                </Link>
                            )}
                        </nav>
                    </aside>
                </div>
            )}
        </header>
    );
}
