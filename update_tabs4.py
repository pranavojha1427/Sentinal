with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<AdminAccountManager />',
    '<AdminAccountManager currentUser={currentUser} />'
)

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
