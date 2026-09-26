with open('src/app/api/proposals/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '} else if (session.role === "admin") {',
    '} else if (session.role === "state_admin") {'
)

with open('src/app/api/proposals/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
