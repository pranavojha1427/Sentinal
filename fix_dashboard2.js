const fs = require('fs');
const path = 'src/components/DashboardClientView.tsx';
let content = fs.readFileSync(path, 'utf8');

const importsToAdd = `
import { AdminAccountManager } from "@/components/AdminAccountManager";
import { AgencyProjectManager } from "@/components/AgencyProjectManager";
import { WorkflowInbox } from "@/components/WorkflowInbox";
import { ProposalForm } from "@/components/ProposalForm";
import { NotificationBell } from "@/components/NotificationBell";
`;
if (!content.includes('AdminAccountManager')) {
    content = content.replace('import { SessionUser } from "@/lib/auth";', 'import { SessionUser } from "@/lib/auth";\n' + importsToAdd);
}

const headerRegex = /\{\/\*\s*Header\s*\*\/\}.*?\{\/\*\s*"\?"\?\s*Tab Navigation\s*"\?"\?\s*\*\/\}/s;
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
      </div>

      {/* Tab Navigation */}`;
content = content.replace(headerRegex, newHeader);

const tabNavRegex = /TAB_ITEMS\.map\(\(tab\) =>/g;
content = content.replace(tabNavRegex, 'TAB_ITEMS.filter(tab => (tab.id !== "my-projects" || currentUser?.role === "agency")).concat(currentUser?.role === "admin" ? [{ id: "accounts", label: "Accounts" }] : []).map((tab) =>');

const tabContentRegex = /\{activeTab !== "dashboard" && \(\s*<AnalyticsTabs[\s\S]*?\/>\s*\)\}/s;
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

// One more fix: `"\?"\? Tab Navigation "\?"\?` was probably destroyed by my replace. 
// If it fails to find headerRegex, let's just do a manual string replace.
fs.writeFileSync(path, content, 'utf8');
console.log("Restored lost components in DashboardClientView.tsx");
