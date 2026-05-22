import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, MapPin, Heart, User as UserIcon } from "lucide-react";
import api, { formatPrice } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export default function Overview() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        (async () => {
            const [o, a, w] = await Promise.allSettled([
                api.get("/orders"),
                api.get("/addresses"),
                api.get("/wishlist"),
            ]);
            if (o.status === "fulfilled") setOrders(o.value.data.items);
            if (a.status === "fulfilled") setAddresses(a.value.data.items);
            if (w.status === "fulfilled") setWishlist(w.value.data.items);
        })();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Recent Orders" Icon={Package} link="/account/orders" testId="card-orders">
                {orders.length === 0 ? (
                    <p className="text-ma-muted text-[13px]">No orders yet. <Link to="/shop" className="text-ma-gold">Start shopping →</Link></p>
                ) : (
                    <ul className="space-y-2">
                        {orders.slice(0, 3).map((o) => (
                            <li key={o.id} className="flex items-center justify-between text-[13px]">
                                <span>#{o.id.slice(0,8).toUpperCase()}</span>
                                <span className="text-ma-muted">{formatPrice(o.total)}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
            <Card title="Saved Addresses" Icon={MapPin} link="/account/addresses" testId="card-addresses">
                <p className="text-ma-muted text-[13px]">{addresses.length} saved address{addresses.length === 1 ? "" : "es"}.</p>
            </Card>
            <Card title="Wishlist" Icon={Heart} link="/account/wishlist" testId="card-wishlist">
                <p className="text-ma-muted text-[13px]">{wishlist.length} piece{wishlist.length === 1 ? "" : "s"} loved.</p>
            </Card>
            <Card title="Account Details" Icon={UserIcon} link="/account/details" testId="card-details">
                <p className="text-ma-muted text-[13px] truncate">{user?.email}</p>
            </Card>
        </div>
    );
}

function Card({ title, Icon, link, children, testId }) {
    return (
        <div data-testid={testId} className="border border-ma-border p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="w-9 h-9 flex items-center justify-center border border-ma-gold/40 rounded-full">
                        <Icon size={14} className="text-ma-gold" strokeWidth={1.5} />
                    </span>
                    <h3 className="font-serif text-[20px]">{title}</h3>
                </div>
                <Link to={link} className="ma-link text-[10px]">View →</Link>
            </div>
            <div>{children}</div>
        </div>
    );
}
