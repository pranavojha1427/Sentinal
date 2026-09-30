import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  // Update the category of the 3 road-related complaints
  const roadIds = [
    "1d3d70f8-69c7-4d93-902e-e79ac4f95da8",
    "ecf0ce51-edae-408b-ac3b-aa764dc05cbe",
    "f0b1eef1-c262-4323-9a24-cf540bbb4e1a"
  ];
  
  for (const id of roadIds) {
    const { error } = await supabase
      .from('citizen_requests')
      .update({ 
        infrastructure_category: 'Roads',
        hotspot_id: null 
      })
      .eq('id', id);
      
    if (error) console.error("Error updating road complaint:", error);
  }

  // Update the coal mine complaint to Energy
  const { error: coalError } = await supabase
    .from('citizen_requests')
    .update({ infrastructure_category: 'Energy' })
    .eq('id', '9d8829eb-5d54-4eeb-a5fc-04be21c6a88d');
    
  if (coalError) console.error("Error updating coal complaint:", coalError);

  console.log("Database fixed!");
}

run();
