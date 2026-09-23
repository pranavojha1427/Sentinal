const fs = require('fs');
const path = 'src/app/api/proposals/route.ts';
let content = fs.readFileSync(path, 'utf8');

const awardLogic = `
    } else if (action === "award_bid") {
      newStatus = "approved"; // finalized
      if (body.agency && body.bidAmount) {
         // Create the project in MongoDB since it's fully awarded to an agency
         await createMongoProject({
           project_code: proposal.project_code || \`PRJ-\${Date.now()}\`,
           project_name: proposal.project_name,
           sector: proposal.sector || "Others",
           ministry: proposal.ministry,
           agency: body.agency,
           state: proposal.state,
           original_cost: Number(body.bidAmount) || Number(proposal.expected_expenditure) || 0,
           revised_cost: Number(body.bidAmount) || Number(proposal.expected_expenditure) || 0,
           cumulative_expenditure: 0,
           physical_progress: 0
         }, session.email);
         updates.$set.agency = body.agency;
         updates.$set.expected_expenditure = body.bidAmount;
      }
    } else if (session.role === "ministry") {
`;

content = content.replace(
  /\} else if \(action === "award_bid"\) \{\s*newStatus = "approved"; \/\/ finalized\s*\} else if \(session\.role === "ministry"\) \{/g,
  awardLogic
);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed award_bid logic in proposals route");
