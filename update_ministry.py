import os

path = "src/app/api/proposals/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_ministry_approve = """    if (action === "approve") {
      newStatus = "approved";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = `Ministry approved your proposal (${proposal.project_name})!`;
    }"""

new_ministry_approve = """    if (action === "approve") {
      newStatus = "approved";
      notifTarget = { userId: proposal.createdBy };
      notifMsg = `Ministry approved your proposal (${proposal.project_name})!`;
      
      // Create the project in MongoDB since it's fully approved
      if (proposal.type === "agency_proposal") {
        await createMongoProject({
          project_code: proposal.project_code || `PRJ-${Date.now()}`,
          project_name: proposal.project_name,
          sector: proposal.sector || "Others",
          ministry: proposal.ministry,
          agency: proposal.agency,
          state: proposal.state,
          original_cost: Number(proposal.expected_expenditure) || 0,
          revised_cost: Number(proposal.expected_expenditure) || 0,
          cumulative_expenditure: 0,
          physical_progress: 0
        } as any, session.email);
      }
    }"""

content = content.replace(old_ministry_approve, new_ministry_approve)
with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Updated ministry approve flow successfully.")
