const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const { data } = await supabase.from('projects').select('approval_date, start_date, original_doc, revised_doc, pmg_id').limit(1);
    console.log(data[0]);
}
run();
