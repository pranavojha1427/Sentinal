import os

path = "src/app/api/proposals/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

post_idx = content.find("export async function POST")
new_top = """import { NextResponse } from "next/server";
import clientPromise, { DB_NAME, PROPOSALS_COLLECTION, NOTIFICATIONS_COLLECTION } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { createMongoProject } from "@/lib/project-store";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  let query: any = {};
  if (session.role === "ministry" && session.ministry) {
    query = { $or: [{ ministry: new RegExp(`^${session.ministry}$`, "i") }, { createdBy: session.id }] };
  } else if (session.role === "agency" && session.agency) {
    query = { $or: [{ agency: session.agency }, { status: "bidding_open" }] };
  } else if (session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposals = await db.collection(PROPOSALS_COLLECTION).find(query).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(proposals);
}

"""

with open(path, "w", encoding="utf-8") as f:
    f.write(new_top + content[post_idx:])
print("Fixed GET function syntax")
