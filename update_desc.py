with open('src/components/AnalyticsTabs.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'Agencies sorted by delay frequency.',
    'Agencies sorted by best performance (lowest delay frequency).'
)

with open('src/components/AnalyticsTabs.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
