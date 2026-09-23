import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(".join('\n');", ".join('\\n');")

# Also check for this one:
content = content.replace("content: `/no_think\n${message}`", "content: `/no_think\\n${message}`")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed literal newline issue")
