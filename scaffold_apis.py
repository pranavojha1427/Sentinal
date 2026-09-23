import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# 1. Notifications API
write_file("src/app/api/notifications/route.ts", """import { NextResponse } from "next/server";
import clientPromise, { DB_NAME, NOTIFICATIONS_COLLECTION } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  // Find recipient based on role/agency/ministry
  let query: any = { userId: session.id };
  // But actually, notifications might be sent to 'role:admin' or 'ministry:Ministry of Coal'
  // Let's broaden the query:
  const queries = [{ userId: session.id }];
  if (session.role === "admin") queries.push({ targetRole: "admin" });
  if (session.ministry) queries.push({ targetMinistry: session.ministry });
  if (session.agency) queries.push({ targetAgency: session.agency });

  const notifications = await db.collection(NOTIFICATIONS_COLLECTION)
    .find({ $or: queries })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json(notifications);
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  if (body.action === "mark_read") {
    await db.collection(NOTIFICATIONS_COLLECTION).updateMany(
      { _id: { $in: body.ids.map((id: string) => new ObjectId(id)) } },
      { $set: { isRead: true } }
    );
  }
  return NextResponse.json({ success: true });
}
""")

# 2. Proposals API
write_file("src/app/api/proposals/route.ts", """import { NextResponse } from "next/server";
import clientPromise, { DB_NAME, PROPOSALS_COLLECTION, NOTIFICATIONS_COLLECTION } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  
  let query: any = {};
  if (session.role === "ministry" && session.ministry) {
    query = { $or: [{ ministry: session.ministry }, { createdBy: session.id }] };
  } else if (session.role === "agency" && session.agency) {
    query = { $or: [{ agency: session.agency }, { status: "bidding_open", ministry: { $in: [session.ministry] } }] };
  } else if (session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const proposals = await db.collection(PROPOSALS_COLLECTION).find(query).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(proposals);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const proposal = {
    ...body,
    type: session.role === "agency" ? "agency_proposal" : "ministry_proposal",
    status: "pending_admin", // both start by going to admin
    createdBy: session.id,
    creatorRole: session.role,
    creatorName: session.name,
    ministry: session.ministry || body.ministry,
    agency: session.agency || body.agency,
    createdAt: new Date(),
    feedback: []
  };

  const res = await db.collection(PROPOSALS_COLLECTION).insertOne(proposal);

  // Notify admin
  await db.collection(NOTIFICATIONS_COLLECTION).insertOne({
    targetRole: "admin",
    title: "New Project Proposal",
    message: `${session.name} submitted a new project proposal for ${proposal.project_name}.`,
    isRead: false,
    createdAt: new Date()
  });

  return NextResponse.json({ success: true, id: res.insertedId });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action, feedback } = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const proposal = await db.collection(PROPOSALS_COLLECTION).findOne({ _id: new ObjectId(id) });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let newStatus = proposal.status;
  let notifTarget = null;
  let notifMsg = "";

  if (session.role === "admin") {
    if (action === "approve") {
      if (proposal.type === "agency_proposal") {
        newStatus = "pending_ministry";
        notifTarget = { targetMinistry: proposal.ministry };
        notifMsg = `Admin approved a proposal (${proposal.project_name}) from ${proposal.agency}. Awaiting your final approval.`;
      } else {
        newStatus = "bidding_open";
        notifTarget = { targetMinistry: proposal.ministry, targetRole: "agency" }; // all agencies in that ministry
        notifMsg = `Bidding is now OPEN for ${proposal.project_name}! Submit your bids within 1 week.`;
      }
    } else if (action === "reject") {
      newStatus = "rejected_by_admin";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = `Admin rejected your proposal (${proposal.project_name}). Reason: ${feedback}`;
    } else if (action === "award_bid") {
      newStatus = "approved"; // finalized
    }
  } else if (session.role === "ministry") {
    if (action === "approve") {
      newStatus = "approved";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = `Ministry approved your proposal (${proposal.project_name})!`;
    } else if (action === "reject") {
      newStatus = "rejected_by_ministry";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = `Ministry rejected your proposal (${proposal.project_name}). Reason: ${feedback}`;
    }
  }

  const updates: any = { status: newStatus };
  if (feedback) {
    updates.$push = { feedback: { text: feedback, author: session.name, role: session.role, date: new Date() } };
  }
  
  if (action === "start_bidding") updates.biddingStartedAt = new Date(); // To track 1 week limit
  
  await db.collection(PROPOSALS_COLLECTION).updateOne({ _id: new ObjectId(id) }, updates);

  if (notifTarget) {
    await db.collection(NOTIFICATIONS_COLLECTION).insertOne({
      ...notifTarget,
      title: "Proposal Update",
      message: notifMsg,
      isRead: false,
      createdAt: new Date()
    });
  }

  return NextResponse.json({ success: true, status: newStatus });
}
""")

# 3. Bids API
write_file("src/app/api/bids/route.ts", """import { NextResponse } from "next/server";
import clientPromise, { DB_NAME, BIDS_COLLECTION, PROPOSALS_COLLECTION } from "@/lib/mongodb";
import { getSession } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const proposalId = url.searchParams.get("proposalId");
  
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const bids = await db.collection(BIDS_COLLECTION).find({ proposalId }).sort({ bidAmount: 1 }).toArray();
  return NextResponse.json(bids);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (session?.role !== "agency") return NextResponse.json({ error: "Only agencies can bid" }, { status: 403 });

  const body = await req.json();
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const proposal = await db.collection(PROPOSALS_COLLECTION).findOne({ _id: new ObjectId(body.proposalId) });
  if (!proposal || proposal.status !== "bidding_open") {
    return NextResponse.json({ error: "Bidding is not open for this proposal" }, { status: 400 });
  }

  // Check 1 week rule
  const now = new Date().getTime();
  const opened = new Date(proposal.biddingStartedAt || proposal.createdAt).getTime();
  if (now > opened + 7 * 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Bidding window (1 week) has closed." }, { status: 400 });
  }

  const bid = {
    proposalId: body.proposalId,
    agencyId: session.id,
    agencyName: session.agency || session.name,
    bidAmount: Number(body.bidAmount),
    remarks: body.remarks,
    status: "submitted",
    submittedAt: new Date()
  };

  await db.collection(BIDS_COLLECTION).insertOne(bid);
  return NextResponse.json({ success: true });
}
""")

print("APIs generated successfully")
