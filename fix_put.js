const fs = require('fs');
const path = 'src/app/api/proposals/route.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('createClient')) {
  content = content.replace('import { createMongoProject } from "@/lib/project-store";', 'import { createMongoProject } from "@/lib/project-store";\nimport { createClient } from "@/utils/supabase/server";');
}

// Replace the buggy `PUT` method completely
const correctPut = `export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await req.json();
  const { id, action, feedback, project_code, agency, bidAmount } = data;
  const client = await clientPromise;
  const db = client.db(DB_NAME);

  const proposal = await db.collection(PROPOSALS_COLLECTION).findOne({ _id: new ObjectId(id) });
  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let newStatus = proposal.status;
  let notifTarget = null;
  let notifMsg = "";
  const updates: any = { $set: {} };

  if (action === "dismiss" && proposal.createdBy === session.id) {
    newStatus = "dismissed";
  } else if (session.role === "admin") {
    if (action === "approve") {
      if (proposal.type === "agency_proposal") {
        newStatus = "pending_ministry";
        notifTarget = { targetMinistry: proposal.ministry };
        notifMsg = \`Admin approved a proposal (\${proposal.project_name}) from \${proposal.agency}. Awaiting your final approval.\`;
      } else {
        newStatus = "bidding_open";
        notifTarget = { targetRole: "agency" }; // all agencies in that ministry
        notifMsg = \`Bidding is now OPEN for \${proposal.project_name}! Submit your bids within 1 week.\`;
      }
    } else if (action === "reject") {
      newStatus = "rejected_by_admin";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = \`Admin rejected your proposal (\${proposal.project_name}). Reason: \${feedback}\`;
    } else if (action === "award_bid") {
      newStatus = "approved"; // finalized
      if (agency && bidAmount) {
         const supabase = await createClient();
         await supabase.from('projects').insert([{
           project_code: proposal.project_code || \`PRJ-\${Date.now()}\`,
           project_name: proposal.project_name || "New Awarded Project",
           sector: proposal.sector || "Others",
           hml_category: proposal.sector || "Others",
           ministry: proposal.ministry || null,
           agency: agency,
           state: proposal.state || 'Unknown',
           original_cost: Number(bidAmount) || Number(proposal.expected_expenditure) || 0,
           revised_cost: Number(bidAmount) || Number(proposal.expected_expenditure) || 0,
           cumulative_expenditure: 0,
           physical_progress: 0
         }]);
         updates.$set.agency = agency;
         updates.$set.expected_expenditure = bidAmount;
      }
    }
  } else if (session.role === "ministry") {
    if (action === "approve") {
      newStatus = "approved";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = \`Ministry approved your proposal (\${proposal.project_name})!\`;
      
      // Create the project in Supabase as well since MongoDB is blocked
      if (proposal.type === "agency_proposal") {
         const supabase = await createClient();
         await supabase.from('projects').insert([{
           project_code: proposal.project_code || \`PRJ-\${Date.now()}\`,
           project_name: proposal.project_name || "New Awarded Project",
           sector: proposal.sector || "Others",
           hml_category: proposal.sector || "Others",
           ministry: proposal.ministry || null,
           agency: proposal.agency,
           state: proposal.state || 'Unknown',
           original_cost: Number(proposal.expected_expenditure) || 0,
           revised_cost: Number(proposal.expected_expenditure) || 0,
           cumulative_expenditure: 0,
           physical_progress: 0
         }]);
      }
    } else if (action === "reject") {
      newStatus = "rejected_by_ministry";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = \`Ministry rejected your proposal (\${proposal.project_name}). Reason: \${feedback}\`;
    }
  }

  updates.$set.status = newStatus;
  if (project_code) {
    updates.$set.project_code = project_code;
  }
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
}`;

content = content.replace(/export async function PUT[\s\S]*/, correctPut);
fs.writeFileSync(path, content, 'utf8');
console.log("Fixed route cleanly");
