const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    console.log("Fetching existing projects...");
    const { data: d1 } = await supabase.from('projects').select('id, project_code').range(0, 999);
    const { data: d2 } = await supabase.from('projects').select('id, project_code').range(1000, 1999);
    const { data: d3 } = await supabase.from('projects').select('id, project_code').range(2000, 2999);
    
    const existing = [...d1, ...d2, ...d3];
    const codeToId = new Map(existing.map(p => [p.project_code, p.id]));
    
    const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    
    // Prepare upsert payload
    const payload = [];
    for (const item of jsonData) {
        const id = codeToId.get(item.project_code);
        if (id) {
            payload.push({
                id: id,
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
            });
        }
    }
    
    console.log("Upserting", payload.length, "projects...");
    
    for (let i = 0; i < payload.length; i += 500) {
        const batch = payload.slice(i, i + 500);
        const { error } = await supabase.from('projects').upsert(batch);
        if (error) {
            console.error("Error upserting batch starting at", i, error);
            return;
        }
        console.log("Upserted batch", i, "to", i + batch.length);
    }
    
    console.log("Successfully updated costs and progress for all projects to match data.json!");
}
run();
