import re
content = open('src/components/CitizenPortal.tsx', encoding='utf-8').read()

# Replace {p.sector} with {p.sector} {p.state ? `• ${p.state}` : ''}
new_line = '{p.sector} {p.state ? `• ${p.state}` : ""}'
content = content.replace('{p.sector}', new_line)

open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8').write(content)
print("Added state to UI")
