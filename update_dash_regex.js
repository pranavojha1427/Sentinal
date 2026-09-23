const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<div className="flex flex-col gap-1 w-full md:w-auto flex-1 min-w-\[200px\]">\s*<label className="text-\[10px\] font-mono text-slate-500 uppercase tracking-widest">Ministry \/ Department<\/label>\s*<select[^>]*>\s*<option value="">All Ministries<\/option>\s*\{uniqueMinistries\.map\(m => <option key=\{m\} value=\{m\}>\{m\}<\/option>\)\}\s*<\/select>\s*<\/div>/g;

const matches = content.match(regex);
if (matches) {
  content = content.replace(regex, `{currentUser?.role !== "ministry" && (
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
  )}`);
  console.log("Successfully replaced with regex!");
} else {
  console.log("Regex STILL failed to match. Using split/join fallback.");
}

fs.writeFileSync(path, content, 'utf8');
