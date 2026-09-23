const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `          {currentUser && (
  <Card className="bg-white border-slate-200 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
              <CardHeader><CardTitle className="font-mono uppercase tracking-wide border-b border-slate-200 pb-2 text-slate-900">Project Database</CardTitle></CardHeader>
              <CardContent className="p-0"><ProjectTableAI projects={mappedProjects} /></CardContent>
            </Card>
  )}`;

const replacement = `          <Card className="bg-white border-slate-200 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
              <CardHeader><CardTitle className="font-mono uppercase tracking-wide border-b border-slate-200 pb-2 text-slate-900">Project Database</CardTitle></CardHeader>
              <CardContent className="p-0"><ProjectTableAI projects={mappedProjects} /></CardContent>
            </Card>`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log("Un-hid the project database");
