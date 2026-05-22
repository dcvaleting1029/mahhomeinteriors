import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutGrid, Package, Heart, MapPin, User as UserIcon, LogOut } from "lucide-react";
import Layout from "../../components/layout/Layout";
import { useAuth } from "../../contexts/AuthContext";

const ITEMS = [
    { to: "/account", end: true, label: "Overview", Icon: LayoutGrid, testId: "nav-overview" },
    { to: "/account/orders", label: "Orders", Icon: Package, testId: "nav-orders" },
    { to: "/account/wishlist", label: "Wishlist", Icon: Heart, testId: "nav-wishlist" },
    { to: "/account/addresses", label: "Addresses", Icon: MapPin, testId: "nav-addresses" },
    { to: "/account/details", label: "Account Details", Icon: UserIcon, testId: "nav-details" },
];

export default function AccountLayout() {
    const { user, loading, logout } = useAuth();
    const nav = useNavigate();

    if (loading) {
        return <Layout><div className="h-[60vh] flex items-center justify-center"><div className="ma-spinner" /></div></Layout>;
    }
    if (!user) {
        return (
            <Layout hideAnnouncement>
                <div className="max-w-md mx-auto text-center py-24 px-6">
                    <h1 className="font-serif text-[34px]">Please log in</h1>
                    <p className="text-ma-muted mt-3 mb-8">You need an account to access this area.</p>
                    <Link to="/login" className="btn-gold inline-flex" data-testid="goto-login">Log in →</Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-[1280px] mx-auto px-6 md:px-12 lg:px-16 py-12">
                <span className="ma-eyebrow">My Account</span>
                <h1 className="font-serif text-[40px] md:text-[52px] mt-3">Welcome back, {user.first_name}.</h1>
                <p className="text-ma-muted mt-2 text-[13.5px]">Manage your orders, addresses and preferences.</p>

                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-12 mt-12">
                    <aside data-testid="account-sidebar">
                        <ul className="space-y-1">
                            {ITEMS.map(({ to, end, label, Icon, testId }) => (
                                <li key={to}>
                                    <NavLink
                                        to={to}
                                        end={end}
                                        data-testid={testId}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 text-[13px] border-l-2 transition-colors ${isActive ? "border-ma-gold bg-ma-warm/50 text-ma-text" : "border-transparent text-ma-muted hover:text-ma-text"}`
                                        }
                                    >
                                        <Icon size={15} strokeWidth={1.5} />
                                        <span>{label}</span>
                                    </NavLink>
                                </li>
                            ))}
                            <li>
                                <button
                                    data-testid="nav-logout"
                                    onClick={async () => { await logout(); nav("/"); }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-ma-muted hover:text-ma-text border-l-2 border-transparent"
                                >
                                    <LogOut size={15} strokeWidth={1.5} /> Logout
                                </button>
                            </li>
                        </ul>
                    </aside>
                    <section>
                        <Outlet />
                    </section>
                </div>
            </div>
        </Layout>
    );
}
