import os

path = "src/app/api/proposals/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Modify extraction
content = content.replace(
    'const { id, action, feedback } = await req.json();',
    'const { id, action, feedback, project_code } = await req.json();'
)

# Modify update query
old_updates = """  const updates: any = { $set: { status: newStatus } };
  if (newStatus === "bidding_open") {
    updates.$set.biddingStartedAt = new Date();
  }
  if (feedback) {
    updates.$push = { feedback: { text: feedback, author: session.name, role: session.role, date: new Date() } };
  }"""

new_updates = """  const updates: any = { $set: { status: newStatus } };
  if (project_code) {
    updates.$set.project_code = project_code;
  }
  if (newStatus === "bidding_open") {
    updates.$set.biddingStartedAt = new Date();
  }
  if (feedback) {
    updates.$push = { feedback: { text: feedback, author: session.name, role: session.role, date: new Date() } };
  }"""

content = content.replace(old_updates, new_updates)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated route.ts")
