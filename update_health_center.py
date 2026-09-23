import os
import re

path = "src/components/ProjectTableAI.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Overall Health header
content = re.sub(
    r'<h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200\s*pb-1">Overall Health</h3>',
    r'<h3 className="font-mono text-xs text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 text-center">Overall Health</h3>',
    content
)

# Replace Overall Health div flex
content = re.sub(
    r'<div className="flex items-center space-x-2 pt-1">(\s*\{getHealthBadge\(aiScores\[selectedProject\.id\]\?\.overall_health\)\}\s*)</div>',
    r'<div className="flex items-center justify-center pt-1">\1</div>',
    content
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ProjectTableAI UI to center overall health")
