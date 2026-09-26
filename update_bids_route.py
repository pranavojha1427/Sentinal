with open('src/app/api/bids/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'if (session.role === "admin") {',
    'if (session.role === "admin" || session.role === "state_admin") {'
)

with open('src/app/api/bids/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
