import React, { useState } from "react";
import api, { formatApiErrorDetail } from "../../lib/api";
import { useAuth } from "../../contexts/AuthContext";

export default function AccountDetails() {
    const { user, refresh } = useAuth();
    const [pf, setPf] = useState({ first_name: user.first_name, last_name: user.last_name, email: user.email });
    const [pw, setPw] = useState({ current: "", next: "" });
    const [pfMsg, setPfMsg] = useState("");
    const [pwMsg, setPwMsg] = useState("");

    const savePf = async (e) => {
        e.preventDefault();
        setPfMsg("");
        try {
            await api.patch("/auth/profile", pf);
            await refresh();
            setPfMsg("Saved.");
        } catch (ex) { setPfMsg(formatApiErrorDetail(ex.response?.data?.detail) || ex.message); }
    };
    const savePw = async (e) => {
        e.preventDefault();
        setPwMsg("");
        try {
            await api.post("/auth/change-password", { current_password: pw.current, new_password: pw.next });
            setPw({ current: "", next: "" });
            setPwMsg("Password updated.");
        } catch (ex) { setPwMsg(formatApiErrorDetail(ex.response?.data?.detail) || ex.message); }
    };

    return (
        <div data-testid="details-page" className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-3xl">
            <form onSubmit={savePf} className="border border-ma-border p-6">
                <h3 className="font-serif text-[24px] mb-5">Profile</h3>
                <Field label="First name" value={pf.first_name} onChange={(v) => setPf({ ...pf, first_name: v })} testId="profile-first" />
                <Field label="Last name" value={pf.last_name} onChange={(v) => setPf({ ...pf, last_name: v })} testId="profile-last" />
                <Field label="Email" type="email" value={pf.email} onChange={(v) => setPf({ ...pf, email: v })} testId="profile-email" />
                {pfMsg && <p className="text-[12.5px] text-ma-muted mt-2" data-testid="profile-msg">{pfMsg}</p>}
                <button className="btn-gold mt-5" data-testid="profile-save">Save Changes →</button>
            </form>

            <form onSubmit={savePw} className="border border-ma-border p-6">
                <h3 className="font-serif text-[24px] mb-5">Password</h3>
                <Field label="Current password" type="password" value={pw.current} onChange={(v) => setPw({ ...pw, current: v })} testId="pw-current" />
                <Field label="New password" type="password" value={pw.next} onChange={(v) => setPw({ ...pw, next: v })} testId="pw-new" />
                {pwMsg && <p className="text-[12.5px] text-ma-muted mt-2" data-testid="pw-msg">{pwMsg}</p>}
                <button className="btn-gold mt-5" data-testid="pw-save">Update Password →</button>
            </form>
        </div>
    );
}

function Field({ label, value, onChange, type = "text", testId }) {
    return (
        <label className="block mb-5">
            <span className="ma-eyebrow !text-ma-muted block mb-1">{label}</span>
            <input data-testid={testId} type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="ma-input" />
        </label>
    );
}
