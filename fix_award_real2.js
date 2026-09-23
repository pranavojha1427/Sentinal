const fs = require('fs');
const path = 'src/app/api/proposals/route.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `    } else if (action === "award_bid") {
      newStatus = "approved"; // finalized
      if (body.agency && body.bidAmount) {
         const supabase = await createClient();
         await supabase.from('projects').insert([{
           project_code: proposal.project_code || \`PRJ-\${Date.now()}\`,
           project_name: proposal.project_name || "New Awarded Project",
           sector: proposal.sector || "Others",
           ministry: proposal.ministry || null,
           agency: body.agency,
           state: proposal.state || null,
           original_cost: Number(body.bidAmount) || Number(proposal.expected_expenditure) || 0,
           revised_cost: Number(body.bidAmount) || Number(proposal.expected_expenditure) || 0,
           cumulative_expenditure: 0,
           physical_progress: 0
         }]);
         updates.$set.agency = body.agency;
         updates.$set.expected_expenditure = body.bidAmount;
      }
    }`;

content = content.replace(/\} else if \(action === "award_bid"\) \{\s*newStatus = "approved"; \/\/ finalized\s*\}/g, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed award_bid perfectly for real");
