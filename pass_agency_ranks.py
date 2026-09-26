with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<WorkflowInbox currentUser={currentUser as any} />',
    '<WorkflowInbox currentUser={currentUser as any} agencyRanks={dynamicAgencyData} />'
)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
