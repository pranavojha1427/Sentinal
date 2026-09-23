import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

write_file("src/components/ProposalForm.tsx", """
"use client";
import { useState } from "react";
import { Button } from "./ui/button";

export function ProposalForm({ currentUser, onSuccess }: any) {
  const [form, setForm] = useState({ project_code: "", project_name: "", sector: "Roads & Highways", state: "", expected_expenditure: "", start_date: "", end_date: "", details: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: any) => {
    e.preventDefault(); setLoading(true);
    await fetch("/api/proposals", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(form) });
    setLoading(false);
    alert("Proposal submitted successfully!");
    if(onSuccess) onSuccess();
  };

  return (
    <form onSubmit={submit} className="bg-white p-6 border shadow-sm rounded flex flex-col gap-4 max-w-2xl">
      <h3 className="font-semibold text-lg border-b pb-2">Create New Project Proposal</h3>
      <div className="grid grid-cols-2 gap-4">
        <input required placeholder="Project Code" className="border p-2 rounded" onChange={e => setForm({...form, project_code: e.target.value})} />
        <input required placeholder="Project Name" className="border p-2 rounded" onChange={e => setForm({...form, project_name: e.target.value})} />
        <input required placeholder="Sector" className="border p-2 rounded" onChange={e => setForm({...form, sector: e.target.value})} />
        <input required placeholder="State" className="border p-2 rounded" onChange={e => setForm({...form, state: e.target.value})} />
        <input required type="number" placeholder="Expected Expenditure (Cr)" className="border p-2 rounded" onChange={e => setForm({...form, expected_expenditure: e.target.value})} />
        <input required type="date" title="Start Date" className="border p-2 rounded" onChange={e => setForm({...form, start_date: e.target.value})} />
        <input required type="date" title="End Date" className="border p-2 rounded" onChange={e => setForm({...form, end_date: e.target.value})} />
      </div>
      <textarea required placeholder="Project Implementation Details & Summary" className="border p-2 rounded h-24" onChange={e => setForm({...form, details: e.target.value})} />
      <Button disabled={loading}>{loading ? "Submitting..." : "Submit Proposal"}</Button>
    </form>
  );
}
""")
print("Form generated")
