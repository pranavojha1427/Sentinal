import os

path = "src/components/AdminAccountManager.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace roles constant
content = content.replace(
    'const roles = ["user", "ministry", "engineer", "agency"];',
    'const roles = ["Ministry", "Agency"];'
)

# Replace initial state to match
content = content.replace(
    'role: "agency"',
    'role: "Agency"'
)

# Add MINISTRIES constant
ministry_constant = """const MINISTRIES = [
  "Department for Promotion of Industry & Internal Trade",
  "Ministry of Road Transport and Highways",
  "Ministry of Railways",
  "Ministry of Coal",
  "Ministry of Petroleum and Natural Gas",
  "Ministry of Power",
  "Ministry of New and Renewable Energy",
  "Ministry of Jal Shakti",
  "Ministry of Health and Family Welfare",
  "Ministry of Education",
  "Ministry of Housing and Urban Affairs",
  "Ministry of Ports, Shipping and Waterways",
  "Ministry of Civil Aviation",
  "Ministry of Steel",
  "Ministry of Mines",
  "Ministry of Communications",
  "Ministry of Tourism",
  "Ministry of Environment, Forest and Climate Change",
  "Others"
];

export function AdminAccountManager"""
content = content.replace("export function AdminAccountManager", ministry_constant)

# Update form elements
old_form = """        <label className="text-xs font-mono uppercase text-slate-600">Role<select className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>{roles.map(r => <option key={r}>{r}</option>)}</select></label>
          {(form.role === "agency" || form.role === "engineer") && <label className="text-xs font-mono uppercase text-slate-600">Agency / Company<input required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form.agency} onChange={e => setForm({...form, agency:e.target.value})}/></label>}
          {form.role === "ministry" && <label className="text-xs font-mono uppercase text-slate-600">Ministry / Department<input required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form.ministry} onChange={e => setForm({...form, ministry:e.target.value})}/></label>}"""

new_form = """        <label className="text-xs font-mono uppercase text-slate-600">Role<select className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans bg-white" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
          {form.role.toLowerCase() === "agency" && <label className="text-xs font-mono uppercase text-slate-600">Agency / Company<input required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form.agency} onChange={e => setForm({...form, agency:e.target.value})}/></label>}
          {form.role.toLowerCase() === "ministry" && (
            <label className="text-xs font-mono uppercase text-slate-600">Ministry / Department
              <select required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans bg-white" value={form.ministry} onChange={e => setForm({...form, ministry:e.target.value})}>
                <option value="" disabled>Select Ministry / Department</option>
                {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
          )}"""
content = content.replace(old_form, new_form)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated AdminAccountManager")
