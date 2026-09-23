const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const { data } = await supabase.from('projects').select('original_cost, revised_cost, cumulative_expenditure');
    let o = 0, r = 0, e = 0;
    for (let p of data) {
        o += Number(p.original_cost) || 0;
        r += Number(p.revised_cost) || 0;
        e += Number(p.cumulative_expenditure) || 0;
    }
    console.log(Original: , Revised: , Expenditure: );
}
run();
