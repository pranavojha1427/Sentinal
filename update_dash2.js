const fs = require('fs');

const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<select[\s\S]*?onChange=\{\(e\) => setMinistryFilter\(e\.target\.value \|\| null\)\}[\s\S]*?<\/select>/;
const newMinistrySelect = `{(currentUser?.role === "admin") ? (
              <select 
                className="bg-slate-50 border border-slate-300 text-slate-700 p-2 text-sm font-mono focus:border-emerald-500 outline-none"
                value={ministryFilter || ""}
                onChange={(e) => setMinistryFilter(e.target.value || null)}
              >
                <option value="">All Ministries</option>
                {uniqueMinistries.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <div className="bg-slate-50 border border-slate-300 text-slate-700 p-2 text-sm font-mono flex items-center h-[38px] truncate">
                {currentUser?.ministry || currentUser?.agency || "Assigned Department"}
              </div>
            )}`;

content = content.replace(regex, newMinistrySelect);

fs.writeFileSync(path, content, 'utf8');
console.log("Dynamically updated DashboardClientView.tsx");
