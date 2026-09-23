const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
    const { data, count, error } = await supabase.from('projects').select('*', { count: 'exact', head: true });
    console.log('Supabase Projects Count:', count);
}
run();
