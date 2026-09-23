const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const { data: d1 } = await supabase.from('projects').select('original_cost, revised_cost, cumulative_expenditure').range(0, 999);
    const { data: d2 } = await supabase.from('projects').select('original_cost, revised_cost, cumulative_expenditure').range(1000, 1999);
    const { data: d3 } = await supabase.from('projects').select('original_cost, revised_cost, cumulative_expenditure').range(2000, 2999);
    
    const allData = [...d1, ...d2, ...d3];
    
    let o = 0, r = 0, e = 0;
    for (let p of allData) {
        o += Number(p.original_cost) || 0;
        r += Number(p.revised_cost) || Number(p.original_cost) || 0;
        e += Number(p.cumulative_expenditure) || 0;
    }
    console.log("Total rows fetched:", allData.length);
    console.log("Original: " + o + ", Revised: " + r + ", Expenditure: " + e);
}
run();
