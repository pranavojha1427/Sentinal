import os

path = "src/app/api/proposals/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_put = """  if (session.role === "admin") {"""

new_put = """  if (action === "dismiss" && proposal.createdBy === session.id) {
    newStatus = "dismissed";
  } else if (session.role === "admin") {"""

content = content.replace(old_put, new_put)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated API to support dismiss")
