def update_dashboard():
    with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    old_concat = "currentUser?.role === 'admin' ? [{ id: 'hotspots', label: 'Hotspots' }, { id: 'inspectors', label: 'Inspectors' }, { id: 'accounts', label: 'Accounts' }] : []"
    new_concat = "currentUser?.role === 'admin' ? [{ id: 'hotspots', label: 'Hotspots' }, { id: 'inspectors', label: 'Inspectors' }, { id: 'accounts', label: 'Accounts' }] : currentUser?.role === 'ministry' ? [{ id: 'hotspots', label: 'Field Reports' }] : []"
    content = content.replace(old_concat, new_concat)
    
    old_render = "activeTab === \"hotspots\" && currentUser?.role === \"admin\" ? (\n        <AdminHotspots />\n      )"
    new_render = "activeTab === \"hotspots\" && (currentUser?.role === \"admin\" || currentUser?.role === \"ministry\") ? (\n        <AdminHotspots currentUser={currentUser} />\n      )"
    content = content.replace(old_render, new_render)
    
    with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

update_dashboard()
