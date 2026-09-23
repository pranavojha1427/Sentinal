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
    const { data: d3 } = await supabase.from('projects').select('id, project_code').range(2000, 2999);
    
    const existing = [...d1, ...d2, ...d3];
    const codeToId = new Map(existing.map(p => [p.project_code, p.id]));
    
    const jsonData = JSON.parse(fs.readFileSync('data.json', 'utf8'));
    
    const missing = jsonData.filter(item => !codeToId.has(item.project_code));
    console.log("Missing from Supabase:", missing.length);
    console.log(missing.map(m => m.project_code));
}
run();
