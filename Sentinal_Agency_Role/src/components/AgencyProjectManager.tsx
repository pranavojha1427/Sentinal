"use client";

import { FormEvent, useState } from "react";
import { Plus, Save } from "lucide-react";

type Project = any;

const empty = {
  project_code: "", project_name: "", sector: "Roads & Highways", ministry: "", state: "",
  original_cost: "", revised_cost: "", cumulative_expenditure: "", physical_progress: "",
  land_acquisition_issue: false, forest_clearance_issue: false, contractor_delay: false,
};

export function AgencyProjectManager({ projects, agency }: { projects: Project[]; agency?: string }) {
  const [form, setForm] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  function edit(p: Project) {
    setEditingId(String(p.id));
    setForm({ ...empty, ...p });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() { setEditingId(null); setForm(empty); }

  async function submit(e: FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const res = await fetch("/api/agency/projects", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { ...form, projectId: editingId } : form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessage(editingId ? "Project update saved." : "Project added successfully.");
      reset();
      setTimeout(() => window.location.reload(), 600);
    } catch (err: any) { setMessage(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border-2 border-slate-200 p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="font-black text-xl uppercase">{editingId ? "Modify Project" : "Add Project"}</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">AGENCY / COMPANY: {agency || "Not assigned"}</p>
          </div>
          {editingId && <button onClick={reset} className="text-xs font-mono underline">Cancel edit</button>}
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["project_code","Project code","text"],["project_name","Project name","text"],["sector","Sector","text"],
            ["ministry","Ministry / Department","text"],["state","State(s)","text"],["original_cost","Original cost (Cr)","number"],
            ["revised_cost","Revised cost (Cr)","number"],["cumulative_expenditure","Cumulative expenditure (Cr)","number"],["physical_progress","Physical progress (%)","number"]
          ].map(([key,label,type]) => (
            <label key={key} className="text-xs font-mono uppercase text-slate-600">
              {label}
              <input required={key === "project_code" || key === "project_name" || key === "sector"} type={type} step="any" className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form[key] ?? ""} onChange={e => set(key,e.target.value)} />
            </label>
          ))}
          {[["land_acquisition_issue","Land acquisition issue"],["forest_clearance_issue","Forest clearance issue"],["contractor_delay","Contractor delay"]].map(([key,label]) => (
            <label key={key} className="flex items-center gap-2 text-xs font-mono uppercase text-slate-600 border border-slate-200 p-2">
              <input type="checkbox" checked={!!form[key]} onChange={e => set(key,e.target.checked)} /> {label}
            </label>
          ))}
          <div className="md:col-span-2 lg:col-span-3 flex items-center gap-3 pt-2">
            <button disabled={loading} className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-3 text-xs font-mono uppercase disabled:opacity-50">
              {editingId ? <Save size={15}/> : <Plus size={15}/>} {loading ? "Saving..." : editingId ? "Save changes" : "Add project"}
            </button>
            {message && <span className="text-xs font-mono text-slate-600">{message}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white border-2 border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between">
          <h3 className="font-mono uppercase font-bold">Projects owned by your agency</h3>
          <span className="text-xs font-mono text-slate-500">{projects.length} PROJECTS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-slate-50"><tr>
            <th className="p-3 text-left font-mono text-xs">Code</th><th className="p-3 text-left font-mono text-xs">Project</th><th className="p-3 text-left font-mono text-xs">Sector</th><th className="p-3 text-right font-mono text-xs">Progress</th><th className="p-3 text-right font-mono text-xs">Action</th>
          </tr></thead><tbody>
            {projects.map((p: any) => <tr key={String(p.id)} className="border-t border-slate-200">
              <td className="p-3 font-mono text-xs">{p.project_code}</td><td className="p-3 font-medium">{p.project_name}</td><td className="p-3">{p.sector}</td><td className="p-3 text-right font-mono">{Number(p.physical_progress || 0).toFixed(1)}%</td><td className="p-3 text-right"><button onClick={() => edit(p)} className="px-3 py-1 bg-slate-900 text-white text-xs font-mono uppercase">Modify</button></td>
            </tr>)}
          </tbody></table>
        </div>
      </div>
    </div>
  );
}
