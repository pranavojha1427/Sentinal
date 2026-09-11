const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const seed = require('./projects_seed.json');

async function restore() {
  console.log("Fetching all projects from DB...");
  let allDbProjects = [];
  for (let i = 0; i < 5; i++) {
    const { data } = await supabase.from('projects').select('id, project_code').range(i * 1000, (i + 1) * 1000 - 1);
    if (data && data.length > 0) {
      allDbProjects = allDbProjects.concat(data);
    }
    if (!data || data.length < 1000) break;
  }
  
  // Clean up duplicates if pagination overlap (range issue in simple loop)
  const uniqueDbProjects = Array.from(new Map(allDbProjects.map(p => [p.id, p])).values());
  console.log("Total DB projects:", uniqueDbProjects.length);

  const seedCodes = new Set(seed.map(s => s.project_code));
  
  const toDelete = uniqueDbProjects.filter(p => !seedCodes.has(p.project_code));
  console.log("Projects to delete:", toDelete.length);
  
  for (const p of toDelete) {
    // Delete alerts first
    await supabase.from('project_alerts').delete().eq('project_id', p.id);
    await supabase.from('projects').delete().eq('id', p.id);
    console.log("Deleted project", p.project_code);
  }

  // To update or insert, we can upsert by project_code if project_code is unique.
  // Wait, does Supabase allow upsert on project_code? We need project_code to be unique constraint.
  // We can just update individually, but it might take a while. Upsert is faster.
  console.log("Upserting seed data...");
  const chunkSize = 200;
  for (let i = 0; i < seed.length; i += chunkSize) {
    const chunk = seed.slice(i, i + chunkSize);
    // Upsert needs the unique column. If project_code is unique, we can specify onConflict: 'project_code'.
    // If not, we map the known IDs to the chunk.
    const chunkWithIds = chunk.map(s => {
      const dbP = uniqueDbProjects.find(dp => dp.project_code === s.project_code);
      if (dbP) {
        return { id: dbP.id, ...s };
      }
      return s;
    });

    const { error } = await supabase.from('projects').upsert(chunkWithIds, { onConflict: 'id' });
    if (error) {
      console.error("Error upserting chunk", i, error.message);
    } else {
      console.log(`Upserted ${i + chunk.length} / ${seed.length}`);
    }
  }

  console.log("Done!");
}

restore();
