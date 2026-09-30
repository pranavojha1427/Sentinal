import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { error } = await supabase
    .from('citizen_requests')
    .update({ infrastructure_category: 'Roads' })
    .eq('id', '1c1b52a7-fb99-488d-8eaa-7e357e55706e');
    
  if (error) console.error("Error updating complaint:", error);
  else console.log("Updated complaint to Roads");
}

run();
