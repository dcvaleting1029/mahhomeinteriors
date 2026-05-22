import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, Clock, Truck, Package } from "lucide-react";
import api, { formatPrice } from "../../lib/api";

const TIMELINE = [
    { key: "confirmed", label: "Confirmed", Icon: Check },
    { key: "processing", label: "Processing", Icon: Clock },
    { key: "shipped", label: "Shipped", Icon: Truck },
    { key: "delivered", label: "Delivered", Icon: Package },
];

export default function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (e) { setError("Order not found."); }
        })();
    }, [id]);

    if (error) return <div className="text-ma-muted">{error}</div>;
    if (!order) return <p className="text-ma-muted">Loading…</p>;

    const statusIdx = order.payment_status === "paid" ? 1 : 0;

    return (
        <div data-testid="order-detail">
            <Link to="/account/orders" className="ma-link text-[10px]">← Back to Orders</Link>
            <h2 className="font-serif text-[32px] mt-3 mb-2">Order #{order.id.slice(0,8).toUpperCase()}</h2>
            <p className="text-ma-muted text-[13px] mb-8">Placed {new Date(order.created_at).toLocaleString("en-GB")}</p>

            <div className="border border-ma-border p-6 mb-8">
                <p className="ma-eyebrow !text-ma-text mb-5">Timeline</p>
                <div className="flex items-center justify-between gap-3">
                    {TIMELINE.map(({ key, label, Icon }, i) => (
                        <div key={key} className="flex-1 flex flex-col items-center text-center">
                            <span className={`w-9 h-9 rounded-full flex items-center justify-center border ${i <= statusIdx ? "bg-ma-gold border-ma-gold text-white" : "border-ma-border text-ma-muted"}`}>
                                <Icon size={15} strokeWidth={1.5} />
                            </span>
                            <span className="ma-eyebrow !text-ma-muted mt-2">{label}</span>
                        </div>
                    ))}
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
