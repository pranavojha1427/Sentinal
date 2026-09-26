with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

imports = 'import AdminHotspots from "./AdminHotspots";\nimport AdminInspectors from "./AdminInspectors";\n'
if 'AdminHotspots' not in content:
    content = content.replace('import AdminAccountManager from "./AdminAccountManager";', 'import AdminAccountManager from "./AdminAccountManager";\n' + imports)

tabs_target = "currentUser?.role === 'admin' ? [{ id: 'accounts', label: 'Accounts' }] : []"
tabs_replacement = "currentUser?.role === 'admin' ? [{ id: 'hotspots', label: 'Hotspots' }, { id: 'inspectors', label: 'Inspectors' }, { id: 'accounts', label: 'Accounts' }] : []"
content = content.replace(tabs_target, tabs_replacement)

render_target = """{activeTab === "accounts" && currentUser?.role === "admin" ? (
          <AdminAccountManager />
        ) : activeTab === "my-projects\""""
render_replacement = """{activeTab === "hotspots" && currentUser?.role === "admin" ? (
          <AdminHotspots />
        ) : activeTab === "inspectors" && currentUser?.role === "admin" ? (
          <AdminInspectors />
        ) : activeTab === "accounts" && currentUser?.role === "admin" ? (
          <AdminAccountManager />
        ) : activeTab === "my-projects\""""
content = content.replace(render_target, render_replacement)

exclude_target = """activeTab !== "dashboard" && activeTab !== "proposals" && activeTab !== "complaints" && ("""
exclude_replacement = """activeTab !== "dashboard" && activeTab !== "proposals" && activeTab !== "complaints" && activeTab !== "hotspots" && activeTab !== "inspectors" && ("""
content = content.replace(exclude_target, exclude_replacement)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
