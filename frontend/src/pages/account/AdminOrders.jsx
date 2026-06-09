import React, { useEffect, useState } from "react";
import { Truck, X, FileText, ChevronRight, ExternalLink } from "lucide-react";
import api, { formatPrice, formatApiErrorDetail } from "../../lib/api";

const STATUS_FLOW = ["confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered"];

const STATUS_LABEL = {
    pending_payment: "Unpaid",
    confirmed: "Confirmed",
    processing: "Processing",
    packed: "Packed",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const STATUS_STYLES = {
    pending_payment: "bg-ma-warm text-ma-muted",
    confirmed: "bg-ma-gold/10 text-ma-gold",
    processing: "bg-amber-50 text-amber-700",
    packed: "bg-blue-50 text-blue-700",
    shipped: "bg-ma-text text-white",
    out_for_delivery: "bg-purple-50 text-purple-700",
    delivered: "bg-emerald-600 text-white",
    cancelled: "bg-red-50 text-red-700",
};

const CARRIERS = [
    "Royal Mail Tracked 24",
    "Royal Mail Tracked 48",
    "Royal Mail",
    "DPD",
    "Evri",
    "Parcelforce",
    "Yodel",
    "DHL",
    "UPS",
    "FedEx",
];

function nextStatus(s) {
    const i = STATUS_FLOW.indexOf(s);
    if (i < 0 || i === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[i + 1];
}

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [queue, setQueue] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("confirmed");
    const [error, setError] = useState("");
    const [editFor, setEditFor] = useState(null);
    const [form, setForm] = useState({ status: "", carrier: "Royal Mail Tracked 24", tracking_number: "", estimated_delivery: "", note: "" });
    const [busy, setBusy] = useState(false);

    const load = async () => {
        try {
            const [oRes, qRes] = await Promise.all([
                api.get("/admin/orders"),
                api.get("/admin/orders/queue"),
            ]);
            setOrders(oRes.data.items);
            setQueue(qRes.data);
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openEdit = (o, presetStatus) => {
        setEditFor(o);
        setForm({
            status: presetStatus || nextStatus(o.status) || o.status,
            carrier: o.carrier || "Royal Mail Tracked 24",
            tracking_number: o.tracking_number || "",
            estimated_delivery: o.estimated_delivery || "",
            note: "",
        });
        setError("");
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!editFor) return;
        setBusy(true);
        setError("");
        try {
            await api.post(`/admin/orders/${editFor.id}/status`, form);
            setEditFor(null);
            await load();
        } catch (err) {
            setError(formatApiErrorDetail(err.response?.data?.detail) || "Failed to update order.");
        } finally {
            setBusy(false);
        }
    };

    const openPackingSlip = (orderId) => {
        const backend = process.env.REACT_APP_BACKEND_URL;
        window.open(`${backend}/api/admin/orders/${orderId}/packing-slip`, "_blank", "noopener,noreferrer");
    };

    const filtered = orders.filter((o) => filter === "all" ? true : o.status === filter);

    const TABS = [
        { id: "confirmed", label: "Awaiting" },
        { id: "processing", label: "Processing" },
        { id: "packed", label: "Packed" },
        { id: "shipped", label: "Shipped" },
        { id: "out_for_delivery", label: "Out for delivery" },
        { id: "delivered", label: "Delivered" },
        { id: "all", label: "All" },
    ];

    return (
        <div data-testid="admin-orders-page">
            <h2 className="font-serif text-[28px] sm:text-[32px] mb-2">Fulfilment</h2>
            <p className="text-ma-muted text-[13px] mb-6">Move orders through the pipeline. Customers receive email updates when an order ships and when it&apos;s delivered.</p>

            {/* Queue counts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {STATUS_FLOW.map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        data-testid={`queue-${s}`}
                        className={`text-left border p-3 transition-colors ${filter === s ? "border-ma-gold bg-ma-gold/[0.04]" : "border-ma-border hover:border-ma-text"}`}
                    >
                        <p className="ma-eyebrow !text-ma-muted text-[9px]">{STATUS_LABEL[s]}</p>
                        <p className="font-serif text-[22px] mt-1">{queue[s] ?? 0}</p>
                    </button>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        data-testid={`admin-filter-${t.id}`}
                        onClick={() => setFilter(t.id)}
                        className={`text-[10px] tracking-widest uppercase px-3 py-1.5 border transition-colors ${filter === t.id ? "border-ma-gold text-ma-gold" : "border-ma-border text-ma-muted hover:text-ma-text"}`}
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
                    <p className="font-serif text-[22px]">Nothing in this queue.</p>
                    <p className="text-[12px] text-ma-muted mt-1">A breather, well-earned.</p>
                </div>
            ) : (
                <div className="border border-ma-border overflow-x-auto">
                    <table className="w-full text-sm min-w-[820px]">
                        <thead className="bg-ma-warm/40">
                            <tr className="ma-eyebrow !text-ma-text">
                                <th className="text-left p-4">Order</th>
                                <th className="text-left p-4">Customer</th>
                                <th className="text-left p-4">Date</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Tracking</th>
                                <th className="text-right p-4">Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((o) => {
                                const next = nextStatus(o.status);
                                return (
                                    <tr key={o.id} className="border-t border-ma-border" data-testid={`admin-row-${o.id}`}>
                                        <td className="p-4 font-mono text-[12px]">#{o.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="p-4 text-ma-muted">{o.user_email || "—"}</td>
                                        <td className="p-4 text-ma-muted">{new Date(o.created_at).toLocaleDateString("en-GB")}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] uppercase tracking-widest px-2.5 py-1 ${STATUS_STYLES[o.status] || "bg-ma-warm text-ma-muted"}`}>
                                                {STATUS_LABEL[o.status] || o.status || "—"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[11px] text-ma-muted">
                                            {o.tracking_number ? (
                                                o.tracking_url ? (
                                                    <a href={o.tracking_url} target="_blank" rel="noreferrer" className="text-ma-gold inline-flex items-center gap-1 hover:underline">
                                                        {o.tracking_number} <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    o.tracking_number
                                                )
                                            ) : "—"}
                                        </td>
                                        <td className="p-4 text-right">{formatPrice(o.total)}</td>
                                        <td className="p-4 text-right whitespace-nowrap">
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    onClick={() => openPackingSlip(o.id)}
                                                    data-testid={`pack-slip-${o.id}`}
                                                    title="Open packing slip"
                                                    className="text-ma-muted hover:text-ma-text"
                                                >
                                                    <FileText size={14} />
                                                </button>
                                                {next && (
                                                    <button
                                                        data-testid={`advance-${o.id}`}
                                                        onClick={() => openEdit(o, next)}
                                                        className="btn-outline-gold !py-1.5 !px-3 text-[10px] inline-flex items-center gap-1"
                                                    >
                                                        {next === "shipped" ? <Truck size={11} /> : <ChevronRight size={11} />}
                                                        {STATUS_LABEL[next]}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {editFor && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-8 overflow-y-auto" onClick={() => setEditFor(null)} data-testid="status-modal">
                    <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-md p-7 border border-ma-border">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-serif text-[22px]">Order #{editFor.id.slice(0, 8).toUpperCase()}</h3>
                            <button type="button" onClick={() => setEditFor(null)} aria-label="Close" data-testid="status-close"><X size={18} /></button>
                        </div>
                        <p className="text-[13px] text-ma-muted mb-6">
                            Update fulfilment status for <strong>{editFor.user_email}</strong>.
                            {(form.status === "shipped" || form.status === "delivered") && " A branded email will be sent."}
                        </p>

                        <label className="block mb-4">
                            <span className="ma-eyebrow !text-ma-muted block mb-1">Move to status</span>
                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="ma-input" data-testid="status-select">
                                {STATUS_FLOW.map((s) => (
                                    <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                                ))}
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </label>

                        <label className="block mb-4">
                            <span className="ma-eyebrow !text-ma-muted block mb-1">Carrier</span>
                            <select value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })} className="ma-input" data-testid="status-carrier">
                                {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </label>

                        <label className="block mb-4">
                            <span className="ma-eyebrow !text-ma-muted block mb-1">Tracking number</span>
                            <input
                                value={form.tracking_number}
                                onChange={(e) => setForm({ ...form, tracking_number: e.target.value })}
                                className="ma-input"
                                placeholder="e.g. RM12345678GB"
                                data-testid="status-tracking"
                            />
                        </label>

                        <label className="block mb-4">
                            <span className="ma-eyebrow !text-ma-muted block mb-1">Estimated delivery (optional)</span>
                            <input
                                type="date"
                                value={form.estimated_delivery ? form.estimated_delivery.slice(0, 10) : ""}
                                onChange={(e) => setForm({ ...form, estimated_delivery: e.target.value })}
                                className="ma-input"
                                data-testid="status-eta"
                            />
                        </label>

                        <label className="block mb-6">
                            <span className="ma-eyebrow !text-ma-muted block mb-1">Internal note (optional)</span>
                            <input
                                value={form.note}
                                onChange={(e) => setForm({ ...form, note: e.target.value })}
                                className="ma-input"
                                placeholder="Quick note for your records"
                                data-testid="status-note"
                            />
                        </label>

                        {error && <p className="text-[12.5px] text-red-700 mb-4">{error}</p>}

                        <div className="flex items-center gap-3 justify-end">
                            <button type="button" onClick={() => setEditFor(null)} className="ma-link text-[10px]" data-testid="status-cancel">Cancel</button>
                            <button type="submit" disabled={busy} className="btn-gold" data-testid="status-submit">
                                {busy ? "Saving…" : `Update → ${STATUS_LABEL[form.status]}`}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
