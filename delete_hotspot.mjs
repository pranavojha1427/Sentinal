import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  // First, unassign the coal mine complaint
  const { error: coalError } = await supabase
    .from('citizen_requests')
    .update({ hotspot_id: null })
    .eq('id', '9d8829eb-5d54-4eeb-a5fc-04be21c6a88d');
    
  if (coalError) console.error(coalError);

  // Now delete the hotspot
  const { error } = await supabase
    .from('demand_hotspots')
    .delete()
    .eq('id', '7c7a9d9e-418d-4dda-a558-7cd4ecfa3750');
    
  if (error) console.error("Error deleting hotspot:", error);
  else console.log("Deleted hotspot successfully.");
}

run();
