const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const { data: d1 } = await supabase.from('projects').select('id, project_code').range(0, 999);
    const { data: d2 } = await supabase.from('projects').select('id, project_code').range(1000, 1999);
    
    const existing = [...d1, ...d2];
    
    const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    const jsonCodes = new Set(jsonData.map(j => j.project_code));
    
    const orphans = existing.filter(p => !jsonCodes.has(p.project_code));
    console.log("Orphans in Supabase:", orphans.length);
    console.log(orphans);
}
run();
