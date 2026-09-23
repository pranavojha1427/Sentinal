import os
import re

path = "src/components/ProposalForm.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Define the state and sector constants
dropdown_constants = """const SECTORS = [
  "Aviation & Aviation Infrastructure", "Coal", "Construction", "Education", 
  "Electricity Generation", "Energy Storage", "Healthcare", "Inland Waterways", 
  "Logistics Infrastructure", "Metals & Mining", "Oil & Gas", "Railways", 
  "Real Estate", "Roads & Highways", "Shipping", "Steel", "Telecommunication", 
  "Tourism, Hospitality & Wellness", "Transmission & Distribution", 
  "Urban Public Transport", "Waste & Water", "Water Resources", "Others"
];

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", 
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", 
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Multiple States", "Nagaland", 
  "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];
"""

# Insert constants at the top
content = content.replace('export function ProposalForm', dropdown_constants + '\nexport function ProposalForm')

# Replace the specific inputs
content = re.sub(
    r'<div className="flex flex-col gap-1">\s*<label className="text-xs font-semibold text-slate-500 uppercase">Project Code</label>\s*<input required placeholder="Project Code" className="border p-3 rounded-lg" onChange=\{e => setForm\(\{...form, project_code: e\.target\.value\}\)\} />\s*</div>',
    '',
    content
)

content = re.sub(
    r'<div className="flex flex-col gap-1">\s*<label className="text-xs font-semibold text-slate-500 uppercase">Sector</label>\s*<input required placeholder="Sector" className="border p-3 rounded-lg" onChange=\{e => setForm\(\{...form, sector: e\.target\.value\}\)\} />\s*</div>',
    """<div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">Sector</label>
          <select required className="border p-3 rounded-lg bg-white" value={form.sector} onChange={e => setForm({...form, sector: e.target.value})}>
            <option value="" disabled>Select Sector</option>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>""",
    content
)

content = re.sub(
    r'<div className="flex flex-col gap-1">\s*<label className="text-xs font-semibold text-slate-500 uppercase">State</label>\s*<input required placeholder="State" className="border p-3 rounded-lg" onChange=\{e => setForm\(\{...form, state: e\.target\.value\}\)\} />\s*</div>',
    """<div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-500 uppercase">State</label>
          <select required className="border p-3 rounded-lg bg-white" value={form.state} onChange={e => setForm({...form, state: e.target.value})}>
            <option value="" disabled>Select State</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>""",
    content
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ProposalForm")
