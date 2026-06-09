import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Clock, Package, Truck, Box, Home, ExternalLink } from "lucide-react";
import api, { formatPrice } from "../../lib/api";

// 6-stage customer-facing pipeline (cancelled handled separately)
const TIMELINE = [
    { key: "confirmed", label: "Confirmed", desc: "We've received your order", Icon: Check },
    { key: "processing", label: "Processing", desc: "Being prepared in Glasgow", Icon: Clock },
    { key: "packed", label: "Packed", desc: "Boxed & ready to ship", Icon: Box },
    { key: "shipped", label: "Shipped", desc: "Handed to the carrier", Icon: Truck },
    { key: "out_for_delivery", label: "Out for Delivery", desc: "With your driver", Icon: Package },
    { key: "delivered", label: "Delivered", desc: "At your door", Icon: Home },
];

function timelineIdx(order) {
    const s = order?.status;
    if (!s) return order?.payment_status === "paid" ? 0 : -1;
    if (s === "pending_payment") return -1;
    if (s === "cancelled") return -2;
    const i = TIMELINE.findIndex((t) => t.key === s);
    return i >= 0 ? i : 0;
}

function stampFor(order, key) {
    const map = {
        confirmed: order?.created_at,
        processing: order?.processing_at,
        packed: order?.packed_at,
        shipped: order?.shipped_at,
        out_for_delivery: order?.out_for_delivery_at,
        delivered: order?.delivered_at,
    };
    return map[key];
}

