const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetBlock = `<div className="flex flex-col gap-1 w-full md:w-auto flex-1 min-w-[200px]">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Ministry / Department</label>
                <select 
                  className="bg-slate-50 border border-slate-300 text-slate-700 p-2 text-sm font-mono focus:border-emerald-500 outline-none"
                  value={ministryFilter || ""}
                  onChange={(e) => setMinistryFilter(e.target.value || null)}
                >
                  <option value="">All Ministries</option>
                  {uniqueMinistries.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>`;

const replacementBlock = `{currentUser?.role !== "ministry" && (
              <div className="flex flex-col gap-1 w-full md:w-auto flex-1 min-w-[200px]">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Ministry / Department</label>
                <select 
                  className="bg-slate-50 border border-slate-300 text-slate-700 p-2 text-sm font-mono focus:border-emerald-500 outline-none"
                  value={ministryFilter || ""}
                  onChange={(e) => setMinistryFilter(e.target.value || null)}
                >
                  <option value="">All Ministries</option>
                  {uniqueMinistries.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}`;

content = content.replace(targetBlock, replacementBlock);
fs.writeFileSync(path, content, 'utf8');
console.log("Updated DashboardClientView.tsx");
