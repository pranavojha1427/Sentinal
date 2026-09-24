import re

with open('src/components/DashboardClientView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove TAB_ITEM
content = content.replace('    { id: "participatory", label: "Participatory Priority Engine" },\n', '')

# 2. Update filter condition
content = content.replace(
    "TAB_ITEMS.filter(tab => !currentUser ? (tab.id === 'dashboard' || tab.id === 'participatory') :",
    "TAB_ITEMS.filter(tab => !currentUser ? (tab.id === 'dashboard') :"
)

# 3. Update else-if condition
content = content.replace(
    "activeTab !== \"dashboard\" && activeTab !== \"proposals\" && activeTab !== \"participatory\" && (",
    "activeTab !== \"dashboard\" && activeTab !== \"proposals\" && ("
)

# 4. Remove activeTab === "participatory" block
start_str = '      {activeTab === "participatory" && ('
end_str = '      )}\n'
if start_str in content:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str, start_idx) + len(end_str)
    
    # Let's ensure the end_str we found is the right one by checking the content
    block = content[start_idx:end_idx]
    if 'Participatory Priority Engine' in block and 'AdminGatekeeper' in block:
        content = content[:start_idx] + content[end_idx:]
        print("Removed activeTab === participatory block")
    else:
        print("Did not match the correct block for deletion")
else:
    print("Start string not found")

with open('src/components/DashboardClientView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

