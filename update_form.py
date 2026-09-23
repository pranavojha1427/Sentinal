import os

path = "src/components/ProposalForm.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_form = """    <form onSubmit={submit} className="bg-white p-6 border shadow-sm rounded flex flex-col gap-4 max-w-2xl">
      <h3 className="font-semibold text-lg border-b pb-2">Create New Project Proposal</h3>
      <div className="grid grid-cols-2 gap-4">
        <input required placeholder="Project Code" className="border p-2 rounded" onChange={e => setForm({...form, project_code: e.target.value})} />
        <input required placeholder="Project Name" className="border p-2 rounded" onChange={e => setForm({...form, project_name: e.target.value})} />
        <input required placeholder="Sector" className="border p-2 rounded" onChange={e => setForm({...form, sector: e.target.value})} />
        <input required placeholder="Ministry / Department" className="border p-2 rounded" value={form.ministry} onChange={e => setForm({...form, ministry: e.target.value})} />
        <input required placeholder="State" className="border p-2 rounded" onChange={e => setForm({...form, state: e.target.value})} />
        <input required type="number" placeholder="Expected Expenditure (Cr)" className="border p-2 rounded" onChange={e => setForm({...form, expected_expenditure: e.target.value})} />
        <input required type="date" title="Start Date" className="border p-2 rounded" onChange={e => setForm({...form, start_date: e.target.value})} />
        <input required type="date" title="End Date" className="border p-2 rounded" onChange={e => setForm({...form, end_date: e.target.value})} />
      </div>
      <textarea required placeholder="Project Implementation Details & Summary" className="border p-2 rounded h-24" onChange={e => setForm({...form, details: e.target.value})} />
      <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Proposal"}</Button>
    </form>"""

new_form = """    <form onSubmit={submit} className="bg-white p-8 border shadow-sm rounded-xl flex flex-col gap-6 max-w-4xl mx-auto mt-4 w-full">
      <h3 className="font-semibold text-xl border-b pb-2">Create New Project Proposal</h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Project Code</label>
          <input required placeholder="Project Code" className="border p-3 rounded-lg" onChange={e => setForm({...form, project_code: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Project Name</label>
          <input required placeholder="Project Name" className="border p-3 rounded-lg" onChange={e => setForm({...form, project_name: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Sector</label>
          <input required placeholder="Sector" className="border p-3 rounded-lg" onChange={e => setForm({...form, sector: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Ministry / Department</label>
          <input required placeholder="Ministry / Department" className="border p-3 rounded-lg" value={form.ministry} onChange={e => setForm({...form, ministry: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">State</label>
          <input required placeholder="State" className="border p-3 rounded-lg" onChange={e => setForm({...form, state: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Expected Expenditure (Cr)</label>
          <input required type="number" placeholder="Expected Expenditure (Cr)" className="border p-3 rounded-lg" onChange={e => setForm({...form, expected_expenditure: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Start Date</label>
          <input required type="date" title="Start Date" className="border p-3 rounded-lg" onChange={e => setForm({...form, start_date: e.target.value})} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">End Date</label>
          <input required type="date" title="End Date" className="border p-3 rounded-lg" onChange={e => setForm({...form, end_date: e.target.value})} />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-slate-500 uppercase">Project Implementation Details & Summary</label>
        <textarea required placeholder="Project Implementation Details & Summary" className="border p-3 rounded-lg h-32" onChange={e => setForm({...form, details: e.target.value})} />
      </div>
      <Button type="submit" className="py-6 text-lg" disabled={loading}>{loading ? "Submitting..." : "Submit Proposal"}</Button>
    </form>"""

content = content.replace(old_form, new_form)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ProposalForm UI")
