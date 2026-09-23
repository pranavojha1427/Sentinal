const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Hide Tab Navigation if !currentUser
const oldTabNav = `      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-200 mb-8 overflow-x-auto">
        {TAB_ITEMS.filter`;

const newTabNav = `      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-200 mb-8 overflow-x-auto">
        {currentUser && TAB_ITEMS.filter`;

content = content.replace(oldTabNav, newTabNav);

// 2. Hide Project Database if !currentUser
const oldDb = `          <Card className="bg-white border-slate-200 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <CardHeader><CardTitle className="font-mono uppercase tracking-wide border-b border-slate-200 pb-2 text-slate-900">Project Database</CardTitle></CardHeader>
            <CardContent className="p-0"><ProjectTableAI projects={mappedProjects} /></CardContent>
          </Card>`;

const newDb = `          {currentUser && (
            <Card className="bg-white border-slate-200 rounded-none border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
              <CardHeader><CardTitle className="font-mono uppercase tracking-wide border-b border-slate-200 pb-2 text-slate-900">Project Database</CardTitle></CardHeader>
              <CardContent className="p-0"><ProjectTableAI projects={mappedProjects} /></CardContent>
            </Card>
          )}`;

content = content.replace(oldDb, newDb);

// 3. Make sure the Header displays the Login button if !currentUser
const oldHeaderInner = `<div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase bg-slate-200 px-3 py-2">
                {currentUser?.name} - {currentUser?.role}
                {currentUser?.ministry ? ' - ' + currentUser.ministry : ""}
                {currentUser?.agency ? ' - ' + currentUser.agency : ""}
              </span>
              <NotificationBell />
              <a href="/logout" className="text-xs font-mono uppercase bg-slate-900 text-white px-3 py-2 hover:bg-slate-800 transition-colors">Logout</a>
            </div>`;

const newHeaderInner = `<div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <span className="text-xs font-mono uppercase bg-slate-200 px-3 py-2">
                    {currentUser.name} - {currentUser.role}
                    {currentUser.ministry ? ' - ' + currentUser.ministry : ""}
                    {currentUser.agency ? ' - ' + currentUser.agency : ""}
                  </span>
                  <NotificationBell />
                  <a href="/logout" className="text-xs font-mono uppercase bg-slate-900 text-white px-3 py-2 hover:bg-slate-800 transition-colors">Logout</a>
                </>
              ) : (
                <a href="/login" className="text-xs font-mono uppercase bg-emerald-600 text-white px-6 py-2 hover:bg-emerald-700 transition-colors font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black">Login</a>
              )}
            </div>`;

content = content.replace(oldHeaderInner, newHeaderInner);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated DashboardClientView.tsx for public view!");
