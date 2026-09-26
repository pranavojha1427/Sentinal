with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_target = 'import { AdminAccountManager } from "@/components/AdminAccountManager";'
if 'AdminHotspots' not in content:
    content = content.replace(import_target, import_target + '\nimport AdminHotspots from "./AdminHotspots";\nimport AdminInspectors from "./AdminInspectors";')

# Replace the block
import re

old_block = r'\{activeTab === "accounts" && currentUser\?\.role === "admin" \? \(\s*<AdminAccountManager \/>\s*\) : activeTab === "my-projects" && currentUser\?\.role === "agency" \? \('

new_block = """{activeTab === "hotspots" && currentUser?.role === "admin" ? (
        <AdminHotspots />
      ) : activeTab === "inspectors" && currentUser?.role === "admin" ? (
        <AdminInspectors />
      ) : activeTab === "accounts" && currentUser?.role === "admin" ? (
        <AdminAccountManager />
      ) : activeTab === "my-projects" && currentUser?.role === "agency" ? ("""

content = re.sub(old_block, new_block, content)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
