with open('src/app/api/auth/login/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '      agency: user.agency,\n    });',
    '      agency: user.agency,\n      state: user.state,\n    });'
)

with open('src/app/api/auth/login/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
