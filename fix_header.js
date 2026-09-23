const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetHeader = `{/* Header */}
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="text-4xl font-bold tracking-tighter uppercase border-b-4 border-slate-300 pb-2 text-slate-900">
          PragatiPulse
        </h1>
        <p className="text-slate-600 font-mono text-sm uppercase">Infrastructure Project Monitoring Platform</p>
      </div>`;

const newHeader = `{/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-4xl font-bold tracking-tighter uppercase border-b-4 border-slate-300 pb-2 text-slate-900">
            PragatiPulse
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
            <p className="text-slate-600 font-mono text-sm uppercase">Infrastructure Project Monitoring Platform</p>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono uppercase bg-slate-200 px-3 py-2">
                {currentUser?.name} - {currentUser?.role}
                {currentUser?.ministry ? ' - ' + currentUser.ministry : ""}
                {currentUser?.agency ? ' - ' + currentUser.agency : ""}
              </span>
              <NotificationBell />
              <a href="/logout" className="text-xs font-mono uppercase bg-slate-900 text-white px-3 py-2">Logout</a>
            </div>
          </div>
        </div>
      </div>`;

content = content.replace(targetHeader, newHeader);
fs.writeFileSync(path, content, 'utf8');
console.log("Replaced Header!");
