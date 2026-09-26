"use client";

import { FormEvent, useState } from "react";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
  "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const MINISTRIES = [
  "Department for Promotion of Industry & Internal Trade",
  "Department of Higher Education",
  "Department of Sports",
  "Department of Telecommunications",
  "Department of Water Resources, River Development & GR",
  "Ministry of Chemicals and Fertilizers",
  "Ministry of Civil Aviation",
  "Ministry of Coal",
  "Ministry of Health & Family Welfare",
  "Ministry of Housing & Urban Affairs",
  "Ministry of Labour and Employment",
  "Ministry of Mines",
  "Ministry of New & Renewable Energy",
  "Ministry of Petroleum & Natural Gas",
  "Ministry of Ports, Shipping and Waterways",
  "Ministry of Power",
  "Ministry of Railways",
  "Ministry of Road Transport & Highways",
  "Ministry of Steel"
];

export function AdminAccountManager({ currentUser }: { currentUser?: any }) {
  const isCentralAdmin = currentUser?.role === "admin";
  const isStateAdmin = currentUser?.role === "state_admin";

  const defaultRole = isCentralAdmin ? "State Admin" : "Ministry";
  const availableRoles = isCentralAdmin ? ["State Admin", "Agency"] : ["Ministry"];

  const [form, setForm] = useState({ name: "", email: "", password: "", role: defaultRole, ministry: "", agency: "", state: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    
    // Inject the state admin's state into the ministry account
    const payload = { ...form };
    if (isStateAdmin && payload.role === "Ministry") {
        payload.state = currentUser.state; // State admin assigns ministry to their own state
    }

    try {
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to create account.");
      setMessage(`Account created for ${form.email}.`);
      setForm({ name: "", email: "", password: "", role: defaultRole, ministry: "", agency: "", state: "" });
    } catch (e: any) { setMessage(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="bg-white border-2 border-slate-200 p-6 max-w-4xl">
      <h2 className="font-black text-xl uppercase">{isCentralAdmin ? "Central Admin Platform Provisioning" : "State Admin Ministry Provisioning"}</h2>
      <p className="text-xs font-mono text-slate-500 mt-1 mb-6">ADMIN ONLY A PRIVILEGED ROLES ARE PROVISIONED HERE</p>
      
      {message && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded">{message}</div>}

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[["name","Full name","text"],["email","Email","email"],["password","Temporary password","password"]].map(([key,label,type]) => (
          <label key={key} className="text-xs font-mono uppercase text-slate-600">{label}<input required type={type} minLength={key === "password" ? 8 : undefined} className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans outline-none focus:border-indigo-500" value={(form as any)[key]} onChange={e => setForm({...form, [key]: e.target.value})}/></label>
        ))}
        
        <label className="text-xs font-mono uppercase text-slate-600">Role
          <select className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans outline-none focus:border-indigo-500" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
            {availableRoles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>

        {form.role === "Agency" && (
          <label className="text-xs font-mono uppercase text-slate-600">Agency / Company
            <input required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans outline-none focus:border-indigo-500" value={form.agency} onChange={e => setForm({...form, agency:e.target.value})}/>
          </label>
        )}

        {form.role === "State Admin" && (
          <label className="text-xs font-mono uppercase text-slate-600">State Assignment
            <select required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans bg-white outline-none focus:border-indigo-500" value={form.state} onChange={e => setForm({...form, state:e.target.value})}>
              <option value="" disabled>Select State</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        )}

        {form.role === "Ministry" && (
          <label className="text-xs font-mono uppercase text-slate-600">Ministry / Department
            <select required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans bg-white outline-none focus:border-indigo-500" value={form.ministry} onChange={e => setForm({...form, ministry:e.target.value})}>
              <option value="" disabled>Select Ministry / Department</option>
              {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        )}

        {form.role === "Ministry" && isStateAdmin && (
            <div className="col-span-1 md:col-span-2 mt-2 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 flex items-center">
                This ministry account will automatically be tied to your state: <strong>&nbsp;{currentUser.state}</strong>.
            </div>
        )}

        <div className="col-span-1 md:col-span-2 pt-4">
          <button type="submit" disabled={loading} className="px-6 py-3 bg-slate-900 text-white font-semibold uppercase text-xs tracking-wider hover:bg-slate-800 disabled:opacity-50 w-full md:w-auto">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
}
