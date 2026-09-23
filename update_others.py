import os
import re

new_ministries = """const MINISTRIES = [
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
"""

# Update ProposalForm.tsx
path1 = "src/components/ProposalForm.tsx"
with open(path1, "r", encoding="utf-8") as f:
    content1 = f.read()

# Add MINISTRIES constant
content1 = content1.replace("export function ProposalForm", new_ministries + "\nexport function ProposalForm")

old_min_input = """<div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Ministry / Department</label>
          <input required placeholder="Ministry / Department" className="border p-3 rounded-lg" value={form.ministry} onChange={e => setForm({...form, ministry: e.target.value})} />
        </div>"""
new_min_input = """<div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Ministry / Department</label>
          <select required className="border p-3 rounded-lg bg-white" value={form.ministry} onChange={e => setForm({...form, ministry: e.target.value})}>
            <option value="" disabled>Select Ministry</option>
            {MINISTRIES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>"""
content1 = content1.replace(old_min_input, new_min_input)

with open(path1, "w", encoding="utf-8") as f:
    f.write(content1)


# Update AgencyProjectManager.tsx
path2 = "src/components/AgencyProjectManager.tsx"
with open(path2, "r", encoding="utf-8") as f:
    content2 = f.read()

content2 = content2.replace("export function AgencyProjectManager", new_ministries + "\nexport function AgencyProjectManager")

old_array_item = '["ministry","Ministry / Department","text"]'
new_array_item = '["ministry","Ministry / Department","select"]'
content2 = content2.replace(old_array_item, new_array_item)

old_select_logic = """{(key === "sector" ? SECTORS : STATES).map(s => <option key={s} value={s}>{s}</option>)}"""
new_select_logic = """{(key === "sector" ? SECTORS : key === "ministry" ? MINISTRIES : STATES).map(s => <option key={s} value={s}>{s}</option>)}"""
content2 = content2.replace(old_select_logic, new_select_logic)

with open(path2, "w", encoding="utf-8") as f:
    f.write(content2)

print("Updated ProposalForm and AgencyProjectManager with Ministry dropdowns")
