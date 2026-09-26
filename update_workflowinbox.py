with open('src/components/WorkflowInbox.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('currentUser.role === "admin"', 'currentUser.role === "state_admin"')

with open('src/components/WorkflowInbox.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
