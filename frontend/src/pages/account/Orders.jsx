import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { formatPrice } from "../../lib/api";

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get("/orders");
                setOrders(data.items);
            } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div data-testid="orders-page">
            <h2 className="font-serif text-[32px] mb-6">Order History</h2>
            {loading ? (
                <p className="text-ma-muted">Loading…</p>
            ) : orders.length === 0 ? (
                <div className="border border-ma-border p-12 text-center">
                    <p className="font-serif text-[22px]">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="btn-gold mt-6 inline-flex">Start Shopping →</Link>
                </div>
            ) : (
                <div className="border border-ma-border">
                    <table className="w-full text-sm">
                        <thead className="bg-ma-warm/40">
                            <tr className="ma-eyebrow !text-ma-text">
                                <th className="text-left p-4">Order</th>
                                <th className="text-left p-4">Date</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-right p-4">Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((o) => (
                                <tr key={o.id} className="border-t border-ma-border" data-testid={`order-row-${o.id}`}>
                                    <td className="p-4 font-mono text-[12px]">#{o.id.slice(0, 8).toUpperCase()}</td>
                                    <td className="p-4 text-ma-muted">{new Date(o.created_at).toLocaleDateString("en-GB")}</td>
                                    <td className="p-4">
                                        <span className={`text-[11px] uppercase tracking-widest px-2.5 py-1 ${
                                            o.payment_status === "paid" ? "bg-ma-gold/10 text-ma-gold" : "bg-ma-warm text-ma-muted"
                                        }`}>{o.status}</span>
                                    </td>
                                    <td className="p-4 text-right">{formatPrice(o.total)}</td>
                                    <td className="p-4 text-right">
                                        <Link to={`/account/orders/${o.id}`} className="ma-link text-[10px]">View →</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
