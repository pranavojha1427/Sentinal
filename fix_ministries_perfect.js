const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const pdf_data = require('./paimana_extracted_table6.json');

const ministries = [
    'Department for Promotion of Industry & Internal Trade',
    'Department of Higher Education',
    'Department of Sports',
    'Department of Telecommunications',
    'Department of Water Resources, River Development & GR',
    'Ministry of Chemicals and Fertilizers',
    'Ministry of Civil Aviation',
    'Ministry of Coal',
    'Ministry of Health & Family Welfare',
    'Ministry of Housing & Urban Affairs',
    'Ministry of Labour and Employment',
    'Ministry of Mines',
    'Ministry of New & Renewable Energy',
    'Ministry of Petroleum & Natural Gas',
    'Ministry of Ports, Shipping and Waterways',
    'Ministry of Power',
    'Ministry of Railways',
    'Ministry of Road Transport & Highways',
    'Ministry of Steel'
];

let mapped_pdf = [];
let current_ministry = 'Unknown';

for (const p of pdf_data) {
  let name = p.project_name || '';
  let agency = p.agency || '';
  
  for (const m of ministries) {
    if (name.startsWith(m) || agency.startsWith(m)) {
      current_ministry = m;
      break;
    }
  }
  
  if (current_ministry === 'Unknown' && (name.includes('Water Resources') || name.includes('Ganga'))) {
    current_ministry = 'Department of Water Resources, River Development & GR';
  }
  
  mapped_pdf.push({
    name: name,
    cost: p.original_cost || 0,
    ministry: current_ministry
  });
}

async function fixMinistries() {
  console.log("Fetching DB projects...");
  let all_data = [];
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from('projects').select('id, project_name, original_cost').range(i * 1000, (i + 1) * 1000 - 1);
    if (data && data.length > 0) all_data = all_data.concat(data);
    if (!data || data.length < 1000) break;
  }
  
  all_data = Array.from(new Map(all_data.map(p => [p.id, p])).values());

  const updates = [];
  const matched_ids = new Set();
  
  for (const db_p of all_data) {
    const db_c = db_p.original_cost || 0;
    const db_name = db_p.project_name || '';
    for (const pdf_p of mapped_pdf) {
      if (Math.abs(db_c - pdf_p.cost) < 0.1 && db_name.includes(pdf_p.name)) {
        updates.push({ id: db_p.id, ministry: pdf_p.ministry });
        matched_ids.add(db_p.id);
        break;
      }
    }
  }

  for (const db_p of all_data) {
    if (matched_ids.has(db_p.id)) continue;
    const db_c = db_p.original_cost || 0;
    for (const pdf_p of mapped_pdf) {
      if (Math.abs(db_c - pdf_p.cost) < 0.1) {
        updates.push({ id: db_p.id, ministry: pdf_p.ministry });
        matched_ids.add(db_p.id);
        break;
      }
    }
  }

  console.log(`Matched ${updates.length} out of ${all_data.length}`);

  const chunkSize = 50;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const promises = chunk.map(u => supabase.from('projects').update({ ministry: u.ministry }).eq('id', u.id));
    await Promise.all(promises);
    console.log(`Updated ${Math.min(i + chunkSize, updates.length)} / ${updates.length}`);
  }
}

fixMinistries();
