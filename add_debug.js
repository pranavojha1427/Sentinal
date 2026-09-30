const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardClientView.tsx', 'utf8');
code = code.replace(
  '<CardTitle className="font-mono uppercase tracking-wide text-slate-900">Project Database</CardTitle>',
  '<CardTitle className="font-mono uppercase tracking-wide text-slate-900">Project Database {JSON.stringify(currentUser || {})}</CardTitle>'
);
fs.writeFileSync('src/components/DashboardClientView.tsx', code);
