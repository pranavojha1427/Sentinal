import re

with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace everything from {/* Tab Navigation */} down to </div> right before the tab contents
pattern = r'\{\/\*\s*Tab Navigation\s*\*\/\}.*?<\/div>'
replacement = """{/* Tab Navigation */}
        <div className="flex gap-1 border-b border-slate-200 mb-8 overflow-x-auto">
          {(() => {
             const tabs = [];
             if (!currentUser) {
                 tabs.push({ id: 'dashboard', label: 'Overview' }, { id: 'complaints', label: 'Complaints' });
             } else if (currentUser.role === 'admin') {
                 // Central Admin
                 tabs.push(
                     { id: 'dashboard', label: 'Participatory Priority Engine (Dashboard)' },
                     { id: 'accounts', label: 'Accounts (State Admins & Agencies)' }
                 );
             } else if (currentUser.role === 'state_admin') {
                 // State Admin
                 tabs.push(
                     { id: 'dashboard', label: 'State Priority Engine' },
                     { id: 'hotspots', label: 'Hotspots' },
                     { id: 'inspectors', label: 'Inspectors' },
                     { id: 'proposals', label: 'Bidding / Proposals' },
                     { id: 'accounts', label: 'Accounts (Ministries)' }
                 );
             } else if (currentUser.role === 'ministry') {
                 tabs.push(
                     { id: 'dashboard', label: 'Dashboard' },
                     { id: 'hotspots', label: 'Field Reports' },
                     { id: 'proposals', label: 'Proposals' },
                     { id: 'complaints', label: 'Complaints' }
                 );
             } else if (currentUser.role === 'agency') {
                 tabs.push(
                     { id: 'dashboard', label: 'Dashboard' },
                     { id: 'proposals', label: 'Bidding' },
                     { id: 'my-projects', label: 'My Projects' },
                     { id: 'complaints', label: 'Complaints' }
                 );
             }
             return tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-semibold text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-b-2 border-slate-900 text-slate-900"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
             ));
          })()}
        </div>"""

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Need to update the render condition as well
# from:
# {activeTab === "hotspots" && (currentUser?.role === "admin" || currentUser?.role === "ministry") ? (
# to:
# {activeTab === "hotspots" && (currentUser?.role === "state_admin" || currentUser?.role === "ministry") ? (
content = content.replace(
    '{activeTab === "hotspots" && (currentUser?.role === "admin" || currentUser?.role === "ministry") ? (',
    '{activeTab === "hotspots" && (currentUser?.role === "state_admin" || currentUser?.role === "ministry") ? ('
)

content = content.replace(
    ') : activeTab === "inspectors" && currentUser?.role === "admin" ? (',
    ') : activeTab === "inspectors" && currentUser?.role === "state_admin" ? ('
)

content = content.replace(
    ') : activeTab === "accounts" && currentUser?.role === "admin" ? (',
    ') : activeTab === "accounts" && (currentUser?.role === "admin" || currentUser?.role === "state_admin") ? ('
)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
