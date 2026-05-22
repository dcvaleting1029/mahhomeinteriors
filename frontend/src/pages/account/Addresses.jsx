import React, { useEffect, useState } from "react";
import { Plus, MapPin, X } from "lucide-react";
import api from "../../lib/api";

const EMPTY = {
    label: "Home",
    first_name: "",
    last_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postcode: "",
    country: "United Kingdom",
    phone: "",
    is_default: false,
};

export default function Addresses() {
    const [list, setList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editingId, setEditingId] = useState(null);

    const load = async () => {
        const { data } = await api.get("/addresses");
        setList(data.items);
    };
    useEffect(() => { load(); }, []);

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const save = async (e) => {
        e.preventDefault();
        if (editingId) {
            await api.patch(`/addresses/${editingId}`, form);
        } else {
            await api.post("/addresses", form);
        }
        setShowForm(false);
        setForm(EMPTY);
        setEditingId(null);
        load();
    };

    const startEdit = (a) => {
        setForm({ ...EMPTY, ...a });
        setEditingId(a.id);
        setShowForm(true);
    };
    const remove = async (id) => {
        await api.delete(`/addresses/${id}`);
        load();
    };

    return (
        <div data-testid="addresses-page">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-[32px]">Saved Addresses</h2>
                {!showForm && (
                    <button data-testid="address-add" onClick={() => { setForm(EMPTY); setEditingId(null); setShowForm(true); }} className="btn-outline-gold">
                        <Plus size={14} /> Add Address
                    </button>
                )}
            </div>

            {showForm ? (
                <form onSubmit={save} className="border border-ma-border p-6 mb-8" data-testid="address-form">
                    <div className="flex items-center justify-between mb-6">
                        <p className="ma-eyebrow !text-ma-text">{editingId ? "Edit Address" : "New Address"}</p>
                        <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}><X size={18} /></button>
                    </div>
                    <Field label="Label (e.g. Home)" value={form.label} onChange={(v) => update("label", v)} testId="addr-label" />
                    <div className="grid grid-cols-2 gap-x-6">
                        <Field label="First name" value={form.first_name} onChange={(v) => update("first_name", v)} testId="addr-first" required />
                        <Field label="Last name" value={form.last_name} onChange={(v) => update("last_name", v)} testId="addr-last" required />
                    </div>
                    <Field label="Address line 1" value={form.address_line1} onChange={(v) => update("address_line1", v)} testId="addr-line1" required />
                    <Field label="Address line 2" value={form.address_line2} onChange={(v) => update("address_line2", v)} testId="addr-line2" />
                    <div className="grid grid-cols-2 gap-x-6">
                        <Field label="City" value={form.city} onChange={(v) => update("city", v)} testId="addr-city" required />
                        <Field label="Postcode" value={form.postcode} onChange={(v) => update("postcode", v)} testId="addr-postcode" required />
                    </div>
                    <Field label="Country" value={form.country} onChange={(v) => update("country", v)} testId="addr-country" />
                    <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} testId="addr-phone" />
                    <label className="flex items-center gap-2 mt-4 text-[12.5px] text-ma-muted cursor-pointer">
                        <input type="checkbox" checked={form.is_default} onChange={(e) => update("is_default", e.target.checked)} className="accent-ma-gold" /> Set as default
                    </label>
                    <button type="submit" className="btn-gold mt-6" data-testid="addr-submit">Save Address →</button>
                </form>
            ) : null}

            {list.length === 0 && !showForm && (
                <div className="border border-ma-border p-12 text-center">
                    <MapPin size={28} className="text-ma-gold mx-auto" strokeWidth={1.2} />
                    <p className="font-serif text-[22px] mt-4">No saved addresses</p>
                    <p className="text-ma-muted text-sm mt-2">Add one to make checkout faster.</p>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {list.map((a) => (
                    <div key={a.id} className="border border-ma-border p-5" data-testid={`address-${a.id}`}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="ma-eyebrow !text-ma-text">{a.label}</p>
                            {a.is_default && <span className="text-[10px] tracking-widest text-ma-gold uppercase">Default</span>}
                        </div>
                        <p className="text-[13.5px] leading-relaxed">
                            {a.first_name} {a.last_name}<br />
                            {a.address_line1}<br />
                            {a.address_line2 ? <>{a.address_line2}<br /></> : null}
                            {a.city}, {a.postcode}<br />
                            {a.country}
                        </p>
                        <div className="flex items-center gap-4 mt-4">
                            <button onClick={() => startEdit(a)} className="ma-link text-[10px]" data-testid={`addr-edit-${a.id}`}>Edit</button>
                            <button onClick={() => remove(a.id)} className="ma-link text-[10px]" data-testid={`addr-delete-${a.id}`}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Field({ label, value, onChange, testId, required }) {
    return (
        <label className="block mb-4">
            <span className="ma-eyebrow !text-ma-muted block mb-1">{label}</span>
            <input data-testid={testId} required={required} value={value || ""} onChange={(e) => onChange(e.target.value)} className="ma-input" />
        </label>
    );
}
