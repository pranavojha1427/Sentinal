const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const importsToAdd = `import { AdminAccountManager } from "@/components/AdminAccountManager";
import { AgencyProjectManager } from "@/components/AgencyProjectManager";
import { WorkflowInbox } from "@/components/WorkflowInbox";
import { ProposalForm } from "@/components/ProposalForm";
import { NotificationBell } from "@/components/NotificationBell";
import { SessionUser } from "@/lib/auth";
`;

if (!content.includes('AdminAccountManager')) {
    content = content.replace('import { AnalyticsTabs } from "@/components/AnalyticsTabs";', 'import { AnalyticsTabs } from "@/components/AnalyticsTabs";\n' + importsToAdd);
}

content = content.replace('kpi: any;', 'kpi: any;\n  currentUser?: SessionUser;');
content = content.replace('export function DashboardClientView({ allProjects, agencyData, benchResData, alertsData, kpi }: Props)', 'export function DashboardClientView({ allProjects, agencyData, benchResData, alertsData, kpi, currentUser }: Props)');

// Fix isFiltered
content = content.replace('const isFiltered = stateFilter || sectorFilter || ministryFilter;', 'const isFiltered = stateFilter || sectorFilter || ministryFilter || (currentUser && currentUser.role !== "admin");');

// Fix Header
const headerRegex = /\{\/\* Header \*\/\}[\s\S]*?\{\/\* \S+ Tab Navigation \S+ \*\/\}/g;
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
              <a href="/logout" className="text-xs font-mono uppercase bg-slate-900 text-white px-3 py-2 hover:bg-slate-800 transition-colors">Logout</a>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}`;
content = content.replace(headerRegex, newHeader);

// Fix Tab items logic
const tabNavRegex = /TAB_ITEMS\.map\(\(tab\) =>/g;
content = content.replace(tabNavRegex, 'TAB_ITEMS.filter(tab => (tab.id !== "my-projects" || currentUser?.role === "agency")).concat(currentUser?.role === "admin" ? [{ id: "accounts", label: "Accounts" }] : []).map((tab) =>');

// Fix ministry Filter dropdown
const ministryDropdownTarget = `<div className="flex flex-col gap-1 w-full md:w-auto flex-1 min-w-[200px]">
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

const newMinistryDropdown = `<div className="flex flex-col gap-1 w-full md:w-auto flex-1 min-w-[200px]">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Ministry / Department</label>
              {currentUser?.role === "admin" ? (
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
              )}
            </div>`;
content = content.replace(ministryDropdownTarget, newMinistryDropdown);

// Fix Tab content
const tabContentRegex = /\{activeTab !== "dashboard" && \(\s*<AnalyticsTabs[\s\S]*?\/>\s*\)\}/;
const newTabContent = `{activeTab === "proposals" && (
        <div className="space-y-8 p-6">
          <WorkflowInbox currentUser={currentUser as any} />
          {(currentUser?.role === "agency" || currentUser?.role === "ministry") && (
            <ProposalForm currentUser={currentUser as any} onSuccess={() => window.location.reload()} />
          )}
        </div>
      )}
      {activeTab === "accounts" && currentUser?.role === "admin" ? (
        <AdminAccountManager />
      ) : activeTab === "my-projects" && currentUser?.role === "agency" ? (
        <AgencyProjectManager projects={allProjects.filter((p: any) => p.agency === currentUser?.agency && !p.is_completed)} agency={currentUser?.agency!} />
      ) : activeTab !== "dashboard" && activeTab !== "proposals" && (
        <AnalyticsTabs
          activeTab={activeTab}
          agencyData={agencyData}
          projects={benchmarkProjects}
          benchmarks={benchResData}
          alerts={alertsData}
        />
      )}`;

content = content.replace(tabContentRegex, newTabContent);

fs.writeFileSync(path, content, 'utf8');
console.log("Fully restored DashboardClientView.tsx");
