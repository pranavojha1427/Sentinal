 "use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) setError(data.error || "Signup failed.");
    else router.push("/dashboard");

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border-2 border-slate-900 p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.15)]">
        <h1 className="text-3xl font-black tracking-tight">Create account</h1>
        <p className="mt-1 text-sm text-slate-500 font-mono uppercase">PragatiPulse</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-semibold">Full name
            <input className="mt-2 w-full border border-slate-300 p-3" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          </label>
          <label className="block text-sm font-semibold">Email
            <input className="mt-2 w-full border border-slate-300 p-3" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </label>
          <label className="block text-sm font-semibold">Password
            <input className="mt-2 w-full border border-slate-300 p-3" type="password" minLength={8} value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </label>
          <label className="block text-sm font-semibold">Account type
            <select className="mt-2 w-full border border-slate-300 p-3" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="user">User</option>
            </select>
          </label>

          {error && <p className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm">{error}</p>}

          <button disabled={loading} className="w-full bg-slate-900 text-white p-3 font-bold disabled:opacity-50">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already registered? <Link href="/login" className="font-bold underline">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
