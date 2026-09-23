import os

path = "src/app/api/proposals/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

if "createMongoProject" not in content:
    content = content.replace('import { ObjectId } from "mongodb";', 'import { ObjectId } from "mongodb";\nimport { createMongoProject } from "@/lib/project-store";')

old_put = """export async function PUT(req: Request) {
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
        notifTarget = { targetRole: "agency" };
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

  const updates: any = { $set: { status: newStatus } };
  if (newStatus === "bidding_open") {
    updates.$set.biddingStartedAt = new Date();
  }
  if (feedback) {
    updates.$push = { feedback: { text: feedback, author: session.name, role: session.role, date: new Date() } };
  }
  
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
}"""

new_put = """export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, action, feedback, winningAgency, winningBidAmount } = await req.json();
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
        notifTarget = { targetRole: "agency" };
        notifMsg = `Bidding is now OPEN for ${proposal.project_name}! Submit your bids within 1 week.`;
      }
    } else if (action === "reject") {
      newStatus = "rejected_by_admin";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = `Admin rejected your proposal (${proposal.project_name}). Reason: ${feedback}`;
    } else if (action === "award_bid") {
      newStatus = "approved"; // finalized
      // Create the project in MongoDB so the winning agency officially owns it
      await createMongoProject({
        project_code: proposal.project_code || `BID-${Date.now()}`,
        project_name: proposal.project_name,
        sector: proposal.sector || "Others",
        ministry: proposal.ministry,
        agency: winningAgency,
        state: proposal.state,
        original_cost: Number(winningBidAmount) || Number(proposal.expected_expenditure) || 0,
        revised_cost: Number(winningBidAmount) || Number(proposal.expected_expenditure) || 0,
        cumulative_expenditure: 0,
        physical_progress: 0
      } as any, session.email);
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

  const updates: any = { $set: { status: newStatus } };
  if (newStatus === "bidding_open") {
    updates.$set.biddingStartedAt = new Date();
  }
  if (feedback) {
    updates.$push = { feedback: { text: feedback, author: session.name, role: session.role, date: new Date() } };
  }
  
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
}"""

content = content.replace(old_put, new_put)
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated PUT route successfully.")
