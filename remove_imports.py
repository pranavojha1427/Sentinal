import re

with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import AdminGatekeeper from "@/components/AdminGatekeeper";\n', '')

# We might still need next/dynamic if used elsewhere. Let's check:
if 'dynamic(' not in re.sub(r'const DemandMap = dynamic\(\(\) => import\("@/components/DemandMap"\), \{[\s\S]*?\}\);\n', '', content):
    content = content.replace('import dynamic from "next/dynamic";\n', '')

content = re.sub(r'const DemandMap = dynamic\(\(\) => import\("@/components/DemandMap"\), \{[\s\S]*?\}\);\n', '', content)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
