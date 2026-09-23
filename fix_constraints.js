const fs = require('fs');
const path = 'src/app/api/proposals/route.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `         await supabase.from('projects').insert([{
           project_code: proposal.project_code || \`PRJ-\${Date.now()}\`,
           project_name: proposal.project_name || "New Awarded Project",
           sector: proposal.sector || "Others",
           ministry: proposal.ministry || null,
           agency: body.agency,
           state: proposal.state || null,`;

const replacement = `         await supabase.from('projects').insert([{
           project_code: proposal.project_code || \`PRJ-\${Date.now()}\`,
           project_name: proposal.project_name || "New Awarded Project",
           sector: proposal.sector || "Others",
           hml_category: proposal.sector || "Others",
           ministry: proposal.ministry || null,
           agency: body.agency,
           state: proposal.state || 'Unknown',`;

content = content.replace(target, replacement);

fs.writeFileSync(path, content, 'utf8');
console.log("Fixed route constraints");
