const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    console.log("Deleting SL_418 and SL_1925...");
    await supabase.from('projects').delete().in('project_code', ['SL_418', 'SL_1925']);
    
    const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    const missing = jsonData.filter(item => item.project_code === '701346' || item.project_code === '617413');
    
    const payload = missing.map(item => ({
        project_code: item.project_code,
        project_name: item.project_name,
        ministry: item.ministry,
        sector: item.sector,
        agency: item.agency,
        state: item.state,
        original_cost: Number(item.original_cost_rs_crore) || 0,
        revised_cost: Number(item.revised_cost_rs_crore) || Number(item.original_cost_rs_crore) || 0,
        cumulative_expenditure: Number(item.cumulative_expenditure_rs_crore) || 0,
        physical_progress: Number(item.physical_progress_percent) || 0,
        hml_category: 'Others',
        project_type: 'Major',
        is_north_east: false,
        status: 'Ongoing'
    }));
    
    console.log("Inserting missing projects...", missing.map(m => m.project_code));
    const { error } = await supabase.from('projects').insert(payload);
    if (error) {
        console.error("Error inserting:", error);
    } else {
        console.log("Successfully replaced orphans with correct missing projects!");
    }
}
run();
