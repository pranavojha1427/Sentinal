const fs = require('fs');
const seed = require('./projects_seed.json');

const EXCLUDE = ["-", "Agency", "Project Code", "Legacy OCMS Code", "PMGID"];

function extractAgency(name) {
  // Find all parenthesized chunks
  const regex = /\((.*?)\)/g;
  let matches = [];
  let m;
  while ((m = regex.exec(name)) !== null) {
    matches.push(m[1].trim());
  }

  // Filter out obvious non-agencies
  const candidates = matches.filter(c => {
    if (EXCLUDE.includes(c)) return false;
    if (/^[Nn]?\d+$/.test(c)) return false; // N04000106 or 764
    if (/^\d+(\.\d+)?/.test(c)) return false; // 1.02 MTY
    return true;
  });

  if (candidates.length === 0) return "Unknown Agency";
  
  // If there's a candidate with known agency words, prefer it
  const agencyWords = ["Limited", "Authority", "Corporation", "Ltd", "Metro", "Rail", "Board", "Company", "Nigam", "NHAI", "NHIDCL", "Power", "Grid", "Sector"];
  for (let c of candidates) {
    if (agencyWords.some(w => c.toLowerCase().includes(w.toLowerCase()))) {
      return c;
    }
  }

  // If no clear match by keyword, usually the last parenthesized thing is the agency if it's long enough,
  // or the first one. Let's just return the last candidate, as it's often the agency appended at the end.
  return candidates[candidates.length - 1];
}

let extracted = {};
let unknownCount = 0;
for (let p of seed) {
  const agency = extractAgency(p.project_name);
  if (agency === "Unknown Agency") unknownCount++;
  extracted[agency] = (extracted[agency] || 0) + 1;
}

const sorted = Object.entries(extracted).sort((a,b) => b[1] - a[1]);
console.log(sorted.slice(0, 30));
console.log("Total unique agencies:", sorted.length);
console.log("Still Unknown:", unknownCount);
