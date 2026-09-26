with open('src/lib/auth.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'export const ROLES = ["admin", "ministry", "engineer", "agency", "user"] as const;',
    'export const ROLES = ["admin", "state_admin", "ministry", "engineer", "agency", "user"] as const;'
)

content = content.replace(
    '  agency?: string;\n};',
    '  agency?: string;\n  state?: string;\n};'
)

content = content.replace(
    '      agency: payload.agency ? String(payload.agency) : undefined,\n    };',
    '      agency: payload.agency ? String(payload.agency) : undefined,\n      state: payload.state ? String(payload.state) : undefined,\n    };'
)

with open('src/lib/auth.ts', 'w', encoding='utf-8') as f:
    f.write(content)
