with open('src/components/AnalyticsTabs.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<CardContent className="p-0">',
    '<CardContent className="p-0 overflow-x-auto">'
)
content = content.replace(
    '<Table>',
    '<Table className="min-w-[800px]">'
)

with open('src/components/AnalyticsTabs.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
