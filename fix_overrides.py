import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    "const overrides = await getProjectOverrides();",
    "const overrides = await getProjectOverrides((supaProjects || []).map(p => p.id));"
)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed getProjectOverrides call")
