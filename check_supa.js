const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const { data } = await supabase.from('projects').select('id, project_code, project_name, original_cost, revised_cost').order('id', { ascending: false }).limit(10);
    console.log(data);
}
run();
