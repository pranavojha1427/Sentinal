with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import ViewComplaints from "@/components/ViewComplaints";\n"use client";\n', '"use client";\nimport ViewComplaints from "@/components/ViewComplaints";\n')

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
