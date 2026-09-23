import os

path = "src/app/api/chat/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("await getMongoProjects();", "await getMongoProjects(undefined);")
content = content.replace("session.ministry.toLowerCase()", "session.ministry!.toLowerCase()")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed TS errors")
