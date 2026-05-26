import React, { useEffect, useState } from "react";
import { Truck, X } from "lucide-react";
import api, { formatPrice, formatApiErrorDetail } from "../../lib/api";

const STATUS_STYLES = {
    pending_payment: "bg-ma-warm text-ma-muted",
    confirmed: "bg-ma-gold/10 text-ma-gold",
    shipped: "bg-ma-text text-white",
    delivered: "bg-ma-gold text-white",
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shipFor, setShipFor] = useState(null); // order
    const [tracking, setTracking] = useState("");
    const [carrier, setCarrier] = useState("Royal Mail Tracked 24");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/admin/orders");
            setOrders(data.items);
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const openShip = (o) => {
        setShipFor(o);
        setTracking(o.tracking_number || "");
        setCarrier(o.carrier || "Royal Mail Tracked 24");
        setError("");
    };

    const confirmShip = async (e) => {
        e.preventDefault();
        if (!shipFor) return;
        setBusy(true);
        setError("");
        try {
            await api.post(`/admin/orders/${shipFor.id}/ship`, { tracking_number: tracking, carrier });
            setShipFor(null);
            await load();
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to mark shipped.");
        } finally {
            setBusy(false);
        }
    };

    const filtered = orders.filter((o) => {
        if (filter === "all") return true;
        return o.status === filter;
    });

    return (
        <div data-testid="admin-orders-page">
            <h2 className="font-serif text-[32px] mb-2">All Orders</h2>
            <p className="text-ma-muted text-[13px] mb-6">Admin fulfilment dashboard — mark orders shipped and email the customer.</p>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
                {[
                    { id: "all", label: "All" },
                    { id: "confirmed", label: "Awaiting fulfilment" },
                    { id: "shipped", label: "Shipped" },
                    { id: "pending_payment", label: "Unpaid" },
                ].map((t) => (
                    <button
                        key={t.id}
                        data-testid={`admin-filter-${t.id}`}
                        onClick={() => setFilter(t.id)}
                        className={`text-[11px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${filter === t.id ? "border-ma-gold text-ma-gold" : "border-ma-border text-ma-muted hover:text-ma-text"}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {error && <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-4" data-testid="admin-error">{error}</p>}

            {loading ? (
                <p className="text-ma-muted">Loading…</p>
            ) : filtered.length === 0 ? (
                <div className="border border-ma-border p-12 text-center">
                    <p className="font-serif text-[22px]">No orders match that filter.</p>
                </div>
            ) : (
                <div className="border border-ma-border overflow-x-auto">
                    <table className="w-full text-sm min-w-[760px]">
                        <thead className="bg-ma-warm/40">
                            <tr className="ma-eyebrow !text-ma-text">
                                <th className="text-left p-4">Order</th>
                                <th className="text-left p-4">Customer</th>
                                <th className="text-left p-4">Date</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-right p-4">Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o) => (
                                <tr key={o.id} className="border-t border-ma-border" data-testid={`admin-row-${o.id}`}>
                                    <td className="p-4 font-mono text-[12px]">#{o.id.slice(0, 8).toUpperCase()}</td>
                                    <td className="p-4 text-ma-muted">{o.user_email || "—"}</td>
                                    <td className="p-4 text-ma-muted">{new Date(o.created_at).toLocaleDateString("en-GB")}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 ${STATUS_STYLES[o.status] || "bg-ma-warm text-ma-muted"}`}>
                                            {(o.status || "—").replace(/_/g, " ")}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">{formatPrice(o.total)}</td>
                                    <td className="p-4 text-right">
                                        {o.status === "confirmed" ? (
                                            <button
                                                data-testid={`admin-ship-${o.id}`}
                                                onClick={() => openShip(o)}
                                                className="btn-outline-gold !py-1.5 !px-3 text-[10px]"
                                            >
                                                <Truck size={12} /> Mark Shipped
                                            </button>
                                        ) : o.status === "shipped" ? (
                                            <span className="text-[11px] text-ma-muted" data-testid={`admin-tracking-${o.id}`}>{o.tracking_number || "—"}</span>
                                        ) : (
                                            <span className="text-[11px] text-ma-muted">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {shipFor && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" onClick={() => setShipFor(null)} data-testid="ship-modal">
                    <form onSubmit={confirmShip} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md p-7 border border-ma-border">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-serif text-[24px]">Mark order #{shipFor.id.slice(0,8).toUpperCase()} shipped</h3>
                            <button type="button" onClick={() => setShipFor(null)} aria-label="Close" data-testid="ship-close"><X size={18} /></button>
                        </div>
                        <p className="text-[13px] text-ma-muted mb-6">A branded shipping email will be sent to <strong>{shipFor.user_email}</strong>.</p>
                        <label className="block mb-4">
                            <span className="ma-eyebrow !text-ma-muted block mb-1">Tracking number</span>
                            <input
                                value={tracking}
                                onChange={(e) => setTracking(e.target.value)}
                                className="ma-input"
                                placeholder="e.g. RM12345678GB"
                                data-testid="ship-tracking"
                            />
                        </label>
                        <label className="block mb-6">
                            <span className="ma-eyebrow !text-ma-muted block mb-1">Carrier</span>
                            <input
                                value={carrier}
                                onChange={(e) => setCarrier(e.target.value)}
                                className="ma-input"
                                placeholder="e.g. Royal Mail Tracked 24"
                                data-testid="ship-carrier"
                            />
                        </label>
                        {error && <p className="text-[12.5px] text-red-700 mb-4">{error}</p>}
                        <div className="flex items-center gap-3 justify-end">
                            <button type="button" onClick={() => setShipFor(null)} className="ma-link text-[10px]" data-testid="ship-cancel">Cancel</button>
                            <button type="submit" disabled={busy} className="btn-gold" data-testid="ship-submit">
                                {busy ? "Sending…" : "Mark Shipped & Email →"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
