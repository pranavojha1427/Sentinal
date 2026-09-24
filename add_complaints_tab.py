with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Hide Add Complaint from Admins
content = content.replace(
    '<a href="/pulse" className="text-xs font-mono uppercase bg-indigo-600',
    '{!currentUser && <a href="/pulse" className="text-xs font-mono uppercase bg-indigo-600'
)
content = content.replace(
    'Add Complaint</a>\n',
    'Add Complaint</a>}\n'
)


# Add to TAB_ITEMS
content = content.replace(
    '  { id: "proposals", label: "Bidding / Project Addition" },\n',
    '  { id: "proposals", label: "Bidding / Project Addition" },\n  { id: "complaints", label: "View Complaints" },\n'
)

# Update the TAB_ITEMS.filter logic to allow 'complaints'
content = content.replace(
    "tab.id === 'dashboard') :",
    "tab.id === 'dashboard' || tab.id === 'complaints') :"
)

# Render ViewComplaints
import_statement = 'import ViewComplaints from "@/components/ViewComplaints";\n'
if import_statement not in content:
    content = import_statement + content

# Render block
render_block = '''
      {activeTab === "complaints" && (
        <div className="p-6 bg-slate-50 border border-slate-200 shadow-sm">
          <ViewComplaints />
        </div>
      )}
'''
content = content.replace(
    '{activeTab === "accounts" && currentUser?.role === "admin" ? (',
    render_block.strip() + '\n\n      {activeTab === "accounts" && currentUser?.role === "admin" ? ('
)

# Also exclude from AnalyticsTabs fallback
content = content.replace(
    'activeTab !== "proposals" && (',
    'activeTab !== "proposals" && activeTab !== "complaints" && ('
)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
