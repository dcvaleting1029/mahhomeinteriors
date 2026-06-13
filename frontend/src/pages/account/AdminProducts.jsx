import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import api, { formatPrice, formatApiErrorDetail } from "../../lib/api";

const EMPTY = {
    name: "",
    category: "Home Living",
    price: 0,
    original_price: null,
    image: "",
    short_description: "",
    description: "",
    materials: "",
    dimensions: "",
    care: "",
    colours_str: "",
    tags_str: "",
    is_new: false,
    on_sale: false,
    in_stock: true,
};

const CATEGORY_OPTIONS = ["Kitchen & Dining", "Home Living"];

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // null | "new" | productId
    const [form, setForm] = useState(EMPTY);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/products/admin/all");
            setProducts(data.items);
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to load.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);

    const openNew = () => { setForm(EMPTY); setEditing("new"); setError(""); };
    const openEdit = (p) => {
        setForm({
            name: p.name || "",
            category: p.category || "Home Living",
            price: p.price || 0,
            original_price: p.original_price ?? null,
            image: p.image || "",
            short_description: p.short_description || "",
            description: p.description || "",
            materials: p.materials || "",
            dimensions: p.dimensions || "",
            care: p.care || "",
            colours_str: (p.colours || []).join(", "),
            tags_str: (p.tags || []).join(", "),
            is_new: !!p.is_new,
            on_sale: !!p.on_sale,
            in_stock: p.in_stock !== false,
        });
        setEditing(p.id);
        setError("");
    };
    const close = () => { setEditing(null); setError(""); };

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const save = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const payload = {
            ...form,
            price: Number(form.price),
            original_price: form.original_price ? Number(form.original_price) : null,
            colours: form.colours_str.split(",").map((s) => s.trim()).filter(Boolean),
            tags: form.tags_str.split(",").map((s) => s.trim()).filter(Boolean),
        };
        delete payload.colours_str;
        delete payload.tags_str;
        try {
            if (editing === "new") {
                await api.post("/products/admin", payload);
            } else {
                await api.patch(`/products/admin/${editing}`, payload);
            }
            close();
            await load();
        } catch (ex) {
            setError(formatApiErrorDetail(ex.response?.data?.detail) || "Failed to save.");
        } finally {
            setBusy(false);
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this product? This cannot be undone.")) return;
        try {
            await api.delete(`/products/admin/${id}`);
            await load();
        } catch (e) {
            setError(formatApiErrorDetail(e.response?.data?.detail) || "Failed to delete.");
        }
    };

    return (
        <div data-testid="admin-products-page">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h2 className="font-serif text-[32px]">Products</h2>
                    <p className="text-ma-muted text-[13px] mt-1">Add, edit and remove pieces from the catalogue.</p>
                </div>
                <button onClick={openNew} className="btn-gold" data-testid="admin-product-new"><Plus size={14} /> Add Product</button>
            </div>

            {error && <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-4 py-3 mb-4">{error}</p>}

            {loading ? (
                <p className="text-ma-muted">Loading…</p>
            ) : (
                <div className="border border-ma-border overflow-x-auto">
                    <table className="w-full text-sm min-w-[760px]">
                        <thead className="bg-ma-warm/40">
                            <tr className="ma-eyebrow !text-ma-text">
                                <th className="text-left p-3"></th>
                                <th className="text-left p-3">Name</th>
                                <th className="text-left p-3">Category</th>
                                <th className="text-right p-3">Price</th>
                                <th className="text-left p-3">Badges</th>
                                <th className="text-right p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((p) => (
                                <tr key={p.id} className="border-t border-ma-border" data-testid={`admin-prod-${p.id}`}>
                                    <td className="p-3 w-14">
                                        <div className="w-12 h-14 bg-ma-warm overflow-hidden">
                                            {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-contain bg-ma-warm p-1" />}
                                        </div>
                                    </td>
                                    <td className="p-3">
                                        <p className="font-serif text-[15px] leading-tight">{p.name}</p>
                                        <p className="text-[11px] text-ma-muted mt-0.5">{p.slug}</p>
                                    </td>
                                    <td className="p-3 text-ma-muted">{p.category}</td>
                                    <td className="p-3 text-right">
                                        {formatPrice(p.price)}
                                        {p.original_price && p.original_price > p.price && (
                                            <span className="block text-[11px] text-ma-muted line-through">{formatPrice(p.original_price)}</span>
                                        )}
                                    </td>
                                    <td className="p-3">
                                        <div className="flex gap-1.5 flex-wrap">
                                            {p.is_new && <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-ma-text text-white">New</span>}
                                            {p.on_sale && <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-ma-gold text-white">Sale</span>}
                                            {p.in_stock === false && <span className="text-[9px] tracking-widest uppercase px-2 py-0.5 bg-ma-muted text-white">Out</span>}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right whitespace-nowrap">
                                        <button onClick={() => openEdit(p)} className="ma-link text-[10px] mr-3" data-testid={`admin-edit-${p.id}`}><Pencil size={11} className="inline mr-1" />Edit</button>
                                        <button onClick={() => remove(p.id)} className="ma-link text-[10px] !text-red-700" data-testid={`admin-del-${p.id}`}><Trash2 size={11} className="inline mr-1" />Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4" onClick={close} data-testid="admin-prod-modal">
                    <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-2xl my-8 p-7 border border-ma-border">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-serif text-[26px]">{editing === "new" ? "New product" : "Edit product"}</h3>
                            <button type="button" onClick={close} aria-label="Close"><X size={18} /></button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-5">
                            <Field label="Name" value={form.name} onChange={(v) => update("name", v)} required testId="pf-name" />
                            <SelectField label="Category" value={form.category} onChange={(v) => update("category", v)} options={CATEGORY_OPTIONS} testId="pf-category" />
                            <Field label="Price (£)" type="number" step="0.01" value={form.price} onChange={(v) => update("price", v)} required testId="pf-price" />
                            <Field label="Original price (optional)" type="number" step="0.01" value={form.original_price ?? ""} onChange={(v) => update("original_price", v || null)} testId="pf-orig" />
                        </div>
                        <Field label="Image URL" value={form.image} onChange={(v) => update("image", v)} testId="pf-image" />
                        <Field label="Short description" value={form.short_description} onChange={(v) => update("short_description", v)} testId="pf-short" />
                        <Field label="Description" value={form.description} onChange={(v) => update("description", v)} multiline testId="pf-desc" />
                        <div className="grid grid-cols-2 gap-x-5">
                            <Field label="Materials" value={form.materials} onChange={(v) => update("materials", v)} testId="pf-mat" />
                            <Field label="Dimensions" value={form.dimensions} onChange={(v) => update("dimensions", v)} testId="pf-dim" />
                        </div>
                        <Field label="Care" value={form.care} onChange={(v) => update("care", v)} testId="pf-care" />
                        <Field label="Colours (comma separated)" value={form.colours_str} onChange={(v) => update("colours_str", v)} testId="pf-cols" />
                        <Field label="Tags (comma separated)" value={form.tags_str} onChange={(v) => update("tags_str", v)} testId="pf-tags" />
                        <div className="flex items-center gap-5 mt-4 flex-wrap text-[13px] text-ma-muted">
                            <Toggle label="New" checked={form.is_new} onChange={(v) => update("is_new", v)} testId="pf-new" />
                            <Toggle label="On sale" checked={form.on_sale} onChange={(v) => update("on_sale", v)} testId="pf-sale" />
                            <Toggle label="In stock" checked={form.in_stock} onChange={(v) => update("in_stock", v)} testId="pf-stock" />
                        </div>
                        {error && <p className="text-[12.5px] text-red-700 mt-4">{error}</p>}
                        <div className="flex items-center gap-3 justify-end mt-6">
                            <button type="button" onClick={close} className="ma-link text-[10px]">Cancel</button>
                            <button type="submit" disabled={busy} className="btn-gold" data-testid="pf-submit">
                                {busy ? "Saving…" : "Save Product →"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

function Field({ label, value, onChange, required, multiline, testId, type = "text", step }) {
    return (
        <label className="block mb-4">
            <span className="ma-eyebrow !text-ma-muted block mb-1">{label}</span>
            {multiline ? (
                <textarea
                    data-testid={testId}
                    rows={3}
                    required={required}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className="ma-input-block resize-y"
                />
            ) : (
                <input
                    data-testid={testId}
                    type={type}
                    step={step}
                    required={required}
                    value={value === null || value === undefined ? "" : value}
                    onChange={(e) => onChange(e.target.value)}
                    className="ma-input"
                />
            )}
        </label>
    );
}
function SelectField({ label, value, onChange, options, testId }) {
    return (
        <label className="block mb-4">
            <span className="ma-eyebrow !text-ma-muted block mb-1">{label}</span>
            <select data-testid={testId} value={value} onChange={(e) => onChange(e.target.value)} className="ma-input bg-transparent">
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
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
