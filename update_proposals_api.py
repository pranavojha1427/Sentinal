with open('src/app/api/proposals/route.ts', 'r', encoding='utf-8') as f:
    content = f.read()

target = """  let query: any = {};
  if (session.role === "ministry" && session.ministry) {
    query = { $or: [{ ministry: new RegExp(`^${session.ministry}$`, "i") }, { createdBy: session.id }] };
  } else if (session.role === "agency" && session.agency) {
    query = { $or: [{ agency: session.agency }, { status: "bidding_open" }] };
  } else if (session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }"""

replacement = """  let query: any = {};
  if (session.role === "ministry" && session.ministry) {
    query = { $or: [{ ministry: new RegExp(`^${session.ministry}$`, "i") }, { createdBy: session.id }] };
  } else if (session.role === "agency" && session.agency) {
    query = { $or: [{ agency: session.agency }, { status: "bidding_open" }] };
  } else if (session.role === "state_admin" && session.state) {
    query = { state: session.state };
  } else if (session.role !== "admin" && session.role !== "state_admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }"""

if target in content:
    content = content.replace(target, replacement)
else:
    print("Could not find target block to replace")

with open('src/app/api/proposals/route.ts', 'w', encoding='utf-8') as f:
    f.write(content)
