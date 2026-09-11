const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const seed = require('./projects_seed.json');
const paimana = require('./paimana_extracted_table6.json');

const EXCLUDE = ["-", "Agency", "Project Code", "Legacy OCMS Code", "PMGID"];

function extractAgency(name) {
  const regex = /\((.*?)\)/g;
  let matches = [];
  let m;
  while ((m = regex.exec(name)) !== null) {
    matches.push(m[1].trim());
  }
  const candidates = matches.filter(c => {
    if (EXCLUDE.includes(c)) return false;
    if (/^[Nn]?\d+$/.test(c)) return false;
    if (/^\d+(\.\d+)?/.test(c)) return false;
    return true;
  });
  if (candidates.length === 0) return "Unknown Agency";
  
  const agencyWords = ["Limited", "Authority", "Corporation", "Ltd", "Metro", "Rail", "Board", "Company", "Nigam", "NHAI", "NHIDCL", "Power", "Grid", "Sector"];
  for (let c of candidates) {
    if (agencyWords.some(w => c.toLowerCase().includes(w.toLowerCase()))) {
      return c;
    }
  }
  return candidates[candidates.length - 1];
}

const paimanaMap = new Map();
for (const p of paimana) {
  if (p.agency && p.agency !== "Unknown Agency") {
    paimanaMap.set(p.project_code, p.agency);
  }
}

async function fix() {
  console.log("Fetching DB projects...");
  let allDbProjects = [];
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from('projects').select('id, project_code, project_name').range(i * 1000, (i + 1) * 1000 - 1);
    if (data && data.length > 0) {
      allDbProjects = allDbProjects.concat(data);
    }
    if (!data || data.length < 1000) break;
  }
  
  const uniqueDbProjects = Array.from(new Map(allDbProjects.map(p => [p.id, p])).values());
  console.log("Projects to update:", uniqueDbProjects.length);

  const updates = [];
  for (const dbP of uniqueDbProjects) {
    let agency = paimanaMap.get(dbP.project_code);
    if (!agency) {
      agency = extractAgency(dbP.project_name);
    }
    updates.push({
      id: dbP.id,
      agency: agency
    });
  }

  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const promises = chunk.map(u => supabase.from('projects').update({ agency: u.agency }).eq('id', u.id));
    await Promise.all(promises);
    console.log(`Updated ${Math.min(i + chunkSize, updates.length)} / ${updates.length}`);
  }

  console.log("Done updating agencies!");
}

fix();
