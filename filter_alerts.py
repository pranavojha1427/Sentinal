with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'alertsData={alertsRes.data || []}',
    'alertsData={(alertsRes.data || []).filter((a: any) => allProjects.some((p: any) => p.id == a.project_id))}'
)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
