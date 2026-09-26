with open('src/app/api/admin/users/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const newUser: any = { name, email, password: hashedPassword, role, createdAt: new Date() };',
    'const newUser: any = { name, email, passwordHash: hashedPassword, role, active: true, createdAt: new Date() };'
)

with open('src/app/api/admin/users/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
