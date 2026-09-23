import os

path = "src/app/api/proposals/route.ts"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

old_award = """    } else if (action === "award_bid") {
      newStatus = "approved"; // finalized
    }"""

new_award = """    } else if (action === "award_bid") {
      newStatus = "approved"; // finalized
      await createMongoProject({
        project_code: proposal.project_code || `PRJ-${Date.now()}`,
        project_name: proposal.project_name,
        sector: proposal.sector || "Others",
        ministry: proposal.ministry,
        agency: req.json().then(b => b.awarded_agency).catch(() => proposal.agency), // or something... wait we can just pull it from the bid
        state: proposal.state,
        original_cost: Number(proposal.expected_expenditure) || 0,
        revised_cost: Number(proposal.expected_expenditure) || 0,
        cumulative_expenditure: 0,
        physical_progress: 0
      } as any, session.email);
    }"""

# Actually, I don't need to fix award_bid if it's out of scope of this exact prompt, but let's just make sure the admin gets the Project Code field and can use it.
