import os
import re

path = "src/components/AgencyProjectManager.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

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

content = content.replace('export function AgencyProjectManager', dropdown_constants + '\nexport function AgencyProjectManager')

old_array = """            {[
              ["project_code","Project code","text"],["project_name","Project name","text"],["sector","Sector","text"],
              ["ministry","Ministry / Department","text"],["state","State(s)","text"],["original_cost","Original cost (Cr)","number"],
              ["revised_cost","Revised cost (Cr)","number"],["cumulative_expenditure","Cumulative expenditure (Cr)","number"],["physical_progress","Physical progress (%)","number"]
            ].map(([key,label,type]) => (
              <label key={key} className="text-xs font-mono uppercase text-slate-600">
                {label}
                <input required={key === "project_code" || key === "project_name" || key === "sector"} type={type} step="any" className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={Number.isNaN(form[key]) ? "" : (form[key] ?? "")} onChange={e => set(key,e.target.value)} />
              </label>
            ))}"""

new_array = """            {[
              ["project_name","Project name","text"],["sector","Sector","select"],
              ["ministry","Ministry / Department","text"],["state","State(s)","select"],["original_cost","Original cost (Cr)","number"],
              ["revised_cost","Revised cost (Cr)","number"],["cumulative_expenditure","Cumulative expenditure (Cr)","number"],["physical_progress","Physical progress (%)","number"]
            ].map(([key,label,type]) => (
              <label key={key} className="text-xs font-mono uppercase text-slate-600">
                {label}
                {type === "select" ? (
                  <select required className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans bg-white" value={form[key] ?? ""} onChange={e => set(key,e.target.value)}>
                    <option value="" disabled>Select {label}</option>
                    {(key === "sector" ? SECTORS : STATES).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <input required={key === "project_name" || key === "sector"} type={type} step="any" className="mt-1 w-full border border-slate-300 p-2 text-sm font-sans" value={Number.isNaN(form[key]) ? "" : (form[key] ?? "")} onChange={e => set(key,e.target.value)} />
                )}
              </label>
            ))}"""

content = content.replace(old_array, new_array)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated AgencyProjectManager")
