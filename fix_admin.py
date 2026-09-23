import os

path = "src/components/AdminAccountManager.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

import re

# Replace the agency input line
content = re.sub(
    r'\{\(form\.role === "agency" \|\| form\.role === "engineer"\) && <label.*?</label>\}',
    '{form.role.toLowerCase() === "agency" && <label className="text-xs font-mono uppercase text-slate-600">Agency / Company<input required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={form.agency} onChange={e => setForm({...form, agency:e.target.value})}/></label>}',
    content,
    flags=re.DOTALL
)

# Replace the ministry input line
content = re.sub(
    r'\{form\.role === "ministry" && <label.*?</label>\}',
    """{form.role.toLowerCase() === "ministry" && (
          <label className="text-xs font-mono uppercase text-slate-600">Ministry / Department
            <select required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans bg-white" value={form.ministry} onChange={e => setForm({...form, ministry:e.target.value})}>
              <option value="" disabled>Select Ministry / Department</option>
              {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        )}""",
    content,
    flags=re.DOTALL
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated AdminAccountManager rendering logic")