export default function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (e) {
                setError("Order not found.");
            }
        })();
    }, [id]);

    if (error) return <div className="text-ma-muted">{error}</div>;
    if (!order) return <p className="text-ma-muted">Loading…</p>;

    const idx = timelineIdx(order);
    const cancelled = order.status === "cancelled";

    return (
        <div data-testid="order-detail">
            <Link to="/account/orders" className="ma-link text-[10px]">← Back to Orders</Link>
            <h2 className="font-serif text-[28px] sm:text-[32px] mt-3 mb-2">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
            <p className="text-ma-muted text-[13px] mb-8">Placed {new Date(order.created_at).toLocaleString("en-GB")}</p>

            {/* Tracking banner */}
            {order.tracking_number && (
                <div className="border border-ma-gold/40 bg-ma-gold/[0.06] p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3" data-testid="tracking-banner">
                    <div>
                        <p className="ma-eyebrow !text-ma-gold mb-1">Tracking</p>
                        <p className="font-serif text-[18px]">{order.carrier || "Carrier"} · <span className="font-mono text-[14px]">{order.tracking_number}</span></p>
                        {order.estimated_delivery && (
                            <p className="text-[12px] text-ma-muted mt-1">Estimated delivery: {new Date(order.estimated_delivery).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
                        )}
                    </div>
                    {order.tracking_url && (
                        <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            data-testid="track-package-btn"
                            className="btn-gold !py-2 !px-5 text-[10px] inline-flex items-center gap-2 whitespace-nowrap"
                        >
                            Track Package <ExternalLink size={11} />
                        </a>
                    )}
                </div>
            )}

            {/* Timeline */}
            <div className="border border-ma-border p-5 sm:p-7 mb-8" data-testid="order-timeline">
                <div className="flex items-center justify-between mb-5">
                    <p className="ma-eyebrow !text-ma-text">Fulfilment timeline</p>
                    {cancelled && <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-red-50 text-red-700 border border-red-200">Cancelled</span>}
                </div>

                {/* Desktop / horizontal */}
                <div className="hidden md:flex items-start justify-between gap-1">
                    {TIMELINE.map(({ key, label, Icon }, i) => {
                        const done = !cancelled && i <= idx;
                        const current = !cancelled && i === idx;
                        const at = stampFor(order, key);
                        return (
                            <React.Fragment key={key}>
                                <div className="flex flex-col items-center text-center flex-1" data-testid={`tl-step-${key}`}>
                                    <span className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${done ? "bg-ma-gold border-ma-gold text-white" : "border-ma-border text-ma-muted bg-white"} ${current ? "ring-2 ring-ma-gold/30 ring-offset-2" : ""}`}>
                                        <Icon size={16} strokeWidth={1.5} />
                                    </span>
                                    <span className={`ma-eyebrow mt-2 ${done ? "!text-ma-text" : "!text-ma-muted"}`}>{label}</span>
                                    {at && done && (
                                        <span className="text-[10px] text-ma-muted mt-1">{new Date(at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                                    )}
                                </div>
                                {i < TIMELINE.length - 1 && (
                                    <span className={`flex-1 h-px mt-5 ${i < idx ? "bg-ma-gold" : "bg-ma-border"}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Mobile / vertical */}
                <div className="md:hidden">
                    {TIMELINE.map(({ key, label, desc, Icon }, i) => {
                        const done = !cancelled && i <= idx;
                        const current = !cancelled && i === idx;
                        const at = stampFor(order, key);
                        return (
                            <div key={key} className="flex gap-4 relative" data-testid={`tl-m-${key}`}>
                                <div className="flex flex-col items-center">
                                    <span className={`w-9 h-9 rounded-full flex items-center justify-center border ${done ? "bg-ma-gold border-ma-gold text-white" : "border-ma-border text-ma-muted bg-white"} ${current ? "ring-2 ring-ma-gold/30 ring-offset-2" : ""}`}>
                                        <Icon size={14} strokeWidth={1.5} />
                                    </span>
                                    {i < TIMELINE.length - 1 && <span className={`flex-1 w-px my-1 ${i < idx ? "bg-ma-gold" : "bg-ma-border"}`} />}
                                </div>
                                <div className="pb-5 flex-1">
                                    <p className={`text-[14px] ${done ? "text-ma-text" : "text-ma-muted"} font-medium`}>{label}</p>
                                    <p className="text-[11.5px] text-ma-muted leading-relaxed">{desc}</p>
                                    {at && done && <p className="text-[10px] text-ma-muted mt-0.5">{new Date(at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <h3 className="ma-eyebrow !text-ma-text mb-4">Items</h3>
            <div className="border border-ma-border divide-y divide-ma-border mb-8">
                {(order.items || []).map((it) => (
                    <div key={it.product_id} className="flex gap-4 p-5">
                        <div className="w-16 h-20 bg-ma-warm overflow-hidden flex-shrink-0">
                            <img src={it.image} alt={it.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <p className="font-serif text-[18px]">{it.name}</p>
                            <p className="text-[12px] text-ma-muted">Qty {it.quantity} · {formatPrice(it.price)}</p>
                        </div>
                        <p className="text-sm">{formatPrice(it.line_total)}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {order.address && (
                    <div className="border border-ma-border p-5">
                        <p className="ma-eyebrow !text-ma-text mb-3">Delivery Address</p>
                        <p className="text-[13.5px] text-ma-muted leading-relaxed">
                            {order.address.first_name} {order.address.last_name}<br />
                            {order.address.address_line1} {order.address.address_line2}<br />
                            {order.address.city}, {order.address.postcode}<br />
                            {order.address.country}
                        </p>
                    </div>
                )}
                <div className="border border-ma-border p-5">
                    <p className="ma-eyebrow !text-ma-text mb-3">Order Summary</p>
                    <Row label="Subtotal" value={formatPrice(order.subtotal)} />
                    <Row label="Shipping" value={order.shipping_cost ? formatPrice(order.shipping_cost) : "Free"} />
                    <div className="ma-divider my-3" />
                    <Row label="Total" value={formatPrice(order.total)} large />
                </div>
            </div>
        </div>
    );
}

function Row({ label, value, large }) {
    return (
        <div className="flex items-center justify-between py-1">
            <span className={large ? "font-serif text-[18px]" : "text-[13px] text-ma-muted"}>{label}</span>
            <span className={large ? "font-serif text-[18px]" : "text-[13px]"}>{value}</span>
        </div>
    );
}
