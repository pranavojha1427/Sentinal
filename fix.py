import os

path = "src/app/api/proposals/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_block = """  const updates: any = { status: newStatus };
  if (feedback) {
    updates.$push = { feedback: { text: feedback, author: session.name, role: session.role, date: new Date() } };
  }
  
  if (action === "start_bidding") updates.biddingStartedAt = new Date(); // To track 1 week limit
  
  await db.collection(PROPOSALS_COLLECTION).updateOne({ _id: new ObjectId(id) }, updates);"""

new_block = """  const updates: any = { $set: { status: newStatus } };
  if (newStatus === "bidding_open") {
    updates.$set.biddingStartedAt = new Date();
  }
  if (feedback) {
    updates.$push = { feedback: { text: feedback, author: session.name, role: session.role, date: new Date() } };
  }
  
  await db.collection(PROPOSALS_COLLECTION).updateOne({ _id: new ObjectId(id) }, updates);"""

content = content.replace(old_block, new_block)
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Replaced")
