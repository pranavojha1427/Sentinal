"use client";

import { FormEvent, useState } from "react";

const roles = ["user", "ministry", "engineer", "agency"];

export function AdminAccountManager() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "agency", ministry: "", agency: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create account.");
      setMessage(`Account created for ${form.email}.`);
      setForm({ name: "", email: "", password: "", role: "agency", ministry: "", agency: "" });
    } catch (e: any) { setMessage(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-white border-2 border-slate-200 p-6 max-w-4xl">
      <h2 className="font-black text-xl uppercase">Create platform account</h2>
      <p className="text-xs font-mono text-slate-500 mt-1 mb-6">ADMIN ONLY · PRIVILEGED ROLES ARE PROVISIONED HERE</p>
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[["name","Full name","text"],["email","Email","email"],["password","Temporary password","password"]].map(([key,label,type]) => (
          <label key={key} className="text-xs font-mono uppercase text-slate-600">{label}<input required type={type} minLength={key === "password" ? 8 : undefined} className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.value})}/></label>
        ))}
        <label className="text-xs font-mono uppercase text-slate-600">Role<select className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>{roles.map(r => <option key={r}>{r}</option>)}</select></label>
        {(form.role === "agency" || form.role === "engineer") && <label className="text-xs font-mono uppercase text-slate-600">Agency / Company<input required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form.agency} onChange={e => setForm({...form, agency:e.target.value})}/></label>}
        {form.role === "ministry" && <label className="text-xs font-mono uppercase text-slate-600">Ministry / Department<input required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form.ministry} onChange={e => setForm({...form, ministry:e.target.value})}/></label>}
        <div className="md:col-span-2 flex items-center gap-3"><button disabled={loading} className="bg-slate-900 text-white px-5 py-3 text-xs font-mono uppercase disabled:opacity-50">{loading ? "Creating..." : "Create account"}</button>{message && <span className="text-xs font-mono text-slate-600">{message}</span>}</div>
      </form>
    </div>
  );
}
