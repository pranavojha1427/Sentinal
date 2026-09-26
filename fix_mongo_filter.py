with open('src/app/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '.filter((p: any) => session?.role === "admin" || (session?.role === "ministry" && p.ministry === session?.ministry) || ((session?.role === "engineer" || session?.role === "agency") && p.agency === session?.agency) || session?.role === "user")',
    '.filter((p: any) => session?.role === "admin" || (session?.role === "state_admin" && p.state === session?.state) || (session?.role === "ministry" && p.ministry === session?.ministry && (session?.state ? p.state === session?.state : true)) || ((session?.role === "engineer" || session?.role === "agency") && p.agency === session?.agency) || session?.role === "user")'
)

with open('src/app/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
