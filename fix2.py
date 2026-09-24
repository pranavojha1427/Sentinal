import re
content = open('src/components/CitizenPortal.tsx', encoding='utf-8').read()
content = re.sub(r'setMessages\(\[\{ role: "system", text: `[^`]+?p\.project_name[^`]+?` \}\]\);', 'setMessages([{ role: "system", text: `You can provide your feedback for "${p.project_name}" by speaking or typing in any language.` }]);', content)
open('src/components/CitizenPortal.tsx', 'w', encoding='utf-8').write(content)
print('Done!')
