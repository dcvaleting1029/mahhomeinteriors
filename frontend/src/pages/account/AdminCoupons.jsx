import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import api, { formatApiErrorDetail } from "../../lib/api";

const EMPTY = {
    code: "",
    description: "",
    discount_type: "percent",
    discount_value: 10,
    min_subtotal: 0,
    active: true,
    expires_at: "",
    usage_limit: "",
    first_order_only: false,
};

export default function AdminCoupons() {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/coupons/admin/all");
            setList(data.items);
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
    const openEdit = (c) => {
        setForm({
            code: c.code || "",
            description: c.description || "",
            discount_type: c.discount_type || "percent",
            discount_value: c.discount_value ?? 0,
            min_subtotal: c.min_subtotal ?? 0,
            active: c.active !== false,
            expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
            usage_limit: c.usage_limit ?? "",
            first_order_only: !!c.first_order_only,
        });
        setEditing(c.code);
        setError("");
    };
    const close = () => { setEditing(null); setError(""); };
    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const payload = {
            code: form.code,
            description: form.description,
            discount_type: form.discount_type,
            discount_value: Number(form.discount_value) || 0,
            min_subtotal: Number(form.min_subtotal) || 0,
            active: !!form.active,
            expires_at: form.expires_at ? new Date(form.expires_at + "T23:59:59Z").toISOString() : null,
            usage_limit: form.usage_limit === "" || form.usage_limit === null ? null : Number(form.usage_limit),
            first_order_only: !!form.first_order_only,
        };
        try {
            if (editing === "new") await api.post("/coupons/admin", payload);
            else await api.patch(`/coupons/admin/${editing}`, payload);
            close();
            await load();
        } catch (ex) {
            setError(formatApiErrorDetail(ex.response?.data?.detail) || "Failed to save.");
        } finally {
            setBusy(false);
        }
    };

    const remove = async (code) => {
        if (!window.confirm(`Delete code ${code}?`)) return;
        try {
            await api.delete(`/coupons/admin/${code}`);
            await load();
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete.");
        }
    };

    const formatRule = (c) => {
        if (c.discount_type === "percent") return `${c.discount_value}% off`;
        if (c.discount_type === "fixed") return `£${c.discount_value} off`;
        return "Free shipping";
    };

    return (
        <div data-testid="admin-coupons-page">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h2 className="font-serif text-[32px]">Discount Codes</h2>
                    <p className="text-ma-muted text-[13px] mt-1">Create campaign codes with expiry dates and usage limits.</p>
                </div>
                <button onClick={openNew} className="btn-gold" data-testid="admin-coupon-new"><Plus size={14} /> Add Code</button>
            </div>

            {error && <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-4">{error}</p>}

            {loading ? (
                <p className="text-ma-muted">Loading…</p>
            ) : (
                <div className="border border-ma-border overflow-x-auto">
                    <table className="w-full text-sm min-w-[820px]">
                        <thead className="bg-ma-warm/40">
                            <tr className="ma-eyebrow !text-ma-text">
                                <th className="text-left p-3">Code</th>
                                <th className="text-left p-3">Rule</th>
                                <th className="text-left p-3">Min spend</th>
                                <th className="text-left p-3">Usage</th>
                                <th className="text-left p-3">Expires</th>
                                <th className="text-left p-3">First-order</th>
                                <th className="text-left p-3">Active</th>
                                <th className="text-right p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((c) => (
                                <tr key={c.code} className="border-t border-ma-border" data-testid={`coupon-${c.code}`}>
                                    <td className="p-3 font-mono text-[12.5px] tracking-widest">{c.code}</td>
                                    <td className="p-3">{formatRule(c)}</td>
                                    <td className="p-3 text-ma-muted">£{(c.min_subtotal || 0).toFixed(0)}</td>
                                    <td className="p-3 text-ma-muted">{c.times_used || 0}{c.usage_limit ? ` / ${c.usage_limit}` : ""}</td>
                                    <td className="p-3 text-ma-muted">{c.expires_at ? new Date(c.expires_at).toLocaleDateString("en-GB") : "—"}</td>
                                    <td className="p-3">{c.first_order_only ? <span className="text-ma-gold">Yes</span> : <span className="text-ma-muted">—</span>}</td>
                                    <td className="p-3">
                                        <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 ${c.active ? "bg-ma-gold/10 text-ma-gold" : "bg-ma-warm text-ma-muted"}`}>
                                            {c.active ? "Active" : "Off"}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <button onClick={() => openEdit(c)} className="ma-link text-[10px] mr-3" data-testid={`coupon-edit-${c.code}`}><Pencil size={11} className="inline mr-1" />Edit</button>
                                        <button onClick={() => remove(c.code)} className="ma-link text-[10px] !text-red-700" data-testid={`coupon-del-${c.code}`}><Trash2 size={11} className="inline mr-1" />Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4" onClick={close} data-testid="coupon-modal">
                    <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-xl my-8 p-7 border border-ma-border">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-serif text-[26px]">{editing === "new" ? "New code" : `Edit ${editing}`}</h3>
                            <button type="button" onClick={close} aria-label="Close"><X size={18} /></button>
                        </div>
                        <Field label="Code" value={form.code} onChange={(v) => update("code", v.toUpperCase())} required disabled={editing !== "new"} testId="cf-code" />
                        <Field label="Description" value={form.description} onChange={(v) => update("description", v)} testId="cf-desc" />
                        <div className="grid grid-cols-2 gap-x-5">
                            <SelectField label="Discount type" value={form.discount_type} onChange={(v) => update("discount_type", v)} options={[
                                { value: "percent", label: "Percent off" },
                                { value: "fixed", label: "Fixed amount off (£)" },
                                { value: "free_shipping", label: "Free shipping" },
                            ]} testId="cf-type" />
                            <Field label="Discount value" type="number" step="0.01" value={form.discount_value} onChange={(v) => update("discount_value", v)} testId="cf-val" />
                            <Field label="Min subtotal (£)" type="number" step="0.01" value={form.min_subtotal} onChange={(v) => update("min_subtotal", v)} testId="cf-min" />
                            <Field label="Usage limit (blank = unlimited)" type="number" value={form.usage_limit ?? ""} onChange={(v) => update("usage_limit", v)} testId="cf-limit" />
                            <Field label="Expires (date)" type="date" value={form.expires_at} onChange={(v) => update("expires_at", v)} testId="cf-expires" />
                        </div>
                        <div className="flex items-center gap-5 mt-4 flex-wrap text-[13px] text-ma-muted">
                            <Toggle label="Active" checked={form.active} onChange={(v) => update("active", v)} testId="cf-active" />
                            <Toggle label="First order only" checked={form.first_order_only} onChange={(v) => update("first_order_only", v)} testId="cf-first" />
                        </div>
                        {error && <p className="text-[12.5px] text-red-700 mt-4">{error}</p>}
                        <div className="flex items-center gap-3 justify-end mt-6">
                            <button type="button" onClick={close} className="ma-link text-[10px]">Cancel</button>
                            <button type="submit" disabled={busy} className="btn-gold" data-testid="cf-submit">
                                {busy ? "Saving…" : "Save Code →"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

function Field({ label, value, onChange, required, disabled, testId, type = "text", step }) {
    return (
        <label className="block mb-4">
            <span className="ma-eyebrow !text-ma-muted block mb-1">{label}</span>
            <input
                data-testid={testId}
                type={type}
                step={step}
                required={required}
                disabled={disabled}
                value={value === null || value === undefined ? "" : value}
                onChange={(e) => onChange(e.target.value)}
                className="ma-input disabled:opacity-60"
            />
        </label>
    );
}
function SelectField({ label, value, onChange, options, testId }) {
    return (
        <label className="block mb-4">
            <span className="ma-eyebrow !text-ma-muted block mb-1">{label}</span>
            <select data-testid={testId} value={value} onChange={(e) => onChange(e.target.value)} className="ma-input bg-transparent">
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </label>
    );
}
function Toggle({ label, checked, onChange, testId }) {
    return (
        <label className="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox" data-testid={testId} checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-ma-gold" />
            <span>{label}</span>
        </label>
    );
}
